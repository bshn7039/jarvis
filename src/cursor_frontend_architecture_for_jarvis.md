# Frontend architecture for Jarvis AI operating system
_Exported on 5/20/2026 at 21:47:37 GMT+5:30 from Cursor (3.4.20)_

---

**User**

Use this as the master prompt for your AI coding agent.

Do NOT shorten it.
Do NOT simplify it.
This prompt is intentionally strict so the AI produces scalable architecture instead of messy beginner code.

---

You are a senior frontend engineer and UI systems architect.

Your task is to build the FRONTEND ONLY for a personal AI operating system called "Jarvis".

IMPORTANT:
This is NOT a landing page generator project.
This is NOT a generic dashboard.
This is a minimalist AI-powered personal operating system inspired by:

* ChatGPT
* Notion
* Linear
* Arc Browser
* Obsidian

The UI must feel:

* premium
* intelligent
* minimalist
* smooth
* distraction-free
* monochrome dark themed

ABSOLUTELY AVOID:

* gamer UI
* cyberpunk neon
* flashy animations
* gradients everywhere
* glassmorphism overload
* crypto-dashboard aesthetics
* cluttered cards
* colorful UI

==================================================
TECH STACK
==========

Use:

* React.js
* Tailwind CSS
* React Router
* Lucide React Icons

DO NOT:

* use Material UI
* use Bootstrap
* use Chakra UI
* use inline styles everywhere
* use TypeScript
* use Redux

Keep architecture scalable and clean.

==================================================
GOAL
====

Build ONLY the HOME PAGE frontend UI.

NO backend.
NO Firebase.
NO OpenAI API.
NO authentication.
NO database logic.
NO drag/drop logic yet.
NO real functionality.

ONLY create a polished static frontend shell.

==================================================
PROJECT STRUCTURE
=================

Create this structure:

src/
│
├── pages/
│   └── Home.jsx
│
├── components/
│   ├── sidebar/
│   │   ├── Sidebar.jsx
│   │   ├── SidebarSection.jsx
│   │   └── SidebarItem.jsx
│   │
│   ├── chat/
│   │   ├── ChatWindow.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── ChatHeader.jsx
│   │   └── PromptBar.jsx
│   │
│   ├── ui/
│   │   ├── IconButton.jsx
│   │   └── Divider.jsx
│   │
│   └── layout/
│       └── MainLayout.jsx
│
├── data/
│   └── mockData.js
│
├── styles/
│   └── globals.css
│
├── App.jsx
└── main.jsx

==================================================
DESIGN SYSTEM
=============

THEME:
Monochrome dark mode.

COLOR PALETTE:

Background:
#0f0f0f

Secondary Panels:
#181818

Borders:
#2a2a2a

Primary Text:
#f5f5f5

Muted Text:
#9ca3af

Accent:
#7dd3fc

Use accent color VERY sparingly.

==================================================
TYPOGRAPHY
==========

Use:

* Inter font

Font weights:

* clean
* modern
* readable

Avoid:

* futuristic fonts
* hacker fonts
* gaming fonts

==================================================
LAYOUT
======

The homepage layout should look similar to ChatGPT but customized for Jarvis.

Structure:

---

LEFT SIDEBAR

* fixed width
* dark panel
* collapsible in future
* smooth layout
* thin borders

MAIN CONTENT AREA

* flexible width
* centered chat content
* spacious
* clean whitespace

BOTTOM PROMPT BAR

* fixed near bottom
* modern rounded container
* upload button
* microphone button
* send button

---

==================================================
SIDEBAR REQUIREMENTS
====================

Top:

* text logo "JARVIS"

Under logo:

* Home
* New Chat

Then:
Chat History Section

Chat items format:
YYYY-MM-DD — Auto Generated Title

Examples:
2026-05-20 — Fitness Planning
2026-05-19 — Semester Revision
2026-05-18 — Finance Tracking

Use mock data only.

Then:
Database Section

Database section must visually resemble a folder system.

Include dropdown arrows.

Include checkboxes beside each folder.

Mock structure:

☑ Personal Profile
☑ Academics
☑ Current Education
☑ Skills In Progress
☑ Revision Deck
☑ Fitness
☐ Trading
☑ Journal
☐ CRM

Checkboxes are ONLY visual for now.

Dropdowns can be static.

==================================================
MAIN CHAT AREA
==============

The center area should feel calm and intelligent.

When no active chat:
Display:

* subtle centered "Jarvis AI"
* muted subtitle
* lots of whitespace

Suggested subtitle:
"Your Personal Operating System"

The chat area should support:

* mock user messages
* mock AI messages

Design message bubbles:

* subtle contrast
* rounded corners
* minimalist spacing

==================================================
PROMPT BAR
==========

At bottom center.

Must contain:

LEFT:

* upload icon button

CENTER:

* text input

RIGHT:

* microphone button
* send button

Prompt bar style:

* rounded
* dark
* subtle borders
* premium feel

Placeholder:
"Write your prompt here..."

==================================================
RESPONSIVENESS
==============

Desktop:

* full sidebar visible

Tablet:

* narrower sidebar

Mobile:

* sidebar collapses
* clean mobile spacing
* prompt bar remains accessible

IMPORTANT:
Must look good on:

* 1920px desktop
* laptop
* tablet
* mobile

==================================================
ANIMATION RULES
===============

ONLY USE:

* fade transitions
* hover transitions
* smooth spacing transitions

DO NOT USE:

* bouncing
* glowing
* parallax
* flashy effects
* heavy motion

Keep animation subtle and premium.

==================================================
CODE QUALITY
============

Requirements:

* modular components
* reusable structure
* clean naming
* scalable architecture
* proper spacing
* proper Tailwind organization

Avoid:

* giant single-file components
* repeated code
* messy className chains
* hardcoded inline CSS

==================================================
FINAL OUTPUT REQUIREMENTS
=========================

Generate:

* all React component files
* Tailwind-based styling
* mock data file
* responsive layout
* polished UI

The code should run immediately after:
npm install
npm run dev

DO NOT generate explanations.

ONLY generate production-quality frontend code.


---

**Cursor**

Exploring the project and implementing the Jarvis frontend per your specifications.


Installing dependencies and creating the full component structure.


Jarvis home UI is in place. Run:

```bash
npm install
npm run dev
```

Also fixed a stray `javascript` line in `vite.config.js` that was breaking the build.

---

**User**

You are continuing the existing React + Tailwind CSS frontend project for the AI operating system called "Jarvis".

The Home page already exists.

Your task now is to build the CANVAS PAGE frontend ONLY with HARDCODED DATA.

IMPORTANT:
This is NOT a whiteboard app.
This is NOT Figma.
This is NOT a drag-and-drop builder yet.

This is a structured modular workspace that FEELS expansive and intelligent while remaining stable and responsive.

==================================================
OBJECTIVE
=========

Build:

1. Canvas Page
2. Sidebar integration update
3. Canvas navigation
4. Zoomable/pannable workspace shell
5. Hardcoded module cards
6. Folder-style database explorer

NO backend.
NO Firebase.
NO OpenAI.
NO drag/drop logic yet.
NO real database.
NO real zoom engine math.

Static frontend architecture only.

==================================================
ROUTING REQUIREMENTS
====================

Use React Router.

Routes:

/               → Home Page
/canvas         → Canvas Workspace Page

IMPORTANT:
Clicking "JARVIS" text/logo ALWAYS routes back to "/"

Sidebar navigation:

* Home
* Canvas

Canvas button should appear BELOW Home.

==================================================
PROJECT STRUCTURE
=================

Extend the existing structure cleanly.

Create:

src/
│
├── pages/
│   ├── Home.jsx
│   └── Canvas.jsx
│
├── components/
│   ├── canvas/
│   │   ├── CanvasWorkspace.jsx
│   │   ├── CanvasToolbar.jsx
│   │   ├── ZoomControls.jsx
│   │   ├── ModuleCard.jsx
│   │   ├── ModuleTree.jsx
│   │   └── WorkspaceGrid.jsx
│   │
│   ├── sidebar/
│   │   ├── Sidebar.jsx
│   │   ├── SidebarItem.jsx
│   │   └── SidebarSection.jsx
│   │
│   └── layout/
│       └── MainLayout.jsx
│
├── data/
│   ├── mockChats.js
│   ├── mockModules.js
│   └── mockCanvasData.js

==================================================
CANVAS PAGE CONCEPT
===================

The canvas is a large expandable workspace area.

It should FEEL:

* free
* spacious
* modular
* intelligent
* minimal

But technically:

* stable
* responsive
* structured

IMPORTANT:
DO NOT create a true infinite canvas.

Instead:
Create a very large pannable workspace area.

Example:

* workspace min-width: 4000px
* workspace min-height: 3000px

This creates the illusion of infinity.

==================================================
CANVAS LAYOUT
=============

Layout structure:

---

LEFT SIDEBAR

