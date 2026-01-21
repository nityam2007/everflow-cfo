Intro
Context:
This is a targeted update to the existing everflowcfo.com to improve routing, conversion, and product clarity. The underlying design, structure, and tech stack should remain intact wherever possible.
What’s changing:
We’re tightening the site around three clear revenue pillars (Capital, Tax, Credits), making taxes a first-class product, simplifying credits around R&D, and removing ERC entirely. We’re also standardizing all flows to be async-first and eliminating any ambiguous CTAs.
What’s not changing:
This is not a redesign or rebuild. Pricing, brand tone, visual system, and existing patterns should be reused unless they block the required routing or flows.
This document defines what must change and what must exist, not how to implement it.


EverflowCFO – FINAL CHANGE INSTRUCTIONS
1. What Stays As-Is
Do not change the following unless required to support routing below:
	Overall brand, copy tone, and visual design
	SaaS-style flow (form → checkout → confirmation)
	Stripe as payment system
	Capital offering pricing structure (3 packages)
	General site layout and component style

2. Global Changes (Apply Everywhere)
2.1 No meetings
	Remove or avoid any language implying calls or meetings
	Use async language only (intake, upload docs, async review)
2.2 CTAs
	No generic “Contact Us” as a primary CTA
	Every CTA must route to:
o	a paid product flow or
o	a lead-only form
2.3 ERC
Remove ERC everywhere.
This includes:
	Pages
	Quizzes
	URLs
	Copy
	Metadata
	Internal references
ERC should not exist on the site at all.

3. Navigation (Top Nav)
Update / confirm top navigation is exactly:
	Capital
	Tax & Finance
	Credits
	How It Works
	Get Started (button)

4. Homepage (Router Update)
Homepage’s job = route users, not explain everything.
Hero CTAs
	Primary CTA: Get Tax Filing Done
	Secondary CTA: View Capital Solutions

Homepage sections
Homepage should clearly route users into:
	Capital
	Tax & Finance
	Credits
No dead-end CTAs.

5. Capital Section (Mostly Exists – Minor Changes)
5.1 Capital landing page
Keep structure. Update copy and routing only.
Required:
	Who it’s for
	What’s delivered (deliverables, not advice)
	3 packages
	How it works (async)
	CTA per package
5.2 Capital packages (pricing unchanged)
1.	Financial Model — $3,500
Delivery: 7 days
2.	Model + Investor Deck — $9,500
Delivery: 14 days
3.	Due Diligence & Deal Room — $5,000
Copy change
Replace “strategy session” with:
Async Narrative Intake + Review
Flow requirement (all three)
Landing → Intake Form → Stripe Checkout → Confirmation

6. Tax & Finance Section (Biggest Change)
6.1 Create a Tax routing page
This page must ask one question:
What do you need help with?
Two buttons only:
	Business Taxes
	Individual / Freelancer Taxes
These must route to separate pages.

6.2 Business Tax Page
Primary paid product
	Business Tax Filing — $1,500
Includes:
	Federal + state returns
	Year-end bookkeeping review
	K-1s (if applicable)
	Extension filing (if needed)

Secondary (lead-only, no checkout)
	Managed Back Office — $750/mo
	Fractional CFO — $3,000/mo
These must NOT go to Stripe.

6.3 Individual / Freelancer Tax Page
	Separate page
	Separate intake
	Paid flow (minimum one product)
	No business tax language

Flow:
Landing → Intake → Stripe Checkout → Confirmation

7. Credits Section (Simplify)
7.1 Rename section
	“Payroll Credits” → Tax Credits & Incentives
7.2 Credits landing page
Structure:
	R&D Tax Credit = flagship
	Other credits = secondary
	No ERC references

7.3 R&D Tax Credit (Lead-Only)
	Short eligibility form (not long quiz)
	Lead-only (no checkout)
Language posture:
	“We assess eligibility and connect you with trusted partners”
	Partner fulfills the work

After submit:
	Store lead
	Trigger partner handoff
	Show confirmation (“We’ll connect you shortly”)

7.4 Other credits
	FICA Tip Credit
	WOTC
These should be secondary and minimal.

8. How It Works Page
Show async flow clearly:
1.	Choose product
2.	Complete intake + upload docs
3.	Checkout (if paid)
4.	Delivery timeline (7 / 14 days, etc.)
5.	Async revisions/support
No calls mentioned.

9. Paid vs Lead-Only Summary (Very Important)
Paid (Stripe checkout)
	Capital: Model ($3,500)
	Capital: Model + Deck ($9,500)
	Capital: Diligence ($5,000)
	Business Tax Filing ($1,500)
	Individual / Freelancer Tax (paid)
Lead-only (no checkout)
	Managed Back Office
	Fractional CFO
	R&D Credit
	Other credits (if present)

10. Confirmation Pages (Required)
Each flow must end on a confirmation page that states:
	What happens next
	Timeline (if applicable)
	Next action (upload docs / watch email)
Do NOT prompt calendar scheduling by default.

11. Acceptance Checklist (When This Is “Done”)
	Nav matches spec
	Homepage routes cleanly
	Capital flows unchanged except copy + timelines
	Tax is split into Business vs Individual
	Managed Back Office & CFO are lead-only
	Credits renamed and simplified
	ERC does not exist anywhere
	All CTAs go somewhere intentional
	No meeting language anywhere

End-of-Doc Execution Checklist
Global
	Top navigation matches spec (Capital / Tax & Finance / Credits / How It Works / Get Started)
	Homepage routes cleanly to Capital, Tax, and Credits
	No meeting or call-based language anywhere
	ERC is completely removed (pages, URLs, copy, metadata)

Capital
	Capital landing page shows 3 packages with updated timelines (7 / 14 days)
	“Strategy session” replaced with Async Narrative Intake language
	Each capital package flows: landing → intake → checkout → confirmation
	Confirmation pages clearly explain next steps

Tax
	Tax routing page exists (Business vs Individual)
	Business Tax page routes to $1,500 checkout
	Individual / Freelancer Tax page is separate with its own paid flow
	Managed Back Office and Fractional CFO are lead-only (no checkout)
	Business and individual tax language is not mixed

Credits
	Credits section renamed to “Tax Credits & Incentives”
	R&D Tax Credit is lead-only with short eligibility form
	Partner handoff triggers after R&D form submit
	Other credits (FICA, WOTC) are secondary and minimal
	No ERC references remain

Funnels & CTAs
	All primary CTAs route to a defined flow (no dead ends)
	Paid products always go intake → checkout → confirmation
	Lead-only flows never go to checkout
	Confirmation pages explain what happens next


