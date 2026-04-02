# Repository Guidelines

## Project Structure & Module Organization
This repository is a Vite + React single-page app. The entry point is `src/main.jsx`, which mounts `App.jsx` inside the `I18nProvider`. The main application flow lives in `src/App.jsx`, where the current view is controlled with local React state instead of a router. Feature UI is split into focused components such as `Dashboard.jsx`, `QuestionList.jsx`, `SearchResults.jsx`, `ManagementPage.jsx`, and review-related screens. Shared interview data starts in `src/data.js`, translations live in `src/i18n/`, and spaced-repetition logic is isolated under `src/srs/`. Static assets that should be copied through the Vite build belong in `public/`.

## Build, Test, and Development Commands
Use `npm run dev` to start the Vite development server and `npm run build` to produce the production bundle in `dist/`. There is no test runner configured in `package.json` right now, so do not document or assume a test command until one is added.

## Coding Style & Naming Conventions
Follow the existing code style in the repo: ES modules, React function components, and `.jsx` files for UI modules. Component and page files use PascalCase names, while utility modules under `src/srs/` and `src/i18n/` use lowercase filenames. The project currently has no ESLint, Prettier, or TypeScript configuration checked in, so preserve the established formatting and naming patterns when editing files.

## Commit & Pull Request Guidelines
Recent git history uses Conventional Commit prefixes such as `feat:` and `fix:` with short, descriptive summaries. Keep new commits aligned with that pattern.

## Agent Instructions
This project is already published as a public S3 static website. Current deployment target: `http://iprep.dagc-development.org.s3-website-us-east-1.amazonaws.com`. Before proposing a new hosting setup, verify whether the user wants to keep using this S3 website deployment or replace it.
