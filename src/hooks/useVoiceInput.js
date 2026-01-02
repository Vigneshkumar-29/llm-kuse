/**
 * useVoiceInput Hook - Speech-to-Text Integration
 * =================================================
 * 
 * Provides voice input capabilities using the Web Speech API.
 * Falls back gracefully when not supported.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export const useVoiceInput = (options = {}) => {
    const {
        continuous = false,
        interimResults = true,
        language = 'en-US',
        onResult = () => { },
        onError = () => { }
    } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState(null);

    const recognitionRef = useRef(null);

    // Check for browser support
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = continuous;
            recognition.interimResults = interimResults;
            recognition.lang = language;

            recognition.onstart = () => {
                setIsListening(true);
                setError(null);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                const errorMessage = {
                    'no-speech': 'No speech detected. Please try again.',
                    'audio-capture': 'Microphone not available.',
                    'not-allowed': 'Microphone permission denied.',
                    'network': 'Network error occurred.',
                    'aborted': 'Speech recognition aborted.'
                }[event.error] || `Error: ${event.error}`;

                setError(errorMessage);
                setIsListening(false);
                onError(errorMessage);
            };

            recognition.onresult = (event) => {
                let finalTranscript = '';
                let currentInterim = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript;
                    } else {
                        currentInterim += result[0].transcript;
                    }
                }

                if (finalTranscript) {
                    setTranscript(prev => prev + finalTranscript);
                    onResult(finalTranscript);
                }
                setInterimTranscript(currentInterim);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [continuous, interimResults, language, onResult, onError]);

    /**
     * Start listening for voice input
     */
    const startListening = useCallback(() => {
        if (!isSupported || !recognitionRef.current) {
            setError('Speech recognition not supported in this browser.');
            return;
        }

        setTranscript('');
        setInterimTranscript('');
        setError(null);

        try {
            recognitionRef.current.start();
        } catch (e) {
            // Already started
            if (e.message.includes('already started')) {
                recognitionRef.current.stop();
                setTimeout(() => recognitionRef.current.start(), 100);
            }
        }
    }, [isSupported]);

    /**
     * Stop listening
     */
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    /**
     * Toggle listening state
     */
    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    /**
     * Clear transcript
     */
    const clearTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        isListening,
        isSupported,
        transcript,
        interimTranscript,
        fullTranscript: transcript + interimTranscript,
        error,
        startListening,
        stopListening,
        toggleListening,
        clearTranscript
    };
};

export default useVoiceInput;
