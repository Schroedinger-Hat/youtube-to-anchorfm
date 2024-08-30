const fs = require('fs');
const { exit } = require('process');

const env = require('./environment-variables');
const { getVideoInfo, downloadThumbnail, downloadAudio } = require('./youtube-yt-dlp');
const { postEpisode } = require('./anchorfm-pupeteer');

function validateYoutubeVideoId(id) {
  if (id === undefined || id === null || typeof id !== 'string') {
    throw new Error('Id not present in JSON');
  }
}

function getYoutubeVideoId() {
  try {
    if (env.EPISODE_ID) {
      validateYoutubeVideoId(env.EPISODE_ID);
      return env.EPISODE_ID;
    }
    const json = JSON.parse(fs.readFileSync(env.EPISODE_PATH, 'utf-8'));
    validateYoutubeVideoId(json.id);
    return json.id;
  } catch (err) {
    throw new Error(`Unable to get youtube video id: ${err}, 
    please make sure that either the environment variable EPISODE_ID is set with valid id 
    or episode path is set correctly using t he environment variables EPISODE_PATH and EPISODE_FILE`);
  }
}

async function main() {
  const youtubeVideoId = getYoutubeVideoId();

  const youtubeVideoInfo = await getVideoInfo(youtubeVideoId);
  const { title, description, uploadDate } = youtubeVideoInfo;
  console.log(`title: ${title}`);
  console.log(`description: ${description}`);
  console.log(`Upload date: ${JSON.stringify(uploadDate)}`);

  await Promise.all([downloadThumbnail(youtubeVideoId), downloadAudio(youtubeVideoId)]);

  console.log('Posting episode to anchorfm');
  await postEpisode(youtubeVideoInfo);
}

main()
  .then(() => console.log('Finished successfully.'))
  .catch((err) => {
    console.error(err);
    exit(1);
  });
