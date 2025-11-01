/**
 * WiFi Security Analysis Utilities
 * Categorizes and explains WiFi security capabilities
 */
export var SecurityStrength;
(function (SecurityStrength) {
    SecurityStrength["EXCELLENT"] = "EXCELLENT";
    SecurityStrength["GOOD"] = "GOOD";
    SecurityStrength["MODERATE"] = "MODERATE";
    SecurityStrength["WEAK"] = "WEAK";
    SecurityStrength["VULNERABLE"] = "VULNERABLE";
    SecurityStrength["OPEN"] = "OPEN";
})(SecurityStrength || (SecurityStrength = {}));
/**
 * Parse WiFi capability string and extract security details
 */
export function parseCapabilities(capabilities) {
    if (!capabilities || capabilities.trim() === '') {
        return {
            strength: SecurityStrength.OPEN,
            protocol: 'Open',
            encryption: [],
            keyManagement: [],
            issues: ['No encryption - all traffic is visible'],
            score: 0,
            description: 'Open network with no security',
            color: '#ef4444',
            capabilities: ''
        };
    }
    const caps = capabilities.toUpperCase();
    const analysis = {
        strength: SecurityStrength.MODERATE,
        protocol: 'Unknown',
        encryption: [],
        keyManagement: [],
        issues: [],
        score: 50,
        description: '',
        color: '#f59e0b',
        capabilities
    };
    // Detect protocol version
    if (caps.includes('WPA3')) {
        analysis.protocol = 'WPA3';
        analysis.score = 95;
    }
    else if (caps.includes('WPA2') || caps.includes('RSN')) {
        analysis.protocol = 'WPA2';
        analysis.score = 75;
    }
    else if (caps.includes('WPA')) {
        analysis.protocol = 'WPA';
        analysis.score = 50;
        analysis.issues.push('WPA1 is deprecated and vulnerable');
    }
    else if (caps.includes('WEP')) {
        analysis.protocol = 'WEP';
        analysis.score = 10;
        analysis.issues.push('WEP is broken and easily cracked');
    }
    // Detect encryption methods
    if (caps.includes('GCMP-256')) {
        analysis.encryption.push('GCMP-256');
        analysis.score += 5;
    }
    else if (caps.includes('GCMP')) {
        analysis.encryption.push('GCMP');
        analysis.score += 3;
    }
    if (caps.includes('CCMP-256')) {
        analysis.encryption.push('CCMP-256');
        analysis.score += 3;
    }
    else if (caps.includes('CCMP')) {
        analysis.encryption.push('CCMP (AES)');
        analysis.score += 2;
    }
    if (caps.includes('TKIP')) {
        analysis.encryption.push('TKIP');
        analysis.score -= 15;
        analysis.issues.push('TKIP is deprecated and vulnerable to attacks');
    }
    // Detect key management
    if (caps.includes('SAE')) {
        analysis.keyManagement.push('SAE (WPA3)');
        analysis.score += 10;
    }
    if (caps.includes('PSK')) {
        analysis.keyManagement.push('PSK (Pre-Shared Key)');
    }
    if (caps.includes('EAP')) {
        analysis.keyManagement.push('EAP (Enterprise)');
        analysis.score += 5;
    }
    if (caps.includes('OWE')) {
        analysis.keyManagement.push('OWE (Opportunistic Wireless Encryption)');
        analysis.score += 5;
    }
    // Check for specific vulnerabilities
    if (caps.includes('WPS')) {
        analysis.issues.push('WPS enabled - vulnerable to brute force attacks');
        analysis.score -= 10;
    }
    // Determine overall strength
    analysis.score = Math.max(0, Math.min(100, analysis.score));
    if (analysis.score >= 90) {
        analysis.strength = SecurityStrength.EXCELLENT;
        analysis.color = '#10b981';
        analysis.description = 'Excellent security with modern encryption';
    }
    else if (analysis.score >= 70) {
        analysis.strength = SecurityStrength.GOOD;
        analysis.color = '#3b82f6';
        analysis.description = 'Good security with strong encryption';
    }
    else if (analysis.score >= 50) {
        analysis.strength = SecurityStrength.MODERATE;
        analysis.color = '#f59e0b';
        analysis.description = 'Moderate security - consider upgrading';
    }
    else if (analysis.score >= 20) {
        analysis.strength = SecurityStrength.WEAK;
        analysis.color = '#f97316';
        analysis.description = 'Weak security - vulnerable to attacks';
    }
    else {
        analysis.strength = SecurityStrength.VULNERABLE;
        analysis.color = '#ef4444';
        analysis.description = 'Highly vulnerable - immediate upgrade recommended';
    }
    return analysis;
}
/**
 * Get human-readable explanation of security terms
 */
export function explainSecurityTerm(term) {
    const explanations = {
        'WPA3': 'Latest WiFi security standard with improved encryption and protection',
        'WPA2': 'Strong WiFi security standard, industry standard since 2004',
        'WPA': 'Original WiFi Protected Access - deprecated and vulnerable',
        'WEP': 'Wired Equivalent Privacy - broken encryption, easily cracked',
        'CCMP': 'AES-based encryption protocol - secure and recommended',
        'CCMP-256': 'AES-256 encryption - highest security level',
        'GCMP': 'Galois/Counter Mode Protocol - WPA3 encryption method',
        'GCMP-256': 'AES-256 with GCMP - highest WPA3 security',
        'TKIP': 'Temporal Key Integrity Protocol - deprecated, vulnerable',
        'PSK': 'Pre-Shared Key - password-based authentication',
        'SAE': 'Simultaneous Authentication of Equals - WPA3 password method',
        'EAP': 'Extensible Authentication Protocol - enterprise authentication',
        'OWE': 'Opportunistic Wireless Encryption - enhanced open network security',
        'WPS': 'WiFi Protected Setup - convenience feature with security risks',
        'RSN': 'Robust Security Network - another name for WPA2',
        'ESS': 'Extended Service Set - standard infrastructure mode',
        'IBSS': 'Independent Basic Service Set - ad-hoc/peer-to-peer mode'
    };
    return explanations[term] || term;
}
/**
 * Categorize all networks by security strength
 */
export function categorizeNetworksBySecurity(networks) {
    const categories = {
        [SecurityStrength.EXCELLENT]: 0,
        [SecurityStrength.GOOD]: 0,
        [SecurityStrength.MODERATE]: 0,
        [SecurityStrength.WEAK]: 0,
        [SecurityStrength.VULNERABLE]: 0,
        [SecurityStrength.OPEN]: 0
    };
    networks.forEach(network => {
        const analysis = parseCapabilities(network.capabilities);
        categories[analysis.strength]++;
    });
    return categories;
}
