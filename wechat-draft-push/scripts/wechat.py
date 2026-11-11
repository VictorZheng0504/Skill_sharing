#!/usr/bin/env python3
"""公众号文章：排版 → 进草稿箱。只用 Python 标准库，只建 / 更新草稿，不发布。

    python3 wechat.py setup                       # 第一次用：生成配置文件，自己填 AppID / AppSecret
    python3 wechat.py ip                          # 查微信看到的本机 IP，告诉你去哪里加白名单
    python3 wechat.py preview 文章.md             # 排版并在浏览器里预览
    python3 wechat.py push 文章.md [--dry-run]    # 排版并推进草稿箱（再推会更新同一篇草稿）
    python3 wechat.py templates                   # 列出可用模板
"""
from __future__ import annotations

import argparse
import hashlib
import html as htmllib
import importlib.util
import json
import os
import re
import shutil
import ssl
import struct
import subprocess
import sys
import urllib.request
import uuid
import webbrowser
import zlib
from pathlib import Path

try:  # Windows 控制台默认 GBK，打印 emoji 会崩
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except (AttributeError, ValueError):
    pass

HERE = Path(__file__).resolve().parent
TEMPLATE_DIR = HERE / "templates"
# 配置放用户目录而不是 Skill 目录：Skill 目录可能被复制、分享或同步，密钥不能跟着走；
# Claude Code、Codex、WorkBuddy 装的是各自的 Skill 副本，放这里也只用填一次
HOME = Path(os.environ.get("WECHAT_PUSH_HOME") or Path.home() / ".wechat-draft-push")
ENV_FILE = HOME / ".env"
LAST_IP = HOME / "last_ip.txt"
API = "https://api.weixin.qq.com"
CONSOLE = "https://developers.weixin.qq.com/console"

ENV_TEMPLATE = """\
# 公众号开发密钥。在微信开发者平台登录后：我的业务与服务 → 公众号 → 基础信息 → 开发密钥
# 这个文件只留在你自己的电脑上：不要发给别人，不要贴进 AI 对话，不要传到网盘或 GitHub
WECHAT_APPID=
WECHAT_APPSECRET=

# 以下选填
# 草稿署名，最多 16 个字
AUTHOR=
# 文末信息卡，用 / 分行，例如：文字 · 张三 / 出品 · 某某公众号
FOOTER=
# 默认模板，填 templates 目录里的文件名（不带 .py）
TEMPLATE=b
"""

WHITELIST_GUIDE = f"""\
把这个 IP 加进白名单：
  1. 电脑浏览器打开 {CONSOLE} ，用公众号管理员的微信扫码登录
  2. 顶部「我的业务与服务」→ 公众号 → 选中你的公众号
  3. 「基础信息」页往下找到「开发密钥」，点「API IP白名单」右边的「编辑」
  4. 把上面的 IP 粘进去（已有的 IP 不要删，一行一个），点确认后用公众号管理员的微信扫码，才算保存
  5. 回来再跑一次：python3 wechat.py ip ，看到「通过」就可以推送了"""

ERR_HINTS = {
    40013: "AppID 不对，检查配置文件里的 WECHAT_APPID",
    40125: "AppSecret 不对，检查配置文件里的 WECHAT_APPSECRET（是不是在后台重置过）",
    40001: "AppSecret 或 token 无效",
    40243: "AppSecret 被冻结了，去开发者平台「开发密钥」里解冻",
    48001: "这个公众号没有该接口的权限",
    40005: "图片格式不支持",
    40009: "图片太大",
    40007: "草稿或素材不存在（可能在后台被删了）",
    45009: "接口今天的调用次数用完了，明天再试",
    45002: "正文太长，超过 1MB",
}
NOT_WHITELISTED = (40164, 61004)
IPV4_RE = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
# 国内能直连、只返回 IP 的服务；只作参考，最准的是微信接口报错里带的 IP
IP_SERVICES = ("https://4.ipw.cn", "https://myip.ipip.net", "https://ipv4.icanhazip.com")

