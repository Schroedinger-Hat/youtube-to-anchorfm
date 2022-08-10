const fs = require('fs');

const env = require('./environment-variables');
const youtube = require('./youtube-yt-dlp');
const anchorfm = require('./anchorfm-pupeteer');

function getYoutubeVideoId() {
    return JSON.parse(fs.readFileSync(env.EPISODE_PATH, 'utf-8')).id
}

async function main() {
    const youtubeVideoId = getYoutubeVideoId();
    const youtubeVideoInfo = await youtube.getVideoInfo(youtubeVideoId);
    console.log(`title: ${youtubeVideoInfo.title}`)
    console.log(`description: ${youtubeVideoInfo.description}`)

    console.log("Downloading thumbnail")
    await youtube.downloadThumbnail(youtubeVideoId);

    console.log("Downloading audio")
    await youtube.downloadAudio(youtubeVideoId);

    console.log("Posting episode to anchorfm");
    await anchorfm.postEpisode(youtubeVideoInfo);
}

main()
