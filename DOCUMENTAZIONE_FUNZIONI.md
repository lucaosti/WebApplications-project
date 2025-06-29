# Documentazione Completa e Dettagliata del Progetto "Compiti"

## 📋 **Changelog Recenti**

### **🔄 Versione 2.0 - Conversione ES Modules (29 Giugno 2025)**
- ✅ **Backend convertito a ES Modules**: Tutti i file `.js` → `.mjs`
- ✅ **Package.json aggiornato**: `"type": "module"` configurato
- ✅ **Import paths aggiornati**: Tutti i riferimenti ora usano `.mjs`
- ✅ **Compatibilità mantenuta**: Frontend rimane con `.js/.jsx`
- ✅ **Documentazione aggiornata**: Tutti i riferimenti ai file corretti
- ✅ **Testing completato**: Backend e frontend funzionano correttamente
- ✅ **API Response ottimizzata**: Logout restituisce solo status HTTP 204

### **📁 File Rinominati:**
```
server/dao/usersDao.js           → server/dao/usersDao.mjs
server/dao/assignmentsDao.js     → server/dao/assignmentsDao.mjs  
server/dao/groupMembersDao.js    → server/dao/groupMembersDao.mjs
server/routes/auth.js            → server/routes/auth.mjs
server/routes/assignments.js     → server/routes/assignments.mjs
server/middlewares/auth.js       → server/middlewares/auth.mjs
server/app.js                    → server/app.mjs
server/passport-config.js        → server/passport-config.mjs
```

---

## 🏗️ Panoramica Architetturale

Il progetto implementa un **sistema di gestione compiti universitari** basato su architettura Full-Stack moderna. Il sistema permette a docenti di creare compiti, assegnare gruppi di studenti, e valutare le risposte, mentre gli studenti possono visualizzare i compiti assegnati e inviare le loro risposte.

### **🎯 Funzionalità Principali del Sistema:**

1. **👥 Gestione Utenti**:
   - Autenticazione con username/password 
   - Due ruoli: `student` e `teacher`
   - Sessioni persistenti con cookie

2. **📝 Gestione Compiti**:
   - Creazione compiti da parte dei docenti
   - Assegnazione gruppi di 2-6 studenti
   - Invio risposte da parte degli studenti
   - Valutazione e chiusura compiti

3. **🔒 Vincoli Business**:
   - Due studenti non possono collaborare più di una volta per lo stesso docente
   - Media ponderata basata sulla dimensione del gruppo
   - Controlli di accesso granulari

### **💻 Stack Tecnologico Completo:**

#### **Backend (Server):**
- **🟢 Node.js 18+**: Runtime JavaScript server-side
- **⚡ Express.js 4.x**: Framework web minimale e flessibile
- **🗄️ SQLite 3**: Database relazionale embedded, file-based
- **🔐 Passport.js**: Middleware autenticazione con strategia Local
- **🔑 bcrypt**: Hash sicuro delle password
- **🍪 express-session**: Gestione sessioni utente
- **🌐 cors**: Cross-Origin Resource Sharing per sviluppo

#### **Frontend (Client):**
- **⚛️ React 18**: Libreria UI component-based con hooks
- **⚡ Vite 5**: Build tool veloce e moderno
- **🧭 React Router 6**: Routing client-side per SPA
- **🎨 CSS3**: Styling responsive con Flexbox/Grid

#### **Database Schema:**
```sql
Users {
  id: INTEGER PRIMARY KEY,
  name: TEXT UNIQUE,
  role: TEXT (student|teacher),
  passwordHash: TEXT
}

Assignments {
  id: INTEGER PRIMARY KEY,
  teacherId: INTEGER → Users.id,
  question: TEXT,
  answer: TEXT,
  status: TEXT (open|closed),
  score: INTEGER (0-30),
  timestamps: createdAt, submittedAt, evaluatedAt
}

GroupMembers {
  assignmentId: INTEGER → Assignments.id,
  studentId: INTEGER → Users.id,
  PRIMARY KEY (assignmentId, studentId)
}
```

### **🏛️ Architettura a 3 Livelli (Three-Tier Architecture):**

#### **1. 🎨 Presentation Layer (Frontend)**
- **Responsabilità**: Interfaccia utente, interazione, rendering
- **Tecnologie**: React componenti, CSS styling, React Router
- **Pattern**: Component-Based Architecture, Context API per stato globale

#### **2. 🧠 Business Logic Layer (Backend Routes)**  
- **Responsabilità**: Logica applicativa, validazioni, orchestrazione
- **Tecnologie**: Express routes, middleware, Passport.js
- **Pattern**: RESTful API, Middleware Chain, Controller pattern

#### **3. 💾 Data Access Layer (DAO)**
- **Responsabilità**: Accesso database, query SQL, persistenza
- **Tecnologie**: SQLite, prepared statements
- **Pattern**: Data Access Object (DAO), Repository pattern

### **🔄 Comunicazione Inter-Layer:**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Client)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ LoginPage.jsx│  │ StudDash.jsx │  │ CreateAss.jsx│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│           │                 │                 │             │
│           └─────────────────┼─────────────────┘             │
│                             │                               │
│                    ┌──────────────┐                         │
│                    │ apiFetch()   │ ← HTTP Client Wrapper   │
│                    └──────────────┘                         │
└─────────────────────────────║─────────────────────────────--┘
                              ║ HTTP/JSON over Network
┌─────────────────────────────║─────────────────────────────┐
│                    BACKEND (Server)                       │
│                    ┌──────────────┐                       │
│                    │ Express.js   │ ← Web Server          │
│                    │ + CORS       │                       │
│                    └──────────────┘                       │
│                             │                             │
│           ┌─────────────────┼─────────────────┐           │
│           │                 │                 │           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │auth.js routes│  │assignments.js│  │middleware/   │     │
│  │              │  │routes        │  │auth.js       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│           │                 │                 │           │
│           └─────────────────┼─────────────────┘           │
│                             │                             │
│                    ┌──────────────┐                       │
│                    │ DAO Layer    │ ← Data Access Objects │
│                    │ (usersDao,   │                       │
│                    │ assignmenDao)│                       │
│                    └──────────────┘                       │
└─────────────────────────────║─────────────────────────────┘
                              ║ SQL Queries
┌─────────────────────────────║─────────────────────────────┐
│                    DATABASE (SQLite)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Users        │  │ Assignments  │  │ GroupMembers │     │
│  │ Table        │  │ Table        │  │ Table        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────────────────────────────────────────────────────┘
```

### **🌐 Protocolli di Comunicazione:**

#### **Frontend ↔ Backend:**
- **Protocollo**: HTTP/HTTPS
- **Formato**: JSON per request/response body
- **Autenticazione**: Session cookies (HttpOnly, Secure)
- **CORS**: Configurato per localhost:5173 (dev) con credentials

#### **Backend ↔ Database:**
- **Protocollo**: SQLite native driver
- **Sicurezza**: Prepared statements (SQL injection prevention)
- **Transazioni**: Supporto transazioni ACID per consistency

### **🔐 Sicurezza Multi-Livello:**

#### **1. Autenticazione (Chi sei?)**
```
User Input → bcrypt hash comparison → Passport strategy → Session creation
```

#### **2. Autorizzazione (Cosa puoi fare?)**
```
HTTP Request → isLoggedIn() → isTeacher()/isStudent() → Resource access check
```

#### **3. Validazione Dati**
```
Frontend validation → Backend validation → Database constraints
```

#### **4. Prevenzione Attacchi**
- **SQL Injection**: Prepared statements ovunque
- **XSS**: React automatic escaping  
- **CSRF**: SameSite cookies + Origin checks
- **Session Hijacking**: HttpOnly + Secure cookies

### **📊 Scalabilità e Performance:**

#### **Database Ottimizzazioni:**
- Primary keys su tutte le tabelle per query veloci
- Indici automatici su foreign keys
- Query JOIN ottimizzate per evitare N+1 problems

#### **Frontend Ottimizzazioni:**
- Vite build system per bundling efficiente
- React.memo per evitare re-render inutili
- Lazy loading delle route (possibile upgrade futuro)

#### **Caching Strategy:**
- Session data in memoria server
- Static assets con cache headers
- Database connection pooling (SQLite native)

### **🔧 Deployment e DevOps:**

#### **Ambiente Sviluppo:**
```
Frontend: localhost:5173 (Vite dev server)
Backend:  localhost:3001 (Node.js + nodemon)
Database: ./server/db/sample_compiti.db (file SQLite)
```

#### **Struttura Progetto:**
```
progetto/
├── client/          ← Frontend React (.js/.jsx files)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── auth/
│   │   └── api/
│   └── package.json
├── server/          ← Backend Node.js (.mjs files)
│   ├── routes/      ← Express routes (.mjs)
│   ├── dao/         ← Data Access Objects (.mjs)  
│   ├── middlewares/ ← Auth middleware (.mjs)
│   ├── db/          ← SQLite database files
│   ├── index.mjs    ← Entry point (ES Modules)
│   ├── app.mjs      ← Express app configuration
│   └── package.json ← "type": "module"
└── README.md
```

### **🎯 Pattern Architetturali Implementati:**

#### **1. 🏗️ MVC (Model-View-Controller) Pattern**
```
MODEL:      DAO classes (assignmentsDao.mjs, usersDao.mjs)
VIEW:       React Components (pages/, components/)
CONTROLLER: Express Routes (routes/assignments.mjs, routes/auth.mjs)
```

**Benefici:**
- **Separazione responsabilità**: Ogni layer ha un compito specifico
- **Testabilità**: Ogni componente può essere testato in isolamento
- **Manutenibilità**: Modifiche in un layer non impattano gli altri

#### **2. 🔌 Repository Pattern (DAO)**
```javascript
// Interfaccia standardizzata per accesso dati
class AssignmentsDAO {
  async create(assignment) { /* SQL INSERT */ }
  async findById(id) { /* SQL SELECT */ }  
  async update(id, data) { /* SQL UPDATE */ }
  async delete(id) { /* SQL DELETE */ }
}
```

**Benefici:**
- **Astrazione database**: Business logic indipendente da SQLite
- **Consistenza API**: Tutte le operazioni CRUD seguono stesso pattern
- **Sostituibilità**: Facile switch a MySQL/PostgreSQL in futuro

#### **3. 🛡️ Middleware Chain Pattern**
```javascript
// Pipeline di processing per ogni richiesta
app.use('/api/assignments', 
  isLoggedIn,        // ← Autentica utente
  isStudentOrTeacher,// ← Autorizza ruolo  
  validateInput,     // ← Valida dati input
  businessLogic,     // ← Esegue operazione
  formatResponse     // ← Formatta output
);
```

**Benefici:**
- **Riusabilità**: Middleware utilizzabili su multiple route
- **Componibilità**: Facile aggiunta/rimozione di controlli
- **Debugging**: Ogni step è isolato e tracciabile

#### **4. 📡 Context API Pattern (React)**
```javascript
// Stato globale condiviso senza prop drilling
<AuthProvider>
  <StudentDashboard />    ← Accede a user context
  <TeacherDashboard />    ← Accede a user context  
  <Navigation />          ← Accede a user context