* same style as Home page
* fixed width
* dark monochrome
* minimal borders

RIGHT MAIN AREA

* full canvas workspace
* scrollable
* pannable feeling
* dark background
* subtle grid texture

TOP TOOLBAR
Contains:

* current page title
* zoom percentage
* zoom in button
* zoom out button
* reset view button

BOTTOM:
No prompt bar needed yet on canvas page.

==================================================
SIDEBAR REQUIREMENTS
====================

Top:

* JARVIS text logo
* clicking routes to "/"

Navigation:

* Home
* Canvas

Canvas should visually appear active when on canvas page.

Then:
DATABASE section.

==================================================
DATABASE TREE SYSTEM
====================

The database explorer must resemble a filesystem.

Requirements:

* dropdown arrows
* nested folder hierarchy
* checkboxes beside EVERY item
* visual indentation
* expandable structure

Example:

☑ Personal Profile
☑ fullName
☑ age
☑ birthday

☑ Academics
☑ Current Education
☑ semester
☑ subjects[]
☑ assignments[]
☑ Skills In Progress
☑ Revision Deck

☑ Fitness
☐ Trading
☑ Journal

IMPORTANT:
Checked items appear on canvas.
Unchecked items do NOT appear.

For now:
This can be simulated using local React state only.

==================================================
CANVAS MODULE SYSTEM
====================

The canvas contains hardcoded floating modules/cards.

Each module card represents a database section.

Create at least:

1. Personal Profile Module
2. Academics Module
3. Fitness Module
4. Journal Module

==================================================
MODULE CARD DESIGN
==================

Each module card should contain:

HEADER:

* title
* small collapse icon
* small checkbox indicator

BODY:

* nested data tree
* minimal typography
* filesystem-like appearance

STYLE:

* dark panels
* thin borders
* subtle hover
* rounded corners
* soft shadows
* minimalistic

==================================================
MODULE POSITIONING
==================

Modules should appear spaced across the workspace.

Example:

* one top-left
* one center-right
* one lower-left
* one lower-right

DO NOT stack vertically only.

The workspace should feel spatial and exploratory.

==================================================
ZOOM/PAN SYSTEM
===============

IMPORTANT:
DO NOT build custom zoom math.

Use simple CSS transform scaling OR lightweight implementation.

Requirements:

* zoom in button
* zoom out button
* reset button
* smooth transitions

Optional:
Use react-zoom-pan-pinch IF needed.

BUT:
Keep implementation lightweight.

==================================================
DESIGN SYSTEM
=============

THEME:
Monochrome minimal dark mode.

COLORS:

Background:
#0f0f0f

Secondary:
#181818

Borders:
#2a2a2a

Text:
#f5f5f5

Muted:
#9ca3af

Accent:
#7dd3fc

==================================================
TYPOGRAPHY
==========

Use:

* Inter font

Avoid:

* futuristic fonts
* hacker fonts
* gaming aesthetics

==================================================
ANIMATION RULES
===============

ONLY:

* fade
* smooth scaling
* hover transitions
* smooth collapse transitions

NO:

* neon glow
* parallax
* bouncing
* flashy effects
* cyberpunk effects

==================================================
RESPONSIVENESS
==============

Desktop:

* full canvas visible

Tablet:

* maintain usability

Mobile:

* canvas becomes scrollable
* sidebar collapses gracefully
* modules remain readable

IMPORTANT:
Do NOT break mobile layout.

==================================================
HARDCODED MOCK DATA
===================

Use realistic mock data.

Examples:

Personal Profile:

* heightCm: 178
* weightKg: 74
* bodyType: Lean

Academics:

* semester: 6
* DSA progress: 65%
* Current project: Jarvis OS

Fitness:

* Protein Target: 140g
* Workout Split: Push/Pull/Legs

Journal:

* Mood Score: 7/10
* Reflection: "Need better consistency."

==================================================
VISUAL GOAL
===========

The final result should feel like:

"ChatGPT + Notion + Obsidian + a futuristic personal operating system"

BUT:
restrained
minimal
professional
calm

==================================================
FINAL OUTPUT REQUIREMENTS
=========================

Generate:

* all React component code
* Tailwind styling
* routing updates
* mock data files
* responsive canvas layout
* zoom controls
* nested database explorer
* hardcoded module rendering

The project should run immediately with:
npm run dev

DO NOT generate explanations.

ONLY generate clean scalable frontend code.


---

**Cursor**

Implementing the Canvas page, data files, sidebar routing, and workspace components.


Canvas page is live at `/canvas`.

- **Routes:** `/` (Home), `/canvas` (workspace)
- **Sidebar:** JARVIS → `/`, Home + Canvas nav, database tree with checkboxes (visibility drives canvas modules)
- **Canvas:** 4000×3000 scrollable workspace, zoom controls, 4 positioned module cards, grid background

```bash
npm run dev
```

---

**User**

You are continuing the existing React + Tailwind frontend project for the AI operating system "Jarvis".

You must now REFACTOR and IMPROVE the architecture and behavior of the frontend.

DO NOT redesign the visual theme.
Keep the existing monochrome minimalist dark aesthetic.

The task is to FIX the current architectural and interaction problems.

==================================================
CRITICAL FIXES REQUIRED
=======================

CURRENT PROBLEMS:

1. Database tree incorrectly appears on Home page
2. Canvas modules are static and not movable
3. Sidebar checkboxes do not control module visibility
4. Module checkboxes do not work
5. Canvas feels like a dashboard instead of a free workspace
6. Canvas interaction system is incomplete
7. Module rendering is not reactive
8. Sidebar/database state is not connected to canvas state

You must fix all of these cleanly.

==================================================
GOAL
====

Transform the canvas into:

* a pannable workspace
* modular
* movable
* dynamically controlled
* checkbox-driven
* zoomable
* free-feeling
* still minimalist and stable

==================================================
VERY IMPORTANT ARCHITECTURE RULES
=================================

1. DATABASE TREE ONLY EXISTS ON CANVAS PAGE

REMOVE database tree completely from Home page sidebar.

Home page sidebar should ONLY contain:

* JARVIS
* Home
* Canvas
* Chat History

NO database explorer on Home page.

==================================================
2. CANVAS PAGE SIDEBAR
======================

Canvas page sidebar contains:

* JARVIS logo/text
* Home
* Canvas
* Database Explorer Tree

ONLY canvas page contains database explorer.

==================================================
3. DATABASE TREE MUST CONTROL REAL STATE
========================================

The sidebar checkboxes MUST ACTUALLY WORK.

Behavior:

Checked:
→ module appears on canvas

Unchecked:
→ module disappears from canvas

Use React state management.

DO NOT use fake static checkboxes anymore.

==================================================
4. MODULE HEADER CHECKBOXES MUST WORK
=====================================

Each canvas module card contains:

* title
* collapse button
* visibility checkbox

Behavior:
If unchecked:
→ instantly hide that module from canvas
→ synchronize sidebar checkbox state

State must stay synced BOTH WAYS.

==================================================
5. MODULES MUST BECOME MOVEABLE
===============================

IMPORTANT:
Modules should now be draggable.

User must be able to:

* click
* hold
* move modules around workspace

BUT:
Do NOT build custom drag physics manually.

USE:
react-draggable

Requirements:

* smooth dragging
* no lag
* preserve minimalist feel
* desktop and mobile safe

==================================================
6. CANVAS MUST FEEL FREE
========================

The workspace should NOT feel locked.

Implement:

* large workspace area
* horizontal scrolling
* vertical scrolling
* panning feeling
* draggable modules
* zoom support

DO NOT create true infinite rendering.

Use:
large workspace container:

* width: 5000px
* height: 4000px

==================================================
7. ZOOM SYSTEM
==============

Implement proper zoom system.

USE:
react-zoom-pan-pinch

Requirements:

* zoom in button
* zoom out button
* reset button
* smooth transitions
* mouse wheel zoom
* touchpad support

IMPORTANT:
Only workspace zooms.
Sidebar remains fixed.

==================================================
8. MODULE POSITION SYSTEM
=========================

Each module should have:

* x position
* y position

Store positions in local state for now.

Mock initial layout example:

Personal Profile:
x: 300
y: 200

Academics:
x: 1200
y: 300

Fitness:
x: 700
y: 1200

Journal:
x: 1800
y: 900

==================================================
9. MODULE RENDERING
===================

Render modules dynamically from state.

DO NOT hardcode modules individually.

Use:
map()

Each module object should contain:

* id
* title
* visible
* position
* data

==================================================
10. DATABASE TREE STRUCTURE
===========================

The database explorer should behave like a true filesystem.

Requirements:

* nested dropdowns
* expandable folders
* indentation
* working visibility checkboxes
* smooth collapse animations

Structure example:

☑ Academics
☑ Current Education
☑ semester
☑ subjects[]
☑ Skills In Progress
☑ Revision Deck

==================================================
11. IMPORTANT UX RULE
=====================

