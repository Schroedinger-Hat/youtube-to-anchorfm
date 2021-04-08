module.exports = (bookCode, filenames, outputFilename) => {
  const ffmpeg = require("fluent-ffmpeg");

  const { deleteFile } = require("./fileSystemOperator");
  const { OUTPUT_FOLDER } = require("./constants");

  const FFMPEG_TEMP_FOLDER = "ffmpeg_temp";
  const TEMP_FOLDER = `${OUTPUT_FOLDER}/${bookCode}/${FFMPEG_TEMP_FOLDER}`;

  const ffmpegInstanceWithInputs = filenames.reduce(
    (accumulator, filename) => accumulator.input(filename),
    ffmpeg()
  );

  ffmpegInstanceWithInputs
    .on("start", (/* commandLine */) => {
      console.log("Starting audio files merge...");
      // console.log("commandLine", commandLine);
    })
    .on("error", ({ message }) => {
      console.log(`An error occurred: ${message}`);
    })
    .on("end", () => {
      console.log("Audio files merged succesfully!");
      filenames.forEach(
        (filename) => filename.includes("/songs/") || deleteFile(filename)
      );
    })
    .mergeToFile(outputFilename, TEMP_FOLDER);
};
