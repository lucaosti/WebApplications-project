-- Users table: includes both teachers and students
CREATE TABLE Users (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,   -- Unique user name used for login
  role TEXT CHECK (role IN ('teacher', 'student')) NOT NULL,
  passwordHash TEXT NOT NULL
);

-- Assignments table: contains assignments created by teachers
CREATE TABLE Assignments (
  id INTEGER PRIMARY KEY,

  teacherId INTEGER NOT NULL,
  question TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- When the assignment was created
  answer TEXT,
  submittedAt DATETIME, -- When the answer was submitted
  
  score INTEGER CHECK (score BETWEEN 0 AND 30),
  evaluatedAt DATETIME,
  status TEXT CHECK (status IN ('open', 'closed')) NOT NULL DEFAULT 'open',
  
  FOREIGN KEY (teacherId) REFERENCES Users(id)
);

-- Students assigned to each assignment (defining the group)
CREATE TABLE GroupMembers (
  assignmentId INTEGER NOT NULL,
  studentId INTEGER NOT NULL,
  PRIMARY KEY (assignmentId, studentId),
  FOREIGN KEY (assignmentId) REFERENCES Assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES Users(id)
);