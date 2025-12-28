Below is a **copy-paste ready MASTER DEV PROMPT** you can give to an AI dev agent (or use yourself) to build this properly.

It is **scalable, production-grade, and MVP-tight** — no fluff, no CMS nonsense.

---

# 🔧 MASTER DEVELOPMENT PROMPT

**EverflowCFO – Payroll Credit Pre-Assessment & Lead Orchestration Platform (MVP)**

You are a **senior full-stack engineer** building a **high-authority, enterprise-grade lead qualification and orchestration platform**.

This is **NOT** a payroll processor.
This is **NOT** tax filing software.
This is a **pre-underwriting estimator + CRM-style lead router**.

---

## 🎯 Core Objective

Build a **scalable web application** that:

* Converts cold outbound traffic into **high-intent leads**
* Provides a **professional, conservative payroll credit estimator**
* Routes qualified leads to **internal staff / partner processors**
* Tracks **assignment, status, attribution, and audit history**

The system must feel **institutional, authoritative, and legally safe**.

---

## 🧠 Product Philosophy (STRICT)

* Authoritative, not salesy
* Conservative estimates (ranges only, never guarantees)
* Step-based, structured UX
* Clear boundary between estimation and verification
* Designed to impress enterprise buyers and backend partners

---

## 🧑‍💼 User Roles (ONLY THESE)

### 1️⃣ Public User (Employer) — NO ACCOUNT

* Completes estimator
* Sees estimated credit range
* Submits contact info to view results
* Cannot log in
* Cannot edit later

Treat public users as **leads**, not platform users.

---

### 2️⃣ Admin (Internal)

* Secure login
* View all leads
* See estimator inputs + outputs
* Assign leads to staff
* Track status
* Export CSV
* Create / manage staff accounts

---

### 3️⃣ Staff (Partner / Processor)

* Secure login
* View **only assigned leads**
* See company info + estimate
* Update lead status
* Add notes
* Cannot edit original estimator data
* Cannot see unassigned leads

---

## 🧱 Required System Modules

### 1️⃣ Public Application

* Landing page
* Step-based estimator (wizard)
* Identity gate (lead capture)
* Results page with disclaimer

No CMS dependency for core logic.

---

### 2️⃣ Estimation Engine

* Rule-based (NO AI, NO ML)
* Conservative statutory caps
* Outputs:

  * Estimated min / max range
  * Credit flags (ERC, TIP, WOTC)
  * Eligibility signal (Low / Moderate / Strong)
* No sensitive data collected (no SSN, EIN, payroll files)

---

### 3️⃣ Admin CRM Panel

* Lead table with filters
* Lead detail view
* Assign staff dropdown
* Status controls
* Notes
* CSV export
* Audit trail

---

### 4️⃣ Staff Panel

* Assigned leads list
* Lead detail page
* Status update
* Notes field

---

## 🧾 Lead Lifecycle

```
New → Assigned → In Progress → Closed / Lost
```

Every transition must be **timestamped** and auditable.

---

## 🛠️ Tech Stack (LATEST, SCALABLE)

### Frontend

* **Next.js (latest stable, App Router)**
* TypeScript
* Server Components where applicable
* Tailwind CSS (institutional, minimal UI)
* Accessible, form-driven UX

---

### Backend

* Next.js API routes / server actions
* Clean service layer (no logic in UI)
* Strong input validation (Zod)

---

### Database

* **PostgreSQL (latest stable)**
* Prisma ORM
* JSONB fields for estimator inputs
* Indexed lead queries

---

### Caching / Performance

* **Redis (latest stable)**

  * Session caching
  * Rate limiting
  * Lead table performance
  * Background jobs (future-ready)

---

### Auth & Security

* Role-based authentication (Admin / Staff)
* Secure password hashing
* CSRF protection
* Audit logs
* No public access to admin/staff routes

---

### Notifications

* Email to staff when lead is assigned
* Internal assignment logs
* Status change history

---

## 🗂️ Minimum Database Schema (Conceptual)

### users

```
id
name
email
password_hash
role (admin | staff)
created_at
```

### leads

```
id
company_name
contact_name
email
phone
industry
inputs_json
estimated_min
estimated_max
credit_flags
eligibility_signal
status
assigned_staff_id
source
created_at
```

### lead_notes

```
id
lead_id
user_id
note
created_at
```

### audit_logs

```
id
entity_type
entity_id
action
performed_by
timestamp
```

---

## 🎨 UI / UX Requirements

* Dark / neutral palette
* Institutional typography
* Minimalist layout
* Trust-oriented microcopy
* No hype language
* Disclaimers always visible near results

---

## 🚀 Launch Acceptance Criteria

* Estimator fully functional
* Lead capture correctly gated
* Admin can assign leads
* Staff can log in and update status
* Disclaimers visible
* Cold email traffic lands directly in estimator
* No broken role boundaries

---

## 🚫 Explicit Non-Goals (DO NOT BUILD)

* Employer accounts or dashboards
* Payroll processing
* Tax filing
* Document uploads
* AI-based estimation
* Over-engineered CRM automations

---

## 📌 Final Instruction

Build this as a **clean, extensible MVP** that can later support:

* Employer login (Phase 2)
* Document verification
* Deeper partner integrations

But **do not pre-build unused features**.

> This product should feel like a **bank-grade screening system**, not a startup toy.

---

If you want next, I can:

* Turn this into a **GitHub README**
* Write a **Prisma schema**
* Create a **Next.js folder structure**
* Or help you estimate **dev time + cost**
No action needed.