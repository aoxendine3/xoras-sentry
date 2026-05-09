/**
 * Calculate the Shannon entropy of a string.
 */
function calculateEntropy(str) {
    const len = str.length;
    if (len === 0) return 0;
    const frequencies = {};
    for (let i = 0; i < len; i++) {
        const char = str[i];
        frequencies[char] = (frequencies[char] || 0) + 1;
    }
    let entropy = 0;
    for (const char in frequencies) {
        const p = frequencies[char] / len;
        entropy -= p * Math.log2(p);
    }
    return entropy;
}

/**
 * Audit content for high-entropy 'Zombie' strings.
 */
function auditEntropy(content, relativePath, hardcodedSecrets) {
    // Regex for strings in quotes (20-100 chars)
    const stringRegex = /['"]([a-zA-Z0-9+/=]{20,100})['"]/g;
    let match;

    const lines = content.split('\n');
    lines.forEach((line, i) => {
        while ((match = stringRegex.exec(line)) !== null) {
            const str = match[1];
            const entropy = calculateEntropy(str);
            
            // Threshold: 4.0 bits (High randomness)
            // Exclude common file paths/names
            if (entropy > 4.0 && !str.includes('/') && !str.includes('\\')) {
                hardcodedSecrets.push({
                    file: relativePath,
                    type: `POTENTIAL_ZOMBIE (Entropy: ${entropy.toFixed(2)})`,
                    line: i + 1
                });
            }
        }
    });
}

module.exports = { auditEntropy };