</AuthProvider>
```

**Benefici:**
- **Stato centralizzato**: User info disponibile ovunque
- **Performance**: Re-render solo quando necessario
- **Semplicità**: No passaggio props attraverso tutta la gerarchia

### **🔄 Data Flow Patterns:**

#### **1. 🌊 Unidirectional Data Flow (React)**
```
User Action → Event Handler → State Update → Re-render → UI Update
     ↑                                               ↓
     └─────────────── User sees change ←─────────────┘
```

#### **2. 🔄 Request-Response Cycle**
```
Browser → HTTP Request → Express → DAO → SQLite
   ↑                                       ↓
   └── JSON Response ← Express ← DAO ← SQL Result
```

#### **3. 📊 State Management Flow**
```
Component Mount → useEffect → API Call → setState → Re-render
                      ↓
              Dependency array triggers new cycle
```

### **⚡ Performance Patterns:**

#### **1. 🚀 Frontend Optimizations**
```javascript
// React.memo per evitare re-render inutili
const Assignment = React.memo(({ assignment }) => {
  return <div>{assignment.question}</div>;
}, (prevProps, nextProps) => {
  return prevProps.assignment.id === nextProps.assignment.id;
});

// useMemo per calcoli costosi
const expensiveCalculation = useMemo(() => {
  return assignments.filter(a => a.status === 'open').length;
}, [assignments]);

// useCallback per stabilizzare funzioni
const handleSubmit = useCallback((data) => {
  submitAssignment(data);
}, []);
```

#### **2. 🗄️ Database Query Optimization**
```javascript
// JOIN invece di multiple query (evita N+1 problem)
const query = `
  SELECT a.*, u.name as teacherName,
         GROUP_CONCAT(us.name) as groupMembers
  FROM Assignments a 
  JOIN Users u ON a.teacherId = u.id
  JOIN GroupMembers gm ON a.id = gm.assignmentId  
  JOIN Users us ON gm.studentId = us.id
  WHERE a.id = ?
  GROUP BY a.id
`;

// Prepared statements (performance + security)
const stmt = db.prepare(query);
const result = stmt.get(assignmentId);
```

#### **3. 🌐 HTTP Optimization**
```javascript
// Keep-Alive connections
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  next();
});

// Compression middleware
const compression = require('compression');
app.use(compression());

// Static file caching
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

### **🛠️ Error Handling Patterns:**

#### **1. 🚨 Centralized Error Handling**
```javascript
// Global error middleware (server/app.mjs)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({ 
      error: 'Data constraint violation' 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});
```

#### **2. 🔍 Graceful Frontend Error Handling**
```javascript
// Error boundaries per React components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong.</h2>;
    }
    return this.props.children;
  }
}

// Try-catch con user feedback
const handleSubmit = async () => {
  try {
    await apiFetch('/api/assignments', { method: 'POST', body: data });
    setMessage({ type: 'success', text: 'Assignment created!' });
  } catch (error) {
    if (error.status === 400) {
      setMessage({ type: 'error', text: 'Invalid data provided' });
    } else if (error.status === 403) {
      setMessage({ type: 'error', text: 'Access denied' });
    } else {
      setMessage({ type: 'error', text: 'Something went wrong' });
    }
  }
};
```

### **🔐 Security Best Practices:**

#### **1. 🛡️ Defense in Depth**
```
Layer 1: Input Validation (Frontend + Backend)
Layer 2: Authentication (Passport.js + bcrypt)  
Layer 3: Authorization (Role-based middleware)
Layer 4: Database Security (Prepared statements)
Layer 5: Transport Security (HTTPS in production)
```

#### **2. 🔒 Session Security**
```javascript
// Configurazione sicura sessioni
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,    // ← Previene XSS
    secure: false,     // ← true in produzione (HTTPS)
    maxAge: 24*60*60*1000, // ← 24 ore
    sameSite: 'lax'    // ← Previene CSRF
  }
}));
```

#### **3. 🚫 Input Sanitization**
```javascript
// Validazione rigorosa input
const validateAssignment = (req, res, next) => {
  const { question, groupSize } = req.body;
  
  if (!question || question.trim().length < 10) {
    return res.status(400).json({ 
      error: 'Question must be at least 10 characters' 
    });
  }
  
  if (!groupSize || groupSize < 2 || groupSize > 6) {
    return res.status(400).json({ 
      error: 'Group size must be between 2 and 6' 
    });
  }
  
  // Sanitizza HTML per prevenire XSS
  req.body.question = escapeHtml(question.trim());
  next();
};
```

### **🔧 Configurazione Ambiente Sviluppo:**

> **📝 Nota Importante**: Il backend è stato convertito da file `.js` a `.mjs` per utilizzare **ES Modules nativi**. 
> Il frontend mantiene i file `.js/.jsx` con supporto ES Modules tramite Vite.

#### **Avvio Progetto:**
```bash
# Terminal 1 - Backend
cd server
npm install
npm start    # Avvia su localhost:3001

# Terminal 2 - Frontend  
cd client
npm install
npm run dev  # Avvia su localhost:5173
```

#### **Struttura File di Configurazione:**
```
server/                          ← Backend ES Modules
├── package.json                 ← "type": "module", dipendenze Node.js
├── app.mjs                      ← Configurazione Express (ES Modules)
├── index.mjs                    ← Entry point server (ES Modules)
├── passport-config.mjs          ← Configurazione Passport (ES Modules)
├── dao/                         ← Data Access Objects
│   ├── db.mjs                   ← Database initialization
│   ├── assignmentsDao.mjs       ← Assignment operations
│   ├── usersDao.mjs            ← User operations  
│   └── groupMembersDao.mjs     ← Group operations
├── routes/                      ← API routes
│   ├── auth.mjs                ← Authentication routes
│   └── assignments.mjs         ← Assignment routes
└── middlewares/                 ← Custom middleware
    └── auth.mjs                ← Authentication middleware

client/                          ← Frontend React
├── package.json                 ← Dipendenze React + Vite
├── vite.config.js              ← Configurazione Vite + Proxy API
├── index.html                  ← Template HTML
└── src/                        ← Source code (.js/.jsx)
    ├── api/client.js           ← API wrapper functions
    ├── auth/AuthContext.jsx    ← Authentication context
    ├── components/             ← Reusable components
    └── pages/                  ← Page components
```

### **🎯 Pattern Architetturali Implementati:**

#### **1. 🏗️ MVC (Model-View-Controller) Pattern**
```
MODEL:      DAO classes (assignmentsDao.mjs, usersDao.mjs)
VIEW:       React Components (pages/, components/)
CONTROLLER: Express Routes (routes/assignments.mjs, routes/auth.mjs)
```

**Benefici:**
- **Separazione responsabilità**: Ogni layer ha un compito specifico
- **Testabilità**: Ogni componente può essere testato in isolamento
- **Manutenibilità**: Modifiche in un layer non impattano gli altri

#### **2. 🔌 Repository Pattern (DAO)**
```javascript
// Interfaccia standardizzata per accesso dati
class AssignmentsDAO {
  async create(assignment) { /* SQL INSERT */ }
  async findById(id) { /* SQL SELECT */ }  
  async update(id, data) { /* SQL UPDATE */ }
  async delete(id) { /* SQL DELETE */ }
}
```

**Benefici:**
- **Astrazione database**: Business logic indipendente da SQLite
- **Consistenza API**: Tutte le operazioni CRUD seguono stesso pattern
- **Sostituibilità**: Facile switch a MySQL/PostgreSQL in futuro

#### **3. 🛡️ Middleware Chain Pattern**
```javascript
// Pipeline di processing per ogni richiesta
app.use('/api/assignments', 
  isLoggedIn,        // ← Autentica utente
  isStudentOrTeacher,// ← Autorizza ruolo  
  validateInput,     // ← Valida dati input
  businessLogic,     // ← Esegue operazione
  formatResponse     // ← Formatta output
);
```

**Benefici:**
- **Riusabilità**: Middleware utilizzabili su multiple route
- **Componibilità**: Facile aggiunta/rimozione di controlli
- **Debugging**: Ogni step è isolato e tracciabile

#### **4. 📡 Context API Pattern (React)**
```javascript
// Stato globale condiviso senza prop drilling
<AuthProvider>
  <StudentDashboard />    ← Accede a user context
  <TeacherDashboard />    ← Accede a user context  
  <Navigation />          ← Accede a user context
</AuthProvider>
```

**Benefici:**
- **Stato centralizzato**: User info disponibile ovunque
- **Performance**: Re-render solo quando necessario
- **Semplicità**: No passaggio props attraverso tutta la gerarchia

### **🔄 Data Flow Patterns:**

