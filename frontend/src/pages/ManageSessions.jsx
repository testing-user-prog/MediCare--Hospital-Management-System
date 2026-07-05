import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const BASE_URL = 'http://localhost:3000';

// ─── Reusable Modal ───────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)', zIndex: 1050 }}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0" style={{ borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                <div className="modal-header border-0 px-4 pt-4 pb-2">
                    <h5 className="modal-title fw-bold" style={{ color: '#0f172a', letterSpacing: '0.02em', fontSize: '1.35rem' }}>{title}</h5>
                    <button type="button" className="btn-close" onClick={onClose} style={{ boxShadow: 'none' }}></button>
                </div>
                <div className="modal-body px-4 pb-4 pt-2" style={{ color: '#334155' }}>{children}</div>
            </div>
        </div>
    </div>
);

// ─── Tab Button ───────────────────────────────────────────────────────────────
const TabBtn = ({ label, active, onClick }) => (
    <button
        className="btn me-2 mb-2"
        onClick={onClick}
        style={{
            letterSpacing: '0.02em',
            fontSize: '0.85rem',
            fontWeight: active ? '600' : '500',
            borderRadius: '30px',
            padding: '0.5rem 1.25rem',
            backgroundColor: active ? '#4f46e5' : '#ffffff',
            color: active ? '#ffffff' : '#64748b',
            border: active ? 'none' : '1px solid #e2e8f0',
            boxShadow: active ? '0 4px 14px rgba(79, 70, 229, 0.35)' : '0 2px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.25s ease'
        }}
    >
        {label}
    </button>
);

