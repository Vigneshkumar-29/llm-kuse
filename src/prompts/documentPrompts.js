/**
 * Document Generation Prompts
 * ===========================
 * 
 * Pre-built, professionally crafted prompts for AI-powered document generation.
 * Each prompt is designed to produce high-quality, structured output.
 * 
 * @version 1.0.0
 */

// =============================================================================
// PROMPT CATEGORIES
// =============================================================================

export const PROMPT_CATEGORIES = {
    REPORTS: 'reports',
    CV_RESUME: 'cv_resume',
    PRESENTATIONS: 'presentations',
    ANALYSIS: 'analysis',
    BUSINESS: 'business',
    CREATIVE: 'creative'
};

// =============================================================================
// REPORT GENERATION PROMPTS
// =============================================================================

export const reportPrompts = {
    /**
     * Generate a comprehensive report from raw data
     */
    generateFromData: {
        id: 'report_from_data',
        name: 'Generate Report from Data',
        category: PROMPT_CATEGORIES.REPORTS,
        description: 'Transform raw data into a structured, professional report',
        template: `You are a professional report writer. Generate a comprehensive report based on the following data and requirements.

## Input Data
{{data}}

## Report Requirements
- Title: {{title}}
- Type: {{reportType}}
- Target Audience: {{audience}}
- Tone: {{tone}}
- Length: {{length}}

## Instructions
1. Analyze the provided data thoroughly
2. Identify key insights, trends, and patterns
3. Structure the report with clear sections:
   - Executive Summary
   - Introduction
   - Methodology (if applicable)
   - Key Findings
   - Analysis & Insights
   - Recommendations
   - Conclusion
4. Use data visualizations suggestions where appropriate (describe charts/graphs)
5. Include actionable recommendations
6. Maintain a {{tone}} tone throughout
7. Format using Markdown with proper headers, lists, and emphasis

Generate the complete report now:`,
        variables: ['data', 'title', 'reportType', 'audience', 'tone', 'length'],
        defaults: {
            reportType: 'Business Report',
            audience: 'Executive Leadership',
            tone: 'professional',
            length: 'comprehensive'
        }
    },

    /**
     * Create an executive summary
     */
    executiveSummary: {
        id: 'executive_summary',
        name: 'Create Executive Summary',
        category: PROMPT_CATEGORIES.REPORTS,
        description: 'Condense a long document into an executive summary',
        template: `You are an expert at distilling complex information into concise executive summaries.

## Source Document
{{document}}

## Requirements
- Maximum Length: {{maxLength}} words
- Key Focus Areas: {{focusAreas}}
- Include: Key findings, recommendations, and next steps

## Instructions
1. Extract the most critical information
2. Prioritize actionable insights
3. Use bullet points for key takeaways
4. Include specific metrics and numbers where available
5. End with clear recommendations
6. Keep language clear and jargon-free

Generate the executive summary:`,
        variables: ['document', 'maxLength', 'focusAreas'],
        defaults: {
            maxLength: '300',
            focusAreas: 'key findings, recommendations, action items'
        }
    },

    /**
     * Progress/Status Report
     */
    progressReport: {
        id: 'progress_report',
        name: 'Generate Progress Report',
        category: PROMPT_CATEGORIES.REPORTS,
        description: 'Create a project progress or status report',
        template: `Generate a professional progress report with the following information:

## Project Details
- Project Name: {{projectName}}
- Reporting Period: {{period}}
- Project Manager: {{manager}}

## Current Status
{{statusInfo}}

## Completed Items
{{completedItems}}

## In Progress
{{inProgressItems}}

## Blockers/Issues
{{blockers}}

## Instructions
Create a structured progress report that includes:
1. Executive Summary (2-3 sentences)
2. Overall Status (On Track / At Risk / Delayed)
3. Key Achievements this period
4. Work in Progress with % completion
5. Risks and Mitigation strategies
6. Upcoming Milestones
7. Resource needs or requests
8. Next Steps

Use professional formatting with clear sections and bullet points.`,
        variables: ['projectName', 'period', 'manager', 'statusInfo', 'completedItems', 'inProgressItems', 'blockers'],
        defaults: {}
    }
};

