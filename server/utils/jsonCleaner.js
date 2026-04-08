const extractJSON = (text) => {
  try {
    // Remove common Gemini markdown patterns
    let cleaned = text
      .replace(/```(?:json)?[\s\n]*|[\s\n]*```/g, '')
      .replace(/^\s*[\[\{].*[\]\}]\s*$/s, '$1')
      .trim();
    
    // Try JSON.parse
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('JSON extract error:', error.message);
    throw new Error('Invalid JSON from Gemini');
  }
};

module.exports = { extractJSON };

