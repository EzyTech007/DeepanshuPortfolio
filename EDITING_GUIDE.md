# Portfolio Editing Guide

Everything you need to customize this portfolio lives in one file: **`src/config.ts`**. You shouldn't need to touch any component files unless you want to change layout or styling.

---

## Quick Start

Open `src/config.ts` and update the fields below. Run the dev server to preview changes:

```bash
npm run dev
```

---

## `src/config.ts` Reference

### Personal Info

```ts
name: "Ryan Fitzgerald",        // Your full name — shown in hero, header, footer
title: "Senior Software Engineer", // Your job title — shown under your name
description: "Portfolio website of Ryan Fitzgerald", // Meta description for SEO
accentColor: "#1d4ed8",         // Hex color used for highlights, underlines, links
```

Change `accentColor` to any hex value to retheme the entire site instantly.

---

### Social Links

```ts
social: {
  email: "your-email@example.com",
  linkedin: "https://linkedin.com/in/yourprofile",
  twitter: "https://x.com/yourhandle",
  github: "https://github.com/yourusername",
},
```

All four icons appear in the hero and footer. Any field can be removed or set to an empty string `""` to hide that icon.

---

### About Me

```ts
aboutMe: "Your bio text here...",
```

Plain text paragraph shown in the About section.

---

### Skills

```ts
skills: ["Javascript", "React", "Node.js", "Python", "AWS", "Docker"],
```

Displayed as pill badges in the About section. Add or remove items freely.

---

### Projects

```ts
projects: [
  {
    name: "Project Name",
    description: "Short description of the project.",
    link: "https://yourproject.com",  // Optional — remove to make card non-clickable
    skills: ["React", "Node.js"],     // Tech tags shown on the card
  },
],
```

- Cards are numbered automatically (01, 02, 03...).
- Remove the `link` field entirely to render a static card with no arrow button.
- Remove the entire `projects` array (or set it to `[]`) to hide the Projects section.

---

### Experience

```ts
experience: [
  {
    company: "Company Name",
    title: "Your Job Title",
    dateRange: "Jan 2022 - Present",
    bullets: [
      "Accomplishment or responsibility one",
      "Accomplishment or responsibility two",
    ],
  },
],
```

- Rendered as a vertical timeline.
- Add as many entries as you need — they stack in order.
- Set `experience: []` to hide the Experience section entirely.

---

### Education

```ts
education: [
  {
    school: "University Name",
    degree: "Bachelor of Science in Computer Science",
    dateRange: "2014 - 2018",
    achievements: [
      "Graduated Magna Cum Laude",
      "Dean's List all semesters",
    ],
  },
],
```

- Same card layout as Experience.
- Set `education: []` to hide the Education section entirely.

---

## Hiding Sections

The nav links in the header and footer update automatically based on what's in your config. To hide a section, just empty its array:

```ts
projects: [],    // hides Projects section + nav link
experience: [],  // hides Experience section + nav link
education: [],   // hides Education section + nav link
```

---

## Changing the Favicon

Replace `public/favicon.svg` with your own SVG (or update the `<link rel="icon">` tag in `src/pages/index.astro` to point to a different file format).

---

## Fonts

The site uses **IBM Plex Mono** loaded from Google Fonts. To change it, update the `<link>` tags in `src/pages/index.astro` and the `font-family` references in `src/styles/global.css`.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Astro](https://astro.build) | Static site framework |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first styling |
| TypeScript | Config type safety |

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```
