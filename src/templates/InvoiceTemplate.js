/**
 * Invoice Template
 * ==================
 * 
 * Professional invoice templates for businesses, freelancers,
 * and service providers.
 * 
 * @version 1.0.0
 */

// =============================================================================
// INVOICE VARIANTS
// =============================================================================

export const INVOICE_VARIANTS = {
    STANDARD: 'standard',
    DETAILED: 'detailed',
    HOURLY: 'hourly',
    SUBSCRIPTION: 'subscription',
    PROFORMA: 'proforma',
    RECEIPT: 'receipt'
};

// =============================================================================
// TEMPLATE DEFINITION
// =============================================================================

const InvoiceTemplate = {
    id: 'invoice',
    name: 'Invoice',
    description: 'Professional invoice templates for billing and payments',
    icon: 'Receipt',
    category: 'business',

    // Available variants
    variants: [
        {
            id: INVOICE_VARIANTS.STANDARD,
            name: 'Standard Invoice',
            description: 'Simple, clean invoice for products/services',
            icon: 'FileText'
        },
        {
            id: INVOICE_VARIANTS.DETAILED,
            name: 'Detailed Invoice',
            description: 'Itemized invoice with detailed breakdown',
            icon: 'List'
        },
        {
            id: INVOICE_VARIANTS.HOURLY,
            name: 'Hourly Invoice',
            description: 'Time-based billing for consultants',
            icon: 'Clock'
        },
        {
            id: INVOICE_VARIANTS.SUBSCRIPTION,
            name: 'Subscription Invoice',
            description: 'Recurring billing invoice',
            icon: 'RefreshCw'
        },
        {
            id: INVOICE_VARIANTS.PROFORMA,
            name: 'Proforma Invoice',
            description: 'Preliminary invoice before delivery',
            icon: 'FileCheck'
        },
        {
            id: INVOICE_VARIANTS.RECEIPT,
            name: 'Payment Receipt',
            description: 'Confirmation of payment received',
            icon: 'CheckCircle'
        }
    ],

    // Template fields/variables
    fields: [
        // Invoice Details
        { id: 'invoiceNumber', label: 'Invoice Number', type: 'text', required: true, placeholder: 'INV-2024-001', section: 'invoice' },
        { id: 'invoiceDate', label: 'Invoice Date', type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0], section: 'invoice' },
        { id: 'dueDate', label: 'Due Date', type: 'date', required: true, section: 'invoice' },
        { id: 'currency', label: 'Currency', type: 'select', required: true, options: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'], defaultValue: 'USD', section: 'invoice' },

        // Company Info
        { id: 'companyName', label: 'Your Company Name', type: 'text', required: true, placeholder: 'Acme Solutions Inc.', section: 'company' },
        { id: 'companyAddress', label: 'Company Address', type: 'textarea', required: true, placeholder: '123 Business Ave\nCity, State 12345', section: 'company' },
        { id: 'companyEmail', label: 'Company Email', type: 'email', required: true, section: 'company' },
        { id: 'companyPhone', label: 'Company Phone', type: 'text', required: false, section: 'company' },
        { id: 'companyLogo', label: 'Company Logo URL', type: 'url', required: false, section: 'company' },
        { id: 'taxId', label: 'Tax ID / GST Number', type: 'text', required: false, section: 'company' },

        // Client Info
        { id: 'clientName', label: 'Client Name', type: 'text', required: true, placeholder: 'Client Corporation', section: 'client' },
        { id: 'clientAddress', label: 'Client Address', type: 'textarea', required: true, section: 'client' },
        { id: 'clientEmail', label: 'Client Email', type: 'email', required: false, section: 'client' },
        { id: 'clientPhone', label: 'Client Phone', type: 'text', required: false, section: 'client' },

        // Line Items
        {
            id: 'items', label: 'Invoice Items', type: 'array', required: true, section: 'items',
            itemFields: [
                { id: 'description', label: 'Description', type: 'text' },
                { id: 'quantity', label: 'Quantity', type: 'number' },
                { id: 'unitPrice', label: 'Unit Price', type: 'number' },
                { id: 'tax', label: 'Tax %', type: 'number' },
                { id: 'amount', label: 'Amount', type: 'calculated' }
            ]
        },

        // Totals
        { id: 'subtotal', label: 'Subtotal', type: 'calculated', section: 'totals' },
        { id: 'taxAmount', label: 'Tax Amount', type: 'calculated', section: 'totals' },
        { id: 'discount', label: 'Discount', type: 'number', required: false, section: 'totals' },
        { id: 'total', label: 'Total', type: 'calculated', section: 'totals' },

        // Payment
        { id: 'paymentTerms', label: 'Payment Terms', type: 'select', required: true, options: ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt'], section: 'payment' },
        { id: 'paymentMethods', label: 'Payment Methods', type: 'textarea', required: false, placeholder: 'Bank Transfer, PayPal, Credit Card', section: 'payment' },
        { id: 'bankDetails', label: 'Bank Details', type: 'textarea', required: false, section: 'payment' },

        // Notes
        { id: 'notes', label: 'Notes', type: 'textarea', required: false, section: 'notes' },
        { id: 'terms', label: 'Terms & Conditions', type: 'textarea', required: false, section: 'notes' }
    ],

    // Template structure (Markdown/HTML)
    structure: {
        [INVOICE_VARIANTS.STANDARD]: `<div class="invoice">

# INVOICE

<div class="invoice-header">
<div class="company-info">

**{{companyName}}**  
{{companyAddress}}  
{{companyEmail}} | {{companyPhone}}  
{{#taxId}}Tax ID: {{taxId}}{{/taxId}}

</div>
<div class="invoice-details">

**Invoice #:** {{invoiceNumber}}  
**Date:** {{invoiceDate}}  
**Due Date:** {{dueDate}}

</div>
</div>

---

## Bill To

**{{clientName}}**  
{{clientAddress}}  
{{#clientEmail}}{{clientEmail}}{{/clientEmail}}  
{{#clientPhone}}{{clientPhone}}{{/clientPhone}}

---

## Items

| Description | Qty | Unit Price | Amount |
|-------------|-----|------------|--------|
{{#items}}
| {{description}} | {{quantity}} | {{currency}} {{unitPrice}} | {{currency}} {{amount}} |
{{/items}}

---

<div class="totals">

| | |
|--|--:|
| **Subtotal** | {{currency}} {{subtotal}} |
{{#discount}}| **Discount** | -{{currency}} {{discount}} |{{/discount}}
| **Tax** | {{currency}} {{taxAmount}} |
| **Total Due** | **{{currency}} {{total}}** |

</div>

---

## Payment Information

**Payment Terms:** {{paymentTerms}}

{{#bankDetails}}
**Bank Details:**
{{bankDetails}}
{{/bankDetails}}

{{#paymentMethods}}
**Accepted Payment Methods:** {{paymentMethods}}
{{/paymentMethods}}

---

{{#notes}}
**Notes:** {{notes}}
{{/notes}}

{{#terms}}
**Terms & Conditions:**
{{terms}}
{{/terms}}

---

*Thank you for your business!*

</div>
`,

        [INVOICE_VARIANTS.HOURLY]: `<div class="invoice hourly">

# TIME & MATERIALS INVOICE

**{{companyName}}**  
{{companyAddress}}

---

**Invoice #:** {{invoiceNumber}}  
**Date:** {{invoiceDate}}  
**Billing Period:** {{billingPeriod}}

---

## Client

**{{clientName}}**  
{{clientAddress}}

---

## Time Log

| Date | Description | Hours | Rate | Amount |
|------|-------------|-------|------|--------|
{{#timeEntries}}
| {{date}} | {{description}} | {{hours}} | {{currency}} {{rate}}/hr | {{currency}} {{amount}} |
{{/timeEntries}}

---

**Total Hours:** {{totalHours}}

---

## Summary

| | |
|--|--:|
| Labor ({{totalHours}} hrs @ {{currency}} {{hourlyRate}}/hr) | {{currency}} {{laborTotal}} |
{{#expenses}}| Expenses | {{currency}} {{expenseTotal}} |{{/expenses}}
| **Total Due** | **{{currency}} {{total}}** |

---

**Payment Terms:** {{paymentTerms}}

{{#bankDetails}}
{{bankDetails}}
{{/bankDetails}}

</div>
`,

        [INVOICE_VARIANTS.SUBSCRIPTION]: `<div class="invoice subscription">

# SUBSCRIPTION INVOICE

**{{companyName}}**  
{{companyAddress}}

**Invoice #:** {{invoiceNumber}}  
**Date:** {{invoiceDate}}

---

## Billed To

**{{clientName}}**  
{{clientAddress}}

---

## Subscription Details

| Plan | Period | Amount |
|------|--------|--------|
| {{planName}} | {{billingPeriod}} | {{currency}} {{planAmount}}/{{billingCycle}} |

---

**Current Period:** {{periodStart}} to {{periodEnd}}

---

## Charges

| Description | Amount |
|-------------|--------|
| {{planName}} ({{billingCycle}}) | {{currency}} {{planAmount}} |
{{#addons}}
| {{addonName}} | {{currency}} {{addonAmount}} |
{{/addons}}
{{#credits}}
| Credit Applied | -{{currency}} {{creditAmount}} |
{{/credits}}

---

| | |
|--|--:|
| **Subtotal** | {{currency}} {{subtotal}} |
| **Tax ({{taxRate}}%)** | {{currency}} {{taxAmount}} |
| **Total Due** | **{{currency}} {{total}}** |

---

**Next Billing Date:** {{nextBillingDate}}

**Payment Method:** {{paymentMethod}}

---

{{#notes}}
{{notes}}
{{/notes}}

*Questions? Contact us at {{companyEmail}}*

</div>
`,

        [INVOICE_VARIANTS.RECEIPT]: `<div class="receipt">

# PAYMENT RECEIPT

---

**Receipt #:** {{receiptNumber}}  
**Date:** {{paymentDate}}

---

**Received From:**  
{{clientName}}  
{{clientAddress}}

---

**Payment Details:**

| Description | Amount |
|-------------|--------|
| Payment for Invoice #{{invoiceNumber}} | {{currency}} {{amount}} |

---

| | |
|--|--:|
| **Amount Received** | **{{currency}} {{amount}}** |

---

**Payment Method:** {{paymentMethod}}  
{{#transactionId}}**Transaction ID:** {{transactionId}}{{/transactionId}}

---

**Received By:**  
{{companyName}}  
{{companyAddress}}

---

*This is an official receipt of payment.*

</div>
`
    },

    // Calculation functions
    calculations: {
        itemAmount: (item) => {
            const amount = item.quantity * item.unitPrice;
            return amount;
        },
        subtotal: (items) => {
            return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        },
        taxAmount: (subtotal, taxRate) => {
            return subtotal * (taxRate / 100);
        },
        total: (subtotal, taxAmount, discount = 0) => {
            return subtotal + taxAmount - discount;
        }
    },

    // AI Prompts
    aiPrompts: {
        generateItems: `Generate invoice line items for the following service/product:

Client: {{clientName}}
Service Type: {{serviceType}}
Description: {{description}}

Provide itemized breakdown with descriptions, quantities, and suggested pricing.`,

        suggestTerms: `Suggest appropriate payment terms and conditions for:

Industry: {{industry}}
Client Type: {{clientType}}
Invoice Amount: {{amount}}

Include late payment policy and standard disclaimers.`
    },

    // Default values
    defaults: {
        variant: INVOICE_VARIANTS.STANDARD,
        currency: 'USD',
        paymentTerms: 'Net 30',
        items: [],
        taxRate: 0
    },

    // Export formats supported
    exportFormats: ['pdf', 'html', 'markdown'],

    // Styling options
    styles: {
        professional: {
            fontFamily: 'Inter, sans-serif',
            primaryColor: '#1a365d',
            accentColor: '#2b6cb0',
            tableHeaderBg: '#edf2f7'
        },
        modern: {
            fontFamily: 'Roboto, sans-serif',
            primaryColor: '#1f2937',
            accentColor: '#6366f1',
            tableHeaderBg: '#f3f4f6'
        },
        minimal: {
            fontFamily: 'system-ui, sans-serif',
            primaryColor: '#000000',
            accentColor: '#4b5563',
            tableHeaderBg: '#f9fafb'
        }
    }
};

export default InvoiceTemplate;
