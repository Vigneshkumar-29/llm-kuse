/**
 * Prompts Index
 * ==============
 * 
 * Central export for all document generation prompts.
 */

export {
    default as documentPrompts,
    PROMPT_CATEGORIES,
    reportPrompts,
    cvPrompts,
    presentationPrompts,
    analysisPrompts,
    businessPrompts,
    creativePrompts,
    getAllPrompts,
    getPromptsByCategory,
    getPromptById,
    fillPromptTemplate,
    validatePromptVariables
} from './documentPrompts';
