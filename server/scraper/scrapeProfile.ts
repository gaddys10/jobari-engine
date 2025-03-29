import { chromium } from 'playwright';

const scrapeProfile = async (url: string) => {
    const browser = await chromium.launch({ headless: false }); // use false to login manually
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://www.linkedin.com/login');
    await page.waitForTimeout(40000); // time to log in manually

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const name = await page.locator('h1.v-align-middle').first().textContent();

    await browser.close();

    return {
        name: name?.trim()
    };
};

export default scrapeProfile;