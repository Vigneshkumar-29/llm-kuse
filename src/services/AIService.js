/**
 * AIService - Centralized AI Backend Integration
 * ===============================================
 * Connects to Ollama (or your configured LLM backend) using env variables.
 * Used by Chat, YouTube, URLExtractor, and other AI-powered features.
 */

// Configuration from environment variables
const getConfig = () => ({
    baseUrl: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434',
    defaultModel: import.meta.env.VITE_DEFAULT_MODEL || 'llama3.2',
    timeout: parseInt(import.meta.env.VITE_AI_TIMEOUT) || 60000,
});

// System prompts for different use cases
const SYSTEM_PROMPTS = {
    chat: `You are DevSavvy, an intelligent coding assistant. 
- Always format your responses using clean, readable Markdown.
- Use code blocks with language identifiers for code (e.g., \`\`\`javascript).
- Use bolding for key terms and headers for sections.
- If explaining code, break it down step-by-step.
- Be concise. Avoid unnecessary conversational filler.
- Adapt your technical level to the user's question. If the user asks a simple question, give a simple answer.
- If you don't know the answer, admit it. Do not make up information.`,

    summarize: `You are a professional summarizer. Create clear, concise summaries that capture the main points without unnecessary fluff.
- Use bullet points for key takeaways
- Keep summaries to 3-5 paragraphs maximum
- Focus ONLY on the content provided
- Highlight important facts and conclusions`,

    keypoints: `You are an analyst extracting key points from content.
- Identify the 5-10 most important points
- Number each point clearly
- Keep each point brief (1-2 sentences)
- Focus on substance over style`,

    youtube: `You are a helpful assistant analyzing YouTube video content.
- Base your answers STRICTLY on the provided transcript.
- If the answer is not in the transcript, state that clearly.
- Reference specific timestamps when relevant.
- Be accurate and cite the content directly.
- Do not use outside knowledge unless explicitly asked.`,

    document: `You are an intelligent document analyzer.
- Analyze the provided document content carefully.
- Answer questions based STRICTLY on the document.
- Cite relevant sections when possible.
- If the document does not contain the answer, state that clearly.
- Be concise and direct.`
};

class AIService {
    constructor() {
        this.config = getConfig();
        this.isConnected = false;
        this.availableModels = [];
        this.currentModel = this.config.defaultModel;
    }

    /**
     * Check connection to AI backend and get available models
     */
    async checkConnection() {
        try {
            const response = await fetch('/ollama/api/tags', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Failed to connect to Ollama');
            }

            const data = await response.json();
            this.availableModels = data.models?.map(m => m.name) || [];
            this.isConnected = this.availableModels.length > 0;

            // Auto-select best model
            if (this.isConnected) {
                const priorities = ['llama3.2', 'llama3', 'mistral', 'llama2', 'gemma'];
                const bestMatch = priorities.find(p =>
                    this.availableModels.some(m => m.includes(p))
                );
                if (bestMatch) {
                    this.currentModel = this.availableModels.find(m => m.includes(bestMatch));
                } else {
                    this.currentModel = this.availableModels[0];
                }
            }

            return {
                connected: this.isConnected,
                models: this.availableModels,
                selectedModel: this.currentModel
            };
        } catch (error) {
            console.warn('AI backend not available:', error.message);
            this.isConnected = false;
            return {
                connected: false,
                models: [],
                selectedModel: 'demo',
                error: error.message
            };
        }
    }

    /**
     * Send a chat message to the AI
     */
    async chat(messages, options = {}) {
        const {
            model = this.currentModel,
            systemPrompt = SYSTEM_PROMPTS.chat,
            stream = false,
            context = null
        } = options;

        // Build messages array with system prompt
        const fullMessages = [
            { role: 'system', content: systemPrompt }
        ];

        // Add context if provided
        if (context) {
            fullMessages.push({
                role: 'system',
                content: `Additional context:\n${context}`
            });
        }

        // Add conversation history (limited to last 10 messages for speed)
        const recentMessages = messages.slice(-10);
        fullMessages.push(...recentMessages);

        if (!this.isConnected) {
            return {
                success: false,
                error: 'Not connected to AI backend',
                isDemo: true
            };
        }

        try {
            const response = await fetch('/ollama/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    messages: fullMessages,
                    stream: stream
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            return {
                success: true,
                content: data.message?.content || '',
                model: model,
                isDemo: false
            };
        } catch (error) {
            console.error('Chat error:', error);
            return {
                success: false,
                error: error.message,
                isDemo: true
            };
        }
    }

    /**
     * Generate a summary of provided content
     */
    async summarize(content, options = {}) {
        const { title = '', url = '' } = options;

        const prompt = `Please summarize the following content:

${title ? `Title: ${title}\n` : ''}${url ? `Source: ${url}\n` : ''}
---
${content.substring(0, 6000)}
---

Provide a comprehensive but concise summary.`;

        return this.chat(
            [{ role: 'user', content: prompt }],
            { systemPrompt: SYSTEM_PROMPTS.summarize }
        );
    }

    /**
     * Extract key points from content
     */
    async extractKeyPoints(content, options = {}) {
        const { title = '', maxPoints = 10 } = options;

        const prompt = `Extract the ${maxPoints} most important key points from the following content:

${title ? `Title: ${title}\n` : ''}
---
${content.substring(0, 6000)}
---

List each point clearly and concisely.`;

        return this.chat(
            [{ role: 'user', content: prompt }],
            { systemPrompt: SYSTEM_PROMPTS.keypoints }
        );
    }

    /**
     * Answer questions about a YouTube video based on transcript
     */
    async askAboutVideo(question, transcript, videoInfo = {}) {
        const context = `
Video Title: ${videoInfo.title || 'Unknown'}
Channel: ${videoInfo.author || 'Unknown'}

Transcript:
${transcript.substring(0, 6000)}
`;

        const prompt = `Based on the video transcript provided, please answer this question:

${question}`;

        return this.chat(
            [{ role: 'user', content: prompt }],
            {
                systemPrompt: SYSTEM_PROMPTS.youtube,
                context: context
            }
        );
    }

    /**
     * Answer questions about a document
     */
    async askAboutDocument(question, documentContent, documentInfo = {}) {
        const context = `
Document: ${documentInfo.name || 'Unknown'}
Type: ${documentInfo.type || 'Unknown'}

Content:
${documentContent.substring(0, 6000)}
`;

        const prompt = `Based on the document provided, please answer this question:

${question}`;

        return this.chat(
            [{ role: 'user', content: prompt }],
            {
                systemPrompt: SYSTEM_PROMPTS.document,
                context: context
            }
        );
    }

    /**
     * Analyze a webpage
     */
    async analyzeWebpage(content, metadata = {}) {
        const prompt = `Analyze this webpage content and provide insights:

Title: ${metadata.title || 'Unknown'}
URL: ${metadata.url || 'Unknown'}
Description: ${metadata.description || 'N/A'}

Content:
${content.substring(0, 6000)}

Please provide:
1. A brief summary
2. Key topics covered
3. Main takeaways`;

        return this.chat(
            [{ role: 'user', content: prompt }],
            { systemPrompt: SYSTEM_PROMPTS.summarize }
        );
    }

    /**
     * Get available models
     */
    getAvailableModels() {
        return this.availableModels;
    }

    /**
     * Set the current model
     */
    setModel(model) {
        if (this.availableModels.includes(model)) {
            this.currentModel = model;
            return true;
        }
        return false;
    }

    /**
     * Check if connected
     */
    isAvailable() {
        return this.isConnected;
    }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;

// Also export class for testing
export { AIService };
