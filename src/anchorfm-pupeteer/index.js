const env = require('../environment-variables');
const puppeteer = require('puppeteer');

function addUrlToDescription(youtubeVideoInfo) {
    return env.URL_IN_DESCRIPTION ? 
        youtubeVideoInfo.description + '\n' + youtubeVideoInfo.url 
        : youtubeVideoInfo.description;
}

async function setPublishDate(page, navigationPromise, date) {
    console.log("-- Setting publish date");
    const publishDateButtonSelector = '//span[contains(text(),"Publish date:")]/following-sibling::button';
    const [publishDateButton] = await page.$x(publishDateButtonSelector);
    await publishDateButton.click();
    await navigationPromise;

    await resetDatePickerToSelectYears(page, navigationPromise);
    await selectYearInDatePicker(page, navigationPromise, date.year);
    await selectMonthInDatePicker(page, navigationPromise, date.month);
    await selectDayInDatePicker(page, navigationPromise, date.day);

    const confirmButtonSelector = '//span[contains(text(),"Confirm")]/parent::button';
    const [confirmButton] = await page.$x(confirmButtonSelector);
    await confirmButton.click();
    await navigationPromise;
}

async function resetDatePickerToSelectYears(page, navigationPromise) {
    for(let i = 0; i < 2; i++) {
        const datePickerSwitchButtonSelector = 'th[class="rdtSwitch"]';
        const datePickerSwitchButton = await page.$(datePickerSwitchButtonSelector);
        await datePickerSwitchButton.click();
        await navigationPromise;
    }
}

async function selectYearInDatePicker(page, navigationPromise, year) {
    const rdtPrev = await page.$('th[class="rdtPrev"]');
    let currentLowestYear = await page.$eval('tbody > tr:first-child > td:first-child', e => e.getAttribute("data-value"));
    while(parseInt(currentLowestYear) > parseInt(year)) {
        await rdtPrev.click();
        await navigationPromise;

        currentLowestYear = await page.$eval('tbody > tr:first-child > td:first-child', e => e.getAttribute("data-value"));
    }
    
    const rdtNext = await page.$('th[class="rdtNext"]');
    let currentHighestYear = await page.$eval('tbody > tr:last-child > td:last-child', e => e.getAttribute("data-value"));
    while(parseInt(currentHighestYear) < parseInt(year)) {
        await rdtNext.click();
        await navigationPromise;

        currentHighestYear = await page.$eval('tbody > tr:last-child > td:last-child', e => e.getAttribute("data-value"));
    }

    const tdYear = await page.$(`tbody > tr > td[data-value="${year}"]`);
    await tdYear.click();
    await navigationPromise;
}

async function selectMonthInDatePicker(page, navigationPromise, month) {
    const [tdMonth] = await page.$x(`//tbody/tr/td[contains(text(),"${month}")]`);
    await tdMonth.click();
    await navigationPromise;
}

async function selectDayInDatePicker(page, navigationPromise, day) {
    const dayWithRemovedZeroPad = parseInt(day);
    const tdDay = await page.$(`tbody > tr > td[data-value="${dayWithRemovedZeroPad}"][class*="rdtDay"]:not([class*="rdtOld"]:not([class*="rtdNew"])`);
    await tdDay.click();
    await navigationPromise;
}

async function postEpisode(youtubeVideoInfo) {
    let browser = undefined;
    try {
        console.log("Launching puppeteer");
        browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: env.PUPETEER_HEADLESS });
        const page = await browser.newPage();
    
        const navigationPromise = page.waitForNavigation();
    
        await page.goto('https://anchor.fm/dashboard/episode/new');
    
        await page.setViewport({ width: 1600, height: 789 });
    
        await navigationPromise;
    
        console.log("Trying to log in");
        await page.type('#email', env.ANCHOR_EMAIL);
        await page.type('#password', env.ANCHOR_PASSWORD);
        await page.click('button[type=submit]');
        await navigationPromise;
        console.log("Logged in");
    
        console.log("Uploading audio file");
        await page.waitForSelector('input[type=file]');
        const inputFile = await page.$('input[type=file]');
        await inputFile.uploadFile(env.AUDIO_FILE);
    
        console.log("Waiting for upload to finish");
        await page.waitForTimeout(25 * 1000);
    
        const saveEpisodeButtonSelector = '//span[contains(text(),"Save")]/parent::button[not(boolean(@disabled))]'
        await page.waitForXPath(saveEpisodeButtonSelector, { timeout: env.UPLOAD_TIMEOUT });
        const [saveButton] = await page.$x(saveEpisodeButtonSelector);
        await saveButton.click();
        await navigationPromise;
    
        console.log("-- Adding title");
        await page.waitForSelector('#title', { visible: true });
        // Wait some time so any field refresh doesn't mess up with our input
        await page.waitForTimeout(2000);
        await page.type('#title', youtubeVideoInfo.title);
    
        console.log("-- Adding description");
        await page.waitForSelector('div[role="textbox"]', { visible: true });
        const finalDescription = addUrlToDescription(youtubeVideoInfo);
        await page.type('div[role="textbox"]', finalDescription);
        
        if (env.SET_PUBLISH_DATE) {
            await setPublishDate(page, navigationPromise, youtubeVideoInfo.uploadDate);
        }

        console.log("-- Selecting content type");
        const selectorForExplicitContentLabel = env.IS_EXPLICIT ? 'label[for="podcastEpisodeIsExplicit-true"]' : 'label[for="podcastEpisodeIsExplicit-false"]'
        await page.waitForSelector(selectorForExplicitContentLabel, { visible: true});
        const contentTypeLabel = await page.$(selectorForExplicitContentLabel);
        await contentTypeLabel.click();
    
        if (env.LOAD_THUMBNAIL) {
            console.log("-- Uploading episode art");
            await page.waitForSelector('input[type=file][accept="image/*"]');
            const inputEpisodeArt = await page.$('input[type=file][accept="image/*"]');
            await inputEpisodeArt.uploadFile(env.THUMBNAIL_FILE);
    
            console.log("-- Saving uploaded episode art");
            const saveThumbnailButtonSelector = '//span[text()="Save"]/parent::button';
            await page.waitForXPath(saveThumbnailButtonSelector);
            const [saveEpisodeArtButton] = await page.$x(saveThumbnailButtonSelector);
            await saveEpisodeArtButton.click();
            await page.waitForXPath('//div[@aria-label="image uploader"]', { hidden: true, timeout: env.UPLOAD_TIMEOUT});
        }
    
        const saveDraftOrPublishOrScheduleButtonXPath = env.SAVE_AS_DRAFT ? '//button[text()="Save as draft"]' 
            : env.SET_PUBLISH_DATE ? '//span[text()="Schedule episode"]/parent::button' : '//span[text()="Publish now"]/parent::button'
        const saveDraftOrPublishOrScheduleLogMessage = env.SAVE_AS_DRAFT ? "Saving draft" 
            : env.SET_PUBLISH_DATE ? "Scheduling" : "Publishing";
        console.log(`-- ${saveDraftOrPublishOrScheduleLogMessage}`);
        
        const [saveDraftOrPublishOrScheduleButton] = await page.$x(saveDraftOrPublishOrScheduleButtonXPath);
        await saveDraftOrPublishOrScheduleButton.click();
        await navigationPromise;
        
        console.log("Yay");
    } catch (err) {
        throw new Error(`Unable to post episode to anchorfm: ${err}`);
    } finally {
        if(browser !== undefined) {
            await browser.close();
        }
    }
}

module.exports = {
    postEpisode
};