#### **1. 🌊 Unidirectional Data Flow (React)**
```
User Action → Event Handler → State Update → Re-render → UI Update
     ↑                                               ↓
     └─────────────── User sees change ←─────────────┘
```

#### **2. 🔄 Request-Response Cycle**
```
Browser → HTTP Request → Express → DAO → SQLite
   ↑                                       ↓
   └── JSON Response ← Express ← DAO ← SQL Result
```

#### **3. 📊 State Management Flow**
```
Component Mount → useEffect → API Call → setState → Re-render
                      ↓
              Dependency array triggers new cycle
```

### **⚡ Performance Patterns:**

#### **1. 🚀 Frontend Optimizations**
```javascript
// React.memo per evitare re-render inutili
const Assignment = React.memo(({ assignment }) => {
  return <div>{assignment.question}</div>;
}, (prevProps, nextProps) => {
  return prevProps.assignment.id === nextProps.assignment.id;
});

// useMemo per calcoli costosi
const expensiveCalculation = useMemo(() => {
  return assignments.filter(a => a.status === 'open').length;
}, [assignments]);

// useCallback per stabilizzare funzioni
const handleSubmit = useCallback((data) => {
  submitAssignment(data);
}, []);
```

#### **2. 🗄️ Database Query Optimization**
```javascript
// JOIN invece di multiple query (evita N+1 problem)
const query = `
  SELECT a.*, u.name as teacherName,
         GROUP_CONCAT(us.name) as groupMembers
  FROM Assignments a 
  JOIN Users u ON a.teacherId = u.id
  JOIN GroupMembers gm ON a.id = gm.assignmentId  
  JOIN Users us ON gm.studentId = us.id
  WHERE a.id = ?
  GROUP BY a.id
`;

// Prepared statements (performance + security)
const stmt = db.prepare(query);
const result = stmt.get(assignmentId);
```

#### **3. 🌐 HTTP Optimization**
```javascript
// Keep-Alive connections
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  next();
});

// Compression middleware
const compression = require('compression');
app.use(compression());

// Static file caching
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

### **🛠️ Error Handling Patterns:**

#### **1. 🚨 Centralized Error Handling**
```javascript
// Global error middleware (server/app.mjs)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({ 
      error: 'Data constraint violation' 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});
```

#### **2. 🔍 Graceful Frontend Error Handling**
```javascript
// Error boundaries per React components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong.</h2>;
    }
    return this.props.children;
  }
}

// Try-catch con user feedback
const handleSubmit = async () => {
  try {
    await apiFetch('/api/assignments', { method: 'POST', body: data });
    setMessage({ type: 'success', text: 'Assignment created!' });
  } catch (error) {
    if (error.status === 400) {
      setMessage({ type: 'error', text: 'Invalid data provided' });
    } else if (error.status === 403) {
      setMessage({ type: 'error', text: 'Access denied' });
    } else {
      setMessage({ type: 'error', text: 'Something went wrong' });
    }
  }
};
```

### **🔐 Security Best Practices:**

#### **1. 🛡️ Defense in Depth**
```
Layer 1: Input Validation (Frontend + Backend)
Layer 2: Authentication (Passport.js + bcrypt)  
Layer 3: Authorization (Role-based middleware)
Layer 4: Database Security (Prepared statements)
Layer 5: Transport Security (HTTPS in production)
```

#### **2. 🔒 Session Security**
```javascript
// Configurazione sicura sessioni
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,    // ← Previene XSS
    secure: false,     // ← true in produzione (HTTPS)
    maxAge: 24*60*60*1000, // ← 24 ore
    sameSite: 'lax'    // ← Previene CSRF
  }
}));
```

#### **3. 🚫 Input Sanitization**
```javascript
// Validazione rigorosa input
const validateAssignment = (req, res, next) => {
  const { question, groupSize } = req.body;
  
  if (!question || question.trim().length < 10) {
    return res.status(400).json({ 
      error: 'Question must be at least 10 characters' 
    });
  }
  
  if (!groupSize || groupSize < 2 || groupSize > 6) {
    return res.status(400).json({ 
      error: 'Group size must be between 2 and 6' 
    });
  }
  
  // Sanitizza HTML per prevenire XSS
  req.body.question = escapeHtml(question.trim());
  next();
};
```

### **🔧 Configurazione Ambiente Sviluppo:**

> **📝 Nota Importante**: Il backend è stato convertito da file `.js` a `.mjs` per utilizzare **ES Modules nativi**. 
> Il frontend mantiene i file `.js/.jsx` con supporto ES Modules tramite Vite.

#### **Avvio Progetto:**
```bash
# Terminal 1 - Backend
cd server
npm install
npm start    # Avvia su localhost:3001

# Terminal 2 - Frontend  
cd client
npm install
npm run dev  # Avvia su localhost:5173
```

#### **Struttura File di Configurazione:**
```
server/                          ← Backend ES Modules
├── package.json                 ← "type": "module", dipendenze Node.js
├── app.mjs                      ← Configurazione Express (ES Modules)
├── index.mjs                    ← Entry point server (ES Modules)
├── passport-config.mjs          ← Configurazione Passport (ES Modules)
├── dao/                         ← Data Access Objects
│   ├── db.mjs                   ← Database initialization
│   ├── assignmentsDao.mjs       ← Assignment operations
│   ├── usersDao.mjs            ← User operations  
│   └── groupMembersDao.mjs     ← Group operations
├── routes/                      ← API routes
│   ├── auth.mjs                ← Authentication routes
│   └── assignments.mjs         ← Assignment routes
└── middlewares/                 ← Custom middleware
    └── auth.mjs                ← Authentication middleware

client/                          ← Frontend React
├── package.json                 ← Dipendenze React + Vite
├── vite.config.js              ← Configurazione Vite + Proxy API
├── index.html                  ← Template HTML
└── src/                        ← Source code (.js/.jsx)
    ├── api/client.js           ← API wrapper functions
    ├── auth/AuthContext.jsx    ← Authentication context
    ├── components/             ← Reusable components
    └── pages/                  ← Page components
```

### **🎯 Pattern Architetturali Implementati:**

#### **1. 🏗️ MVC (Model-View-Controller) Pattern**
```
MODEL:      DAO classes (assignmentsDao.mjs, usersDao.mjs)
VIEW:       React Components (pages/, components/)
CONTROLLER: Express Routes (routes/assignments.mjs, routes/auth.mjs)
```

**Benefici:**
- **Separazione responsabilità**: Ogni layer ha un compito specifico
- **Testabilità**: Ogni componente può essere testato in isolamento
- **Manutenibilità**: Modifiche in un layer non impattano gli altri

#### **2. 🔌 Repository Pattern (DAO)**
```javascript
// Interfaccia standardizzata per accesso dati
class AssignmentsDAO {
  async create(assignment) { /* SQL INSERT */ }
  async findById(id) { /* SQL SELECT */ }  
  async update(id, data) { /* SQL UPDATE */ }
  async delete(id) { /* SQL DELETE */ }
}
```

**Benefici:**
- **Astrazione database**: Business logic indipendente da SQLite
- **Consistenza API**: Tutte le operazioni CRUD seguono stesso pattern
- **Sostituibilità**: Facile switch a MySQL/PostgreSQL in futuro

#### **3. 🛡️ Middleware Chain Pattern**
```javascript
// Pipeline di processing per ogni richiesta
app.use('/api/assignments', 
  isLoggedIn,        // ← Autentica utente
  isStudentOrTeacher,// ← Autorizza ruolo  
  validateInput,     // ← Valida dati input
  businessLogic,     // ← Esegue operazione
  formatResponse     // ← Formatta output
);
```

**Benefici:**
- **Riusabilità**: Middleware utilizzabili su multiple route
- **Componibilità**: Facile aggiunta/rimozione di controlli
- **Debugging**: Ogni step è isolato e tracciabile

#### **4. 📡 Context API Pattern (React)**
```javascript
// Stato globale condiviso senza prop drilling
<AuthProvider>
  <StudentDashboard />    ← Accede a user context
  <TeacherDashboard />    ← Accede a user context  
  <Navigation />          ← Accede a user context
</AuthProvider>
```

**Benefici:**
- **Stato centralizzato**: User info disponibile ovunque
- **Performance**: Re-render solo quando necessario
- **Semplicità**: No passaggio props attraverso tutta la gerarchia

### **🔄 Data Flow Patterns:**

#### **1. 🌊 Unidirectional Data Flow (React)**
```
User Action → Event Handler → State Update → Re-render → UI Update
     ↑                                               ↓
     └─────────────── User sees change ←─────────────┘
```

#### **2. 🔄 Request-Response Cycle**
```
Browser → HTTP Request → Express → DAO → SQLite
   ↑                                       ↓
   └── JSON Response ← Express ← DAO ← SQL Result
```

#### **3. 📊 State Management Flow**
```
Component Mount → useEffect → API Call → setState → Re-render
                      ↓
              Dependency array triggers new cycle
```

### **⚡ Performance Patterns:**

#### **1. 🚀 Frontend Optimizations**
```javascript
// React.memo per evitare re-render inutili
const Assignment = React.memo(({ assignment }) => {
  return <div>{assignment.question}</div>;
}, (prevProps, nextProps) => {
  return prevProps.assignment.id === nextProps.assignment.id;
});

// useMemo per calcoli costosi
const expensiveCalculation = useMemo(() => {
  return assignments.filter(a => a.status === 'open').length;
}, [assignments]);

// useCallback per stabilizzare funzioni
const handleSubmit = useCallback((data) => {
  submitAssignment(data);
}, []);
```

#### **2. 🗄️ Database Query Optimization**
```javascript
// JOIN invece di multiple query (evita N+1 problem)
const query = `
  SELECT a.*, u.name as teacherName,
         GROUP_CONCAT(us.name) as groupMembers
  FROM Assignments a 
  JOIN Users u ON a.teacherId = u.id
  JOIN GroupMembers gm ON a.id = gm.assignmentId  
  JOIN Users us ON gm.studentId = us.id
  WHERE a.id = ?
  GROUP BY a.id
`;

