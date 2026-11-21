# ExamPrep — Smart Exam Planner

<img width="1275" height="1233" alt="ExamPrep Planner Icon" src="https://github.com/user-attachments/assets/d4d587ae-93ae-4aa6-9ec7-e0c998c33169" />

Aurhor : Fuad Hasan
Project Type: Desktop-Based Student Productivity Application
Course: CSE 2100 – Software Development Project I
Technologies: Electron, HTML, CSS, JavaScript, Chart.js

Abstract
ExamPrep is a desktop application designed to help university students organize and manage their examination preparation. It provides tools for managing upcoming examinations, organizing syllabus topics, creating revision schedules, tracking preparation progress, and monitoring examination countdowns.
The application aims to improve students' time management, academic productivity, and overall examination preparation experience.
Introduction
University students often face difficulties managing multiple examinations, remembering important dates, organizing course syllabuses, and maintaining regular revision schedules.
ExamPrep provides a centralized platform to solve these problems. Students can manage their academic activities through a simple and modern desktop interface.
The application is designed to work offline and maintain important user information through local data storage.
Methodology
The application follows a modular Electron-based architecture.
•	Desktop Runtime: Electron creates and manages the desktop application window.
•	Frontend: HTML provides the application structure, CSS handles styling, and JavaScript manages application functionality.
•	Data Visualization: Chart.js is used to display preparation statistics and progress reports.
•	Local Storage: Application data is stored locally to maintain information after restarting the application.
System Architecture
•	main.js creates and manages the Electron application window.
•	preload.js provides secure communication between the desktop runtime and frontend.
•	index.html provides the main application interface.
•	style.css manages the application's visual appearance.
•	JavaScript modules manage examinations, syllabus topics, revision schedules, progress tracking, and data storage.
Results and Features
ExamPrep includes the following major features:
•	Dashboard: Displays upcoming examinations, completed exams, preparation statistics, and daily revision tasks.
•	Exam Management: Add, edit, delete, and organize examination information.
•	Exam Countdown: Shows the remaining days, hours, and minutes before examinations.
•	Syllabus Management: Organize subjects and topics and mark completed or pending topics.
•	Revision Planner: Create, schedule, update, and track revision tasks.
•	Progress Tracker: Calculate overall and subject-wise syllabus completion percentages.
•	Progress Reports: Display preparation statistics through graphs and charts.
•	Theme Customization: Supports modern dark and light themes.
•	Offline Support: Core application features work without an internet connection.
Interface and User Experience
The application is designed with a modern productivity-focused interface.
It includes a sidebar navigation system, clean dashboard cards, organized data tables, progress indicators, graphical reports, and consistent visual elements.
The interface aims to provide a smooth and user-friendly experience for university students.
Discussion
ExamPrep combines multiple academic management tools into a single desktop application. Instead of using separate tools to manage examination dates, syllabuses, and revision schedules, students can manage everything from one centralized platform.
The use of Electron allows the application to run on desktop computers, while JavaScript handles the core application logic. Local data storage provides offline accessibility and data persistence.
The modular structure also makes the application easier to maintain and expand with additional features.
Conclusion
ExamPrep — Smart Exam Planner is designed to make examination preparation more organized, efficient, and manageable.
By combining examination management, syllabus organization, revision planning, countdown functionality, and progress tracking, the application provides a useful academic productivity solution for university students.
Future improvements may include AI-powered study recommendations, desktop notifications, calendar integration, cloud synchronization, and PDF progress reports.
How to Run
Requirements
•	Node.js
•	npm
•	Visual Studio Code (recommended)
Run Locally
1.	Clone the repository:
git clone YOUR_GITHUB_REPOSITORY_URL
2.	Navigate to the project directory:
cd ExamPrep
3.	Install dependencies:
npm install
4.	Start the application:
npm start
Build Desktop Application
After configuring the build scripts in package.json, use the appropriate build command to generate the Windows desktop application.
The generated installer will be available in the configured output directory.
________________________________________
ExamPrep — Plan smarter, prepare better, achieve more.