The canvas should feel:

* calm
* intelligent
* spacious
* smooth

NOT:

* chaotic
* crowded
* cyberpunk
* flashy

==================================================
12. DESIGN SYSTEM
=================

KEEP EXISTING THEME.

Background:
#0f0f0f

Panels:
#181818

Borders:
#2a2a2a

Text:
#f5f5f5

Muted:
#9ca3af

Accent:
#7dd3fc

==================================================
13. RESPONSIVENESS
==================

Desktop:

* full experience

Tablet:

* usable dragging
* usable zoom

Mobile:

* scrollable workspace
* stable sidebar
* readable modules

==================================================
14. CODE QUALITY
================

Requirements:

* modular architecture
* reusable components
* no duplicated code
* clean React state management
* scalable structure

AVOID:

* giant files
* inline styles everywhere
* hardcoded repeated JSX

==================================================
15. REQUIRED LIBRARIES
======================

Install and use:

npm install react-draggable
npm install react-zoom-pan-pinch

==================================================
16. FINAL EXPECTED RESULT
=========================

FINAL EXPERIENCE SHOULD FEEL LIKE:

* Obsidian canvas
* Notion systems thinking
* ChatGPT minimalism
* personal operating system

The user should be able to:

* open canvas
* zoom around
* move modules
* hide/show modules
* navigate folders
* explore freely

WITHOUT the interface becoming messy.

==================================================
OUTPUT REQUIREMENTS
===================

Generate:

* updated components
* updated state architecture
* draggable modules
* synced checkbox system
* zoom/pan implementation
* cleaned Home sidebar
* responsive workspace

Project must run immediately after:
npm install
npm run dev

DO NOT generate explanations.

ONLY generate clean scalable production-quality frontend code.


---

**Cursor**

Implementing unified canvas state, zoom/pan, draggable modules, and sidebar fixes.


Refactor complete. Run `npm run dev`.

**Fixed**
- Database tree only on `/canvas`; Home sidebar is JARVIS, Home, Canvas, Chat History
- Unified `CanvasContext` state — sidebar ↔ module visibility synced both ways
- Modules from state (`visible`, `position`, `data`), rendered with `map()`
- `react-draggable` modules + `react-zoom-pan-pinch` workspace (wheel/pinch, toolbar zoom)
- 5000×4000 workspace with grid background

---

**User**

You are continuing the existing React + Tailwind frontend project for the AI operating system "Jarvis".

The latest implementation introduced major regressions and missing architecture.

You must FIX the current broken state and COMPLETE the missing systems cleanly.

==================================================
CRITICAL ISSUES TO FIX
======================

CURRENT PROBLEMS:

1. Canvas page appears blank/black
2. Sidebar disappeared
3. Routing structure is broken
4. Landing/Logo page does not exist or is not connected properly
5. Sidebar collapse/open system does not exist
6. Navigation hierarchy incomplete
7. App startup flow incorrect

You must fix ALL of these.

==================================================
CORE APPLICATION FLOW
=====================

Correct application routing flow:

/                 → Landing / Logo Page
/home             → Home AI Page
/canvas           → Canvas Workspace

IMPORTANT:
Landing page must become DEFAULT route.

==================================================

1. CREATE LANDING / LOGO PAGE
   ==================================================

IF landing page does not exist:
CREATE IT.

File:

src/pages/Landing.jsx

==================================================
LANDING PAGE PURPOSE
====================

This page is:

* atmospheric
* minimalist
* premium
* calm
* cinematic

NOT flashy.

==================================================
LANDING PAGE DESIGN
===================

THEME:
Black/white monochrome minimalism.

Layout:

* centered logo
* subtle ambient animated particles/lines
* soft motion
* huge whitespace
* premium typography

Center:

* JARVIS logo/text
* subtle subtitle
* "Enter The Matrix" button

Button behavior:
Clicking button routes to:
"/home"

==================================================
LANDING PAGE ANIMATION RULES
============================

ONLY subtle animations:

* floating particles
* slow moving lines
* opacity fades
* ambient movement

NO:

* neon
* cyberpunk
* gamer effects
* glowing RGB
* chaotic animations

==================================================
2. FIX ROUTING SYSTEM
=====================

Use React Router correctly.

Correct routes:

/              → Landing
/home          → Home
/canvas        → Canvas

==================================================
3. FIX SIDEBAR SYSTEM
=====================

The sidebar must exist and work on:

* Home page
* Canvas page

==================================================
SIDEBAR REQUIREMENTS
====================

Top:

* sidebar toggle button
* JARVIS logo text

Clicking JARVIS:
→ always routes to "/home"

Navigation:

* Home
* Canvas

==================================================
4. SIDEBAR COLLAPSE SYSTEM
==========================

You MUST implement:

* open/close sidebar button
* smooth transitions
* icon toggle

Behavior:

Expanded:

* full width
* labels visible

Collapsed:

* narrow width
* icons only

Must work on:

* desktop
* tablet
* mobile

==================================================
5. FIX BLANK CANVAS PAGE
========================

Canvas rendering currently broken.

Fix:

* canvas workspace rendering
* sidebar rendering
* module rendering
* zoom wrapper rendering

Canvas page must display:

* sidebar
* top toolbar
* workspace
* modules

==================================================
6. CANVAS STRUCTURE
===================

Canvas page layout:

---

LEFT:
Collapsible Sidebar

TOP:
Toolbar

CENTER:
Zoomable workspace

---

==================================================
7. FIX CANVAS VISIBILITY
========================

Modules MUST appear correctly.

Render:

* Personal Profile
* Academics
* Fitness
* Journal

Ensure:

* visible state works
* rendering map works
* no empty screen

==================================================
8. FIX STATE MANAGEMENT
=======================

Current issue likely:

* conditional rendering bug
* transform wrapper issue
* module state issue

Fix architecture cleanly.

==================================================
9. HOMEPAGE REQUIREMENTS
========================

Home page sidebar should contain:

* Home
* Canvas
* Chat History

NO database explorer on Home page.

==================================================
10. CANVAS PAGE SIDEBAR
=======================

Canvas sidebar contains:

* Home
* Canvas
* Database Explorer

==================================================
11. DATABASE TREE
=================

Keep:

* nested folders
* checkboxes
* dropdown arrows

Must remain functional.

==================================================
12. MODULE MOVEMENT
===================

Keep:
react-draggable implementation.

Modules must remain movable.

==================================================
13. ZOOM SYSTEM
===============

Keep:
react-zoom-pan-pinch implementation.

Must work correctly.

==================================================
14. DESIGN SYSTEM
=================

KEEP THE EXISTING VISUAL STYLE.

Theme:
minimal monochrome dark.

Background:
#0f0f0f

Panels:
#181818

Borders:
#2a2a2a

Text:
#f5f5f5

Muted:
#9ca3af

Accent:
#7dd3fc

==================================================
15. RESPONSIVENESS
==================

Desktop:

* full sidebar
* spacious canvas

Mobile:

* collapsible sidebar
* stable layout
* no overflow bugs

==================================================
16. REQUIRED COMPONENT STRUCTURE
================================

Ensure architecture is modular.

Expected structure:

src/
│
├── pages/
│   ├── Landing.jsx
│   ├── Home.jsx
│   └── Canvas.jsx
│
├── components/
│   ├── sidebar/
│   │   ├── Sidebar.jsx
│   │   ├── SidebarToggle.jsx
│   │   ├── SidebarItem.jsx
│   │   └── SidebarSection.jsx
│   │
│   ├── canvas/
│   │   ├── CanvasWorkspace.jsx
│   │   ├── ModuleCard.jsx
│   │   ├── ZoomControls.jsx
│   │   └── DatabaseTree.jsx
│   │
│   ├── landing/
│   │   ├── AmbientBackground.jsx
│   │   └── EnterButton.jsx
│   │
│   └── layout/
│       └── MainLayout.jsx

==================================================
17. FINAL EXPERIENCE GOAL
=========================

The app should now behave like:

START →
minimal cinematic landing page →
enter system →
AI home →
canvas workspace exploration

The system should feel:

* intelligent
* calm
* premium
* futuristic in a restrained way

NOT:

* flashy
* gamer-like
* chaotic

==================================================
OUTPUT REQUIREMENTS
===================

Generate:

* fixed routing
* landing page
* working sidebar
* sidebar collapse system
* fixed canvas rendering
* working module rendering
* corrected layout hierarchy
* responsive architecture

Project must run immediately with:
npm install
npm run dev

DO NOT generate explanations.

ONLY generate clean scalable frontend code.


---

**Cursor**

Implementing the full fix: landing page, routing, collapsible sidebar, and canvas rendering.


Fixed. Run `npm run dev`.

**Routes:** `/` → Landing · `/home` → Home · `/canvas` → Canvas

**Added:** Landing page with ambient background · collapsible sidebar · `LayoutContext` · canvas zoom/pan + module rendering fixes · `DatabaseTree` moved under `components/canvas/`