// Prepared statements (performance + security)
const stmt = db.prepare(query);
const result = stmt.get(assignmentId);
```

#### **3. 🌐 HTTP Optimization**
```javascript
// Keep-Alive connections
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  next();
});

// Compression middleware
const compression = require('compression');
app.use(compression());

// Static file caching
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

### **🛠️ Error Handling Patterns:**

#### **1. 🚨 Centralized Error Handling**
```javascript
// Global error middleware (server/app.mjs)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({ 
      error: 'Data constraint violation' 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});
```

#### **2. 🔍 Graceful Frontend Error Handling**
```javascript
// Error boundaries per React components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong.</h2>;
    }
    return this.props.children;
  }
}

// Try-catch con user feedback
const handleSubmit = async () => {
  try {
    await apiFetch('/api/assignments', { method: 'POST', body: data });
    setMessage({ type: 'success', text: 'Assignment created!' });
  } catch (error) {
    if (error.status === 400) {
      setMessage({ type: 'error', text: 'Invalid data provided' });
    } else if (error.status === 403) {
      setMessage({ type: 'error', text: 'Access denied' });
    } else {
      setMessage({ type: 'error', text: 'Something went wrong' });
    }
  }
};
```

### **🔐 Security Best Practices:**

#### **1. 🛡️ Defense in Depth**
```
Layer 1: Input Validation (Frontend + Backend)
Layer 2: Authentication (Passport.js + bcrypt)  
Layer 3: Authorization (Role-based middleware)
Layer 4: Database Security (Prepared statements)
Layer 5: Transport Security (HTTPS in production)
```

#### **2. 🔒 Session Security**
```javascript
// Configurazione sicura sessioni
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,    // ← Previene XSS
    secure: false,     // ← true in produzione (HTTPS)
    maxAge: 24*60*60*1000, // ← 24 ore
    sameSite: 'lax'    // ← Previene CSRF
  }
}));
```

#### **3. 🚫 Input Sanitization**
```javascript
// Validazione rigorosa input
const validateAssignment = (req, res, next) => {
  const { question, groupSize } = req.body;
  
  if (!question || question.trim().length < 10) {
    return res.status(400).json({ 
      error: 'Question must be at least 10 characters' 
    });
  }
  
  if (!groupSize || groupSize < 2 || groupSize > 6) {
    return res.status(400).json({ 
      error: 'Group size must be between 2 and 6' 
    });
  }
  
  // Sanitizza HTML per prevenire XSS
  req.body.question = escapeHtml(question.trim());
  next();
};
```

### **🔧 Configurazione Ambiente Sviluppo:**

> **📝 Nota Importante**: Il backend è stato convertito da file `.js` a `.mjs` per utilizzare **ES Modules nativi**. 
> Il frontend mantiene i file `.js/.jsx` con supporto ES Modules tramite Vite.

#### **Avvio Progetto:**
```bash
# Terminal 1 - Backend
cd server
npm install
npm start    # Avvia su localhost:3001

# Terminal 2 - Frontend  
cd client
npm install
npm run dev  # Avvia su localhost:5173
```

#### **Struttura File di Configurazione:**
```
server/                          ← Backend ES Modules
├── package.json                 ← "type": "module", dipendenze Node.js
├── app.mjs                      ← Configurazione Express (ES Modules)
├── index.mjs                    ← Entry point server (ES Modules)
├── passport-config.mjs          ← Configurazione Passport (ES Modules)
├── dao/                         ← Data Access Objects
│   ├── db.mjs                   ← Database initialization
│   ├── assignmentsDao.mjs       ← Assignment operations
│   ├── usersDao.mjs            ← User operations  
│   └── groupMembersDao.mjs     ← Group operations
├── routes/                      ← API routes
│   ├── auth.mjs                ← Authentication routes
│   └── assignments.mjs         ← Assignment routes
└── middlewares/                 ← Custom middleware
    └── auth.mjs                ← Authentication middleware

client/                          ← Frontend React
├── package.json                 ← Dipendenze React + Vite
├── vite.config.js              ← Configurazione Vite + Proxy API
├── index.html                  ← Template HTML
└── src/                        ← Source code (.js/.jsx)
    ├── api/client.js           ← API wrapper functions
    ├── auth/AuthContext.jsx    ← Authentication context
    ├── components/             ← Reusable components
    └── pages/                  ← Page components
```

### **🎯 Pattern Architetturali Implementati:**

#### **1. 🏗️ MVC (Model-View-Controller) Pattern**
```
MODEL:      DAO classes (assignmentsDao.mjs, usersDao.mjs)
VIEW:       React Components (pages/, components/)
CONTROLLER: Express Routes (routes/assignments.mjs, routes/auth.mjs)
```

**Benefici:**
- **Separazione responsabilità**: Ogni layer ha un compito specifico
- **Testabilità**: Ogni componente può essere testato in isolamento
- **Manutenibilità**: Modifiche in un layer non impattano gli altri

#### **2. 🔌 Repository Pattern (DAO)**
```javascript
// Interfaccia standardizzata per accesso dati
class AssignmentsDAO {
  async create(assignment) { /* SQL INSERT */ }
  async findById(id) { /* SQL SELECT */ }  
  async update(id, data) { /* SQL UPDATE */ }
  async delete(id) { /* SQL DELETE */ }
}
```

**Benefici:**
- **Astrazione database**: Business logic indipendente da SQLite
- **Consistenza API**: Tutte le operazioni CRUD seguono stesso pattern
- **Sostituibilità**: Facile switch a MySQL/PostgreSQL in futuro

#### **3. 🛡️ Middleware Chain Pattern**
```javascript
// Pipeline di processing per ogni richiesta
app.use('/api/assignments', 
  isLoggedIn,        // ← Autentica utente
  isStudentOrTeacher,// ← Autorizza ruolo  
  validateInput,     // ← Valida dati input
  businessLogic,     // ← Esegue operazione
  formatResponse     // ← Formatta output
);
```

**Benefici:**
- **Riusabilità**: Middleware utilizzabili su multiple route
- **Componibilità**: Facile aggiunta/rimozione di controlli
- **Debugging**: Ogni step è isolato e tracciabile

#### **4. 📡 Context API Pattern (React)**
```javascript
// Stato globale condiviso senza prop drilling
<AuthProvider>
  <StudentDashboard />    ← Accede a user context
  <TeacherDashboard />    ← Accede a user context  
  <Navigation />          ← Accede a user context
</AuthProvider>
```

**Benefici:**
- **Stato centralizzato**: User info disponibile ovunque
- **Performance**: Re-render solo quando necessario
- **Semplicità**: No passaggio props attraverso tutta la gerarchia

### **🔄 Data Flow Patterns:**

#### **1. 🌊 Unidirectional Data Flow (React)**
```
User Action → Event Handler → State Update → Re-render → UI Update
     ↑                                               ↓
     └─────────────── User sees change ←─────────────┘
```

#### **2. 🔄 Request-Response Cycle**
```
Browser → HTTP Request → Express → DAO → SQLite
   ↑                                       ↓
   └── JSON Response ← Express ← DAO ← SQL Result
```

#### **3. 📊 State Management Flow**
```
Component Mount → useEffect → API Call → setState → Re-render
                      ↓
              Dependency array triggers new cycle
```

### **⚡ Performance Patterns:**

#### **1. 🚀 Frontend Optimizations**
```javascript
// React.memo per evitare re-render inutili
const Assignment = React.memo(({ assignment }) => {
  return <div>{assignment.question}</div>;
}, (prevProps, nextProps) => {
  return prevProps.assignment.id === nextProps.assignment.id;
});

// useMemo per calcoli costosi
const expensiveCalculation = useMemo(() => {
  return assignments.filter(a => a.status === 'open').length;
}, [assignments]);

// useCallback per stabilizzare funzioni
const handleSubmit = useCallback((data) => {
  submitAssignment(data);
}, []);
```

#### **2. 🗄️ Database Query Optimization**
```javascript
// JOIN invece di multiple query (evita N+1 problem)
const query = `
  SELECT a.*, u.name as teacherName,
         GROUP_CONCAT(us.name) as groupMembers
  FROM Assignments a 
  JOIN Users u ON a.teacherId = u.id
  JOIN GroupMembers gm ON a.id = gm.assignmentId  
  JOIN Users us ON gm.studentId = us.id
  WHERE a.id = ?
  GROUP BY a.id
`;

// Prepared statements (performance + security)
const stmt = db.prepare(query);
const result = stmt.get(assignmentId);
```

#### **3. 🌐 HTTP Optimization**
```javascript
// Keep-Alive connections
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  next();
});

// Compression middleware
const compression = require('compression');
app.use(compression());

// Static file caching
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

### **🛠️ Error Handling Patterns:**

#### **1. 🚨 Centralized Error Handling**
```javascript
// Global error middleware (server/app.mjs)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({ 
      error: 'Data constraint violation' 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});
```

#### **2. 🔍 Graceful Frontend Error Handling**
```javascript
// Error boundaries per React components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong.</h2>;
    }
    return this.props.children;
  }
}

