// اختبار شامل لواجهة بوابة الطالب في الوضع التجريبي باستخدام Playwright
// التشغيل: npm run build && npx vite preview --port 4180 &  ثم  node scripts/e2e.cjs
const { chromium, devices } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE = process.env.BASE_URL || 'http://localhost:4180/'
const OUT = process.env.SHOTS_DIR || path.join(__dirname, '..', 'test-results')
fs.mkdirSync(OUT, { recursive: true })

let step = 0
const log = (m) => console.log(`✔ ${++step}. ${m}`)
const assert = (cond, msg) => {
  if (!cond) throw new Error(`ASSERTION FAILED: ${msg}`)
}

async function main() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ ...devices['iPhone 13'], locale: 'ar', serviceWorkers: 'block' })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(`PAGEERROR ${e.message}`))
  const shot = (name) => page.screenshot({ path: path.join(OUT, `${name}.png`) })
  const tab = (label) => page.click(`nav button:has-text("${label}")`)

  await page.goto(BASE)
  await page.evaluate(() => localStorage.clear())
  await page.goto(BASE)
  await page.waitForSelector('text=تسجيل الدخول')
  assert((await page.locator('header').innerText()).includes('بوابة الطالب'), 'login shows the portal name')
  assert((await page.locator('body').innerText()).includes('م.م سفيان محمد'), 'credit shown')
  await shot('01-login')
  await page.fill('input[aria-label="رقم الدخول"]', '1234567')
  await page.fill('input[aria-label="الرمز السري"]', '99999999')
  await page.click('button[type=submit]')
  await page.waitForSelector('text=رقم الدخول أو الرمز السري غير صحيح')
  log('login page + wrong code message')

  await page.fill('input[aria-label="الرمز السري"]', '1234 5678')
  await page.click('button[type=submit]')
  await page.waitForSelector('text=أهلاً بك')
  const home = await page.locator('main').innerText()
  assert(home.includes('علي حسين') && home.includes('ألف مبارك النجاح') && home.includes('الإعلانات'), 'home: greeting, latest result, announcements')
  assert((await page.locator('nav [aria-current="page"]').innerText()).includes('الرئيسية'), 'home tab active after sign-in')
  await shot('02-home')
  log('sign in → home with greeting, congratulation teaser, coursework/results tiles, announcements')

  await tab('السعي')
  await page.waitForSelector('text=مجموع السعي المرصود')
  const cw = await page.locator('main').innerText()
  assert(cw.includes('التشريح الشعاعي للرأس والأطراف العليا') && cw.includes('32') && cw.includes('السعي من 40'), 'coursework total per subject')
  assert(cw.includes('لم يُرصد بعد'), 'unrecorded coursework marked')
  assert(!/نظري|عملي/.test(cw), 'no theory/practical breakdown')
  await page.click('main [role=tab]:has-text("الفصل الثاني")')
  await page.waitForSelector('text=لم يُنشر السعي بعد')
  await page.click('main [role=tab]:has-text("الفصل الأول")')
  await shot('03-coursework')
  log('coursework: totals only, unrecorded subject, unpublished term message')

  await tab('النتائج')
  await page.waitForSelector('text=نتيجة الامتحانات النهائية')
  const res = await page.locator('article').innerText()
  for (const t of ['ألف مبارك النجاح', 'حالة الطالب: ناجح', 'من الأوائل', 'التقدير العام', 'مجموع الوحدات', 'رمز التحقق']) assert(res.includes(t), `result shows ${t}`)
  assert((await page.locator('article .confetti i').count()) > 10, 'celebration for a passing student')
  await shot('04-result')
  // سنة سابقة: النتيجة السنوية بفصليها
  await page.click('main [role=tab]:has-text("2025")')
  await page.waitForSelector('article:has-text("النتيجة السنوية")')
  const annual = await page.locator('article').innerText()
  assert(annual.includes('الفصل الأول') && annual.includes('الفصل الثاني') && annual.includes('ناجح بقرار') && annual.includes('ناجح (د2)'), 'annual result with both terms')
  await page.emulateMedia({ media: 'print' })
  const pdf = await page.pdf({ format: 'A4', printBackground: true })
  await page.emulateMedia({ media: 'screen' })
  assert(pdf.length > 20000, 'result can be saved as PDF')
  log('results: labels + status + congratulation + rank badge, previous-year annual result, PDF')

  await tab('حسابي')
  await page.waitForSelector('text=السجل الأكاديمي')
  const acc = await page.locator('main').innerText()
  assert(acc.includes('1234567') && acc.includes('2025') && acc.includes('2026'), 'account: login number and academic record')
  await page.click('button:has-text("تغيير الرمز السري")')
  await page.fill('input[aria-label="الرمز الحالي"]', '12345678')
  await page.fill('input[aria-label="الرمز الجديد"]', 'abc')
  await page.fill('input[aria-label="تأكيد الرمز الجديد"]', 'abc')
  await page.click('button:has-text("حفظ الرمز الجديد")')
  await page.waitForSelector('text=لا يقل عن 6 خانات')
  await page.fill('input[aria-label="الرمز الجديد"]', 'newcode2026')
  await page.fill('input[aria-label="تأكيد الرمز الجديد"]', 'newcode2026')
  await page.click('button:has-text("حفظ الرمز الجديد")')
  await page.waitForSelector('text=تم تغيير الرمز السري')
  await shot('05-account')
  await page.click('button:has-text("تسجيل الخروج")')
  await page.click('button:has-text("خروج")')
  await page.waitForSelector('text=تسجيل الدخول')
  await page.fill('input[aria-label="رقم الدخول"]', '1234567')
  await page.fill('input[aria-label="الرمز السري"]', 'newcode2026')
  await page.click('button[type=submit]')
  await page.waitForSelector('text=أهلاً بك')
  log('account: academic record, change code (short code rejected), sign out, sign in with the new code')

  // مسح رمز QR لبطاقة طالب آخر
  await page.goto(`${BASE}#/login?u=7654321&c=12345678`)
  await page.waitForFunction(() => document.querySelector('main')?.innerText.includes('زينب حيدر'))
  assert(!page.url().includes('12345678'), 'code removed from the address bar')
  await tab('النتائج')
  await page.waitForSelector('text=المواد المكمل فيها')
  assert((await page.locator('article').innerText()).includes('الفيزياء الشعاعية'), 'carried subjects listed')
  await shot('06-carry')
  log('QR sign-in switches to the scanned card; carry result lists the subjects')

  // الوضع الليلي وعدم تجاوز عرض الهاتف
  await page.click('button[aria-label="الوضع الليلي"]')
  assert(await page.evaluate(() => document.documentElement.classList.contains('dark')), 'dark mode on')
  for (const t of ['الرئيسية', 'السعي', 'النتائج', 'حسابي']) {
    await tab(t)
    await page.waitForTimeout(250)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
    assert(!overflow, `no horizontal overflow on ${t}`)
  }
  await shot('07-dark')
  log('dark mode + no horizontal overflow on a phone')

  assert(errors.length === 0, `console errors: ${errors.join(' | ')}`)
  log('no console errors')
  await browser.close()
  console.log(`\nALL E2E CHECKS PASSED (${step})`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
