module.exports = (blogCode, postCode, lang) => {
  const { readFile } = require("./fileSystemOperator");
  const { getTextArrayFormatted } = require("./textManipulator");
  const { isOdd } = require("./mathUtils");
  const generateVoiceFile = require("./voiceGenerator");
  const combineVoiceFiles = require("./audioFilesCombinator");

  const {
    TXT_EXTENSION,
    MD_EXTENSION,
    INPUT_FOLDER,
    BACKUP_FOLDER,
    SONGS_FOLDER,
    OUTPUT_FOLDER,
    AUDIO_EXTENSION,
    getVoices,
    DELIMITERS,
  } = require("./constants");
  let VOICES = getVoices(lang);

  const codeFilename = `${INPUT_FOLDER}/${blogCode}/${postCode}-code.${TXT_EXTENSION}`;
  readFile(codeFilename, (code) => {
    const filename = `${BACKUP_FOLDER}/${code}.${MD_EXTENSION}`;
    readFile(filename, (text) => {
      console.log(`${filename} read succesfully.`);

      const getSongPath = (name) =>
        `${INPUT_FOLDER}/${blogCode}/${SONGS_FOLDER}/${name}.${AUDIO_EXTENSION}`;
      const openingSong = getSongPath("opening");
      const closureSong = getSongPath("closure");

      let segmentsFilenames = [openingSong];

      let currentVoiceIndex = 0;
      const formattedTextArray = getTextArrayFormatted(text).reduce(
        (accumulator, item) => {
          if (
            item.trim().length > 0 &&
            item.substring(0, 2) !== DELIMITERS.GIF
          ) {
            let voice = VOICES.NARRATOR;
            const length = item.length;
            const firstLetter = item[0];
            const dialogueStartDelimiter = /(?<= )\-/;

            const startsWith = (word) =>
              length > word.length && item.substring(0, word.length) === word;

            if (firstLetter === "*" || startsWith(DELIMITERS.TITLE)) {
              voice = VOICES.INTRO;
            } else if (
              firstLetter === "-" ||
              dialogueStartDelimiter.test(item)
            ) {
              voice = VOICES.DIALOGUE[currentVoiceIndex];
              currentVoiceIndex = currentVoiceIndex === 0 ? 1 : 0;
            }

            const subSegmentArray = item.split("-");

            subSegmentArray.forEach((subSegmentItem, index) => {
              if (subSegmentItem.trim().length > 0) {
                accumulator.push({
                  text: subSegmentItem,
                  voice:
                    subSegmentArray.length === 1 || isOdd(index)
                      ? voice
                      : VOICES.NARRATOR,
                });
              }
            });
          }

          return accumulator;
        },
        []
      );

      let formattedTextIndex = 0;

      const iterate = () => {
        const callback = () => {
          formattedTextIndex++;

          if (formattedTextIndex < formattedTextArray.length) {
            iterate();
          } else {
            // End of iteration
            segmentsFilenames.push(closureSong);

            combineVoiceFiles(
              blogCode,
              segmentsFilenames,
              `${OUTPUT_FOLDER}/${filename}.${AUDIO_EXTENSION}`
            );
          }
        };

        const segment = formattedTextArray[formattedTextIndex];
        const segmentFilename = `${filename}_${formattedTextIndex}`;
        const segmentFilePath = `${OUTPUT_FOLDER}/${segmentFilename}.${AUDIO_EXTENSION}`;
        segmentsFilenames.push(segmentFilePath);

        generateVoiceFile(
          segment.text,
          segmentFilePath,
          segment.voice,
          callback
        );
      };

      iterate();
    });
  });
};
