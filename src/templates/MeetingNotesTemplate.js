/**
 * Meeting Notes Template
 * ========================
 * 
 * Professional meeting notes and minute templates for
 * various types of meetings and discussions.
 * 
 * @version 1.0.0
 */

// =============================================================================
// MEETING VARIANTS
// =============================================================================

export const MEETING_VARIANTS = {
    STANDARD: 'standard',
    ONE_ON_ONE: 'one_on_one',
    STANDUP: 'standup',
    BOARD: 'board',
    BRAINSTORM: 'brainstorm',
    RETROSPECTIVE: 'retrospective',
    CLIENT: 'client'
};

// =============================================================================
// TEMPLATE DEFINITION
// =============================================================================

const MeetingNotesTemplate = {
    id: 'meeting',
    name: 'Meeting Notes',
    description: 'Professional meeting notes and minutes templates',
    icon: 'Users',
    category: 'business',

    // Available variants
    variants: [
        {
            id: MEETING_VARIANTS.STANDARD,
            name: 'Standard Meeting',
            description: 'General meeting notes format',
            icon: 'FileText'
        },
        {
            id: MEETING_VARIANTS.ONE_ON_ONE,
            name: '1:1 Meeting',
            description: 'One-on-one meeting template',
            icon: 'User'
        },
        {
            id: MEETING_VARIANTS.STANDUP,
            name: 'Daily Standup',
            description: 'Agile daily standup notes',
            icon: 'Clock'
        },
        {
            id: MEETING_VARIANTS.BOARD,
            name: 'Board Meeting',
            description: 'Formal board meeting minutes',
            icon: 'Building'
        },
        {
            id: MEETING_VARIANTS.BRAINSTORM,
            name: 'Brainstorm Session',
            description: 'Creative brainstorming notes',
            icon: 'Lightbulb'
        },
        {
            id: MEETING_VARIANTS.RETROSPECTIVE,
            name: 'Retrospective',
            description: 'Sprint/project retrospective',
            icon: 'RefreshCw'
        },
        {
            id: MEETING_VARIANTS.CLIENT,
            name: 'Client Meeting',
            description: 'External client meeting notes',
            icon: 'Handshake'
        }
    ],

    // Template fields/variables
    fields: [
        // Meeting Info
        { id: 'meetingTitle', label: 'Meeting Title', type: 'text', required: true, placeholder: 'Weekly Team Sync', section: 'info' },
        { id: 'meetingDate', label: 'Date', type: 'date', required: true, section: 'info' },
        { id: 'meetingTime', label: 'Time', type: 'text', required: true, placeholder: '10:00 AM - 11:00 AM', section: 'info' },
        { id: 'location', label: 'Location', type: 'text', required: false, placeholder: 'Conference Room A / Zoom', section: 'info' },
        { id: 'meetingType', label: 'Meeting Type', type: 'select', required: true, options: ['In-Person', 'Virtual', 'Hybrid'], section: 'info' },

        // Participants
        { id: 'organizer', label: 'Organizer/Facilitator', type: 'text', required: true, section: 'participants' },
        { id: 'attendees', label: 'Attendees', type: 'array', required: true, section: 'participants' },
        { id: 'absentees', label: 'Absent', type: 'array', required: false, section: 'participants' },
        { id: 'notesTaker', label: 'Notes Taken By', type: 'text', required: false, section: 'participants' },

        // Content
        { id: 'objective', label: 'Meeting Objective', type: 'textarea', required: true, section: 'content' },
        { id: 'agenda', label: 'Agenda Items', type: 'array', required: true, section: 'content' },
        { id: 'discussion', label: 'Discussion Points', type: 'array', required: false, section: 'content' },
        { id: 'decisions', label: 'Decisions Made', type: 'array', required: false, section: 'content' },
        {
            id: 'actionItems', label: 'Action Items', type: 'array', required: false, section: 'content',
            itemFields: [
                { id: 'task', label: 'Task', type: 'text' },
                { id: 'owner', label: 'Owner', type: 'text' },
                { id: 'dueDate', label: 'Due Date', type: 'date' },
                { id: 'status', label: 'Status', type: 'select', options: ['Not Started', 'In Progress', 'Completed'] }
            ]
        },
        { id: 'nextMeeting', label: 'Next Meeting', type: 'text', required: false, section: 'followup' },
        { id: 'additionalNotes', label: 'Additional Notes', type: 'textarea', required: false, section: 'followup' }
    ],

    // Template structure (Markdown)
    structure: {
        [MEETING_VARIANTS.STANDARD]: `# Meeting Notes
## {{meetingTitle}}

📅 **Date:** {{meetingDate}}  
🕐 **Time:** {{meetingTime}}  
📍 **Location:** {{location}}

---

### Attendees

**Organizer:** {{organizer}}

**Present:**
{{#attendees}}
- {{.}}
{{/attendees}}

{{#absentees}}
**Absent:**
{{#items}}
- {{.}}
{{/items}}
{{/absentees}}

**Notes by:** {{notesTaker}}

---

### Meeting Objective

{{objective}}

---

### Agenda

{{#agenda}}
{{number}}. {{item}}
{{/agenda}}

---

### Discussion Summary

{{#discussion}}
#### {{topic}}

{{notes}}

{{/discussion}}

---

### Decisions Made

{{#decisions}}
✅ {{.}}
{{/decisions}}

---

### Action Items

| # | Task | Owner | Due Date | Status |
|---|------|-------|----------|--------|
{{#actionItems}}
| {{number}} | {{task}} | {{owner}} | {{dueDate}} | {{status}} |
{{/actionItems}}

---

### Next Meeting

📅 {{nextMeeting}}

---

### Additional Notes

{{additionalNotes}}

---

*Notes submitted: {{submissionDate}}*
`,

        [MEETING_VARIANTS.ONE_ON_ONE]: `# 1:1 Meeting Notes

**Date:** {{meetingDate}}  
**Time:** {{meetingTime}}

---

## Participants

👤 **Manager:** {{manager}}  
👤 **Team Member:** {{teamMember}}

---

## Check-in

### How are things going?

{{checkInNotes}}

### Wins since last meeting

{{#wins}}
🎉 {{.}}
{{/wins}}

### Challenges

{{#challenges}}
⚠️ {{.}}
{{/challenges}}

---

## Discussion Topics

{{#discussionTopics}}
### {{topic}}

{{notes}}

{{/discussionTopics}}

---

## Career Development

### Goals Progress

{{#goals}}
- **{{goal}}:** {{progress}}
{{/goals}}

### Growth Areas

{{growthAreas}}

### Feedback

**From Manager:**
{{managerFeedback}}

**From Team Member:**
{{teamMemberFeedback}}

---

## Action Items

{{#actionItems}}
- [ ] **{{task}}** — {{owner}} (Due: {{dueDate}})
{{/actionItems}}

---

## Next 1:1

📅 {{nextMeeting}}

---

*Topics for next time:*
{{nextTopics}}
`,

        [MEETING_VARIANTS.STANDUP]: `# Daily Standup Notes

📅 **Date:** {{meetingDate}}  
🕐 **Time:** {{meetingTime}}  
⏱️ **Duration:** {{duration}} minutes

---

## Team Updates

{{#teamUpdates}}
### {{name}}

**Yesterday:**
{{#yesterday}}
- {{.}}
{{/yesterday}}

**Today:**
{{#today}}
- {{.}}
{{/today}}

**Blockers:**
{{#blockers}}
- ⛔ {{.}}
{{/blockers}}
{{^blockers}}
None
{{/blockers}}

---
{{/teamUpdates}}

## Blockers Summary

{{#allBlockers}}
| Team Member | Blocker | Status |
|-------------|---------|--------|
{{#items}}
| {{name}} | {{blocker}} | {{status}} |
{{/items}}
{{/allBlockers}}

---

## Quick Announcements

{{#announcements}}
- 📢 {{.}}
{{/announcements}}

---

## Follow-up Required

{{#followUps}}
- {{topic}} — {{owner}}
{{/followUps}}

---

*Next standup: {{nextStandup}}*
`,

        [MEETING_VARIANTS.BOARD]: `# Board Meeting Minutes

**{{organizationName}}**  
**Board of Directors Meeting**

---

**Date:** {{meetingDate}}  
**Time:** {{meetingTime}}  
**Location:** {{location}}

---

## Call to Order

The meeting was called to order at {{startTime}} by {{chairperson}}.

---

## Attendance

### Board Members Present
{{#boardPresent}}
- {{.}}
{{/boardPresent}}

### Board Members Absent
{{#boardAbsent}}
- {{.}}
{{/boardAbsent}}

### Others Present
{{#othersPresent}}
- {{name}}, {{title}}
{{/othersPresent}}

### Quorum

A quorum {{#hasQuorum}}was{{/hasQuorum}}{{^hasQuorum}}was not{{/hasQuorum}} established.

---

## Approval of Previous Minutes

The minutes of the {{previousMeetingDate}} meeting were {{minutesApproval}}.

**Motion by:** {{motionBy}}  
**Seconded by:** {{secondedBy}}  
**Vote:** {{voteResult}}

---

## Reports

{{#reports}}
### {{reportTitle}}

**Presented by:** {{presenter}}

{{summary}}

{{/reports}}

---

## Old Business

{{#oldBusiness}}
### {{topic}}

{{discussion}}

**Resolution:** {{resolution}}

{{/oldBusiness}}

---

## New Business

{{#newBusiness}}
### {{topic}}

{{discussion}}

**Motion:** {{motion}}  
**Motion by:** {{motionBy}}  
**Seconded by:** {{secondedBy}}  
**Vote:** {{voteResult}}

{{/newBusiness}}

---

## Resolutions Adopted

{{#resolutions}}
**Resolution {{number}}:** {{title}}

{{content}}

*Approved: {{approvedDate}}*

{{/resolutions}}

---

## Executive Session

{{#executiveSession}}
The Board moved to executive session at {{startTime}}.
The Board returned to regular session at {{endTime}}.
{{/executiveSession}}

---

## Adjournment

The meeting was adjourned at {{endTime}}.

**Motion by:** {{adjournMotionBy}}  
**Seconded by:** {{adjournSecondedBy}}

---

**Next Meeting:** {{nextMeeting}}

---

**Submitted by:**  
{{secretary}}  
Board Secretary

**Approved by:**  
{{chairperson}}  
Chairperson

*Date Approved: _______________*
`,

        [MEETING_VARIANTS.RETROSPECTIVE]: `# Sprint Retrospective

**Sprint:** {{sprintName}}  
**Date:** {{meetingDate}}  
**Facilitator:** {{facilitator}}

---

## Sprint Summary

**Sprint Goal:** {{sprintGoal}}  
**Duration:** {{sprintDuration}}  
**Team Velocity:** {{velocity}} story points

---

## Attendees

{{#attendees}}
- {{.}}
{{/attendees}}

---

## What Went Well 🎉

{{#wentWell}}
- ✅ {{.}}
{{/wentWell}}

---

## What Could Be Improved 🔧

{{#couldImprove}}
- ⚠️ {{.}}
{{/couldImprove}}

---

## What Puzzled Us 🤔

{{#puzzled}}
- ❓ {{.}}
{{/puzzled}}

---

## Action Items for Next Sprint

| Action | Owner | Priority |
|--------|-------|----------|
{{#actions}}
| {{action}} | {{owner}} | {{priority}} |
{{/actions}}

---

## Team Happiness Score

**Average:** {{happinessScore}}/5

{{#happinessComments}}
> "{{.}}"
{{/happinessComments}}

---

## Shout-outs & Kudos 👏

{{#shoutouts}}
- 🌟 {{recipient}}: {{reason}}
{{/shoutouts}}

---

## Previous Action Items Review

| Action | Owner | Status |
|--------|-------|--------|
{{#previousActions}}
| {{action}} | {{owner}} | {{status}} |
{{/previousActions}}

---

## Key Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Velocity | {{targetVelocity}} | {{actualVelocity}} |
| Bugs Fixed | {{targetBugs}} | {{actualBugs}} |
| Sprint Burndown | {{burndownTarget}} | {{burndownActual}} |

---

*Next retrospective: {{nextRetrospective}}*
`,

        [MEETING_VARIANTS.CLIENT]: `# Client Meeting Notes

**Client:** {{clientName}}  
**Date:** {{meetingDate}}  
**Time:** {{meetingTime}}  
**Location:** {{location}}

---

## Attendees

**Our Team:**
{{#ourTeam}}
- {{name}}, {{role}}
{{/ourTeam}}

**Client Team:**
{{#clientTeam}}
- {{name}}, {{role}}
{{/clientTeam}}

---

## Meeting Objective

{{objective}}

---

## Agenda

{{#agenda}}
{{number}}. {{item}}
{{/agenda}}

---

## Discussion Summary

{{#discussion}}
### {{topic}}

{{notes}}

**Client Feedback:** {{clientFeedback}}

{{/discussion}}

---

## Key Decisions

{{#decisions}}
✅ {{.}}
{{/decisions}}

---

## Client Requirements / Requests

{{#requirements}}
- 📋 {{requirement}} (Priority: {{priority}})
{{/requirements}}

---

## Action Items

### Our Team
{{#ourActions}}
- [ ] {{task}} — {{owner}} (Due: {{dueDate}})
{{/ourActions}}

### Client Team
{{#clientActions}}
- [ ] {{task}} — {{owner}} (Due: {{dueDate}})
{{/clientActions}}

---

## Next Steps

{{nextSteps}}

---

## Follow-up Meeting

📅 **Date:** {{nextMeeting}}  
📋 **Agenda Preview:** {{nextAgenda}}

---

## Internal Notes (Not for Distribution)

{{internalNotes}}

---

*Meeting summary sent to client: {{summarySent}}*
`
    },

    // AI Prompts
    aiPrompts: {
        summarize: `Summarize the following meeting notes into key points:

Meeting Title: {{meetingTitle}}
Raw Notes: {{rawNotes}}

Extract:
1. Key decisions made
2. Action items with owners
3. Main discussion points
4. Follow-up items`,

        generateActionItems: `Based on this meeting discussion, generate clear action items:

Discussion: {{discussion}}
Attendees: {{attendees}}

For each action item, specify:
- Task description (clear and specific)
- Suggested owner
- Recommended due date
- Priority level`
    },

    // Default values
    defaults: {
        variant: MEETING_VARIANTS.STANDARD,
        attendees: [],
        agenda: [],
        actionItems: [],
        meetingType: 'Virtual'
    },

    // Export formats supported
    exportFormats: ['pdf', 'docx', 'html', 'markdown'],

    // Styling options
    styles: {
        professional: {
            fontFamily: 'Inter, sans-serif',
            primaryColor: '#1a365d',
            accentColor: '#2b6cb0'
        },
        casual: {
            fontFamily: 'system-ui, sans-serif',
            primaryColor: '#374151',
            accentColor: '#6366f1'
        },
        formal: {
            fontFamily: 'Georgia, serif',
            primaryColor: '#1f2937',
            accentColor: '#1e40af'
        }
    }
};

export default MeetingNotesTemplate;
