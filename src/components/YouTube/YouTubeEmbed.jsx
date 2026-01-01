import React, { useState, useEffect, useRef } from 'react';
import {
    Youtube, Link2, Play, FileText, MessageSquare, X, Copy, Check,
    ChevronDown, ChevronUp, Loader2, AlertCircle, Sparkles, Clock,
    ExternalLink, BookOpen, ListOrdered, Send
} from 'lucide-react';
import YouTubeService from '../../services/YouTubeService';

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const VideoPlayer = ({ videoId, onReady }) => {
    const embedUrl = YouTubeService.getEmbedUrl(videoId, {
        enablejsapi: '1',
        origin: window.location.origin
    });

    return (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
            <iframe
                src={embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                onLoad={onReady}
            />
        </div>
    );
};

const TranscriptPanel = ({ transcript, isLoading, error, onTimestampClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 text-gray-500">
                <Loader2 size={20} className="animate-spin mr-2" />
                Loading transcript...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-amber-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-800">Transcript Unavailable</p>
                        <p className="text-xs text-amber-600 mt-1">{error}</p>
                        <p className="text-xs text-amber-500 mt-2">
                            Tip: Connect a backend transcript API for full functionality.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!transcript || transcript.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500 text-sm">
                No transcript available for this video.
            </div>
        );
    }

    const displayedTranscript = isExpanded ? transcript : transcript.slice(0, 10);

    return (
        <div className="space-y-1">
            <div className="max-h-64 overflow-y-auto space-y-1 pr-2">
                {displayedTranscript.map((segment, idx) => (
                    <button
                        key={idx}
                        onClick={() => onTimestampClick?.(segment.start)}
                        className="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors group flex gap-3"
                    >
                        <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded group-hover:bg-indigo-100">
                            {segment.formattedTime || YouTubeService.formatTime(segment.start)}
                        </span>
                        <span className="text-sm text-gray-700 flex-1">
                            {segment.text}
                        </span>
                    </button>
                ))}
            </div>
            {transcript.length > 10 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 py-2"
                >
                    {isExpanded ? (
                        <>Show Less <ChevronUp size={16} /></>
                    ) : (
                        <>Show More ({transcript.length - 10} more) <ChevronDown size={16} /></>
                    )}
                </button>
            )}
        </div>
    );
};

const QuestionInput = ({ onSubmit, isLoading, disabled }) => {
    const [question, setQuestion] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (question.trim() && !isLoading) {
            onSubmit(question.trim());
            setQuestion('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about this video..."
                disabled={disabled || isLoading}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm disabled:opacity-50"
            />
            <button
                type="submit"
                disabled={disabled || isLoading || !question.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <Send size={18} />
                )}
            </button>
        </form>
    );
};

