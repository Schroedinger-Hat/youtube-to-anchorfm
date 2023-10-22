const puppeteer = require('puppeteer');
const env = require('../environment-variables');
const { compareDates } = require('../dateutils');

function addUrlToDescription(youtubeVideoInfo) {
  return env.URL_IN_DESCRIPTION
    ? `${youtubeVideoInfo.description}\n${youtubeVideoInfo.url}`
    : youtubeVideoInfo.description;
}

async function setPublishDate(page, date) {
  console.log('-- Setting publish date');
  await clickSelector(page, 'input[type="radio"][id="publish-date-schedule"]');
  await page.waitForSelector('#date-input', { visible: true });
  await clickSelector(page, '#date-input');

  await selectCorrectYearAndMonthInDatePicker();
  await selectCorrectDayInDatePicker();

  async function selectCorrectYearAndMonthInDatePicker() {
    const dateForComparison = `${date.monthAsFullWord} ${date.year}`;
    const currentDateCaptionElementSelector =
      'div[class*="CalendarMonth"][data-visible="true"] div[class*="CalendarMonth_caption"] > strong';
    let currentDate = await getTextContentFromSelector(page, currentDateCaptionElementSelector);
    const navigationButtonSelector =
      compareDates(dateForComparison, currentDate) === -1
        ? 'div[class*="DayPickerNavigation_leftButton__horizontalDefault"]'
        : 'div[class*="DayPickerNavigation_rightButton__horizontalDefault"]';

    while (currentDate !== dateForComparison) {
      await clickSelector(page, navigationButtonSelector);
      currentDate = await getTextContentFromSelector(page, currentDateCaptionElementSelector);
    }
  }

  async function selectCorrectDayInDatePicker() {
    const dayWithoutLeadingZero = parseInt(date.day, 10);
    const dayXpath = `//div[contains(@class, "CalendarMonth") and @data-visible="true"]//td[contains(text(), "${dayWithoutLeadingZero}")]`;
    await clickXpath(page, dayXpath);
  }
}

async function setLanguageToEnglish(page) {
  await clickSelector(page, 'button[aria-label="Change language"]');
  await clickSelector(page, 'div[aria-label="Language selection modal"] a[data-testid="language-option-en"]');
}

