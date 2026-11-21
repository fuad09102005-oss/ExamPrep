# ExamPrep – Smart Exam Planner

Course: CSE 2100 – Software Development Project I  
Category: Student Productivity & Academic Management

## Folder Structure

```
ExamPrep/
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── .gitignore
├── README.md
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── types/
    │   └── examPrep.ts
    ├── utils/
    │   ├── dateUtils.ts
    │   └── storage.ts
    ├── components/
    │   ├── ConfirmModal.tsx
    │   ├── DashboardScreen.tsx
    │   ├── ExamsScreen.tsx
    │   ├── ProgressScreen.tsx
    │   ├── RevisionScreen.tsx
    │   ├── SettingsScreen.tsx
    │   ├── Sidebar.tsx
    │   └── SyllabusScreen.tsx
    └── assets/
        └── images/
            └── avatar_student_profile_1795179533080.jpg
```

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