---

**User**

You are continuing the React + Tailwind frontend project for the AI operating system "Jarvis".

The latest implementation is still broken.

The CANVAS PAGE is rendering as a black empty screen with no sidebar, no modules, and no visible workspace.

You must now DEBUG and FIX the rendering architecture properly.

DO NOT redesign the visual theme.
DO NOT rewrite the whole app unnecessarily.

Your task is to FIX the architecture and complete the missing interaction polish.

==================================================
CRITICAL BUG TO FIX
===================

CURRENT ISSUE:

After navigating:
Landing → Home → Canvas

The Canvas page becomes:

* blank black screen
* sidebar missing
* modules missing
* workspace missing

This means:

* rendering tree is broken
* layout wrapper is broken
* transform wrapper likely consuming viewport
* z-index or overflow issue
* conditional rendering issue
* or component hierarchy failure

You must debug and fix this properly.

==================================================
MOST LIKELY CAUSES TO CHECK
===========================

CHECK FOR:

1. react-zoom-pan-pinch wrapper breaking layout
2. transform wrapper width/height issue
3. absolute positioning covering layout
4. sidebar being rendered underneath canvas
5. missing flex layout
6. parent container height collapse
7. overflow hidden incorrectly applied
8. conditional rendering returning null
9. workspace dimensions failing
10. z-index hierarchy issue

Fix architecture cleanly.

==================================================
REQUIRED CANVAS PAGE STRUCTURE
==============================

Canvas page MUST render:

---

FULL SCREEN FLEX CONTAINER

LEFT:
Sidebar

RIGHT:
Canvas Area

TOP INSIDE RIGHT:
Toolbar

CENTER:
Workspace

---

Correct layout example:

<div className="flex h-screen w-full bg-[#0f0f0f]">
    <Sidebar />

```
<div className="flex flex-col flex-1 overflow-hidden">
    <CanvasToolbar />

    <CanvasWorkspace />
</div>
```

</div>

==================================================
FIX THE SIDEBAR
===============

Sidebar MUST always remain visible.

Requirements:

* fixed width
* collapsible
* visible on canvas page
* proper z-index
* proper height

DO NOT allow canvas transforms to affect sidebar.

Sidebar must exist OUTSIDE zoom wrapper.

==================================================
FIX THE WORKSPACE
=================

Canvas workspace must render correctly.

Workspace requirements:

* visible grid
* visible draggable modules
* scrollable/pannable
* large dimensions
* proper overflow handling

Use:
min-width: 5000px
min-height: 4000px

==================================================
FIX ZOOM WRAPPER
================

The zoom/pan library is likely breaking layout.

Correct implementation:

* ONLY wrap workspace area
* NEVER wrap entire page
* NEVER wrap sidebar

Correct structure:

<TransformWrapper>
    <TransformComponent>
        <Workspace />
    </TransformComponent>
</TransformWrapper>

==================================================
FIX MODULE RENDERING
====================

Modules MUST appear.

Render dynamically using map().

Ensure:

* visible state defaults to true
* module positions valid
* modules inside workspace container
* z-index visible
* draggable wrapper working

==================================================
FIX OVERFLOW SYSTEM
===================

Use:
overflow-hidden only where necessary.

Main layout:
overflow-hidden

Canvas viewport:
overflow-auto

Workspace:
relative positioning

==================================================
FIX HOME → CANVAS NAVIGATION
============================

Navigation must correctly route:
"/canvas"

WITHOUT rendering failure.

==================================================
LANDING PAGE IMPROVEMENT
========================

The Landing page exists but needs a more premium futuristic transition.

==================================================
REQUIRED IMPROVEMENT:
=====================

When clicking:
"Enter The Matrix"

Add a smooth cinematic transition animation before navigating to Home.

The effect should feel:

* intelligent
* futuristic
* restrained
* premium

NOT flashy.

==================================================
TRANSITION REQUIREMENTS
=======================

Sequence example:

1. Button click
2. Text glow slightly
3. Ambient particles accelerate subtly
4. Screen softly fades
5. Navigate to "/home"

Animation duration:
~1 second

==================================================
ALLOWED ANIMATIONS
==================

Allowed:

* opacity fades
* blur transitions
* scale transitions
* ambient motion
* soft glow

NOT allowed:

* RGB effects
* cyberpunk neon
* spinning effects
* gamer transitions
* glitch spam

==================================================
LANDING PAGE TEXT EFFECT
========================

Add subtle futuristic animation to:
"JARVIS"

Examples:

* soft breathing glow
* slow opacity pulse
* subtle tracking animation
* gentle ambient shimmer

VERY restrained.

==================================================
DESIGN SYSTEM
=============

KEEP EXISTING THEME.

Background:
#0f0f0f

Panels:
#181818

Borders:
#2a2a2a

Text:
#f5f5f5

Muted:
#9ca3af

Accent:
#7dd3fc

==================================================
RESPONSIVENESS
==============

Desktop:
full experience

Mobile:
stable layout
no disappearing sidebar
no broken transforms

==================================================
FINAL EXPERIENCE GOAL
=====================

The flow should become:

Landing →
cinematic transition →
Home →
Canvas →
zoomable modular workspace

Canvas should now ACTUALLY WORK.

==================================================
OUTPUT REQUIREMENTS
===================

Generate:

* fixed Canvas rendering
* corrected layout hierarchy
* corrected zoom wrapper structure
* visible sidebar
* visible modules
* visible workspace
* cinematic landing transition
* subtle JARVIS text animation

Project must run correctly with:
npm run dev

DO NOT generate explanations.

ONLY generate corrected scalable frontend code.


---

**Cursor**

Implementing a dedicated canvas shell layout, fixing zoom wrapper CSS, and adding landing transitions.


Fixed. Run `npm run dev`.

**Canvas:** dedicated `CanvasShell` layout (sidebar outside zoom) · scoped zoom CSS · modules render in 5000×4000 workspace

**Sidebar:** always visible on `/canvas` · collapsible on Home

**Landing:** cinematic exit transition · subtle JARVIS title animation

---

**User**

Good. These are now REAL interaction-layer problems, not architecture failures anymore.

Your system is progressing correctly.

The current issues are caused by:

* incorrect state binding
* event propagation conflicts
* transform wrapper behavior
* zoom sensitivity defaults

Now give this exact debugging/refactor prompt to the AI agent.

---

You are continuing the React + Tailwind frontend project for the AI operating system "Jarvis".

The application is now rendering correctly, but there are several IMPORTANT interaction and state-management bugs remaining.

You must FIX these issues properly without redesigning the UI.

==================================================
CURRENT BUGS TO FIX
===================

BUG 1:
Subfolder checkboxes in the database sidebar do NOT work correctly.

Current behavior:

* unchecking nested items does nothing

Required behavior:

* unchecking a nested subfolder or field hides ONLY that specific piece of data inside the corresponding module card

Example:

Sidebar:
☑ Academics
☑ Current Education
☐ semester
☑ subjects[]

Result:
Inside Academics module:

* semester field disappears
* subjects[] remains visible

IMPORTANT:
This must work recursively for nested fields.

==================================================
BUG 2:
Modules are NOT independently draggable.

Current behavior:

* dragging moves the ENTIRE canvas/pan area
* modules themselves stay fixed

Required behavior:

* user must be able to drag EACH module independently
* module positions update individually
* canvas itself should NOT move while dragging modules

==================================================
BUG 3:
Canvas pan conflicts with module dragging.

Current behavior:

* dragging module triggers canvas pan

Required behavior:

* dragging module ONLY moves module
* dragging empty workspace pans canvas

This is an EVENT PROPAGATION issue.

==================================================
BUG 4:
Mouse wheel zoom sensitivity is WAY too aggressive.

Current behavior:

* tiny scroll massively zooms in/out

Required behavior:

* smooth restrained zoom
* subtle zoom increments
* premium feeling

==================================================
REQUIRED FIXES
==============

==================================================

1. FIX FIELD-LEVEL VISIBILITY SYSTEM
   ==================================================

You must redesign the visibility architecture.

Current system only controls module visibility.

New requirement:
EVERY node in database tree must control visibility.

Structure example:

{
id: "academics",
visible: true,
children: {
currentEducation: {
visible: true,
children: {
semester: {
visible: false
},
subjects: {
visible: true
}
}
}
}
}

==================================================
RENDERING RULE
==============

When rendering module data:
ONLY render visible fields.

Nested rendering must recursively respect visibility state.

==================================================
2. FIX DRAGGING SYSTEM
======================

Use react-draggable correctly.

Each module card MUST be independently draggable.

Correct implementation:

<Draggable handle=".module-header">
    <ModuleCard />
</Draggable>

IMPORTANT:

* ONLY module header drags module
* module body interactions remain usable

==================================================
3. FIX PAN vs DRAG CONFLICT
===========================