async function postEpisode(youtubeVideoInfo) {
  let browser;

  try {
    console.log('Launching puppeteer');
    browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: env.PUPETEER_HEADLESS });

    const page = await openPage('https://podcasters.spotify.com/pod/dashboard/episode/wizard');

    console.log('Setting language to English');
    await setLanguageToEnglish(page);

    console.log('Trying to log in');
    await login(page);

    console.log('Opening new episode wizard');
    await waitForNewEpisodeWizard(page);

    console.log('Uploading audio file');
    await uploadEpisode(page);

    console.log('Filling required podcast details');
    await fillRequiredDetails(page);

    console.log('Filling optional podcast details');
    await fillOptionalDetails(page);

    console.log('Skipping Interact step');
    await skipInteractStep(page);

    console.log('Save draft or publish');
    await saveDraftOrScheduleOrPublish(page);

    /*
    This is a workaround solution of the problem where the podcast
    is sometimes saved as draft with title "Untitled" and no other metadata.
    We navigate to the spotify/anchorfm dashboard immediately after podcast is
    published/scheduled.
     */
    await goToDashboard(page);

    console.log('Yay');
  } catch (err) {
    throw new Error(`Unable to post episode to anchorfm: ${err}`);
  } finally {
    if (browser !== undefined) {
      await browser.close();
    }
  }

  async function openPage(url) {
    const page = await browser.newPage();
    await page.goto(url);
    await page.setViewport({ width: 1600, height: 789 });
    return page;
  }

  async function login(page) {
    console.log('-- Accessing Log in with email');
    await clickXpath(page, '//button[contains(text(), "Log in with email")]');

    console.log('-- Logging in');
    /* The reason for the wait is because
    anchorfm can take a little longer to load the form for logging in
    and because pupeteer treats the page as loaded(or navigated to)
    even when the form is not showed
    */
    await page.waitForSelector('#email');
    await page.type('#email', env.ANCHOR_EMAIL);
    await page.type('#password', env.ANCHOR_PASSWORD);
    await clickSelector(page, 'button[type=submit]');
    await page.waitForNavigation();
    console.log('-- Logged in');
  }

  async function waitForNewEpisodeWizard(page) {
    await sleepSeconds(1);
    console.log('-- Waiting for episode wizard to open');
    await page.waitForXPath('//span[contains(text(),"Select a file")]');
  }

  async function uploadEpisode(page) {
    console.log('-- Uploading audio file');
    await page.waitForSelector('input[type=file]');
    const inputFile = await page.$('input[type=file]');
    await inputFile.uploadFile(env.AUDIO_FILE);

    console.log('-- Waiting for upload to finish');
    await page.waitForXPath('//span[contains(text(),"Preview ready!")]', { timeout: env.UPLOAD_TIMEOUT });
    console.log('-- Audio file is uploaded');
  }

  async function fillRequiredDetails(page) {
    console.log('-- Adding title');
    const titleInputSelector = '#title-input';
    await page.waitForSelector(titleInputSelector, { visible: true });
    // Wait some time so any field refresh doesn't mess up with our input
    await sleepSeconds(2);
    await page.type(titleInputSelector, youtubeVideoInfo.title);

    console.log('-- Adding description');
    await page.waitForSelector('div[role="textbox"]', { visible: true });
    const finalDescription = addUrlToDescription(youtubeVideoInfo);
    await page.type('div[role="textbox"]', finalDescription);

    if (env.SET_PUBLISH_DATE) {
      const dateDisplay = `${youtubeVideoInfo.uploadDate.day} ${youtubeVideoInfo.uploadDate.monthAsFullWord}, ${youtubeVideoInfo.uploadDate.year}`;
      console.log('-- Schedule publishing for date: ', dateDisplay);
      await setPublishDate(page, youtubeVideoInfo.uploadDate);
    } else {
      console.log('-- No schedule, should publish immediately');
      await clickSelector(page, 'input[type="radio"][id="publish-date-now"]');
    }

    console.log('-- Selecting content type(explicit or no explicit)');
    const selectorForExplicitContentLabel = env.IS_EXPLICIT
      ? 'input[type="radio"][id="explicit-content"]'
      : 'input[type="radio"][id="no-explicit-content"]';
    await clickSelector(page, selectorForExplicitContentLabel, { visible: true });
  }

  async function fillOptionalDetails(page) {
    console.log('-- Clicking Additional Details');
    await clickXpath(page, '//button[contains(text(), "Additional details")]');

    if (env.LOAD_THUMBNAIL) {
      console.log('-- Uploading episode art');
      await page.waitForSelector('input[type=file][accept="image/*"]');
      const inputEpisodeArt = await page.$('input[type=file][accept="image/*"]');
      await inputEpisodeArt.uploadFile(env.THUMBNAIL_FILE);

      console.log('-- Saving uploaded episode art');
      await clickXpath(page, '//span[text()="Save"]/parent::button');

      console.log('-- Waiting for uploaded episode art to be saved');
      await page.waitForXPath('//div[@aria-label="image uploader"]', { hidden: true, timeout: env.UPLOAD_TIMEOUT });
    }
  }

  async function skipInteractStep(page) {
    console.log('-- Going to Interact step so we can skip it');
    await clickXpath(page, '//span[text()="Next"]/parent::button');
    console.log('-- Waiting before clicking next again to skip Interact step');
    await sleepSeconds(3);
    console.log('-- Going to final step by skipping Interact step');
    await clickXpath(page, '//span[text()="Next"]/parent::button');
  }

  async function saveDraftOrScheduleOrPublish(page) {
    if (env.SAVE_AS_DRAFT) {
      console.log('-- Saving draft');
      await clickSelector(page, 'header > button > span');
      await page.waitForNavigation();
      await clickXpath(page, '//span[text()="Save draft"]/parent::button');
    } else if (env.SET_PUBLISH_DATE) {
      console.log('-- Scheduling');
      await clickXpath(page, '//span[text()="Schedule"]/parent::button');
    } else {
      console.log('-- Publishing');
      await clickXpath(page, '//span[text()="Publish"]/parent::button');
    }
    await sleepSeconds(3);
  }

  async function goToDashboard(page) {
    await page.goto('https://podcasters.spotify.com/pod/dashboard/episodes');
    await sleepSeconds(3);
  }
}

async function sleepSeconds(seconds) {
  await new Promise((r) => {
    setTimeout(r, seconds * 1000);
  });
}

async function clickSelector(page, selector, options = {}) {
  await page.waitForSelector(selector, options);
  const elementHandle = await page.$(selector);
  await clickDom(page, elementHandle);
}

async function clickXpath(page, xpath, options = {}) {
  await page.waitForXPath(xpath, options);
  const [elementHandle] = await page.$x(xpath);
  await clickDom(page, elementHandle);
}

async function clickDom(page, domElementHandle) {
  await page.evaluate((element) => element.click(), domElementHandle);
}

async function getTextContentFromSelector(page, selector, options = {}) {
  await page.waitForSelector(selector, options);
  const elementHandle = await page.$(selector);
  return getTextContentFromDom(page, elementHandle);
}

async function getTextContentFromDom(page, domElementHandle) {
  return page.evaluate((element) => element.textContent, domElementHandle);
}

module.exports = {
  postEpisode,
};
