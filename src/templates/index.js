/**
 * Template System Index
 * ======================
 * 
 * Phase 4.1: Template System Implementation
 * 
 * A comprehensive document generation template system supporting
 * multiple template types with AI-powered content generation.
 * 
 * TEMPLATE TYPES:
 * - Report Template
 * - CV/Resume Template
 * - Invoice Template
 * - Presentation Template
 * - Meeting Notes Template
 * 
 * @version 1.0.0
 */

// Template Definitions
export { default as ReportTemplate, REPORT_VARIANTS } from './ReportTemplate';
export { default as CVTemplate, CV_VARIANTS } from './CVTemplate';
export { default as InvoiceTemplate, INVOICE_VARIANTS } from './InvoiceTemplate';
export { default as PresentationTemplate, PRESENTATION_VARIANTS } from './PresentationTemplate';
export { default as MeetingNotesTemplate, MEETING_VARIANTS } from './MeetingNotesTemplate';

// Template Utilities
export {
    renderTemplate,
    generateAIPrompt,
    parseTemplateVariables,
    validateTemplateData
} from './templateUtils';

// Template Hook
export { useTemplates, TEMPLATE_CATEGORIES } from './useTemplates';

// All templates aggregated
import ReportTemplate from './ReportTemplate';
import CVTemplate from './CVTemplate';
import InvoiceTemplate from './InvoiceTemplate';
import PresentationTemplate from './PresentationTemplate';
import MeetingNotesTemplate from './MeetingNotesTemplate';

export const ALL_TEMPLATES = {
    report: ReportTemplate,
    cv: CVTemplate,
    invoice: InvoiceTemplate,
    presentation: PresentationTemplate,
    meeting: MeetingNotesTemplate
};

export default ALL_TEMPLATES;
