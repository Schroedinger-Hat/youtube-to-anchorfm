module.exports = (text, filename, voice, callback) => {
  const gTTS = require("gtts");

  console.log(`[${filename}] (${voice}): ${text}`); //
  callback(); //TODO: Create a mock for this script, for dev use
  /* new gTTS(text, voice).save(filename, (error, _) => {
    if (error) {
      throw new Error(error);
    }
    console.log(`${filename} segment transformed.`);
    callback();
  }); */
};
