/**
 * Canvas Component Exports
 * =========================
 * 
 * Step 3.2 Implementation - Element Types
 * 
 * Exports:
 * - Canvas: Main canvas component with React Flow
 * - CanvasToolbar: Floating toolbar for canvas operations
 * - CanvasAIActions: AI-powered quick actions for selected nodes
 * - nodeTypes: Object mapping node type names to components
 * - edgeTypes: Object mapping edge type names to components
 * - Individual node components for direct use
 */

export { default as Canvas } from './Canvas';
export { default as CanvasToolbar } from './CanvasToolbar';
export { default as CanvasAIActions } from './CanvasAIActions';

import {
    TextNode,
    CodeNode,
    AIResponseNode,
    ImageNode,
    DocumentNode,
    StickyNode,
    CustomEdge
} from './CanvasNodes';

// Re-export individual components
export {
    TextNode,
    CodeNode,
    AIResponseNode,
    ImageNode,
    DocumentNode,
    StickyNode,
    CustomEdge
};

// Export node and edge type configurations
export const nodeTypes = {
    text: TextNode,
    code: CodeNode,
    aiResponse: AIResponseNode,
    image: ImageNode,
    document: DocumentNode,
    sticky: StickyNode
};

export const edgeTypes = {
    custom: CustomEdge
};
