# SCI Original Questions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an independent SCI original-question study, mock-exam, and wrongbook module using the 300 extracted SCI questions.

**Architecture:** Generate `content/sci/questions.json` from the extracted Storyline data, then load it alongside existing content. Keep SCI-only grading and wrongbook behavior in focused pure modules for testing, and add React views that call those modules.

**Tech Stack:** Static HTML, React UMD + Babel browser JSX, Node `node:test`, JSON content files, localStorage.

## Global Constraints

- Do not replace or mix with existing self-authored `content/questions/sNN.json`.
- Chinese translations and notes are generated learning aids, not official SCI translations.
- SCI mock exams use only SCI questions.
- SCI wrongbook is separate from the existing wrongbook.

---

### Task 1: SCI Data Generation and Loading

**Files:**
- Create: `js/sci-data.js`
- Create: `scripts/build-sci-content.js`
- Create: `test/sci-data.test.js`
- Generate: `content/sci/questions.json`
- Modify: `ui/boot.jsx`

**Interfaces:**
- Produces: `classifySciQuestion(question: { number: number, question: string }): { part: 1|2, syllabusItemId: string }`
- Produces: `toSciQuestion(rawQuestion): SciQuestion`
- Produces: `loadSciContent(fetchFn = fetch): Promise<SciQuestion[]>`

**Steps:**
- [ ] Write failing tests for classifier, transformation, and content loading.
- [ ] Run `node --test test/sci-data.test.js` and verify it fails because `js/sci-data.js` does not exist.
- [ ] Implement `js/sci-data.js` and `scripts/build-sci-content.js`.
- [ ] Run `node scripts/build-sci-content.js`.
- [ ] Run `node --test test/sci-data.test.js` and verify it passes.

### Task 2: SCI Wrongbook and Mock Logic

**Files:**
- Create: `js/sci-session.js`
- Create: `test/sci-session.test.js`
- Modify: `js/store-core.js`
- Modify: `ui/shared.jsx`

**Interfaces:**
- Produces: `gradeSciExam(questions, answers): { total, correct, rate, rows }`
- Produces: `addSciWrong(state, qid)`, `removeSciWrong(state, qid)`, `clearSciWrong(state)`
- Store state includes `sciWrongbook: string[]` and `sciExamHistory: object[]`.

**Steps:**
- [ ] Write failing tests for grading and SCI wrongbook state.
- [ ] Run `node --test test/sci-session.test.js test/store-core.test.js` and verify the SCI-specific tests fail.
- [ ] Implement `js/sci-session.js` and store migration additions.
- [ ] Run `node --test test/sci-session.test.js test/store-core.test.js` and verify it passes.

### Task 3: React SCI Views

**Files:**
- Create: `ui/views-sci.jsx`
- Modify: `ui/shell-ui.jsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: `window.RES5.SCI_QUESTIONS`
- Adds views: `sciStudy`, `sciMock`, `sciWrong`

**Steps:**
- [ ] Add `ui/views-sci.jsx` using existing UI components.
- [ ] Add script include in `index.html` before `ui/shell-ui.jsx`.
- [ ] Add navigation entries and view map entries in `ui/shell-ui.jsx`.
- [ ] Manually smoke-test through a local static server.

### Task 4: Full Verification

**Files:**
- Existing test suite.

**Steps:**
- [ ] Run `npm test`.
- [ ] Start local server with `npm run serve`.
- [ ] Open the app and verify SCI tabs load without runtime errors.
- [ ] Report final file paths and verification output.
