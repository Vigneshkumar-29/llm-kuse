/**
 * Canvas Component - Professional Knowledge Board
 * =================================================
 * 
 * An infinite canvas for visual brainstorming and organizing
 * AI responses, documents, code snippets, and notes.
 * 
 * Features:
 * - Infinite pan/zoom canvas
 * - Multiple node types (text, code, AI, image, document, sticky)
 * - Connection lines between nodes
 * - Drag and drop from library
 * - Undo/Redo support
 * - Export as image
 * - Auto-save
 * 
 * @version 1.0.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    ReactFlow,
    Controls,
    Background,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
    ReactFlowProvider,
    Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes, edgeTypes } from './CanvasNodes';
import CanvasToolbar from './CanvasToolbar';
import { X, Maximize2, Minimize2, Layers, Sparkles } from 'lucide-react';

// =============================================================================
// CONFIGURATION
// =============================================================================

const STORAGE_KEY = 'devsavvy_canvas_state';
const MAX_HISTORY = 50;

// Edge style options for connection lines
const EDGE_COLORS = {
    default: '#94a3b8',
    highlight: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
};

const defaultEdgeOptions = {
    type: 'smoothstep',
    animated: true,
    style: { stroke: EDGE_COLORS.default, strokeWidth: 2 },
    markerEnd: {
        type: 'arrowclosed',
        color: EDGE_COLORS.default,
        width: 20,
        height: 20
    }
};

const connectionLineStyle = {
    stroke: EDGE_COLORS.highlight,
    strokeWidth: 3,
    strokeDasharray: '5 5'
};

// =============================================================================
// MAIN CANVAS COMPONENT (INNER)
// =============================================================================

const CanvasInner = ({ isOpen, onClose, onMinimize, isMinimized }) => {
    // React Flow instance
    const reactFlowInstance = useReactFlow();
    const reactFlowWrapper = useRef(null);

    // State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [showGrid, setShowGrid] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // ==========================================================================
    // PERSISTENCE
    // ==========================================================================

    // Load saved state
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
                setNodes(savedNodes || []);
                setEdges(savedEdges || []);
            } catch (err) {
                console.error('Failed to load canvas:', err);
            }
        }
    }, [setNodes, setEdges]);

    // Auto-save
    useEffect(() => {
        if (nodes.length > 0 || edges.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
        }
    }, [nodes, edges]);

    // ==========================================================================
    // HISTORY (UNDO/REDO)
    // ==========================================================================

    const saveHistory = useCallback(() => {
        const state = { nodes: [...nodes], edges: [...edges] };
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(state);
            return newHistory.slice(-MAX_HISTORY);
        });
        setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
    }, [nodes, edges, historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const prevState = history[historyIndex - 1];
            setNodes(prevState.nodes);
            setEdges(prevState.edges);
            setHistoryIndex(prev => prev - 1);
        }
    }, [history, historyIndex, setNodes, setEdges]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            setNodes(nextState.nodes);
            setEdges(nextState.edges);
            setHistoryIndex(prev => prev + 1);
        }
    }, [history, historyIndex, setNodes, setEdges]);

    // ==========================================================================
    // NODE OPERATIONS
    // ==========================================================================

    const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const addNode = useCallback((type) => {
        if (isLocked) return;

        const viewport = reactFlowInstance.getViewport();
        const position = reactFlowInstance.screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        });

        const newNode = {
            id: generateId(),
            type,
            position,
            data: {
                onDelete: deleteNode,
                onUpdate: updateNodeData,
                // Default data based on type
                ...(type === 'text' && { title: 'New Note', content: '' }),
                ...(type === 'code' && { code: '// New code snippet', language: 'javascript' }),
                ...(type === 'aiResponse' && { query: '', response: 'AI response placeholder...', model: 'llama3.2' }),
                ...(type === 'image' && { title: 'Image', src: '', alt: '' }),
                ...(type === 'document' && { name: 'Document', type: 'pdf', size: '0 KB' }),
                ...(type === 'sticky' && { content: '', color: 'yellow' })
            }
        };

        setNodes(nds => [...nds, newNode]);
        saveHistory();
    }, [reactFlowInstance, isLocked, setNodes, saveHistory]);

    const deleteNode = useCallback((nodeId) => {
        if (isLocked) return;
        setNodes(nds => nds.filter(n => n.id !== nodeId));
        setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
        saveHistory();
    }, [isLocked, setNodes, setEdges, saveHistory]);

    const updateNodeData = useCallback((nodeId, newData) => {
        setNodes(nds => nds.map(n =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
        ));
    }, [setNodes]);

    // ==========================================================================
    // EDGE OPERATIONS
    // ==========================================================================

    const onConnect = useCallback((params) => {
        if (isLocked) return;
        setEdges(eds => addEdge({ ...params, ...defaultEdgeOptions }, eds));
        saveHistory();
    }, [isLocked, setEdges, saveHistory]);

    // ==========================================================================
    // DRAG & DROP FROM LIBRARY
    // ==========================================================================

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();
        if (isLocked) return;

        try {
            const data = JSON.parse(event.dataTransfer.getData('application/json'));

            if (data.type === 'library-document') {
                const position = reactFlowInstance.screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY
                });

                const newNode = {
                    id: generateId(),
                    type: 'document',
                    position,
                    data: {
                        ...data.document,
                        name: data.document.name,
                        type: data.document.type,
                        size: data.document.metadata?.fileSizeFormatted || '0 KB',
                        preview: data.document.contentPreview,
                        onDelete: deleteNode,
                        onUpdate: updateNodeData
                    }
                };

                setNodes(nds => [...nds, newNode]);
                saveHistory();
            }
        } catch (err) {
            console.error('Drop failed:', err);
        }
    }, [reactFlowInstance, isLocked, setNodes, deleteNode, updateNodeData, saveHistory]);

    // ==========================================================================
    // VIEW CONTROLS
    // ==========================================================================

    const zoomIn = () => reactFlowInstance.zoomIn();
    const zoomOut = () => reactFlowInstance.zoomOut();
    const fitView = () => reactFlowInstance.fitView({ padding: 0.2 });

    // ==========================================================================
    // EXPORT
    // ==========================================================================

    const exportAsImage = useCallback(async () => {
        const element = document.querySelector('.react-flow');
        if (!element) return;

        try {
            // Dynamic import for html2canvas
            const { default: html2canvas } = await import('html2canvas');
            const canvas = await html2canvas(element, { backgroundColor: '#f8fafc' });

            const link = document.createElement('a');
            link.download = `canvas-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Export failed:', err);
            alert('Export failed. Make sure html2canvas is installed.');
        }
    }, []);

    // ==========================================================================
    // CLEAR CANVAS
    // ==========================================================================

    const clearCanvas = useCallback(() => {
        if (confirm('Are you sure you want to clear the canvas?')) {
            setNodes([]);
            setEdges([]);
            localStorage.removeItem(STORAGE_KEY);
            saveHistory();
        }
    }, [setNodes, setEdges, saveHistory]);

    // ==========================================================================
    // RENDER
    // ==========================================================================

    if (!isOpen) return null;

    if (isMinimized) {
        return (
            <button
                onClick={onMinimize}
                className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-500 text-white shadow-xl hover:bg-indigo-600"
            >
                <Layers size={20} />
                <span className="font-medium">Canvas</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">{nodes.length}</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-40 bg-gray-100">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-sm border-b">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Layers size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">Knowledge Canvas</h2>
                        <p className="text-xs text-gray-500">{nodes.length} nodes • {edges.length} connections</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onMinimize} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
                        <Minimize2 size={20} />
                    </button>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div ref={reactFlowWrapper} className="w-full h-full pt-16">
                <ReactFlow
                    nodes={nodes.map(n => ({ ...n, data: { ...n.data, onDelete: deleteNode, onUpdate: updateNodeData } }))}
                    edges={edges}
                    onNodesChange={isLocked ? undefined : onNodesChange}
                    onEdgesChange={isLocked ? undefined : onEdgesChange}
                    onConnect={onConnect}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    connectionLineStyle={connectionLineStyle}
                    fitView
                    snapToGrid
                    snapGrid={[15, 15]}
                    minZoom={0.1}
                    maxZoom={4}
                    deleteKeyCode={['Backspace', 'Delete']}
                    className="bg-gradient-to-br from-gray-50 to-slate-100"
                    proOptions={{ hideAttribution: true }}
                >
                    {showGrid && <Background variant="dots" gap={20} size={1} color="#d1d5db" />}
                    <Controls position="bottom-left" className="!bg-white !border !shadow-lg !rounded-xl" />
                    <MiniMap
                        position="bottom-right"
                        className="!bg-white !border !shadow-lg !rounded-xl"
                        nodeColor={(n) => {
                            const colors = {
                                text: '#3b82f6',
                                code: '#f59e0b',
                                aiResponse: '#8b5cf6',
                                image: '#ec4899',
                                document: '#10b981',
                                sticky: '#fbbf24'
                            };
                            return colors[n.type] || '#94a3b8';
                        }}
                    />
                </ReactFlow>
            </div>

            {/* Toolbar */}
            <CanvasToolbar
                onAddNode={addNode}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onFitView={fitView}
                onClear={clearCanvas}
                onSave={() => alert('Canvas auto-saved!')}
                onExport={exportAsImage}
                onUndo={undo}
                onRedo={redo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                isLocked={isLocked}
                onToggleLock={() => setIsLocked(!isLocked)}
                showGrid={showGrid}
                onToggleGrid={() => setShowGrid(!showGrid)}
                nodeCount={nodes.length}
                edgeCount={edges.length}
            />
        </div>
    );
};

// =============================================================================
// WRAPPED CANVAS COMPONENT
// =============================================================================

const Canvas = (props) => (
    <ReactFlowProvider>
        <CanvasInner {...props} />
    </ReactFlowProvider>
);

export default Canvas;
