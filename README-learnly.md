# Learnly — Online Learning Portal UI

AAT-1 · Full Stack Web Development · HTML + CSS + JavaScript (no frameworks)

An online learning portal wrapped in an e-commerce flow: the "products" are
**courses**, and the interface presents **courses, lessons, assignments and
learning resources** through one consistent, readable design system — exactly
what the problem statement asks for.

Two signature features on the landing page:

1. **The Reader** — a sample lesson whose typography you can tune live
   (font size, line height, Paper/Sepia/Night themes). Every control changes
   a CSS custom property, and even the ruled background lines re-space
   themselves to match the line height. Preferences persist in localStorage.
2. **Syllabus + progress** — an accordion of modules with lesson rows
   (video / reading / assignment), checkboxes, and a live progress bar that
   survives refresh via localStorage.

## How to run

1. Extract the folder anywhere on your computer.
2. Double-click `index.html` (or right-click → Open with → your browser).
3. No server or installation needed. Internet is only used for Google Fonts;
   everything else works fully offline.

## Folder structure

```
learning-portal/
├── index.html      → Landing page + Reader + syllabus/progress
├── products.html   → Product display page (8 courses, filterable)
├── cart.html       → Shopping cart view page
├── payment.html    → Payment page with full form validation
├── css/
│   └── style.css   → One shared stylesheet (tokens + components)
└── js/
    └── script.js   → One shared script (reader, progress, cart, validation)
```

## How each guideline is covered

- **HTML, CSS, JavaScript only** — no libraries or frameworks anywhere.
- **Responsive** — Grid/Flexbox with media queries at 1020px, 820px and 620px;
  hamburger menu on mobile; lesson rows collapse gracefully.
- **Navigation between all pages** — shared sticky navbar (with a live cart
  badge) plus footer links connect all four pages.
- **Form validation on the Payment page** — JavaScript regex validation for
  name, email, 10-digit mobile, address, city, 6-digit PIN, card name,
  16-digit card number (auto-spaced), MM/YY expiry (rejects past dates) and
  3-digit CVV, with inline errors and a success modal + order ID (LN-…).
- **Consistent, readable interface** — one `.course-card` component renders
  every course; one `.lesson` row renders every lesson/assignment/resource;
  the reading column is capped at `65ch`; a baseline "ruled line" grid is
  generated with `repeating-linear-gradient`.

## The clever bits (great viva material)

- **Live typography via CSS variables** — the Reader's controls only set
  `--r-size`, `--r-lh` and `[data-theme]`; CSS does everything else,
  including re-spacing the ruled lines:
  `repeating-linear-gradient(... calc(var(--r-size) * var(--r-lh)) ...)`.
- **Three localStorage keys** — `learnly_cart` (cart), `learnly_progress`
  (lesson checkboxes), `learnly_prefs` (reading preferences). All state
  survives navigation and refresh.
- **One renderer for all cards** — `renderCourseCard()` draws the hero card
  and the whole catalogue; each course only supplies data plus an `--accent`
  custom property for its index tab.
- **Event delegation** — one listener each on the grid, cart and syllabus
  keeps buttons and checkboxes working after every re-render.
- **UI sans + reading serif** — interface text uses Space Grotesk/Karla,
  while lesson content switches to Source Serif 4, like real reading apps.

## Easy customisations

- Change the primary color: edit `--violet` (and `--marker`) in `:root`.
- Add a 9th course: one object in `COURSES` in `js/script.js`.
- Edit the syllabus: the `SYLLABUS` array — modules and lessons are plain data.
- Put your own name/college in the footer.
