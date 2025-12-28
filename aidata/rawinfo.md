
EverflowCFO Product Update
Payroll Credit Pre-Assessment & Lead Orchestration Platform (MVP)
Status: New build on existing EverflowCFO foundation
1. Purpose & Context
EverflowCFO is being updated from a general CFO/finance SaaS into a high-authority
payroll credit pre-assessment and lead management platform.
The goal of this update is to:
• Convert cold outbound traCic (restaurants, hospitality, SMBs) at high rates
• Provide a legitimate, professional payroll credit estimator experience
• Capture and manage high-intent leads
• Assign leads to a backend payroll credit processor
• Maintain visibility, attribution, and status tracking
This is not a payroll processor and does not file tax claims.
It is a pre-underwriting and lead orchestration system.
2. Core Product Principles
• Authoritative, not salesy
• Conservative estimates, not promises
• Structured, step-based UX
• Clear boundary between estimation and verification
• Designed to impress enterprise buyers and backend partners
3. User Roles
3.1 Public User (Employer)
• Completes payroll credit pre-assessment
• Receives an estimated credit range
• Submits contact info to view results
• Proceeds to verification with a specialist
3.2 Admin (Internal)
• Views all leads
• Sees estimator inputs and output
• Assigns leads to partner(s)
• Tracks lead status
• Exports data
3.3 Partner (Payroll Credit Processor)
• Logs in securely
• Views only assigned leads
• Sees company info + estimated credit range
• Updates lead status and notes
4. Front-End Experience
4.1 Landing / Entry Page
Headline:
Payroll Credit Pre-Assessment
Subheadline:
Federal payroll credits can return six- and seven-figure refunds to qualifying employers.
This assessment evaluates preliminary eligibility across ERC, TIP, and hiring credits.
CTA:
Begin Pre-Assessment
Visual Style:
• Dark / neutral palette
• Institutional typography
• Minimalist layout
• Trust-oriented copy (no hype language)
4.2 Estimator Flow (Step-Based)
Step 1: Business Profile
• Industry
• State(s) of operation
• Years in operation
Microcopy: Used to determine statutory eligibility windows.
Step 2: Workforce Composition
• Average full-time employees (range)
• Part-time or tipped employees (yes/no)
• Seasonal or union labor (optional)
Microcopy: Certain credits apply per employee class.
Step 3: Payroll Scale
• Annual payroll range
• Average wages
• Payroll provider (optional dropdown)
Microcopy: Credit caps are tied directly to payroll exposure.
Step 4: Impact & Hiring Signals
• Operational disruption in 2020–2021 (yes/no)
• Government-mandated limitations (checkbox)
• Hiring from targeted populations (yes/no)
Microcopy: Used to model eligibility thresholds under federal statutes.
4.3 Identity Gate (Before Results)
Copy:
Identity confirmation required.
We only generate credit ranges for verified employers.
Fields:
• Full name
• Company name
• Work email
• Phone number
4.4 Results Screen
Header:
Preliminary Credit Exposure Identified
Estimated Refund Range:
$XX,000 – $XXX,000
Credits Flagged:
• Employee Retention Credit (ERC)
• FICA Tip Credit
• Work Opportunity Tax Credit (WOTC)
Eligibility Signal:
Low / Moderate / Strong
CTA:
Proceed to Credit Verification
Disclaimer (Visible):
This estimate is preliminary and based on self-reported information. Final eligibility and
credit amounts require payroll and tax verification and do not constitute tax advice.
5. Estimation Logic (High Level)
• Rule-based logic using statutory caps and conservative assumptions
• No single “guaranteed” number — ranges only
• Designed to underestimate rather than inflate
• Flags applicable credit categories, not final determinations
No sensitive identifiers (SSNs, EIN docs, payroll registers) collected at this stage.
6. Admin Dashboard (Internal)
Lead Table Columns:
• Lead ID
• Company Name
• Contact Name
• Email
• Phone
• Industry
• Estimated Credit Range
• Credit Flags (ERC / TIP / WOTC)
• Source (campaign)
• Status (New / Assigned / In Progress / Closed / Lost)
• Assigned Partner
• Notes
• Timestamp
Actions:
• Assign lead to partner
• Update status
• Export CSV
7. Partner Dashboard
Features:
• Secure login
• View assigned leads only
• Lead detail view (contact info + estimate)
• Status update dropdown
• Notes field
Restrictions:
• Cannot edit original lead data
• Cannot view unassigned leads
8. Notifications & Audit Trail
• Email notification to partner upon lead assignment
• Timestamped assignment log
• Status change history per lead
9. Technical Notes
• Built on existing EverflowCFO infrastructure
• Role-based authentication (Admin / Partner)
• Persistent database for leads and estimates
• UI polish prioritized over feature breadth
10. Launch Criteria
• Estimator flow fully functional
• Lead capture gated correctly
• Admin assignment works
• Partner login works
• Disclaimers visible
• Cold email traCic lands directly in estimator