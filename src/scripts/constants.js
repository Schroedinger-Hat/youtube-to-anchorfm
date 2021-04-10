const SOURCE_FOLDER = "src";
const INPUT_FOLDER = SOURCE_FOLDER + "/input";

// Spanish compatible
const SPAIN_SPANISH = "es-es";
const AMERICAN_SPANISH = "es-us";
const PORTUGUESE = "pt";
const ITALIAN = "it";

// English compatible
const GB_ENGLISH = "en";
const AMERICAN_ENGLISH = "en-us";
const AUTRALIAN_ENGLISH = "en-au";

module.exports = {
  INPUT_FOLDER,
  BACKUP_FOLDER: "../thenursewhocoded",
  OUTPUT_FOLDER: `${SOURCE_FOLDER}/output`,
  SONGS_FOLDER: "../songs",

  AUDIO_EXTENSION: "mp3",
  JSON_EXTENSION: "json",
  MD_EXTENSION: "md",
  UTF_8: "utf8",

  getVoices: (lang) =>
    ({
      es: {
        INTRO: PORTUGUESE,
        NARRATOR: SPAIN_SPANISH,
        DIALOGUE: AMERICAN_SPANISH,
      },
      en: {
        INTRO: AUTRALIAN_ENGLISH,
        NARRATOR: GB_ENGLISH,
        DIALOGUE: AMERICAN_ENGLISH,
      },
    }[lang || "en"]),
  DELIMITERS: {
    GIF: "%[",
    TITLE: "##",
  },
};