const QAMessage = ({ message, type }) => (
    <div className={`flex gap-3 ${type === 'user' ? 'flex-row-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${type === 'user' ? 'bg-gray-200' : 'bg-indigo-100'
            }`}>
            {type === 'user' ? (
                <span className="text-xs font-medium text-gray-600">You</span>
            ) : (
                <Sparkles size={16} className="text-indigo-600" />
            )}
        </div>
        <div className={`flex-1 p-3 rounded-xl text-sm ${type === 'user'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}>
            {message}
        </div>
    </div>
);

const QuickActions = ({ onAction, disabled }) => {
    const actions = [
        { id: 'summarize', label: 'Summarize', icon: BookOpen },
        { id: 'keypoints', label: 'Key Points', icon: ListOrdered },
        { id: 'explain', label: 'Explain Simply', icon: Sparkles }
    ];

    return (
        <div className="flex gap-2 flex-wrap">
            {actions.map(action => {
                const Icon = action.icon;
                return (
                    <button
                        key={action.id}
                        onClick={() => onAction(action.id)}
                        disabled={disabled}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icon size={14} />
                        {action.label}
                    </button>
                );
            })}
        </div>
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const YouTubeEmbed = ({ onClose }) => {
    const [url, setUrl] = useState('');
    const [videoId, setVideoId] = useState(null);
    const [videoInfo, setVideoInfo] = useState(null);
    const [transcript, setTranscript] = useState(null);
    const [transcriptError, setTranscriptError] = useState(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(false);
    const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [activeTab, setActiveTab] = useState('video'); // video, transcript, qa
    const [qaHistory, setQaHistory] = useState([]);
    const [urlCopied, setUrlCopied] = useState(false);

    const qaContainerRef = useRef(null);

    // Handle URL submission
    const handleUrlSubmit = async (e) => {
        e.preventDefault();
        const extractedId = YouTubeService.extractVideoId(url);

        if (!extractedId) {
            alert('Please enter a valid YouTube URL');
            return;
        }

        setVideoId(extractedId);
        setIsLoadingInfo(true);
        setTranscript(null);
        setTranscriptError(null);
        setQaHistory([]);

        try {
            // Fetch video info
            const info = await YouTubeService.fetchVideoInfo(extractedId);
            setVideoInfo(info);

            // Attempt to fetch transcript
            setIsLoadingTranscript(true);
            const transcriptResult = await YouTubeService.fetchTranscript(extractedId);

            if (transcriptResult.success && transcriptResult.transcript) {
                setTranscript(YouTubeService.formatTranscriptWithTimestamps(transcriptResult.transcript));
            } else {
                setTranscriptError(transcriptResult.message || 'Transcript not available');
            }
        } catch (error) {
            console.error('Error loading video:', error);
        } finally {
            setIsLoadingInfo(false);
            setIsLoadingTranscript(false);
        }
    };

    // Handle asking questions
    const handleAskQuestion = async (question) => {
        setQaHistory(prev => [...prev, { type: 'user', message: question }]);
        setIsLoadingAI(true);

        // In production, this would call your AI backend
        // For demo, we'll simulate a response
        setTimeout(() => {
            const transcriptText = transcript
                ? transcript.map(s => s.text).join(' ')
                : 'Transcript not available';

            // Mock AI response
            const response = `Based on the video "${videoInfo?.title || 'this video'}", here's what I found regarding your question about "${question}":

This is a demo response. In production, this would use the actual transcript:

"${transcriptText.slice(0, 200)}..."

To enable full Q&A functionality:
1. Connect an AI backend (OpenAI, Ollama, etc.)
2. Implement transcript fetching via your backend
3. Use the provided prompt generators in YouTubeService.js`;

            setQaHistory(prev => [...prev, { type: 'ai', message: response }]);
            setIsLoadingAI(false);
        }, 1500);
    };

    // Handle quick actions
    const handleQuickAction = (actionId) => {
        const actionQuestions = {
            summarize: 'Please summarize this video in a few paragraphs.',
            keypoints: 'What are the main key points covered in this video?',
            explain: 'Can you explain the main topic of this video in simple terms?'
        };

        handleAskQuestion(actionQuestions[actionId]);
    };

    // Handle timestamp click (seek to time)
    const handleTimestampClick = (seconds) => {
        // In production, this would seek the embedded player
        // YouTube iframe API would be needed for this
        console.log('Seek to:', seconds);
    };

    // Copy video URL
    const handleCopyUrl = () => {
        if (videoId) {
            navigator.clipboard.writeText(`https://youtube.com/watch?v=${videoId}`);
            setUrlCopied(true);
            setTimeout(() => setUrlCopied(false), 2000);
        }
    };

    // Scroll to bottom of QA when new messages added
    useEffect(() => {
        if (qaContainerRef.current) {
            qaContainerRef.current.scrollTop = qaContainerRef.current.scrollHeight;
        }
    }, [qaHistory]);

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
            {/* Header */}
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                        <Youtube size={20} />
                    </div>
                    <div>
                        <h1 className="font-semibold text-gray-900">YouTube Analysis</h1>
                        <p className="text-xs text-gray-500">Embed, transcribe, and ask questions</p>
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
                <form onSubmit={handleUrlSubmit} className="flex gap-2">
                    <div className="flex-1 relative">
                        <Link2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste YouTube URL here..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!url.trim() || isLoadingInfo}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoadingInfo ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Play size={18} />
                        )}
                        Load Video
                    </button>
                </form>
            </div>

            {/* Main Content */}
            {videoId ? (
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Video + Info */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {/* Video Player */}
                        <VideoPlayer videoId={videoId} />

                        {/* Video Info */}
                        {videoInfo && (
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <h2 className="font-semibold text-gray-900 text-lg mb-1">
                                    {videoInfo.title}
                                </h2>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <a
                                        href={videoInfo.authorUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-indigo-600 flex items-center gap-1"
                                    >
                                        {videoInfo.author}
                                        <ExternalLink size={12} />
                                    </a>
                                    <button
                                        onClick={handleCopyUrl}
                                        className="flex items-center gap-1 hover:text-indigo-600"
                                    >
                                        {urlCopied ? <Check size={14} /> : <Copy size={14} />}
                                        {urlCopied ? 'Copied!' : 'Copy Link'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                            {[
                                { id: 'transcript', label: 'Transcript', icon: FileText },
                                { id: 'qa', label: 'Ask Questions', icon: MessageSquare }
                            ].map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <Icon size={16} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4">
                            {activeTab === 'transcript' && (
                                <TranscriptPanel
                                    transcript={transcript}
                                    isLoading={isLoadingTranscript}
                                    error={transcriptError}
                                    onTimestampClick={handleTimestampClick}
                                />
                            )}

                            {activeTab === 'qa' && (
                                <div className="space-y-4">
                                    <QuickActions
                                        onAction={handleQuickAction}
                                        disabled={isLoadingAI}
                                    />

                                    {/* QA History */}
                                    <div
                                        ref={qaContainerRef}
                                        className="space-y-3 max-h-64 overflow-y-auto"
                                    >
                                        {qaHistory.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400">
                                                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">Ask questions about this video</p>
                                            </div>
                                        ) : (
                                            qaHistory.map((item, idx) => (
                                                <QAMessage
                                                    key={idx}
                                                    message={item.message}
                                                    type={item.type}
                                                />
                                            ))
                                        )}
                                        {isLoadingAI && (
                                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                <Loader2 size={16} className="animate-spin" />
                                                Thinking...
                                            </div>
                                        )}
                                    </div>

                                    <QuestionInput
                                        onSubmit={handleAskQuestion}
                                        isLoading={isLoadingAI}
                                        disabled={false}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Empty State */
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Youtube size={40} className="text-red-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Analyze YouTube Videos
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Paste a YouTube URL above to embed the video, extract its transcript,
                            and ask AI-powered questions about the content.
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            {[
                                { icon: Play, label: 'Embed Video' },
                                { icon: FileText, label: 'Get Transcript' },
                                { icon: MessageSquare, label: 'Ask Questions' }
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
                </div>
            )}
        </div>
    );
};

export default YouTubeEmbed;
