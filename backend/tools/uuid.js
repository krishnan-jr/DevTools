const { v1: uuidv1, v4: uuidv4, v7: uuidv7 } = require('uuid');

/**
 * Generate one or more UUIDs based on options
 * @param {Object} options
 * @param {boolean} options.hyphens
 * @param {boolean} options.uppercase
 * @param {string} options.version ('v1'|'v4'|'v7')
 * @param {number} options.count
 * @returns {string[]}
 */
function generateUUIDs(options) {
    const {
        hyphens = true,
        uppercase = false,
        version = 'v4',
        count = 1
    } = options;
    let fn;
    if (version === 'v1') fn = uuidv1;
    else if (version === 'v7') fn = uuidv7;
    else fn = uuidv4;
    return Array.from({ length: count }, () => {
        let uuid = fn();
        if (!hyphens) uuid = uuid.replace(/-/g, '');
        if (uppercase) uuid = uuid.toUpperCase();
        return uuid;
    });
}

module.exports = { generateUUIDs }; 