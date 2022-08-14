const fs = require('fs');

const env = require('./environment-variables');
const {getVideoInfo, downloadThumbnail, downloadAudio} = require('./youtube-yt-dlp');
const {postEpisode} = require('./anchorfm-pupeteer');

function getYoutubeVideoId() {
    return JSON.parse(fs.readFileSync(env.EPISODE_PATH, 'utf-8')).id
}

async function main() {
    const youtubeVideoId = getYoutubeVideoId();

    const youtubeVideoInfo = await getVideoInfo(youtubeVideoId);
    const {title, description} = youtubeVideoInfo;
    console.log(`title: ${title}`)
    console.log(`description: ${description}`)

    console.log("Downloading thumbnail")
    await downloadThumbnail(youtubeVideoId);

    console.log("Downloading audio")
    await downloadAudio(youtubeVideoId);

    console.log("Posting episode to anchorfm");
    await postEpisode(youtubeVideoInfo);
}

main()
