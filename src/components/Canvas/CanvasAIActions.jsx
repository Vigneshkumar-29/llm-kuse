/**
 * Canvas AI Actions - Quick AI Actions for Canvas Nodes
 * =======================================================
 * 
 * A floating action bar that appears when a node is selected,
 * providing quick AI-powered actions.
 */

import React, { useState } from 'react';
import {
    Sparkles, Wand2, FileText, Code, MessageSquare,
    Lightbulb, RefreshCw, X, ChevronDown, Loader2
} from 'lucide-react';
import { useAI } from '../../hooks';

const AIActionButton = ({ icon: Icon, label, onClick, loading, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
            flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
            transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:shadow-md hover:scale-105'}
            bg-white/80 text-gray-700 border border-gray-200
        `}
        title={label}
    >
        {loading ? (
            <Loader2 size={14} className="animate-spin" />
        ) : (
            <Icon size={14} />
        )}
        <span>{label}</span>
    </button>
);

const CanvasAIActions = ({
    selectedNode,
    onUpdateNode,
    onAddNode,
    position = { x: 0, y: 0 }
}) => {
    const { isLoading, summarize, explainCode, generateCode, brainstorm, improve } = useAI();
    const [activeAction, setActiveAction] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');

    if (!selectedNode) return null;

    const nodeType = selectedNode.type;
    const nodeData = selectedNode.data || {};

    const handleAction = async (action) => {
        setActiveAction(action);
        let result;

        try {
            switch (action) {
                case 'summarize':
                    result = await summarize(nodeData.content || nodeData.response || nodeData.code || '');
                    if (result.success) {
                        onAddNode('aiResponse', {
                            query: `Summarize: ${(nodeData.title || 'content').substring(0, 50)}...`,
                            response: result.content,
                            model: 'AI Summary'
                        });
                    }
                    break;

                case 'explain':
                    result = await explainCode(nodeData.code || nodeData.content || '', nodeData.language);
                    if (result.success) {
                        onAddNode('aiResponse', {
                            query: `Explain: ${nodeData.filename || 'code'}`,
                            response: result.content,
                            model: 'Code Explainer'
                        });
                    }
                    break;

                case 'improve':
                    const content = nodeData.code || nodeData.content || '';
                    result = await improve(content, nodeData.code ? 'code' : 'text');
                    if (result.success) {
                        onUpdateNode(selectedNode.id, {
                            [nodeData.code ? 'code' : 'content']: result.content
                        });
                    }
                    break;

                case 'brainstorm':
                    result = await brainstorm(nodeData.content || nodeData.title || 'this topic');
                    if (result.success) {
                        onAddNode('sticky', {
                            content: result.content,
                            color: 'purple'
                        });
                    }
                    break;

                case 'generate':
                    result = await generateCode(customPrompt, nodeData.language || 'javascript');
                    if (result.success) {
                        onAddNode('code', {
                            code: result.content,
                            language: nodeData.language || 'javascript',
                            filename: 'generated.js'
                        });
                    }
                    setShowPrompt(false);
                    setCustomPrompt('');
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.error('AI Action error:', error);
        } finally {
            setActiveAction(null);
        }
    };

    // Get relevant actions based on node type
    const getActions = () => {
        const common = [
            { id: 'brainstorm', icon: Lightbulb, label: 'Brainstorm' }
        ];

        switch (nodeType) {
            case 'text':
                return [
                    { id: 'summarize', icon: FileText, label: 'Summarize' },
                    { id: 'improve', icon: Wand2, label: 'Improve' },
                    ...common
                ];
            case 'code':
                return [
                    { id: 'explain', icon: MessageSquare, label: 'Explain' },
                    { id: 'improve', icon: Wand2, label: 'Improve' },
                    ...common
                ];
            case 'aiResponse':
                return [
                    { id: 'summarize', icon: FileText, label: 'Summarize' },
                    ...common
                ];
            case 'sticky':
                return [
                    { id: 'improve', icon: Wand2, label: 'Expand' },
                    ...common
                ];
            default:
                return common;
        }
    };

    const actions = getActions();

    return (
        <div
            className="absolute z-50 animate-scale-in"
            style={{
                left: position.x,
                top: position.y - 60,
                transform: 'translateX(-50%)'
            }}
        >
            <div className="flex items-center gap-1 p-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 shadow-xl">
                {/* AI Icon */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mr-1">
                    <Sparkles size={14} className="text-white" />
                </div>

                {/* Action Buttons */}
                {actions.map(action => (
                    <AIActionButton
                        key={action.id}
                        icon={action.icon}
                        label={action.label}
                        onClick={() => handleAction(action.id)}
                        loading={activeAction === action.id && isLoading}
                        disabled={isLoading}
                    />
                ))}

                {/* Generate Button */}
                <button
                    onClick={() => setShowPrompt(!showPrompt)}
                    className={`
                        flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                        transition-all duration-200
                        ${showPrompt
                            ? 'bg-indigo-500 text-white'
                            : 'bg-white/80 text-gray-700 border border-gray-200 hover:bg-white hover:shadow-md'}
                    `}
                >
                    <Code size={14} />
                    Generate
                    <ChevronDown size={12} className={`transition-transform ${showPrompt ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Custom Prompt Input */}
            {showPrompt && (
                <div className="mt-2 p-3 bg-white rounded-xl border border-gray-200 shadow-xl animate-scale-in">
                    <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Describe what code to generate..."
                        className="w-64 h-20 p-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => handleAction('generate')}
                            disabled={!customPrompt.trim() || isLoading}
                            className="flex-1 py-2 text-xs font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-50"
                        >
                            {isLoading ? 'Generating...' : 'Generate Code'}
                        </button>
                        <button
                            onClick={() => setShowPrompt(false)}
                            className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CanvasAIActions;
