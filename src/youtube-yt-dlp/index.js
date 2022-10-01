const youtubedl = require('youtube-dl-exec');
const env = require('../environment-variables');
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
    o: env.THUMBNAIL_FILE_TEMPLATE,
  };
}

function getDownloadAudioOptions() {
  const options = {
    ...youtubeDlOptions,
    f: 'bestaudio',
    x: true,
    forceOverwrites: true,
    audioFormat: AUDIO_FILE_FORMAT,
    o: env.AUDIO_FILE_TEMPLATE,
  };
  if (env.POSTPROCESSOR_ARGS.length > 0) {
    options.postprocessorArgs = env.POSTPROCESSOR_ARGS;
  }
  return options;
}

async function getVideoInfo(videoId) {
  console.log(`Getting JSON video info for video id ${videoId}`);
  try {
    const result = await youtubedl(getVideoUrl(videoId), {
      ...youtubeDlOptions,
      dumpSingleJson: true,
    });
    return {
      title: result.title,
      description: result.description,
      url: result.original_url,
      uploadDate: parseDate(result.upload_date),
    };
  } catch (err) {
    throw new Error(`Unable to get video info: ${err}`);
  }
}

function parseDate(date) {
  const monthAsWord = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    10: 'Oct',
    11: 'Nov',
    12: 'Dec',
  };

  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);

  return { year, month: monthAsWord[month], day };
}

async function downloadThumbnail(videoId) {
  console.log(`Downloading thumbnail for video id ${videoId}`);
  try {
    await youtubedl(getVideoUrl(videoId), getDownloaThumbnailOptions());
    console.log(`Downloaded thumbnail for video id ${videoId}`);
  } catch (err) {
    throw new Error(`Unable to download video thumbnail: ${err}`);
  }
}

async function downloadAudio(videoId) {
  console.log(`Downloading audio for video id ${videoId}`);
  try {
    await youtubedl(getVideoUrl(videoId), getDownloadAudioOptions());
    console.log(`Downloaded audio for video id ${videoId}`);
  } catch (err) {
    throw new Error(`Unable to download audio: ${err}`);
  }
}

module.exports = {
  getVideoInfo,
  downloadThumbnail,
  downloadAudio,
};
