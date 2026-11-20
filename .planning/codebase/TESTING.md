# FocusFlow Testing Strategy

## Test Suites
FocusFlow includes 49 test suites with over 430 individual test cases in `frontend`:

- **Component Tests:**
  - `Button`, `Badge`, `Card`, `Dialog`, `Dropdown`, `Input`, `Toaster`, `Tooltip`
- **Feature & Workspace Integration Tests:**
  - `Dashboard.test.jsx`: Bento grid, next focus, timeline, quick launch
  - `SubjectDetail.workspace.test.jsx`, `SubjectDetail.test.jsx`, `SubjectDetail.spacedRepetition.test.jsx`
  - `Subjects.test.jsx`: Subject cards, creation, syllabus counts
  - `Planner.test.jsx`: Day/Week/Month calendar views
  - `RevisionCenter.test.jsx`: Due queues, recall testing
  - `Insights.test.jsx`: Velocity and retention charts
  - `SettingsPage.test.jsx`: Profile, goals, deletion safety
  - `sessionWorkflowPages.test.jsx`, `sessionWorkflowRegression.test.jsx`: Session lifecycle
- **Unit & Logic Tests:**
  - `analytics.test.js`, `sessionPresentation.test.js`, `topicFocus.test.js`
  - `apiClient.test.js`, `subjectService.test.js`, `topicService.test.js`

## Running Tests
```bash
npm --prefix frontend test
```
To run in watch mode:
```bash
npm --prefix frontend run test -- --watch
```