LIMITS = {"title": 32, "author": 16, "digest": 120}
CONTENT_LIMIT = 1_000_000  # 草稿正文上限 1MB（实测超出报 45002）
BODY_IMG = ({".jpg", ".jpeg", ".png"}, 1_000_000)  # 正文图：jpg/png，1MB 以内
COVER_IMG = ({".jpg", ".jpeg", ".png", ".gif", ".bmp"}, 10_000_000)  # 封面：10MB 以内
MIME = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".bmp": "image/bmp"}


class WeChatError(Exception):
    def __init__(self, step: str, code: int, msg: str):
        self.code, self.errmsg = code, msg
        m = IPV4_RE.search(msg)
        self.ip = m.group(0) if m else None
        hint = (f"本机出口 IP {self.ip or '（没解析到）'} 不在白名单" if code in NOT_WHITELISTED
                else ERR_HINTS.get(code, "查微信官方错误码文档"))
        super().__init__(f"{step}失败：errcode={code}，{hint}")


# ---------------------------------------------------------------- 网络

def _ssl_context() -> ssl.SSLContext:
    ctx = ssl.create_default_context()
    # python.org 的 Mac 安装包默认不带根证书，退回系统自带的
    if not ctx.cert_store_stats()["x509_ca"] and Path("/etc/ssl/cert.pem").exists():
        ctx.load_verify_locations("/etc/ssl/cert.pem")
    return ctx


# 白名单认的是本机直连的出口 IP，所以不读环境变量里的转发设置；其他网络软件改变出口的情况，靠 ip 命令对比提醒
OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}),
                                     urllib.request.HTTPSHandler(context=_ssl_context()))


def call(step: str, path: str, token: str | None = None, payload: dict | None = None,
         image: bytes | None = None, filename: str = "image.png", query: str = "") -> dict:
    url = f"{API}{path}?" + (f"access_token={token}" if token else "") + query
    if image is not None:
        boundary = uuid.uuid4().hex
        mime = MIME.get(Path(filename).suffix.lower(), "application/octet-stream")
        body = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"media\"; filename=\"{filename}\"\r\n"
                f"Content-Type: {mime}\r\n\r\n").encode() + image + f"\r\n--{boundary}--\r\n".encode()
        headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    else:
        # ensure_ascii=False：发 \uXXXX 转义的话，微信会把转义串原样存进标题和正文
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers = {"Content-Type": "application/json; charset=utf-8"}
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with OPENER.open(req, timeout=60) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    if data.get("errcode", 0):
        raise WeChatError(step, data["errcode"], data.get("errmsg", ""))
    return data


def get_token(env: dict) -> str:
    # 稳定版接口：普通版每取一次会让旧 token 失效，把同时接入这个公众号的其他工具挤掉线
    return call("取 token", "/cgi-bin/stable_token", payload={
        "grant_type": "client_credential", "appid": env["WECHAT_APPID"], "secret": env["WECHAT_APPSECRET"],
    })["access_token"]


def public_ip() -> str | None:
    for url in IP_SERVICES:
        try:
            with OPENER.open(urllib.request.Request(url, headers={"User-Agent": "curl/8"}), timeout=8) as resp:
                m = IPV4_RE.search(resp.read().decode("utf-8", "replace"))
                if m:
                    return m.group(0)
        except OSError:
            continue
    return None


# ---------------------------------------------------------------- 配置

def read_env() -> dict:
    env = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8-sig").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def require_env() -> dict:
    env = read_env()
    missing = [k for k in ("WECHAT_APPID", "WECHAT_APPSECRET") if not env.get(k)]
    if missing:
        sys.exit(f"[停止] 配置文件 {ENV_FILE} 里 {'、'.join(missing)} 还没填。"
                 "先跑 python3 wechat.py setup，自己打开文件填好（不要贴进对话）")
    return env


def open_file(path: Path) -> None:
    try:
        if sys.platform == "darwin":
            subprocess.run(["open", "-e", str(path)], check=False)
        elif os.name == "nt":
            subprocess.Popen(["notepad", str(path)])
    except OSError:
        pass