Current issue:
TransformWrapper pan captures drag events.

Fix properly.

REQUIRED:
When user drags module:

* disable canvas pan temporarily

When user releases module:

* re-enable canvas pan

==================================================
IMPLEMENTATION STRATEGY
=======================

Maintain state:

const [isDraggingModule, setIsDraggingModule] = useState(false)

Then:

<TransformWrapper
panning={{ disabled: isDraggingModule }}

>

During module drag:
setIsDraggingModule(true)

On stop:
setIsDraggingModule(false)

==================================================
4. FIX ZOOM SENSITIVITY
=======================

Current zoom is unusable.

Adjust react-zoom-pan-pinch settings.

Required behavior:

* smooth
* restrained
* cinematic
* precise

Use:

wheel={{
step: 0.05
}}

AND:

minScale={0.5}
maxScale={2}

AND:
disable velocity effects if enabled.

==================================================
5. IMPROVE CANVAS FEEL
======================

Canvas should feel:

* controlled
* premium
* stable

NOT:

* hypersensitive
* chaotic
* floaty

==================================================
6. FIX MODULE POSITION UPDATES
==============================

Each module position must persist in React state.

When dragged:
update x/y state.

Do NOT leave modules visually movable only.

==================================================
EXAMPLE STRUCTURE
=================

modules = [
{
id: "profile",
x: 300,
y: 200,
visible: true,
data: {...}
}
]

==================================================
7. RECURSIVE DATABASE TREE
==========================

Database tree component must become recursive.

Requirements:

* nested rendering
* nested visibility toggles
* nested collapse states

Each node:

* checkbox
* collapse arrow
* label

==================================================
8. DESIGN SYSTEM
================

KEEP EXISTING STYLE.

DO NOT redesign UI.

Theme remains:
minimal monochrome dark.

==================================================
9. PERFORMANCE RULES
====================

Avoid:

* unnecessary rerenders
* giant state duplication
* deeply nested mutation bugs

Use immutable updates properly.

==================================================
10. FINAL EXPECTED EXPERIENCE
=============================

User should now be able to:

* zoom smoothly
* pan workspace smoothly
* drag modules independently
* hide/show specific fields
* hide/show modules
* explore canvas naturally

WITHOUT interaction conflicts.

==================================================
OUTPUT REQUIREMENTS
===================

Generate:

* corrected drag system
* corrected pan behavior
* corrected zoom sensitivity
* recursive visibility architecture
* recursive database tree
* recursive field rendering
* stable interaction behavior

Project must run correctly with:
npm run dev

DO NOT generate explanations.

ONLY generate corrected scalable frontend code.


---

**Cursor**

Implementing field-level visibility, drag/pan separation, and zoom tuning.


Fixed. Run `npm run dev`.

- Field-level visibility via `fieldVisibilityMap` + recursive `ModuleTree` filtering
- Module drag on `.module-header` only; pan disabled while dragging + excluded classes
- Wheel zoom `step: 0.05`, scale `0.5`–`2`

---

**User**

You are continuing the React + Tailwind frontend project for the AI operating system "Jarvis".

The recursive checkbox visibility system is now working correctly.

However, TWO critical interaction bugs still remain and MUST be fixed properly.

DO NOT redesign the UI.
DO NOT rewrite the architecture unnecessarily.

==================================================
REMAINING CRITICAL BUGS
=======================

BUG 1:
Canvas zoom on mouse scroll is STILL far too aggressive.

Current behavior:

* tiny wheel movement causes huge zoom jump
* feels hypersensitive
* not premium
* difficult to control

Required behavior:

* very smooth
* subtle
* restrained
* cinematic precision

==================================================
BUG 2:
Modules are STILL NOT draggable independently.

Current behavior:

* canvas pans
* modules remain fixed
* drag interaction not attaching properly

Required behavior:

* every module card draggable independently
* dragging ONLY moves module
* dragging should NOT pan canvas

==================================================
MOST LIKELY ROOT CAUSE
======================

The draggable wrapper is probably:

* incorrectly nested
* overridden by transform wrapper
* blocked by pointer events
* missing absolute positioning
* missing drag handle
* missing bounds setup

You must FIX this properly.

==================================================

1. FIX ZOOM SENSITIVITY PROPERLY
   ==================================================

The current wheel.step is still too high.

Use EXTREMELY restrained zoom values.

==================================================
REQUIRED SETTINGS
=================

Use EXACTLY:

<TransformWrapper
minScale={0.5}
maxScale={2}
initialScale={1}
wheel={{
step: 0.01,
smoothStep: 0.002,
wheelDisabled: false,
touchPadDisabled: false
}}
doubleClick={{
disabled: true
}}
pinch={{
step: 2
}}
velocityAnimation={{
disabled: true
}}

>

==================================================
IMPORTANT:
==========

The zoom should feel like:

* Figma
* Linear
* professional design software

NOT:

* hypersensitive map zoom
* browser zoom chaos

==================================================
2. FIX DRAGGABLE MODULES PROPERLY
=================================

The module cards themselves MUST be draggable.

==================================================
CORRECT IMPLEMENTATION STRUCTURE
================================

Each module MUST:

* use absolute positioning
* exist INSIDE relative workspace container
* be wrapped individually with Draggable

Correct structure:

<div className="relative w-[5000px] h-[4000px]">
    {modules.map(module => (
        <Draggable
            key={module.id}
            handle=".module-drag-handle"
            position={{ x: module.x, y: module.y }}
            onStart={() => setIsDraggingModule(true)}
            onStop={(e, data) => {
                setIsDraggingModule(false)
                updateModulePosition(module.id, data.x, data.y)
            }}
        >
            <div className="absolute">
                <ModuleCard />
            </div>
        </Draggable>
    ))}
</div>

==================================================
3. FIX CANVAS PAN CONFLICT
==========================

Canvas pan MUST disable while dragging modules.

Use:

panning={{
disabled: isDraggingModule
}}

==================================================
4. MODULE HEADER DRAG HANDLE
============================

ONLY the module header should drag module.

Example:

<div className="module-drag-handle cursor-move">
    Personal Profile
</div>

==================================================
5. FIX POINTER EVENT CONFLICTS
==============================

Current issue likely:
TransformComponent capturing pointer events.

Ensure:

* modules remain interactive
* draggable receives pointer correctly
* z-index correct

==================================================
6. MODULE POSITION STATE
========================

Positions MUST persist in React state.

Correct state example:

const [modules, setModules] = useState([
{
id: "profile",
x: 300,
y: 200
}
])

==================================================
7. UPDATE POSITION FUNCTION
===========================

Implement:

const updateModulePosition = (id, x, y) => {
setModules(prev =>
prev.map(module =>
module.id === id
? { ...module, x, y }
: module
)
)
}

==================================================
8. IMPORTANT UX REQUIREMENT
===========================

Final interaction should feel:

* controlled
* smooth
* stable
* premium

NOT:

* jittery
* hypersensitive
* broken
* fighting the user

==================================================
9. KEEP EXISTING FEATURES
=========================

DO NOT BREAK:

* checkbox visibility
* recursive database tree
* canvas rendering
* sidebar
* zoom buttons
* module rendering

==================================================
10. FINAL EXPECTED RESULT
=========================

User should now be able to:

* smoothly zoom canvas
* smoothly pan empty workspace
* drag modules independently
* move modules freely
* hide/show data fields
* hide/show modules

WITHOUT interaction conflicts.

==================================================
OUTPUT REQUIREMENTS
===================

Generate:

* corrected zoom settings
* corrected draggable implementation
* corrected absolute positioning
* corrected drag/pan coordination
* corrected pointer interaction behavior

Project must run correctly with:
npm run dev

DO NOT generate explanations.

ONLY generate corrected scalable frontend code.


---

**Cursor**

Fixed. Run `npm run dev`.

- Zoom: `step: 0.01`, `smoothStep: 0.002`, `velocityAnimation` off
- Modules: `DraggableModule` wrapper with absolute positioning, `.module-drag-handle`, live position updates, pan disabled while dragging

---

**User**

You are continuing the React + Tailwind frontend project for the AI operating system "Jarvis".

The draggable modules are now working correctly.

However, TWO important UX issues still remain.

DO NOT redesign the interface.
DO NOT break existing systems.

Only improve the interaction quality and module usability.

==================================================
REMAINING ISSUES
================

ISSUE 1:
Mouse wheel zoom is STILL too aggressive.

Current behavior:

* tiny wheel movement causes major zoom jumps
* feels unstable and hypersensitive

Required behavior:

* extremely smooth
* restrained
* premium
* precise
* almost subtle

==================================================
ISSUE 2:
Module content tree is NOT collapsible internally.

Current behavior:

* all nested data always visible
* modules become cluttered

Required behavior:

* folders with child data inside modules must be dropdown/collapsible
* exactly like sidebar database tree behavior

==================================================

