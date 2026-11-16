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



class AllTemplates(unittest.TestCase):
    """新增的 c~j 模板和「模板+配色」组合。"""

    def setUp(self):
        self.meta, self.body = wechat.parse_article(ROOT / "examples" / "示例文章.md")

    def test_every_template_renders_and_passes_self_check(self):
        names = wechat.template_names()
        self.assertGreaterEqual(len(names), 14)
        for name in names:
            with self.subTest(template=name):
                html = wechat.compile_html(self.meta, self.body, {"FOOTER": "文字 · 张三 / 出品 · 某号"}, name)
                self.assertEqual(wechat.self_check(html), [])
                self.assertIn("它会变成什么样", html)  # 章节标题在
                self.assertNotIn("一、", html)        # 中文序号被换成了各模板自己的编号
                self.assertIn("出品 · 某号", html)
                self.assertIn("请在此处上传", html)

    def test_every_template_rejects_table(self):
        for name in wechat.template_names():
            tpl = wechat.load_template(name)
            with self.subTest(template=name), self.assertRaises(tpl.TemplateError):
                tpl.render("| a | b |\n", [])

    def test_recolor_combo(self):
        red = wechat.compile_html(self.meta, self.body, {}, "e")
        blue = wechat.compile_html(self.meta, self.body, {}, "e+blue")
        self.assertIn("#b8322a", red)
        self.assertNotIn("#b8322a", blue)
        self.assertIn("rgb(15, 75, 235)", blue)
        self.assertEqual(blue, wechat.compile_html(self.meta, self.body, {}, "e+蓝"))  # 中文配色名也行
        self.assertIn("蓝", wechat.load_template("e+blue").NAME)

    def test_b_with_other_color_keeps_layout(self):
        html = wechat.compile_html(self.meta, self.body, {}, "b+green")
        self.assertIn(">01<", html)
        self.assertIn("#108c5a", html)

    def test_bad_palette_or_template_stops(self):
        with self.assertRaises(SystemExit) as cm:
            wechat.load_template("e+不存在")
        self.assertIn("可用的有", str(cm.exception.code))
        with self.assertRaises(SystemExit):
            wechat.load_template("zz")
        with self.assertRaises(SystemExit):
            wechat.load_template("_engine")  # 引擎不是模板

    def test_tags_balanced(self):
        # k～o 有整页外框、每章卡片，开闭标签要配对，不然微信里后面的内容会被吞进卡片
        for name in wechat.template_names():
            for foot in ("", "文字 · 张三"):
                html = wechat.compile_html(self.meta, self.body, {"FOOTER": foot}, name)
                for tag in ("section", "p", "span", "strong"):
                    with self.subTest(template=name, tag=tag, footer=bool(foot)):
                        self.assertEqual(html.count(f"<{tag}"), html.count(f"</{tag}>"))

    def test_new_five_differ_from_b(self):
        for name in "klmno":
            html = wechat.compile_html(self.meta, self.body, {}, name)
            with self.subTest(template=name):
                self.assertNotIn("#DCE5FC", html)   # 没有 b 的浅蓝方块编号
                self.assertNotIn("<ol", html)       # 列表自己画序号
                self.assertNotIn("#f7f7f7;border-radius: 6px;text-align: center", html)  # 没有 b 的灰底题记
        self.assertIn("text-indent: 2em", wechat.compile_html(self.meta, self.body, {}, "m"))   # 首行缩进
        self.assertIn("text-align: center", wechat.compile_html(self.meta, self.body, {}, "n"))  # 全文居中
        o = wechat.compile_html(self.meta, self.body, {}, "o")
        self.assertEqual(o.count("box-shadow"), 3)                                               # 三章三张卡片

    def test_compare_page(self):
        page = wechat.compare_page([("b · 反思思辨型", "<p>x</p>"), ("c · 干货教程型", "<p>y</p>")], "t")
        self.assertEqual(page.count('class="col"'), 2)


if __name__ == "__main__":
    unittest.main()
