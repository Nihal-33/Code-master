const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  bufferPages: true // Buffer pages to allow post-processing headers and footers safely
});

const outputPath = path.join(__dirname, 'CodeMaster_PRD.pdf');
doc.pipe(fs.createWriteStream(outputPath));

// Dark Theme Colors
const darkBg = '#0F172A'; // Slate 900 (Main background)
const cardBg = '#1E293B'; // Slate 800 (Metadata & list background)
const primaryColor = '#3B82F6'; // Electric Blue
const secondaryColor = '#8B5CF6'; // Vibrant Purple
const accentColor = '#22D3EE'; // Cyan
const textColor = '#F8FAFC'; // Slate 50 (Bright white text)
const mutedTextColor = '#94A3B8'; // Slate 400 (Muted gray text)
const borderColor = '#374151'; // Slate 700 (Border lines)

// Paint background for the first page
doc.rect(0, 0, 595, 842).fill(darkBg);

// Automatically paint background for subsequent pages
doc.on('pageAdded', () => {
  doc.rect(0, 0, 595, 842).fill(darkBg);
});

// Helper to draw a horizontal rule
function drawLine(y) {
  doc.strokeColor(borderColor).lineWidth(1).moveTo(50, y).lineTo(545, y).stroke();
}

// ----------------------------------------------------
// COVER PAGE
// ----------------------------------------------------
// Large visual header band
doc.rect(0, 0, 595, 250).fill('#020617');

doc.fillColor(textColor)
   .fontSize(36)
   .font('Helvetica-Bold')
   .text('CodeMaster', 50, 70);

doc.fontSize(22)
   .fillColor(accentColor)
   .text('E-Book Arena Platform', 50, 120);

doc.fontSize(14)
   .fillColor(mutedTextColor)
   .text('Product Requirement Document (PRD)', 50, 155);

// Metadata Box (Styled card container)
doc.rect(50, 300, 495, 155)
   .fillColor(cardBg)
   .rect(50, 300, 5, 155)
   .fill(primaryColor);

doc.fillColor(textColor)
   .fontSize(12)
   .font('Helvetica-Bold')
   .text('Document Metadata', 70, 315)
   .font('Helvetica')
   .fontSize(10)
   .fillColor(mutedTextColor)
   .text('Author: Antigravity AI Assistant', 70, 340)
   .text('Status: Approved & Complete', 70, 355)
   .text('Target Release: V2.0 Beta', 70, 370)
   .text('Date: July 19, 2026', 70, 385)
   .text('GitHub Repo: https://github.com/Nihal-33/Code-master', 70, 400);

doc.fillColor(accentColor)
   .font('Helvetica-Bold')
   .text('Live Deployment: https://codemaster-ebook-arena.vercel.app', 70, 422);

// Description
doc.fillColor(mutedTextColor)
   .fontSize(11)
   .font('Helvetica')
   .text('This document outlines the product requirements, design guidelines, functional modules, and technical architecture specifications for the CodeMaster Web Dev Academy platform—an interactive educational portal combining e-book readers, practice arenas, timed quizzes, gamified progression systems, and verifiable certificate issuance.', 50, 500, { width: 495, lineGap: 4 });

doc.addPage();

// ----------------------------------------------------
// SECTION 1: EXECUTIVE SUMMARY & VISION
// ----------------------------------------------------
doc.fillColor(primaryColor)
   .fontSize(16)
   .font('Helvetica-Bold')
   .text('1. Executive Summary & Vision', 50, 55);

doc.fillColor(textColor)
   .fontSize(10)
   .font('Helvetica')
   .text('CodeMaster solves the primary failure point of traditional programming e-books: passive reading. Most developers read concepts but fail to apply them in context. CodeMaster integrates learning modules directly with sandbox playgrounds, automatic assessment engines, timed quizzes, gamified progression systems, and verifiable digital completion rewards.', 50, 85, { width: 495, lineGap: 3 });

doc.font('Helvetica-Bold').text('Core Objectives:', 50, 145);
const objectives = [
  'Interactive Learning: Seamless shift from text chapters to immediate practice units.',
  'Comprehensive Track Coverage: High-quality syllabus for HTML5, CSS3, ES6+ JavaScript, and AngularJS.',
  'Actionable Gamification: High retention via Streaks, XP milestones, and leveling ranking systems.',
  'Verifiable Credentials: Automatically generated digital completion certificates securely tied to user profile history.'
];

let yOffset = 165;
objectives.forEach(obj => {
  doc.fillColor(secondaryColor).text('• ', 60, yOffset);
  doc.fillColor(textColor).font('Helvetica').text(obj, 75, yOffset, { width: 470 });
  yOffset += 20;
});