def cmd_setup(args) -> None:
    HOME.mkdir(parents=True, exist_ok=True)
    if not ENV_FILE.exists():
        ENV_FILE.write_text(ENV_TEMPLATE, encoding="utf-8")
        try:
            os.chmod(ENV_FILE, 0o600)
        except OSError:
            pass
        print(f"已生成配置文件：{ENV_FILE}")
    else:
        print(f"配置文件已存在：{ENV_FILE}（不覆盖）")
    env = read_env()
    for key in ("WECHAT_APPID", "WECHAT_APPSECRET"):
        print(f"  {key}：{'已填' if env.get(key) else '未填'}")
    if not (env.get("WECHAT_APPID") and env.get("WECHAT_APPSECRET")):
        print("请你自己打开这个文件，把 AppID 和 AppSecret 填在等号后面，保存。不要把它们发给 AI。")
        print(f"它们在：{CONSOLE} → 我的业务与服务 → 公众号 → 基础信息 → 开发密钥")
        print("AppSecret 平台只显示一次；忘了只能点「重置」，重置后旧的立刻失效，用旧密钥的其他工具要一起改。")
        if not args.no_open:
            open_file(ENV_FILE)


# ---------------------------------------------------------------- IP

def cmd_ip(args) -> None:
    env = read_env()
    ref = public_ip()
    if not (env.get("WECHAT_APPID") and env.get("WECHAT_APPSECRET")):
        print(f"还没填 AppID / AppSecret，只能查个参考 IP：{ref or '没查到（检查网络）'}")
        print("这个参考 IP 不一定和微信看到的一样。填好配置后再跑一次，结果才准。")
        sys.exit(1)
    try:
        get_token(env)
    except WeChatError as e:
        if e.code not in NOT_WHITELISTED:
            sys.exit(f"[失败] {e}")
        ip = e.ip or ref
        last = LAST_IP.read_text().strip() if LAST_IP.exists() else ""
        print(f"[需要加白名单] 微信看到的本机 IP 是：{ip}")
        if last and last != ip:
            print(f"  上次能用的 IP 是 {last}，现在变了：家里宽带重新拨号、换了网络都会变")
        if ref and ip and ref != ip:
            print(f"  注意：查 IP 网站看到的是 {ref}，和微信看到的不同。以微信看到的为准，"
                  "以后推送时的网络环境要和现在一致")
        print(WHITELIST_GUIDE)
        sys.exit(2)
    except OSError as e:
        sys.exit(f"[失败] 连不上微信接口：{e}")
    HOME.mkdir(parents=True, exist_ok=True)
    if ref:
        LAST_IP.write_text(ref + "\n")
    print(f"[通过] AppID / AppSecret 正确，本机当前出口 IP（{ref or '未查到'}）已在白名单里，可以推送")


# ---------------------------------------------------------------- 文章

MD_IMG_RE = re.compile(r"^!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+\"[^\"]*\")?\s*\)\s*$", re.M)
IMG_RE = re.compile(r"^\[图片[：:]\s*(\S+?)\s*\|\s*(.+?)\]\s*$", re.M)
HOLD_RE = re.compile(r"^\[图片占位[：:]", re.M)
H1_RE = re.compile(r"^#\s+(.+?)\s*$", re.M)


def parse_article(md_path: Path) -> tuple[dict, str]:
    """开头可以有 --- 包着的信息区（title / author / digest / cover / footer / source_url / open_comment）。"""
    text = md_path.read_text(encoding="utf-8-sig").replace("\r\n", "\n")
    meta = {}
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if m and all(":" in l or "：" in l or not l.strip() for l in m.group(1).splitlines()):
        for line in m.group(1).splitlines():
            if line.strip() and not line.lstrip().startswith("#"):
                k, v = re.split(r"[:：]", line, 1)
                meta[k.strip()] = v.strip().strip('"').strip("'")
        text = text[m.end():]
    # 标准 markdown 图片 ![描述](路径) 统一转成模板语法 [图片：路径|描述]
    text = MD_IMG_RE.sub(lambda g: f"[图片：{g.group(2)}|{g.group(1) or '图片'}]", text)
    if not meta.get("title"):
        h = H1_RE.search(text)
        if h:  # 没写 title 就拿第一个 # 标题当文章标题，并从正文里拿掉，免得和公众号自带标题重复
            meta["title"] = h.group(1).strip()
            text = text[:h.start()] + text[h.end():]
    return meta, text.lstrip("\n")


