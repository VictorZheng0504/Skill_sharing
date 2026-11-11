#!/usr/bin/env python3
"""用 LibreOffice 将最终 PPTX 渲染为 PDF 和逐页 PNG，供导出后视觉检查。"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def find_soffice() -> str | None:
    for name in ("soffice", "libreoffice"):
        path = shutil.which(name)
        if path:
            return path
    mac = Path("/Applications/LibreOffice.app/Contents/MacOS/soffice")
    return str(mac) if mac.is_file() else None


def load_pdf_module():
    try:
        import pymupdf
        return pymupdf
    except ImportError:
        try:
            import fitz
            return fitz
        except ImportError as exc:
            raise RuntimeError("缺少 PyMuPDF，无法将 PDF 逐页渲染为 PNG") from exc


def render(pptx: Path, outdir: Path, dpi: int = 160) -> tuple[Path, list[Path]]:
    soffice = find_soffice()
    if not soffice:
        raise RuntimeError("未找到 LibreOffice/soffice")
    outdir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="med-ppt-render-") as raw_tmp:
        tmp = Path(raw_tmp)
        profile = (tmp / "profile").resolve().as_uri()
        proc = subprocess.run(
            [
                soffice,
                "--headless",
                f"-env:UserInstallation={profile}",
                "--convert-to",
                "pdf",
                "--outdir",
                str(tmp),
                str(pptx.resolve()),
            ],
            capture_output=True,
            text=True,
            timeout=120,
        )
        pdf_source = tmp / f"{pptx.stem}.pdf"
        if proc.returncode != 0 or not pdf_source.is_file():
            detail = (proc.stderr or proc.stdout or "LibreOffice 未生成 PDF").strip()
            raise RuntimeError(detail[-1200:])
        pdf_path = outdir / pdf_source.name
        shutil.copy2(pdf_source, pdf_path)

    pdf = load_pdf_module().open(pdf_path)
    scale = dpi / 72
    pages = []
    for index, page in enumerate(pdf, 1):
        pix = page.get_pixmap(matrix=load_pdf_module().Matrix(scale, scale), alpha=False)
        target = outdir / f"slide-{index:03d}.png"
        pix.save(target)
        pages.append(target)
    pdf.close()
    return pdf_path, pages


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("pptx", type=Path)
    ap.add_argument("--outdir", type=Path, required=True)
    ap.add_argument("--dpi", type=int, default=160)
    args = ap.parse_args(argv)
    if not args.pptx.is_file():
        print(f"找不到文件：{args.pptx}", file=sys.stderr)
        return 2
    try:
        pdf, pages = render(args.pptx, args.outdir, args.dpi)
    except (RuntimeError, subprocess.TimeoutExpired) as exc:
        print(f"[错误] 渲染失败：{exc}", file=sys.stderr)
        return 2
    print(f"[完成] {pdf}")
    print(f"[完成] {len(pages)} 张 PNG：{args.outdir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
