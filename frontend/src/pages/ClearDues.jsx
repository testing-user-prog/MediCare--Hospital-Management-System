import { useState } from 'react'
import { formatTime, formatDate } from '../utils'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'bootstrap/dist/css/bootstrap.min.css'

function ClearDues() {
    // ── original state — unchanged ─────────────────────────────────────────
    const [step, setStep] = useState('getID')
    const [patientID, setid] = useState()
    const [patientdataset, setdata] = useState([])
    const [cnic, setcnic] = useState('')
    const [sessdetails, setsess] = useState([])
    const [selectedSession, setSelectedSession] = useState('')
    const [total, settotal] = useState()

    // ── original logic — unchanged ─────────────────────────────────────────
    async function dobilling() {
        const allsessids = sessdetails.map(x => x.SessionID)
        if (allsessids.includes(parseInt(selectedSession))) {
            const response = await fetch('http://localhost:3000/gettotal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionid: parseInt(selectedSession) })
            })
            const result = await response.json()
            setStep('showbill')
            settotal(result.total)
        }
    }

    async function getunpaidsessions(id) {
        const response = await fetch('http://localhost:3000/dues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patid: id })
        })
        const result = await response.json()
        if (result.data.length == 0) setStep('nosession')
        else { setsess(result.data); setStep('displaySessions') }
    }

    async function getpatientdetails() {
        const response = await fetch('http://localhost:3000/checkpatient', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cnic })
        })
        const patients = await response.json()
        if (patients.data.length == 0) {
            setStep('patientnotfound')
        } else {
            setStep('displayPatients')
            setdata(patients.data[0])
            setid(patients.data[0].PatientID)
            await getunpaidsessions(patients.data[0].PatientID)
        }
    }

    return (
        <div className="container-fluid min-vh-100 p-4" style={{ backgroundColor: '#f4f7f9', fontFamily: "'Inter', system-ui, sans-serif" }}>
            <ToastContainer theme="light" position="top-right" />

            {/* Header */}
            <div className="mb-4">
                <h2 className="fw-bolder mb-1" style={{ letterSpacing: '-0.02em', color: '#0f172a', fontSize: '2rem' }}>
                    Clear Dues
                </h2>
                <p className="small mb-0" style={{ color: '#64748b', fontWeight: '500' }}>Billing Panel — Settle Unpaid Session Charges</p>
            </div>

            {/* ── CNIC input — always visible ── */}
            <div className="bg-white p-4 mb-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', maxWidth: '480px' }}>
                <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', display: 'block' }}>Patient CNIC</label>
                <div className="d-flex gap-2">
                    <input
                        type="text"
                        className="form-control"
                        style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                        placeholder="Enter CNIC"
                        value={cnic}
                        onChange={e => setcnic(e.target.value)}
                    />
                    <button
                        type="button"
                        className="btn"
                        onClick={getpatientdetails}
                        style={{ backgroundColor: '#4f46e5', color: '#fff', fontWeight: '600', borderRadius: '10px', padding: '0.75rem 1.5rem', whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }}
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* ── Patient not found ── */}
            {step === 'patientnotfound' && (
                <div className="p-4 mb-4" style={{ backgroundColor: '#fee2e2', borderRadius: '12px', maxWidth: '480px', color: '#ef4444', fontWeight: '600' }}>
                    Patient does not exist in the database.
                </div>
            )}

            {/* ── Patient details card ── */}
            {(step === 'nosession' || step === 'displaySessions' || step === 'showbill') && (
                <div className="table-responsive bg-white mb-4" style={{ borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <p style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.5rem 0.5rem 0', marginBottom: '0.5rem' }}>Patient Record</p>
                    <table className="table mb-0 border-0">
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr>
                                {['Patient ID', 'Name', 'CNIC', 'Age', 'Gender', 'Blood Group', 'Phone'].map((h, i) => (
                                    <th key={i} style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f1f5f9', padding: '1rem' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '1rem', color: '#94a3b8', fontWeight: '500', borderBottom: 'none' }}>{patientdataset.PatientID}</td>
                                <td style={{ padding: '1rem', color: '#1e293b', fontWeight: '600', borderBottom: 'none' }}>{patientdataset.Name}</td>
                                <td style={{ padding: '1rem', color: '#64748b', borderBottom: 'none' }}>{patientdataset.CNIC}</td>
                                <td style={{ padding: '1rem', color: '#64748b', borderBottom: 'none' }}>{patientdataset.Age}</td>
                                <td style={{ padding: '1rem', color: '#64748b', borderBottom: 'none' }}>{patientdataset.Gender}</td>
                                <td style={{ padding: '1rem', color: '#64748b', borderBottom: 'none' }}>{patientdataset.BloodGroup}</td>
                                <td style={{ padding: '1rem', color: '#64748b', borderBottom: 'none' }}>{patientdataset.Phone}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── No unpaid sessions ── */}
            {step === 'nosession' && (
                <div className="p-4 mb-4" style={{ backgroundColor: '#fef3c7', borderRadius: '12px', maxWidth: '480px', color: '#d97706', fontWeight: '600' }}>
                    No unpaid sessions found for this patient.
                </div>
            )}

            {/* ── Sessions table ── */}
            {(step === 'displaySessions' || step === 'showbill') && (
                <div className="table-responsive bg-white mb-4" style={{ borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <p style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.5rem 0.5rem 0', marginBottom: '0.5rem' }}>Unpaid Sessions</p>
                    <table className="table table-hover mb-0 border-0">
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr>
                                {['Session ID', 'Patient ID', 'Doctor ID', 'Room', 'Type', 'Date', 'Start', 'End', 'Charges'].map((h, i) => (
                                    <th key={i} style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f1f5f9', padding: '1rem' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sessdetails.map(x => (
                                <tr key={x.SessionID}>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#94a3b8', fontWeight: '500' }}>{x.SessionID}</td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#64748b' }}>{x.PatientID}</td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#64748b' }}>{x.DoctorID}</td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#64748b' }}>{x.RoomID}</td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem' }}>
                                        <span style={{ backgroundColor: '#f1f5f9', padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>{x.SessionType}</span>
                                    </td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#64748b' }}>{formatDate(x.SessionDate)}</td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#64748b' }}>{formatTime(x.StartTime)}</td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#64748b' }}>{formatTime(x.EndTime)}</td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#0f172a', fontWeight: '700' }}>Rs. {x.SessionCharges}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Session ID input + confirm billing ── */}
            {(step === 'displaySessions' || step === 'showbill') && (
                <div className="bg-white p-4 mb-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', maxWidth: '480px' }}>
                    <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', display: 'block' }}>Select Session to Bill</label>
                    <div className="d-flex gap-2">
                        <input
                            type="text"
                            className="form-control"
                            style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                            placeholder="Enter Session ID"
                            value={selectedSession}
                            onChange={e => setSelectedSession(e.target.value)}
                        />
                        <button
                            type="button"
                            className="btn"
                            onClick={dobilling}
                            style={{ backgroundColor: '#0ea5e9', color: '#fff', fontWeight: '600', borderRadius: '10px', padding: '0.75rem 1.5rem', whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(14,165,233,0.3)' }}
                        >
                            Generate Bill
                        </button>
                    </div>
                </div>
            )}

            {/* ── Total bill result ── */}
            {step === 'showbill' && (
                <div className="bg-white p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', maxWidth: '360px' }}>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Bill</p>
                    <p style={{ color: '#166534', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
                        Rs. {Number(total).toLocaleString()}
                    </p>
                </div>
            )}
        </div>
    )
}

export default ClearDues
