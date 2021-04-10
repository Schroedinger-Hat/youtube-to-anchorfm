const fs = require("fs");

exports.readFile = (filename, callback) => {
  const { UTF_8 } = require("./constants");

  fs.readFile(filename, UTF_8, (error, text) => {
    if (error) {
      throw new Error(error);
    }

    callback(text);
  });
};

exports.readFolder = (path, callback) => {
  fs.readdir(path, (error, files) => {
    if (error) {
      throw new Error(error);
    }

    callback(files);
  });
};

exports.deleteFile = (file) => {
  try {
    fs.unlinkSync(file); //TODO: Create a mock for this script, for dev use
    //console.log(`${file} deleted.`);
  } catch (error) {
    console.error(error);
  }
};
