# LessonCraft AI — AI-Powered Lesson Planner for Teachers 🍎✨

LessonCraft AI is a modern EdTech web application built for teachers to quickly turn any subject, topic, grade level, and class duration into classroom-ready teaching materials powered by **Google Gemini AI**.

---

## 🌟 Key Features

1. **Structured Lesson Plan**: Complete with learning objectives, required materials checklist, timed vertical timeline, side-by-side teacher/student activity cards, and formative assessment strategy.
2. **Printable Student Worksheet**: Clean student worksheet supporting multiple-choice, fill-in-the-blank, short answer, and true/false questions.
3. **5-Question Quiz**: Instant exit-ticket quiz ready for student assessment.
4. **Teacher Answer Key**: Step-by-step answer key with explanations for every quiz question.
5. **Google Workspace Integration**: Export lesson plans directly to **Google Docs** and create live interactive quizzes via **Google Forms**.
6. **Print-Optimized (`@media print`)**: Beautifully styled for paper printing and PDF generation with zero header/button clutter.
7. **Demonstration Mode**: High-quality prefilled demo fallback so judges can experience the app instantly even before adding API keys.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: HTML5, CSS3 (Modern CSS Grid & Flexbox, Plus Jakarta Sans font, Design System tokens), Vanilla JavaScript (No React/Vue/Angular required).
- **Backend**: Node.js, Express.js REST API.
- **AI Engine**: Google Gemini API (`@google/genai`).
- **Workspace Integrations**: Google Docs API & Google Forms API (`googleapis`).
- **Hosting / Deployment**: Firebase Hosting (`firebase.json`).

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `.env` and add your **Google Gemini API Key**:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000

# Optional: Google Workspace Integration (Docs & Forms API)
GOOGLE_PROJECT_ID=your_google_project_id
GOOGLE_CLIENT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> 💡 *Note: If `GEMINI_API_KEY` is not provided, LessonCraft AI automatically enters **Demonstration Mode**, serving high-quality generated content so you can demo the application without friction.*

### 3. Run Locally

```bash
npm start
```

Or for automatic server reloads during development:

```bash
npm run dev
```

Open your browser and navigate to:
`http://localhost:3000`

---

## ⚙️ Setting Up Google Docs & Forms Integration (Optional)

1. Create a Google Cloud Project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Google Docs API** and **Google Forms API**.
3. Create a Service Account under **IAM & Admin > Service Accounts** and generate a JSON Key.
4. Paste `client_email`, `private_key`, and `project_id` into your `.env` file.

If Google credentials are not set up, clicking export buttons will display a friendly configuration notification without crashing the application.

---

## 📦 Firebase Hosting Deployment

To deploy the application to Firebase Hosting:

1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```
2. Login to Firebase:
   ```bash
   firebase login
   ```
3. Initialize or deploy to your Firebase project:
   ```bash
   firebase deploy --only hosting
   ```

---

## 📸 Hackathon Demo Flow (2-3 Minutes)

1. **Dashboard**: Open `http://localhost:3000`. Show the clean EdTech SaaS interface and feature cards.
2. **Create Lesson**: Click **"Create New Lesson"** or **"Try Science Example"**.
3. **Form & Live Preview**: Note the two-column layout, grade level selector, duration dropdown, and real-time AI prompt preview card on the right.
4. **Generate**: Click **"Generate Lesson Plan"**. Watch the micro-animated step progress modal.
5. **Inspect Tabs**:
   - **Lesson Plan**: Review objectives, materials checklist, vertical timeline, and activity cards.
   - **Student Worksheet**: Switch to tab 2, click **"Print Student Worksheet"** to show print layout.
   - **Quiz**: Inspect the 5-question quiz.
   - **Answer Key**: View correct answers and teacher explanations.
6. **Export**: Click **"Export Google Doc"** or **"Create Google Form"**.

---

## 📄 License

MIT License. Built for Google EdTech Hackathon 2026.