// =============================================================================
// CV/RESUME PROMPTS
// =============================================================================

export const cvPrompts = {
    /**
     * Generate CV from information
     */
    generateFromInfo: {
        id: 'cv_from_info',
        name: 'Generate CV from Information',
        category: PROMPT_CATEGORIES.CV_RESUME,
        description: 'Create a professional CV/Resume from raw information',
        template: `You are a professional resume writer with expertise in creating compelling CVs that get interviews.

## Candidate Information
{{candidateInfo}}

## Target Role
- Position: {{targetPosition}}
- Industry: {{industry}}
- Experience Level: {{experienceLevel}}

## CV Style
- Format: {{format}}
- Emphasis: {{emphasis}}

## Instructions
1. Create a compelling professional summary (3-4 sentences)
2. Highlight relevant experience with quantifiable achievements
3. Use strong action verbs (Led, Developed, Implemented, etc.)
4. Include relevant skills organized by category
5. Format education appropriately for experience level
6. Add relevant certifications/awards if provided
7. Optimize for ATS (Applicant Tracking Systems)
8. Keep to {{pageLength}} page(s)

Generate the complete CV in Markdown format:`,
        variables: ['candidateInfo', 'targetPosition', 'industry', 'experienceLevel', 'format', 'emphasis', 'pageLength'],
        defaults: {
            format: 'Professional',
            emphasis: 'achievements and impact',
            pageLength: '1-2',
            experienceLevel: 'Mid-Level'
        }
    },

    /**
     * Optimize existing CV
     */
    optimizeCV: {
        id: 'optimize_cv',
        name: 'Optimize Existing CV',
        category: PROMPT_CATEGORIES.CV_RESUME,
        description: 'Improve and optimize an existing CV for a specific role',
        template: `You are a resume optimization expert. Improve the following CV for the target position.

## Current CV
{{currentCV}}

## Target Position
{{targetPosition}}

## Job Description
{{jobDescription}}

## Instructions
1. Analyze the job description for key requirements
2. Identify matching experience and highlight it
3. Rewrite bullet points with stronger impact
4. Add missing keywords from the job description
5. Quantify achievements where possible
6. Remove irrelevant information
7. Improve formatting and readability
8. Ensure ATS compatibility

Provide:
1. The optimized CV
2. A brief summary of changes made
3. Keywords that were incorporated`,
        variables: ['currentCV', 'targetPosition', 'jobDescription'],
        defaults: {}
    },

    /**
     * Generate achievement bullets
     */
    achievementBullets: {
        id: 'achievement_bullets',
        name: 'Generate Achievement Bullets',
        category: PROMPT_CATEGORIES.CV_RESUME,
        description: 'Create impactful achievement bullet points',
        template: `Generate powerful achievement bullet points for a resume.

## Role Information
- Position: {{position}}
- Company: {{company}}
- Industry: {{industry}}
- Duration: {{duration}}

## Responsibilities/Tasks
{{responsibilities}}

## Available Metrics
{{metrics}}

## Instructions
Generate 5-7 achievement-focused bullet points that:
1. Start with strong action verbs
2. Include specific metrics and percentages
3. Show impact and results
4. Use the CAR format (Challenge, Action, Result)
5. Are concise (1-2 lines each)
6. Are tailored to {{targetRole}} roles

Format each bullet with "• " prefix.`,
        variables: ['position', 'company', 'industry', 'duration', 'responsibilities', 'metrics', 'targetRole'],
        defaults: {}
    }
};

// =============================================================================
// PRESENTATION PROMPTS
// =============================================================================

