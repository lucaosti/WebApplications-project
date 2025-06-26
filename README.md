[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/F9jR7G97)
# Exam 2: "Compiti"
## Student: s347489 OSTINELLI LUCA

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...

## API Server

- POST `/api/login`
  - Request body: `{ name: string, password: string }`
  - Response body (success): `{ id, name, role }`
  - Response body (failure): `{ error: "Invalid credentials" }`

- POST `/api/logout`
  - No parameters
  - Response body: `204 No Content`

- GET `/api/sessions/current`
  - No parameters
  - Response body: `{ id, name, role }` if logged in, or `401 Unauthorized`

- GET `/api/assignments` (for teacher)
  - Requires session and teacher role
  - Response body: array of assignments created by the teacher

- GET `/api/assignments` (for student)
  - Requires session and student role
  - Response body: array of assignments assigned to the student (group member)

- POST `/api/assignments`
  - Requires session and teacher role
  - Request body: `{ question: string, groupMembers: array of student IDs }`
  - Response body: `{ id: number }` newly created assignment ID, or error if validation fails

- PUT `/api/assignments/:id/answer`
  - Requires session and student role
  - Request body: `{ answer: string }`
  - Response body: `204 No Content`, or error if not in group or already answered

- PUT `/api/assignments/:id/evaluate`
  - Requires session and teacher role
  - Request body: `{ score: number (0-30) }`
  - Response body: `204 No Content`, or error if assignment not found or invalid state

- GET `/api/assignments/:id`
  - Requires authentication
  - Response body: full assignment data if requester is creator or group member

## Database Tables

- Table `Users` – stores all system users (students and teachers). Fields:
  - `id` (INTEGER, PK): unique identifier
  - `name` (TEXT, UNIQUE): login name
  - `role` (TEXT): must be either 'student' or 'teacher'
  - `passwordHash` (TEXT): hashed + salted password

- Table `Assignments` – stores all assignments created by teachers. Fields:
  - `id` (INTEGER, PK)
  - `teacherId` (INTEGER, FK to Users.id)
  - `question` (TEXT): the assignment question
  - `createdAt` (DATETIME): when the assignment was posted
  - `answer` (TEXT or NULL): the response submitted by students
  - `submittedAt` (DATETIME or NULL): when the answer was submitted
  - `score` (INTEGER or NULL): assigned score, from 0 to 30
  - `evaluatedAt` (DATETIME or NULL): when the teacher evaluated it

- Table `GroupMembers` – links students to assignments (many-to-many). Fields:
  - `assignmentId` (INTEGER, FK to Assignments.id)
  - `studentId` (INTEGER, FK to Users.id)
  - Composite PK on (assignmentId, studentId)

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- username, password (plus any other requested info)
- username, password (plus any other requested info)
