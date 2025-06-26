[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/F9jR7G97)
# Exam 2: "Compiti"
## Student: s347489 OSTINELLI LUCA

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...

## API Server

- POST `/api/something`
  - request parameters and request body content
  - response body content
- GET `/api/something`
  - request parameters
  - response body content
- POST `/api/something`
  - request parameters and request body content
  - response body content
- ...

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
