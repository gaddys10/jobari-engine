import { chromium } from 'playwright';

const scrapeProfile = async (url: string) => {
    //launches chromium browser
    const browser = await chromium.launch({ headless: false }); // use false to login manually
    const context = await browser.newContext({
        storageState: 'linkedin-auth.json'
    });
    const page = await context.newPage();

    await page.goto('https://www.linkedin.com/login');
    await page.waitForTimeout(40000); // time to log in manually

    await context.storageState({ path: 'linkedin-auth.json' });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const name = await page.locator('h1.v-align-middle').first().textContent();
    const headline = await page.locator('div.text-body-medium.break-words').first().textContent();
    const location = await page.locator('span.text-body-small.inline.t-black--light.break-words').first().textContent();
  

    // await browser.close();

    return {
        name: name?.trim(),
        headline: headline?.trim() ?? '',
    location: location?.trim() ?? '',
    about: '', // to be filled when Playwright can access it
    };
};

export default scrapeProfile;