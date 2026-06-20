# SCI Original Questions Module Design

## Goal

Add a separate SCI original-question study and mock-exam flow without replacing or mixing with the existing self-authored RES5 question bank.

The module uses the 300 extracted SCI questions as its own source of truth. It supports fast bilingual study, Part I / Part II SCI-only mock exams, and an SCI-specific wrong-question book.

## Source Data

Input source is `res5_all_questions_answers.json`, generated from the SCI eBook Storyline data on 2026-06-20.

The app will generate a static content file:

`content/sci/questions.json`

Each item has:

- `id`: stable ID such as `sci-q-001`
- `part`: `1` or `2`
- `syllabusItemId`: best-effort RES5 syllabus item, `s01` to `s27`
- `stemEn`: original English question
- `stemZh`: generated Chinese learning translation
- `optionsEn`: `{ A, B, C, D }`
- `optionsZh`: generated Chinese learning translation for each option
- `answer`: correct letter
- `knowledgePoint`: concise Chinese knowledge point
- `pitfall`: concise Chinese easy-mistake note
- `sourceRef`: SCI source marker

Chinese translations and study notes are learning aids generated from the English question text. They are not official SCI translations.

## Knowledge Ordering

The SCI Storyline data does not directly label questions with `s01..s27`.

Ordering will be:

1. Preserve SCI extracted question order.
2. Assign `part` by source order:
   - Questions 1-80: Part II question bank
   - Questions 81-190: Part I mock paper
   - Questions 191-300: Part I question bank
3. Assign `syllabusItemId` using a deterministic keyword/range classifier:
   - Part II questions map to `s14..s27`.
   - Part I questions map to `s01..s13`.
4. In the study view, group by `part`, then by `syllabusItemId`, then source order.

The classifier should be conservative. When a question cannot be confidently classified, assign it to the nearest broad syllabus item in the same part and keep the original source order.

## UI

Add navigation entries:

- `SCI原题`
- `SCI Mock`
- `SCI错题`

### SCI原题

This is a fast study page, not an answer-input page.

Controls:

- Part filter: All / Part I / Part II
- Knowledge-point filter: all syllabus items in the selected part

Each card shows:

- English question
- Chinese translation
- A-D English options
- A-D Chinese options
- Correct answer
- Knowledge point
- Easy-mistake note
- SCI source reference

### SCI Mock

This uses only `content/sci/questions.json`.

Modes:

- Part I only
- Part II only

Question count defaults to all available questions for that part. The first implementation may use deterministic source order; shuffling can be added later.

During the exam:

- The user chooses A-D for each question.
- The selected answer is visually marked.
- No answer is revealed until submit.

After submit:

- Show score and percentage.
- For each question, show chosen answer, correct answer, bilingual question/options, knowledge point, and pitfall.
- Add incorrect question IDs to the SCI wrong-question book.

### SCI错题

This page reads wrong SCI IDs from localStorage and displays the same bilingual review cards as `SCI原题`.

The user can:

- Review all wrong questions.
- Remove a question from the SCI wrongbook after mastering it.
- Clear the SCI wrongbook.

## State

Use localStorage through the existing store layer where practical.

New state fields:

- `sciWrongbook`: array of SCI question IDs
- `sciExamHistory`: array of `{ mode, total, correct, rate, timestamp }`

Existing self-authored question state remains unchanged.

## Tests

Add tests before implementation for:

- Loading/parsing SCI questions.
- Classifier returns valid `part` and `syllabusItemId`.
- SCI wrongbook add/remove/clear behavior.
- SCI mock grading and wrongbook update behavior.

Existing tests must continue to pass.

## Out of Scope

- Official Chinese translation.
- Manual textbook-quality explanations for every question.
- Randomized/shuffled mock papers.
- Replacing the existing self-authored `content/questions/sNN.json` bank.