def load_template(name: str):
    path = TEMPLATE_DIR / f"{name.lower()}.py"
    if not path.exists():
        names = ", ".join(p.stem for p in sorted(TEMPLATE_DIR.glob("*.py")) if not p.stem.startswith("_"))
        sys.exit(f"[停止] 没有模板 {name}，可用的有：{names}")
    spec = importlib.util.spec_from_file_location(f"wechat_tpl_{path.stem}", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def compile_html(meta: dict, body: str, env: dict, template: str) -> str:
    tpl = load_template(template)
    footer = meta.get("footer", env.get("FOOTER", ""))
    lines = [p.strip() for p in footer.split("/") if p.strip()]
    try:
        html = tpl.render(body, lines)
    except Exception as e:  # 模板可能是用户自己加的，报错统一转成可读的停止信息
        sys.exit(f"[停止] 模板 {template} 排版失败：{e}")
    return html


def self_check(html: str) -> list[str]:
    issues = []
    big = sorted({int(n) for n in re.findall(r"font-size:\s*(\d+)px", html) if int(n) > 16})
    if big:
        issues.append(f"有大于 16px 的字号 {big}，手机上会显得突兀")
    if "<style" in html or "<script" in html:
        issues.append("有 <style> 或 <script>，微信会整段删掉，样式要写成内联 style")
    if "&gt;&gt;" in html or re.search(r">\s*>>", html):
        issues.append("有没被识别的 >> 金句")
    return issues


def wrap_page(fragment: str, title: str) -> str:
    # 预览页放在 .wechat/ 里，base 指回文章所在目录，md 里的相对图片路径才能显示
    return (f"<!doctype html><html lang=\"zh-CN\"><head><meta charset=\"utf-8\"><base href=\"../\">"
            f"<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>{htmllib.escape(title)}</title>"
            f"<style>body{{margin:0;background:#f2f3f5}}main{{max-width:390px;margin:16px auto;padding:20px 16px;"
            f"background:#fff;border-radius:12px}}img{{max-width:100%;height:auto}}"
            f"h1{{font-size:20px;margin:0 0 16px;font-family:-apple-system,sans-serif}}</style></head>"
            f"<body><main><h1>{htmllib.escape(title)}</h1>{fragment}</main></body></html>")


def work_dir(md_path: Path) -> Path:
    d = md_path.parent / ".wechat"
    d.mkdir(exist_ok=True)
    return d


def cmd_preview(args) -> None:
    md_path = args.article.resolve()
    meta, body = parse_article(md_path)
    env = read_env()
    template = args.template or meta.get("template") or env.get("TEMPLATE") or "b"
    html = compile_html(meta, body, env, template)
    page = work_dir(md_path) / f"{md_path.stem}.preview.html"
    page.write_text(wrap_page(html, meta.get("title", md_path.stem)), encoding="utf-8")
    issues = self_check(html)
    print(f"标题：{meta.get('title') or '（没找到，推送前在信息区写 title）'} · 模板 {template}")
    print("自检：" + ("；".join(issues) if issues else "通过"))
    holds = len(HOLD_RE.findall(body))
    if holds:
        print(f"还有 {holds} 处图片占位，推送后要在公众号后台手动补图")
    print(f"预览：{page}")
    if not args.no_open:
        webbrowser.open(page.as_uri())


# ---------------------------------------------------------------- 推送

def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def fit_image(src: Path, rule: tuple, work: Path) -> Path:
    """格式或大小不合要求时，在 Mac 上用系统自带的 sips 转 JPG 并逐级缩小；别的系统请手动压缩。"""
    exts, limit = rule
    if src.suffix.lower() in exts and src.stat().st_size <= limit:
        return src
    if not shutil.which("sips"):
        sys.exit(f"[停止] {src.name} 要是 {'/'.join(sorted(exts))} 格式、小于 {limit // 1_000_000}MB，"
                 "请先压缩（比如用微信截图另存、或在线压缩工具），再推送")
    out = work / f"{src.stem}.{sha256(src)[:8]}.jpg"
    for edge, quality in ((2000, 85), (1600, 75), (1200, 65), (900, 55)):
        subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", str(quality),
                        "-Z", str(edge), str(src), "--out", str(out)], check=True, capture_output=True)
        if out.stat().st_size <= limit:
            return out
    sys.exit(f"[停止] {src.name} 缩到 900px 还是太大，请手动处理")


