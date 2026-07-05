import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// ─── MOVED OUTSIDE: UI Components ──────────────────────────────────────────────

const TabBtn = ({ label, tab, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(tab)}
        style={{
            padding: '10px 24px',
            borderRadius: '30px',
            border: activeTab === tab ? 'none' : '1px solid #e2e8f0',
            fontWeight: activeTab === tab ? '600' : '500',
            fontSize: '0.95rem',
            cursor: 'pointer',
            backgroundColor: activeTab === tab ? '#4f46e5' : '#ffffff',
            color: activeTab === tab ? '#ffffff' : '#64748b',
            boxShadow: activeTab === tab ? '0 4px 14px rgba(79, 70, 229, 0.35)' : '0 2px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.25s ease',
        }}
    >
        {label}
    </button>
);

const BlockCard = ({ title, children, noPadding }) => (
    <div className="d-flex flex-column" style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden', height: '100%', border: '1px solid #f1f5f9' }}>
        {title && <div style={{ backgroundColor: '#f8fafc', padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h5 style={{ margin: 0, fontWeight: '700', color: '#0f172a', fontSize: '1.05rem' }}>{title}</h5>
        </div>}
        <div style={{ padding: noPadding ? '0 0 20px 0' : '24px', flex: 1 }}>
            {children}
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

function ReportsAndDiagnostics() {
    const navigate = useNavigate();

    // ── Master Lists from New Endpoints ───────────────────────────────────────
    const [symptomsList, setSymptomsList] = useState([]);
    const [diagnosesList, setDiagnosesList] = useState([]);

    // ── Original State Variables ──────────────────────────────────────────────
    const [patientid, setPatientid] = useState('');
    const [patientInfo, setPatientInfo] = useState(null);
    const [visitHistory, setVisitHistory] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [commonDiseases, setCommonDiseases] = useState([]);
    const [symptomInput, setSymptomInput] = useState('');
    const [patientsBySymptom, setPatientsBySymptom] = useState([]);
    const [symptomDiagnosisList, setSymptomDiagnosisList] = useState([]);
    const [commonSymptoms, setCommonSymptoms] = useState([]);
    const [symptom1, setSymptom1] = useState('');
    const [symptom2, setSymptom2] = useState('');
    const [suggestion, setSuggestion] = useState([]);
    const [allSuggestions, setAllSuggestions] = useState([]);
    const [diseaseInput, setDiseaseInput] = useState('');
    const [patientsByDisease, setPatientsByDisease] = useState([]);

    const [suggDiagID, setSuggDiagID] = useState('');
    const [suggConfidence, setSuggConfidence] = useState('');
    const [suggSymptom1, setSuggSymptom1] = useState('');
    const [suggSymptom2, setSuggSymptom2] = useState('');
    const [viewSuggID, setViewSuggID] = useState('');
    const [suggInfo, setSuggInfo] = useState(null);
    const [suggSymptoms, setSuggSymptoms] = useState([]);
    const [suggDiag, setSuggDiag] = useState([]);
    const [editSuggID, setEditSuggID] = useState('');
    const [editConfLevel, setEditConfLevel] = useState('');
    const [deleteSuggID, setDeleteSuggID] = useState('');

    const [newDiagName, setNewDiagName] = useState('');
    const [viewDiagID, setViewDiagID] = useState('');
    const [diagInfo, setDiagInfo] = useState(null);
    const [diagSessions, setDiagSessions] = useState([]);
    const [diagSuggestions, setDiagSuggestions] = useState([]);
    const [editDiagID, setEditDiagID] = useState('');
    const [editDiagName, setEditDiagName] = useState('');
    const [deleteDiagID, setDeleteDiagID] = useState('');

    const [activeTab, setActiveTab] = useState('reports');

    const API = 'http://localhost:3000';

    // ── Fetch Master Lists ────────────────────────────────────────────────────
    function loadMasterLists() {
        fetch(`${API}/getSymptoms`)
            .then(res => res.json())
            .then(data => {
                if (data.data && data.data.length > 0) setSymptomsList(data.data);
                else toast.error('Symptoms list came back empty — check view_sym view');
            })
            .catch(() => toast.error('Cannot reach server to load symptoms'));

        fetch(`${API}/getDiagnoses`)
            .then(res => res.json())
            .then(data => {
                if (data.data && data.data.length > 0) setDiagnosesList(data.data);
                else toast.error('Diagnoses list came back empty — check view_dia view');
            })
            .catch(() => toast.error('Cannot reach server to load diagnoses'));
    }

    useEffect(() => { loadMasterLists(); }, []);

    // ── Original API Functions ────────────────────────────────────────────────
    function handleSearch() {
        if (!patientid) return toast.warn('Enter a Patient ID');
        fetch(`${API}/getpatientreport/${patientid}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPatientInfo(data.patientInfo[0]);
                    setVisitHistory(data.visitHistory);
                    setPrescriptions(data.prescriptions);
                    toast.success('Patient report loaded');
                } else {
                    toast.error(data.message);
                }
            });
    }

    function handleCommonDiseases() {
        fetch(`${API}/mostcommondiseases`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setCommonDiseases(data.data);
                else toast.error(data.message);
            });
    }

    function handlePatientsBySymptom() {
        if (!symptomInput) return toast.warn('Select a symptom');
        fetch(`${API}/patientsbysymptom`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptomname: symptomInput })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setPatientsBySymptom(data.data);
                else toast.error(data.message);
            });
    }

    function handleSymptomDiagnosis() {
        fetch(`${API}/patientsymptomsdiagnosis`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setSymptomDiagnosisList(data.data);
                else toast.error(data.message);
            });
    }

    function handleCommonSymptoms() {
        fetch(`${API}/mostcommonsymptoms`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setCommonSymptoms(data.data);
                else toast.error(data.message);
            });
    }

    function handleSuggestion() {
        if (!symptom1) return toast.warn('Select at least Symptom 1');
        fetch(`${API}/getdiagnosissuggestion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptom1, symptom2 })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setSuggestion(data.data);
                else toast.error(data.message);
            });
    }

    function handleAllSuggestions() {
        fetch(`${API}/allsuggestions`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setAllSuggestions(data.data);
                else toast.error(data.message);
            });
    }

    function handlePatientsByDisease() {
        if (!diseaseInput) return toast.warn('Select a disease');
        fetch(`${API}/patientsbydisease`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ diagnosisname: diseaseInput })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setPatientsByDisease(data.data);
                else toast.error(data.message);
            });
    }

    function handleAddSuggestion() {
        if (!suggDiagID || !suggConfidence || !suggSymptom1) return toast.warn('Fill all required fields');
        fetch(`${API}/addsuggestion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                diagnosisid: suggDiagID,
                confidencelevel: suggConfidence,
                symptom1id: suggSymptom1,
                symptom2id: suggSymptom2 || null
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) toast.success(data.data[0].Message);
                else toast.error(data.message);
            });
    }

    function handleViewSuggestion() {
        if (!viewSuggID) return toast.warn('Enter Suggestion ID');
        fetch(`${API}/viewsuggestion/${viewSuggID}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSuggInfo(data.suggestionInfo[0]);
                    setSuggSymptoms(data.symptoms);
                    setSuggDiag(data.diagnosis);
                } else {
                    toast.error(data.message);
                }
            });
    }

    function handleEditSuggestion() {
        if (!editSuggID || !editConfLevel) return toast.warn('Fill both fields');
        fetch(`${API}/editsuggestion/${editSuggID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ confidencelevel: editConfLevel })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) toast.success(data.data[0].Message);
                else toast.error(data.message);
            });
    }

    function handleDeleteSuggestion() {
        if (!deleteSuggID) return toast.warn('Enter Suggestion ID');
        fetch(`${API}/deletesuggestion/${deleteSuggID}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                if (data.success) toast.success(data.data[0].Message);
                else toast.error(data.message);
            });
    }

    function handleAddDiagnosis() {
        if (!newDiagName) return toast.warn('Enter a Diagnosis name');
        fetch(`${API}/adddiagnosis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newDiagName })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.data[0].Message);
                    loadMasterLists();
                } else toast.error(data.message);
            });
    }

    function handleViewDiagnosis() {
        if (!viewDiagID) return toast.warn('Select a Diagnosis');
        fetch(`${API}/viewdiagnosis/${viewDiagID}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setDiagInfo(data.diagnosisInfo[0]);
                    setDiagSessions(data.linkedSessions);
                    setDiagSuggestions(data.linkedSuggestions);
                } else {
                    toast.error(data.message);
                }
            });
    }

    function handleEditDiagnosis() {
        if (!editDiagID || !editDiagName) return toast.warn('Fill both fields');
        fetch(`${API}/editdiagnosis/${editDiagID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editDiagName })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.data[0].Message);
                    loadMasterLists();
                } else toast.error(data.message);
            });
    }

    function handleDeleteDiagnosis() {
        if (!deleteDiagID) return toast.warn('Select a Diagnosis');
        fetch(`${API}/deletediagnosis/${deleteDiagID}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.data[0].Message);
                    loadMasterLists();
                } else toast.error(data.message);
            });
    }

    // ─── Render ───────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f9', padding: '40px 20px', fontFamily: "'Inter', system-ui, sans-serif", textAlign: 'left' }}>
            <ToastContainer theme="light" position="top-right" />

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontWeight: '800', fontSize: '2.2rem', letterSpacing: '-0.02em', color: '#0f172a', margin: 0 }}>
                            Reports &amp; Diagnostics
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '8px', marginBottom: 0 }}>Comprehensive medical analytics and suggestions engine</p>
                    </div>
                    <button onClick={() => navigate('/')} style={{ ...btnStyle('#ffffff'), color: '#475569', border: '1px solid #cbd5e1' }}>
                        ← Back to Home
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    <TabBtn label="Patient Reports" tab="reports" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabBtn label="Analytics & Stats" tab="analytics" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabBtn label="Suggestions Engine" tab="suggestions" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabBtn label="Diagnosis Dictionary" tab="diagnosis" activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>

                {/* ═════════════════════════════════════════════════════════════
                    TAB 1: PATIENT REPORTS
                ═════════════════════════════════════════════════════════════ */}
                {activeTab === 'reports' && (
                    <div className="row g-4">
                        <div className="col-12">
                            <BlockCard title="Comprehensive Patient Search">
                                <div className="d-flex gap-3 align-items-center mb-4">
                                    <input type="number" placeholder="Enter Patient ID" value={patientid} onChange={e => setPatientid(e.target.value)} style={{ ...inputStyle, maxWidth: '300px' }} />
                                    <button onClick={handleSearch} style={{ ...btnStyle('#0ea5e9'), whiteSpace: 'nowrap' }}>Search Patient</button>
                                </div>

                                {patientInfo && (
                                    <div className="row g-4 mb-4">
                                        <div className="col-md-4">
                                            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Patient Details</p>
                                                <h4 style={{ color: '#0f172a', fontWeight: '700', marginBottom: '16px' }}>{patientInfo.Name}</h4>
                                                <p style={detailStyle}><strong>Age:</strong> {patientInfo.Age}</p>
                                                <p style={detailStyle}><strong>Gender:</strong> {patientInfo.Gender}</p>
                                                <p style={detailStyle}><strong>Blood:</strong> <span style={{ color: '#ef4444', fontWeight: '700' }}>{patientInfo.BloodGroup}</span></p>
                                                <p style={detailStyle}><strong>Phone:</strong> {patientInfo.Phone}</p>
                                                <p style={detailStyle}><strong>CNIC:</strong> {patientInfo.CNIC}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-8">
                                            <p style={{ color: '#0f172a', fontWeight: '700', marginBottom: '12px' }}>Visit History</p>
                                            {visitHistory.length > 0 ? (
                                                <div className="table-responsive border rounded" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                                    <table style={tableStyle}>
                                                        <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0 }}>
                                                            <tr>{['Date', 'Type', 'Doctor', 'Diagnosis'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                                                        </thead>
                                                        <tbody>
                                                            {visitHistory.map((v, i) => (
                                                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                                    <td style={tdStyle}>{new Date(v.SessionDate).toLocaleDateString()}</td>
                                                                    <td style={tdStyle}><span style={badgeStyle}>{v.SessionType}</span></td>
                                                                    <td style={{ ...tdStyle, fontWeight: '600' }}>{v.DoctorName}</td>
                                                                    <td style={{ ...tdStyle, color: '#0ea5e9', fontWeight: '600' }}>{v.Diagnosis}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : <p className="text-muted small">No visit history found.</p>}
                                        </div>

                                        <div className="col-12 mt-4">
                                            <p style={{ color: '#0f172a', fontWeight: '700', marginBottom: '12px' }}>Active Prescriptions</p>
                                            {prescriptions.length > 0 ? (
                                                <div className="table-responsive border rounded">
                                                    <table style={tableStyle}>
                                                        <thead style={{ backgroundColor: '#f8fafc' }}>
                                                            <tr>{['Medicine', 'Quantity', 'Dosage', 'Duration'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                                                        </thead>
                                                        <tbody>
                                                            {prescriptions.map((p, i) => (
                                                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                                    <td style={{ ...tdStyle, fontWeight: '600', color: '#10b981' }}>{p.Medicine}</td>
                                                                    <td style={tdStyle}>{p.Quantity}</td>
                                                                    <td style={tdStyle}>{p.Dosage}</td>
                                                                    <td style={tdStyle}>{p.Duration}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : <p className="text-muted small">No prescriptions found.</p>}
                                        </div>
                                    </div>
                                )}
                            </BlockCard>
                        </div>

                        <div className="col-md-6">
                            <BlockCard title="Find Patients By Symptom">
                                <div className="d-flex gap-3 mb-4">
                                    <select value={symptomInput} onChange={e => setSymptomInput(e.target.value)} style={inputStyle}>
                                        <option value="">— Select a Symptom —</option>
                                        {symptomsList.map(s => <option key={s.SymptomID} value={s.Name}>{s.Name}</option>)}
                                    </select>
                                    <button onClick={handlePatientsBySymptom} style={btnStyle('#4f46e5')}>Search</button>
                                </div>
                                {patientsBySymptom.length > 0 && (
                                    <div className="table-responsive border rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        <table style={tableStyle}>
                                            <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0 }}>
                                                <tr>{['Patient', 'CNIC', 'Phone'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                                            </thead>
                                            <tbody>
                                                {patientsBySymptom.map((p, i) => (
                                                    <tr key={i}><td style={{ ...tdStyle, fontWeight: '600' }}>{p.PatientName}</td><td style={tdStyle}>{p.CNIC}</td><td style={tdStyle}>{p.Phone}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </BlockCard>
                        </div>

                        <div className="col-md-6">
                            <BlockCard title="Find Patients By Disease">
                                <div className="d-flex gap-3 mb-4">
                                    <select value={diseaseInput} onChange={e => setDiseaseInput(e.target.value)} style={inputStyle}>
                                        <option value="">— Select a Diagnosis —</option>
                                        {diagnosesList.map(d => <option key={d.DiagnosisID} value={d.Name}>{d.Name}</option>)}
                                    </select>
                                    <button onClick={handlePatientsByDisease} style={btnStyle('#4f46e5')}>Search</button>
                                </div>
                                {patientsByDisease.length > 0 && (
                                    <div className="table-responsive border rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        <table style={tableStyle}>
                                            <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0 }}>
                                                <tr>{['Patient', 'Blood', 'Date'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                                            </thead>
                                            <tbody>
                                                {patientsByDisease.map((p, i) => (
                                                    <tr key={i}><td style={{ ...tdStyle, fontWeight: '600' }}>{p.PatientName}</td><td style={{ ...tdStyle, color: '#ef4444', fontWeight: '600' }}>{p.BloodGroup}</td><td style={tdStyle}>{new Date(p.SessionDate).toLocaleDateString()}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </BlockCard>
                        </div>
                    </div>
                )}

                {/* ═════════════════════════════════════════════════════════════
                    TAB 2: ANALYTICS
                ═════════════════════════════════════════════════════════════ */}
                {activeTab === 'analytics' && (
                    <div className="row g-4">
                        <div className="col-md-6">
                            <BlockCard title="Most Common Diseases" noPadding>
                                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                                    <button onClick={handleCommonDiseases} style={btnStyle('#0ea5e9')}>Generate Report</button>
                                </div>
                                <table style={tableStyle}>
                                    <tbody>
                                        {commonDiseases.map((d, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ ...tdStyle, fontWeight: '700', color: i < 3 ? '#d97706' : '#64748b', width: '50px' }}>#{i + 1}</td>
                                                <td style={{ ...tdStyle, fontWeight: '600', color: '#1e293b', textAlign: 'left' }}>{d.Diagnosis}</td>
                                                <td style={{ ...tdStyle, color: '#0ea5e9', fontWeight: '700', textAlign: 'right', paddingRight: '24px' }}>{d.TotalCases} cases</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </BlockCard>
                        </div>

                        <div className="col-md-6">
                            <BlockCard title="Most Common Symptoms" noPadding>
                                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                                    <button onClick={handleCommonSymptoms} style={btnStyle('#0ea5e9')}>Generate Report</button>
                                </div>
                                <table style={tableStyle}>
                                    <tbody>
                                        {commonSymptoms.map((s, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ ...tdStyle, fontWeight: '700', color: i < 3 ? '#d97706' : '#64748b', width: '50px' }}>#{i + 1}</td>
                                                <td style={{ ...tdStyle, fontWeight: '600', color: '#1e293b', textAlign: 'left' }}>{s.Symptom}</td>
                                                <td style={{ ...tdStyle, color: '#ef4444', fontWeight: '700', textAlign: 'right', paddingRight: '24px' }}>{s.TotalOccurrences} times</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </BlockCard>
                        </div>

                        <div className="col-12">
                            <BlockCard title="All Patients Symptoms & Diagnosis Mapping">
                                <button onClick={handleSymptomDiagnosis} style={{ ...btnStyle('#4f46e5'), marginBottom: '24px' }}>Load Full Mapping Dataset</button>
                                {symptomDiagnosisList.length > 0 && (
                                    <div className="table-responsive border rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        <table style={tableStyle}>
                                            <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0 }}>
                                                <tr>{['Patient', 'Date', 'Symptom Reported', 'Diagnosis Given'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                                            </thead>
                                            <tbody>
                                                {symptomDiagnosisList.map((item, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ ...tdStyle, fontWeight: '600' }}>{item.PatientName}</td>
                                                        <td style={tdStyle}>{new Date(item.SessionDate).toLocaleDateString()}</td>
                                                        <td style={{ ...tdStyle, color: '#ef4444' }}>{item.Symptom}</td>
                                                        <td style={{ ...tdStyle, color: '#10b981', fontWeight: '600' }}>{item.Diagnosis}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </BlockCard>
                        </div>
                    </div>
                )}

                {/* ═════════════════════════════════════════════════════════════
                    TAB 3: SUGGESTIONS ENGINE
                ═════════════════════════════════════════════════════════════ */}
                {activeTab === 'suggestions' && (
                    <div className="row g-4">
                        <div className="col-12">
                            <BlockCard title="Run Diagnostic Suggestion">
                                <div className="d-flex flex-wrap gap-3 align-items-center mb-4">
                                    <select value={symptom1} onChange={e => setSymptom1(e.target.value)} style={inputStyle}>
                                        <option value="">— Symptom 1 (Required) —</option>
                                        {symptomsList.map(s => <option key={s.SymptomID} value={s.Name}>{s.Name}</option>)}
                                    </select>
                                    <select value={symptom2} onChange={e => setSymptom2(e.target.value)} style={inputStyle}>
                                        <option value="">— Symptom 2 (Optional) —</option>
                                        {symptomsList.map(s => <option key={s.SymptomID} value={s.Name}>{s.Name}</option>)}
                                    </select>
                                    <button onClick={handleSuggestion} style={btnStyle('#10b981')}>Get Suggestion</button>
                                </div>

                                {suggestion.length > 0 && (
                                    <div className="d-flex flex-wrap gap-3">
                                        {suggestion.map((s, i) => (
                                            <div key={i} style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '24px', flex: '1 1 300px' }}>
                                                <p style={{ color: '#166534', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Match Found</p>
                                                <h3 style={{ color: '#15803d', fontWeight: '800', marginBottom: '12px' }}>{s.SuggestedDiagnosis}</h3>
                                                <p style={{ margin: 0, color: '#166534', marginBottom: '4px' }}><strong>Confidence:</strong> {s.ConfidenceLevel}%</p>
                                                <p style={{ margin: 0, color: '#166534' }}><strong>Matched on:</strong> {s.MatchedSymptoms}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </BlockCard>
                        </div>

                        <div className="col-md-7">
                            <BlockCard title="Database: All Suggestions" noPadding>
                                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                                    <button onClick={handleAllSuggestions} style={btnStyle('#4f46e5')}>Load All Rules</button>
                                </div>
                                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                    <table style={tableStyle}>
                                        <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0 }}>
                                            <tr>{['Symptom Trigger', 'Results in Diagnosis', 'Confidence'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                            {allSuggestions.map((s, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ ...tdStyle, color: '#ef4444' }}>{s.Symptom}</td>
                                                    <td style={{ ...tdStyle, color: '#0ea5e9', fontWeight: '600' }}>{s.Diagnosis}</td>
                                                    <td style={{ ...tdStyle, fontWeight: '700', color: s.ConfidenceLevel > 70 ? '#10b981' : '#d97706' }}>{s.ConfidenceLevel}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </BlockCard>
                        </div>

                        <div className="col-md-5">
                            <div className="row g-4">
                                {/* Inspect Rule */}
                                <div className="col-12">
                                    <BlockCard title="Inspect Rule">
                                        <div className="d-flex gap-3">
                                            <input type="number" placeholder="Suggestion ID" value={viewSuggID} onChange={e => setViewSuggID(e.target.value)} style={inputStyle} />
                                            <button onClick={handleViewSuggestion} style={btnStyle('#0ea5e9')}>View</button>
                                        </div>
                                        {suggInfo && (
                                            <div className="mt-4 p-4 bg-light rounded border">
                                                <p style={detailStyle}><strong>Rule ID:</strong> {suggInfo.SuggestionID}</p>
                                                <p style={detailStyle}><strong>Confidence:</strong> {suggInfo.ConfidenceLevel}%</p>
                                                <hr style={{ margin: '12px 0', borderColor: '#e2e8f0' }} />
                                                <p style={detailStyle}><strong>Linked Symps:</strong> {suggSymptoms.map(s => s.SymptomName).join(', ')}</p>
                                                <p style={detailStyle}><strong>Linked Diag:</strong> {suggDiag.map(d => d.DiagnosisName).join(', ')}</p>
                                            </div>
                                        )}
                                    </BlockCard>
                                </div>

                                {/* Add Rule */}
                                <div className="col-12">
                                    <BlockCard title="Add Rule">
                                        <div className="d-flex gap-3 mb-3">
                                            <select value={suggDiagID} onChange={e => setSuggDiagID(e.target.value)} style={inputStyle}>
                                                <option value="">— Resulting Diagnosis —</option>
                                                {diagnosesList.map(d => <option key={d.DiagnosisID} value={d.DiagnosisID}>{d.Name}</option>)}
                                            </select>
                                            <input type="number" placeholder="Confidence %" value={suggConfidence} onChange={e => setSuggConfidence(e.target.value)} style={{ ...inputStyle, maxWidth: '140px' }} />
                                        </div>
                                        <div className="d-flex gap-3 mb-3">
                                            <select value={suggSymptom1} onChange={e => setSuggSymptom1(e.target.value)} style={inputStyle}>
                                                <option value="">— Symp 1 (Required) —</option>
                                                {symptomsList.map(s => <option key={s.SymptomID} value={s.SymptomID}>{s.Name}</option>)}
                                            </select>
                                            <select value={suggSymptom2} onChange={e => setSuggSymptom2(e.target.value)} style={inputStyle}>
                                                <option value="">— Symp 2 (Optional) —</option>
                                                {symptomsList.map(s => <option key={s.SymptomID} value={s.SymptomID}>{s.Name}</option>)}
                                            </select>
                                        </div>
                                        <button onClick={handleAddSuggestion} style={{ ...btnStyle('#10b981'), width: '100%' }}>Create Rule</button>
                                    </BlockCard>
                                </div>

                                {/* Update Confidence */}
                                <div className="col-12">
                                    <BlockCard title="Update Confidence">
                                        <div className="d-flex gap-3">
                                            <input type="number" placeholder="Sugg ID" value={editSuggID} onChange={e => setEditSuggID(e.target.value)} style={{ ...inputStyle, maxWidth: '110px' }} />
                                            <input type="number" placeholder="New Conf %" value={editConfLevel} onChange={e => setEditConfLevel(e.target.value)} style={inputStyle} />
                                            <button onClick={handleEditSuggestion} style={btnStyle('#f59e0b')}>Update</button>
                                        </div>
                                    </BlockCard>
                                </div>

                                {/* Delete Rule */}
                                <div className="col-12">
                                    <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #fca5a5', overflow: 'hidden' }}>
                                        <div style={{ backgroundColor: '#fef2f2', padding: '18px 24px', borderBottom: '1px solid #fca5a5' }}>
                                            <h5 style={{ margin: 0, fontWeight: '700', color: '#ef4444', fontSize: '1.05rem' }}>Delete Rule</h5>
                                        </div>
                                        <div style={{ padding: '24px' }}>
                                            <div className="d-flex gap-3">
                                                <input type="number" placeholder="Sugg ID" value={deleteSuggID} onChange={e => setDeleteSuggID(e.target.value)} style={inputStyle} />
                                                <button onClick={handleDeleteSuggestion} style={btnStyle('#ef4444')}>Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═════════════════════════════════════════════════════════════
                    TAB 4: DIAGNOSIS DICTIONARY
                ═════════════════════════════════════════════════════════════ */}
                {activeTab === 'diagnosis' && (
                    <div className="row g-4">
                        <div className="col-md-6 d-flex flex-column gap-4">
                            <BlockCard title="Add Diagnosis to System">
                                <div className="d-flex gap-3">
                                    <input type="text" placeholder="Diagnosis Name (e.g. Malaria)" value={newDiagName} onChange={e => setNewDiagName(e.target.value)} style={inputStyle} />
                                    <button onClick={handleAddDiagnosis} style={btnStyle('#10b981')}>Add to Database</button>
                                </div>
                            </BlockCard>

                            <BlockCard title="Update Existing Diagnosis">
                                <div className="d-flex gap-3 mb-2">
                                    <select value={editDiagID} onChange={e => setEditDiagID(e.target.value)} style={{ ...inputStyle, maxWidth: '160px' }}>
                                        <option value="">— Select —</option>
                                        {diagnosesList.map(d => <option key={d.DiagnosisID} value={d.DiagnosisID}>{d.Name}</option>)}
                                    </select>
                                    <input type="text" placeholder="New Name" value={editDiagName} onChange={e => setEditDiagName(e.target.value)} style={inputStyle} />
                                    <button onClick={handleEditDiagnosis} style={btnStyle('#f59e0b')}>Update</button>
                                </div>
                            </BlockCard>

                            <BlockCard title="Danger Zone: Delete Diagnosis">
                                <div className="d-flex gap-3">
                                    <select value={deleteDiagID} onChange={e => setDeleteDiagID(e.target.value)} style={inputStyle}>
                                        <option value="">— Select Diagnosis to Delete —</option>
                                        {diagnosesList.map(d => <option key={d.DiagnosisID} value={d.DiagnosisID}>{d.Name}</option>)}
                                    </select>
                                    <button onClick={handleDeleteDiagnosis} style={btnStyle('#ef4444')}>Permadelete</button>
                                </div>
                            </BlockCard>
                        </div>

                        <div className="col-md-6">
                            <BlockCard title="Inspect Diagnosis Record">
                                <div className="d-flex gap-3 mb-4">
                                    <select value={viewDiagID} onChange={e => setViewDiagID(e.target.value)} style={inputStyle}>
                                        <option value="">— Select a Diagnosis to Inspect —</option>
                                        {diagnosesList.map(d => <option key={d.DiagnosisID} value={d.DiagnosisID}>{d.Name}</option>)}
                                    </select>
                                    <button onClick={handleViewDiagnosis} style={btnStyle('#0ea5e9')}>Load Record</button>
                                </div>

                                {diagInfo && (
                                    <div>
                                        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                            <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Diagnosis Profile</p>
                                            <h4 style={{ color: '#0f172a', fontWeight: '800', margin: 0 }}>[{diagInfo.DiagnosisID}] {diagInfo.Name}</h4>
                                        </div>

                                        <p style={{ color: '#0f172a', fontWeight: '700', marginBottom: '12px' }}>Sessions Involving this Diagnosis</p>
                                        <div className="table-responsive border rounded mb-4" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                            <table style={tableStyle}>
                                                <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0 }}>
                                                    <tr>{['Patient', 'Date', 'Type'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                                                </thead>
                                                <tbody>
                                                    {diagSessions.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>No linked sessions.</td></tr>}
                                                    {diagSessions.map((s, i) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ ...tdStyle, fontWeight: '600' }}>{s.PatientName}</td>
                                                            <td style={tdStyle}>{new Date(s.SessionDate).toLocaleDateString()}</td>
                                                            <td style={tdStyle}><span style={badgeStyle}>{s.SessionType}</span></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <p style={{ color: '#0f172a', fontWeight: '700', marginBottom: '12px' }}>Suggestion Rules Involving this</p>
                                        <div className="table-responsive border rounded" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                            <table style={tableStyle}>
                                                <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0 }}>
                                                    <tr>{['Suggestion Rule ID', 'Confidence Limit'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                                                </thead>
                                                <tbody>
                                                    {diagSuggestions.length === 0 && <tr><td colSpan={2} style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>No linked rules.</td></tr>}
                                                    {diagSuggestions.map((s, i) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ ...tdStyle, fontWeight: '600' }}>Rule #{s.SuggestionID}</td>
                                                            <td style={{ ...tdStyle, color: '#10b981', fontWeight: '700' }}>{s.ConfidenceLevel}%</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </BlockCard>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const inputStyle = {
    flex: '1',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '0.95rem',
    color: '#1e293b',
    outline: 'none',
    backgroundColor: '#f8fafc',
    transition: 'border-color 0.2s',
};

const btnStyle = (bg) => ({
    backgroundColor: bg,
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
});

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    border: 'none',
};

const thStyle = {
    padding: '16px 20px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '0.85rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #f1f5f9',
};

const tdStyle = {
    padding: '16px 20px',
    textAlign: 'left',
    fontSize: '0.95rem',
    color: '#475569',
};

const detailStyle = {
    margin: '0 0 8px 0',
    color: '#475569',
    fontSize: '0.95rem'
};

const badgeStyle = {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600'
};

export default ReportsAndDiagnostics;