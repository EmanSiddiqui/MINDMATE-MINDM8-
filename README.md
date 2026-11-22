<div align="center">

# 🌿 MINDMATE
### Mental Wellness Assessment & Progress Tracking System

**A beginner-friendly, questionnaire-based wellness web application built with C++, HTML, CSS and JavaScript.**

![C++](https://img.shields.io/badge/C%2B%2B-11-00599C?style=flat-square&logo=cplusplus&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-Frontend-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Styling-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Interactive_UI-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/Status-Educational_Project-64748b?style=flat-square)

*Reflect • Understand • Grow*

</div>

---

## 📖 1. Project Overview

**MINDMATE** is an educational mental wellness web application designed to help users reflect on their daily feelings and habits through a short questionnaire. It calculates a **self-reported difficulty score**, suggests relevant wellness activities and spiritual reflections, and displays changes across multiple assessments.

The project combines a responsive web interface with a straightforward **C++ backend**. The backend handles questionnaire scoring; JavaScript handles the interface, saved assessment history and visual reports.

## 🎯 2. Objectives

- Provide a short, approachable daily wellness check-in.
- Help users notice patterns in mood, stress, rest, concentration and social connection.
- Present personalized, category-based wellness suggestions.
- Bring together **Wellness Studio** and **SUKOON** in one interface.
- Display self-reported trends through a monthly progress report.
- Demonstrate a complete user journey with **clearly marked fictional demo data**.
- Apply foundational C++ OOP concepts in a practical web project.

## ✨ 3. Key Features

### 3.1 Dashboard
- Overview of completed assessments and activity history.
- Latest reported difficulty score and primary focus category.
- Recent assessments and suggested activities.

### 3.2 Mental Wellness Assessment
- **10 daily check-in questions** covering emotions, stress, sleep, energy, focus, support and coping.
- Optional responses; users may leave questions unanswered.
- Scores are calculated from **questions 1–9** only.
- Question 10 is handled separately as a safety-related response and **never contributes to the numerical score**.

### 3.3 Personalized Recommendations
- Identifies the category with the greatest reported difficulty.
- Suggests matching activities from **Wellness Studio**.
- Suggests related optional reflections from **SUKOON**.
- Provides general encouragement to seek trusted or professional support when appropriate.

### 3.4 Monthly Wellness Report
- Date-based assessment history.
- **Line chart** showing changes in reported difficulty.
- **Doughnut chart** showing the distribution of recorded category difficulty.
- Category averages, unanswered-question counts and written summaries.
- An option to print the report.

### 3.5 Demo Monthly Report
- **Four simulated weekly assessments** for evaluation and demonstration.
- Accessible using **Monthly Report → Show Demo Month**.
- Includes the graphs and written progress analysis.
- Demo records exist only in memory and are **not merged into actual user history**.
- Return to saved assessments using **My Actual Data**.

### 3.6 Wellness Studio
- Explore supportive activities such as breathing, gentle movement, rest and journaling.
- Browse and filter activities; view their details.

### 3.7 SUKOON — Spiritual Reflections
- Optional Qur'anic reflection references and encouragement.
- Search reflections by topic or surah.
- Includes **six original user-shared Instagram reflection links**.
- Social-media material is labeled as unverified, not treated as authoritative religious guidance.

### 3.8 Psychologist Recommendations & Get Help
- Searchable directory of psychologist-related profiles from the original project.
- Names, credentials, availability and affiliations in that directory **have not been independently verified**; confirm details directly with the institution.
- A separate **Get Help** area provides support-oriented information.

### 3.9 Profile & Privacy Controls
- Edit a locally saved profile name.
- Export locally saved data as JSON.
- Delete locally saved assessments and profile information.

## 🛠️ 4. Technology Stack

| Technology | Role |
|---|---|
| **C++11** | Serves local project files; validates answers and calculates assessment results |
| **Windows Winsock (`ws2_32`)** | Runs the local HTTP server on Windows |
| **HTML5** | Website content and layout |
| **CSS3** | Responsive design, cards, charts and presentation |
| **JavaScript** | Navigation, form interaction, charts, recommendations and demo records |
| **JSON** | Stores bundled questions, activities, reflections and directory entries |
| **Browser `localStorage`** | Stores actual assessment history and profile information on the current browser |

The current version uses **no external database** and **no machine-learning API**.

## 🏗️ 5. Project Architecture

```text
User opens the website in a browser
                |
                v
      HTML + CSS + JavaScript
                |
       Assessment submitted
                |
                v
     POST /api/assessment
                |
                v
       C++ Assessment class
       - validates responses
       - calculates scores
       - returns JSON result
                |
                v
      JavaScript updates UI
       - shows suggestions
       - stores history locally
       - renders monthly charts
```

The **WebServer** C++ class serves the frontend and data files. JavaScript generates the demo report without sending simulated records to the C++ server.

## 📁 6. Project Structure

```text
MindMaze/
├── MINDMATE_AI.cpp              # C++ backend and local HTTP server
├── README.md                    # Project documentation
├── HOW_TO_RUN.txt               # Quick Windows setup guide
├── frontend/
│   ├── app.html                 # Main web interface
│   ├── css/
│   │   ├── mindmate.css         # Main visual styling
│   │   └── assessment.css       # Assessment and report styling
│   └── js/
│       └── assessment.js       # UI logic, reports and local history
├── data/
│   ├── questions.json          # Questionnaire text
│   ├── activities.json         # Wellness activities
│   ├── noor.json               # SUKOON reflections
│   ├── professionals.json      # Original support directory
│   └── community-reflections.json  # Instagram-linked reflections
└── docs/
    └── DSA_DOCUMENTATION.md    # Backend concepts for explanation
```

## 🚀 7. Installation & Running Locally

### Requirements
- Windows computer.
- Dev-C++ or another Windows C++ compiler that supports **C++11**.
- A modern web browser.

### Steps

1. **Download or clone** the repository and extract it if necessary.
2. Keep `MINDMATE_AI.cpp`, `frontend/` and `data/` together in the same `MindMaze` directory.
3. Open `MINDMATE_AI.cpp` in **Dev-C++**.
4. Enable **C++11** in the compiler settings.
5. Add the linker flag:

   ```text
   -lws2_32
   ```

6. Compile and run the program. Keep the console window open.
7. Open your browser and visit:

   **http://127.0.0.1:8080**

8. Start from the dashboard and open **Wellness Assessment** or **Monthly Report**.

**Troubleshooting:** If port `8080` is already in use, close the competing service or adjust the source and rebuild. If a Windows application-control policy blocks the executable, have the applicable policy reviewed rather than disabling security protections. Opening `frontend/app.html` directly will not provide a working scoring API.

## 📊 8. Assessment Scoring Method

The application uses **five categories**:

| Category | Questions |
|---|---|
| Mood & peace | Q1, Q2 |
| Stress & anxiety | Q3, Q4 |
| Sleep & energy | Q5, Q6 |
| Focus & coping | Q7, Q9 |
| Social connection | Q8 |

- For positive-worded questions, higher selected values mean **less** reported difficulty.
- For stress and anxiety questions, higher selected values mean **more** reported difficulty.
- Unanswered scored questions are excluded from the average.
- The category and overall values are scaled to **0–100**.
- **Higher values indicate more self-reported difficulty**, not a medical condition.
- Question 10 is excluded from all numerical calculations and is used only to display separate safety information when relevant.

These are **project-defined educational scores**, not validated clinical measures.

## 🎬 9. Evaluation Demo Guide

To demonstrate one month of progress without waiting a month:

1. Launch the website and open **Monthly Report**.
2. Click **Show Demo Month**.
3. Explain the **four fictional weekly records**.
4. Present the **weekly trend line chart** and **category doughnut chart**.
5. Review the category averages, written summary and recommendations.
6. Click **My Actual Data** to show the distinction between demonstration and saved records.
7. Demonstrate **SUKOON**, **Wellness Studio** and the **Psychologist Recommendations** section.

> Demo data is simulated for presentation purposes. It is not genuine user data or evidence of treatment effectiveness.

## 🔐 10. Privacy, Safety & Limitations

- **Local browser storage:** Real assessments and profile details are kept in unencrypted browser `localStorage`. Anyone with access to the same browser profile may potentially access them. Avoid using real sensitive information on shared devices.
- **No backend record storage:** The C++ server calculates scores but does not save submitted assessment answers in a server database.
- **Not a diagnosis:** The software is for educational self-reflection and cannot diagnose, treat or predict mental-health conditions.
- **Not emergency monitoring:** The app does not monitor the user, contact professionals or provide emergency services.
- **Unverified directory:** Professional listings are inherited from project materials and should be independently confirmed.
- **Deployment limitation:** **GitHub Pages cannot run this C++ backend.** The full application currently needs the local server. Publishing a functional static-only version requires adapting the scoring API to a supported backend or client-side implementation.

## 🧩 11. Object-Oriented Programming Concepts

The C++ source uses **two simple classes**:

| Class | Responsibility |
|---|---|
| `Assessment` | Stores ten responses in an array, validates input, calculates difficulty scores and builds a JSON result |
| `WebServer` | Reads project files, handles HTTP requests and serves the local website |

Other fundamental concepts include **objects, arrays, loops, conditions, methods, strings, file reading and basic network programming**. The scoring system does not require advanced data structures or a trained model.

## 🔮 12. Possible Future Improvements

- Optional authenticated accounts and secure database storage.
- Accessible hosting for the frontend and backend.
- Improved input validation, accessibility and automated testing.
- User-controlled data retention and privacy settings.
- Better reports with longer-term filtering and comparisons.
- Verification and maintenance of external support resources.

## 👩‍💻 13. Academic Project Note

**MINDMATE AI** is presented as a Computer Science educational project. The GUI project and the separate CLI project are independent implementations. This repository documents the **GUI + C++ local-server version**.

**Developed for academic learning and demonstration.**

---

<div align="center">

### 🌿 MINDMATE AI
*Small steps toward greater self-awareness.*

</div>
