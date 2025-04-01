// scrapeProfile.ts

import { chromium, ElementHandle, Page } from 'playwright';

const ScrapeProfile2 = async ( url: string) => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        storageState: 'linkedin-auth.json'
    });
    const page = await browser.newPage();
    await page.goto('https://www.linkedin.com/login');
    await page.waitForTimeout(20000); // time to log in manually


    await context.storageState({ path: 'linkedin-auth.json' });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });


    // const getText = async (xpath: string) => {
    //     const locator = page.locator(`xpath=${xpath}`);
    //     return (await locator.first().textContent())?.trim() || '';
    // };

    const getText = async (xpath: string) => {
        try {
            const locator = page.locator(`xpath=${xpath}`);
            const el = await locator.first();
            if (await el.count() === 0) return '';
            return (await el.textContent())?.trim() || '';
        } catch (err) {
            console.warn(`⚠️ Failed to find element at: ${xpath}`);
            return '';
        }
    };

    const getCount = async (xpath: string) => {
    return await page.locator(`xpath=${xpath}`).count();
    };

    const name = await page.locator('h1.v-align-middle').first().textContent();
    const location = await page.locator('span.text-body-small.inline.t-black--light.break-words').first().textContent();
    // const about = await getText('//*[@id="profile-content"]/div/div[2]/div/div/main/section[2]/div[3]/div/div/span[1]');

    const work_experience: any[] = [];
    const jobCount = await getCount('//*[@id="profile-content"]/div/div[2]/div/div/main/section[6]/div[3]/ul/li');

    for (let i = 1; i <= jobCount; i++) {
    const nestedCount = await getCount(`//*[@id="profile-content"]/div/div[2]/div/div/main/section[6]/div[3]/ul/li[${i}]/div/div[2]/div[2]/ul/li`);

    if (nestedCount > 0) {
        const organization = await getText(`//*[@id="profile-content"]/div/div[2]/div/div/main/section[6]/div[3]/ul/li[${i}]/div/div[2]/div[1]/a/div/div/div/div/span[1]`);

        for (let j = 1; j <= nestedCount; j++) {
        work_experience.push({
            location: { full: '' },
            title: await getText(`//*[@id="profile-content"]/div/div[2]/div/div/main/section[6]/div[3]/ul/li[${i}]/div/div[2]/div[2]/ul/li[${j}]/div/div[2]/div[1]/div/span[1]`),
            start_date: { full: await getText(`//*[@id="profile-content"]/div/div[2]/div/div/main/section[6]/div[3]/ul/li[${i}]/div/div[2]/div[2]/ul/li[${j}]/div/div[2]/div[2]/span[1]/span[1]`) },
            end_date: { full: await getText(`//*[@id="profile-content"]/div/div[2]/div/div/main/section[6]/div[3]/ul/li[${i}]/div/div[2]/div[2]/ul/li[${j}]/div/div[2]/div[2]/span[1]/span[1]`) },
            job_type: '',
            responsibilities: [
            await getText(`//*[@id="profile-content"]/div/div[2]/div/div/main/section[6]/div[3]/ul/li[${i}]/div/div[2]/div[2]/ul/li[${j}]/div/ul/li/div/div/div/div`)
            ],
            tools: [],
            organization,
        });
        }
    } else {
        work_experience.push({
        location: { full: await getText(`//*[@id="profile-content"]/div/div[2]/div/div/main/section[6]/div[3]/ul/li[${i}]/div/div[2]/div[1]/a/div/div/div/div/span[2]`) },
        title: await getText(`//*[@id="profile-content"]/div/div[2]/div/div/main/section[6]/div[3]/ul/li[${i}]/div/div[2]/div[1]/a/div/div/div/div/span[1]`),
        start_date: { full: await getText(`//*[@id="profile-content"]/div/div[2]/div/div/main/section[6]/div[3]/ul/li[${i}]/div/div[2]/div[2]/ul/li[1]/span/span[1]`) },
        end_date: { full: await getText(`//*[@id="profile-content"]/div/div[2]/div/div/main/section[6]/div[3]/ul/li[${i}]/div/div[2]/div[2]/ul/li[1]/span/span[1]`) },
        job_type: '',
        responsibilities: [
            await getText(`//*[@id="profile-content"]/div/div[2]/div/div/main/section[6]/div[3]/ul/li[${i}]/div/div[2]/div[3]/div/div/div/div/span[1]`)
        ],
        tools: [],
        organization: '',
        });
    }
    }

    const education: any[] = [];
    const eduCount = await getCount('//*[@id="profile-content"]/div/div[2]/div/div/main/section[9]/div[3]/ul/li');

    for (let i = 1; i <= eduCount; i++) {
    education.push({
        school_name: await getText(`//*[@id="profile-content"]/div/div[2]/div/div/main/section[9]/div[3]/ul/li[${i}]/div/div[2]/div[1]/a/div/span/span[1]`),
        degree_name: '',
        degree_type: await getText(`//*[@id="profile-content"]/div/div[2]/div/div/main/section[9]/div[3]/ul/li[${i}]/div/div[2]/div[2]/span/span[1]`),
        major: '',
        minor: '',
        gpa: '',
        credits: '',
        location: { city: '', state: '', country: '' },
        certificates: [],
    });
    }

    const data = {
        name,
        work_experience,
        education,
        location,
        job: work_experience.map(w => w.title),
        // about,
    };

    console.log(JSON.stringify(data, null, 2));
    await browser.close();

    return data;
};

export default ScrapeProfile2;