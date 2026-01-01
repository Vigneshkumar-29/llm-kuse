/**
 * YouTube Service
 * ================
 * 
 * Handles YouTube URL parsing, video info extraction, and transcript fetching.
 * 
 * Note: Transcript extraction requires either:
 * 1. A backend proxy (due to CORS restrictions)
 * 2. A third-party API service
 * 3. Browser extension capabilities
 * 
 * This service provides the structure and mock functionality.
 * Connect to your backend for production use.
 * 
 * @version 1.0.0
 */

// =============================================================================
// URL PARSING
// =============================================================================

/**
 * Extract video ID from various YouTube URL formats
 */
export const extractVideoId = (url) => {
    if (!url) return null;

    // Patterns to match
    const patterns = [
        // Standard: https://www.youtube.com/watch?v=VIDEO_ID
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        // Short: https://youtu.be/VIDEO_ID
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        // Embed: https://www.youtube.com/embed/VIDEO_ID
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        // Shorts: https://www.youtube.com/shorts/VIDEO_ID
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        // Just the ID
        /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
};

/**
 * Validate if a string is a valid YouTube URL or video ID
 */
export const isValidYouTubeUrl = (url) => {
    return extractVideoId(url) !== null;
};

/**
 * Get embed URL from video ID
 */
export const getEmbedUrl = (videoId, options = {}) => {
    const params = new URLSearchParams({
        rel: '0', // Don't show related videos
        modestbranding: '1', // Minimal YouTube branding
        ...options
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

/**
 * Get thumbnail URLs for a video
 */
export const getThumbnails = (videoId) => {
    return {
        default: `https://img.youtube.com/vi/${videoId}/default.jpg`,
        medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        high: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };
};

// =============================================================================
// VIDEO INFO (via oEmbed - no API key required)
// =============================================================================

/**
 * Fetch basic video info using YouTube's oEmbed endpoint
 */
export const fetchVideoInfo = async (videoId) => {
    try {
        const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch video info');
        }

        const data = await response.json();
        return {
            title: data.title,
            author: data.author_name,
            authorUrl: data.author_url,
            thumbnailUrl: data.thumbnail_url,
            thumbnailWidth: data.thumbnail_width,
            thumbnailHeight: data.thumbnail_height,
            providerName: data.provider_name,
            videoId
        };
    } catch (error) {
        console.error('Error fetching video info:', error);
        return null;
    }
};

// =============================================================================
// TRANSCRIPT HANDLING
// =============================================================================

/**
 * Fetch transcript from backend API
 * 
 * In production, implement a backend endpoint that uses:
 * - youtube-transcript-api (Python)
 * - youtube-captions-scraper (Node.js)
 * - Or YouTube Data API v3 with captions
 * 
 * This is a mock implementation that demonstrates the expected format.
 */
export const fetchTranscript = async (videoId, language = 'en') => {
    // In production, replace with actual API call:
    // const response = await fetch(`/api/youtube/transcript/${videoId}?lang=${language}`);

    // Mock implementation for demo
    console.log(`Fetching transcript for video: ${videoId} in language: ${language}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock transcript structure
    // In production, this would come from your backend
    return {
        success: false,
        message: 'Transcript fetching requires a backend service. Connect your API endpoint.',
        transcript: null,
        availableLanguages: [],
        // Expected transcript format when available:
        // transcript: [
        //     { text: 'Hello and welcome', start: 0, duration: 2.5 },
        //     { text: 'to this video', start: 2.5, duration: 1.8 },
        //     ...
        // ]
    };
};

/**
 * Format transcript for display
 */
export const formatTranscript = (transcriptData) => {
    if (!transcriptData || !Array.isArray(transcriptData)) {
        return '';
    }

    return transcriptData
        .map(segment => segment.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Format transcript with timestamps
 */
export const formatTranscriptWithTimestamps = (transcriptData) => {
    if (!transcriptData || !Array.isArray(transcriptData)) {
        return [];
    }

    return transcriptData.map(segment => ({
        ...segment,
        formattedTime: formatTime(segment.start)
    }));
};

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// =============================================================================
// AI PROMPT GENERATION
// =============================================================================

/**
 * Generate AI prompt for video Q&A
 */
export const generateVideoQAPrompt = (videoInfo, transcript, userQuestion) => {
    return `You are an AI assistant helping answer questions about a YouTube video.

## Video Information
- Title: ${videoInfo?.title || 'Unknown'}
- Channel: ${videoInfo?.author || 'Unknown'}

## Video Transcript
${transcript || 'Transcript not available. Please answer based on general knowledge about the video topic.'}

## User Question
${userQuestion}

## Instructions
1. Answer the question based primarily on the transcript content
2. If the answer isn't in the transcript, say so clearly
3. Reference specific parts of the video when relevant
4. Keep your answer concise and helpful
5. If asked for timestamps, reference approximate times from the transcript

Please provide your answer:`;
};

/**
 * Generate summary prompt for video
 */
export const generateVideoSummaryPrompt = (videoInfo, transcript) => {
    return `Summarize the following YouTube video:

## Video Information
- Title: ${videoInfo?.title || 'Unknown'}
- Channel: ${videoInfo?.author || 'Unknown'}

## Transcript
${transcript || 'Transcript not available.'}

## Instructions
1. Provide a concise summary (150-200 words)
2. Highlight the main topics covered
3. List 3-5 key takeaways
4. Note any important timestamps or sections

Generate the summary:`;
};

/**
 * Generate key points extraction prompt
 */
export const generateKeyPointsPrompt = (videoInfo, transcript) => {
    return `Extract the key points from this YouTube video:

## Video Information
- Title: ${videoInfo?.title || 'Unknown'}
- Channel: ${videoInfo?.author || 'Unknown'}

## Transcript
${transcript || 'Transcript not available.'}

## Instructions
1. Extract 5-10 main points from the video
2. For each point, include approximate timestamp if available
3. Organize points in chronological order
4. Highlight any actionable advice or important facts

List the key points:`;
};

// =============================================================================
// CHAPTER DETECTION (from timestamps in description)
// =============================================================================

/**
 * Parse chapters from video description
 * YouTube auto-generates chapters from timestamps in format:
 * 0:00 Introduction
 * 1:30 First Topic
 * etc.
 */
export const parseChapters = (description) => {
    if (!description) return [];

    const chapterPattern = /(?:^|\n)(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+?)(?=\n|$)/g;
    const chapters = [];
    let match;

    while ((match = chapterPattern.exec(description)) !== null) {
        const [, time, title] = match;
        const seconds = timeToSeconds(time);
        chapters.push({
            time,
            seconds,
            title: title.trim()
        });
    }

    return chapters;
};

/**
 * Convert timestamp string to seconds
 */
export const timeToSeconds = (timeStr) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return parts[0] * 60 + parts[1];
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
    extractVideoId,
    isValidYouTubeUrl,
    getEmbedUrl,
    getThumbnails,
    fetchVideoInfo,
    fetchTranscript,
    formatTranscript,
    formatTranscriptWithTimestamps,
    formatTime,
    generateVideoQAPrompt,
    generateVideoSummaryPrompt,
    generateKeyPointsPrompt,
    parseChapters,
    timeToSeconds
};