// ─── Session Table ────────────────────────────────────────────────────────────
const SessionTable = ({ sessions, onAddSymptom, onAddDiagnosis, showActions }) => (
    <div className="table-responsive bg-white" style={{ borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <table className="table table-hover mb-0 border-0">
            <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                    {['Session ID', 'Room ID', 'Type', 'Date', 'Start', 'End'].map((h, i) => (
                        <th key={i} style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f1f5f9', padding: '1rem' }}>{h}</th>
                    ))}
                    {showActions && <th className="text-end" style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f1f5f9', padding: '1rem' }}>Actions</th>}
                </tr>
            </thead>
            <tbody>
                {sessions.length === 0 ? (
                    <tr><td colSpan={showActions ? 7 : 6} className="text-center py-5" style={{ color: '#94a3b8' }}>No sessions found in this category.</td></tr>
                ) : sessions.map(s => (
                    <tr key={s.SessionID} style={{ transition: 'all 0.2s' }}>
                        <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#94a3b8', fontWeight: '500' }}>{s.SessionID}</td>
                        <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#1e293b', fontWeight: '600' }}>{s.RoomID}</td>
                        <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem' }}>
                            <span style={{ backgroundColor: '#f1f5f9', padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>
                                {s.SessionType}
                            </span>
                        </td>
                        <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#64748b' }}>{s.SessionDate ? new Date(s.SessionDate).toLocaleDateString() : '—'}</td>
                        <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#64748b' }}>{s.StartTime || '—'}</td>
                        <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#64748b' }}>{s.EndTime || '—'}</td>
                        {showActions && (
                            <td className="text-end" style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem' }}>
                                <div className="d-flex justify-content-end gap-2">
                                    <button className="btn btn-sm" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '8px', fontWeight: '600', padding: '0.4rem 0.8rem' }} onClick={() => onAddSymptom(s)}>+ Symptom</button>
                                    <button className="btn btn-sm" style={{ backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '8px', fontWeight: '600', padding: '0.4rem 0.8rem' }} onClick={() => onAddDiagnosis(s)}>+ Diagnosis</button>
                                </div>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ManageSessions = () => {

    // ── Normal UI state ────────────────────────────────────────────────────────
    const [activeView, setActiveView] = useState('booked');
    const [sessions, setSessions] = useState([]);
    const [activeModal, setActiveModal] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [symptomInput, setSymptomInput] = useState('');
    const [diagnosisInput, setDiagnosisInput] = useState('');

    // ── Prompt flow state ──────────────────────────────────────────────────────
    const [promptPhase, setPromptPhase] = useState(true);      // true = still in wizard
    const [promptSessions, setPromptSessions] = useState([]);   // list of session IDs to process
    const [promptIndex, setPromptIndex] = useState(0);          // which session we're on
    const [promptStep, setPromptStep] = useState('decision');   // 'decision' | 'howMany' | 'prescriptions'
    const [medicineCount, setMedicineCount] = useState('');     // how many medicines user wants
    const [prescriptionIndex, setPrescriptionIndex] = useState(0); // which medicine slot we're filling
    const [medicines, setMedicines] = useState([]);             // PharmacyInventory list
    const [prescForm, setPrescForm] = useState({ medicineID: '', quantity: '', dosage: '', duration: '' });

    // ─── On mount: call promptSession ─────────────────────────────────────────
    useEffect(() => {
        const runPrompt = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/promptSession`);
                const list = res.data.data || [];
                if (list.length === 0) {
                    setPromptPhase(false);
                } else {
                    setPromptSessions(list.map(r => r.SessionID));
                    setPromptPhase(true);
                    setPromptIndex(0);
                    setPromptStep('decision');
                }
            } catch {
                toast.error('Failed to check pending sessions.');
                setPromptPhase(false);
            }
        };

        const fetchMedicines = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/getMedicines`);
                setMedicines(res.data.data || []);
            } catch {
                toast.error('Failed to load medicine inventory.');
            }
        };

        runPrompt();
        fetchMedicines();
    }, []);

    // ─── Advance to next session in wizard ────────────────────────────────────
    const nextSession = () => {
        const next = promptIndex + 1;
        if (next >= promptSessions.length) {
            setPromptPhase(false);
            fetchSessionsByView('booked');
        } else {
            setPromptIndex(next);
            setPromptStep('decision');
            setMedicineCount('');
            setPrescriptionIndex(0);
            setPrescForm({ medicineID: '', quantity: '', dosage: '', duration: '' });
        }
    };

    // ─── Handle Yes/No decision ───────────────────────────────────────────────
    const handleDecision = async (decision) => {
        const sessionID = promptSessions[promptIndex];
        try {
            const res = await axios.post(`${BASE_URL}/handlePrescriptionDecision`, {
                sessionID,
                decision,
            });
            if (decision === 'no') {
                toast.success(`Session ${sessionID}: Billing created with no medicines.`);
                nextSession();
            } else {
                if (res.data.action === 'OPEN_FORM') {
                    setPromptStep('howMany');
                } else {
                    toast.error(res.data.message || 'Unexpected response.');
                }
            }
        } catch {
            toast.error('Error processing decision.');
        }
    };

    // ─── Handle medicine count ────────────────────────────────────────────────
    const handleMedicineCount = () => {
        const count = parseInt(medicineCount);
        if (isNaN(count) || count < 1 || count > 5) {
            toast.warn('Please enter a number between 1 and 5.');
            return;
        }
        setPrescriptionIndex(0);
        setPrescForm({ medicineID: '', quantity: '', dosage: '', duration: '' });
        setPromptStep('prescriptions');
    };

    // ─── Handle add prescription ──────────────────────────────────────────────
    const handleAddPrescription = async () => {
        const sessionID = promptSessions[promptIndex];
        const { medicineID, quantity, dosage, duration } = prescForm;

        if (!medicineID || !quantity || !dosage || !duration) {
            toast.warn('Please fill all prescription fields.');
            return;
        }

        // Check if selected medicine has 0 stock
        const selectedMed = medicines.find(m => m.MedicineID === parseInt(medicineID));
        if (selectedMed && selectedMed.CurrentQuantity === 0) {
            toast.error(`${selectedMed.Name} has 0 stock. Skipping this medicine.`);
            moveToNextPrescription();
            return;
        }

        try {
            const res = await axios.post(`${BASE_URL}/addPrescription`, {
                sessionID,
                medicineID: parseInt(medicineID),
                quantity: parseInt(quantity),
                dosage,
                duration,
            });

            if (res.data.success) {
                toast.success(`Medicine ${prescriptionIndex + 1} added.`);
                // Refresh medicines to get updated stock
                const medRes = await axios.get(`${BASE_URL}/getMedicines`);
                setMedicines(medRes.data.data || []);
                moveToNextPrescription();
            } else {
                // quantity > stock — let user try again
                toast.error(res.data.message || 'Could not add prescription. Try again.');
            }
        } catch (err) {
            toast.error('Error adding prescription. Try again.');
        }
    };

    const moveToNextPrescription = () => {
        const next = prescriptionIndex + 1;
        if (next >= parseInt(medicineCount)) {
            nextSession();
        } else {
            setPrescriptionIndex(next);
            setPrescForm({ medicineID: '', quantity: '', dosage: '', duration: '' });
        }
    };

    // ─── Normal UI: fetch sessions by view ────────────────────────────────────
    const fetchSessionsByView = async (view) => {
        const endpoints = {
            booked: '/getBookedSessions',
            completed: '/getCompletedSessions',
            cancelled: '/getCancelledSessions',
            doctorless: '/getDocLessSessions',
            symptomless: '/getSymLessSessions',
            diagnosisless: '/getDiagLessSessions',
        };
        try {
            const res = await axios.get(`${BASE_URL}${endpoints[view]}`);
            setSessions(res.data.data || []);
        } catch {
            toast.error('Failed to load sessions.');
        }
    };

    const handleTabChange = (view) => {
        setActiveView(view);
        fetchSessionsByView(view);
    };

    useEffect(() => {
        if (!promptPhase) fetchSessionsByView('booked');
    }, [promptPhase]);

    // ─── Add Symptom ──────────────────────────────────────────────────────────
    const handleOpenSymptom = (session) => {
        setSelectedSession(session);
        setSymptomInput('');
        setActiveModal('symptom');
    };

    const handleAddSymptom = async () => {
        if (!symptomInput.trim()) { toast.warn('Enter a symptom name.'); return; }
        try {
            const res = await axios.post(`${BASE_URL}/addSessionSymptom`, {
                sessionID: selectedSession.SessionID,
                symptomName: symptomInput.trim(),
            });
            if (res.data.success) {
                toast.success('Symptom added.');
                setActiveModal(null);
                fetchSessionsByView(activeView);
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error('Error adding symptom.');
        }
    };

    // ─── Add Diagnosis ────────────────────────────────────────────────────────
    const handleOpenDiagnosis = (session) => {
        setSelectedSession(session);
        setDiagnosisInput('');
        setActiveModal('diagnosis');
    };

    const handleAddDiagnosis = async () => {
        if (!diagnosisInput.trim()) { toast.warn('Enter a diagnosis name.'); return; }
        try {
            const res = await axios.post(`${BASE_URL}/addSessionDiagnosis`, {
                sessionID: selectedSession.SessionID,
                diagnosisName: diagnosisInput.trim(),
            });
            if (res.data.success) {
                toast.success('Diagnosis added.');
                setActiveModal(null);
                fetchSessionsByView(activeView);
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error('Error adding diagnosis.');
        }
    };

    // ─── Which tabs show actions ──────────────────────────────────────────────
    const showActions = ['symptomless', 'diagnosisless', 'completed'].includes(activeView);

    const currentSessionID = promptSessions[promptIndex];

    // ══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════════════
    return (
        <div className="container-fluid min-vh-100 p-4" style={{ backgroundColor: '#f4f7f9', fontFamily: "'Inter', system-ui, sans-serif" }}>
            <ToastContainer theme="light" position="top-right" />

            {/* ── PROMPT WIZARD PHASE ── */}
            {promptPhase && (
                <div className="row justify-content-center mt-5">
                    <div className="col-md-8 col-lg-7">
                        <div className="card border-0" style={{ backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}>
                            <div className="card-body p-5">

                                {/* Progress */}
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                        Pending Reviews
                                    </p>
                                    <p style={{ color: '#4f46e5', fontSize: '0.85rem', fontWeight: '700', margin: 0 }}>
                                        {promptIndex + 1} of {promptSessions.length}
                                    </p>
                                </div>
                                <div className="progress mb-5" style={{ height: '8px', borderRadius: '4px', backgroundColor: '#e2e8f0' }}>
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${((promptIndex) / promptSessions.length) * 100}%`, backgroundColor: '#4f46e5', borderRadius: '4px', transition: 'width 0.4s ease' }}
                                    />
                                </div>

                                <div className="mb-4">
                                    <span style={{ display: 'inline-block', backgroundColor: '#fef3c7', color: '#d97706', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1rem' }}>
                                        Session #{currentSessionID}
                                    </span>
                                    <h4 style={{ color: '#0f172a', fontWeight: '700', marginBottom: '0.5rem' }}>Action Required</h4>
                                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>This session is completed but has no billing record yet.</p>
                                </div>

                                <hr style={{ borderColor: '#f1f5f9', margin: '2rem 0' }} />

                                {/* ── Step: Decision ── */}
                                {promptStep === 'decision' && (
                                    <div className="py-2">
                                        <p style={{ color: '#1e293b', fontSize: '1.1rem', fontWeight: '500', marginBottom: '1.5rem' }}>Does this session require a medicine prescription?</p>
                                        <div className="d-flex gap-3">
                                            <button className="btn" style={{ backgroundColor: '#0ea5e9', color: '#fff', fontWeight: '600', padding: '0.7rem 2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)' }} onClick={() => handleDecision('yes')}>Yes, Prescribe</button>
                                            <button className="btn" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '600', padding: '0.7rem 2rem', borderRadius: '12px' }} onClick={() => handleDecision('no')}>No, Skip</button>
                                        </div>
                                    </div>
                                )}

                                {/* ── Step: How Many Medicines ── */}
                                {promptStep === 'howMany' && (
                                    <div className="py-2">
                                        <label style={{ color: '#1e293b', fontSize: '1.1rem', fontWeight: '500', marginBottom: '1rem', display: 'block' }}>
                                            How many medicines to prescribe? <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>(1 – 5)</span>
                                        </label>
                                        <div className="d-flex gap-3 align-items-center">
                                            <input
                                                type="number"
                                                min={1} max={5}
                                                className="form-control"
                                                style={{ width: '120px', backgroundColor: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem', color: '#1e293b', fontSize: '1.1rem', fontWeight: '600', textAlign: 'center' }}
                                                value={medicineCount}
                                                onChange={e => setMedicineCount(e.target.value)}
                                                placeholder="1 - 5"
                                            />
                                            <button className="btn" style={{ backgroundColor: '#4f46e5', color: '#fff', fontWeight: '600', padding: '0.75rem 2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }} onClick={handleMedicineCount}>Proceed</button>
                                        </div>
                                    </div>
                                )}

                                {/* ── Step: Prescription Details ── */}
                                {promptStep === 'prescriptions' && (
                                    <div className="py-2">
                                        <h5 style={{ color: '#0f172a', fontWeight: '700', marginBottom: '1.5rem' }}>
                                            Medicine {prescriptionIndex + 1} <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: '500' }}>of {medicineCount}</span>
                                        </h5>

                                        {/* Inventory Table */}
                                        <div className="table-responsive mb-4" style={{ maxHeight: '250px', overflowY: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <table className="table table-hover mb-0 border-0" style={{ fontSize: '0.9rem' }}>
                                                <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0, zIndex: 1 }}>
                                                    <tr>
                                                        {['ID', 'Name', 'Type', 'Price', 'In Stock'].map((h, i) => (
                                                            <th key={i} style={{ color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0', padding: '0.75rem 1rem' }}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {medicines.map(m => {
                                                        const isSelected = prescForm.medicineID === String(m.MedicineID);
                                                        const isOutOfStock = m.CurrentQuantity === 0;
                                                        return (
                                                            <tr
                                                                key={m.MedicineID}
                                                                onClick={() => {
                                                                    if (isOutOfStock) {
                                                                        toast.warn(`${m.Name} is out of stock.`);
                                                                        return;
                                                                    }
                                                                    setPrescForm(f => ({ ...f, medicineID: String(m.MedicineID) }));
                                                                }}
                                                                style={{
                                                                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                                                    backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                                                                    opacity: isOutOfStock ? 0.6 : 1,
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', color: isSelected ? '#1d4ed8' : '#64748b', fontWeight: isSelected ? '600' : '400' }}>{m.MedicineID}</td>
                                                                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', color: isSelected ? '#1d4ed8' : '#1e293b', fontWeight: '600' }}>{m.Name}</td>
                                                                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>{m.Type}</td>
                                                                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>Rs. {m.Price}</td>
                                                                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontWeight: '600', color: isOutOfStock ? '#ef4444' : '#10b981' }}>
                                                                    {m.CurrentQuantity}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {prescForm.medicineID && (
                                            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
                                                <p style={{ margin: 0, color: '#166534', fontSize: '0.9rem' }}>
                                                    Selected: <strong style={{ fontWeight: '700' }}>{medicines.find(m => String(m.MedicineID) === prescForm.medicineID)?.Name}</strong>
                                                    <span style={{ margin: '0 0.5rem', color: '#86efac' }}>|</span>
                                                    Available Stock: <strong style={{ fontWeight: '700' }}>{medicines.find(m => String(m.MedicineID) === prescForm.medicineID)?.CurrentQuantity}</strong>
                                                </p>
                                            </div>
                                        )}

                                        <div className="row g-3 mt-1">
                                            <div className="col-md-4">
                                                <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Quantity</label>
                                                <input
                                                    type="number" min={1}
                                                    className="form-control"
                                                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                                    value={prescForm.quantity}
                                                    onChange={e => setPrescForm(f => ({ ...f, quantity: e.target.value }))}
                                                    placeholder="e.g. 2"
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Dosage</label>
                                                <input
                                                    className="form-control"
                                                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                                    value={prescForm.dosage}
                                                    onChange={e => setPrescForm(f => ({ ...f, dosage: e.target.value }))}
                                                    placeholder="e.g. 1 tab twice"
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Duration</label>
                                                <input
                                                    className="form-control"
                                                    style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                                    value={prescForm.duration}
                                                    onChange={e => setPrescForm(f => ({ ...f, duration: e.target.value }))}
                                                    placeholder="e.g. 7 days"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-top d-flex gap-3" style={{ borderColor: '#f1f5f9' }}>
                                            <button className="btn" style={{ backgroundColor: '#4f46e5', color: '#fff', fontWeight: '600', padding: '0.7rem 1.5rem', borderRadius: '10px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }} onClick={handleAddPrescription}>
                                                Save Prescription
                                            </button>
                                            <button
                                                className="btn"
                                                style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#64748b', fontWeight: '600', padding: '0.7rem 1.5rem', borderRadius: '10px' }}
                                                onClick={moveToNextPrescription}
                                            >
                                                Skip Medicine
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── NORMAL UI PHASE ── */}
            {!promptPhase && (
                <>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                        <div>
                            <h2 className="fw-bolder mb-1" style={{ letterSpacing: '-0.02em', color: '#0f172a', fontSize: '2rem' }}>
                                Manage Sessions
                            </h2>
                            <p className="small mb-0" style={{ color: '#64748b', fontWeight: '500' }}>Administration Panel — Appointment Records & Medical Updates</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-4 d-flex flex-wrap gap-1">
                        <TabBtn label="Booked" active={activeView === 'booked'} onClick={() => handleTabChange('booked')} />
                        <TabBtn label="Completed" active={activeView === 'completed'} onClick={() => handleTabChange('completed')} />
                        <TabBtn label="Cancelled" active={activeView === 'cancelled'} onClick={() => handleTabChange('cancelled')} />
                        <TabBtn label="No Doctor" active={activeView === 'doctorless'} onClick={() => handleTabChange('doctorless')} />
                        <TabBtn label="No Symptom" active={activeView === 'symptomless'} onClick={() => handleTabChange('symptomless')} />
                        <TabBtn label="No Diagnosis" active={activeView === 'diagnosisless'} onClick={() => handleTabChange('diagnosisless')} />
                    </div>

                    <SessionTable
                        sessions={sessions}
                        onAddSymptom={handleOpenSymptom}
                        onAddDiagnosis={handleOpenDiagnosis}
                        showActions={showActions}
                    />

                    {/* ── Add Symptom Modal ── */}
                    {activeModal === 'symptom' && (
                        <Modal title={`Add Symptom`} onClose={() => setActiveModal(null)}>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Updating records for Session #{selectedSession?.SessionID}</p>
                            <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Symptom Name</label>
                            <input
                                className="form-control"
                                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                value={symptomInput}
                                onChange={e => setSymptomInput(e.target.value)}
                                placeholder="e.g. High Fever, Nausea"
                            />
                            <div className="mt-4 pt-3 d-flex justify-content-end gap-3 border-top" style={{ borderColor: '#f1f5f9' }}>
                                <button className="btn" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600', borderRadius: '10px', padding: '0.6rem 1.25rem' }} onClick={() => setActiveModal(null)}>Cancel</button>
                                <button className="btn" style={{ backgroundColor: '#0ea5e9', border: 'none', color: '#ffffff', fontWeight: '600', borderRadius: '10px', padding: '0.6rem 1.25rem', boxShadow: '0 4px 10px rgba(14, 165, 233, 0.3)' }} onClick={handleAddSymptom}>Save Symptom</button>
                            </div>
                        </Modal>
                    )}

                    {/* ── Add Diagnosis Modal ── */}
                    {activeModal === 'diagnosis' && (
                        <Modal title={`Add Diagnosis`} onClose={() => setActiveModal(null)}>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Updating records for Session #{selectedSession?.SessionID}</p>
                            <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Diagnosis Name</label>
                            <input
                                className="form-control"
                                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                value={diagnosisInput}
                                onChange={e => setDiagnosisInput(e.target.value)}
                                placeholder="e.g. Acute Bronchitis"
                            />
                            <div className="mt-4 pt-3 d-flex justify-content-end gap-3 border-top" style={{ borderColor: '#f1f5f9' }}>
                                <button className="btn" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600', borderRadius: '10px', padding: '0.6rem 1.25rem' }} onClick={() => setActiveModal(null)}>Cancel</button>
                                <button className="btn" style={{ backgroundColor: '#d97706', border: 'none', color: '#ffffff', fontWeight: '600', borderRadius: '10px', padding: '0.6rem 1.25rem', boxShadow: '0 4px 10px rgba(217, 119, 6, 0.3)' }} onClick={handleAddDiagnosis}>Save Diagnosis</button>
                            </div>
                        </Modal>
                    )}
                </>
            )}
        </div>
    );
};

export default ManageSessions;