const puppeteer = require('puppeteer');
const env = require('../environment-variables');

function addUrlToDescription(youtubeVideoInfo) {
  return env.URL_IN_DESCRIPTION
    ? `${youtubeVideoInfo.description}\n${youtubeVideoInfo.url}`
    : youtubeVideoInfo.description;
}

async function setPublishDate(page, navigationPromise, date) {
  console.log('-- Setting publish date');
  await clickXpath(page, '//span[contains(text(),"Publish date:")]/following-sibling::button');
  await navigationPromise;

  await resetDatePickerToSelectYears(page, navigationPromise);
  await selectYearInDatePicker(page, navigationPromise, date.year);
  await selectMonthInDatePicker(page, navigationPromise, date.month);
  await selectDayInDatePicker(page, navigationPromise, date.day);

  await clickXpath(page, '//span[contains(text(),"Confirm")]/parent::button');
  await navigationPromise;
}

async function resetDatePickerToSelectYears(page, navigationPromise) {
  for (let i = 0; i < 2; i += 1) {
    await clickSelector(page, 'th[class="rdtSwitch"]');
    await navigationPromise;
  }
}

async function selectYearInDatePicker(page, navigationPromise, year) {
  const rdtPrev = await page.$('th[class="rdtPrev"]');
  let currentLowestYear = await page.$eval('tbody > tr:first-child > td:first-child', (e) =>
    e.getAttribute('data-value')
  );
  while (parseInt(currentLowestYear, 10) > parseInt(year, 10)) {
    await rdtPrev.click();
    await navigationPromise;

    currentLowestYear = await page.$eval('tbody > tr:first-child > td:first-child', (e) =>
      e.getAttribute('data-value')
    );
  }

  const rdtNext = await page.$('th[class="rdtNext"]');
  let currentHighestYear = await page.$eval('tbody > tr:last-child > td:last-child', (e) =>
    e.getAttribute('data-value')
  );
  while (parseInt(currentHighestYear, 10) < parseInt(year, 10)) {
    await rdtNext.click();
    await navigationPromise;

    currentHighestYear = await page.$eval('tbody > tr:last-child > td:last-child', (e) => e.getAttribute('data-value'));
  }

  await clickSelector(page, `tbody > tr > td[data-value="${year}"]`);
  await navigationPromise;
}

async function selectMonthInDatePicker(page, navigationPromise, month) {
  await clickXpath(page, `//tbody/tr/td[contains(text(),"${month}")]`);
  await navigationPromise;
}

async function selectDayInDatePicker(page, navigationPromise, day) {
  const dayWithRemovedZeroPad = parseInt(day, 10);
  await clickSelector(
    page,
    `tbody > tr > td[data-value="${dayWithRemovedZeroPad}"][class*="rdtDay"]:not([class*="rdtOld"]):not([class*="rtdNew"])`
  );
  await navigationPromise;
}