def png(width: int, height: int, bg: tuple, band: tuple) -> bytes:
    """没给封面时用的纯色兜底封面，免得依赖 Pillow。草稿接口必须有封面。"""
    rows = [b"\x00" + bytes(band if height * 0.45 < y < height * 0.55 else bg) * width for y in range(height)]

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data))

    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(b"".join(rows), 9)) + chunk(b"IEND", b""))


def draft_exists(token: str, media_id: str) -> bool:
    try:
        call("查询草稿", "/cgi-bin/draft/get", token, payload={"media_id": media_id})
        return True
    except WeChatError as e:
        if e.code == 40007:
            return False
        raise


def cmd_push(args) -> None:
    md_path = args.article.resolve()
    base = md_path.parent
    meta, body = parse_article(md_path)
    env = read_env() if args.dry_run else require_env()
    template = args.template or meta.get("template") or env.get("TEMPLATE") or "b"
    meta.setdefault("author", env.get("AUTHOR", ""))

    problems = [] if meta.get("title") else ["没有标题：在文章开头的信息区写 title，或者第一行写 # 标题"]
    for key, limit in LIMITS.items():
        if len(meta.get(key, "")) > limit:
            problems.append(f"{key} 有 {len(meta[key])} 字，超过 {limit} 字上限")
    images = []
    for m in IMG_RE.finditer(body):
        p = m.group(1)
        if not re.match(r"https?://", p) and p not in images:
            images.append(p)
    missing = [p for p in images if not (base / p).is_file()]
    if missing:
        problems.append("找不到图片：" + "、".join(missing))
    cover = base / meta["cover"] if meta.get("cover") else (base / images[0] if images else None)
    if cover and not cover.is_file():
        problems.append(f"找不到封面：{meta.get('cover')}")
    if problems:
        sys.exit("[停止] " + "；".join(problems))

    work = work_dir(md_path)
    state_file = work / f"{md_path.stem}.state.json"
    state = json.loads(state_file.read_text(encoding="utf-8")) if state_file.exists() else {}
    state.setdefault("images", {})
    state.setdefault("covers", {})
    update = bool(state.get("draft_media_id")) and not args.new

    html = compile_html(meta, body, env, template)
    holds = len(HOLD_RE.findall(body))
    print(f"标题「{meta['title']}」· 模板 {template} · 本地图片 {len(images)} 张 · "
          f"封面：{cover.name if cover else '没有，用纯色兜底封面（可在后台换）'}"
          + (f" · 还有 {holds} 处图片占位要在后台补" if holds else ""))
    issues = self_check(html)
    if issues:
        print("自检提醒：" + "；".join(issues))
    if args.dry_run:
        print(f"[dry-run] 排版通过，将{'更新上次那篇草稿' if update else '新建一篇草稿'}，没有调用微信接口")
        return

    try:
        token = get_token(env)
    except WeChatError as e:
        if e.code in NOT_WHITELISTED:
            print(f"[停止] 微信看到的本机 IP 是 {e.ip}，不在白名单里。")
            print(WHITELIST_GUIDE)
            sys.exit(2)
        raise

    def save():
        state_file.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    urls = {}
    for rel in images:
        src = base / rel
        key = sha256(src)
        if key not in state["images"]:  # 上传过的同一张图不重复传
            fitted = fit_image(src, BODY_IMG, work)
            state["images"][key] = call(f"上传图片 {rel}", "/cgi-bin/media/uploadimg", token,
                                        image=fitted.read_bytes(), filename=fitted.name)["url"]
            save()
            print(f"  已上传 {rel}")
        urls[rel] = state["images"][key]
    body = IMG_RE.sub(lambda m: f"[图片：{urls.get(m.group(1), m.group(1))}|{m.group(2)}]", body)
    html = compile_html(meta, body, env, template)
    if len(html.encode("utf-8")) > CONTENT_LIMIT:
        sys.exit("[停止] 正文 HTML 超过 1MB，删减内容或拆成两篇")

    def upload_cover() -> str:
        if cover:
            fitted = fit_image(cover, COVER_IMG, work)
            data, name, key = fitted.read_bytes(), fitted.name, sha256(cover)
        else:
            data, name, key = png(900, 383, (15, 75, 235), (255, 255, 255)), "cover.png", "default"
        if key not in state["covers"]:
            state["covers"][key] = call("上传封面", "/cgi-bin/material/add_material", token,
                                        image=data, filename=name, query="&type=image")["media_id"]
            save()
        return state["covers"][key]

    article = {
        "title": meta["title"], "author": meta.get("author", ""), "digest": meta.get("digest", ""),
        "content": html, "content_source_url": meta.get("source_url", ""),
        "need_open_comment": int(str(meta.get("open_comment", "")).lower() in ("1", "true", "yes", "是")),
        "only_fans_can_comment": 0,
    }
    if update and not draft_exists(token, state["draft_media_id"]):
        print("  上次那篇草稿已经不在草稿箱了（可能被删），改为新建")
        update = False
    article["thumb_media_id"] = upload_cover()
    if update:
        call("更新草稿", "/cgi-bin/draft/update", token,
             payload={"media_id": state["draft_media_id"], "index": 0, "articles": article})
    else:
        state["draft_media_id"] = call("新建草稿", "/cgi-bin/draft/add", token,
                                       payload={"articles": [article]})["media_id"]
    state["title"] = meta["title"]
    save()
    print(f"[完成] 已{'更新' if update else '新建'}草稿「{meta['title']}」。"
          "去电脑后台或「公众号助手」App → 草稿箱，检查后自己点发表")


