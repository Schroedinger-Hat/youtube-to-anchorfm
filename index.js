const { exec, execSync } = require('child_process');
const fs = require('fs');

function GetEnvironmentVar(varname, defaultvalue) {
    var result = process.env[varname];
    if (result != undefined)
        return result;
    else
        return defaultvalue;
}
require('dotenv').config()
const email = process.env.ANCHOR_EMAIL;
const password = process.env.ANCHOR_PASSWORD;
const UPLOAD_TIMEOUT = process.env.UPLOAD_TIMEOUT || 60 * 5 * 1000;

const THUMBNAIL_FORMAT = "jpg";
const YT_URL = 'https://www.youtube.com/watch?v=';
const pathToEpisodeJSONdir = GetEnvironmentVar('EPISODE_PATH','.') ;

const outputFile = 'episode.mp3';

const draftMode = GetEnvironmentVar('SAVE_AS_DRAFT', 'false')
const url = GetEnvironmentVar('URL', '')

const saveDraftOrPublishButtonXPath = draftMode == 'False' ? '//button[text()="Save as draft"]' : '//button/div[text()="Publish now"]'

const thumbnailMode = GetEnvironmentVar('LOAD_THUMBNAIL', 'false')

const isExplicit = GetEnvironmentVar('IS_EXPLICIT', 'false')
const selectorForExplicitContentLabel = isExplicit == 'true' ? 'label[for="podcastEpisodeIsExplicit-true"]' : 'label[for="podcastEpisodeIsExplicit-false"]'

const urlDescription = GetEnvironmentVar('URL_IN_DESCRIPTION', 'false')

// Allow fine tunning of the converted audio file
// Example: "ffmpeg:-ac 1" for mono mp3
const postprocessorArgs = GetEnvironmentVar('POSTPROCESSOR_ARGS', "")
const postprocessorArgsCmd = postprocessorArgs == ""? "": `--postprocessor-args="${postprocessorArgs}"`

console.log('installing dependecies');
exec('sudo curl -k -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/youtube-dl && sudo chmod a+rx /usr/local/bin/youtube-dl && sudo npm i puppeteer --unsafe-perm=true --allow-root', (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);

    const youtubedl = require('youtube-dl');
    const puppeteer = require('puppeteer');
    let YT_IDs=[];
    try {
        if(url.includes('/video/')){
            const epConfJSON = JSON.parse(fs.readFileSync(pathToEpisodeJSON, 'utf-8'));

            const YT_ID = epConfJSON.id;
            YT_IDs.push(YT_ID)}
        else if (url.includes('/c/') || url.includes('/channel/')){
            const channelid=url.split('/')[-1]

            const dirPath = './videos/';

            const files = fs.readdirSync(dirPath);

            const arr = []
            files.forEach((val, i) => {
                const epConfJSON = JSON.parse(fs.readFileSync(path.join(dirPath, val), 'utf8'));
                const YT_ID = epConfJSON.id;
                const url = YT_URL + YT_ID;
                const pathToEpisodeJSON=pathToEpisodeJSONdir+YT_ID +'/episode.json'                
                const thumbnailOutputFileTemplate = `thumbnail.%(ext)s`
                const thumbnailOutputFile = `thumbnail.${THUMBNAIL_FORMAT}`

                youtubedl.getInfo(url, function (err, info) {
                    if (err) throw err;
                    epConfJSON.title = info.title;
                    epConfJSON.description = urlDescription !== 'false' ? info.description + '\n' + url : info.description;

                    console.log(`title: ${epConfJSON.title}`)
                    console.log(`description: ${epConfJSON.description}`)

                    const youtubeDlThumbnailCommand = `youtube-dl -o "${thumbnailOutputFileTemplate}" --skip-download --write-thumbnail --convert-thumbnails ${THUMBNAIL_FORMAT} ${url}`
                    console.log(`Thumbnail download command: ${youtubeDlThumbnailCommand}`)
                    const thumbnailDownloadStdout = execSync(youtubeDlThumbnailCommand)
                    console.log(`stdout: ${thumbnailDownloadStdout}`)

                    const youtubeDlCommand = `youtube-dl -o ${outputFile} -f bestaudio -x --force-overwrites --audio-format mp3 ${postprocessorArgsCmd} ${url}`;
                    console.log(`Download command: ${youtubeDlCommand}`)

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
                        const jsonEpisode = JSON.stringify(episode)
                        console.log(`-- episode.json: ${jsonEpisode}`);

                        (async () => {
                            console.log("Launching puppeteer");
                            const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
                            const page = await browser.newPage();

                            const navigationPromise = page.waitForNavigation();

                            await page.goto('https://anchor.fm/dashboard/episode/new');

                            await page.setViewport({ width: 1600, height: 789 });

                            await navigationPromise;

                            console.log("Trying to log in");
                            await page.type('#email', email);
                            await page.type('#password', password);
                            await page.click('button[type=submit]');
                            await navigationPromise;
                            console.log("Logged in");

                            await page.waitForSelector('input[type=file]');
                            console.log("Uploading audio file");
                            const inputFile = await page.$('input[type=file]');
                            await inputFile.uploadFile(outputFile);

                            console.log("Waiting for upload to finish");
                            await page.waitForTimeout(25 * 1000);

                            await page.waitForXPath('//div[contains(text(),"Save")]/parent::button[not(boolean(@disabled))]', { timeout: UPLOAD_TIMEOUT });
                            const [saveButton] = await page.$x('//div[contains(text(),"Save")]/parent::button[not(boolean(@disabled))]');
                            await saveButton.click();
                            await navigationPromise;

                            console.log("-- Adding title");
                            await page.waitForSelector('#title', { visible: true });
                            // Wait some time so any field refresh doesn't mess up with our input
                            await page.waitForTimeout(2000);
                            await page.type('#title', episode.title);

                            console.log("-- Adding description");
                            await page.waitForSelector('div[role="textbox"]', { visible: true });
                            await page.type('div[role="textbox"]', episode.description);

                            console.log("-- Selecting content type")
                            await page.waitForSelector(selectorForExplicitContentLabel, { visible: true})
                            const contentTypeLabel = await page.$(selectorForExplicitContentLabel)
                            await contentTypeLabel.click()

                            if (thumbnailMode !== 'false') {
                                console.log("-- Uploading episode art")
                                await page.waitForSelector('input[type=file][accept="image/*"]');
                                const inputEpisodeArt = await page.$('input[type=file][accept="image/*"]');
                                await inputEpisodeArt.uploadFile(thumbnailOutputFile);

                                console.log("-- Saving uploaded episode art")
                                await page.waitForXPath('//button/div[text()="Save"]')
                                const [saveEpisodeArtButton] = await page.$x('//button/div[text()="Save"]')
                                await saveEpisodeArtButton.click()
                                await page.waitForXPath('//div[@aria-label="image uploader"]', { hidden: true, timeout: UPLOAD_TIMEOUT})
                            }

                            console.log("-- Publishing");
                            const [button] = await page.$x(saveDraftOrPublishButtonXPath);

                            // If no button is found using label, try using css path
                            if (button) {
                                await button.click();
                            }
                            else {
                                await page.click('.styles__button___2oNPe.styles__purple___2u-0h.css-39f635');
                            }

                            await navigationPromise;
                            await browser.close()

                            return new Promise((resolve, reject) => resolve("yay"));
                        })().then(r => console.log(r), v => console.log(v));
                });
            });
        })

        }

    } catch (error) {
        throw error;
    }
});
