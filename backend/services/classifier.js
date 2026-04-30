/**
 * ML Classifier Service Client
 * Calls the Python Flask ML service via HTTP instead of spawning a local process.
 */

class Classifier {
    constructor() {
        this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5002';
    }

    async classify(text) {
        const fallback = { prediction: 'Genuine', label: 0, confidence: 0.5, is_authentic: true };

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(`${this.mlServiceUrl}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ review: text }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                console.error(`ML service returned ${response.status}`);
                return fallback;
            }

            return await response.json();
        } catch (err) {
            console.error('ML service error:', err.message);
            return fallback;
        }
    }
}

module.exports = new Classifier();