// Try-catch con user feedback
const handleSubmit = async () => {
  try {
    await apiFetch('/api/assignments', { method: 'POST', body: data });
    setMessage({ type: 'success', text: 'Assignment created!' });
  } catch (error) {
    if (error.status === 400) {
      setMessage({ type: 'error', text: 'Invalid data provided' });
    } else if (error.status === 403) {
      setMessage({ type: 'error', text: 'Access denied' });
    } else {
      setMessage({ type: 'error', text: 'Something went wrong' });
    }
  }
};
```

### **🔐 Security Best Practices:**

#### **1. 🛡️ Defense in Depth**
```
Layer 1: Input Validation (Frontend + Backend)
Layer 2: Authentication (Passport.js + bcrypt)  
Layer 3: Authorization (Role-based middleware)
Layer 4: Database Security (Prepared statements)
Layer 5: Transport Security (HTTPS in production)
```

#### **2. 🔒 Session Security**
```javascript
// Configurazione sicura sessioni
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,    // ← Previene XSS
    secure: false,     // ← true in produzione (HTTPS)
    maxAge: 24*60*60*1000, // ← 24 ore
    sameSite: 'lax'    // ← Previene CSRF
  }
}));
```

#### **3. 🚫 Input Sanitization**
```javascript
// Validazione rigorosa input
const validateAssignment = (req, res, next) => {
  const { question, groupSize } = req.body;
  
  if (!question || question.trim().length < 10) {
    return res.status(400).json({ 
      error: 'Question must be at least 10 characters' 
    });
  }
  
  if (!groupSize || groupSize < 2 || groupSize > 6) {
    return res.status(400).json({ 
      error: 'Group size must be between 2 and 6' 
    });
  }
  
  // Sanitizza HTML per prevenire XSS
  req.body.question = escapeHtml(question.trim());
  next();
};
```

### **🔧 Configurazione Ambiente Sviluppo:**

> **📝 Nota Importante**: Il backend è stato convertito da file `.js` a `.mjs` per utilizzare **ES Modules nativi**. 
> Il frontend mantiene i file `.js/.jsx` con supporto ES Modules tramite Vite.

#### **Avvio Progetto:**
```bash
# Terminal 1 - Backend
cd server
npm install
npm start    # Avvia su localhost:3001

# Terminal 2 - Frontend  
cd client
npm install
npm run dev  # Avvia su localhost:5173
```

#### **Struttura File di Configurazione:**
```
server/                          ← Backend ES Modules
├── package.json                 ← "type": "module", dipendenze Node.js
├── app.mjs                      ← Configurazione Express (ES Modules)
├── index.mjs                    ← Entry point server (ES Modules)
├── passport-config.mjs          ← Configurazione Passport (ES Modules)
├── dao/                         ← Data Access Objects
│   ├── db.mjs                   ← Database initialization
│   ├── assignmentsDao.mjs       ← Assignment operations
│   ├── usersDao.mjs            ← User operations  
│   └── groupMembersDao.mjs     ← Group operations
├── routes/                      ← API routes
│   ├── auth.mjs                ← Authentication routes
│   └── assignments.mjs         ← Assignment routes
└── middlewares/                 ← Custom middleware
    └── auth.mjs                ← Authentication middleware

client/                          ← Frontend React
├── package.json                 ← Dipendenze React + Vite
├── vite.config.js              ← Configurazione Vite + Proxy API
├── index.html                  ← Template HTML
└── src/                        ← Source code (.js/.jsx)
    ├── api/client.js           ← API wrapper functions
    ├── auth/AuthContext.jsx    ← Authentication context
    ├── components/             ← Reusable components
    └── pages/                  ← Page components
```

### **🎯 Pattern Architetturali Implementati:**

#### **1. 🏗️ MVC (Model-View-Controller) Pattern**
```
MODEL:      DAO classes (assignmentsDao.mjs, usersDao.mjs)
VIEW:       React Components (pages/, components/)
CONTROLLER: Express Routes (routes/assignments.mjs, routes/auth.mjs)
```

**Benefici:**
- **Separazione responsabilità**: Ogni layer ha un compito specifico
- **Testabilità**: Ogni componente può essere testato in isolamento
- **Manutenibilità**: Modifiche in un layer non impattano gli altri

#### **2. 🔌 Repository Pattern (DAO)**
```javascript
// Interfaccia standardizzata per accesso dati
class AssignmentsDAO {
  async create(assignment) { /* SQL INSERT */ }
  async findById(id) { /* SQL SELECT */ }  
  async update(id, data) { /* SQL UPDATE */ }
  async delete(id) { /* SQL DELETE */ }
}
```

**Benefici:**
- **Astrazione database**: Business logic indipendente da SQLite
- **Consistenza API**: Tutte le operazioni CRUD seguono stesso pattern
- **Sostituibilità**: Facile switch a MySQL/PostgreSQL in futuro

#### **3. 🛡️ Middleware Chain Pattern**
```javascript
// Pipeline di processing per ogni richiesta
app.use('/api/assignments', 
  isLoggedIn,        // ← Autentica utente
  isStudentOrTeacher,// ← Autorizza ruolo  
  validateInput,     // ← Valida dati input
  businessLogic,     // ← Esegue operazione
  formatResponse     // ← Formatta output
);
```

**Benefici:**
- **Riusabilità**: Middleware utilizzabili su multiple route
- **Componibilità**: Facile aggiunta/rimozione di controlli
- **Debugging**: Ogni step è isolato e tracciabile

#### **4. 📡 Context API Pattern (React)**
```javascript
// Stato globale condiviso senza prop drilling
<AuthProvider>
  <StudentDashboard />    ← Accede a user context
  <TeacherDashboard />    ← Accede a user context  
  <Navigation />          ← Accede a user context
</AuthProvider>
```

**Benefici:**
- **Stato centralizzato**: User info disponibile ovunque
- **Performance**: Re-render solo quando necessario
- **Semplicità**: No passaggio props attraverso tutta la gerarchia

### **🔄 Data Flow Patterns:**

#### **1. 🌊 Unidirectional Data Flow (React)**
```
User Action → Event Handler → State Update → Re-render → UI Update
     ↑                                               ↓
     └─────────────── User sees change ←─────────────┘
```

#### **2. 🔄 Request-Response Cycle**
```
Browser → HTTP Request → Express → DAO → SQLite
   ↑                                       ↓
   └── JSON Response ← Express ← DAO ← SQL Result
```

#### **3. 📊 State Management Flow**
```
Component Mount → useEffect → API Call → setState → Re-render
                      ↓
              Dependency array triggers new cycle
```

### **⚡ Performance Patterns:**

#### **1. 🚀 Frontend Optimizations**
```javascript
// React.memo per evitare re-render inutili
const Assignment = React.memo(({ assignment }) => {
  return <div>{assignment.question}</div>;
}, (prevProps, nextProps) => {
  return prevProps.assignment.id === nextProps.assignment.id;
});

// useMemo per calcoli costosi
const expensiveCalculation = useMemo(() => {
  return assignments.filter(a => a.status === 'open').length;
}, [assignments]);

// useCallback per stabilizzare funzioni
const handleSubmit = useCallback((data) => {
  submitAssignment(data);
}, []);
```

#### **2. 🗄️ Database Query Optimization**
```javascript
// JOIN invece di multiple query (evita N+1 problem)
const query = `
  SELECT a.*, u.name as teacherName,
         GROUP_CONCAT(us.name) as groupMembers
  FROM Assignments a 
  JOIN Users u ON a.teacherId = u.id
  JOIN GroupMembers gm ON a.id = gm.assignmentId  
  JOIN Users us ON gm.studentId = us.id
  WHERE a.id = ?
  GROUP BY a.id
`;

// Prepared statements (performance + security)
const stmt = db.prepare(query);
const result = stmt.get(assignmentId);
```

#### **3. 🌐 HTTP Optimization**
```javascript
// Keep-Alive connections
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  next();
});

// Compression middleware
const compression = require('compression');
app.use(compression());

// Static file caching
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

### **🛠️ Error Handling Patterns:**

#### **1. 🚨 Centralized Error Handling**
```javascript
// Global error middleware (server/app.mjs)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({ 
      error: 'Data constraint violation' 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});
```

#### **2. 🔍 Graceful Frontend Error Handling**
```javascript
// Error boundaries per React components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong.</h2>;
    }
    return this.props.children;
  }
}

// Try-catch con user feedback
const handleSubmit = async () => {
  try {
    await apiFetch('/api/assignments', { method: 'POST', body: data });
    setMessage({ type: 'success', text: 'Assignment created!' });
  } catch (error) {
    if (error.status === 400) {
      setMessage({ type: 'error', text: 'Invalid data provided' });
    } else if (error.status === 403) {
      setMessage({ type: 'error', text: 'Access denied' });
    } else {
      setMessage({ type: 'error', text: 'Something went wrong' });
    }
  }
};
```

### **🔐 Security Best Practices:**

#### **1. 🛡️ Defense in Depth**
```
Layer 1: Input Validation (Frontend + Backend)
Layer 2: Authentication (Passport.js + bcrypt)  
Layer 3: Authorization (Role-based middleware)
Layer 4: Database Security (Prepared statements)
Layer 5: Transport Security (HTTPS in production)
```

#### **2. 🔒 Session Security**
```javascript
// Configurazione sicura sessioni
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,    // ← Previene XSS
    secure: false,     // ← true in produzione (HTTPS)
    maxAge: 24*60*60*1000, // ← 24 ore
    sameSite: 'lax'    // ← Previene CSRF
  }
}));
```

#### **3. 🚫 Input Sanitization**
```javascript
// Validazione rigorosa input
const validateAssignment = (req, res, next) => {
  const { question, groupSize } = req.body;
  
  if (!question || question.trim().length < 10) {
    return res.status(400).json({ 
      error: 'Question must be at least 10 characters' 
    });
  }
  
  if (!groupSize || groupSize < 2 || groupSize > 6) {
    return res.status(400).json({ 
      error: 'Group size must be between 2 and 6' 
    });
  }
  
  // Sanitizza HTML per prevenire XSS
  req.body.question = escapeHtml(question.trim());
  next();
};
```

### **🔧 Configurazione Ambiente Sviluppo:**

> **📝 Nota Importante**: Il backend è stato convertito da file `.js` a `.mjs` per utilizzare **ES Modules nativi**. 
> Il frontend mantiene i file `.js/.jsx` con supporto ES Modules tramite Vite.

#### **Avvio Progetto:**
```bash
# Terminal 1 - Backend
cd server
npm install
npm start    # Avvia su localhost:3001

# Terminal 2 - Frontend  
cd client
npm install
npm run dev  # Avvia su localhost:5173
```

