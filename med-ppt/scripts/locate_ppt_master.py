#!/usr/bin/env python3
"""定位 ppt-master 安装目录、版本与可用的 Python 解释器，输出 JSON。

只用标准库：它要在依赖还没装好的解释器上也能运行，才能报告问题。
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

TESTED_VERSION_PREFIX = "6.7."
MED_DIR = Path(__file__).resolve().parent.parent
HOME = Path.home()


def candidate_dirs() -> list[Path]:
    dirs = []
    env = os.environ.get("MED_PPT_MASTER_DIR")
    if env:
        dirs.append(Path(env).expanduser())
    dirs += [
        HOME / ".agents/skills/ppt-master",
        HOME / ".codex/skills/ppt-master",
        HOME / ".kimi-code/skills/ppt-master",
        HOME / ".workbuddy/skills/ppt-master",
        # med-ppt 被复制安装时，ppt-master 通常就在同级目录
        MED_DIR.parent / "ppt-master",
    ]
    return dirs


def read_version(skill_md: Path) -> str | None:
    match = re.search(r'^\s*version:\s*"?([\w.\-]+)"?', skill_md.read_text(encoding="utf-8"), re.M)
    return match.group(1) if match else None


def candidate_pythons() -> list[str]:
    pythons = []
    env = os.environ.get("MED_PPT_PYTHON")
    if env:
        pythons.append(str(Path(env).expanduser()))
    venv = HOME / ".agents/venvs/med-ppt/bin/python"
    if venv.exists():
        pythons.append(str(venv))
    pythons.append("python3")
    return pythons


def python_has_pptx(python: str) -> bool:
    try:
        result = subprocess.run([python, "-c", "import pptx"], capture_output=True, timeout=60)
    except (OSError, subprocess.TimeoutExpired):
        return False
    return result.returncode == 0


def env_file_keys(path: Path | None) -> set[str]:
    """返回 .env 中有非空值的变量名；只读名字，不输出也不保留值。"""
    if path is None or not path.is_file():
        return set()
    names = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        name, sep, value = line.strip().partition("=")
        if sep and not name.startswith("#") and value.strip().strip("'\""):
            names.add(name.strip().removeprefix("export ").strip())
    return names


def image_capabilities(pm_dir: Path | None, python: str | None) -> dict:
    """借 ppt-master 自己的 --list-backends 得到它实际会用的生图后端与配置文件，再检查对应 Key 是否存在。"""
    caps = {"image_backend": None, "image_backend_key_set": False, "pexels_key_set": False, "config_source": None}
    if pm_dir is None or python is None:
        return caps
    try:
        # 在 HOME 下运行，避免当前目录里无关的 .env 抢先被读到
        out = subprocess.run([python, str(pm_dir / "scripts/image_gen.py"), "--list-backends"], cwd=HOME,
                             capture_output=True, text=True, timeout=60).stdout
    except (OSError, subprocess.TimeoutExpired):
        return caps
    backend = re.search(r"^Resolved backend:\s*(\S+)", out, re.M)
    source = re.search(r"^Configuration source:\s*(.+)$", out, re.M)
    source_path = Path(source.group(1).strip()) if source and "/" in source.group(1) else None
    present = env_file_keys(source_path) | {k for k, v in os.environ.items() if v.strip()}
    caps["config_source"] = str(source_path) if source_path else None
    caps["pexels_key_set"] = "PEXELS_API_KEY" in present
    # 未配置时这一行是"not configured"之类的说明，只有出现在后端列表里的名字才算
    row = backend and re.search(rf"^\s+{re.escape(backend.group(1))}\s.*keys=(.+)$", out, re.M)
    if row:
        caps["image_backend"] = backend.group(1)
        caps["image_backend_key_set"] = any(k.strip() in present for k in row.group(1).split("/"))
    return caps


def main() -> int:
    problems = []

    pm_dir = next((d.resolve() for d in candidate_dirs() if (d / "SKILL.md").is_file()), None)
    version = None
    if pm_dir is None:
        problems.append("未找到 ppt-master。请运行 med-ppt 仓库里的 ./install.sh，或设置 MED_PPT_MASTER_DIR。")
    else:
        version = read_version(pm_dir / "SKILL.md")
        if not (pm_dir / "scripts/svg_to_pptx.py").is_file():
            problems.append(f"{pm_dir} 不是完整的 ppt-master skill 目录（缺少 scripts/svg_to_pptx.py）。")

    python = next((p for p in candidate_pythons() if python_has_pptx(p)), None)
    if python is None:
        problems.append("没有找到装好 ppt-master 依赖（python-pptx 等）的 Python。请运行 ./install.sh。")

    print(json.dumps({
        "ok": not problems,
        "med_dir": str(MED_DIR),
        "ppt_master_dir": str(pm_dir) if pm_dir else None,
        "version": version,
        "version_tested": bool(version and version.startswith(TESTED_VERSION_PREFIX)),
        "python": python,
        **image_capabilities(pm_dir, python),
        "problems": problems,
    }, ensure_ascii=False, indent=2))
    return 0 if not problems else 1


if __name__ == "__main__":
    sys.exit(main())
