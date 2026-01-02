/**
 * Workspace Components - CodePreview
 * ===================================
 * 
 * Live code preview component for HTML/CSS/JavaScript.
 * Renders code in an isolated iframe with live updates.
 * 
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Play, RefreshCw, ExternalLink, Maximize2, Minimize2,
    Code2, Eye, Copy, Check, AlertCircle, Smartphone, Monitor, Tablet
} from 'lucide-react';

// =============================================================================
// DEVICE PRESETS
// =============================================================================

const DEVICE_PRESETS = {
    desktop: { width: '100%', height: '100%', icon: Monitor, label: 'Desktop' },
    tablet: { width: '768px', height: '1024px', icon: Tablet, label: 'Tablet' },
    mobile: { width: '375px', height: '667px', icon: Smartphone, label: 'Mobile' }
};

// =============================================================================
// CODE PREVIEW COMPONENT
// =============================================================================

const CodePreview = ({
    html = '',
    css = '',
    javascript = '',
    combinedCode = '', // Single string containing all code
    autoRun = true,
    showDeviceToggle = true,
    showRefresh = true,
    showFullscreen = true,
    className = ''
}) => {
    const [activeDevice, setActiveDevice] = useState('desktop');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(Date.now());
    const [isCopied, setIsCopied] = useState(false);
    const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'code'
    const iframeRef = useRef(null);
    const containerRef = useRef(null);

    // Parse combined code if provided
    const parsedCode = useMemo(() => {
        if (combinedCode) {
            // Try to extract HTML, CSS, and JS from combined code
            let extractedHtml = combinedCode;
            let extractedCss = '';
            let extractedJs = '';

            // Extract <style> content
            const styleMatch = combinedCode.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
            if (styleMatch) {
                extractedCss = styleMatch.map(s =>
                    s.replace(/<\/?style[^>]*>/gi, '')
                ).join('\n');
            }

            // Extract <script> content
            const scriptMatch = combinedCode.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
            if (scriptMatch) {
                extractedJs = scriptMatch.map(s =>
                    s.replace(/<\/?script[^>]*>/gi, '')
                ).join('\n');
            }

            return { html: extractedHtml, css: extractedCss, js: extractedJs };
        }

        return { html, css, js: javascript };
    }, [combinedCode, html, css, javascript]);

    // Build complete HTML document
    const getCompleteHtml = useMemo(() => {
        if (combinedCode && combinedCode.includes('<!DOCTYPE') || combinedCode.includes('<html')) {
            return combinedCode;
        }

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, -apple-system, sans-serif; }
        ${parsedCode.css}
    </style>
</head>
<body>
    ${parsedCode.html}
    <script>
        try {
            ${parsedCode.js}
        } catch (error) {
            console.error('Preview Error:', error);
        }
    </script>
</body>
</html>`;
    }, [parsedCode, combinedCode]);

    // Update iframe content
    useEffect(() => {
        if (!iframeRef.current || !autoRun) return;

        try {
            const iframe = iframeRef.current;
            const doc = iframe.contentDocument || iframe.contentWindow?.document;

            if (doc) {
                doc.open();
                doc.write(getCompleteHtml);
                doc.close();
                setError(null);
            }
        } catch (err) {
            setError(err.message);
        }
    }, [getCompleteHtml, lastUpdate, autoRun]);

    // Refresh preview
    const handleRefresh = () => {
        setLastUpdate(Date.now());
    };

    // Toggle fullscreen
    const toggleFullscreen = async () => {
        if (!containerRef.current) return;

        if (!isFullscreen) {
            try {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } catch (err) {
                console.error('Fullscreen error:', err);
            }
        } else {
            try {
                await document.exitFullscreen();
                setIsFullscreen(false);
            } catch (err) {
                console.error('Exit fullscreen error:', err);
            }
        }
    };

    // Handle fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Copy code
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(getCompleteHtml);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    // Open in new tab
    const openInNewTab = () => {
        const blob = new Blob([getCompleteHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    const deviceConfig = DEVICE_PRESETS[activeDevice];

    return (
        <div
            ref={containerRef}
            className={`
                flex flex-col bg-neutral-900 rounded-xl overflow-hidden
                ${isFullscreen ? 'fixed inset-0 z-50' : ''}
                ${className}
            `}
        >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 
                           border-b border-neutral-800 bg-neutral-900">
                {/* Left - View Toggle */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-800">
                    <button
                        onClick={() => setViewMode('preview')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
                                  transition-colors ${viewMode === 'preview'
                                ? 'bg-indigo-600 text-white'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                    >
                        <Eye size={14} />
                        Preview
                    </button>
                    <button
                        onClick={() => setViewMode('code')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
                                  transition-colors ${viewMode === 'code'
                                ? 'bg-indigo-600 text-white'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                    >
                        <Code2 size={14} />
                        Code
                    </button>
                </div>

                {/* Center - Device Toggle */}
                {showDeviceToggle && viewMode === 'preview' && (
                    <div className="flex items-center gap-1">
                        {Object.entries(DEVICE_PRESETS).map(([key, device]) => {
                            const Icon = device.icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveDevice(key)}
                                    className={`p-2 rounded-md transition-colors ${activeDevice === key
                                            ? 'bg-indigo-600/20 text-indigo-400'
                                            : 'text-neutral-500 hover:text-neutral-300'
                                        }`}
                                    title={device.label}
                                >
                                    <Icon size={16} />
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Right - Actions */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleCopy}
                        className="p-2 rounded-md text-neutral-500 hover:text-neutral-300 transition-colors"
                        title="Copy code"
                    >
                        {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>

                    {showRefresh && (
                        <button
                            onClick={handleRefresh}
                            className="p-2 rounded-md text-neutral-500 hover:text-neutral-300 transition-colors"
                            title="Refresh preview"
                        >
                            <RefreshCw size={16} />
                        </button>
                    )}

                    <button
                        onClick={openInNewTab}
                        className="p-2 rounded-md text-neutral-500 hover:text-neutral-300 transition-colors"
                        title="Open in new tab"
                    >
                        <ExternalLink size={16} />
                    </button>

                    {showFullscreen && (
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-md text-neutral-500 hover:text-neutral-300 transition-colors"
                            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-hidden bg-neutral-800">
                {error && (
                    <div className="absolute top-0 left-0 right-0 p-3 
                                   bg-red-500/20 border-b border-red-500/30 
                                   flex items-center gap-2 text-red-400 text-sm z-10">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {viewMode === 'preview' ? (
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <motion.div
                            layout
                            style={{
                                width: deviceConfig.width,
                                height: deviceConfig.height,
                                maxWidth: '100%',
                                maxHeight: '100%'
                            }}
                            className="bg-white rounded-lg shadow-2xl overflow-hidden"
                        >
                            <iframe
                                ref={iframeRef}
                                title="Code Preview"
                                className="w-full h-full border-0"
                                sandbox="allow-scripts allow-same-origin"
                            />
                        </motion.div>
                    </div>
                ) : (
                    <div className="w-full h-full overflow-auto">
                        <pre className="p-4 text-sm text-neutral-300 font-mono whitespace-pre-wrap">
                            <code>{getCompleteHtml}</code>
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodePreview;
