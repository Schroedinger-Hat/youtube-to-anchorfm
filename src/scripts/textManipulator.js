const replaceAll = (string, search, replacement) =>
  string.split(search).join(replacement);

//TODO: replace emojis: ie {^^U}

const replaceUrlLinks = (text) => {
  const result = text
    .split("\n")
    .map((item) => (item[0] === "%" ? "" : item))
    .join("")
    .split("[")
    .map((item) => {
      if (item.includes("](")) {
        const splitedByLinkDelimiter = item.split("](");
        const splitedByParenthesis = splitedByLinkDelimiter[1].split(")");
        splitedByParenthesis.shift();

        return `${splitedByLinkDelimiter[0]}${
          splitedByParenthesis.length > 0 ? splitedByParenthesis.join(")") : ""
        }`;
      }

      return item;
    })
    .join("");

  return result;
};

exports.getTextArrayFormatted = (text) =>
  replaceAll(
    replaceAll(
      replaceAll(
        replaceAll(replaceUrlLinks(text), "»", "-"),
        "–",
        "-"
      ) /* Unify dialogue delimiters */,
      /\*{4,}/ /* Reduce asterisk delimiters to avoid repetitive voice */,
      "***"
    ),
    /(?<=[A-z])\-(?=[A-z])/,
    "..." /* Gets "-"" used to express stuttering and replace them by "..." to avoid confusion with dialogue delimiters */
  ).split("\r");
