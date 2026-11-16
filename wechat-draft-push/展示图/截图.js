// 把展示页 HTML 截成图片。由 生成展示图.py 调用，一般不用单独跑。
// 用法：node 截图.js 任务.json
// 任务.json：[{"html": "...", "out": "....png", "width": 1680, "scale": 2, "type": "png", "maxBytes": 0}, ...]
// maxBytes > 0 时（文章配图要 1MB 以内），太大就降低清晰度重截。
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'));
  const browser = await chromium.launch();
  for (const job of jobs) {
    const scales = job.maxBytes ? [job.scale, 1.25, 1].filter(s => s <= job.scale) : [job.scale];
    for (const scale of scales) {
      const page = await browser.newPage({ viewport: { width: job.width, height: 1000 }, deviceScaleFactor: scale });
      await page.goto('file://' + job.html);
      await page.waitForTimeout(300);
      const opts = { path: job.out, fullPage: true, type: job.type };
      if (job.type === 'jpeg') opts.quality = 82;
      await page.screenshot(opts);
      await page.close();
      if (!job.maxBytes || fs.statSync(job.out).size <= job.maxBytes) break;
    }
    console.log(job.out);
  }
  await browser.close();
})();
