<div align="center">

# 🚀 Deepanshu Choudhary — Portfolio

### Full Stack Engineer · Problem Solver · Continuous Learner

[![Live Site](https://img.shields.io/badge/🌐_Live_Site-Visit_Portfolio-1d4ed8?style=for-the-badge)](https://ezytech007.github.io/DeepanshuPortfolio)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/dev-deepanshuch/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/deepanshu7007)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2?style=for-the-badge&logo=twitter)](https://x.com/Deepanshu7007Ch)

</div>

---

## 👨‍💻 About

A modern, responsive personal portfolio built to showcase my work as a **Full-Stack Developer**. I specialize in building scalable backend systems and clean frontend experiences using technologies like **Spring Boot**, **NestJS**, **Node.js**, **React**, **PostgreSQL**, and **Docker**.

This portfolio highlights my projects, professional experience, and technical skills — all in one place.

---

## ✨ Features

- ⚡ **Blazing fast** — Built with Astro for near-zero JavaScript overhead
- 🎨 **Dark / Light mode** — Smooth theme toggle with no flash on load
- 📱 **Fully responsive** — Looks great on all screen sizes
- 🧩 **Single config setup** — All content managed from one `config.ts` file
- 🔤 **IBM Plex Mono** — Clean monospace typography throughout
- 🚀 **Auto-deployed** — GitHub Actions CI/CD to GitHub Pages

---

## 🛠️ Built With

| Technology | Purpose |
|---|---|
| [Astro](https://astro.build/) | Static site generator |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [Tabler Icons](https://tabler.io/icons) | Icon library |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe configuration |
| [GitHub Actions](https://github.com/features/actions) | CI/CD deployment |

---

## 📁 Project Structure

```
DeepanshuPortfolio/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── About.astro        # About me section
│   │   ├── Education.astro    # Education section
│   │   ├── Experience.astro   # Work experience
│   │   ├── Footer.astro       # Site footer
│   │   ├── Header.astro       # Navigation header
│   │   ├── Hero.astro         # Hero / intro section
│   │   ├── Projects.astro     # Projects showcase
│   │   └── SnapDarkMode.astro # Dark mode toggle
│   ├── pages/
│   │   └── index.astro        # Main page layout
│   ├── styles/
│   │   └── global.css         # Global styles
│   └── config.ts              # ⭐ All site content lives here
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Pages auto-deploy
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm

### Run Locally

```bash
# Clone the repo
git clone https://github.com/EzyTech007/DeepanshuPortfolio.git

# Navigate into the project
cd DeepanshuPortfolio

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The site will be available at `http://localhost:4321`.

To make it accessible on other devices on the same network:

```bash
npm run dev -- --host
```

---

## ⚙️ Customization

All content is managed from a single file: **`src/config.ts`**

```typescript
export const siteConfig = {
  name: "Your Name",
  title: "Your Job Title",
  description: "Your site description",
  accentColor: "#1d4ed8",   // Change the theme color here
  social: {
    email: "you@example.com",
    linkedin: "https://linkedin.com/in/yourprofile",
    twitter: "https://x.com/yourhandle",
    github: "https://github.com/yourusername",
  },
  aboutMe: "Write your bio here...",
  skills: ["React", "Node.js", "Docker"],
  projects: [ /* ... */ ],
  experience: [ /* ... */ ],
  education: [ /* ... */ ],
};
```

> Removing any section (skills, projects, experience, education) from the config will automatically hide it from the site.

---

## 📦 Deployment

This project auto-deploys to **GitHub Pages** via GitHub Actions on every push to the `portfolio_2026` branch.

**Live URL:** [https://ezytech007.github.io/DeepanshuPortfolio](https://ezytech007.github.io/DeepanshuPortfolio)

To deploy manually:

```bash
npm run build
# Output is in the /dist folder
```

You can also deploy to other platforms:

- [Netlify](https://docs.astro.build/en/guides/deploy/netlify/)
- [Vercel](https://docs.astro.build/en/guides/deploy/vercel/)
- [Cloudflare Pages](https://docs.astro.build/en/guides/deploy/cloudflare/)

---

## 📬 Contact

**Deepanshu Choudhary**

- 📧 [deepanshu7007@gmail.com](mailto:deepanshu7007@gmail.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/dev-deepanshuch/)
- 🐦 [Twitter / X](https://x.com/Deepanshu7007Ch)
- 🐙 [GitHub](https://github.com/deepanshu7007)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE.md).

---

<div align="center">
  <sub>Built with ❤️ using Astro + Tailwind CSS</sub>
</div>
