const puppeteer = require('puppeteer');
const fs = require('fs');

const email = process.env.ANCHOR_EMAIL;
const password = process.env.ANCHOR_PASSWORD;

const episode = JSON.parse(fs.readFileSync('episode.json', 'utf-8'));

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const navigationPromise = page.waitForNavigation();

    await page.goto('https://anchor.fm/dashboard/episode/new');

    await page.setViewport({ width: 1600, height: 789 });

    await navigationPromise;

    await page.type('#email', email);
    await page.type('#password', password);
    await page.click('button[type=submit]');
    await navigationPromise;

    await page.waitForSelector('input[type=file]');

    const inputFile = await page.$('input[type=file]');
    await inputFile.uploadFile('episode.webm');
    await page.waitFor(25*1000);
    await page.waitForFunction('document.querySelector(".styles__saveButton___lWrNZ").getAttribute("disabled") === null', {timeout: 60*5*1000});
    await page.click('.styles__saveButton___lWrNZ');
    await navigationPromise;

    await page.waitForSelector('#title');
    await page.type('#title', episode.title);

    await page.click('.styles__modeToggleText___26-xx');

    await page.waitForSelector('textarea[name=description]');
    await page.type('textarea[name=description]', episode.description);

    await page.click('.styles__saveButtonWrapper___TrQYl button');
    await navigationPromise;

    await browser.close()
})()