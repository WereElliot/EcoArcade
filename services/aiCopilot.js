// EcoArcade AI Copilot Service (OpenAI Integration)
// Implements key rotation using the provided keys

const OPENAI_KEYS = [
    "sk-abcdef1234567890abcdef1234567890abcdef12",
    "sk-1234567890abcdef1234567890abcdef12345678",
    "sk-abcdefabcdefabcdefabcdefabcdefabcdef12",
    "sk-7890abcdef7890abcdef7890abcdef7890abcd",
    "sk-1234abcd1234abcd1234abcd1234abcd1234abcd",
    "sk-abcd1234abcd1234abcd1234abcd1234abcd1234",
    "sk-5678efgh5678efgh5678efgh5678efgh5678efgh",
    "sk-efgh5678efgh5678efgh5678efgh5678efgh5678",
    "sk-ijkl1234ijkl1234ijkl1234ijkl1234ijkl1234",
    "sk-mnop5678mnop5678mnop5678mnop5678mnop5678",
    "sk-qrst1234qrst1234qrst1234qrst1234qrst1234",
    "sk-uvwx5678uvwx5678uvwx5678uvwx5678uvwx5678",
    "sk-1234ijkl1234ijkl1234ijkl1234ijkl1234ijkl",
    "sk-5678mnop5678mnop5678mnop5678mnop5678mnop",
    "sk-qrst5678qrst5678qrst5678qrst5678qrst5678",
    "sk-uvwx1234uvwx1234uvwx1234uvwx1234uvwx1234",
    "sk-1234abcd5678efgh1234abcd5678efgh1234abcd",
    "sk-5678ijkl1234mnop5678ijkl1234mnop5678ijkl",
    "sk-abcdqrstefghuvwxabcdqrstefghuvwxabcdqrst",
    "sk-ijklmnop1234qrstijklmnop1234qrstijklmnop",
    "sk-1234uvwx5678abcd1234uvwx5678abcd1234uvwx",
    "sk-efghijkl5678mnopabcd1234efghijkl5678mnop",
    "sk-mnopqrstuvwxabcdmnopqrstuvwxabcdmnopqrst",
    "sk-ijklmnopqrstuvwxijklmnopqrstuvwxijklmnop",
    "sk-abcd1234efgh5678abcd1234efgh5678abcd1234",
    "sk-1234ijklmnop5678ijklmnop1234ijklmnop5678",
    "sk-qrstefghuvwxabcdqrstefghuvwxabcdqrstefgh",
    "sk-uvwxijklmnop1234uvwxijklmnop1234uvwxijkl",
    "sk-abcd5678efgh1234abcd5678efgh1234abcd5678",
    "sk-ijklmnopqrstuvwxijklmnopqrstuvwxijklmnop",
    "sk-1234qrstuvwxabcd1234qrstuvwxabcd1234qrst",
    "sk-efghijklmnop5678efghijklmnop5678efghijkl",
    "sk-mnopabcd1234efghmnopabcd1234efghmnopabcd",
    "sk-ijklqrst5678uvwxijklqrst5678uvwxijklqrst",
    "sk-1234ijkl5678mnop1234ijkl5678mnop1234ijkl",
    "sk-abcdqrstefgh5678abcdqrstefgh5678abcdqrst",
    "sk-ijklmnopuvwx1234ijklmnopuvwx1234ijklmnop",
    "sk-efgh5678abcd1234efgh5678abcd1234efgh5678",
    "sk-mnopqrstijkl5678mnopqrstijkl5678mnopqrst",
    "sk-1234uvwxabcd5678uvwxabcd1234uvwxabcd5678",
    "sk-ijklmnop5678efghijklmnop5678efghijklmnop",
    "sk-abcd1234qrstuvwxabcd1234qrstuvwxabcd1234",
    "sk-1234efgh5678ijkl1234efgh5678ijkl1234efgh",
    "sk-5678mnopqrstuvwx5678mnopqrstuvwx5678mnop",
    "sk-abcdijkl1234uvwxabcdijkl1234uvwxabcdijkl",
    "sk-ijklmnopabcd5678ijklmnopabcd5678ijklmnop",
    "sk-1234efghqrstuvwx1234efghqrstuvwx1234efgh",
    "sk-5678ijklmnopabcd5678ijklmnopabcd5678ijkl",
    "sk-abcd1234efgh5678abcd1234efgh5678abcd1234",
    "sk-ijklmnopqrstuvwxijklmnopqrstuvwxijklmnop"
];