#### **Struttura File di Configurazione:**
```
server/                          ← Backend ES Modules
├── package.json                 ← "type": "module", dipendenze Node.js
├── app.mjs                      ← Configurazione Express (ES Modules)
├── index.mjs                    ← Entry point server (ES Modules)
├── passport-config.mjs          ← Configurazione Passport (ES Modules)
├── dao/                         ← Data Access Objects
│   ├── db.mjs                   ← Database initialization
│   ├── assignmentsDao.mjs       ← Assignment operations
│   ├── usersDao.mjs            ← User operations  
│   └── groupMembersDao.mjs     ← Group operations
├── routes/                      ← API routes
│   ├── auth.mjs                ← Authentication routes
│   └── assignments.mjs         ← Assignment routes
└── middlewares/                 ← Custom middleware
    └── auth.mjs                ← Authentication middleware

client/                          ← Frontend React
├── package.json                 ← Dipendenze React + Vite
├── vite.config.js              ← Configurazione Vite + Proxy API
├── index.html                  ← Template HTML
└── src/                        ← Source code (.js/.jsx)
    ├── api/client.js           ← API wrapper functions
    ├── auth/AuthContext.jsx    ← Authentication context
    ├── components/             ← Reusable components
    └── pages/                  ← Page components
```

### **🎯 Pattern Architetturali Implementati:**

#### **1. 🏗️ MVC (Model-View-Controller) Pattern**
```
MODEL:      DAO classes (assignmentsDao.mjs, usersDao.mjs)
VIEW:       React Components (pages/, components/)
CONTROLLER: Express Routes (routes/assignments.mjs, routes/auth.mjs)
```

**Benefici:**
- **Separazione responsabilità**: Ogni layer ha un compito specifico
- **Testabilità**: Ogni componente può essere testato in isolamento
- **Manutenibilità**: Modifiche in un layer non impattano gli altri

#### **2. 🔌 Repository Pattern (DAO)**
```javascript
// Interfaccia standardizzata per accesso dati
class AssignmentsDAO {
  async create(assignment) { /* SQL INSERT */ }
  async findById(id) { /* SQL SELECT */ }  
  async update(id, data) { /* SQL UPDATE */ }
  async delete(id) { /* SQL DELETE */ }
}
```

**Benefici:**
- **Astrazione database**: Business logic indipendente da SQLite
- **Consistenza API**: Tutte le operazioni CRUD seguono stesso pattern
- **Sostituibilità**: Facile switch a MySQL/PostgreSQL in futuro

#### **3. 🛡️ Middleware Chain Pattern**
```javascript
// Pipeline di processing per ogni richiesta
app.use('/api/assignments', 
  isLoggedIn,        // ← Autentica utente
  isStudentOrTeacher,// ← Autorizza ruolo  
  validateInput,     // ← Valida dati input
  businessLogic,     // ← Esegue operazione
  formatResponse     // ← Formatta output
);
```

**Benefici:**
- **Riusabilità**: Middleware utilizzabili su multiple route
- **Componibilità**: Facile aggiunta/rimozione di controlli
- **Debugging**: Ogni step è isolato e tracciabile

#### **4. 📡 Context API Pattern (React)**
```javascript
// Stato globale condiviso senza prop drilling
<AuthProvider>
  <StudentDashboard />    ← Accede a user context
  <TeacherDashboard />    ← Accede a user context  
  <Navigation />          ← Accede a user context
</AuthProvider>
```

**Benefici:**
- **Stato centralizzato**: User info disponibile ovunque
- **Performance**: Re-render solo quando necessario
- **Semplicità**: No passaggio props attraverso tutta la gerarchia

### **🔄 Data Flow Patterns:**

#### **1. 🌊 Unidirectional Data Flow (React)**
```
User Action → Event Handler → State Update → Re-render → UI Update
     ↑                                               ↓
     └─────────────── User sees change ←─────────────┘
```

#### **2. 🔄 Request-Response Cycle**
```
Browser → HTTP Request → Express → DAO → SQLite
   ↑                                       ↓
   └── JSON Response ← Express ← DAO ← SQL Result
```

#### **3. 📊 State Management Flow**
```
Component Mount → useEffect → API Call → setState → Re-render
                      ↓
              Dependency array triggers new cycle
```

### **⚡ Performance Patterns:**

#### **1. 🚀 Frontend Optimizations**
```javascript
// React.memo per evitare re-render inutili
const Assignment = React.memo(({ assignment }) => {
  return <div>{assignment.question}</div>;
}, (prevProps, nextProps) => {
  return prevProps.assignment.id === nextProps.assignment.id;
});

// useMemo per calcoli costosi
const expensiveCalculation = useMemo(() => {
  return assignments.filter(a => a.status === 'open').length;
}, [assignments]);

// useCallback per stabilizzare funzioni
const handleSubmit = useCallback((data) => {
  submitAssignment(data);
}, []);
```

#### **2. 🗄️ Database Query Optimization**
```javascript
// JOIN invece di multiple query (evita N+1 problem)
const query = `
  SELECT a.*, u.name as teacherName,
         GROUP_CONCAT(us.name) as groupMembers
  FROM Assignments a 
  JOIN Users u ON a.teacherId = u.id
  JOIN GroupMembers gm ON a.id = gm.assignmentId  
  JOIN Users us ON gm.studentId = us.id
  WHERE a.id = ?
  GROUP BY a.id
`;

// Prepared statements (performance + security)
const stmt = db.prepare(query);
const result = stmt.get(assignmentId);
```

#### **3. 🌐 HTTP Optimization**
```javascript
// Keep-Alive connections
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  next();
});

// Compression middleware
const compression = require('compression');
app.use(compression());

// Static file caching
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

### **🛠️ Error Handling Patterns:**

#### **1. 🚨 Centralized Error Handling**
```javascript
// Global error middleware (server/app.mjs)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({ 
      error: 'Data constraint violation' 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});
```

#### **2. 🔍 Graceful Frontend Error Handling**
```javascript
// Error boundaries per React components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong.</h2>;
    }
    return this.props.children;
  }
}

// Try-catch con user feedback
const handleSubmit = async () => {
  try {
    await apiFetch('/api/assignments', { method: 'POST', body: data });
    setMessage({ type: 'success', text: 'Assignment created!' });
  } catch (error) {
    if (error.status === 400) {
      setMessage({ type: 'error', text: 'Invalid data provided' });
    } else if (error.status === 403) {
      setMessage({ type: 'error', text: 'Access denied' });
    } else {
      setMessage({ type: 'error', text: 'Something went wrong' });
    }
  }
};
```

### **🔐 Security Best Practices:**

#### **1. 🛡️ Defense in Depth**
```
Layer 1: Input Validation (Frontend + Backend)
Layer 2: Authentication (Passport.js + bcrypt)  
Layer 3: Authorization (Role-based middleware)
Layer 4: Database Security (Prepared statements)
Layer 5: Transport Security (HTTPS in production)
```

#### **2. 🔒 Session Security**
```javascript
// Configurazione sicura sessioni
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,    // ← Previene XSS
    secure: false,     // ← true in produzione (HTTPS)
    maxAge: 24*60*60*1000, // ← 24 ore
    sameSite: 'lax'    // ← Previene CSRF
  }
}));
```

#### **3. 🚫 Input Sanitization**
```javascript
// Validazione rigorosa input
const validateAssignment = (req, res, next) => {
  const { question, groupSize } = req.body;
  
  if (!question || question.trim().length < 10) {
    return res.status(400).json({ 
      error: 'Question must be at least 10 characters' 
    });
  }
  
  if (!groupSize || groupSize < 2 || groupSize > 6) {
    return res.status(400).json({ 
      error: 'Group size must be between 2 and 6' 
    });
  }
  
  // Sanitizza HTML per prevenire XSS
  req.body.question = escapeHtml(question.trim());
  next();
};
```

### **🔧 Configurazione Ambiente Sviluppo:**

> **📝 Nota Importante**: Il backend è stato convertito da file `.js` a `.mjs` per utilizzare **ES Modules nativi**. 
> Il frontend mantiene i file `.js/.jsx` con supporto ES Modules tramite Vite.

#### **Avvio Progetto:**
```bash
# Terminal 1 - Backend
cd server
npm install
npm start    # Avvia su localhost:3001

# Terminal 2 - Frontend  
cd client
npm install
npm run dev  # Avvia su localhost:5173
```

#### **Struttura File di Configurazione:**
```
server/                          ← Backend ES Modules
├── package.json                 ← "type": "module", dipendenze Node.js
├── app.mjs                      ← Configurazione Express (ES Modules)
├── index.mjs                    ← Entry point server (ES Modules)
├── passport-config.mjs          ← Configurazione Passport (ES Modules)
├── dao/                         ← Data Access Objects
│   ├── db.mjs                   ← Database initialization
│   ├── assignmentsDao.mjs       ← Assignment operations
│   ├── usersDao.mjs            ← User operations  
│   └── groupMembersDao.mjs     ← Group operations
├── routes/                      ← API routes
│   ├── auth.mjs                ← Authentication routes
│   └── assignments.mjs         ← Assignment routes
└── middlewares/                 ← Custom middleware
    └── auth.mjs                ← Authentication middleware

client/                          ← Frontend React
├── package.json                 ← Dipendenze React + Vite
├── vite.config.js              ← Configurazione Vite + Proxy API
├── index.html                  ← Template HTML
└── src/                        ← Source code (.js/.jsx)
    ├── api/client.js           ← API wrapper functions
    ├── auth/AuthContext.jsx    ← Authentication context
    ├── components/             ← Reusable components
    └── pages/                  ← Page components