// ----------------------------------------------------
// SECTION 2: SYSTEM ARCHITECTURE
// ----------------------------------------------------
doc.fillColor(primaryColor)
   .fontSize(16)
   .font('Helvetica-Bold')
   .text('2. System Architecture & Tech Stack', 50, yOffset + 20);

doc.fillColor(textColor)
   .fontSize(10)
   .font('Helvetica')
   .text('CodeMaster utilizes a modern serverless architecture built on Angular for SPA rendering and Supabase for backend infrastructure.', 50, yOffset + 45, { width: 495 });

yOffset += 75;
doc.font('Helvetica-Bold').text('Frontend Layer:', 50, yOffset);
doc.font('Helvetica').fillColor(mutedTextColor).text('• Core Framework: Angular 18 (Standalone architecture, component encapsulation)\n• Styling Engine: Tailwind CSS (Responsive container widths, slate-900 typography, glass-panels)\n• Animations: Angular Animations API & Canvas Confetti for milestone events\n• Routing: Client-side Angular router with AuthGuard protection layers', 70, yOffset + 15, { lineGap: 3 });

yOffset += 85;
doc.fillColor(textColor).font('Helvetica-Bold').text('Backend & Storage Layer (Supabase):', 50, yOffset);
doc.font('Helvetica').fillColor(mutedTextColor).text('• Authentication: GoTrue engine (Email logins, Google & GitHub OAuth integrations, direct fallback)\n• Database: PostgreSQL (Relational schema enforcing referential integrity for progress logs)\n• Security: Row Level Security (RLS) policies protecting user notes and stats histories', 70, yOffset + 15, { lineGap: 3 });

doc.addPage();

// ----------------------------------------------------
// SECTION 3: FUNCTIONAL MODULES
// ----------------------------------------------------
doc.fillColor(primaryColor)
   .fontSize(16)
   .font('Helvetica-Bold')
   .text('3. Core Functional Modules', 50, 55);

doc.fillColor(textColor)
   .fontSize(10)
   .font('Helvetica-Bold')
   .text('3.1 Interactive E-Book Reader', 50, 85);

doc.font('Helvetica').fillColor(mutedTextColor).text('Allows readers to open individual chapter files, highlights definitions, take notes dynamically, bookmark items, and export all their notes directly as a print-formatted PDF.', 50, 100, { width: 495, lineGap: 3 });

doc.fillColor(textColor).font('Helvetica-Bold').text('3.2 Practice Arena', 50, 145);
doc.font('Helvetica').fillColor(mutedTextColor).text('Following each syllabus chapter, the user is presented with practice questions. This includes Multiple Choice Questions, output predictions, drag-and-drop code nodes, and fill-in-the-blanks with instant compilation and check buttons.', 50, 160, { width: 495, lineGap: 3 });

doc.fillColor(textColor).font('Helvetica-Bold').text('3.3 Quiz Arena & Exam Engine', 50, 210);
doc.font('Helvetica').fillColor(mutedTextColor).text('A separate testing environment where users take timed course exams. Successful completion (score of 80% or higher) unlocks the digital verifiable course certificate.', 50, 225, { width: 495, lineGap: 3 });

doc.fillColor(textColor).font('Helvetica-Bold').text('3.4 Gamification System', 50, 275);
doc.font('Helvetica').fillColor(mutedTextColor).text('• Streak Counter: Tracks consecutive learning days with automated check-ins.\n• XP Points: Grants +10 XP for reading, +20 XP for practice, and +50 XP for quizzes.\n• Level Up system: Progression ranks from Beginner, Explorer, Builder, Developer, to Master.', 50, 290, { width: 495, lineGap: 4 });

doc.fillColor(textColor).font('Helvetica-Bold').text('3.5 Digital Verifiable Certificates', 50, 360);
doc.font('Helvetica').fillColor(mutedTextColor).text('Automatically generates completion certificates featuring unique validation IDs (e.g. CM-HTML5-XXXX) dynamically saved to Supabase and viewable under the user profile certificates list.', 50, 375, { width: 495, lineGap: 3 });

// ----------------------------------------------------
// SECTION 4: DATABASE SCHEMA SPECIFICATIONS
// ----------------------------------------------------
doc.fillColor(primaryColor)
   .fontSize(16)
   .font('Helvetica-Bold')
   .text('4. Core Database Models', 50, 435);

doc.fillColor(textColor)
   .fontSize(10)
   .font('Helvetica')
   .text('Below is the relational mapping implemented in PostgreSQL:', 50, 465);

