const he = require('he');



function detectOperation(text) {
  // Check if text contains HTML entities
  const hasHtmlEntities = /&[a-zA-Z]+;|&#\d+;/.test(text);
  
  if (hasHtmlEntities) {
    return 'decode';
  } else {
    return 'encode';
  }
}

function extractEntities(text, operation) {
  const entities = [];
  
  if (operation === 'encode') {
    // For encoding, we'll show what characters will be encoded
    const specialChars = /[&<>"'©®™€£¥¢°±×÷≠≤≥∞√∑∏∫α-ωΑ-Ω–—…•·‹›«»‾←→↑↓↔⇐⇒⇑⇓⇔♠♣♥♦]/g;
    const matches = text.match(specialChars);
    if (matches) {
      const charCount = {};
      matches.forEach(char => {
        charCount[char] = (charCount[char] || 0) + 1;
      });
      
      for (const [char, count] of Object.entries(charCount)) {
        const encoded = he.encode(char, { useNamedReferences: true });
        entities.push({
          character: char,
          entity: encoded,
          count: count
        });
      }
    }
  } else if (operation === 'decode') {
    // For decoding, extract all HTML entities found
    const entityRegex = /&[a-zA-Z]+;|&#\d+;/g;
    const matches = text.match(entityRegex);
    if (matches) {
      const entityCount = {};
      matches.forEach(entity => {
        entityCount[entity] = (entityCount[entity] || 0) + 1;
      });
      
      for (const [entity, count] of Object.entries(entityCount)) {
        const decoded = he.decode(entity);
        entities.push({
          entity: entity,
          character: decoded,
          count: count
        });
      }
    }
  }
  
  return entities;
}

function processHtmlText(input, operation = 'auto') {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }
  
  // Auto-detect operation if not specified
  if (operation === 'auto') {
    operation = detectOperation(input);
  }
  
  let output, entities;
  
  if (operation === 'encode') {
    output = he.encode(input, { useNamedReferences: true });
    entities = extractEntities(input, 'encode');
  } else if (operation === 'decode') {
    output = he.decode(input);
    entities = extractEntities(input, 'decode');
  } else {
    throw new Error('Invalid operation. Must be "encode", "decode", or "auto"');
  }
  
  return {
    input: input,
    output: output,
    operation: operation,
    entities: entities,
    entityCount: entities.length
  };
}

module.exports = {
  processHtmlText,
  detectOperation,
  extractEntities
}; 