export const presentationPrompts = {
    /**
     * Create presentation outline
     */
    createOutline: {
        id: 'presentation_outline',
        name: 'Create Presentation Outline',
        category: PROMPT_CATEGORIES.PRESENTATIONS,
        description: 'Generate a structured presentation outline with slide content',
        template: `You are a presentation design expert. Create a compelling presentation outline.

## Presentation Details
- Topic: {{topic}}
- Purpose: {{purpose}}
- Duration: {{duration}} minutes
- Audience: {{audience}}
- Style: {{style}}

## Key Points to Cover
{{keyPoints}}

## Instructions
Create a detailed presentation outline with:
1. Title slide details
2. Agenda/Overview slide
3. Content slides (one per main point)
4. For each content slide:
   - Slide title
   - 3-5 key bullet points
   - Suggested visual/graphic
   - Speaker notes (2-3 sentences)
5. Summary/Conclusion slide
6. Call-to-Action slide
7. Q&A slide

Aim for {{slideCount}} slides total.

Format as:
## Slide [N]: [Title]
**Content:**
- Bullet points

**Visual:** Description of suggested graphic

**Speaker Notes:** What to say

---`,
        variables: ['topic', 'purpose', 'duration', 'audience', 'style', 'keyPoints', 'slideCount'],
        defaults: {
            duration: '20',
            style: 'Professional',
            slideCount: '10-12'
        }
    },

    /**
     * Generate pitch deck
     */
    pitchDeck: {
        id: 'pitch_deck',
        name: 'Generate Pitch Deck',
        category: PROMPT_CATEGORIES.PRESENTATIONS,
        description: 'Create a startup or product pitch deck',
        template: `You are an expert pitch deck consultant who has helped raise billions in funding.

## Company/Product Information
{{companyInfo}}

## Pitch Details
- Stage: {{stage}}
- Ask: {{fundingAsk}}
- Industry: {{industry}}

## Instructions
Create a 10-12 slide pitch deck following the proven structure:

1. **Title Slide** - Company name, tagline, presenter
2. **Problem** - The pain point you're solving (make it relatable)
3. **Solution** - Your product/service (clear value proposition)
4. **Product** - Demo/screenshots/how it works
5. **Market Size** - TAM, SAM, SOM with sources
6. **Business Model** - How you make money
7. **Traction** - Key metrics, growth, social proof
8. **Competition** - Competitive landscape matrix
9. **Team** - Key team members and relevant experience
10. **Financials** - Projections, unit economics
11. **Ask** - Funding amount and use of funds
12. **Contact** - Call to action

For each slide provide:
- Headline (compelling, benefit-focused)
- Key content points
- Data/metrics to include
- Visual suggestions

Make it compelling, data-driven, and memorable.`,
        variables: ['companyInfo', 'stage', 'fundingAsk', 'industry'],
        defaults: {
            stage: 'Seed',
            fundingAsk: '$1M'
        }
    },

    /**
     * Generate speaker notes
     */
    speakerNotes: {
        id: 'speaker_notes',
        name: 'Generate Speaker Notes',
        category: PROMPT_CATEGORIES.PRESENTATIONS,
        description: 'Create detailed speaker notes for presentation slides',
        template: `Generate professional speaker notes for the following presentation slides.

## Presentation Context
- Topic: {{topic}}
- Audience: {{audience}}
- Tone: {{tone}}

## Slides
{{slides}}

## Instructions
For each slide, create speaker notes that:
1. Provide a natural speaking script (not to be read verbatim)
2. Include transition phrases to next slide
3. Suggest when to pause or emphasize
4. Include potential audience questions to address
5. Add timing guidance
6. Note where to use humor or anecdotes if appropriate

Keep each slide's notes to 100-150 words for a natural delivery pace.`,
        variables: ['topic', 'audience', 'tone', 'slides'],
        defaults: {
            tone: 'confident and engaging'
        }
    }
};

// =============================================================================
// ANALYSIS & SUMMARY PROMPTS
// =============================================================================

