const assembleChapter = require("./src/scripts/chapterAssembler");

const keys = ["blogCode", "postCode", "lang"];
const { blogCode, postCode, lang } = process.argv
  .slice(2)
  .reduce((accumulator, item, index) => {
    accumulator[keys[index]] = item;
    return accumulator;
  }, {});

assembleChapter(blogCode, postCode, lang || "en");
