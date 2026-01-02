/**
 * VoiceInputButton - Microphone Button for Voice Input
 * ======================================================
 * 
 * A stylish button that enables voice-to-text input.
 */

import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceInput } from '../hooks';

const VoiceInputButton = ({ onTranscript, className = '' }) => {
    const {
        isListening,
        isSupported,
        interimTranscript,
        error,
        toggleListening
    } = useVoiceInput({
        continuous: false,
        interimResults: true,
        onResult: (text) => {
            onTranscript?.(text);
        }
    });

    if (!isSupported) {
        return null; // Don't render if not supported
    }

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={toggleListening}
                className={`
                    p-2.5 rounded-xl transition-all duration-300
                    ${isListening
                        ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-300'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }
                `}
                title={isListening ? 'Stop listening' : 'Voice input'}
            >
                {isListening ? (
                    <div className="relative">
                        <Mic size={20} />
                        {/* Ripple effect */}
                        <span className="absolute inset-0 rounded-full animate-ping bg-white/30" />
                    </div>
                ) : (
                    <Mic size={20} />
                )}
            </button>

            {/* Listening indicator */}
            {isListening && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap animate-enter">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                            <span className="w-1 h-3 bg-red-400 rounded-full animate-pulse" />
                            <span className="w-1 h-3 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <span className="w-1 h-3 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                        <span>Listening...</span>
                    </div>
                    {interimTranscript && (
                        <p className="mt-1 text-gray-300 max-w-48 truncate">
                            {interimTranscript}
                        </p>
                    )}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
            )}

            {/* Error tooltip */}
            {error && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-red-500 text-white text-xs rounded-lg whitespace-nowrap animate-enter">
                    {error}
                </div>
            )}
        </div>
    );
};

export default VoiceInputButton;
