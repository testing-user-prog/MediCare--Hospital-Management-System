# Medicare — Hospital Management System

A full-stack Hospital Management System for handling patient registration, doctor scheduling, appointments, prescriptions, pharmacy stock, billing/dues, and diagnostic reporting.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, React Router, React-Bootstrap, React-Toastify |
| Backend | Node.js + Express 5 |
| Database | Microsoft SQL Server |
| DB Driver | `mssql` (via `msnodesqlv8`) |
| HTTP Client | Axios |

## Project Structure

```
Medicare/
├── index.js                    # Express server & all API routes
├── dbconfig.js                 # SQL Server connection configuration
├── package.json / package-lock.json
├── drafts/
│   ├── ddl_new.sql             # Database schema (tables, constraints)
│   └── dbfunctions2.sql        # Stored procedures (business logic)
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── eslint.config.js
    ├── package.json / package-lock.json
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    └── src/
        ├── main.jsx
        ├── App.jsx              # Route definitions
        ├── index.css
        ├── utils.js
        └── pages/
            ├── Home.jsx
            ├── BookAppointment.jsx
            ├── CancelAppointment.jsx
            ├── ManageDoctors.jsx
            ├── ManageSessions.jsx
            ├── ClearDues.jsx
            ├── Pharmacy.jsx
            ├── AnalyzeProfits.jsx
            └── ReportsAndDiagnostics.jsx
```

## Features & Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | Home | Landing/dashboard |
| `/book` | BookAppointment | Register patients, book sessions with doctors |
| `/cancel` | CancelAppointment | Cancel existing sessions |
| `/doctors` | ManageDoctors | Add/edit/remove doctors, availability, charges |
| `/sessions` | ManageSessions | View booked/completed/cancelled sessions |
| `/pharmacy` | Pharmacy | Manage medicine stock, prescriptions |
| `/clearpendingsdues` | ClearDues | View and settle patient dues |
| `/analyzeprofit` | AnalyzeProfits | Doctor/department earnings, top medicines by profit |
| `/reports` | ReportsAndDiagnostics | Symptom/diagnosis trends, patient reports |

## API Overview

Grouped by domain (full details in `index.js`):

- **Patients** — `/registerPatient`, `/checkpatient`, `/getpatientreport/:patientid`
- **Doctors** — `/getDoctors`, `/getalldoctors`, `/addDoctor`, `/editDoctorInfo/:id`, `/deleteDoctor/:id`, `/getFreeDoctors`, `/getDualDoctors`, `/viewDoctorDetails/:id`, `/viewDoctorAvailability/:id`, `/editDoctorAvailability/:timeID`, `/viewDoctorCharges/:id`, `/editDoctorCharges/:chargeID`, `/getDoctorTotalEarnings/:id`, `/getdoctortotal`
- **Sessions** — `/schedulesession`, `/cancelsession`, `/getsessions`, `/getSessionDetails`, `/getBookedSessions`, `/getCancelledSessions`, `/getCompletedSessions`
- **Diagnosis & Symptoms** — `/adddiagnosis`, `/editdiagnosis/:diagnosisid`, `/deletediagnosis/:diagnosisid`, `/viewdiagnosis/:diagnosisid`, `/getDiagnoses`, `/getSymptoms`, `/addSessionDiagnosis`, `/addSessionSymptom`, `/getDiagLessSessions`, `/getSymLessSessions`, `/getDocLessSessions`, `/patientsymptomsdiagnosis`, `/patientsbydisease`, `/patientsbysymptom`, `/mostcommondiseases`, `/mostcommonsymptoms`, `/getdiagnosissuggestion`
- **Suggestions** — `/addsuggestion`, `/editsuggestion/:suggestionid`, `/deletesuggestion/:suggestionid`, `/viewsuggestion/:suggestionid`, `/allsuggestions`
- **Pharmacy** — `/getMedicines`, `/addMedicine`, `/addMedicineStock`, `/top5medUsed`, `/top5MedProfits`
- **Prescriptions** — `/addPrescription`, `/handlePrescriptionDecision`
- **Billing** — `/dues`, `/gettotal`, `/getunpaidsessions`, `/getdepartmenttotal`
- **Departments** — `/getalldepartments`

## Setup & Installation

### Prerequisites
- Node.js v18+
- Microsoft SQL Server (Express edition works fine)
- ODBC Driver 17 for SQL Server
- npm

### 1. Database Setup
1. Create a database named `Medicare` in your SQL Server instance.
2. Run `drafts/ddl_new.sql` first to create all tables and constraints.
3. Then run `drafts/dbfunctions2.sql` to create all stored procedures.
4. Update `dbconfig.js` with your SQL Server instance name:
   ```js
   const config = {
       connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=YOUR_SERVER\\SQLEXPRESS;Database=Medicare;Trusted_Connection=yes;TrustServerCertificate=yes;'
   };
   module.exports = config;
   ```

### 2. Backend Setup
```bash
cd Medicare
npm ci
node index.js
```
The server runs on `http://localhost:3000`.

### 3. Frontend Setup
```bash
cd Medicare/frontend
npm ci
npm run dev
```
The frontend runs on the Vite dev server (default `http://localhost:5173`).

> `npm ci` is used instead of `npm install` since `package-lock.json` files are already committed — it installs the exact locked versions and keeps every setup identical.

## Notes
- `dbconfig.js` contains machine-specific connection details — update it to match your local SQL Server instance name before running.
- Ensure SQL Server allows Windows Authentication (`Trusted_Connection=yes`), or adjust the connection string for SQL authentication if needed.
- Run `drafts/ddl_new.sql` before `drafts/dbfunctions2.sql` — the stored procedures depend on the tables existing first.

## License
This project is intended for educational/academic purposes.
