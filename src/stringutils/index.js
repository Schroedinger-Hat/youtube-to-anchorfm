/**
 * Check if trimmed string value is empty.
 * Note: If value is not type of string, it is considered empty
 * @param value
 * @returns {boolean}
 */
function isEmpty(value) {
  if (value === undefined || value === null || typeof value !== 'string') {
    return true;
  }

  const trimmedValue = value.trim();
  return trimmedValue === '';
}

module.exports = {
  isEmpty,
};
