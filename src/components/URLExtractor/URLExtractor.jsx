import React, { useState, useCallback } from 'react';
import {
    Link2, Globe, FileText, Loader2, X, Copy, Check,
    AlertCircle, Clock, BookOpen, ExternalLink, Plus,
    Sparkles, Tag, ChevronDown, ChevronUp, Download
} from 'lucide-react';
import URLProcessor from '../../services/URLProcessor';

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const MetadataCard = ({ metadata, url }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Image Preview */}
            {metadata.image && (
                <div className="h-40 overflow-hidden bg-gray-100">
                    <img
                        src={metadata.image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                </div>
            )}

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {metadata.title || 'Untitled Page'}
                    </h3>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
                        title="Copy URL"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                </div>

                {metadata.description && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                        {metadata.description}
                    </p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <Globe size={12} />
                        {URLProcessor.extractDomain(url)}
                    </span>
                    {metadata.author && (
                        <span className="flex items-center gap-1">
                            By {metadata.author}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const ContentPreview = ({ content, structured }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const readingTime = URLProcessor.estimateReadingTime(content.wordCount);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                    <FileText size={14} />
                    {content.wordCount.toLocaleString()} words
                </span>
                <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {readingTime.formatted}
                </span>
                {content.truncated && (
                    <span className="text-amber-600 text-xs bg-amber-50 px-2 py-0.5 rounded">
                        Content truncated
                    </span>
                )}
            </div>

            {/* Headings Overview */}
            {structured.headings?.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Structure ({structured.headings.length} headings)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {structured.headings.slice(0, 5).map((h, idx) => (
                            <span
                                key={idx}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                                H{h.level}: {h.text.slice(0, 30)}{h.text.length > 30 ? '...' : ''}
                            </span>
                        ))}
                        {structured.headings.length > 5 && (
                            <span className="text-xs text-gray-400">
                                +{structured.headings.length - 5} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Text Preview */}
            <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Content Preview
                </h4>
                <div className={`text-sm text-gray-700 ${isExpanded ? '' : 'line-clamp-6'}`}>
                    {content.text}
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                    {isExpanded ? (
                        <>Show Less <ChevronUp size={14} /></>
                    ) : (
                        <>Show More <ChevronDown size={14} /></>
                    )}
                </button>
            </div>
        </div>
    );
};

const ActionButtons = ({ onSummarize, onKeyPoints, onAddToKB, isLoading }) => (
    <div className="flex flex-wrap gap-2">
        <button
            onClick={onSummarize}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
            <Sparkles size={16} />
            Summarize
        </button>
        <button
            onClick={onKeyPoints}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
            <BookOpen size={16} />
            Key Points
        </button>
        <button
            onClick={onAddToKB}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
            <Plus size={16} />
            Add to Library
        </button>
    </div>
);

const AIResponse = ({ response, type }) => (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4">
        <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
                <Sparkles size={14} className="text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-indigo-900">
                {type === 'summary' ? 'AI Summary' : 'Key Points'}
            </span>
        </div>
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {response}
        </div>
    </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const URLExtractor = ({ onClose, onAddToLibrary }) => {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const [error, setError] = useState(null);
    const [extractedData, setExtractedData] = useState(null);
    const [aiResponse, setAiResponse] = useState(null);
    const [aiResponseType, setAiResponseType] = useState(null);

    // Extract URL content
    const handleExtract = useCallback(async () => {
        if (!url.trim()) return;

        setIsLoading(true);
        setError(null);
        setExtractedData(null);
        setAiResponse(null);

        try {
            const result = await URLProcessor.extractUrlContent(url);

            if (result.success) {
                setExtractedData(result);
            } else {
                setError(result.error || 'Failed to extract content');
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [url]);

    // Handle AI summarization
    const handleSummarize = useCallback(async () => {
        if (!extractedData) return;

        setIsProcessingAI(true);
        setAiResponseType('summary');

        try {
            // Import AIService dynamically
            const { default: aiService } = await import('../../services/AIService');

            if (!aiService.isAvailable()) {
                await aiService.checkConnection();
            }

            if (aiService.isAvailable()) {
                const result = await aiService.summarize(
                    extractedData.content?.text || '',
                    {
                        title: extractedData.metadata?.title,
                        url: extractedData.url
                    }
                );

                if (result.success) {
                    setAiResponse(result.content);
                } else {
                    throw new Error(result.error);
                }
            } else {
                // Demo fallback
                const mockSummary = `**Summary of "${extractedData.metadata?.title}"** *(Demo Mode)*

This webpage from ${URLProcessor.extractDomain(extractedData.url)} covers the following main topics:

${extractedData.structured?.headings?.slice(0, 3).map(h => `• ${h.text}`).join('\n') || '• Main content extracted successfully'}

The content contains approximately ${extractedData.content?.wordCount} words.

**To enable real AI summarization:**
1. Start Ollama locally
2. Pull a model (e.g., \`ollama pull llama3.2\`)
3. Click the status indicator in the sidebar to reconnect`;

                setAiResponse(mockSummary);
            }
        } catch (error) {
            console.error('Summarize error:', error);
            setAiResponse(`⚠️ Error: ${error.message}\n\nPlease ensure the AI backend is running.`);
        } finally {
            setIsProcessingAI(false);
        }
    }, [extractedData]);

    // Handle key points extraction
    const handleKeyPoints = useCallback(async () => {
        if (!extractedData) return;

        setIsProcessingAI(true);
        setAiResponseType('keypoints');

        try {
            const { default: aiService } = await import('../../services/AIService');

            if (!aiService.isAvailable()) {
                await aiService.checkConnection();
            }

            if (aiService.isAvailable()) {
                const result = await aiService.extractKeyPoints(
                    extractedData.content?.text || '',
                    { title: extractedData.metadata?.title }
                );

                if (result.success) {
                    setAiResponse(result.content);
                } else {
                    throw new Error(result.error);
                }
            } else {
                // Demo fallback
                const mockPoints = `**Key Points from "${extractedData.metadata?.title}"** *(Demo Mode)*

${extractedData.structured?.headings?.slice(0, 5).map((h, i) => `${i + 1}. **${h.text}**`).join('\n') ||
                    `1. Main topic identified from the webpage
2. Supporting information extracted
3. Additional details from the content
4. Related concepts mentioned
5. Conclusion or summary points`}

**To enable real AI key point extraction:**
1. Start Ollama locally
2. Pull a model (e.g., \`ollama pull llama3.2\`)
3. Click the status indicator in the sidebar to reconnect`;

                setAiResponse(mockPoints);
            }
        } catch (error) {
            console.error('Key points error:', error);
            setAiResponse(`⚠️ Error: ${error.message}\n\nPlease ensure the AI backend is running.`);
        } finally {
            setIsProcessingAI(false);
        }
    }, [extractedData]);

    // Add to knowledge base
    const handleAddToLibrary = useCallback(() => {
        if (!extractedData) return;

        const entry = URLProcessor.formatForKnowledgeBase(extractedData);

        // Add AI summary if available
        if (aiResponse && aiResponseType === 'summary') {
            entry.content.summary = aiResponse;
        }

        if (onAddToLibrary) {
            onAddToLibrary(entry);
        }

        // Show confirmation
        alert('Added to Library!');
    }, [extractedData, aiResponse, aiResponseType, onAddToLibrary]);

    // Handle Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            handleExtract();
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
            {/* Header */}
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Link2 size={20} />
                    </div>
                    <div>
                        <h1 className="font-semibold text-gray-900">URL Extractor</h1>
                        <p className="text-xs text-gray-500">Extract and analyze web content</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* URL Input */}
            <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter URL to extract content (e.g., https://example.com/article)"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <button
                        onClick={handleExtract}
                        disabled={!url.trim() || isLoading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Download size={18} />
                        )}
                        Extract
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Error State */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-800">Extraction Failed</p>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                            <p className="text-xs text-red-500 mt-2">
                                Tip: Some websites block content extraction. Try a different URL or use a backend proxy.
                            </p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
                        <p className="text-gray-600 font-medium">Extracting content...</p>
                        <p className="text-sm text-gray-400">This may take a few seconds</p>
                    </div>
                )}

                {/* Results */}
                {extractedData && !isLoading && (
                    <div className="space-y-6 max-w-3xl mx-auto">
                        {/* Metadata Card */}
                        <MetadataCard
                            metadata={extractedData.metadata}
                            url={extractedData.url}
                        />

                        {/* Content Type Badge */}
                        <div className="flex items-center gap-2">
                            <Tag size={14} className="text-gray-400" />
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {URLProcessor.detectContentType(extractedData)}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <ActionButtons
                            onSummarize={handleSummarize}
                            onKeyPoints={handleKeyPoints}
                            onAddToKB={handleAddToLibrary}
                            isLoading={isProcessingAI}
                        />

                        {/* AI Response */}
                        {isProcessingAI && (
                            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
                                <Loader2 size={20} className="text-indigo-600 animate-spin" />
                                <span className="text-sm text-indigo-700">Processing with AI...</span>
                            </div>
                        )}

                        {aiResponse && !isProcessingAI && (
                            <AIResponse response={aiResponse} type={aiResponseType} />
                        )}

                        {/* Content Preview */}
                        <ContentPreview
                            content={extractedData.content}
                            structured={extractedData.structured}
                        />

                        {/* Links Found */}
                        {extractedData.structured?.links?.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Links Found ({extractedData.structured.links.length})
                                </h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {extractedData.structured.links.slice(0, 10).map((link, idx) => (
                                        <a
                                            key={idx}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                        >
                                            <ExternalLink size={12} />
                                            {link.text.slice(0, 60)}{link.text.length > 60 ? '...' : ''}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!extractedData && !isLoading && !error && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                            <Globe size={40} className="text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Extract Web Content
                        </h2>
                        <p className="text-gray-500 max-w-md mb-6">
                            Enter any URL above to extract its content, generate summaries,
                            and add it to your knowledge base.
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-center max-w-sm">
                            {[
                                { icon: Download, label: 'Extract Content' },
                                { icon: Sparkles, label: 'AI Summary' },
                                { icon: Plus, label: 'Save to Library' }
                            ].map((feature, idx) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={idx} className="p-4 bg-gray-100 rounded-xl">
                                        <Icon size={24} className="mx-auto mb-2 text-gray-600" />
                                        <span className="text-xs text-gray-600">{feature.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default URLExtractor;
