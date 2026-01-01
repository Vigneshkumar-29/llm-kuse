import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Terminal } from 'lucide-react';

const CodeBlock = ({ language, value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-xl overflow-hidden my-4 border border-black/10 shadow-sm bg-[#1e1e1e] group transition-all hover:shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-white/40" />
                    <span className="text-xs font-mono text-white/60 lowercase">{language || 'text'}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
                >
                    {copied ? (
                        <>
                            <Check size={14} className="text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy size={14} />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code Area */}
            <div className="relative text-sm">
                <SyntaxHighlighter
                    language={language || 'text'}
                    style={atomDark}
                    customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        background: 'transparent',
                        fontSize: '0.9em',
                        fontFamily: '"JetBrains Mono", monospace'
                    }}
                    wrapLongLines={true}
                >
                    {value}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

export default CodeBlock;
