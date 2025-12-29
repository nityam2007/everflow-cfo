1. High-Level Direction (Read This First)
We are on the right path, but the current build needs refinement to:
• Feel financial / institutional, not “tech startup”
• Avoid ERC-mill / spam vibes
• Support a credible estimator that pre-qualifies leads
• Impress backend payroll partners with seriousness and structure
This iteration focuses on:
• Estimator credibility
• Design maturity
• Risk reduction
• Lead quality, not just volume
2. Product Positioning (Non-Negotiable)
EverflowCFO is not:
• A payroll processor
• A tax filing service
• A guarantee of refunds
EverflowCFO is:
• A Payroll Credit Pre-Assessment Platform
• A pre-underwriting intake system
• A lead orchestration layer between employers and processors
All copy, UI, and logic must reinforce:
Conservative estimates, subject to verification.
3. Immediate Product Changes Required
3.1 Remove / Replace Credibility Landmines
Remove immediately:
• “$2.1B+ credits identified”
• “15,000+ businesses assessed”
• “98% accuracy rate”
Replace with defensible language:
• “Statute-based estimation methodology”
• “Conservative pre-assessment”
• “No filing without verification”
3.2 Reposition Credit Emphasis
Current issue: ERC is too front-and-center, which creates spam/IRS-risk vibes.
Change:
• Make FICA Tip Credit (45B) the hero for restaurants/hospitality
• Present ERC as:
o “May apply in certain circumstances”
o Gated deeper in the assessment
• WOTC remains supportive, not headline
This improves:
• Lead quality
• Partner trust
• Long-term survivability
4. Estimator Architecture (Critical)
4.1 Estimator Must Be a Rules Engine
Do not hard-code math in components.
Implement:
• Versioned rules config (e.g. rules.json)
• Estimator API that references rules by version
• Store rules_version with every estimate
Why:
Credits, caps, and strategy change. Logic must be editable without redeploying.
4.2 Estimator Outputs (Required)
Each completed assessment must return:
• Estimated Credit Range (never a single number)
• Credit Flags: TIP / WOTC / ERC
• Eligibility Signal: Low / Moderate / Strong
• Explanation Bullets:
o “Based on payroll scale”
o “Based on tipped workforce”
o “Based on hiring signals”
• Verification CTA
4.3 Identity Gate (Before Results)
Before showing results, require:
• Full Name
• Company Name
• Work Email
• Phone
Copy framing:
Identity confirmation required to view employer-specific estimates.
This is security framing, not lead capture framing.
4.4 Estimator Versioning & Control
• Each assessment must store:
o rules_version
o estimator_version
• Estimator logic must be driven by a versioned configuration (JSON or database
table), not hard-coded values.
• Historical assessments must remain tied to the rules version used at the time of
estimation.
• Admin must be able to update rules for future assessments without aeecting prior
estimates.
Purpose:
This ensures that all estimates can be explained, defended, and audited if questions arise
from partners or clients at a later date.
5. Backend / Data Model (MVP Scope)
Core Objects
Lead
• Contact info
• Source / campaign
• Timestamp
Assessment
• Raw answers (JSON)
• Estimate output (JSON)
• Rules version
Assignment
• Lead ID
• Partner ID
• Assigned at
• Status
Partner User
• Login
• Assigned leads only
Status Log
• Status changes
• Notes
• Audit trail
6. Partner Portal (Minimal, Serious)
Partner must be able to:
• Log in
• View assigned leads
• See:
o Company info
o Estimated range
o Credit flags
• Update:
o Status
o Notes
Partner must not:
• Edit original assessment answers
• Edit estimates
• See unassigned leads
This preserves attribution and leverage.
7. Lead Ownership & Assignment Control (Non-Negotiable)
EverflowCFO owns all lead data and all assessment data generated on the platform.
Backend payroll processors do not own leads.
They are granted conditional, revocable access to specific leads at the discretion of
EverflowCFO.
Control Rules (Hard Requirements)
1. All leads enter EverflowCFO first
o No lead is visible to any partner by default.
o There is no automatic routing.
2. Admin-only assignment
o Only Admin users can assign a lead to a partner.
o Assignment requires an explicit admin action.
3. Scoped access
o A partner can only view leads that have been explicitly assigned to them.
o Partners cannot see:
§ unassigned leads
§ leads assigned to other partners
§ historical leads once unassigned
4. Revocable access
o Admin can unassign a lead at any time.
o Upon unassignment:
§ lead immediately disappears from partner view
§ partner retains no ongoing access to lead data
5. Read-only source data
o Partners cannot edit:
§ original assessment inputs
§ estimated ranges
§ credit flags
o Partners may only:
§ update status
§ add notes
6. Audit trail
o Every assignment and unassignment must be logged:
§ timestamp
§ admin user
§ partner user
o This data must be immutable.
Design Principle
Partners are service providers, not system peers.
EverflowCFO is the system of record and gatekeeper of demand.
This principle must be enforced at:
• database schema level
• API authorization layer
• UI level
7.1 Partner Abstraction & Future Revenue Tracking
• Backend payroll processors are treated as external service providers.
• EverflowCFO remains the system of record for:
o lead creation
o assignment
o attribution
• Revenue, payout, and commission tracking are out of scope for MVP, but the data
model must support:
o multiple partners
o dieerent commercial terms per partner
o historical attribution of closed leads
No payment automation or revenue calculations are required in this iteration.
8. Design Direction (Very Important)
7.1 Color Palette Shift (Approved Change)
Current build is too black / tech-heavy.
We want:
• Silver-gray
• Slate
• Neutral professional tones
Think:
• Investment banking
• Private credit
• Accounting firms
• CFO dashboards
Avoid:
• Jet black
• Neon accents
• Startup gradients
• “AI startup” vibes
7.2 Suggested Palette (Example)
• Backgrounds:
o Light gray (#F2F3F5)
o Soft slate (#E5E7EB)
• Text:
o Dark gray (#1F2937)
o Medium gray (#4B5563)
• Accents:
o Muted blue-gray (#64748B)
o Subtle metallic highlights
7.3 Typography
• Clean, readable, financial
• No playful fonts
• No oversized hero text
• Consistent spacing
The site should feel like:
“This could be used inside a bank or accounting firm.”
9. UX Improvements to Implement
High-ROI, low-eeort:
1. Progress indicator in estimator (e.g. Step 2 of 6)
2. Restaurant-specific question path (if industry = restaurant)
3. Results page that explains the estimate
4. Softer language around timelines (“varies by program”)
10. What Success Looks Like for This Iteration
By end of this iteration, EverflowCFO should:
• Look credible to a skeptical CFO
• Not resemble an ERC spam site
• Produce conservative, defensible estimates
• Generate higher-quality leads, not just more leads
• Impress backend partners as a real intake system