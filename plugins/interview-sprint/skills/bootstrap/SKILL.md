---
name: bootstrap
description: Get a runnable frontend project with a passing test and first commit in about 4 minutes - detects an existing project or scaffolds one for React, Angular, Vue, Svelte, Next, or vanilla TS. Use after scoping in an interview sprint, or when the user says "set up the project".
argument-hint: "[stack: react|angular|vue|svelte|next|vanilla] [dir]"
---

# Bootstrap (target: about 7% of budget, 4 min)

First, run `bash <this skill's base directory>/../../scripts/clock.sh status` and say the time.

Requested stack: the arguments passed with the command (`$ARGUMENTS`; if that shows up as a literal placeholder, use the text the user gave with the command). If none is given, use what SCOPE.md or the user said. Otherwise default to `react`.

## 1. Detect before creating

If `package.json` already exists, **don't scaffold**. Read it, and identify the framework, test runner, and the dev, build, and test scripts. Run the install only if `node_modules` is missing. Then go to step 3.

## 2. Scaffold (only if there's no project)

**The project root is the session's working directory.** `.sprint/` already lives there, and the clock, git, and dev server all run from it. Scaffolders refuse to write into a non-empty directory, so always do it in two steps:
1. Scaffold into a temp subdir, `<dir>` = `.scaffold`, using the table below.
2. Run `rsync -a .scaffold/ ./ && rm -rf .scaffold`, then `npm install`.

Each command below is non-interactive (tested). Pick the row for the stack:

| Stack | Scaffold | Tests |
|---|---|---|
| react (default) | `npm create vite@latest <dir> -- --template react-ts --no-interactive` | `npm i -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event` |
| vue | `npm create vite@latest <dir> -- --template vue-ts --no-interactive` | `npm i -D vitest jsdom @testing-library/vue @testing-library/jest-dom` |
| svelte | `npm create vite@latest <dir> -- --template svelte-ts --no-interactive` | `npm i -D vitest jsdom @testing-library/svelte @testing-library/jest-dom` |
| vanilla | `npm create vite@latest <dir> -- --template vanilla-ts --no-interactive` | `npm i -D vitest jsdom` |
| angular | `npx -y @angular/cli@latest new <dir> --defaults --skip-git --style=css --ssr=false` | Use the built-in test runner (`ng test --watch=false`) |
| next | `npx -y create-next-app@latest <dir> --ts --eslint --app --src-dir --use-npm --yes` | `npm i -D vitest jsdom @testing-library/react @testing-library/jest-dom @vitejs/plugin-react` |

Styling: use plain CSS or CSS modules by default. Add Tailwind only if the user prefers it; a broken Tailwind setup can cost 5 minutes. If a scaffold command fails or prompts, fall back to the `vanilla` row and say so in DECISIONS.md.

Vite stacks: add a `test` block to `vite.config.ts`, using `/// <reference types="vitest/config" />`, `environment: 'jsdom'`, `globals: true`, and a setup file that imports `@testing-library/jest-dom/vitest`. Add `"vitest/globals"` to the app tsconfig `types`.

## 3. Normalize scripts

Make sure `package.json` has these scripts, so later skills don't have to guess:
- `dev`, `build`, `test` (single run, not watch mode)
- `typecheck`: `tsc --noEmit -p <app tsconfig>` or `tsc -b`, whichever the template's build uses
- `verify`: typecheck, then lint if it exists, then test, then build

## 4. Clean slate and smoke

1. Strip the template's demo content: logo, counter, and boilerplate CSS.
2. Put in an app shell with the title from SCOPE.md and placeholders for the component tree.
3. Add `src/components/states` (or the framework's equivalent) with **Loading**, **Error (with retry)**, and **Empty** components. Every async view will use them.
4. Write one smoke test: the shell renders its heading.
5. Run `npm test` and `npm run build`. Both must pass.
6. Start the dev server in the background, as a background shell process. Note the URL and tell the user to open it.

## 5. Commit

Run `git init` if needed. Add `.sprint/` to `.gitignore` **only if the user wants their notes private**; by default, commit them, since they show the reasoning. Commit with `chore: bootstrap <stack> app shell with test harness`.

Print `✓ bootstrap done at <min>` and the dev URL.