```

### **🎯 Pattern Architetturali Implementati:**

#### **1. 🏗️ MVC (Model-View-Controller) Pattern**
```
MODEL:      DAO classes (assignmentsDao.mjs, usersDao.mjs)
VIEW:       React Components (pages/, components/)
CONTROLLER: Express Routes (routes/assignments.mjs, routes/auth.mjs)
```

**Benefici:**
- **Separazione responsabilità**: Ogni layer ha un compito specifico
- **Testabilità**: Ogni componente può essere testato in isolamento
- **Manutenibilità**: Modifiche in un layer non impattano gli altri

#### **2. 🔌 Repository Pattern (DAO)**
```javascript
// Interfaccia standardizzata per accesso dati
class AssignmentsDAO {
  async create(assignment) { /* SQL INSERT */ }
  async findById(id) { /* SQL SELECT */ }  
  async update(id, data) { /* SQL UPDATE */ }
  async delete(id) { /* SQL DELETE */ }
}
```

**Benefici:**
- **Astrazione database**: Business logic indipendente da SQLite
- **Consistenza API**: Tutte le operazioni CRUD seguono stesso pattern
- **Sostituibilità**: Facile switch a MySQL/PostgreSQL in futuro

#### **3. 🛡️ Middleware Chain Pattern**
```javascript
// Pipeline di processing per ogni richiesta
app.use('/api/assignments', 
  isLoggedIn,        // ← Autentica utente
  isStudentOrTeacher,// ← Autorizza ruolo  
  validateInput,     // ← Valida dati input
  businessLogic,     // ← Esegue operazione
  formatResponse     // ← Formatta output
);
```

**Benefici:**
- **Riusabilità**: Middleware utilizzabili su multiple route
- **Componibilità**: Facile aggiunta/rimozione di controlli
- **Debugging**: Ogni step è isolato e tracciabile

#### **4. 📡 Context API Pattern (React)**
```javascript
// Stato globale condiviso senza prop drilling
<AuthProvider>
  <StudentDashboard />    ←
```javascript
export default function Navigation() {
  const { user, logout } = useAuth();

  if (!user) return null; // Don't show navigation if not logged in

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="navigation">
      <div className="nav-content">
        <div className="nav-user">
          Welcome, {user.name} ({user.role})
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
}
```

**Dove viene usata:** Inclusa nel layout principale (`App.jsx`) e visibile in tutte le pagine.

**Logica di rendering:**
- **Se `!user`**: Ritorna `null` (React non renderizza nulla)
- **Se `user` esiste**: Mostra barra con nome, ruolo e pulsante logout

**Esempio di integrazione in App.jsx:**
```javascript
function App() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <LoginPage />;
  
  return (
    <div className="app">
      <Navigation />  {/* ← Sempre visibile quando autenticati */}
      <main>
        <Routes>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          {/* altre routes */}
        </Routes>
      </main>
    </div>
  );
}
```

## Flussi Completi End-to-End

Questa sezione mostra come **tutti i componenti lavorano insieme** per implementare le funzionalità principali, con esempi di codice reale da ogni livello dello stack.

### 🔐 Flusso di Login Completo

**Sequenza temporale con codice:**

#### 1. **Frontend - Utente inserisce credenziali**

**📁 File:** `client/src/auth/LoginPage.jsx` (linee 15-45)

```javascript
function LoginPage() {
  const { login, loginError } = useAuth();                    // ← Hook da AuthContext
  const [formData, setFormData] = useState({ name: '', password: '' });
  const navigate = useNavigate();                            // ← React Router per redirect

  const handleSubmit = async (e) => {
    e.preventDefault();                                       // ← Previene refresh pagina
    const user = await login(formData);                      // ← Chiama funzione AuthContext
    if (user) {                                              // ← Se login successo
      navigate(user.role === 'student' ? '/student' : '/teacher'); // ← Redirect basato su ruolo
    }
    // Se login fallisce, loginError viene aggiornato automaticamente
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={formData.name}                                // ← Controlled component 
        onChange={(e) => setFormData({...formData, name: e.target.value})}  // ← Aggiorna stato locale
        placeholder="Username" 
        required
      />
      <input 
        type="password"
        value={formData.password} 
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        placeholder="Password" 
        required
      />
      <button type="submit">Login</button>
      {loginError && <div className="error">{loginError}</div>}  {/* ← Mostra errori dal Context */}
    </form>
  );
}
```

#### 2. **AuthContext - Gestisce chiamata API**

**📁 File:** `client/src/auth/AuthContext.jsx` (linee 25-40)

```javascript
const login = async ({ name, password }) => {
  setLoginError(null);                        // ← Reset errori precedenti
  try {
    const userData = await apiFetch('/api/login', {  // ← Chiama wrapper HTTP
      method: 'POST',
      body: { name, password }                // ← Oggetto auto-serializzato in JSON
    });
    setUser(userData);                        // ← Aggiorna stato globale → re-render tutta app
    return userData;                          // ← Ritorna al LoginPage per redirect
  } catch (err) {
    setLoginError(err.message);               // ← Salva errore per UI
    setUser(null);                           // ← Assicura che user sia null
    return null;                             // ← Indica fallimento al LoginPage
  }
};
```

#### 3. **API Client - HTTP Request**

**📁 File:** `client/src/api/client.js` (linee 9-41) - Trasformazione richiesta

```javascript
export async function apiFetch(url, options) {
  // TRASFORMAZIONE: da oggetto JS a richiesta HTTP
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',                   // ← CRITICO: abilita cookies per sessioni
    body: JSON.stringify({ name: 'mario', password: 'password123' })  // ← Da oggetto a stringa JSON
  });
  
  if (response.ok) {                         // ← Status 200-299
    return await response.json();            // ← Parsa risposta JSON del server
  } else {                                   // ← Status 400, 401, 500, etc.
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || `HTTP error ${response.status}`);
    error.status = response.status;          // ← Aggiunge info per error handling
    throw error;                             // ← AuthContext cattura con catch()
  }
}
    return await response.json(); // ← Ritorna dati utente
  } else {
    throw new Error('Invalid credentials');
  }
}
```

#### 4. **Backend Route - Processa login**

**📁 File:** `server/routes/auth.mjs` (linee 20-35)

```javascript
router.post('/login', (req, res, next) => {
  // STEP 1: Usa Passport.js LocalStrategy per autenticazione
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);                              // ← Errore database/server
    if (!user) {                                           // ← Credenziali sbagliate
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // STEP 2: Se credenziali OK, crea sessione
    req.logIn(user, (err) => {                            // ← Passport crea cookie sessione
      if (err) return next(err);
      
      // STEP 3: Ritorna dati utente (SENZA password) al frontend
      res.json({                                          // ← Response che arriva ad apiFetch()
        id: user.id,                                      // ← Es: 3
        name: user.name,                                  // ← Es: "mario"  
        role: user.role                                   // ← Es: "student"
      });
    });
  })(req, res, next);
});
```

#### 5. **Passport Strategy - Verifica credenziali**

**📁 File:** `server/passport-config.js` (linee 15-30)

```javascript
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    // STEP 1: Cerca utente nel database
    const user = await getUserByName(username);           // ← DAO call a usersDao.js
    if (!user) {                                         // ← Username non esiste
      return done(null, false, { message: 'User not found' });
    }
    
    // STEP 2: Confronta password con hash salvato
    const isValid = await bcrypt.compare(password, user.passwordHash);  // ← bcrypt.compare()
    if (isValid) {
      return done(null, user);                           // ← Login riuscito, passa user alla route
    } else {
      return done(null, false, { message: 'Wrong password' });  // ← Password sbagliata
    }
  } catch (err) {
    return done(err);                                    // ← Errore database
  }
}));
```

#### 6. **DAO - Accesso database**

**📁 File:** `server/dao/usersDao.mjs` (linee 8-14)

```javascript
export async function getUserByName(name) {
  const db = await initDB();                             // ← Connessione SQLite
  return db.get(                                         // ← Query SQL parametrizzata
    'SELECT id, name, role, passwordHash FROM Users WHERE name = ?',
    [name]                                               // ← "mario" sostituisce ?
  );
  // Risultato esempio:
  // { 
  //   id: 3, 
  //   name: "mario", 
  //   role: "student", 
  //   passwordHash: "$2b$10$XyZAbC..." 
  // }
}
```

#### 7. **Frontend - Re-render dopo login**

**📁 File:** `client/src/App.jsx` (linee 10-25) - Componente principale

```javascript
function App() {
  const { user, isAuthenticated } = useAuth();           // ← Riceve update da setUser() in AuthContext
  
  // RENDER CONDIZIONALE basato su stato autenticazione
  if (user === undefined) {                              // ← App appena caricata, checking sessione
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {                                // ← user = null, mostra login
    return <LoginPage />;
  }
  
  // ✅ Utente autenticato → mostra app completa
  return (
    <div>
      <Navigation />                                     {/* Mostra "Welcome mario (student)" */}
      <Routes>
        <Route path="/student" element={<StudentDashboard />} />  {/* Dashboard studente */}
        <Route path="/teacher" element={<TeacherDashboard />} />  {/* Dashboard docente */}
        <Route path="/assignment/:id" element={<AssignmentView />} />
        {/* altre routes */}
      </Routes>
    </div>
  );
}
```

**🔄 Sequenza temporale riassuntiva:**
```
14:30:15.123 - User clicca "Login" in LoginPage.jsx
14:30:15.125 - handleSubmit() chiama login() in AuthContext.jsx  
14:30:15.128 - AuthContext chiama apiFetch('/api/login')
14:30:15.130 - apiFetch() invia POST con JSON al server
14:30:15.145 - Server route /login riceve richiesta
14:30:15.147 - Passport LocalStrategy cerca user con getUserByName()
14:30:15.152 - Database ritorna user con password hash
14:30:15.155 - bcrypt.compare() verifica password → OK
14:30:15.158 - req.logIn() crea sessione e cookie
14:30:15.160 - Server risponde con user data (no password)
14:30:15.165 - apiFetch() riceve response, parsa JSON
14:30:15.167 - AuthContext riceve userData, chiama setUser()
14:30:15.170 - React re-renderizza App.jsx con nuovo stato
14:30:15.175 - App rileva isAuthenticated=true, mostra dashboard
14:30:15.180 - navigate() redirect a /student o /teacher
```

