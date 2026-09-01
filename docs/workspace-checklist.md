# Workspace checklist — Hockey Ops Player Directory

Date completed: YYYY-MM-DD

## Tools

| Item | Value |
|------|--------|
| Operating system | macOS |
| Code editor | Visual Studio Code |
| Editor can open a whole folder? | Yes |
| Terminal app used | Terminal |

## Project home

- **Project folder name:** Project1
- **Full path on this machine:** /Users/Michaelschuler/School/Fall2026/Info3360/Project1
- **`docs/requirements-brief.md` present in this folder?** Yes

## Node.js and npm

Run these in a terminal whose working directory is the project folder:

```text
node -v
npm -v
```

| Command | Output I saw | OK? |
|---------|----------------|-----|
| `node -v` | v24.20.0 | Yes — current LTS line |
| `npm -v` | 11.19.0 | Yes — matches Node 24 |

- **Node install source (if I installed today):** nodejs.org LTS
- **I closed and reopened the terminal after installing Node:** Yes

## Smoke checks (safe commands)

| Check | Command idea | What I observed |
|-------|----------------|-----------------|
| Where am I? | `pwd` (mac/linux) or `cd` (Windows) | /Users/Michaelschuler/School/Fall2026/Info3360/Project1 |
| List project files | `ls` or `dir` | I see `docs/` |
| Brief readable | Open `docs/requirements-brief.md` in the editor | Actors/routes still make sense |

## Blockers and notes

- Node.js was originally v10.16.3 (far too old for TanStack Start / Vite). Reinstalled current LTS from nodejs.org; now on v24.20.0 with npm 11.19.0. Resolved.

## Ready for scaffolding?

- [x] Editor opens this project folder
- [x] Terminal working directory is the project folder
- [x] `node -v` and `npm -v` both print versions
- [x] `docs/requirements-brief.md` is in the project
- [x] I know I will run future install commands only from this folder unless a step says otherwise

**Sign-off:** I can explain what a project folder, a path, the terminal, Node.js, and npm are in one sentence each before Step 3.
