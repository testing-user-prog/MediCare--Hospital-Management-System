import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

/* ─── design system — mirrors BookAppointment / CancelAppointment ─── */
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
        border-color: #10b981;
        box-shadow: 0 0 0 4px rgba(16,185,129,0.10);
        background: white;
    }
    .appt-input::placeholder { color: #94a3b8; font-weight: 500; }

    input[type="date"].appt-input {
        font-size: 0.95rem;
        font-family: 'Outfit', sans-serif;
        font-weight: 700;
        color: #0f172a;
        padding: 0 16px;
    }
    input[type="date"].appt-input::-webkit-calendar-picker-indicator {
        width: 36px;
        height: 36px;
        padding: 4px;
        cursor: pointer;
        opacity: 0.65;
        border-radius: 8px;
        transition: opacity 0.2s, background 0.2s;
    }
    input[type="date"].appt-input::-webkit-calendar-picker-indicator:hover {
        opacity: 1;
        background: rgba(16,185,129,0.10);
    }
    input[type="date"].appt-input::-webkit-datetime-edit,
    input[type="date"].appt-input::-webkit-datetime-edit-fields-wrapper {
        font-size: 0.95rem;
        font-family: 'Outfit', sans-serif;
        font-weight: 700;
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
    .appt-btn-success:active { transform: translateY(0); }

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
    .back-btn:hover { color: #10b981; }

    .tab-pill {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 18px;
        border-radius: 99px;
        font-family: 'Outfit', sans-serif;
        font-size: 0.9rem;
        font-weight: 800;
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.2s;
        letter-spacing: -0.2px;
    }
    .tab-pill-active {
        background: #10b981;
        color: white;
        box-shadow: 0 8px 24px rgba(16,185,129,0.30);
    }
    .tab-pill-inactive {
        background: white;
        color: #64748b;
        border-color: #e2e8f0;
    }
    .tab-pill-inactive:hover {
        border-color: #10b981;
        color: #10b981;
    }

    .profit-row { transition: background 0.18s; }
    .profit-row:hover { background: #f0fdf4; }
`

function Analyze() {
    const navigate = useNavigate()

    /* ── original state — unchanged ── */
    const [step, setstep] = useState('ask')
    const [outputfield, setoutput] = useState('')
    const [details, setdetails] = useState([])
    const [startdate, setstartdate] = useState('')
    const [enddate, setenddate] = useState('')
    const [id, getid] = useState()
    const [validids, setvalidids] = useState([])
    const [total, settotal] = useState(0)
    const [ondisplay, setdisplay] = useState(0)

    useEffect(() => {
        const tag = document.createElement('style')
        tag.textContent = GLOBAL_STYLE
        document.head.appendChild(tag)
        return () => document.head.removeChild(tag)
    }, [])

    /* ── original logic — unchanged ── */
    async function assignstate() {
        setdisplay(0)
        if (outputfield == "doctor") {
            const response = await fetch('http://localhost:3000/getalldoctors', { method: 'GET' })
            const doc_details = await response.json()
            setdetails(doc_details.data)
            let arr = []
            doc_details.data.map(x => arr.push(x.DoctorID))
            setvalidids(arr)
            setstep('doctorprocessing')
            setdisplay(1)
        } else if (outputfield == "department") {
            const response = await fetch('http://localhost:3000/getalldepartments', { method: 'GET' })
            const dept_details = await response.json()
            setdetails(dept_details.data)
            let arr = []
            dept_details.data.map(x => arr.push(x.DepartmentID))
            setvalidids(arr)
            setstep('departmentprocessing')
            setdisplay(1)
        } else {
            toast.warn('Please select a field first.')
        }
    }

    async function findtotalearnings() {
        if (outputfield === 'doctor') {
            if (id === undefined || id === '') { setstep('error'); settotal(0) }
            else if (validids.indexOf(Number(id)) == -1) { setstep('error'); settotal(0) }
            else if (startdate === '' || enddate === '') { setstep('dateerror') }
            else {
                const response = await fetch('http://localhost:3000/getdoctortotal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ doctorid: Number(id), startdate, enddate })
                })
                const data = await response.json()
                settotal(data.total)
                setstep('output')
            }
        } else if (outputfield === 'department') {
            if (id === undefined || id === '') { setstep('error'); settotal(0) }
            else if (validids.indexOf(Number(id)) == -1) { setstep('error'); settotal(0) }
            else if (startdate === '' || enddate === '') { setstep('dateerror') }
            else {
                const response = await fetch('http://localhost:3000/getdepartmenttotal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dept_id: Number(id), startdate, enddate })
                })
                const data = await response.json()
                settotal(data.total)
                setstep('output')
            }
        }
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

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Outfit', sans-serif", background: '#f8fafc', overflowY: 'auto' }}>
            <ToastContainer theme="light" position="top-right" />
            <Header />

            <main style={{ flexGrow: 1, maxWidth: '1600px', width: '100%', margin: '0 auto', padding: '16px 36px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

                {/* Hero banner */}
                <section style={{
                    background: 'white', borderRadius: '22px', padding: '22px 36px',
                    border: '1.5px solid #f1f5f9', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)', flexShrink: 0
                }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1px', lineHeight: 1.1 }}>
                            Analyze <span style={{ color: '#10b981' }}>Profits</span>
                        </h1>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px', fontWeight: '500' }}>
                            View total earnings by doctor or department over a custom date range.
                        </p>
                    </div>
                    <div style={{ fontSize: '2.8rem', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.10))' }}>📈</div>
                </section>

                {/* Tab selector */}
                <div className="appt-card" style={{ padding: '20px 28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', background: 'rgba(16,185,129,0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                            </svg>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>Select Analysis Type</h3>
                            <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500', marginTop: '3px' }}>Choose whether to analyze by doctor or by department</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {/* Doctor tab */}
                        <button
                            className={`tab-pill ${outputfield === 'doctor' ? 'tab-pill-active' : 'tab-pill-inactive'}`}
                            onClick={() => { setoutput('doctor'); setstep('ask'); setdisplay(0) }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                            By Doctor
                        </button>

                        {/* Department tab */}
                        <button
                            className={`tab-pill ${outputfield === 'department' ? 'tab-pill-active' : 'tab-pill-inactive'}`}
                            onClick={() => { setoutput('department'); setstep('ask'); setdisplay(0) }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                            </svg>
                            By Department
                        </button>
                    </div>

                    {outputfield && step === 'ask' && (
                        <button className="appt-btn-success" style={{ maxWidth: '320px' }} onClick={assignstate}>
                            Load {outputfield === 'doctor' ? 'Doctors' : 'Departments'} →
                        </button>
                    )}
                </div>

                {/* Doctor table */}
                {ondisplay === 1 && outputfield === 'doctor' && (
                    <div className="appt-card" style={{ padding: '20px 28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ width: '36px', height: '36px', background: 'rgba(16,185,129,0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>Doctors Directory</h3>
                                <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500', marginTop: '3px' }}>Select a Doctor ID to use below</p>
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1.5px solid #f1f5f9' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Outfit', sans-serif" }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        {['Doctor ID', 'Name', 'Age', 'Gender', 'Specialization'].map((h, i) => (
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
                                    {details.map((doctor, i) => (
                                        <tr key={doctor.DoctorID} className="profit-row" style={{ borderBottom: i < details.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                                            <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                                <span style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', fontWeight: '900', fontSize: '1rem', padding: '4px 14px', borderRadius: '99px' }}>
                                                    #{doctor.DoctorID}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>{doctor.Name}</td>
                                            <td style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>{doctor.Age}</td>
                                            <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                                <span style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700', padding: '4px 14px', borderRadius: '99px', fontSize: '0.95rem' }}>
                                                    {doctor.Gender}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>{doctor.Specialization}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Department table */}
                {ondisplay === 1 && outputfield === 'department' && (
                    <div className="appt-card" style={{ padding: '20px 28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ width: '36px', height: '36px', background: 'rgba(16,185,129,0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                                </svg>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>Departments Directory</h3>
                                <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500', marginTop: '3px' }}>Select a Department ID to use below</p>
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1.5px solid #f1f5f9' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Outfit', sans-serif" }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        {['Department ID', 'Name', 'Floor'].map((h, i) => (
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
                                    {details.map((dept, i) => (
                                        <tr key={dept.DepartmentID} className="profit-row" style={{ borderBottom: i < details.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                                            <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                                <span style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', fontWeight: '900', fontSize: '1rem', padding: '4px 14px', borderRadius: '99px' }}>
                                                    #{dept.DepartmentID}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>{dept.Name}</td>
                                            <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                                <span style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700', padding: '4px 14px', borderRadius: '99px', fontSize: '0.95rem' }}>
                                                    Floor {dept.Floor}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Query parameters form */}
                {ondisplay === 1 && (
                    <div className="appt-card" style={{ padding: '20px 28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                            <div style={{ width: '36px', height: '36px', background: 'rgba(16,185,129,0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>Input Parameters</h3>
                                <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500', marginTop: '3px' }}>
                                    Enter an ID and date range to calculate total earnings
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                            <div>
                                <label className="appt-label">{outputfield === 'doctor' ? 'Doctor ID' : 'Department ID'}</label>
                                <input
                                    type="number"
                                    className="appt-input"
                                    placeholder={`Enter ${outputfield === 'doctor' ? 'Doctor' : 'Dept'} ID`}
                                    value={id}
                                    onChange={e => getid(e.target.value)}
                                    style={{ textAlign: 'center' }}
                                />
                            </div>
                            <div>
                                <label className="appt-label">Start Date</label>
                                <input
                                    type="date"
                                    className="appt-input"
                                    value={startdate}
                                    onChange={e => setstartdate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="appt-label">End Date</label>
                                <input
                                    type="date"
                                    className="appt-input"
                                    value={enddate}
                                    onChange={e => setenddate(e.target.value)}
                                />
                            </div>
                        </div>

                        <button className="appt-btn-success" style={{ marginBottom: '14px' }} onClick={findtotalearnings}>
                            Analyze Earnings →
                        </button>

                        {/* Inline errors */}
                        {step === 'error' && (
                            <div style={{ background: '#fee2e2', border: '1.5px solid #fecaca', borderRadius: '14px', padding: '10px 14px', color: '#dc2626', fontWeight: '700', fontSize: '1rem' }}>
                                ⚠ Invalid ID — please select a valid ID from the table above.
                            </div>
                        )}
                        {step === 'dateerror' && (
                            <div style={{ background: '#fef3c7', border: '1.5px solid #fde68a', borderRadius: '14px', padding: '10px 14px', color: '#d97706', fontWeight: '700', fontSize: '1rem' }}>
                                ⚠ Please select both a start and end date.
                            </div>
                        )}
                    </div>
                )}

                {/* Result card */}
                {step === 'output' && (
                    <div style={{
                        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                        border: '2px solid #6ee7b7',
                        borderRadius: '18px',
                        padding: '40px 60px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '30px',
                        animation: 'slideUp 0.4s ease both'
                    }}>
                        <div style={{ width: '72px', height: '48px', background: '#10b981', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </div>
                        <div>
                            <p style={{ fontSize: '1rem', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px' }}>
                                Total Earnings — {outputfield === 'doctor' ? `Doctor #${id}` : `Department #${id}`}
                            </p>
                            <p style={{ fontSize: '2rem', fontWeight: '900', color: '#065f46', margin: 0, letterSpacing: '-1.5px', lineHeight: 1 }}>
                                Rs. {Number(total).toLocaleString()}
                            </p>
                            <p style={{ fontSize: '1rem', color: '#059669', fontWeight: '600', marginTop: '6px' }}>
                                {startdate} → {enddate}
                            </p>
                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}

export default Analyze