export const analysisPrompts = {
    /**
     * Summarize document
     */
    summarizeDocument: {
        id: 'summarize_document',
        name: 'Summarize Document',
        category: PROMPT_CATEGORIES.ANALYSIS,
        description: 'Create a concise summary of a long document',
        template: `You are an expert at summarizing complex documents while preserving key information.

## Document to Summarize
{{document}}

## Summary Requirements
- Length: {{summaryLength}}
- Focus: {{focus}}
- Format: {{format}}

## Instructions
1. Read and understand the entire document
2. Identify the main thesis/purpose
3. Extract key arguments and supporting evidence
4. Note any conclusions or recommendations
5. Preserve critical data points and statistics
6. Maintain the document's original intent

Provide the summary in {{format}} format.

{{#includeTakeaways}}
Also include:
- 3-5 Key Takeaways
- Action Items (if any)
{{/includeTakeaways}}`,
        variables: ['document', 'summaryLength', 'focus', 'format', 'includeTakeaways'],
        defaults: {
            summaryLength: '250-300 words',
            focus: 'key findings and recommendations',
            format: 'paragraph with bullet points',
            includeTakeaways: true
        }
    },

    /**
     * Extract key points
     */
    extractKeyPoints: {
        id: 'extract_key_points',
        name: 'Extract Key Points',
        category: PROMPT_CATEGORIES.ANALYSIS,
        description: 'Pull out the most important points from content',
        template: `Extract and organize the key points from the following content.

## Content
{{content}}

## Extraction Focus
{{extractionFocus}}

## Number of Points
{{numberOfPoints}}

## Instructions
1. Identify the {{numberOfPoints}} most important points
2. Rank them by importance/relevance
3. For each point, provide:
   - The key point (1 sentence)
   - Brief context or explanation (1-2 sentences)
   - Why it matters (1 sentence)
4. Group related points if applicable
5. Include any critical data or statistics

Format as:
### Key Point [N]: [Title]
**Point:** [The main point]
**Context:** [Explanation]
**Significance:** [Why it matters]

---`,
        variables: ['content', 'extractionFocus', 'numberOfPoints'],
        defaults: {
            extractionFocus: 'main arguments and conclusions',
            numberOfPoints: '5-7'
        }
    },

    /**
     * SWOT Analysis
     */
    swotAnalysis: {
        id: 'swot_analysis',
        name: 'Generate SWOT Analysis',
        category: PROMPT_CATEGORIES.ANALYSIS,
        description: 'Create a comprehensive SWOT analysis',
        template: `Conduct a thorough SWOT analysis based on the following information.

## Subject
{{subject}}

## Context/Industry
{{context}}

## Available Information
{{information}}

## Instructions
Create a comprehensive SWOT analysis with:

### Strengths (Internal, Positive)
- Identify 4-6 key strengths
- Include specific examples where possible
- Note competitive advantages

### Weaknesses (Internal, Negative)
- Identify 4-6 key weaknesses
- Be honest but constructive
- Note areas for improvement

### Opportunities (External, Positive)
- Identify 4-6 market opportunities
- Consider trends and changes
- Note potential for growth

### Threats (External, Negative)
- Identify 4-6 potential threats
- Consider competition and market changes
- Note risk factors

### Strategic Recommendations
Based on the SWOT, provide 3-5 strategic recommendations that:
- Leverage strengths to capture opportunities
- Address weaknesses before they become threats
- Include specific action items`,
        variables: ['subject', 'context', 'information'],
        defaults: {}
    },

    /**
     * Competitive Analysis
     */
    competitiveAnalysis: {
        id: 'competitive_analysis',
        name: 'Generate Competitive Analysis',
        category: PROMPT_CATEGORIES.ANALYSIS,
        description: 'Analyze competitors and market positioning',
        template: `Create a competitive analysis comparing the subject to its competitors.

## Subject (Your Product/Company)
{{subject}}

## Competitors
{{competitors}}

## Analysis Dimensions
{{dimensions}}

## Instructions
1. Create a comparison matrix covering:
   - Features/Capabilities
   - Pricing
   - Target Market
   - Strengths/Weaknesses
   - Market Position

2. For each competitor, provide:
   - Brief overview
   - Key differentiators
   - Threat level (High/Medium/Low)

3. Create a positioning summary:
   - Where you stand in the market
   - Your unique value proposition
   - Gaps in the market you can exploit

4. Strategic recommendations:
   - How to differentiate further
   - Features to prioritize
   - Markets to target

Use tables where appropriate for easy comparison.`,
        variables: ['subject', 'competitors', 'dimensions'],
        defaults: {
            dimensions: 'features, pricing, market focus, user experience'
        }
    }
};