async function postEpisode(youtubeVideoInfo) {
  let browser;
  try {
    console.log('Launching puppeteer');
    browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: env.PUPETEER_HEADLESS });
    const page = await browser.newPage();

    const navigationPromise = page.waitForNavigation();

    await page.goto('https://podcasters.spotify.com/pod/dashboard/episode/new');

    await page.setViewport({ width: 1600, height: 789 });

    await navigationPromise;

    console.log('Trying to log in');
    /* The reason for the wait is because
    anchorfm can take a little longer to load the form for logging in 
    and because pupeteer treats the page as loaded(or navigated to) 
    even when the form is not showed
    */
    
    await page.waitForSelector('#email');
    await page.type('#email', env.ANCHOR_EMAIL);
    await page.type('#password', env.ANCHOR_PASSWORD);
    await clickSelector(page, 'button[type=submit]');
    await navigationPromise;
    console.log('Logged in');

    console.log('Uploading audio file');
    await page.waitForSelector('input[type=file]');
    const inputFile = await page.$('input[type=file]');
    await inputFile.uploadFile(env.AUDIO_FILE);

    console.log('Waiting for upload to finish');
    await new Promise((r) => {
      setTimeout(r, 25 * 1000);
    });

    await clickXpath(
      page,
      '//span[contains(text(),"Save")]/parent::button[not(boolean(@disabled))]',
      {timeout: env.UPLOAD_TIMEOUT}
    );
    await navigationPromise;
    
    console.log('-- Adding title');
    await page.waitForSelector('#title', { visible: true });
    // Wait some time so any field refresh doesn't mess up with our input
    await new Promise((r) => {
      setTimeout(r, 2000);
    });
    await page.type('#title', youtubeVideoInfo.title);

    console.log('-- Adding description');
    await page.waitForSelector('div[role="textbox"]', { visible: true });
    const finalDescription = addUrlToDescription(youtubeVideoInfo);
    await page.type('div[role="textbox"]', finalDescription);

    if (env.SET_PUBLISH_DATE) {
      await setPublishDate(page, navigationPromise, youtubeVideoInfo.uploadDate);
    }

    console.log('-- Selecting content type');
    const selectorForExplicitContentLabel = env.IS_EXPLICIT
      ? 'label[for="podcastEpisodeIsExplicit-true"]'
      : 'label[for="podcastEpisodeIsExplicit-false"]';
    await clickSelector(page, selectorForExplicitContentLabel, {visible: true});

    if (env.LOAD_THUMBNAIL) {
      console.log('-- Uploading episode art');
      await page.waitForSelector('input[type=file][accept="image/*"]');
      const inputEpisodeArt = await page.$('input[type=file][accept="image/*"]');
      await inputEpisodeArt.uploadFile(env.THUMBNAIL_FILE);

      console.log('-- Saving uploaded episode art');
      await clickXpath(page,'//span[text()="Save"]/parent::button');

      await page.waitForXPath('//div[@aria-label="image uploader"]', { hidden: true, timeout: env.UPLOAD_TIMEOUT });
    }

    const saveDraftOrPublishOrScheduleButtonDescription = getSaveDraftOrPublishOrScheduleButtonDescription();
    console.log(`-- ${saveDraftOrPublishOrScheduleButtonDescription.message}`);
    await clickXpath(
      page,
      saveDraftOrPublishOrScheduleButtonDescription.xpath
    );
    await navigationPromise;

    /*
    This is a workaround solution of the problem where the podcast
    is sometimes saved as draft with title "Untitled" and no other metadata.
    We navigate to the spotify/anchorfm dashboard immediately after podcast is
    published/scheduled.
     */
    await page.goto('https://podcasters.spotify.com/pod/dashboard/episodes');

    console.log('Yay');
  } catch (err) {
    throw new Error(`Unable to post episode to anchorfm: ${err}`);
  } finally {
    if (browser !== undefined) {
      await browser.close();
    }
  }
}

function getSaveDraftOrPublishOrScheduleButtonDescription() {
  if (env.SAVE_AS_DRAFT) {
    return {
      xpath: '//button[text()="Save as draft"]',
      message: 'Saving draft',
    };
  }

  if (env.SET_PUBLISH_DATE) {
    return {
      xpath: '//span[text()="Schedule episode"]/parent::button',
      message: 'Scheduling',
    };
  }

  return {
    xpath: '//span[text()="Publish now"]/parent::button',
    message: 'Publishing',
  };
}


async function clickSelector(page, selector, options = {}) {
  await page.waitForSelector(selector, options);
  const element = await page.$(selector);
  await clickDom(page, element);
}

async function clickXpath(page, xpath, options = {}){
  await page.waitForXPath(xpath, options);
  const [xpathBtn] = await page.$x(xpath);
  await clickDom(page,xpathBtn);
}

async function clickDom(page, domBtn){
  await page.evaluate((elem)=>{
    elem.click();
  }, domBtn);
}

module.exports = {
  postEpisode,
};
