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
 * Audit content for high-entropy 'Zombie' credential strings.
 * Constrained by syntax heuristics to avoid false positives on SVGs, CSS classes, and UUIDs.
 */
function auditEntropy(content, relativePath, hardcodedSecrets) {
    // Targeted Regex: Only evaluate entropy when string is assigned to or keyed by credential-related tokens
    const assignmentRegex = /(?:key|secret|token|password|auth|credential|api|private|hash|signature)[\w\s.:='"]{0,30}['"]([a-zA-Z0-9+/=_-]{24,100})['"]/gi;
    let match;

    const lines = content.split('\n');
    lines.forEach((line, i) => {
        // Skip obvious comments, markdown headers, and SVG paths
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('#')) return;
        if (line.includes('<path') || line.includes('d="M') || line.includes('fill="')) return;

        while ((match = assignmentRegex.exec(line)) !== null) {
            const str = match[1];
            // Exclude common file paths, URLs, and CSS definitions
            if (str.includes('/') || str.includes('\\') || str.includes(' ')) continue;

            const entropy = calculateEntropy(str);
            
            // Threshold: 4.2 bits of Shannon entropy on credential assignments
            if (entropy > 4.2) {
                if (!hardcodedSecrets.some(s => s.file === relativePath && s.line === i + 1)) {
                    hardcodedSecrets.push({
                        file: relativePath,
                        type: `POTENTIAL_HIGH_ENTROPY_SECRET (Entropy: ${entropy.toFixed(2)})`,
                        line: i + 1,
                        trace: `High randomness string detected in credential assignment: ${str.slice(0, 8)}...`
                    });
                }
            }
        }
    });
}

module.exports = { auditEntropy, calculateEntropy };
