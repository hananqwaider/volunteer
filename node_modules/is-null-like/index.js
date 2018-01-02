/**
 * @method isNullLike
 * @param value {Object|*} return true if the given object is `null` or `undefined`
 * @returns {boolean}
 */
module.exports = function isNullLike( value ) {
  return value === null || typeof value === 'undefined';
};
