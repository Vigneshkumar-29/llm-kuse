import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ language, value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-xl overflow-hidden my-6 border border-black/5 shadow-2xl bg-[#282c34] group transform transition-all hover:scale-[1.01] duration-300">
            {/* Header with Mac-style controls */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#21252b] border-b border-black/20 select-none">
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm hover:bg-[#ff5f56]/80 transition-colors" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm hover:bg-[#ffbd2e]/80 transition-colors" />
                        <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm hover:bg-[#27c93f]/80 transition-colors" />
                    </div>
                     {/* Language Badge */}
                    <span className="text-xs font-mono text-white/40 uppercase tracking-wider font-semibold">
                        {language || 'TEXT'}
                    </span>
                </div>
                
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-all text-xs font-medium text-white/60 hover:text-white"
                >
                    {copied ? (
                        <>
                            <Check size={14} className="text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy size={14} />
                            <span>Copy code</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code Area */}
            <div className="relative text-sm">
                <SyntaxHighlighter
                    language={language || 'text'}
                    style={oneDark}
                    customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        background: 'transparent',
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                    }}
                    wrapLongLines={true}
                    showLineNumbers={true}
                    lineNumberStyle={{
                        minWidth: '3em',
                        paddingRight: '1.5em',
                        color: '#495162',
                        textAlign: 'right',
                        borderRight: '1px solid #333842',
                        marginRight: '1.5em'
                    }}
                >
                    {value}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

export default CodeBlock;