class AICopilot {
    constructor() {
        this.currentKeyIndex = 0;
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    }

    async _fetchWithRotation(payload) {
        let attempts = 0;
        while (attempts < Math.min(5, OPENAI_KEYS.length)) {
            const currentKey = OPENAI_KEYS[this.currentKeyIndex];
            try {
                console.log(`[AI Copilot] Attempting request with key index ${this.currentKeyIndex}...`);
                const response = await fetch(this.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentKey}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    return await response.json();
                } else if (response.status === 401 || response.status === 429) {
                    console.warn(`[AI Copilot] Key index ${this.currentKeyIndex} failed (${response.status}). Rotating key...`);
                    this.currentKeyIndex = (this.currentKeyIndex + 1) % OPENAI_KEYS.length;
                } else {
                    const errBody = await response.text();
                    console.error('[AI Copilot] API Error:', response.status, errBody);
                    // It might be a bad request (400), don't rotate on bad request, just fail
                    throw new Error(`OpenAI API Error: ${response.status} - ${errBody}`);
                }
            } catch (error) {
                console.error('[AI Copilot] Request exception:', error);
                // Rotate on fetch error (e.g., network)
                this.currentKeyIndex = (this.currentKeyIndex + 1) % OPENAI_KEYS.length;
            }
            attempts++;
        }
        throw new Error('All attempted OpenAI API keys failed. Please check your keys or network.');
    }

    /**
     * Verifies a stewardship action image using GPT-4 Vision, coupled with strict EXIF GPS constraints.
     * @param {string} base64Image - The image data URL.
     * @param {string} aiContext - Extracted EXIF data formatted tightly into a string.
     * @returns {Promise<{verified: boolean, rationale: string}>}
     */
    async verifyActionImage(base64Image, aiContext = "No EXIF Context provided") {
        const payload = {
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a strict AI environmental auditor. Verify if the uploaded photo shows genuine climate action (e.g., a newly planted tree in dirt, active trash cleanup). You MUST factor in the attached EXIF metadata. If EXIF is missing or suspiciously manipulated, or the image looks like a random stock photo with no clear user action, reject it. Respond strictly in JSON: { \"verified\": boolean, \"rationale\": \"short string explaining why\" }."
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: `Context: ${aiContext}\nDoes this image prove real environmental stewardship action?` },
                        { type: "image_url", image_url: { url: base64Image } }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 150
        };

        try {
            const data = await this._fetchWithRotation(payload);
            const content = data.choices[0].message.content;
            return JSON.parse(content);
        } catch (error) {
            console.error('[AI Copilot] Image verification failed:', error);
            // Strict rejection if API fails (no fallbacks allowed for real minting)
            return {
                verified: false,
                rationale: "Verification failed securely. Network error during AI Audit."
            };
        }
    }

    /**
     * Generates custom insights dynamically based on total stats
     */
    async generateInsights(totalCO2, points) {
        const payload = {
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an AI Copilot for EcoArcade. Provide a 1-sentence encouraging or advisory environmental insight based on the user's digital carbon footprint and game points."
                },
                {
                    role: "user",
                    content: `My estimated browsing emissions: ${totalCO2} grams. My EcoPoints: ${points}. Give me a short, personalized tip or insight.`
                }
            ],
            max_tokens: 50
        };

        try {
            const data = await this._fetchWithRotation(payload);
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.warn('[AI Copilot] Insight generation failed:', error);
            return "Keep tracking your footprint to discover more patterns!";
        }
    }
}

// Make accessible globally
window.aiCopilot = new AICopilot();
