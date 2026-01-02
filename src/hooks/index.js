/**
 * React Hooks Index
 * ==================
 * 
 * Central export for all custom React hooks.
 * 
 * Step 3.3: Canvas State Management exports included
 */

// Canvas Hooks - Step 3.3 Implementation
export {
    default as useCanvas,
    useCanvasVisibility,
    useCanvasTemplates
} from './useCanvas';

// Database Hook
export { default as useDatabase } from './useDatabase';

// Library Hook
export { default as useLibrary } from './useLibrary';

// AI Hook - Canvas AI Integration
export { default as useAI } from './useAI';

// Voice Input Hook - Speech-to-Text
export { default as useVoiceInput } from './useVoiceInput';
