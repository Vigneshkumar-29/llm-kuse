/**
 * Presentation Template
 * =======================
 * 
 * Professional presentation templates for pitches, reports,
 * training, and various business purposes.
 * 
 * @version 1.0.0
 */

// =============================================================================
// PRESENTATION VARIANTS
// =============================================================================

export const PRESENTATION_VARIANTS = {
    PITCH_DECK: 'pitch_deck',
    BUSINESS: 'business',
    TRAINING: 'training',
    REPORT: 'report',
    PROJECT: 'project',
    CREATIVE: 'creative'
};

// =============================================================================
// TEMPLATE DEFINITION
// =============================================================================

const PresentationTemplate = {
    id: 'presentation',
    name: 'Presentation',
    description: 'Professional presentation outlines and slide decks',
    icon: 'Presentation',
    category: 'documents',

    // Available variants
    variants: [
        {
            id: PRESENTATION_VARIANTS.PITCH_DECK,
            name: 'Pitch Deck',
            description: 'Investor pitch presentation (10-12 slides)',
            icon: 'Rocket'
        },
        {
            id: PRESENTATION_VARIANTS.BUSINESS,
            name: 'Business Presentation',
            description: 'Corporate meeting presentation',
            icon: 'Briefcase'
        },
        {
            id: PRESENTATION_VARIANTS.TRAINING,
            name: 'Training Presentation',
            description: 'Educational/training materials',
            icon: 'GraduationCap'
        },
        {
            id: PRESENTATION_VARIANTS.REPORT,
            name: 'Report Presentation',
            description: 'Data-driven report presentation',
            icon: 'BarChart2'
        },
        {
            id: PRESENTATION_VARIANTS.PROJECT,
            name: 'Project Update',
            description: 'Project status presentation',
            icon: 'Layers'
        },
        {
            id: PRESENTATION_VARIANTS.CREATIVE,
            name: 'Creative Presentation',
            description: 'Portfolio/creative showcase',
            icon: 'Palette'
        }
    ],

    // Template fields/variables
    fields: [
        { id: 'title', label: 'Presentation Title', type: 'text', required: true, placeholder: 'Q4 Business Review' },
        { id: 'subtitle', label: 'Subtitle', type: 'text', required: false, placeholder: 'Annual Performance Summary' },
        { id: 'presenter', label: 'Presenter Name', type: 'text', required: true, placeholder: 'John Smith' },
        { id: 'company', label: 'Company/Organization', type: 'text', required: false, placeholder: 'Acme Corp' },
        { id: 'date', label: 'Presentation Date', type: 'date', required: true },
        { id: 'audience', label: 'Target Audience', type: 'text', required: false, placeholder: 'Leadership Team' },
        { id: 'duration', label: 'Duration (minutes)', type: 'number', required: false, defaultValue: 30 },
        {
            id: 'slides', label: 'Slides', type: 'array', required: true, section: 'slides',
            itemFields: [
                { id: 'slideTitle', label: 'Slide Title', type: 'text' },
                { id: 'slideType', label: 'Slide Type', type: 'select', options: ['Title', 'Content', 'Image', 'Chart', 'Quote', 'Comparison', 'Timeline', 'Team', 'CTA'] },
                { id: 'bulletPoints', label: 'Key Points', type: 'array' },
                { id: 'speakerNotes', label: 'Speaker Notes', type: 'textarea' }
            ]
        },
        { id: 'keyMessage', label: 'Key Message', type: 'textarea', required: false, placeholder: 'Main takeaway...' }
    ],

    // Template structure (Markdown)
    structure: {
        [PRESENTATION_VARIANTS.PITCH_DECK]: `# {{title}}
## {{subtitle}}

**Presenter:** {{presenter}}  
**Date:** {{date}}

---

## Slide Deck Outline

---

### 📌 Slide 1: Title Slide

# {{title}}
### {{subtitle}}

{{presenter}} | {{company}} | {{date}}

---

### 📌 Slide 2: Problem

## The Problem

{{problemStatement}}

**Market Pain Points:**
{{#painPoints}}
- {{.}}
{{/painPoints}}

*Speaker Notes: {{slide2Notes}}*

---

### 📌 Slide 3: Solution

## Our Solution

{{solutionOverview}}

**Key Features:**
{{#features}}
- ✅ {{.}}
{{/features}}

---

### 📌 Slide 4: Product Demo

## How It Works

{{productDescription}}

[Demo/Screenshots/Video]

---

### 📌 Slide 5: Market Opportunity

## Market Size

| Metric | Value |
|--------|-------|
| TAM | {{tam}} |
| SAM | {{sam}} |
| SOM | {{som}} |

---

### 📌 Slide 6: Business Model

## Revenue Model

{{businessModel}}

**Revenue Streams:**
{{#revenueStreams}}
- {{.}}
{{/revenueStreams}}

---

### 📌 Slide 7: Traction

## Traction & Milestones

{{#milestones}}
- ✅ {{milestone}} ({{date}})
{{/milestones}}

**Key Metrics:**
{{keyMetrics}}

---

### 📌 Slide 8: Competition

## Competitive Landscape

| Feature | Us | Competitor A | Competitor B |
|---------|----|--------------| -------------|
{{#comparisonFeatures}}
| {{feature}} | {{us}} | {{compA}} | {{compB}} |
{{/comparisonFeatures}}

---

### 📌 Slide 9: Team

## Our Team

{{#teamMembers}}
**{{name}}** — {{role}}
{{bio}}

{{/teamMembers}}

---

### 📌 Slide 10: Financials

## Financial Projections

{{financialSummary}}

**Ask:** \${{ fundingAsk }}

**Use of Funds:**
{{#useOfFunds}}
- {{category}}: {{percentage}}%
{{/useOfFunds}}

---

### 📌 Slide 11: Call to Action

## Let's Connect

{{callToAction}}

📧 {{email}}
🔗 {{website}}

---

*Total Slides: 11 | Est. Duration: {{duration}} minutes*
`,

        [PRESENTATION_VARIANTS.BUSINESS]: `# {{title}}
## {{subtitle}}

**Presented by:** {{presenter}}  
**Department:** {{department}}  
**Date:** {{date}}

---

## Agenda

{{#slides}}
{{slideNumber}}. {{slideTitle}}
{{/slides}}

---

{{#slides}}
### Slide {{slideNumber}}: {{slideTitle}}

{{#bulletPoints}}
- {{.}}
{{/bulletPoints}}

{{#hasData}}
**Key Data:**
{{data}}
{{/hasData}}

*Speaker Notes:*
> {{speakerNotes}}

---
{{/slides}}

### Thank You

**Questions?**

{{presenter}}  
{{email}}  
{{phone}}

---

*Presentation Duration: {{duration}} minutes*
`,

        [PRESENTATION_VARIANTS.TRAINING]: `# Training: {{title}}
## {{subtitle}}

**Instructor:** {{presenter}}  
**Duration:** {{duration}} minutes  
**Date:** {{date}}

---

## Learning Objectives

By the end of this training, participants will be able to:

{{#objectives}}
{{number}}. {{objective}}
{{/objectives}}

---

## Agenda

| Time | Topic | Activity |
|------|-------|----------|
{{#agenda}}
| {{time}} | {{topic}} | {{activity}} |
{{/agenda}}

---

{{#slides}}
## Module {{moduleNumber}}: {{slideTitle}}

### Key Concepts

{{#bulletPoints}}
- {{.}}
{{/bulletPoints}}

### Activity

{{activity}}

### Discussion Questions

{{#questions}}
- {{.}}
{{/questions}}

---
{{/slides}}

## Summary & Key Takeaways

{{#takeaways}}
✅ {{.}}
{{/takeaways}}

---

## Resources

{{#resources}}
- [{{title}}]({{link}})
{{/resources}}

---

## Assessment

{{assessmentInfo}}

---

## Next Steps

{{nextSteps}}

---

*Questions? Contact {{presenter}} at {{email}}*
`,

        [PRESENTATION_VARIANTS.PROJECT]: `# Project Update
## {{title}}

**Project Manager:** {{presenter}}  
**Status Date:** {{date}}  
**Reporting Period:** {{reportingPeriod}}

---

## Executive Summary

**Overall Status:** {{overallStatus}}

{{executiveSummary}}

---

## Project Health

| Metric | Status |
|--------|--------|
| Schedule | {{scheduleStatus}} |
| Budget | {{budgetStatus}} |
| Scope | {{scopeStatus}} |
| Quality | {{qualityStatus}} |

---

## Completed This Period

{{#completed}}
✅ {{.}}
{{/completed}}

---

## In Progress

{{#inProgress}}
🔄 {{task}} — {{percentage}}% complete
{{/inProgress}}

---

## Upcoming Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
{{#milestones}}
| {{name}} | {{date}} | {{status}} |
{{/milestones}}

---

## Risks & Issues

{{#risks}}
⚠️ **{{riskTitle}}**
- Impact: {{impact}}
- Probability: {{probability}}
- Mitigation: {{mitigation}}

{{/risks}}

---

## Budget Summary

| Category | Planned | Actual | Variance |
|----------|---------|--------|----------|
{{#budgetItems}}
| {{category}} | {{planned}} | {{actual}} | {{variance}} |
{{/budgetItems}}

---

## Next Steps

{{#nextSteps}}
→ {{.}}
{{/nextSteps}}

---

## Questions & Discussion

{{discussionPoints}}
`
    },

    // AI Prompts for content generation
    aiPrompts: {
        [PRESENTATION_VARIANTS.PITCH_DECK]: `Create a compelling pitch deck outline for:

Company/Product: {{productName}}
Industry: {{industry}}
Stage: {{stage}}
Funding Target: {{fundingTarget}}

Generate content for each slide including:
1. Problem statement
2. Solution overview
3. Market size (TAM/SAM/SOM)
4. Business model
5. Competitive advantages
6. Team highlights
7. Financial projections
8. Ask and use of funds

Make it concise and compelling for investors.`,

        [PRESENTATION_VARIANTS.TRAINING]: `Create a training presentation outline for:

Topic: {{topic}}
Audience: {{audience}}
Duration: {{duration}} minutes
Skill Level: {{skillLevel}}

Include:
1. Clear learning objectives
2. Module breakdown
3. Key concepts for each module
4. Discussion questions
5. Hands-on activities
6. Assessment ideas`
    },

    // Slide templates
    slideTemplates: {
        title: {
            layout: 'centered',
            elements: ['title', 'subtitle', 'presenter', 'date']
        },
        content: {
            layout: 'standard',
            elements: ['title', 'bulletPoints']
        },
        twoColumn: {
            layout: 'split',
            elements: ['title', 'leftContent', 'rightContent']
        },
        imageSlide: {
            layout: 'image-focused',
            elements: ['title', 'image', 'caption']
        },
        chart: {
            layout: 'data',
            elements: ['title', 'chart', 'insights']
        },
        comparison: {
            layout: 'comparison',
            elements: ['title', 'option1', 'option2']
        },
        quote: {
            layout: 'quote',
            elements: ['quote', 'attribution']
        },
        cta: {
            layout: 'centered',
            elements: ['title', 'cta', 'contact']
        }
    },

    // Default values
    defaults: {
        variant: PRESENTATION_VARIANTS.BUSINESS,
        slides: [],
        duration: 30
    },

    // Export formats supported
    exportFormats: ['pdf', 'html', 'markdown', 'pptx'],

    // Styling options
    styles: {
        corporate: {
            fontFamily: 'Inter, sans-serif',
            headingFont: 'Playfair Display, serif',
            primaryColor: '#1a365d',
            accentColor: '#2b6cb0',
            backgroundColor: '#ffffff'
        },
        modern: {
            fontFamily: 'Roboto, sans-serif',
            headingFont: 'Roboto, sans-serif',
            primaryColor: '#1f2937',
            accentColor: '#6366f1',
            backgroundColor: '#f9fafb'
        },
        dark: {
            fontFamily: 'Inter, sans-serif',
            headingFont: 'Inter, sans-serif',
            primaryColor: '#f9fafb',
            accentColor: '#818cf8',
            backgroundColor: '#111827'
        }
    }
};

export default PresentationTemplate;
