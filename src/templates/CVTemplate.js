/**
 * CV/Resume Template
 * ====================
 * 
 * Professional CV and resume templates for job applications,
 * academic positions, and professional profiles.
 * 
 * @version 1.0.0
 */

// =============================================================================
// CV VARIANTS
// =============================================================================

export const CV_VARIANTS = {
    PROFESSIONAL: 'professional',
    MODERN: 'modern',
    ACADEMIC: 'academic',
    CREATIVE: 'creative',
    TECHNICAL: 'technical',
    EXECUTIVE: 'executive'
};

// =============================================================================
// TEMPLATE DEFINITION
// =============================================================================

const CVTemplate = {
    id: 'cv',
    name: 'CV / Resume',
    description: 'Professional resume and CV templates for various industries',
    icon: 'User',
    category: 'personal',

    // Available variants
    variants: [
        {
            id: CV_VARIANTS.PROFESSIONAL,
            name: 'Professional',
            description: 'Clean, traditional format for corporate roles',
            icon: 'Briefcase'
        },
        {
            id: CV_VARIANTS.MODERN,
            name: 'Modern',
            description: 'Contemporary design with visual elements',
            icon: 'Sparkles'
        },
        {
            id: CV_VARIANTS.ACADEMIC,
            name: 'Academic CV',
            description: 'Comprehensive format for academic positions',
            icon: 'GraduationCap'
        },
        {
            id: CV_VARIANTS.CREATIVE,
            name: 'Creative',
            description: 'Unique design for creative industries',
            icon: 'Palette'
        },
        {
            id: CV_VARIANTS.TECHNICAL,
            name: 'Technical',
            description: 'Skills-focused format for tech roles',
            icon: 'Code'
        },
        {
            id: CV_VARIANTS.EXECUTIVE,
            name: 'Executive',
            description: 'Senior leadership format',
            icon: 'Crown'
        }
    ],

    // Template fields/variables
    fields: [
        // Personal Information
        { id: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'John Alexander Smith', section: 'personal' },
        { id: 'title', label: 'Professional Title', type: 'text', required: true, placeholder: 'Senior Software Engineer', section: 'personal' },
        { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'john.smith@email.com', section: 'personal' },
        { id: 'phone', label: 'Phone', type: 'text', required: true, placeholder: '+1 (555) 123-4567', section: 'personal' },
        { id: 'location', label: 'Location', type: 'text', required: false, placeholder: 'San Francisco, CA', section: 'personal' },
        { id: 'linkedin', label: 'LinkedIn', type: 'url', required: false, placeholder: 'linkedin.com/in/johnsmith', section: 'personal' },
        { id: 'website', label: 'Portfolio/Website', type: 'url', required: false, placeholder: 'johnsmith.dev', section: 'personal' },
        { id: 'github', label: 'GitHub', type: 'url', required: false, placeholder: 'github.com/johnsmith', section: 'personal' },

        // Summary
        { id: 'summary', label: 'Professional Summary', type: 'textarea', required: true, placeholder: 'Experienced professional with...', section: 'summary' },

        // Experience
        {
            id: 'experience', label: 'Work Experience', type: 'array', required: true, section: 'experience',
            itemFields: [
                { id: 'company', label: 'Company', type: 'text' },
                { id: 'position', label: 'Position', type: 'text' },
                { id: 'startDate', label: 'Start Date', type: 'text' },
                { id: 'endDate', label: 'End Date', type: 'text' },
                { id: 'location', label: 'Location', type: 'text' },
                { id: 'description', label: 'Description', type: 'textarea' },
                { id: 'achievements', label: 'Key Achievements', type: 'array' }
            ]
        },

        // Education
        {
            id: 'education', label: 'Education', type: 'array', required: true, section: 'education',
            itemFields: [
                { id: 'institution', label: 'Institution', type: 'text' },
                { id: 'degree', label: 'Degree', type: 'text' },
                { id: 'field', label: 'Field of Study', type: 'text' },
                { id: 'graduationDate', label: 'Graduation Date', type: 'text' },
                { id: 'gpa', label: 'GPA (optional)', type: 'text' },
                { id: 'honors', label: 'Honors/Awards', type: 'textarea' }
            ]
        },

        // Skills
        { id: 'skills', label: 'Skills', type: 'skills', required: true, section: 'skills' },

        // Certifications
        { id: 'certifications', label: 'Certifications', type: 'array', required: false, section: 'certifications' },

        // Languages
        { id: 'languages', label: 'Languages', type: 'array', required: false, section: 'languages' },

        // Projects
        { id: 'projects', label: 'Projects', type: 'array', required: false, section: 'projects' }
    ],

    // Template structure (Markdown)
    structure: {
        [CV_VARIANTS.PROFESSIONAL]: `# {{fullName}}
## {{title}}

📧 {{email}} | 📱 {{phone}} | 📍 {{location}}
{{#linkedin}}🔗 [LinkedIn]({{linkedin}}){{/linkedin}} {{#website}}| 🌐 [Portfolio]({{website}}){{/website}}

---

### Professional Summary

{{summary}}

---

### Work Experience

{{#experience}}
#### {{position}}
**{{company}}** | {{location}}  
*{{startDate}} - {{endDate}}*

{{description}}

{{#achievements}}
- {{.}}
{{/achievements}}

{{/experience}}

---

### Education

{{#education}}
#### {{degree}} in {{field}}
**{{institution}}** | *{{graduationDate}}*
{{#gpa}}GPA: {{gpa}}{{/gpa}}
{{#honors}}{{honors}}{{/honors}}

{{/education}}

---

### Skills

{{#skillCategories}}
**{{category}}:** {{skills}}
{{/skillCategories}}

---

{{#certifications}}
### Certifications

{{#items}}
- **{{name}}** - {{issuer}} ({{date}})
{{/items}}
{{/certifications}}

{{#languages}}
### Languages

{{#items}}
- {{language}}: {{proficiency}}
{{/items}}
{{/languages}}
`,

        [CV_VARIANTS.MODERN]: `<div class="cv-modern">

# {{fullName}}
### {{title}}

<div class="contact-bar">
{{email}} • {{phone}} • {{location}}
</div>

<div class="links">
{{#linkedin}}[LinkedIn]({{linkedin}}){{/linkedin}} {{#github}}• [GitHub]({{github}}){{/github}} {{#website}}• [Portfolio]({{website}}){{/website}}
</div>

---

## About Me

> {{summary}}

---

## Experience

{{#experience}}
<div class="experience-item">

### {{position}} @ {{company}}
<span class="date">{{startDate}} → {{endDate}}</span>

{{description}}

**Key Achievements:**
{{#achievements}}
✦ {{.}}
{{/achievements}}

</div>
{{/experience}}

---

## Skills

<div class="skills-grid">
{{#skillCategories}}
<div class="skill-category">
<strong>{{category}}</strong>
{{skills}}
</div>
{{/skillCategories}}
</div>

---

## Education

{{#education}}
**{{degree}}** — {{institution}} ({{graduationDate}})
{{/education}}

</div>
`,

        [CV_VARIANTS.TECHNICAL]: `# {{fullName}}
## {{title}}

**Contact:** {{email}} | {{phone}} | {{location}}  
**Links:** {{#github}}GitHub: {{github}}{{/github}} | {{#linkedin}}LinkedIn: {{linkedin}}{{/linkedin}}

---

## Technical Profile

{{summary}}

---

## Technical Skills

{{#skillCategories}}
### {{category}}
\`\`\`
{{skills}}
\`\`\`
{{/skillCategories}}

---

## Professional Experience

{{#experience}}
### {{position}}
**{{company}}** | {{startDate}} - {{endDate}}

{{description}}

**Technologies Used:** {{technologies}}

**Key Achievements:**
{{#achievements}}
• {{.}}
{{/achievements}}

---
{{/experience}}

## Projects

{{#projects}}
### {{name}}
{{description}}

**Tech Stack:** {{techStack}}
{{#link}}**Link:** [{{link}}]({{link}}){{/link}}

{{/projects}}

---

## Education & Certifications

{{#education}}
**{{degree}}** - {{institution}} ({{graduationDate}})
{{/education}}

{{#certifications}}
**{{name}}** - {{issuer}}
{{/certifications}}
`,

        [CV_VARIANTS.ACADEMIC]: `# Curriculum Vitae

## {{fullName}}
### {{title}}

**Email:** {{email}}  
**Phone:** {{phone}}  
**Address:** {{location}}  
**ORCID:** {{orcid}}

---

## Research Interests

{{researchInterests}}

---

## Education

{{#education}}
### {{degree}} in {{field}}
**{{institution}}** — {{graduationDate}}

Thesis: "{{thesisTitle}}"  
Advisor: {{advisor}}
{{#gpa}}GPA: {{gpa}}{{/gpa}}

{{/education}}

---

## Academic Positions

{{#experience}}
### {{position}}
**{{company}}** | {{startDate}} - {{endDate}}

{{description}}

{{/experience}}

---

## Publications

### Peer-Reviewed Articles
{{#publications}}
{{authors}} ({{year}}). {{title}}. *{{journal}}*, {{volume}}({{issue}}), {{pages}}. {{doi}}
{{/publications}}

### Conference Proceedings
{{#conferences}}
{{authors}} ({{year}}). {{title}}. In *{{conference}}*. {{location}}.
{{/conferences}}

---

## Grants & Funding

{{#grants}}
- **{{title}}** — {{funder}} (\${{amount}}, {{year}})
{{/grants}}

---

## Teaching Experience

{{#teaching}}
### {{course}}
{{institution}} | {{semester}}
{{/teaching}}

---

## Awards & Honors

{{#awards}}
- **{{name}}** — {{organization}} ({{year}})
{{/awards}}

---

## Professional Memberships

{{#memberships}}
- {{organization}} ({{status}})
{{/memberships}}

---

## References

Available upon request.
`,

        [CV_VARIANTS.EXECUTIVE]: `# {{fullName}}
## {{title}}

{{email}} | {{phone}} | {{location}}
{{#linkedin}}LinkedIn: {{linkedin}}{{/linkedin}}

---

## Executive Profile

{{summary}}

---

## Leadership Experience

{{#experience}}
### {{position}}
**{{company}}** | {{location}} | {{startDate}} - {{endDate}}

**Scope:** {{scope}}

{{description}}

**Key Accomplishments:**
{{#achievements}}
→ {{.}}
{{/achievements}}

**Revenue/Budget Impact:** {{impact}}

---
{{/experience}}

## Board Positions & Advisory Roles

{{#boards}}
- **{{organization}}** — {{role}} ({{years}})
{{/boards}}

---

## Education

{{#education}}
**{{degree}}** — {{institution}} ({{graduationDate}})
{{/education}}

---

## Executive Education

{{#executiveEd}}
- {{program}} — {{institution}}
{{/executiveEd}}

---

## Core Competencies

{{#competencies}}
• {{.}}
{{/competencies}}

---

## Speaking Engagements & Publications

{{speakingPublications}}
`
    },

    // AI Prompts for content generation
    aiPrompts: {
        summary: `Write a compelling professional summary for a {{title}} with {{yearsExperience}} years of experience. 
        
Key skills: {{skills}}
Industry: {{industry}}
Target role: {{targetRole}}

Keep it to 3-4 sentences, highlighting unique value proposition and key achievements.`,

        achievements: `Generate 3-5 quantifiable achievements for a {{position}} at {{company}}.

Responsibilities: {{responsibilities}}
Industry: {{industry}}

Format each achievement to start with a strong action verb and include metrics where possible.`,

        skills: `Suggest relevant skills for a {{title}} role in {{industry}}.

Experience level: {{level}}
Current skills: {{currentSkills}}

Organize into categories: Technical Skills, Soft Skills, Tools & Technologies.`
    },

    // Default values
    defaults: {
        variant: CV_VARIANTS.PROFESSIONAL,
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        languages: []
    },

    // Export formats supported
    exportFormats: ['pdf', 'docx', 'html', 'markdown'],

    // Styling options
    styles: {
        classic: {
            fontFamily: 'Georgia, serif',
            headingFont: 'Georgia, serif',
            primaryColor: '#1a1a1a',
            accentColor: '#2c5282'
        },
        modern: {
            fontFamily: 'Inter, sans-serif',
            headingFont: 'Inter, sans-serif',
            primaryColor: '#1f2937',
            accentColor: '#6366f1'
        },
        creative: {
            fontFamily: 'Poppins, sans-serif',
            headingFont: 'Playfair Display, serif',
            primaryColor: '#2d3748',
            accentColor: '#ed64a6'
        }
    }
};

export default CVTemplate;
