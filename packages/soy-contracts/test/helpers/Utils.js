/**
 * Checks if an error is a truffle one
 *
 * @param {Error} error - The error
 * @returns {boolean} - If the error is an exception
 */
function isException(error) {
  const strError = error.toString();

  return (
    strError.includes('invalid opcode') ||
    strError.includes('invalid JUMP') ||
    strError.includes('revert')
  );
}

/**
 * Ensures that this is a valid truffle exception
 *
 * @param {Error} error - The error
 */
function ensureException(error) {
  assert(isException(error), error.toString());
}

module.exports = {
  zeroAddress: '0x0000000000000000000000000000000000000000',
  ensureException: ensureException
};