1. FIX ZOOM SENSITIVITY PROPERLY
   ==================================================

The current zoom implementation is STILL too strong.

You must drastically reduce wheel zoom sensitivity.

==================================================
REQUIRED IMPLEMENTATION
=======================

Use VERY SMALL wheel step values.

Example:

<TransformWrapper
minScale={0.5}
maxScale={2}
initialScale={1}
limitToBounds={false}
smooth={true}
wheel={{
step: 0.002,
smoothStep: 0.001,
activationKeys: [],
disabled: false,
wheelDisabled: false,
touchPadDisabled: false
}}
pinch={{
step: 1
}}
doubleClick={{
disabled: true
}}
velocityAnimation={{
disabled: true
}}

>

==================================================
IMPORTANT:
==========

Zoom should feel:

* cinematic
* controlled
* design-tool level precision

NOT:

* Google Maps zoom
* hypersensitive scrolling
* chaotic scaling

==================================================
2. ADD COLLAPSIBLE MODULE CONTENT TREE
======================================

Currently only sidebar tree supports dropdowns.

You must now implement INTERNAL MODULE TREE DROPDOWNS.

==================================================
REQUIRED BEHAVIOR
=================

Inside module cards:

Example:

▼ Current Education
semester: 6
subjects: DSA, OS
assignments: 4 pending

▼ Skills In Progress
React
Firebase
DSA

When collapsed:

▶ Current Education

==================================================
IMPORTANT:
==========

ONLY nodes with children should have dropdown arrows.

Leaf fields:

* no dropdown arrow
* just display value

==================================================
3. MODULE TREE MUST BE RECURSIVE
================================

Implement recursive tree rendering inside modules.

The rendering logic should support:

* unlimited nesting
* collapsible nodes
* visibility states
* nested structures

==================================================
4. MODULE TREE UX
=================

The module tree should feel:

* compact
* organized
* filesystem-like
* clean

NOT:

* cluttered
* oversized
* noisy

==================================================
5. COLLAPSE STATE MANAGEMENT
============================

Each expandable node needs:

* local collapse state
* smooth transition
* independent behavior

==================================================
6. VISUAL STYLE
===============

Use subtle indicators only.

Dropdown arrows:

* small
* muted
* clean

Indentation:

* consistent
* filesystem-inspired

==================================================
7. PERFORMANCE RULES
====================

Avoid:

* rerendering entire canvas
* heavy animations
* deeply inefficient recursion

Use memoization if needed.

==================================================
8. KEEP EXISTING FEATURES WORKING
=================================

DO NOT BREAK:

* draggable modules
* sidebar visibility system
* recursive checkbox logic
* canvas rendering
* zoom buttons
* module positioning
* panning

==================================================
9. FINAL EXPECTED EXPERIENCE
============================

The canvas should now feel like:

* Obsidian Canvas
* Notion hierarchy
* professional design workspace
* intelligent operating system

Users should be able to:

* smoothly zoom
* smoothly pan
* drag modules
* collapse large data trees
* manage information cleanly

WITHOUT clutter or hypersensitive interactions.

==================================================
OUTPUT REQUIREMENTS
===================

Generate:

* corrected ultra-smooth zoom behavior
* recursive collapsible module trees
* internal module dropdown system
* stable interaction logic
* optimized rendering

Project must run correctly with:
npm run dev

DO NOT generate explanations.

ONLY generate corrected scalable frontend code.


---

**Cursor**

Fixed. Run `npm run dev`.

- **Zoom:** `smooth={false}`, `step: 0.002` (fixed increments, not `deltaY`-scaled)
- **Module tree:** recursive collapsible folders with chevrons; leaves show values only

---

**User**

You are continuing the React + Tailwind frontend project for the AI operating system "Jarvis".

The recursive module dropdown system is now working correctly.

However, the zoom system is now improperly balanced and the toolbar zoom controls are broken.

You must now TUNE and FIX the zoom interaction professionally.

DO NOT redesign the interface.
DO NOT rewrite the architecture.
ONLY fix the zoom behavior and toolbar controls.

==================================================
CURRENT PROBLEMS
================

PROBLEM 1:
Mouse wheel zoom became TOO weak.

Current behavior:

* user must excessively scroll to zoom
* zoom feels sluggish and inefficient

Required behavior:

* controlled
* smooth
* responsive
* premium
* balanced

==================================================
PROBLEM 2:
Toolbar zoom buttons are NOT working.

Current behavior:

* zoom in button does nothing
* zoom out button does nothing
* reset button may also be broken

Required behavior:

* all toolbar controls fully functional
* smooth transitions
* synced with current zoom state

==================================================
GOAL
====

The zoom system should feel like:

* Figma
* Linear
* professional canvas software

NOT:

* hypersensitive
* sluggish
* broken

==================================================

1. FIX MOUSE WHEEL ZOOM BALANCE
   ==================================================

The current wheel.step is TOO LOW.

Increase it moderately.

==================================================
REQUIRED SETTINGS
=================

Use balanced values like:

<TransformWrapper
minScale={0.5}
maxScale={2}
initialScale={1}
limitToBounds={false}
smooth={true}
wheel={{
step: 0.015,
smoothStep: 0.008,
wheelDisabled: false,
touchPadDisabled: false
}}
pinch={{
step: 2
}}
doubleClick={{
disabled: true
}}
velocityAnimation={{
disabled: true
}}

>

==================================================
IMPORTANT:
==========

The zoom should:

* react naturally
* not explode on tiny scroll
* not require massive scrolling
* feel smooth and precise

==================================================
2. FIX TOOLBAR ZOOM BUTTONS
===========================

The toolbar buttons are currently disconnected from TransformWrapper controls.

You must correctly wire them using:
useControls()

==================================================
CORRECT IMPLEMENTATION
======================

Inside component wrapped by TransformWrapper:

const { zoomIn, zoomOut, resetTransform } = useControls()

Then connect:

<button onClick={() => zoomIn()}>
<button onClick={() => zoomOut()}>
<button onClick={() => resetTransform()}>

==================================================
IMPORTANT:
==========

Toolbar controls MUST:

* animate smoothly
* update current scale properly
* affect workspace only
* not reset sidebar

==================================================
3. DISPLAY CURRENT ZOOM %
=========================

Toolbar should display:
Zoom: 100%

This should update dynamically based on current scale.

==================================================
IMPLEMENTATION EXAMPLE
======================

Use:
onZoomStop

Store:
currentScale state

Then display:
Math.round(currentScale * 100)

==================================================
4. KEEP EXISTING FEATURES WORKING
=================================

DO NOT BREAK:

* draggable modules
* recursive dropdown trees
* sidebar visibility system
* canvas panning
* module positioning
* recursive visibility logic

==================================================
5. FINAL UX REQUIREMENT
=======================

Final zoom interaction should feel:

* calm
* precise
* intelligent
* stable
* premium

NOT:

* hypersensitive
* sluggish
* jumpy
* broken

==================================================
OUTPUT REQUIREMENTS
===================

Generate:

* corrected balanced zoom settings
* functional toolbar zoom buttons
* dynamic zoom percentage display
* stable zoom interaction tuning

Project must run correctly with:
npm run dev

DO NOT generate explanations.

ONLY generate corrected scalable frontend code.


---

**Cursor**

Fixed. Run `npm run dev`.

- **Wheel:** `smooth` on, `step: 0.00015` (~0.015 per scroll tick with smooth scaling)
- **Toolbar:** wired via `TransformWrapper` render props (`zoomIn` / `zoomOut` / `resetTransform`)
- **Display:** `Zoom: {percent}%` updates on transform/zoom events

---

**User**

You are continuing the React + Tailwind frontend project for the AI operating system "Jarvis".

You must now create a NEW PAGE called:

```txt
Command Center
```

This page is currently FRONTEND/UI ONLY.

DO NOT implement:

* real AI logic
* database fetching
* analytics calculations
* backend systems

Use ONLY:

* hardcoded placeholder/demo data
* scalable architecture
* reusable components

The goal is to build the FULL VISUAL OPERATIONAL LAYER of the system.

==================================================
ROUTING
=======

Add a new route:

/command

Sidebar order:

* Home
* Canvas
* Command Center

IMPORTANT:
Command Center appears BELOW Canvas.

==================================================
PAGE PURPOSE
============

This page is the:

* operational dashboard
* execution layer
* daily direction system
* analytics/control center

It should feel like:

* a calm AI operating system
* an intelligent mission control
* a premium productivity command layer

NOT:

* corporate analytics software
* hacker dashboard
* flashy crypto UI
* gamer HUD

==================================================
DESIGN LANGUAGE
===============

KEEP EXISTING VISUAL STYLE.

Theme:
minimal monochrome dark.

Colors:
Background: #0f0f0f
Panels: #181818
Borders: #2a2a2a
Text: #f5f5f5
Muted: #9ca3af
Accent: #7dd3fc

Style:

