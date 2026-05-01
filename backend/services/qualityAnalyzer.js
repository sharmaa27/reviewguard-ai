class QualityAnalyzer {
    constructor() {
        this.spamPhrases = [
            'buy now', 'best ever', 'must buy', 'worst ever', 'amazing amazing',
            'perfect perfect', 'love love', 'great great', 'highly recommend',
            'waste of money', 'total waste', 'don\'t buy', 'do not buy',
            '100 stars', '10 stars', 'best purchase', 'worst purchase',
            'changed my life', 'life changing', 'you won\'t regret',
            'i would give 100', 'everyone must', 'everyone should',
            'absolutely incredible', 'absolutely terrible', 'totally awesome',
            'super amazing', 'best thing ever', 'worst thing ever'
        ];

        this.genuineIndicators = [
            'after using', 'after a week', 'after a month', 'months later',
            'battery life', 'build quality', 'customer service', 'delivery',
            'fits well', 'runs small', 'runs large', 'comfortable',
            'compared to', 'upgrade from', 'previous version', 'however',
            'downside', 'only complaint', 'minor issue', 'wish it had',
            'for the price', 'worth the money', 'overpriced', 'good value',
            'day to day', 'daily use', 'everyday', 'commute', 'workout',
            'setup was', 'installation', 'instructions', 'packaging'
        ];
    }

    analyzeQuality(text) {
        const lower = text.toLowerCase().trim();
        const words = lower.split(/\s+/);
        const wordCount = words.length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

        const issues = [];
        let qualityScore = 1.0; 

        if (wordCount < 5) {
            issues.push('Extremely short review');
            qualityScore -= 0.5;
        } else if (wordCount < 10) {
            issues.push('Very short review - lacks detail');
            qualityScore -= 0.3;
        } else if (wordCount < 15) {
            issues.push('Short review');
            qualityScore -= 0.1;
        }

        const uniqueWords = new Set(words.map(w => w.replace(/[^a-z]/g, '')).filter(w => w.length > 2));
        const uniqueRatio = uniqueWords.size / Math.max(wordCount, 1);
        if (uniqueRatio < 0.4 && wordCount > 5) {
            issues.push('Highly repetitive text');
            qualityScore -= 0.35;
        } else if (uniqueRatio < 0.55 && wordCount > 5) {
            issues.push('Repetitive language');
            qualityScore -= 0.15;
        }

        const exclamationCount = (text.match(/!/g) || []).length;
        const capsRatio = (text.replace(/[^A-Za-z]/g, '').match(/[A-Z]/g) || []).length / 
                          Math.max((text.replace(/[^A-Za-z]/g, '').length), 1);
        
        if (exclamationCount > 3) {
            issues.push('Excessive exclamation marks');
            qualityScore -= 0.15;
        }
        if (capsRatio > 0.5 && wordCount > 3) {
            issues.push('Excessive capitalization');
            qualityScore -= 0.15;
        }

        let spamHits = 0;
        for (const phrase of this.spamPhrases) {
            if (lower.includes(phrase)) spamHits++;
        }
        if (spamHits >= 3) {
            issues.push('Multiple spam phrases detected');
            qualityScore -= 0.4;
        } else if (spamHits >= 1) {
            issues.push('Contains common spam language');
            qualityScore -= 0.15;
        }

        const hasNumbers = /\d/.test(text);
        const hasSpecificDetails = this.genuineIndicators.some(ind => lower.includes(ind));
        const hasProductFeatures = /(?:quality|size|color|weight|speed|performance|screen|sound|taste|smell|texture|material|design|price)/i.test(text);
        
        const specificityScore = (hasNumbers ? 1 : 0) + (hasSpecificDetails ? 1 : 0) + (hasProductFeatures ? 1 : 0);
        
        if (specificityScore === 0 && wordCount < 20) {
            issues.push('No specific details about the product');
            qualityScore -= 0.25;
        }

        const sentimentWords = lower.match(/\b(good|great|bad|terrible|awesome|horrible|amazing|awful|love|hate|best|worst|perfect|excellent|fantastic|wonderful|nice|fine|okay)\b/g) || [];
        const sentimentRatio = sentimentWords.length / Math.max(wordCount, 1);
        
        if (sentimentRatio > 0.4 && wordCount < 20) {
            issues.push('All opinion, no substance');
            qualityScore -= 0.2;
        }

        if (hasSpecificDetails) qualityScore += 0.1;
        if (sentences.length >= 3 && wordCount >= 25) qualityScore += 0.1;
        if (hasNumbers && hasProductFeatures) qualityScore += 0.1;

        qualityScore = Math.max(0, Math.min(1, qualityScore));

        return {
            qualityScore,
            wordCount,
            uniqueRatio: Math.round(uniqueRatio * 100),
            sentimentRatio: Math.round(sentimentRatio * 100),
            specificityScore,
            spamHits,
            issues,
            isLowQuality: qualityScore < 0.5
        };
    }

    combinedVerdict(mlResult, qualityResult) {
        const mlConfidence = mlResult.confidence || 0.5;
        const mlIsAuthentic = mlResult.is_authentic;
        const qualityScore = qualityResult.qualityScore;

        const combinedScore = (qualityScore * 0.4) + (mlIsAuthentic ? mlConfidence * 0.6 : (1 - mlConfidence) * 0.6);

        let isAuthentic;
        let confidence;
        let reason;

        if (qualityResult.isLowQuality && qualityScore < 0.3) {
            isAuthentic = false;
            confidence = Math.max(0.6, 1 - qualityScore);
            reason = 'Low quality: ' + qualityResult.issues.slice(0, 2).join(', ');
        } else if (qualityResult.isLowQuality && mlIsAuthentic) {
            isAuthentic = false;
            confidence = 0.55 + (1 - qualityScore) * 0.2;
            reason = 'Insufficient quality: ' + qualityResult.issues[0];
        } else if (!mlIsAuthentic) {
            isAuthentic = false;
            confidence = mlConfidence;
            reason = 'ML detected as potentially fake';
        } else if (qualityScore >= 0.7 && mlIsAuthentic) {
            isAuthentic = true;
            confidence = Math.min(0.95, (qualityScore + mlConfidence) / 2);
            reason = 'Passed all checks';
        } else {
            isAuthentic = qualityScore >= 0.5;
            confidence = combinedScore;
            reason = isAuthentic ? 'Passed with moderate confidence' : 'Borderline quality';
        }

        return {
            isAuthentic,
            confidence: Math.round(confidence * 100) / 100,
            prediction: isAuthentic ? 'Genuine' : 'Fake',
            reason,
            layers: {
                ml: { prediction: mlResult.prediction, confidence: Math.round(mlConfidence * 100) },
                quality: { score: Math.round(qualityScore * 100), issues: qualityResult.issues }
            }
        };
    }
}

module.exports = new QualityAnalyzer();