// =============================================================================
// BUSINESS DOCUMENT PROMPTS
// =============================================================================

export const businessPrompts = {
    /**
     * Meeting Notes/Minutes
     */
    meetingNotes: {
        id: 'meeting_notes',
        name: 'Format Meeting Notes',
        category: PROMPT_CATEGORIES.BUSINESS,
        description: 'Transform raw meeting notes into professional minutes',
        template: `Transform the following meeting notes into professional meeting minutes.

## Raw Notes
{{rawNotes}}

## Meeting Details
- Meeting Title: {{meetingTitle}}
- Date: {{date}}
- Attendees: {{attendees}}
- Meeting Type: {{meetingType}}

## Instructions
Create professional meeting minutes with:
1. **Header** - Title, date, time, location, attendees
2. **Agenda Items** - List of topics discussed
3. **Discussion Summary** - Key points for each agenda item (concise)
4. **Decisions Made** - Clear list of all decisions with owners
5. **Action Items** - Each with:
   - Description
   - Assignee
   - Due date
6. **Next Steps** - Upcoming meetings or follow-ups
7. **Adjourn** - End time

Format professionally with clear sections and bullet points.`,
        variables: ['rawNotes', 'meetingTitle', 'date', 'attendees', 'meetingType'],
        defaults: {
            meetingType: 'Team Meeting'
        }
    },

    /**
     * Email draft
     */
    emailDraft: {
        id: 'email_draft',
        name: 'Draft Professional Email',
        category: PROMPT_CATEGORIES.BUSINESS,
        description: 'Create a professional email from key points',
        template: `Draft a professional email based on the following requirements.

## Email Purpose
{{purpose}}

## Key Points to Convey
{{keyPoints}}

## Recipient
- Name: {{recipientName}}
- Role/Relationship: {{recipientRole}}

## Tone
{{tone}}

## Additional Context
{{context}}

## Instructions
1. Create a compelling subject line
2. Use appropriate greeting
3. Get to the point in the first paragraph
4. Organize key points logically
5. Include a clear call-to-action
6. Use professional closing
7. Keep it concise ({{length}})

Provide:
**Subject:** [Subject line]

**Email:**
[Full email body]`,
        variables: ['purpose', 'keyPoints', 'recipientName', 'recipientRole', 'tone', 'context', 'length'],
        defaults: {
            tone: 'professional but friendly',
            length: 'under 200 words'
        }
    },

    /**
     * Project Proposal
     */
    projectProposal: {
        id: 'project_proposal',
        name: 'Generate Project Proposal',
        category: PROMPT_CATEGORIES.BUSINESS,
        description: 'Create a comprehensive project proposal',
        template: `Create a compelling project proposal document.

## Project Information
{{projectInfo}}

## Client/Stakeholder
{{clientInfo}}

## Budget Range
{{budget}}

## Timeline
{{timeline}}

## Instructions
Generate a professional proposal with:

1. **Executive Summary**
   - Brief overview (1 paragraph)
   - Key benefits and value proposition

2. **Problem Statement**
   - Current situation
   - Pain points addressed
   - Cost of inaction

3. **Proposed Solution**
   - Detailed approach
   - Key deliverables
   - Technologies/methods used

4. **Scope of Work**
   - In-scope items (bulleted)
   - Out-of-scope items
   - Assumptions

5. **Timeline & Milestones**
   - Phase breakdown
   - Key milestones with dates
   - Dependencies

6. **Investment**
   - Pricing breakdown
   - Payment terms
   - Optional add-ons

7. **Team**
   - Key team members
   - Relevant experience

8. **Next Steps**
   - How to proceed
   - Contact information

Make it compelling and professional.`,
        variables: ['projectInfo', 'clientInfo', 'budget', 'timeline'],
        defaults: {}
    }
};

// =============================================================================
// CREATIVE PROMPTS
// =============================================================================