* large spacing
* subtle borders
* rounded corners
* restrained glow
* soft hover states
* smooth transitions

==================================================
LAYOUT STRUCTURE
================

Page layout:

---

LEFT:
Collapsible Sidebar

RIGHT:
Scrollable Dashboard Area

TOP:
Page Header

MAIN:
Responsive analytics/task grid

---

Use:

* CSS grid
* responsive cards
* clean hierarchy

==================================================
TOP HEADER
==========

Top section contains:

LEFT:

* "Command Center" title
* small subtitle:
  "Operational Overview"

RIGHT:

* current date
* compact live clock
* optional small status indicator

Minimal.

Premium.

==================================================
SECTION 1 — TODAY FOCUS
=======================

MOST IMPORTANT SECTION.

Large top card.

Contains:

* Today's Priorities
* Important Tasks
* Deadlines
* AI Suggested Focus

Use hardcoded data.

Example:

* Revise DSA Trees
* Complete Firebase Notes
* Workout: Push Day
* Journal Reflection

Visual style:

* task blocks
* subtle status indicators
* compact progress bars

==================================================
SECTION 2 — DAILY METRICS
=========================

Create a responsive metrics grid.

Metrics cards:

* Sleep
* Calories
* Protein
* Water Intake
* Study Hours
* Workout Status
* Mood
* Tasks Completed

Each card:

* icon
* value
* small trend indicator
* minimal micro-chart placeholder

Use hardcoded values.

==================================================
SECTION 3 — STREAKS
===================

Horizontal card section.

Examples:

* Coding: 12 Days
* Gym: 7 Days
* Reading: 5 Days
* Journal: 14 Days

Style:
minimal.
NO gamified colorful UI.

==================================================
SECTION 4 — WEEKLY PROGRESS
===========================

Create visual analytics cards.

Examples:

* Weekly Study Hours
* Fitness Consistency
* Goal Completion
* Habit Consistency

Visuals:

* bars
* rings
* line placeholders
* subtle charts

IMPORTANT:
Use ONLY lightweight frontend visuals.
NO chart libraries yet unless already installed.

==================================================
SECTION 5 — AI INSIGHTS
=======================

Critical section.

This is where the system feels intelligent.

Create a clean insights feed.

Example insights:

* "Study consistency dropped this week."
* "Protein intake below target for 3 days."
* "DSA revision overdue."
* "Sleep schedule becoming unstable."

Style:

* terminal/intelligence feel
* compact
* subtle accent highlights

==================================================
SECTION 6 — SYSTEM WARNINGS
===========================

Separate from insights.

Examples:

* No workout logs for 4 days
* Finance tracking inactive
* Reading streak broken

Visual style:
minimal warning cards.

NOT bright red spam.

==================================================
SECTION 7 — QUICK ACTIONS
=========================

Floating or fixed utility panel.

Buttons:

* Add Expense
* Log Workout
* Add Journal Entry
* Add Task
* Start Focus Session

Buttons should:

* feel premium
* minimal
* responsive
* animated subtly

==================================================
SECTION 8 — SCHEDULE TIMELINE
=============================

Vertical schedule/timeline card.

Example:

08:00 — Gym
10:00 — Study Session
14:00 — Firebase Learning
18:00 — Revision

Minimal vertical timeline design.

==================================================
SECTION 9 — GOALS HIERARCHY
===========================

Display layered goals.

Structure example:

MAIN GOAL
↓
Become Employable Developer

CURRENT PHASE
↓
Build Strong Fundamentals

ACTIVE OBJECTIVE
↓
Master DSA Basics

Use elegant hierarchy visualization.

==================================================
RESPONSIVENESS
==============

Desktop:

* multi-column grid
* spacious

Tablet:

* adaptive cards

Mobile:

* stacked layout
* readable spacing
* no overflow issues

==================================================
ANIMATIONS
==========

Allowed:

* smooth fade-ins
* hover transitions
* subtle scaling
* soft opacity transitions

NOT allowed:

* flashy neon
* glitch effects
* excessive motion
* RGB gamer aesthetics

==================================================
COMPONENT STRUCTURE
===================

Create reusable components.

Recommended structure:

src/components/command/

* CommandHeader.jsx
* FocusCard.jsx
* MetricCard.jsx
* StreakCard.jsx
* InsightFeed.jsx
* WarningPanel.jsx
* QuickActions.jsx
* TimelineCard.jsx
* GoalsHierarchy.jsx
* ProgressCard.jsx

==================================================
IMPORTANT ARCHITECTURE RULE
===========================

This page is UI-FIRST.

All data MUST currently be:

* mock data
* hardcoded arrays
* static placeholders

BUT:
architecture must be ready for future AI/database integration.

==================================================
FINAL EXPERIENCE GOAL
=====================

The Command Center should feel like:

* a real operational brain
* calm and intelligent
* productivity-oriented
* futuristic in a restrained way
* premium software

The user should immediately feel:

"What matters today is clear."

==================================================
OUTPUT REQUIREMENTS
===================

Generate:

* full Command Center page
* responsive layout
* reusable components
* sidebar integration
* routing integration
* polished UI
* hardcoded demo analytics

Project must run correctly with:
npm run dev

DO NOT generate explanations.

ONLY generate scalable frontend code.


---

**Cursor**

Command Center is live at `/command`.

```bash
npm run dev
```

Sidebar: Home → Canvas → Command Center · mock data across all 9 dashboard sections

---

**User**

 You are continuing the React + Tailwind frontend project for the AI operating system "Jarvis".

You must now REFACTOR and IMPROVE the Command Center page architecture and implement PERSISTENT UI STATE STORAGE across the entire frontend.

DO NOT redesign the visual identity.
DO NOT break existing functionality.

==================================================
PRIMARY GOALS
=============

1. Refactor Command Center into a proper operational overview system
2. Add persistent frontend state saving
3. Preserve user customization after reload/navigation
4. Improve future scalability

==================================================
PART 1 — COMMAND CENTER REFACTOR
================================

The current Command Center mixes:

* overview
* task management
* goal management
* scheduling

This is architecturally incorrect.

The Command Center should remain:

* operational overview
* analytics layer
* AI insight layer
* daily direction layer

NOT a full CRUD management page.

==================================================
REQUIRED COMMAND CENTER CHANGES
===============================

==================================================

1. TASKS SECTION REFACTOR
   ==================================================

Current issue:
Tasks are hardcoded static cards with no structure.

Required:
Convert tasks into summarized operational widgets.

==================================================
REPLACE:
========

Large detailed task list

==================================================
WITH:
=====

Compact operational cards.

Example:

TODAY TASKS

* 4 Pending
* 2 Completed
* 1 Overdue

WEEKLY TASKS

* 12 Active
* 5 Completed

MONTHLY TASKS

* 3 Milestones Remaining

Add:
"Open Tasks →" button placeholder.

IMPORTANT:
Do NOT create full task management page yet.

==================================================
2. GOALS SECTION REFACTOR
=========================

Current issue:
Goals are too shallow/static.

Required:
Create expandable hierarchy structure.

Example:

MAIN GOAL
▼ Become Employable Developer
▼ Build Strong Fundamentals
→ Master DSA Basics
→ Improve Problem Solving
→ Build Projects

Use:

* collapsible hierarchy
* subtle indentation
* expandable nodes

This is still display-only for now.

==================================================
3. SCHEDULE SECTION REFACTOR
============================

Current issue:
Static schedule.

Required:
Make schedule visually editable-ready.

==================================================
FEATURES:
=========

* add schedule item button
* edit icon placeholders
* delete icon placeholders
* draggable-ready structure
* timeline card architecture

Still use mock data only.

==================================================
4. TASK CATEGORIZATION SYSTEM
=============================

Introduce categories visually.

Example categories:

* Academics
* Fitness
* Self Care
* Skill Building
* Finance
* Social
* System

Tasks should visually show category badges.

==================================================
5. COMMAND CENTER PURPOSE
=========================

The page should now feel like:

* operational overview
* mission control
* executive layer

NOT:

* giant CRUD database
* spreadsheet
* cluttered dashboard

==================================================
PART 2 — PERSISTENT UI STATE STORAGE
====================================

CRITICAL FEATURE.

Currently:

* checkbox states reset
* module positions reset
* collapsed states reset
* visibility resets after reload/navigation

This is unacceptable.

You must implement FULL FRONTEND STATE PERSISTENCE.

==================================================
REQUIRED PERSISTENT STATES
==========================

Persist ALL of the following:

1. Sidebar checkbox visibility states
2. Nested subfolder visibility states
3. Canvas module positions
4. Module collapsed/expanded states
5. Canvas zoom level
6. Canvas pan position
7. Sidebar collapsed/open state
8. Command Center collapsed sections
9. Internal module dropdown states

==================================================
IMPLEMENTATION REQUIREMENT
==========================

Use:
localStorage

DO NOT add backend/database yet.

==================================================
REQUIRED ARCHITECTURE
=====================

