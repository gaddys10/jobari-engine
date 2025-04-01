import { chromium } from 'playwright';

const scrapeProfile = async (url: string) => {
    //launches chromium browser
    // use false to login manually
    const browser = await chromium.launch({ headless: false }); 
    //auth help
    const context = await browser.newContext({
        storageState: 'linkedin-auth.json'
    });
    const page = await context.newPage();

    //take browser to linkedin login page
    await page.goto('https://www.linkedin.com/login');

    //time to login manually
    await page.waitForTimeout(20000);

    //store login
    await context.storageState({ path: 'linkedin-auth.json' });

    //go to linkedin profile
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    //get profile's name
    const name = await page.locator('h1.v-align-middle').first().textContent();

    //get profile's headline
    const headline = await page.locator('div.text-body-medium.break-words').first().textContent();

    //get profile's location
    const location = await page.locator('span.text-body-small.inline.t-black--light.break-words').first().textContent();
    
    //get count for all top level work experience. Organization w/ nested jobs or single job title at a company. 
    const jobCompanyCount = await page.locator('//*[@id="profile-content"]/div/div[2]/div/div/main/section/div[3]/ul/li/div/div[2]/div[1]/a/div/div/div/div/span[1]').count();
    console.log(jobCompanyCount);


    let nestedJob1 = null;
    //attempt to look for a nested job title
    //in case user has 2+ jobs at 1 company
    try {
        nestedJob1 = await page.locator('//*[@id="profile-content"]/div/div[2]/div/div/main/section[5]/div[3]/ul/li[1]/div/div[2]/div[2]/ul/li[1]/div/div[2]/div[1]/a/div/div/div/div/span[1]').first().textContent();
        // nestedJob1 = await page.locator('//*[@id="profile-content"]/div/div[2]/div/div/main/section[4]/div[3]/ul/li[1]/div/div[2]/div[2]/ul/li[1]/div/div[2]/div[1]/a/div/div/div/div/span[1]')
    } catch (error) {
        console.warn("Only one job at this company.. continuing");
    }
    let organization;
    let job;
    let job2;
    let job_dates;
    let job_description;
    let job_location;

    //if nested job titles exist, set organization name with xpath.
    //else, that same xpath will return the most recent job
    if( nestedJob1 ) {
        organization = await page.locator('//*[@id="profile-content"]/div/div[2]/div/div/main/section[5]/div[3]/ul/li[1]/div/div[2]/div[1]/a/div/div/div/div/span[1]').first().textContent();
        job = await page.locator('//*[@id="profile-content"]/div/div[2]/div/div/main/section[4]/div[3]/ul/li[1]/div/div[2]/div[2]/ul/li[1]/div/div[2]/div[1]/a/div/div/div/div/span[1]').first().textContent();
        job_location = await page.locator('//*[@id="profile-content"]/div/div[2]/div/div/main/section[5]/div[3]/ul/li[5]/div/div[2]/div[1]/a/span[2]/span[1]').first().textContent();
    } else {

        job = await page.locator('//*[@id="profile-content"]/div/div[2]/div/div/main/section[6]/div[3]/ul/li[1]/div/div[2]/div[1]/a/div/div/div/div/span[1]').first().textContent();
        job2 = await page.locator('//*[@id="profile-content"]/div/div[2]/div/div/main/section[5]/div[3]/ul/li[2]/div/div[2]/div[1]/a/div/div/div/div/span[1]').first().textContent();

        job_dates = await page.locator('//*[@id="profile-content"]/div/div[2]/div/div/main/section[5]/div[3]/ul/li[1]/div/div[2]/div[1]/a/span[2]/span[1]').first().textContent();
        job_description = await page.locator('//*[@id="profile-content"]/div/div[2]/div/div/main/section[5]/div[3]/ul/li[1]/div/div[2]/div[2]/ul/li[1]/div/ul/li/div/div/div/div').first().textContent();
        job_location = await page.locator('//*[@id="profile-content"]/div/div[2]/div/div/main/section[5]/div[3]/ul/li[1]/div/div[2]/div[1]/a/span[3]/span[1]').first().textContent();
    }

    let schoolName= await page.locator('//*[@id="profile-content"]/div/div[2]/div/div/main/section[6]/div[3]/ul/li[1]/div/div[2]/div[1]/a/div/div/div/div/span[1]').first().textContent();
    let schoolTime = await page.locator('//*[@id="profile-content"]/div/div[2]/div/div/main/section[6]/div[3]/ul/li[1]/div/div[2]/div[1]/a/span[2]/span[1]').first().textContent();
    let degreeType = await page.locator('//*[@id="profile-content"]/div/div[2]/div/div/main/section[6]/div[3]/ul/li[1]/div/div[2]/div[1]/a/span[1]/span[1]').first().textContent();

    // const nestedJob1 = await page.locator('//*[@id="profile-content"]/div/div[2]/div/div/main/section[5]/div[3]/ul/li[1]/div/div[2]/div[2]/ul/li[1]/div/div[2]/div[1]/a/div/div/div/div/span[1]').first().textContent();
    // await browser.close();

    let result = {
        name: name?.trim(),
        work_experience: [{
            company_name: organization?.trim(),
            location: {
                full: job_location?.trim(),
                // city: "",
                // state: "",
                // country: "",
            },
            title: (nestedJob1?.trim() || job?.trim()),
            start_date: {
                full: job_dates?.trim(),
                // day: "",
                // month: "",
                // year: ""
            },
            end_date: {
                full: job_dates?.trim(),
                // day: "",
                // month: "",
                // year: ""
            },
            job_type: "",
            responsibilities: [job_description],
            tools: [],
        }],
        education: [{
            school_name: schoolName,
            degree_name: "",
            degree_type: degreeType,
            major: "",
            attendance_dates: schoolTime,
            // credits: "",
            // location: {
            //     city: "",
            //     state: "",
            //     country: ""
            // },
            certificates: []
        }],
    }

    return result
};

export default scrapeProfile;