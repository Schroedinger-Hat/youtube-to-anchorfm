const { exec } = require('child_process');
const fs = require('fs');

const email = process.env.ANCHOR_EMAIL;
const password = process.env.ANCHOR_PASSWORD;
const UPLOAD_TIMEOUT = process.env.UPLOAD_TIMEOUT || 60 * 5 * 1000;

const YT_URL = 'https://www.youtube.com/watch?v=';
const pathToEpisodeJSON = 'episode.json';
const outputFile = 'episode.webm';

console.log('installing dependecies');
exec('sudo curl -k -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl && sudo chmod a+rx /usr/local/bin/youtube-dl && sudo npm i puppeteer --unsafe-perm=true --allow-root', (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);

    const youtubedl = require('youtube-dl');
    const puppeteer = require('puppeteer');

    try {
        const epConfJSON = JSON.parse(fs.readFileSync(pathToEpisodeJSON, 'utf-8'));

        const YT_ID = epConfJSON.id;
        console.log(`Processing: ${YT_ID}`);
        const url = YT_URL + YT_ID;

        youtubedl.getInfo(url, function (err, info) {
            if (err) throw err;
            epConfJSON.title = info.title;
            epConfJSON.description = info.description;

            const youtubeDlCommand = `youtube-dl -o ${outputFile} -f bestaudio[ext=webm] ${url}`;

            exec(youtubeDlCommand, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`)
                    return
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`)
                    return
                }
                console.log(`stdout: ${stdout}`)
                fs.writeFileSync(pathToEpisodeJSON, JSON.stringify(epConfJSON));

                const episode = JSON.parse(fs.readFileSync(pathToEpisodeJSON, 'utf-8'));
            
                (async () => {
                    console.log("Launching puppeteer");
                    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
                    const page = await browser.newPage();
            
                    const navigationPromise = page.waitForNavigation();
            
                    await page.goto('https://anchor.fm/dashboard/episode/new');
            
                    await page.setViewport({ width: 1600, height: 789 });
            
                    await navigationPromise;
            
                    await page.type('#email', email);
                    await page.type('#password', password);
                    await page.click('button[type=submit]');
                    await navigationPromise;
                    console.log("Logged in");
                    await page.waitForSelector('input[type=file]');
            
                    const inputFile = await page.$('input[type=file]');
                    await inputFile.uploadFile('episode.webm');
                    console.log("Uploading audio file");
                    await page.waitFor(25 * 1000);
                    await page.waitForFunction('document.querySelector(".styles__saveButton___lWrNZ").getAttribute("disabled") === null', { timeout: UPLOAD_TIMEOUT });
                    await page.click('.styles__saveButton___lWrNZ');
                    await navigationPromise;
                    console.log("Adding title and description");
                    await page.waitForSelector('#title');
                    await page.type('#title', episode.title);
            
                    await page.click('.styles__modeToggleText___26-xx');
            
                    await page.waitForSelector('textarea[name=description]');
                    await page.type('textarea[name=description]', episode.description);

                    console.log("Publishing");
                    await page.click('.styles__saveButtonWrapper___TrQYl button');
                    await navigationPromise;
            
                    await browser.close()
                    return new Promise((resolve, reject) => resolve("yay"));
                })().then(r => console.log(r), v => console.log(v));
            });
        });

    } catch (error) {
        throw error;
    }



});