---

### 📝 Flusso di Creazione Compito Completo

#### 1. **Frontend - Docente apre form creazione**
```javascript
// CreateAssignment.jsx
function CreateAssignment() {
  const [question, setQuestion] = useState('');
  const [students, setStudents] = useState([]);      // Lista tutti studenti
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Carica lista studenti al mount
  useEffect(() => {
    const loadStudents = async () => {
      const data = await apiFetch('/api/students');
      setStudents(data);
    };
    loadStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Crea assignment base
      const result = await apiFetch('/api/assignments', {
        method: 'POST',
        body: { question }
      });
      
      // 2. Assegna gruppo di studenti  
      await apiFetch(`/api/assignments/${result.id}/group`, {
        method: 'POST',
        body: { studentIds: selectedStudents }
      });
      
      setMessage({ type: 'success', text: 'Assignment created successfully!' });
      navigate('/teacher');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea 
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter your question..."
        required
      />
      
      <div className="student-selection">
        <h3>Select Students (2-6):</h3>
        {students.map(student => (
          <label key={student.id}>
            <input 
              type="checkbox"
              checked={selectedStudents.includes(student.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedStudents([...selectedStudents, student.id]);
                } else {
                  setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                }
              }}
            />
            {student.name}
          </label>
        ))}
      </div>
      
      <button type="submit" disabled={selectedStudents.length < 2}>
        Create Assignment
      </button>
    </form>
  );
}
```

#### 2. **Backend Route - Crea assignment**
```javascript
// routes/assignments.js  
router.post('/assignments', isLoggedIn, isTeacher, async (req, res) => {
  const { question } = req.body;
  
  // Validazione input
  if (typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'Question cannot be empty' });
  }

  try {
    const id = await createAssignment({ 
      teacherId: req.user.id,  // ← Da middleware autenticazione
      question 
    });
    
    console.log(`Assignment ${id} created by teacher ${req.user.name}`);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});
```

#### 3. **DAO - Inserimento database**
```javascript
// assignmentsDao.js
export async function createAssignment({ teacherId, question }) {
  const db = await initDB();
  const res = await db.run(
    'INSERT INTO Assignments (teacherId, question) VALUES (?, ?)',
    [teacherId, question]
  );
  return res.lastID;  // ← Ritorna ID auto-generato (es: 25)
}
```

#### 4. **Backend Route - Assegna gruppo**
```javascript
// routes/assignments.js
router.post('/assignments/:id/group', isLoggedIn, isTeacher, async (req, res) => {
  const { studentIds } = req.body; // [3, 7, 12]
  
  // Validazioni multiple...
  
  // 🚨 Controllo vincolo collaborazione  
  for (let i = 0; i < studentIds.length; i++) {
    for (let j = i + 1; j < studentIds.length; j++) {
      const { count } = await countGroupParticipations(
        req.user.id,     // teacherId
        studentIds[i],   // studentId1
        studentIds[j]    // studentId2
      );
      
      if (count >= 2) {
        return res.status(400).json({
          error: `Students ${studentIds[i]} and ${studentIds[j]} have already worked together 2 times`
        });
      }
    }
  }
  
  // Se tutti i controlli passano
  await addGroupMembers(req.params.id, studentIds);
  res.status(204).end();
});
```

#### 5. **DAO - Controllo vincoli e inserimento gruppi**
```javascript
// groupMembersDao.js
export async function countGroupParticipations(teacherId, studentId1, studentId2) {
  const db = await initDB();
  return db.get(`
    SELECT COUNT(*) AS count
    FROM GroupMembers gm1
    JOIN GroupMembers gm2 ON gm1.assignmentId = gm2.assignmentId  
    JOIN Assignments a ON gm1.assignmentId = a.id
    WHERE gm1.studentId = ?      -- Primo studente
      AND gm2.studentId = ?      -- Secondo studente  
      AND a.teacherId = ?        -- Stesso docente
  `, [studentId1, studentId2, teacherId]);
  // ← Ritorna { count: 1 } se sono stati insieme 1 volta
}

export async function addGroupMembers(assignmentId, studentIds) {
  const db = await initDB();
  const insert = 'INSERT INTO GroupMembers (assignmentId, studentId) VALUES (?, ?)';
  
  // Inserisce un record per ogni studente nel gruppo
  for (const studentId of studentIds) {
    await db.run(insert, [assignmentId, studentId]);
  }
  // ← Database ora ha:
  // GroupMembers: { assignmentId: 25, studentId: 3 }
  // GroupMembers: { assignmentId: 25, studentId: 7 }  
  // GroupMembers: { assignmentId: 25, studentId: 12 }
}
```

#### 6. **Frontend - Conferma e redirect**
```javascript
// Il success del secondo apiFetch() nella CreateAssignment triggera:
setMessage({ type: 'success', text: 'Assignment created successfully!' });
navigate('/teacher'); // ← Torna alla TeacherDashboard

// TeacherDashboard.jsx si ricarica e mostra il nuovo assignment
useEffect(() => {
  const loadAssignments = async () => {
    const assignments = await apiFetch('/api/assignments');
    setAssignments(assignments); // ← Include il nuovo assignment appena creato
  };
  loadAssignments();
}, []);
```

---

### 📚 Flusso di Risposta Studente Completo

#### 1. **StudentDashboard - Lista assignment**
```javascript
// StudentDashboard.jsx
function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  
  useEffect(() => {
    const loadDashboard = async () => {
      const assignments = await apiFetch('/api/assignments');
      setAssignments(assignments);
    };
    loadDashboard();
  }, []);

  const openAssignments = assignments.filter(a => a.status === 'open');
  
  return (
    <div>
      <h3>Open Assignments ({openAssignments.length})</h3>
      {openAssignments.map(assignment => (
        <div key={assignment.id} className="assignment-card">
          <h4>{assignment.question}</h4>
          <p>Teacher: {assignment.teacherName}</p>
          <p>Status: {assignment.answer ? 'Answer submitted' : 'No answer yet'}</p>
          <button onClick={() => navigate(`/assignment/${assignment.id}`)}>
            {assignment.answer ? 'View/Edit' : 'Submit Answer'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

#### 2. **AssignmentView - Form risposta**
```javascript
// AssignmentView.jsx
function AssignmentView() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState(null);

  // Carica assignment specifico
  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const data = await apiFetch(`/api/assignments/${id}`);
        setAssignment(data);
        setAnswer(data.answer || ''); // Pre-popola se già risposto
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      }
    };
    loadAssignment();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await apiFetch(`/api/assignments/${id}/answer`, {
        method: 'PUT',
        body: { answer }
      });
      
      setMessage({ type: 'success', text: 'Answer updated successfully!' });
      
      // Ricarica assignment per aggiornare submittedAt
      const updated = await apiFetch(`/api/assignments/${id}`);
      setAssignment(updated);
    } catch (err) {
      if (err.status === 409) {
        setMessage({ type: 'error', text: 'Assignment was closed while you were editing!' });
      } else {
        setMessage({ type: 'error', text: err.message });
      }
    }
  };

  if (!assignment) return <div>Loading...</div>;

  return (
    <div>
      <h2>Assignment Details</h2>
      <div className="assignment-info">
        <p><strong>Question:</strong> {assignment.question}</p>
        <p><strong>Teacher:</strong> {assignment.teacherName}</p>
        <p><strong>Status:</strong> {assignment.status}</p>
        <p><strong>Group Members:</strong> {
          assignment.groupMembers.map(m => m.name).join(', ')
        }</p>
      </div>

      {assignment.status === 'open' ? (
        <form onSubmit={handleSubmit}>
          <label>Your Answer:</label>
          <textarea 
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            required
          />
          <button type="submit">Submit Answer</button>
        </form>
      ) : (
        <div className="readonly-answer">
          <h3>Submitted Answer:</h3>
          <p>{assignment.answer}</p>
          <p><strong>Score:</strong> {assignment.score}/30</p>
        </div>
      )}

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
```

#### 3. **Backend Route - Aggiorna risposta**
```javascript
// routes/assignments.js
router.put('/assignments/:id/answer', isLoggedIn, isStudent, async (req, res) => {
  const { answer } = req.body;
  
  try {
    const assignment = await getAssignmentByIdWithMembers(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verifica che lo studente sia nel gruppo
    const isInGroup = assignment.groupMembers.some(m => m.studentId === req.user.id);
    if (!isInGroup) {
      return res.status(403).json({ error: 'You are not in this assignment group' });
    }

    // Verifica che sia ancora aperto
    if (assignment.status !== 'open') {
      return res.status(409).json({ 
        error: 'Assignment already closed',
        assignment: assignment  // ← Ritorna dati aggiornati per il frontend
      });
    }

    await updateAnswer(req.params.id, answer);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update answer' });
  }
});
```

#### 4. **DAO - Aggiornamento database**
```javascript
// assignmentsDao.js
export async function updateAnswer(assignmentId, answer) {
  const db = await initDB();
  const submittedAt = new Date().toISOString();
  
  await db.run(
    'UPDATE Assignments SET answer = ?, submittedAt = ? WHERE id = ? AND status = "open"',
    [answer, submittedAt, assignmentId]
  );
  
  // ⚠️ Se nel frattempo un docente ha cambiato status a "closed",
  //    questa query non aggiorna nessun record (WHERE clause fallisce)
}
```

**Gestione conflitti concorrenti:**
```javascript
// Scenario di conflitto:
// 1. Studente inizia a scrivere risposta alle 14:20
// 2. Docente valuta e chiude assignment alle 14:25  
// 3. Studente clicca submit alle 14:30

// Il database protegge con WHERE status = "open"
// La response al frontend sarà 409 con messaggio di errore
// Il frontend mostra "Assignment was closed while you were editing!"
```

Questa architettura garantisce **consistenza dei dati**, **sicurezza multi-livello**, e **user experience fluida** anche in scenari di concorrenza tra utenti.
