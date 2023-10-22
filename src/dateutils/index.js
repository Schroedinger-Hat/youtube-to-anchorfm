const monthsAsWord = {
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

const monthsAsFullWord = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  10: 'October',
  11: 'November',
  12: 'December',
};

const monthsAsNumber = {
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
};

function getMonthAsNumber(month) {
  return monthsAsNumber[month.toLowerCase()];
}

/**
 * Parses dates of the form `20231022`(year 2023, month 10(October), day 22)
 * @param date
 * @returns {{month: *, year: string, monthAsNumber: string, monthAsFullWord: *, day: string}}
 */
function parseDate(date) {
  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);

  return { year, month: monthsAsWord[month], monthAsNumber: month, monthAsFullWord: monthsAsFullWord[month], day };
}

function getMonthAsFullWord(monthAsNumber) {
  return monthsAsFullWord[monthAsNumber];
}

/**
 * Compare dates of the form 'October 2023'
 * Example: if date1 is 'October 2023' and date2 is 'December 2023' the function will return 0
 * @param date1
 * @param date2
 * @return -1 if date1 is before date2, 0 if date1 is equal to date2, 1 if date1 is after date2
 */
function compareDates(date1, date2) {
  const date1AsNumber = getDateAsNumber(date1);
  const date2AsNumber = getDateAsNumber(date2);
  if (date1AsNumber < date2AsNumber) {
    return -1;
  }
  if (date1AsNumber === date2AsNumber) {
    return 0;
  }
  return 1;
}

/**
 * Gets date of the form 'October 2023' as number
 * Example: 'October 2023' is 202310
 * Example: 'June 2022' is 202206
 * @param date
 */
function getDateAsNumber(date) {
  const [monthAsFullWord, year] = date.split(' ');
  const monthAsNumber = getMonthAsNumber(monthAsFullWord);
  return parseInt(`${year}${monthAsNumber}`, 10);
}

module.exports = {
  parseDate,
  getMonthAsFullWord,
  compareDates,
};
