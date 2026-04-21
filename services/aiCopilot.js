// EcoArcade AI Copilot Service
// Requires a real OpenAI API key stored in chrome.storage.local as "openAIApiKey".

class AICopilot {
    constructor() {
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
        this.model = 'gpt-4o-mini';
    }

    async getConfig() {
        const data = await chrome.storage.local.get(['openAIApiKey', 'openAIModel']);
        return {
            apiKey: data.openAIApiKey || '',
            model: data.openAIModel || this.model
        };
    }

    async isConfigured() {
        const { apiKey } = await this.getConfig();
        return Boolean(apiKey);
    }

    async requestCompletion(payload) {
        const { apiKey, model } = await this.getConfig();

        if (!apiKey) {
            throw new Error('OpenAI API key is not configured.');
        }

        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                ...payload
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
        }

        return response.json();
    }

    async verifyActionImage(base64Image, aiContext = 'No EXIF context supplied') {
        // Some models/platforms expect message.content to be a string; send a single user message that includes
        // the EXIF-derived context and a data URL for the image so servers receive a predictable text payload.
        const userContent = `Action context:\n${aiContext}\n\nImage data (base64): ${base64Image}\n\nReturn JSON only with keys: verified, rationale, confidence.`;

        const data = await this.requestCompletion({
            messages: [
                {
                    role: 'system',
                    content: 'You are a strict environmental verification agent. Judge whether the uploaded image shows authentic climate action by the user. Reject stock-style images, missing-action scenes, or any proof lacking trustworthy EXIF details. Reply as JSON with keys verified, rationale, and confidence.'
                },
                {
                    role: 'user',
                    content: userContent
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 220
        });

        // Be resilient to different response shapes. Prefer a string payload but handle object content.
        const choice = data?.choices?.[0];
        if (!choice) throw new Error('AI Copilot returned an unexpected response.');

        let rawContent = choice.message?.content;
        // If content is an object (e.g. multimodal output), try common places for text
        if (!rawContent && Array.isArray(choice.message?.content_parts)) {
            rawContent = choice.message.content_parts.map(p => p.text || '').join('\n');
        }

        let textPayload = '';
        if (typeof rawContent === 'string') {
            textPayload = rawContent;
        } else if (typeof rawContent === 'object') {
            // try common shapes
            textPayload = rawContent.text || rawContent[0]?.text || JSON.stringify(rawContent);
        }

        try {
            return JSON.parse(textPayload);
        } catch (err) {
            // If parsing fails, throw a clear error including a short snippet for debugging
            const snippet = (textPayload || '').slice(0, 500);
            throw new Error(`AI response could not be parsed as JSON. Snippet: ${snippet}`);
        }
    }

    async generateInsights(totalCO2, points, streak, currentDomain) {
        const data = await this.requestCompletion({
            messages: [
                {
                    role: 'system',
                    content: 'You are EcoArcade\'s climate behavior copilot. Return one short, practical insight and up to three short tip chips based on the user\'s browsing emissions and progress. Respond as JSON with keys insight and chips.'
                },
                {
                    role: 'user',
                    content: `Current tab: ${currentDomain || 'unknown'}\nTotal browsing carbon: ${totalCO2} grams\nEco points: ${points}\nDaily streak: ${streak}`
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 180
        });

        return JSON.parse(data.choices[0].message.content);
    }

    async gradeEssay(prompt, essayText) {
        const data = await this.requestCompletion({
            messages: [
                {
                    role: 'system',
                    content: 'You grade short climate-awareness reflections. Score the essay on clarity, relevance, and actionability. Return JSON with score (0-100), pointsAwarded (integer), headline, and feedback.'
                },
                {
                    role: 'user',
                    content: `Prompt: ${prompt}\n\nEssay:\n${essayText}`
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 220
        });

        return JSON.parse(data.choices[0].message.content);
    }
}

window.aiCopilot = new AICopilot();
