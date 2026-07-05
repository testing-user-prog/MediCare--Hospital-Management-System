import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatTime, formatDate } from '../utils'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

/* ─── design system — mirrors BookAppointment.jsx exactly ─── */
const GLOBAL_STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { height: 100%; background: #f8fafc; overflow: auto; }

    @keyframes slideUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
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
        border-color: #ef4444;
        box-shadow: 0 0 0 4px rgba(239,68,68,0.10);
        background: white;
    }
    .appt-input::placeholder { color: #94a3b8; font-weight: 500; }

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

    .appt-btn-danger {
        height: 48px;
        width: 100%;
        border: none;
        border-radius: 10px;
        background: #ef4444;
        color: white;
        font-family: 'Outfit', sans-serif;
        font-size: 0.95rem;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s;
        letter-spacing: -0.3px;
    }
    .appt-btn-danger:hover {
        background: #dc2626;
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(239,68,68,0.30);
    }
    .appt-btn-danger:active { transform: translateY(0); }

    .appt-btn-secondary {
        height: 48px;
        padding: 0 20px;
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
    .back-btn:hover { color: #ef4444; }

    .cancel-row {
        transition: background 0.18s;
    }
    .cancel-row:hover { background: #fff5f5; }
`

function CancelAppointment() {
    const navigate = useNavigate()

    const [cnic, setCnic] = useState('')
    const [sessions, setSessions] = useState([])
    const [sessionIDs, setSessionIDs] = useState([])
    const [delid, setDelid] = useState('')
    const [message, setMessage] = useState('')
    const [step, setStep] = useState('cnic')

    useEffect(() => {
        const tag = document.createElement('style')
        tag.textContent = GLOBAL_STYLE
        document.head.appendChild(tag)
        return () => document.head.removeChild(tag)
    }, [])

    /* ── original logic — unchanged ── */
    async function displaysessionstodelete() {
        setMessage('')
        const res1 = await fetch('http://localhost:3000/checkpatient', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cnic })
        })
        const patients = await res1.json()

        if (patients.data.length == 0) {
            setMessage('Patient does not have a record!')
            setStep('done')
            return
        }

        const res2 = await fetch('http://localhost:3000/getsessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cnic })
        })
        const result = await res2.json()

        if (result.data.length == 0) {
            setMessage('Patient does not have any appointments!')
            setStep('done')
            return
        }

        setSessions(result.data)
        setSessionIDs(result.data.map(x => x.SessionID))
        setStep('sessions')
    }

    async function deletesession() {
        const idtodelete = parseInt(delid)
        if (sessionIDs.indexOf(idtodelete) > -1) {
            const response = await fetch('http://localhost:3000/cancelsession', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionid: idtodelete })
            })
            const result = await response.json()
            setMessage(result.message)
            setStep('done')
        } else {
            setMessage('Invalid Session ID')
            setStep('done')
        }
    }

    const isError = msg => ['Invalid Session ID', 'Patient does not have a record!', 'Patient does not have any appointments!'].includes(msg)

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
                    Cancel <span style={{ color: '#ef4444' }}>Appointment</span>
                </h1>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px', fontWeight: '500' }}>{subtitle}</p>
            </div>
            <div style={{ fontSize: '2.8rem', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.10))' }}>🗓️</div>
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
                <HeroBanner subtitle="Enter patient CNIC to look up their existing appointments." />

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <div className="appt-card" style={{ padding: '28px 36px', width: '100%', maxWidth: '600px' }}>

                        {/* Icon */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                            <div style={{ width: '36px', height: '36px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                            </div>
                        </div>

                        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.5px' }}>
                            Patient Lookup
                        </h2>
                        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', fontWeight: '500', marginBottom: '14px' }}>
                            Enter the CNIC to retrieve appointments for cancellation
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label className="appt-label">Patient CNIC</label>
                                <input
                                    type="text"
                                    className="appt-input"
                                    placeholder="00000-0000000-0"
                                    value={cnic}
                                    onChange={e => setCnic(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && displaysessionstodelete()}
                                    style={{ textAlign: 'center', letterSpacing: '2px' }}
                                />
                            </div>
                            <button className="appt-btn-primary" onClick={displaysessionstodelete}>
                                Find Appointments →
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )

    /* ════════════════════════════════════════════════════════════
       STEP: SESSIONS
    ════════════════════════════════════════════════════════════ */
    if (step === 'sessions') return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Outfit', sans-serif", background: '#f8fafc' }}>
            <ToastContainer theme="light" position="top-right" />
            <Header />
            <main style={{ flexGrow: 1, maxWidth: '1600px', width: '100%', margin: '0 auto', padding: '16px 36px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <HeroBanner subtitle="Review the sessions below and enter the Session ID you wish to cancel." />

                {/* Sessions table */}
                <div className="appt-card" style={{ padding: '20px 28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>Active Appointments</h3>
                            <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500', marginTop: '3px' }}>{sessions.length} session{sessions.length !== 1 ? 's' : ''} found for this patient</p>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1.5px solid #f1f5f9' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Outfit', sans-serif" }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    {['Session ID', 'Doctor', 'Date', 'Start Time', 'End Time', 'Room', 'Type', 'Charges'].map((h, i) => (
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
                                {sessions.map((x, i) => (
                                    <tr key={x.SessionID} className="cancel-row" style={{ borderBottom: i < sessions.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                            <span style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontWeight: '900', fontSize: '1rem', padding: '4px 14px', borderRadius: '99px' }}>
                                                #{x.SessionID}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>{x.DoctorName}</td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>{formatDate(x.SessionDate)}</td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', color: '#10b981', fontWeight: '800', fontSize: '1rem' }}>{formatTime(x.StartTime)}</td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', color: '#ef4444', fontWeight: '800', fontSize: '1rem' }}>{formatTime(x.EndTime)}</td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                            <span style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700', padding: '4px 14px', borderRadius: '99px', fontSize: '0.95rem' }}>
                                                {x.RoomID}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                            <span style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700', padding: '4px 14px', borderRadius: '99px', fontSize: '0.95rem' }}>
                                                {x.SessionType}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: '900', fontSize: '1rem', color: '#0f172a' }}>
                                            Rs. {x.SessionCharges}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cancel input */}
                <div className="appt-card" style={{ padding: '20px 28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', background: 'rgba(239,68,68,0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>Cancel a Session</h3>
                            <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500', marginTop: '3px' }}>Enter the Session ID from the table above</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                        <div style={{ flexGrow: 1 }}>
                            <label className="appt-label">Session ID to Cancel</label>
                            <input
                                type="number"
                                className="appt-input"
                                placeholder="Enter Session ID"
                                value={delid}
                                onChange={e => setDelid(e.target.value)}
                                style={{ textAlign: 'center' }}
                            />
                        </div>
                        <button className="appt-btn-danger" style={{ width: 'auto', padding: '0 40px', flexShrink: 0 }} onClick={deletesession}>
                            Cancel Session
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )

    /* ════════════════════════════════════════════════════════════
       STEP: DONE
    ════════════════════════════════════════════════════════════ */
    if (step === 'done') return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Outfit', sans-serif", background: '#f8fafc' }}>
            <ToastContainer theme="light" position="top-right" />
            <Header />
            <main style={{ flexGrow: 1, maxWidth: '1600px', width: '100%', margin: '0 auto', padding: '16px 36px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <HeroBanner subtitle={isError(message) ? 'Something went wrong. See the details below.' : 'The appointment has been successfully removed.'} />

                {/* Result banner */}
                <div style={{
                    background: isError(message)
                        ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
                        : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    border: `2px solid ${isError(message) ? '#fca5a5' : '#6ee7b7'}`,
                    borderRadius: '24px',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    animation: 'slideUp 0.4s ease both'
                }}>
                    <div style={{
                        width: '44px', height: '44px', flexShrink: 0, borderRadius: '13px',
                        background: isError(message) ? '#ef4444' : '#10b981',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {isError(message) ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '900', color: isError(message) ? '#7f1d1d' : '#065f46', margin: 0, letterSpacing: '-0.5px' }}>
                            {isError(message) ? 'Action Failed' : 'Appointment Cancelled!'}
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: isError(message) ? '#991b1b' : '#047857', fontWeight: '600', marginTop: '4px' }}>
                            {message}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '20px' }}>
                    <button className="appt-btn-danger" style={{ maxWidth: '280px' }} onClick={() => { setCnic(''); setDelid(''); setStep('cnic') }}>
                        Cancel Another
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

export default CancelAppointment