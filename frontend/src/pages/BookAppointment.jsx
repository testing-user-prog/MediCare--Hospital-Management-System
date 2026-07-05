import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatTime, formatDate } from '../utils'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

/* ─── inject Outfit font + global keyframes (mirrors Home.jsx) ─── */
const GLOBAL_STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { height: 100%; background: #f8fafc; overflow: auto; }

    @keyframes slideUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
    }

    .appt-card {
        background: white;
        border-radius: 18px;
        border: 1.5px solid #f1f5f9;
        box-shadow: 0 8px 30px rgba(0,0,0,0.03);
        animation: slideUp 0.55s cubic-bezier(0.23,1,0.32,1) both;
    }

    .appt-input {
        width: 100%;
        height: 48px;
        border-radius: 10px;
        border: 2px solid #e2e8f0;
        padding: 0 14px;
        font-family: 'Outfit', sans-serif;
        font-size: 0.95rem;
        font-weight: 600;
        color: #0f172a;
        background: #fafbfc;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    .appt-input:focus {
        border-color: #4f46e5;
        box-shadow: 0 0 0 4px rgba(79,70,229,0.10);
        background: white;
    }
    .appt-input::placeholder { color: #94a3b8; font-weight: 500; }

    .appt-select {
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 20px center;
        background-size: 22px 22px;
        padding-right: 52px;
        cursor: pointer;
    }

    .appt-btn-primary {
        height: 48px;
        width: 100%;
        border: none;
        border-radius: 10px;
        background: #4f46e5;
        color: white;
        font-family: 'Outfit', sans-serif;
        font-size: 0.95rem;
        font-weight: 800;
        cursor: pointer;
        transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        letter-spacing: -0.3px;
    }
    .appt-btn-primary:hover {
        background: #4338ca;
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(79,70,229,0.28);
    }
    .appt-btn-primary:active { transform: translateY(0); }

    .appt-btn-secondary {
        height: 48px;
        padding: 0 18px;
        border: 2px solid #4f46e5;
        border-radius: 10px;
        background: white;
        color: #4f46e5;
        font-family: 'Outfit', sans-serif;
        font-size: 0.9rem;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
    }
    .appt-btn-secondary:hover {
        background: #4f46e5;
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(79,70,229,0.22);
    }

    .appt-btn-success {
        height: 48px;
        width: 100%;
        border: none;
        border-radius: 10px;
        background: #10b981;
        color: white;
        font-family: 'Outfit', sans-serif;
        font-size: 0.95rem;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s;
        letter-spacing: -0.3px;
    }
    .appt-btn-success:hover {
        background: #059669;
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(16,185,129,0.28);
    }

    .appt-label {
        display: block;
        font-family: 'Outfit', sans-serif;
        font-size: 1rem;
        font-weight: 800;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 6px;
    }

    input[type="date"].appt-input,
    input[type="time"].appt-input {
        font-size: 1rem;
        font-family: 'Outfit', sans-serif;
        font-weight: 700;
        color: #0f172a;
        padding: 0 16px;
    }
    input[type="date"].appt-input::-webkit-calendar-picker-indicator,
    input[type="time"].appt-input::-webkit-calendar-picker-indicator {
        width: 36px;
        height: 36px;
        padding: 4px;
        cursor: pointer;
        opacity: 0.65;
        border-radius: 8px;
        transition: opacity 0.2s, background 0.2s;
    }
    input[type="date"].appt-input::-webkit-calendar-picker-indicator:hover,
    input[type="time"].appt-input::-webkit-calendar-picker-indicator:hover {
        opacity: 1;
        background: rgba(79,70,229,0.08);
    }
    input[type="date"].appt-input::-webkit-datetime-edit,
    input[type="time"].appt-input::-webkit-datetime-edit {
        font-size: 1rem;
        font-family: 'Outfit', sans-serif;
        font-weight: 700;
    }
    input[type="date"].appt-input::-webkit-datetime-edit-fields-wrapper,
    input[type="time"].appt-input::-webkit-datetime-edit-fields-wrapper {
        font-size: 1rem;
        font-weight: 700;
    }

    .doctor-row {
        transition: background 0.18s;
        cursor: default;
    }
    .doctor-row:hover { background: #f8faff; }

    .slot-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        background: #f1f5f9;
        border-radius: 99px;
        font-size: 1rem;
        font-weight: 700;
        color: #475569;
    }

    .back-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: none;
        border: none;
        font-family: 'Outfit', sans-serif;
        font-size: 1rem;
        font-weight: 700;
        color: #64748b;
        cursor: pointer;
        padding: 8px 0;
        transition: color 0.2s;
    }
    .back-btn:hover { color: #4f46e5; }

    .success-banner {
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        border: 2px solid #6ee7b7;
        border-radius: 24px;
        padding: 16px 22px;
        display: flex;
        align-items: center;
        gap: 20px;
        animation: slideUp 0.4s ease both;
    }
`

/* ── Validation helpers ── */

/** Validates CNIC format: 00000-0000000-0 (exactly 5-7-1 digits with dashes) */
function validateCnic(value) {
    return /^\d{5}-\d{7}-\d$/.test(value.trim())
}

/** Auto-formats a raw digit string into CNIC format as the user types */
function formatCnicInput(raw) {
    // Strip everything except digits
    const digits = raw.replace(/\D/g, '').slice(0, 13)
    if (digits.length <= 5) return digits
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
}

/** Normalises blood group to uppercase and validates known groups */
const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
function validateBloodGroup(value) {
    return VALID_BLOOD_GROUPS.includes(value.trim().toUpperCase())
}

/** Returns today's date string as YYYY-MM-DD (local time) */
function todayStr() {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

/** Returns current time string as HH:MM (local time) */
function nowTimeStr() {
    const d = new Date()
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Returns true if the chosen date+time combination is strictly in the future */
function isDateTimeInFuture(dateStr, timeStr) {
    if (!dateStr || !timeStr) return false
    const chosen = new Date(`${dateStr}T${timeStr}`)
    return chosen > new Date()
}

/* ══════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                */
/* ══════════════════════════════════════════════════════════════ */
function BookAppointment() {
    const navigate = useNavigate()
    const [cnic, setCnic] = useState('')
    const [doctors, setDoctors] = useState([])
    const [validDocIds, setValidDocIds] = useState([])
    const [docid, setDocid] = useState('')
    const [docSessions, setDocSessions] = useState([])
    const [apptResult, setApptResult] = useState(null)
    const [errorMsg, setErrorMsg] = useState('')
    const [step, setStep] = useState('cnic')
    const [showSessions, setShowSessions] = useState(false)

    useEffect(() => {
        const tag = document.createElement('style')
        tag.textContent = GLOBAL_STYLE
        document.head.appendChild(tag)
        return () => document.head.removeChild(tag)
    }, [])

    /* ── API helpers ── */
    async function patientexists() {
        const res = await fetch('http://localhost:3000/checkpatient', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cnic })
        })
        return res.json()
    }

    async function checkpatient(e) {
        if (e) e.preventDefault()
        setErrorMsg('')

        if (!cnic.trim()) {
            toast.error('Please enter a Patient CNIC.')
            return
        }
        // ── VALIDATION: CNIC format ──
        if (!validateCnic(cnic)) {
            toast.error('Invalid CNIC format. Please use the format: 00000-0000000-0')
            return
        }

        const patients = await patientexists()
        if (patients.data.length === 0) setStep('register')
        else await bookappointment()
    }

    async function registerPatient(name, age, gender, bloodGroup, phone) {
        // Validation is now handled inside RegisterForm; this is the final submit.
        await fetch('http://localhost:3000/registerPatient', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cnic, name, phone, gender, age, bloodGroup: bloodGroup.toUpperCase() })
        })
        await bookappointment()
    }

    async function bookappointment() {
        const res = await fetch('http://localhost:3000/getDoctors')
        const result = await res.json()
        setDoctors(result.details)
        setValidDocIds(result.details.map(d => Number(d.DoctorID)))
        setStep('doctors')
    }

    async function checkdoctorsessions(e) {
        if (e) e.preventDefault()
        if (!docid) { toast.error('Please enter a Doctor ID.'); return }
        if (!validDocIds.includes(Number(docid))) {
            toast.error(`Doctor ID ${docid} not found. Please select an ID from the list.`)
            setShowSessions(false); return
        }
        const res = await fetch('http://localhost:3000/getSessionDetails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ docid })
        })
        const result = await res.json()
        setDocSessions(result.sessdetails)
        setShowSessions(true)
    }

    async function schedulesession(sessiontype, sessiondate, starttime) {
        setErrorMsg('')
        if (!sessiontype || !sessiondate || !starttime) {
            setErrorMsg('Please fill all booking details.'); return
        }
        // ── VALIDATION: date+time must not be in the past ──
        if (!isDateTimeInFuture(sessiondate, starttime)) {
            toast.error('Please select a future date and time. Past slots cannot be booked.')
            return
        }
        const res = await fetch('http://localhost:3000/schedulesession', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doctorid: docid, sessiontype, sessiondate, starttime, cnic })
        })
        const result = await res.json()
        if (result.success === false) setErrorMsg(result.message)
        else { setApptResult(result.message[0]); setStep('booked') }
    }

    /* ── shared header ── */
    const Header = () => (
        <header style={{
            height: '56px', padding: '0 36px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', background: 'white',
            borderBottom: '2px solid #f1f5f9', flexShrink: 0
        }}>
            <button className="back-btn" onClick={() => navigate('/')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Dashboard
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '32px', height: '32px', backgroundColor: '#4f46e5', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                </div>
                <span style={{ fontWeight: '900', fontSize: '1.15rem', color: '#0f172a', letterSpacing: '-0.5px' }}>
                    MediCare <span style={{ color: '#4f46e5' }}>HMS</span>
                </span>
            </div>
        </header>
    )

    /* ── hero banner ── */
    const HeroBanner = ({ subtitle }) => (
        <section style={{
            background: 'white', borderRadius: '22px', padding: '22px 36px',
            border: '1.5px solid #f1f5f9', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)', marginBottom: '30px', flexShrink: 0
        }}>
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1px', lineHeight: 1.1 }}>
                    Book <span style={{ color: '#4f46e5' }}>Appointment</span>
                </h1>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px', fontWeight: '500' }}>{subtitle}</p>
            </div>
            <div style={{ fontSize: '2.8rem', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.10))' }}>📅</div>
        </section>
    )

    /* ════════════════════════════════════════════════════════════
       STEP: CNIC
    ════════════════════════════════════════════════════════════ */
    if (step === 'cnic') return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Outfit', sans-serif", background: '#f8fafc' }}>
            <ToastContainer theme="light" position="top-right" />
            <Header />
            <main style={{ flexGrow: 1, maxWidth: '1600px', width: '100%', margin: '0 auto', padding: '16px 36px', display: 'flex', flexDirection: 'column' }}>
                <HeroBanner subtitle="Enter patient CNIC to check records or register a new patient." />

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <div className="appt-card" style={{ padding: '28px 36px', width: '100%', maxWidth: '600px', animationDelay: '0.1s' }}>
                        {/* Icon */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                            <div style={{ width: '36px', height: '36px', background: 'rgba(79,70,229,0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                        </div>

                        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.5px' }}>
                            Patient Lookup
                        </h2>
                        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', fontWeight: '500', marginBottom: '14px' }}>
                            Enter the CNIC to retrieve or create a patient record
                        </p>

                        <form onSubmit={checkpatient} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label className="appt-label">Patient CNIC</label>
                                <input
                                    type="text"
                                    className="appt-input"
                                    placeholder="00000-0000000-0"
                                    value={cnic}
                                    maxLength={15}
                                    onChange={e => setCnic(formatCnicInput(e.target.value))}
                                    style={{ textAlign: 'center', letterSpacing: '2px' }}
                                />
                            </div>
                            <button type="submit" className="appt-btn-primary">
                                Find Patient →
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )

    /* ════════════════════════════════════════════════════════════
       STEP: REGISTER
    ════════════════════════════════════════════════════════════ */
    if (step === 'register') return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Outfit', sans-serif", background: '#f8fafc' }}>
            <ToastContainer theme="light" position="top-right" />
            <Header />
            <main style={{ flexGrow: 1, maxWidth: '1600px', width: '100%', margin: '0 auto', padding: '16px 36px', display: 'flex', flexDirection: 'column' }}>
                <HeroBanner subtitle="New patient detected — please complete the registration form below." />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', flexGrow: 1 }}>
                    <RegisterForm onSubmit={registerPatient} />
                </div>
            </main>
        </div>
    )

    /* ════════════════════════════════════════════════════════════
       STEP: DOCTORS
    ════════════════════════════════════════════════════════════ */
    if (step === 'doctors') return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Outfit', sans-serif", background: '#f8fafc' }}>
            <ToastContainer theme="light" position="top-right" />
            <Header />
            <main style={{ flexGrow: 1, maxWidth: '1600px', width: '100%', margin: '0 auto', padding: '16px 36px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <HeroBanner subtitle="Choose a doctor and schedule your session from available slots." />

                {/* Doctor ID selector */}
                <div className="appt-card" style={{ padding: '20px 28px' }}>
                    <p className="appt-label" style={{ marginBottom: '16px' }}>Select Doctor by ID</p>
                    <form onSubmit={checkdoctorsessions} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <input
                            type="number"
                            className="appt-input"
                            placeholder="Enter Doctor ID"
                            value={docid}
                            onChange={e => { setDocid(e.target.value); setShowSessions(false) }}
                            style={{ maxWidth: '340px', textAlign: 'center' }}
                        />
                        <button type="submit" className="appt-btn-secondary" style={{ flexShrink: 0 }}>
                            View Sessions
                        </button>
                    </form>
                </div>

                {/* Session booking form */}
                {showSessions && docid && (
                    <SessionAndBookForm
                        docSessions={docSessions}
                        errorMsg={errorMsg}
                        onSubmit={schedulesession}
                    />
                )}

                {/* Doctors directory table */}
                <div className="appt-card" style={{ padding: '20px 28px' }}>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginBottom: '14px', letterSpacing: '-0.5px' }}>
                        Available Doctors Directory
                    </h3>
                    <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1.5px solid #f1f5f9' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Outfit', sans-serif" }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    {['ID', 'Name', 'Specialization', 'Day', 'Available From', 'Available To'].map((h, i) => (
                                        <th key={i} style={{
                                            padding: '10px 16px', textAlign: 'center',
                                            fontSize: '0.9rem', fontWeight: '800', color: '#94a3b8',
                                            textTransform: 'uppercase', letterSpacing: '1px',
                                            borderBottom: '1.5px solid #f1f5f9'
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {doctors.map((doctor, i) => (
                                    <tr key={doctor.DoctorID} className="doctor-row" style={{ borderBottom: i < doctors.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                            <span style={{ background: 'rgba(79,70,229,0.08)', color: '#4f46e5', fontWeight: '900', fontSize: '1rem', padding: '4px 14px', borderRadius: '99px' }}>
                                                #{doctor.DoctorID}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>{doctor.Name}</td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>{doctor.Specialization}</td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                            <span style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700', padding: '4px 14px', borderRadius: '99px', fontSize: '0.95rem' }}>
                                                {doctor.DayOfWeek}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', color: '#10b981', fontWeight: '800', fontSize: '1rem' }}>{formatTime(doctor.StartTime)}</td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', color: '#ef4444', fontWeight: '800', fontSize: '1rem' }}>{formatTime(doctor.EndTime)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )

    /* ════════════════════════════════════════════════════════════
       STEP: BOOKED
    ════════════════════════════════════════════════════════════ */
    if (step === 'booked' && apptResult) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Outfit', sans-serif", background: '#f8fafc' }}>
            <ToastContainer theme="light" position="top-right" />
            <Header />
            <main style={{ flexGrow: 1, maxWidth: '1600px', width: '100%', margin: '0 auto', padding: '16px 36px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Success banner */}
                <div className="success-banner">
                    <div style={{ width: '44px', height: '44px', background: '#10b981', borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#065f46', margin: 0, letterSpacing: '-0.5px' }}>
                            Appointment Confirmed!
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: '#047857', fontWeight: '600', marginTop: '4px' }}>
                            The session has been successfully scheduled. Details are below.
                        </p>
                    </div>
                </div>

                {/* Booking detail cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                    {[
                        { label: 'Patient', value: apptResult.PatientName, icon: '👤', color: '#4f46e5' },
                        { label: 'Doctor', value: apptResult.DoctorName, icon: '🩺', color: '#0ea5e9' },
                        { label: 'Session Type', value: apptResult.SessionType, icon: '📋', color: '#8b5cf6' },
                        { label: 'Date', value: formatDate(apptResult.SessionDate), icon: '📅', color: '#f59e0b' },
                        { label: 'Time', value: `${formatTime(apptResult.StartTime)} – ${formatTime(apptResult.EndTime)}`, icon: '🕐', color: '#10b981' },
                        { label: 'Charges', value: `Rs. ${apptResult.SessionCharges}`, icon: '💳', color: '#ef4444' },
                    ].map((item, i) => (
                        <div key={i} className="appt-card" style={{ padding: '18px 22px', animationDelay: `${i * 0.07}s` }}>
                            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{item.icon}</div>
                            <p style={{ fontSize: '0.9rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{item.label}</p>
                            <p style={{ fontSize: '1.15rem', fontWeight: '900', color: item.color, letterSpacing: '-0.5px', margin: 0 }}>{item.value}</p>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '20px' }}>
                    <button className="appt-btn-primary" style={{ maxWidth: '280px' }} onClick={() => { setCnic(''); setDocid(''); setStep('cnic') }}>
                        Book Another Appointment
                    </button>
                    <button className="appt-btn-secondary" onClick={() => navigate('/')}>
                        Back to Dashboard
                    </button>
                </div>
            </main>
        </div>
    )

    return null
}

/* ══════════════════════════════════════════════════════════════ */
/*  REGISTER FORM                                                 */
/* ══════════════════════════════════════════════════════════════ */
function RegisterForm({ onSubmit }) {
    const [name, setName] = useState('')
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('')
    const [bloodGroup, setBloodGroup] = useState('')
    const [phone, setPhone] = useState('')

    function handleSubmit(e) {
        e.preventDefault()

        if (!name.trim()) { toast.error('Please enter the patient\'s full name.'); return }
        if (!age || Number(age) <= 0 || Number(age) > 150) {
            toast.error('Please enter a valid age (1–150).'); return
        }
        if (!gender) { toast.error('Please select a gender.'); return }
        if (!phone.trim()) { toast.error('Please enter a phone number.'); return }

        // ── VALIDATION: blood group (case-insensitive) ──
        if (!validateBloodGroup(bloodGroup)) {
            toast.error('Invalid blood group. Valid values: A+, A−, B+, B−, AB+, AB−, O+, O−  (upper or lower case accepted)')
            return
        }

        onSubmit(name.trim(), age, gender, bloodGroup.trim().toUpperCase(), phone.trim())
    }

    return (
        <div className="appt-card" style={{ padding: '28px 36px', width: '100%', maxWidth: '720px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(79,70,229,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                </div>
                <div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1px' }}>New Patient Registration</h2>
                    <p style={{ fontSize: '1.05rem', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>Fill in the details to register and proceed to booking</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                    <label className="appt-label">Full Name</label>
                    <input className="appt-input" placeholder="Muhammad Ali" value={name} onChange={e => setName(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                        <label className="appt-label">Age</label>
                        <input
                            type="number"
                            className="appt-input"
                            placeholder="32"
                            min="1"
                            max="150"
                            value={age}
                            onChange={e => setAge(e.target.value)}
                            style={{ textAlign: 'center' }}
                        />
                    </div>
                    <div>
                        <label className="appt-label">Gender</label>
                        <select className="appt-input appt-select" value={gender} onChange={e => setGender(e.target.value)}>
                            <option value="">Select</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                        </select>
                    </div>
                    <div>
                        <label className="appt-label">Blood Group</label>
                        {/* Live-uppercase as the user types; hint shown below the field */}
                        <input
                            className="appt-input"
                            placeholder="e.g. O+ or ab-"
                            value={bloodGroup}
                            onChange={e => setBloodGroup(e.target.value.toUpperCase())}
                            style={{ textAlign: 'center' }}
                        />
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '600', marginTop: '4px', textAlign: 'center' }}>
                            A± · B± · AB± · O±
                        </p>
                    </div>
                </div>

                <div>
                    <label className="appt-label">Phone Number</label>
                    <input className="appt-input" placeholder="03XX-XXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>

                <button type="submit" className="appt-btn-primary" style={{ marginTop: '8px' }}>
                    Register & Continue to Booking →
                </button>
            </form>
        </div>
    )
}

/* ══════════════════════════════════════════════════════════════ */
/*  SESSION + BOOKING FORM                                        */
/* ══════════════════════════════════════════════════════════════ */
function SessionAndBookForm({ docSessions, errorMsg, onSubmit }) {
    const [sessiontype, setSessiontype] = useState('')
    const [sessiondate, setSessiondate] = useState('')
    const [starttime, setStarttime] = useState('')

    function handleSubmit(e) {
        e.preventDefault()

        if (!sessiontype) { toast.error('Please select a session type.'); return }
        if (!sessiondate) { toast.error('Please select a date.'); return }
        if (!starttime) { toast.error('Please select a start time.'); return }

        // ── VALIDATION: date+time must be in the future ──
        if (!isDateTimeInFuture(sessiondate, starttime)) {
            toast.error('Please select a future date and time. Past slots cannot be booked.')
            return
        }

        onSubmit(sessiontype, sessiondate, starttime)
    }

    return (
        <div className="appt-card" style={{ padding: '22px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(16,185,129,0.08)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                </div>
                <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.4px' }}>Schedule Session</h2>
                    <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>Pick your session type, date and start time</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                    <div>
                        <label className="appt-label">Session Type</label>
                        <select className="appt-input appt-select" value={sessiontype} onChange={e => setSessiontype(e.target.value)}>
                            <option value="">Select type</option>
                            <option value="Consultation">Consultation</option>
                            <option value="Operation">Operation</option>
                        </select>
                    </div>
                    <div>
                        <label className="appt-label">Preferred Date</label>
                        {/* min attribute prevents picking past dates at the browser level */}
                        <input
                            type="date"
                            className="appt-input"
                            value={sessiondate}
                            min={todayStr()}
                            onChange={e => setSessiondate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="appt-label">Start Time</label>
                        {/*
                          If the user selects today, restrict the time min to now.
                          For future dates no min is needed (any time tomorrow is valid).
                        */}
                        <input
                            type="time"
                            className="appt-input"
                            value={starttime}
                            min={sessiondate === todayStr() ? nowTimeStr() : undefined}
                            onChange={e => setStarttime(e.target.value)}
                        />
                    </div>
                </div>

                {errorMsg && (
                    <div style={{ background: '#fee2e2', border: '1.5px solid #fecaca', borderRadius: '14px', padding: '10px 14px', marginBottom: '14px', color: '#dc2626', fontWeight: '700', fontSize: '1rem' }}>
                        ⚠ {errorMsg}
                    </div>
                )}

                <button type="submit" className="appt-btn-success">
                    Confirm Session →
                </button>
            </form>

            {/* Booked slots */}
            <div style={{ marginTop: '40px', paddingTop: '36px', borderTop: '1.5px solid #f1f5f9' }}>
                <h4 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', marginBottom: '18px', letterSpacing: '-0.3px' }}>
                    Currently Booked Slots
                </h4>
                {docSessions.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontWeight: '600', fontSize: '1.05rem' }}>No active bookings yet for this doctor.</p>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {docSessions.map((s, i) => (
                            <div key={i} className="slot-chip">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                </svg>
                                {formatDate(s.SessionDate)} &nbsp;·&nbsp; {formatTime(s.StartTime)} – {formatTime(s.EndTime)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default BookAppointment