Smart Triage Co-Pilot
AI-Powered Decision Support and Clinical Triage System for Primary Health Centres (PHCs)

==================================================

Overview

Smart Triage Co-Pilot is an intelligent healthcare platform designed to streamline patient intake and clinical prioritization. Frontline triage nurses capture vital signs, clinical symptoms, and deep medical history, while the algorithmic triage engine categorizes patients into Red, Yellow, or Green priority queues. Emergency physicians and doctors can review patient records, analyze vital abnormalities, allocate ICU beds, and coordinate care in real time.

==================================================

Core Features

1. Intelligent Patient Intake
- Multi-step structured intake for recording 10 essential vitals (BP, Heart Rate, SpO2, Temperature, Blood Glucose, WBC).
- Deep medical history tracking (past surgeries, family history, lifestyle, allergies, medications).
- Specialized screening modules for pregnancy and diabetes.

2. Algorithmic Color Triage Engine
- Automated urgency scoring and priority classification:
  - RED: Critical emergencies requiring immediate resuscitation.
  - YELLOW: Urgent conditions requiring prompt attention.
  - GREEN: Non-urgent or routine cases.
- Real-time clinical abnormality detection flagging hypertensive crisis, severe hyperglycemia, fever, and abnormal lab values.

3. Physician Dashboard and Patient 360
- Prioritized patient queue with live multi-device synchronization.
- Comprehensive 360-degree patient view with side-by-side diagnostic cards and internal scrolling.
- Dedicated clinical disposition station (Admit, Discharge, Refer, or Transfer to ICU).

4. Hospital Facility Management
- Live ICU bed occupancy tracking with automated bed allocation.
- Real-time blood bank inventory status.
- Synchronized hospital staff chat for nurse-to-doctor communication.
- Fast-track Code Red trauma dispatch simulation.

==================================================

User Authentication and Demo Credentials

The platform uses role-based access control (RBAC). Users sign in as either a Doctor or a Nurse with dedicated interfaces for each role.

Pre-Configured Demo Accounts:

| Role | Name | Email | Password | Landing Page |
| :--- | :--- | :--- | :--- | :--- |
| Doctor | Dr. Arvind Rao | doctor@smarttriage.org | doctor123 | /dashboard (Doctor 360 and Priority Queue) |
| Doctor | Dr. Amit Sharma | amitsharma@gmail.com | amit123 | /dashboard (Doctor 360 and Priority Queue) |
| Nurse | Nurse Priya Sharma | nurse@smarttriage.org | nurse123 | /intake (Vitals and Clinical Intake) |
| Nurse | Nurse Praharshitha | prash1805@gmail.com | prash123 | /intake (Vitals and Clinical Intake) |
| Staff | Compounder Suresh | staff@smarttriage.org | staff123 | /intake (General Intake) |

==================================================

How Sign-In and Sign-Up Works

1. Signing In (Existing Account)
- Navigate to /auth (or click Sign In from the landing page).
- Select your Role Tab: Click either the Doctor or Nurse tab at the top of the card.
- Enter your registered Email and Password.
- Click Sign In:
  - Doctors are routed to /dashboard (Physician 360, Priority Queue, ICU allocation, Staff Chat).
  - Nurses are routed to /intake (Patient registration, Vitals capture, Clinical history).
- Role Guard: If a Doctor account attempts to log in under the Nurse tab (or vice versa), the system prompts them to switch to the matching tab.

2. Signing Up (New Account)
- On the /auth page, select your role (Doctor or Nurse).
- Click "Need an account? Sign up" at the bottom of the form.
- Fill in the required fields:
  - Full Name: e.g. Dr. Radhika Sen or Nurse Kavita Nair
  - Email Address: e.g. radhika.sen@hospital.org
  - Medical or Nursing License ID (Optional): e.g. MCI-2024-5821
  - Password: Minimum 6 characters
  - Confirm Password: Must match password
- Click Register and Continue.
- The account is saved to the database and your session starts immediately.

3. Password Reset
- Click "Forgot password?" on the login form.
- Enter your registered email address.
- Enter and confirm your new password.
- Click Update Password to reset your credentials.

==================================================

End-to-End Clinical Workflow

1. Patient Arrival and Triage (Nurse Station)
- Nurse logs in and navigates to /intake.
- Records patient demographics, primary symptoms, and baseline vitals.
- Completes deep history, pregnancy, and diabetes screenings as needed.
- Reviews triage summary showing calculated urgency score and color category.
- Submits patient intake to the queue.

2. Priority Review and Treatment (Doctor Station)
- Doctor logs in and accesses /dashboard.
- The AI Priority Queue automatically displays waiting patients ordered by urgency.
- Doctor selects a patient to view the full Patient 360 matrix.
- Doctor reviews AI clinical abnormalities, enters clinical notes, and selects disposition routing.

3. Inter-Staff Collaboration
- Both doctors and nurses can exchange instant messages through the Staff Chat widget.
- Code Red emergency alerts automatically broadcast to all active staff.

==================================================

Technology Stack

- Framework: Next.js 15 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- UI Icons: Lucide React
- Database: Supabase (PostgreSQL) with local offline JSON fallback
- State Management: React Context API (IntakeContext, StaffChatContext)

==================================================

Local Development Setup

1. Clone the repository:
   git clone https://github.com/VyshnaviDondapati/Smart-Co-Pilot.git
   cd Smart-Co-Pilot

2. Install dependencies:
   npm install

3. Configure Environment Variables:
   Create a .env.local file in the root directory:
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

4. Run the development server:
   npm run dev

5. Open the application:
   http://localhost:3000

==================================================

License

Developed for Primary Health Centre clinical decision support and rural healthcare innovation.