export const creativePrompts = {
    /**
     * Blog post outline
     */
    blogOutline: {
        id: 'blog_outline',
        name: 'Create Blog Post Outline',
        category: PROMPT_CATEGORIES.CREATIVE,
        description: 'Generate a structured blog post outline',
        template: `Create a comprehensive outline for a blog post.

## Topic
{{topic}}

## Target Audience
{{audience}}

## Goal
{{goal}}

## Keywords to Include
{{keywords}}

## Desired Length
{{wordCount}} words

## Instructions
Create an SEO-optimized blog post outline with:

1. **Title Options** (3 compelling options)

2. **Meta Description** (155 characters max)

3. **Introduction Hook** (2-3 options)

4. **Main Sections** (H2 headings)
   - For each section:
     - H2 heading
     - Key points to cover
     - Suggested H3 subheadings
     - Data/examples to include

5. **Conclusion** - Key takeaways and CTA

6. **Internal/External Linking Suggestions**

Format with clear hierarchy and include word count estimates per section.`,
        variables: ['topic', 'audience', 'goal', 'keywords', 'wordCount'],
        defaults: {
            wordCount: '1500-2000'
        }
    },

    /**
     * Content repurposing
     */
    repurposeContent: {
        id: 'repurpose_content',
        name: 'Repurpose Content',
        category: PROMPT_CATEGORIES.CREATIVE,
        description: 'Transform content into different formats',
        template: `Transform the following content into different formats.

## Original Content
{{content}}

## Target Formats
{{targetFormats}}

## Instructions
Repurpose the content into each requested format:

{{#formats}}
### {{formatName}}
- Adapt tone and length appropriately
- Maintain key messages
- Optimize for the platform/format
- Include format-specific elements (hashtags for social, etc.)
{{/formats}}

For each format, provide ready-to-use content.`,
        variables: ['content', 'targetFormats'],
        defaults: {
            targetFormats: 'LinkedIn post, Twitter thread, Email newsletter'
        }
    }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all prompts as a flat array
 */
export const getAllPrompts = () => {
    return [
        ...Object.values(reportPrompts),
        ...Object.values(cvPrompts),
        ...Object.values(presentationPrompts),
        ...Object.values(analysisPrompts),
        ...Object.values(businessPrompts),
        ...Object.values(creativePrompts)
    ];
};

/**
 * Get prompts by category
 */
export const getPromptsByCategory = (category) => {
    const allPrompts = getAllPrompts();
    return allPrompts.filter(p => p.category === category);
};

/**
 * Get prompt by ID
 */
export const getPromptById = (promptId) => {
    const allPrompts = getAllPrompts();
    return allPrompts.find(p => p.id === promptId);
};

/**
 * Fill prompt template with variables
 */
export const fillPromptTemplate = (promptId, variables = {}) => {
    const prompt = getPromptById(promptId);
    if (!prompt) return null;

    let filledTemplate = prompt.template;

    // Apply defaults first
    const mergedVars = { ...prompt.defaults, ...variables };

    // Replace {{variable}} patterns
    Object.entries(mergedVars).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        filledTemplate = filledTemplate.replace(regex, value || '');
    });

    return filledTemplate;
};

/**
 * Validate required variables are provided
 */
export const validatePromptVariables = (promptId, variables = {}) => {
    const prompt = getPromptById(promptId);
    if (!prompt) return { valid: false, missing: [], message: 'Prompt not found' };

    const missing = prompt.variables.filter(v =>
        !variables[v] && !prompt.defaults?.[v]
    );

    return {
        valid: missing.length === 0,
        missing,
        message: missing.length > 0
            ? `Missing required variables: ${missing.join(', ')}`
            : 'All variables provided'
    };
};

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
    PROMPT_CATEGORIES,
    reportPrompts,
    cvPrompts,
    presentationPrompts,
    analysisPrompts,
    businessPrompts,
    creativePrompts,
    getAllPrompts,
    getPromptsByCategory,
    getPromptById,
    fillPromptTemplate,
    validatePromptVariables
};
