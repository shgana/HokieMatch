<!-- BANNER -->
<p align="center">
  <img src="https://placehold.co/1200x260/6a1b1a/ffffff?text=HokieMatch%20%E2%80%94%20Plan+Smarter,+Graduate+Faster" alt="HokieMatch Banner"/>
</p>

<h1 align="center">🦃 HokieMatch</h1>
<p align="center"><i>Your all-in-one Virginia Tech degree planner, Pathways navigator, and smart course recommender.</i></p>

<p align="center">
  <a href="https://github.com/yourusername/hokiematch/stargazers">
    <img alt="Stars" src="https://img.shields.io/github/stars/yourusername/hokiematch?style=for-the-badge&color=maroon">
  </a>
  <a href="https://github.com/yourusername/hokiematch/fork">
    <img alt="Forks" src="https://img.shields.io/github/forks/yourusername/hokiematch?style=for-the-badge&color=orange">
  </a>
  <img alt="License" src="https://img.shields.io/badge/License-MIT-black?style=for-the-badge">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js">
  <img alt="TailwindCSS" src="https://img.shields.io/badge/TailwindCSS-%231a202c?style=for-the-badge&logo=tailwindcss">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-DB%2BAuth-3fb883?style=for-the-badge&logo=supabase&logoColor=white">
  <img alt="Python" src="https://img.shields.io/badge/Parser-Python-3776AB?style=for-the-badge&logo=python&logoColor=white">
  <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-Welcome-6a1b1a?style=for-the-badge">
</p>

<p align="center">
  <a href="#-demo">Demo</a> •
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-quickstart">Quickstart</a> •
  <a href="#-environment--secrets">Env</a> •
  <a href="#-data--parsing">Data</a> •
  <a href="#-privacy--security">Privacy</a> •
  <a href="#-roadmap">Roadmap</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## ⚡ TL;DR (30 seconds)
- **Upload DARS ➜ get an interactive plan** that shows what’s done, what’s left, and the fastest paths to finish.  
- **Pick Pathways strategically** with a live catalog of courses that satisfy each requirement.  
- **Choose easier profs/courses** using **33k+ rows** of GPA history and ranking logic.  
- **Modern stack**: Next.js + Tailwind + shadcn UI + Supabase + Python parser. Optional AI assist.  

---

## 🎬 Demo
<p align="center">
  <img src="https://placehold.co/1100x600/6a1b1a/ffffff?text=Demo+GIF:+Upload+DARS+%E2%86%92+Plan" alt="Demo GIF 1" />
</p>

| DARS Breakdown | Pathways Explorer | Smart Recs |
|---|---|---|
| ![DARS](https://placehold.co/420x260/6a1b1a/ffffff?text=DARS+Breakdown) | ![Pathways](https://placehold.co/420x260/934b3c/ffffff?text=Pathways+Explorer) | ![Recs](https://placehold.co/420x260/000000/ffffff?text=GPA+%2B+Ranking) |

> Want a live link? Add your Vercel deploy URL here: **https://hokiematch.vercel.app**

---

## ✨ Features
- **📄 DARS Parser** – Converts your DARS into a structured JSON of **completed / in-progress / remaining** requirements.  
- **🧭 Pathways Navigator** – Explore **Pathways** with filters, see exactly which courses satisfy each area.  
- **📊 Smart Recommendations** – Combines **historical GPA** by section/instructor to surface lighter-load options.  
- **🧠 AI Assist (opt-in)** – Natural language “what should I take next?” planning (LLM key optional).  
- **⚡ Beautiful, Fast UI** – Next.js 14 App Router, TailwindCSS, shadcn UI, Lucide icons, Drag & Drop where it counts.  
- **🔌 Supabase** – Postgres + Auth + RLS (ready for production if you lock it down).  

---

## 🧩 Architecture

```mermaid
graph TD
  A[User Browser] -->|Next.js App| B[Next.js / App Router]
  B -->|API Routes / Edge| C[Supabase (Postgres + Auth)]
  B --> D[Pathways Catalog JSON]
  B --> E[GPA Dataset (CSV → Tables)]
  F[Python Parser] -->|parse DARS| C
  F -->|emit JSON| B
  C -->|SQL & RPC| B
  B -->|Optional LLM| G[(AI Provider)]
  subgraph DataIngest
    E -->|ETL| C
  end
