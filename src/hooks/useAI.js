/**
 * useAI Hook - Canvas AI Integration
 * ====================================
 * 
 * Provides AI capabilities for Canvas nodes including:
 * - Generate content from prompts
 * - Summarize node content
 * - Explain code
 * - Answer questions
 */

import { useState, useCallback } from 'react';
import aiService from '../services/AIService';

export const useAI = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Generate AI response for a prompt
     */
    const generate = useCallback(async (prompt, options = {}) => {
        setIsLoading(true);
        setError(null);

        try {
            // Ensure connection
            if (!aiService.isAvailable()) {
                await aiService.checkConnection();
            }

            if (aiService.isAvailable()) {
                const result = await aiService.chat(
                    [{ role: 'user', content: prompt }],
                    options
                );

                if (result.success) {
                    return { success: true, content: result.content };
                } else {
                    throw new Error(result.error || 'AI request failed');
                }
            } else {
                return {
                    success: false,
                    content: `**Demo Mode**\n\nAI is not connected. Start Ollama to enable:\n\`\`\`bash\nollama serve\n\`\`\``,
                    isDemo: true
                };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Summarize text content
     */
    const summarize = useCallback(async (content, title = '') => {
        return generate(
            `Please summarize the following content concisely:\n\n${title ? `Title: ${title}\n\n` : ''}${content}`,
            { systemPrompt: 'You are a professional summarizer. Be concise and highlight key points.' }
        );
    }, [generate]);

    /**
     * Explain code
     */
    const explainCode = useCallback(async (code, language = 'javascript') => {
        return generate(
            `Please explain this ${language} code in simple terms:\n\n\`\`\`${language}\n${code}\n\`\`\``,
            { systemPrompt: 'You are a coding tutor. Explain code clearly with examples when helpful.' }
        );
    }, [generate]);

    /**
     * Generate code from description
     */
    const generateCode = useCallback(async (description, language = 'javascript') => {
        return generate(
            `Write ${language} code that does the following:\n\n${description}\n\nProvide clean, well-commented code.`,
            { systemPrompt: 'You are an expert programmer. Write clean, efficient, well-documented code.' }
        );
    }, [generate]);

    /**
     * Improve/refactor text or code
     */
    const improve = useCallback(async (content, type = 'text') => {
        const prompt = type === 'code'
            ? `Improve and refactor this code for better readability and performance:\n\n${content}`
            : `Improve this text for clarity and professionalism:\n\n${content}`;

        return generate(prompt);
    }, [generate]);

    /**
     * Ask a question about content
     */
    const askQuestion = useCallback(async (question, context = '') => {
        const prompt = context
            ? `Based on this context:\n\n${context}\n\nAnswer this question: ${question}`
            : question;

        return generate(prompt);
    }, [generate]);

    /**
     * Generate ideas/brainstorm
     */
    const brainstorm = useCallback(async (topic, count = 5) => {
        return generate(
            `Generate ${count} creative ideas or suggestions about: ${topic}\n\nFormat as a numbered list with brief explanations.`,
            { systemPrompt: 'You are a creative brainstorming assistant. Be innovative and practical.' }
        );
    }, [generate]);

    return {
        isLoading,
        error,
        isConnected: aiService.isAvailable(),
        generate,
        summarize,
        explainCode,
        generateCode,
        improve,
        askQuestion,
        brainstorm
    };
};

export default useAI;
