const generatePassword = require('generate-password');

/**
 * Generate one or more passwords based on options
 * @param {Object} options
 * @param {number} options.length
 * @param {boolean} options.lowercase
 * @param {boolean} options.uppercase
 * @param {boolean} options.digits
 * @param {boolean} options.special
 * @param {string} options.excluded
 * @param {number} options.count
 * @returns {string[]}
 */
function generatePasswords(options) {
    const {
        length = 16,
        lowercase = true,
        uppercase = true,
        digits = true,
        special = true,
        excluded = '',
        count = 1
    } = options;
    return generatePassword.generateMultiple(count, {
        length,
        numbers: digits,
        lowercase,
        uppercase,
        symbols: special,
        excludeSimilarCharacters: false,
        exclude: excluded,
        strict: true
    });
}

module.exports = { generatePasswords }; 