const tables = [
  { name: 'users', desc: 'Saves user profile stats (XP, level, streak, achievements, avatar URL).' },
  { name: 'courses', desc: 'Stores track syllabus titles, difficulty metadata, and slugs.' },
  { name: 'chapters', desc: 'Stores content text, examples, code blocks, and chapter ordering.' },
  { name: 'user_progress', desc: 'Tracks completed chapters, practice state, and timestamps.' },
  { name: 'bookmarks', desc: 'Saves bookmarked chapters per user for quick reference.' },
  { name: 'notes', desc: 'Stores rich user notes per chapter for PDF export.' },
  { name: 'quizzes', desc: 'Saves exam configurations, scores, and completion state.' },
  { name: 'certificates', desc: 'Saves verifiable credentials with secure unique codes.' }
];

let tableY = 490;
tables.forEach(table => {
  doc.font('Helvetica-Bold').fillColor(secondaryColor).text(table.name, 60, tableY);
  doc.font('Helvetica').fillColor(mutedTextColor).text(`: ${table.desc}`, 150, tableY, { width: 395 });
  tableY += 20;
});

doc.addPage();

// ----------------------------------------------------
// SECTION 5: DESIGN & RESPONSIVENESS
// ----------------------------------------------------
doc.fillColor(primaryColor)
   .fontSize(16)
   .font('Helvetica-Bold')
   .text('5. Responsive Design & Accessibility Guidelines', 50, 55);

doc.fillColor(textColor)
   .fontSize(10)
   .font('Helvetica-Bold')
   .text('5.1 Desktop Layout Viewport', 50, 85);
doc.font('Helvetica').fillColor(mutedTextColor).text('Displays the main sidebar layout containing navigation links, gamification stats (XP, Streak, Level rank), content read section, and active user profile details.', 50, 100, { width: 495, lineGap: 3 });

doc.fillColor(textColor).font('Helvetica-Bold').text('5.2 Mobile Viewport Layout', 50, 145);
doc.font('Helvetica').fillColor(mutedTextColor).text('• Collapse Sidebar: Collapses to a hidden drawer overlay with smooth side-slide animations.\n• Top Responsive Header: Displays Brand logo, gamification pills, and an animated hamburger icon.\n• Mobile Dropdown Drawer: Provides quick, thumb-optimized links to ensure all features are fully interactive.', 50, 160, { width: 495, lineGap: 4 });

doc.fillColor(textColor).font('Helvetica-Bold').text('5.3 Glassmorphism Style Tokens:', 50, 225);
doc.font('Helvetica').fillColor(mutedTextColor).text('• Body Background: Dark Slate (#0F172A)\n• Card Panels: Semi-transparent Slate-900 (rgba(17, 24, 39, 0.7)) with backdrop blur filters (12px)\n• Borders: Thin, semi-transparent white borders (rgba(255, 255, 255, 0.08))\n• Typography: Interactive neon primary, secondary, and accent colors.', 50, 240, { width: 495, lineGap: 4 });

// ----------------------------------------------------
// SECTION 6: FUTURE DEVELOPMENT PLANS
// ----------------------------------------------------
doc.fillColor(primaryColor)
   .fontSize(16)
   .font('Helvetica-Bold')
   .text('6. Future Product Roadmap', 50, 320);

doc.fillColor(textColor)
   .fontSize(10)
   .font('Helvetica').fillColor(mutedTextColor).text('• Collaborative Coding: Real-time pair programming sandboxes directly inside the browser.\n• AI Tutor Integration: Direct chat prompt window aiding in debugging code outputs.\n• Mobile Native App: Native Android and iOS packages wrapped using Capacitor / Cordova.\n• SQL practice tracks: Live sandbox databases to practice SQL schema queries.', 50, 350, { width: 495, lineGap: 5 });

// ----------------------------------------------------
// POST-PROCESSING HEADERS & FOOTERS
// ----------------------------------------------------
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  
  if (i === 0) continue; // Skip cover page
  
  // Header text & divider
  doc.fillColor(mutedTextColor)
     .fontSize(8)
     .font('Helvetica')
     .text('CodeMaster V2.0 — Product Requirement Document', 50, 25)
     .text('Status: Active', 450, 25, { align: 'right' });
  doc.strokeColor(borderColor).lineWidth(0.5).moveTo(50, 35).lineTo(545, 35).stroke();

  // Footer text & divider
  doc.strokeColor(borderColor).lineWidth(0.5).moveTo(50, 795).lineTo(545, 795).stroke();
  doc.fillColor(mutedTextColor)
     .fontSize(8)
     .text(`Page ${i + 1} of ${range.count}`, 50, 805, { align: 'center' });
}

// Close Document
doc.end();
console.log('PRD PDF generated successfully!');