def cmd_templates(args) -> None:
    for p in sorted(TEMPLATE_DIR.glob("*.py")):
        if not p.stem.startswith("_"):
            print(f"{p.stem}：{getattr(load_template(p.stem), 'NAME', '')}")


def main() -> None:
    ap = argparse.ArgumentParser(description="公众号文章排版并推进草稿箱（不发布）")
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("setup", help="生成配置文件")
    s.add_argument("--no-open", action="store_true", help="不自动打开配置文件")
    s.set_defaults(func=cmd_setup)
    sub.add_parser("ip", help="查微信看到的本机 IP，检查白名单").set_defaults(func=cmd_ip)
    for name, func, text in (("preview", cmd_preview, "排版并预览"), ("push", cmd_push, "排版并推进草稿箱")):
        s = sub.add_parser(name, help=text)
        s.add_argument("article", type=Path, help="文章 .md 文件")
        s.add_argument("--template", help="模板名，默认 b")
        if name == "preview":
            s.add_argument("--no-open", action="store_true", help="不自动打开浏览器")
        else:
            s.add_argument("--dry-run", action="store_true", help="只检查和排版，不调微信接口")
            s.add_argument("--new", action="store_true", help="另建一篇新草稿，不更新上次那篇")
        s.set_defaults(func=func)
    sub.add_parser("templates", help="列出可用模板").set_defaults(func=cmd_templates)
    args = ap.parse_args()
    try:
        args.func(args)
    except WeChatError as e:
        sys.exit(f"[失败] {e}")
    except OSError as e:
        sys.exit(f"[失败] 网络或文件出错：{e}")


if __name__ == "__main__":
    main()
