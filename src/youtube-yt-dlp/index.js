const env = require('../environment-variables');
const youtubedl = require('youtube-dl-exec');
const { AUDIO_FILE_FORMAT, THUMBNAIL_FILE_FORMAT } = require('../environment-variables');

const youtubeDlOptions = {
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
};

function getVideoUrl(videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
}

function getDownloaThumbnailOptions() {
    return {
        ...youtubeDlOptions,
        skipDownload: true,
        writeThumbnail: true,
        convertThumbnail: THUMBNAIL_FILE_FORMAT,
        o: env.THUMBNAIL_FILE_TEMPLATE
    };
}

function getDownloadAudioOptions() {
    const options = {
        ...youtubeDlOptions,
        f: "bestaudio",
        x: true,
        forceOverwrites: true,
        audioFormat: AUDIO_FILE_FORMAT,
        o: env.AUDIO_FILE_TEMPLATE,
    }
    if(env.POSTPROCESSOR_ARGS.length > 0) {
        options.postprocessorArgs = env.POSTPROCESSOR_ARGS;
    }
    return options;
}

async function getVideoInfo(videoId) {
    try {
        return await youtubedl(getVideoUrl(videoId), {
            ...youtubeDlOptions,
            dumpSingleJson: true
        });
    } catch (err) {
        throw new Error(`Unable to get video info: ${err}`);
    }
}

async function downloadThumbnail(videoId) {
    try {
        await youtubedl(getVideoUrl(videoId), getDownloaThumbnailOptions());
    } catch (err) {
        throw new Error(`Unable to download video thumbnail: ${err}`);
    }
}

async function downloadAudio(videoId) {
    try {
        await youtubedl(getVideoUrl(videoId), getDownloadAudioOptions());
    } catch (err) {
        throw new Error(`Unable to download audio: ${err}`);
    }
}

module.exports = {
    getVideoInfo,
    downloadThumbnail,
    downloadAudio
};