Create centralized persistent state management.

Recommended:

* Zustand OR Context API
* localStorage syncing

==================================================
RECOMMENDED STORE STRUCTURE
===========================

Example:

{
ui: {
sidebarCollapsed: false,
canvasZoom: 1,
canvasPosition: { x: 0, y: 0 }
},

modules: {
academics: {
x: 400,
y: 300,
collapsed: false,
visibleFields: {...}
}
}
}

==================================================
LOCAL STORAGE REQUIREMENT
=========================

ALL user UI interactions must persist after:

* page refresh
* route navigation
* browser restart

==================================================
SAVE EVENTS
===========

Persist state when:

* dragging module
* toggling checkbox
* collapsing folders
* zooming canvas
* moving canvas
* toggling sidebar

==================================================
IMPORTANT:
==========

Persistence must feel seamless.

NO manual save button.

==================================================
PART 3 — CANVAS IMPROVEMENTS
============================

==================================================

1. SAVE MODULE POSITIONS
   ==================================================

Current issue:
Modules reset after refresh.

Required:
Persist positions permanently in localStorage.

==================================================
2. SAVE CHECKBOX VISIBILITY
===========================

Current issue:
Canvas visibility resets.

Required:
Persist recursive visibility tree.

==================================================
3. SAVE COLLAPSED STATES
========================

Current issue:
Dropdowns reopen after refresh.

Required:
Persist all collapse states.

==================================================
4. SAVE ZOOM/PAN STATE
======================

When user returns to canvas:

* preserve zoom level
* preserve viewport location

==================================================
PART 4 — ARCHITECTURE CLEANUP
=============================

Create cleaner project structure.

Recommended:

src/
├── pages/
├── components/
├── store/
├── data/
├── hooks/
├── utils/

==================================================
STORE STRUCTURE
===============

Create:
store/uiStore.js

This becomes central persistent UI state layer.

==================================================
PART 5 — UX REQUIREMENTS
========================

The application should now feel:

* stateful
* personal
* persistent
* alive

NOT:

* temporary
* resetting
* prototype-like

==================================================
FINAL EXPECTED EXPERIENCE
=========================

User should now be able to:

* move modules
* hide/show fields
* collapse trees
* zoom canvas
* navigate pages
* refresh browser

AND everything remains exactly where/how they left it.

The system should begin feeling like:
a real personal operating system.

==================================================
OUTPUT REQUIREMENTS
===================

Generate:

* refactored Command Center UI
* persistent localStorage state system
* centralized UI store
* saved canvas positions
* saved checkbox visibility
* saved collapse states
* saved zoom/pan state
* scalable architecture improvements

Project must run correctly with:
npm run dev

DO NOT generate explanations.

ONLY generate scalable frontend code.


---

**Cursor**

Implementing the persistent store and refactoring Command Center components.


Migration complete. `npm run build` passes.

**Persistent state** — `src/store/uiStore.js` (Zustand + `localStorage` key `jarvis-ui-storage`): sidebar, canvas zoom/pan, module positions/collapse/visibility, database tree, module field expand, command schedule + section expand.

**Command Center** — operational widgets (`TaskSummaryCard`), collapsible goals (`GoalsHierarchy`), editable-ready timeline (`TimelineCard`), category badges.

**Canvas** — wired to store; removed `CanvasContext` / `useCanvasState`.

Run: `npm run dev`

---

**User**

You are continuing the React + Tailwind frontend project for the AI operating system "Jarvis".

A NEW CRITICAL REGRESSION BUG has appeared after implementing persistent localStorage state.

==================================================
CURRENT BUG
===========

The Canvas page is broken again.

Behavior:

* when page reloads, canvas briefly appears for a split second
* then immediately becomes completely black
* sidebar disappears
* workspace disappears

This indicates:

* corrupted persisted state
* invalid transform values
* hydration/render loop issue
* infinite rerender
* invalid saved coordinates/zoom
* broken initialization sequence

You must DEBUG and FIX this properly.

DO NOT redesign the UI.
DO NOT rewrite the app unnecessarily.

==================================================
MOST LIKELY ROOT CAUSES
=======================

CHECK ALL OF THESE:

1. Invalid localStorage values
2. NaN transform coordinates
3. undefined zoom state
4. corrupted persisted JSON
5. transform wrapper receiving invalid values
6. infinite state hydration loop
7. invalid module positions
8. rendering before persistence loads
9. restoring impossible pan coordinates
10. recursive state update causing rerender crash

==================================================
VERY IMPORTANT
==============

The fact that the canvas appears briefly BEFORE going black means:

* initial render works
* THEN persisted state restoration breaks rendering

So the issue is almost certainly:
state hydration or transform restoration.

==================================================
FIX PERSISTENCE SAFELY
======================

You must implement SAFE STATE HYDRATION.

==================================================
REQUIRED RULES
==============

ALL persisted values MUST be validated before use.

==================================================
EXAMPLE VALIDATION
==================

BAD:
scale: savedScale

GOOD:

scale:
typeof savedScale === "number" &&
!isNaN(savedScale)
? savedScale
: 1

==================================================

1. FIX TRANSFORM RESTORATION
   ==================================================

TransformWrapper MUST NEVER receive:

* undefined
* NaN
* null
* infinite values

==================================================
SAFE DEFAULTS
=============

Use:

scale = 1
positionX = 0
positionY = 0

if invalid.

==================================================
2. ADD SAFE LOCALSTORAGE PARSING
================================

Current localStorage parsing is likely unsafe.

==================================================
IMPLEMENT:
==========

safe JSON parsing utility.

Example:

const safeParse = (value, fallback) => {
try {
const parsed = JSON.parse(value)
return parsed ?? fallback
} catch {
return fallback
}
}

==================================================
3. PREVENT HYDRATION RERENDER LOOPS
===================================

Current issue likely:

* loading persisted state
* immediately saving again
* causing infinite updates

==================================================
FIX:
====

Hydrate ONLY once on mount.

Use:
hydrated flag.

Example:

const [hydrated, setHydrated] = useState(false)

Load persisted state once.
Then:
setHydrated(true)

DO NOT persist again until hydration completes.

==================================================
4. VALIDATE MODULE POSITIONS
============================

Module positions may be corrupted.

Ensure:
x and y are finite numbers.

Fallback:

x: 300
y: 200

==================================================
5. VALIDATE ZOOM RANGE
======================

Persisted zoom may exceed limits.

Clamp values.

==================================================
RULE:
=====

zoom must stay between:
0.5 and 2

==================================================
6. ADD FAILSAFE RESET SYSTEM
============================

CRITICAL FEATURE.

If persisted UI state becomes corrupted:
automatically reset safely.

==================================================
IMPLEMENT:
==========

If invalid transform state detected:

* clear invalid values
* restore defaults
* continue rendering

DO NOT crash app.

==================================================
7. FIX TRANSFORM INITIALIZATION
===============================

TransformWrapper should initialize ONLY AFTER safe state loads.

==================================================
IMPLEMENT:
==========

Conditional render.

Example:

if (!hydrated) return null

OR loading skeleton.

==================================================
8. FIX SIDEBAR DISAPPEARING
===========================

Sidebar must NEVER depend on transform state.

Ensure:

* sidebar outside transform wrapper
* sidebar independent from canvas state

==================================================
9. DEBUG LOCALSTORAGE KEYS
==========================

Ensure:

* no duplicate keys
* no recursive nested serialization
* no circular objects

==================================================
10. ADD DEVELOPMENT SAFETY LOGS
===============================

Temporarily add console warnings for:

* invalid persisted values
* failed parsing
* invalid transforms

==================================================
11. IMPORTANT UX REQUIREMENT
============================

The app should now feel:

* stable
* resilient
* persistent
* professional

NOT:

* fragile
* reset-prone
* crash-prone

==================================================
FINAL EXPECTED RESULT
=====================

User should now be able to:

* refresh safely
* navigate safely
* preserve state safely
* restore canvas safely

WITHOUT black screens.

==================================================
OUTPUT REQUIREMENTS
===================

Generate:

* safe persistence hydration
* validated transform restoration
* safe localStorage parsing
* hydration loop prevention
* transform failsafes
* stable canvas rendering

Project must run correctly with:
npm run dev

Canvas MUST no longer become black after reload.

DO NOT generate explanations.

ONLY generate corrected scalable frontend code.


---

**Cursor**

Canvas reload regression is fixed.

- Safe `localStorage` parsing and persisted-state sanitization (`safePersist.js`, `persistStorage.js`)
- Hydration gate before `TransformWrapper` mounts (`useStoreHydrated`, loading shell)
- Canvas view persists only on zoom/pan/wheel stop (no transform feedback loop)
- Invalid zoom/pan/modules/tree values clamped or reset with dev warnings
- `DatabaseTree` guarded against invalid tree data

`npm run build` passes. Refresh `/canvas` to confirm.

