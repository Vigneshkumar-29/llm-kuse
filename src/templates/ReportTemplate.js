/**
 * Report Template
 * ================
 * 
 * Professional report templates for various purposes including
 * business reports, technical documentation, and research papers.
 * 
 * @version 1.0.0
 */

// =============================================================================
// REPORT VARIANTS
// =============================================================================

export const REPORT_VARIANTS = {
    BUSINESS: 'business',
    TECHNICAL: 'technical',
    RESEARCH: 'research',
    EXECUTIVE_SUMMARY: 'executive_summary',
    PROGRESS: 'progress',
    ANALYSIS: 'analysis'
};

// =============================================================================
// TEMPLATE DEFINITION
// =============================================================================

const ReportTemplate = {
    id: 'report',
    name: 'Report',
    description: 'Professional report templates for business, technical, and research purposes',
    icon: 'FileText',
    category: 'documents',

    // Available variants
    variants: [
        {
            id: REPORT_VARIANTS.BUSINESS,
            name: 'Business Report',
            description: 'Formal business report with executive summary',
            icon: 'Briefcase'
        },
        {
            id: REPORT_VARIANTS.TECHNICAL,
            name: 'Technical Report',
            description: 'Detailed technical documentation',
            icon: 'Code'
        },
        {
            id: REPORT_VARIANTS.RESEARCH,
            name: 'Research Report',
            description: 'Academic-style research paper',
            icon: 'BookOpen'
        },
        {
            id: REPORT_VARIANTS.EXECUTIVE_SUMMARY,
            name: 'Executive Summary',
            description: 'Concise overview for stakeholders',
            icon: 'Users'
        },
        {
            id: REPORT_VARIANTS.PROGRESS,
            name: 'Progress Report',
            description: 'Project status and milestones',
            icon: 'TrendingUp'
        },
        {
            id: REPORT_VARIANTS.ANALYSIS,
            name: 'Analysis Report',
            description: 'Data analysis and insights',
            icon: 'BarChart2'
        }
    ],

    // Template fields/variables
    fields: [
        { id: 'title', label: 'Report Title', type: 'text', required: true, placeholder: 'Q4 2024 Business Review' },
        { id: 'author', label: 'Author Name', type: 'text', required: true, placeholder: 'John Smith' },
        { id: 'organization', label: 'Organization', type: 'text', required: false, placeholder: 'Acme Corporation' },
        { id: 'date', label: 'Date', type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0] },
        { id: 'summary', label: 'Executive Summary', type: 'textarea', required: true, placeholder: 'Brief overview of the report...' },
        { id: 'sections', label: 'Main Sections', type: 'array', required: true, placeholder: 'Add report sections' },
        { id: 'conclusions', label: 'Conclusions', type: 'textarea', required: false, placeholder: 'Key takeaways...' },
        { id: 'recommendations', label: 'Recommendations', type: 'textarea', required: false, placeholder: 'Suggested actions...' }
    ],

    // Template structure (Markdown)
    structure: {
        [REPORT_VARIANTS.BUSINESS]: `# {{title}}

**Prepared by:** {{author}}  
**Organization:** {{organization}}  
**Date:** {{date}}

---

## Executive Summary

{{summary}}

---

{{#sections}}
## {{sectionTitle}}

{{sectionContent}}

{{/sections}}

---

## Conclusions

{{conclusions}}

---

## Recommendations

{{recommendations}}

---

*This report was generated using DevSavvy AI Template System*
`,

        [REPORT_VARIANTS.TECHNICAL]: `# {{title}}
## Technical Report

**Author:** {{author}}  
**Version:** 1.0  
**Date:** {{date}}

---

### Abstract

{{summary}}

---

### Table of Contents

1. Introduction
2. Technical Background
3. Methodology
4. Implementation
5. Results
6. Conclusions

---

{{#sections}}
### {{sectionTitle}}

{{sectionContent}}

{{/sections}}

---

### Technical Conclusions

{{conclusions}}

---

### Future Work & Recommendations

{{recommendations}}

---

**Document Classification:** Internal  
**Last Updated:** {{date}}
`,

        [REPORT_VARIANTS.RESEARCH]: `# {{title}}

**Author(s):** {{author}}  
**Institution:** {{organization}}  
**Date:** {{date}}

---

## Abstract

{{summary}}

**Keywords:** {{keywords}}

---

## 1. Introduction

{{introduction}}

---

{{#sections}}
## {{sectionNumber}}. {{sectionTitle}}

{{sectionContent}}

{{/sections}}

---

## Conclusion

{{conclusions}}

---

## References

{{references}}

---

## Appendix

{{appendix}}
`,

        [REPORT_VARIANTS.EXECUTIVE_SUMMARY]: `# Executive Summary
## {{title}}

**Prepared for:** Leadership Team  
**Prepared by:** {{author}}  
**Date:** {{date}}

---

### Overview

{{summary}}

---

### Key Findings

{{#keyFindings}}
- **{{finding}}**
{{/keyFindings}}

---

### Recommendations

{{recommendations}}

---

### Next Steps

{{nextSteps}}

---

*Confidential - For Internal Use Only*
`,

        [REPORT_VARIANTS.PROGRESS]: `# Progress Report
## {{title}}

**Project:** {{projectName}}  
**Reporting Period:** {{reportingPeriod}}  
**Prepared by:** {{author}}  
**Date:** {{date}}

---

### Summary

{{summary}}

---

### Completed This Period

{{#completed}}
- ✅ {{task}}
{{/completed}}

---

### In Progress

{{#inProgress}}
- 🔄 {{task}} - {{percentage}}% complete
{{/inProgress}}

---

### Upcoming Tasks

{{#upcoming}}
- ⏳ {{task}}
{{/upcoming}}

---

### Risks & Issues

{{risks}}

---

### Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
{{#metrics}}
| {{name}} | {{target}} | {{actual}} | {{status}} |
{{/metrics}}

---

**Overall Status:** {{overallStatus}}
`,

        [REPORT_VARIANTS.ANALYSIS]: `# Analysis Report
## {{title}}

**Analyst:** {{author}}  
**Date:** {{date}}  
**Data Period:** {{dataPeriod}}

---

### Executive Summary

{{summary}}

---

### Methodology

{{methodology}}

---

### Data Overview

{{dataOverview}}

---

### Key Findings

{{#findings}}
#### {{findingTitle}}

{{findingContent}}

{{/findings}}

---

### Statistical Analysis

{{statisticalAnalysis}}

---

### Visualizations

{{visualizations}}

---

### Conclusions

{{conclusions}}

---

### Recommendations

{{recommendations}}

---

**Data Sources:** {{dataSources}}  
**Confidence Level:** {{confidenceLevel}}
`
    },

    // AI Prompts for content generation
    aiPrompts: {
        [REPORT_VARIANTS.BUSINESS]: `Generate a professional business report with the following structure:
1. Executive Summary (2-3 paragraphs)
2. Key Findings (3-5 bullet points)
3. Detailed Analysis (2-3 sections)
4. Conclusions
5. Recommendations

Topic: {{topic}}
Context: {{context}}

Use formal business language and include relevant metrics where appropriate.`,

        [REPORT_VARIANTS.TECHNICAL]: `Create a technical report with:
1. Abstract (technical summary)
2. Introduction (problem statement)
3. Methodology (approach taken)
4. Implementation details
5. Results and findings
6. Conclusions and future work

Technical Topic: {{topic}}
Technology Stack: {{techStack}}
Target Audience: {{audience}}`,

        [REPORT_VARIANTS.RESEARCH]: `Write an academic research report following these guidelines:
1. Abstract (150-250 words)
2. Introduction with clear thesis
3. Literature review
4. Methodology
5. Results/Findings
6. Discussion
7. Conclusion
8. References (suggest relevant sources)

Research Topic: {{topic}}
Field: {{field}}
Research Questions: {{questions}}`
    },

    // Default values
    defaults: {
        variant: REPORT_VARIANTS.BUSINESS,
        sections: [
            { sectionTitle: 'Introduction', sectionContent: '' },
            { sectionTitle: 'Analysis', sectionContent: '' },
            { sectionTitle: 'Discussion', sectionContent: '' }
        ]
    },

    // Export formats supported
    exportFormats: ['pdf', 'docx', 'html', 'markdown'],

    // Styling options
    styles: {
        professional: {
            fontFamily: 'Inter, sans-serif',
            headingFont: 'Playfair Display, serif',
            primaryColor: '#1a365d',
            accentColor: '#2b6cb0'
        },
        modern: {
            fontFamily: 'Roboto, sans-serif',
            headingFont: 'Roboto, sans-serif',
            primaryColor: '#1f2937',
            accentColor: '#6366f1'
        },
        minimal: {
            fontFamily: 'system-ui, sans-serif',
            headingFont: 'system-ui, sans-serif',
            primaryColor: '#000000',
            accentColor: '#666666'
        }
    }
};

export default ReportTemplate;
