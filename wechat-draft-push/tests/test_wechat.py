"""不联网的单元测试：python3 -m unittest discover -s tests"""
import os
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TMP = tempfile.mkdtemp()
os.environ["WECHAT_PUSH_HOME"] = TMP  # 不碰真实配置
sys.path.insert(0, str(ROOT / "scripts"))
import wechat  # noqa: E402


class ParseArticle(unittest.TestCase):
    def write(self, text):
        p = Path(tempfile.mkdtemp()) / "a.md"
        p.write_text(text, encoding="utf-8")
        return p

    def test_front_matter(self):
        meta, body = wechat.parse_article(self.write("---\ntitle: 标题\ndigest：摘要\n---\n正文\n"))
        self.assertEqual(meta, {"title": "标题", "digest": "摘要"})
        self.assertEqual(body, "正文\n")

    def test_h1_as_title_removed_from_body(self):
        meta, body = wechat.parse_article(self.write("# 我的标题\n\n正文\n"))
        self.assertEqual(meta["title"], "我的标题")
        self.assertNotIn("我的标题", body)

    def test_divider_at_top_is_not_front_matter(self):
        meta, body = wechat.parse_article(self.write("---\n段落一\n\n段落二\n---\n结尾\n"))
        self.assertEqual(meta, {})

    def test_markdown_image_converted(self):
        _, body = wechat.parse_article(self.write("---\ntitle: t\n---\n![流程图](images/a.png)\n"))
        self.assertEqual(body.strip(), "[图片：images/a.png|流程图]")


class Errors(unittest.TestCase):
    def test_whitelist_error_extracts_ip(self):
        e = wechat.WeChatError("取 token", 61004, "access clientip is not registered, hint: [x] rid: y, "
                               "invalid ip 203.0.113.7 ipv6 ::ffff:203.0.113.7")
        self.assertEqual(e.ip, "203.0.113.7")
        self.assertIn("203.0.113.7", str(e))


class TemplateB(unittest.TestCase):
    def test_example_renders(self):
        meta, body = wechat.parse_article(ROOT / "examples" / "示例文章.md")
        html = wechat.compile_html(meta, body, {}, "b")
        self.assertIn(">01<", html)
        self.assertIn("linear-gradient", html)       # 荧光笔金句
        self.assertIn("请在此处上传", html)            # 图片占位
        self.assertNotIn(">>", html.replace("&gt;", ""))
        self.assertEqual(wechat.self_check(html), [])
        self.assertNotIn("当AI撞向医学", html)          # 不带原账号的名片和署名

    def test_rejects_h3(self):
        tpl = wechat.load_template("b")
        with self.assertRaises(tpl.TemplateError):
            tpl.render("### 三级标题\n", [])

    def test_footer_only_when_configured(self):
        tpl = wechat.load_template("b")
        self.assertNotIn("1876EC", tpl.render("正文\n", []))
        self.assertIn("出品 · 某号", tpl.render("正文\n", ["文字 · 张三", "出品 · 某号"]))


if __name__ == "__main__":
    unittest.main()
