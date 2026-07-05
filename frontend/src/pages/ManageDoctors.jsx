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

// ─── Section Tab Button ───────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────
const ManageDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [activeModal, setActiveModal] = useState(null); // 'add' | 'details' | 'availability' | 'charges' | 'earnings' | 'editInfo' | 'editAvail' | 'editCharges' | 'free' | 'dual'
    const [detailsData, setDetailsData] = useState(null);
    const [availabilityData, setAvailabilityData] = useState([]);
    const [chargesData, setChargesData] = useState([]);
    const [earningsData, setEarningsData] = useState(null);
    const [freeDoctors, setFreeDoctors] = useState([]);
    const [dualDoctors, setDualDoctors] = useState([]);
    const [activeView, setActiveView] = useState('all'); // 'all' | 'free' | 'dual'

    // Edit form states
    const [editInfoForm, setEditInfoForm] = useState({ name: '', age: '', gender: '', specialization: '' });
    const [editAvailForm, setEditAvailForm] = useState({ timeID: '', dayOfWeek: '', startTime: '', endTime: '' });
    const [editChargesForm, setEditChargesForm] = useState({ chargeID: '', sessionType: '', newCharges: '' });

    // Add doctor form
    const [addForm, setAddForm] = useState({ name: '', age: '', gender: 'M', specialization: '' });

    const closeModal = () => {
        setActiveModal(null);
        setDetailsData(null);
        setAvailabilityData([]);
        setChargesData([]);
        setEarningsData(null);
    };

    // ── Fetch all doctors ──────────────────────────────────────────────────────
    const fetchDoctors = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/getDoctorList`);
            setDoctors(res.data.data || []);
        } catch {
            toast.error('Failed to load doctor list.');
        }
    };

    useEffect(() => { fetchDoctors(); }, []);

    // ── Add Doctor ─────────────────────────────────────────────────────────────
    const handleAddDoctor = async () => {
        if (!addForm.name || !addForm.age || !addForm.specialization) {
            toast.warn('Please fill all fields.');
            return;
        }
        try {
            const res = await axios.post(`${BASE_URL}/addDoctor`, {
                name: addForm.name,
                age: parseInt(addForm.age),
                gender: addForm.gender,
                specialization: addForm.specialization,
            });
            if (res.data.success) {
                toast.success('Doctor added successfully.');
                setAddForm({ name: '', age: '', gender: 'M', specialization: '' });
                closeModal();
                fetchDoctors();
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error adding doctor.');
        }
    };

    // ── View Details ───────────────────────────────────────────────────────────
    const handleViewDetails = async (doc) => {
        setSelectedDoctor(doc);
        try {
            const res = await axios.get(`${BASE_URL}/viewDoctorDetails/${doc.DoctorID}`);
            setDetailsData(res.data.data);
            setActiveModal('details');
        } catch {
            toast.error('Failed to load doctor details.');
        }
    };

    // ── View Availability ──────────────────────────────────────────────────────
    const handleViewAvailability = async (doc) => {
        setSelectedDoctor(doc);
        try {
            const res = await axios.get(`${BASE_URL}/viewDoctorAvailability/${doc.DoctorID}`);
            setAvailabilityData(res.data.data || []);
            setActiveModal('availability');
        } catch {
            toast.error('Failed to load availability.');
        }
    };

    // ── View Charges ───────────────────────────────────────────────────────────
    const handleViewCharges = async (doc) => {
        setSelectedDoctor(doc);
        try {
            const res = await axios.get(`${BASE_URL}/viewDoctorCharges/${doc.DoctorID}`);
            setChargesData(res.data.data || []);
            setActiveModal('charges');
        } catch {
            toast.error('Failed to load charges.');
        }
    };

    // ── View Earnings ──────────────────────────────────────────────────────────
    const handleViewEarnings = async (doc) => {
        setSelectedDoctor(doc);
        try {
            const res = await axios.get(`${BASE_URL}/getDoctorTotalEarnings/${doc.DoctorID}`);
            setEarningsData(res.data.data);
            setActiveModal('earnings');
        } catch {
            toast.error('Failed to load earnings.');
        }
    };

    // ── Delete Doctor ──────────────────────────────────────────────────────────
    const handleDelete = async (doc) => {
        if (!window.confirm(`Delete Dr. ${doc.Name}? This cannot be undone.`)) return;
        try {
            const res = await axios.delete(`${BASE_URL}/deleteDoctor/${doc.DoctorID}`);
            if (res.data.success) {
                toast.success('Doctor deleted.');
                fetchDoctors();
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error('Error deleting doctor.');
        }
    };

    // ── Edit Doctor Info ───────────────────────────────────────────────────────
    const handleOpenEditInfo = (doc) => {
        setSelectedDoctor(doc);
        setEditInfoForm({ name: doc.Name || '', age: '', gender: '', specialization: '' });
        setActiveModal('editInfo');
    };

    const handleEditInfo = async () => {
        try {
            const payload = {};
            if (editInfoForm.name) payload.name = editInfoForm.name;
            if (editInfoForm.age) payload.age = parseInt(editInfoForm.age);
            if (editInfoForm.gender) payload.gender = editInfoForm.gender;
            if (editInfoForm.specialization) payload.specialization = editInfoForm.specialization;

            const res = await axios.put(`${BASE_URL}/editDoctorInfo/${selectedDoctor.DoctorID}`, payload);
            if (res.data.success) {
                toast.success('Doctor info updated.');
                closeModal();
                fetchDoctors();
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error('Error updating doctor info.');
        }
    };

    // ── Edit Availability ─────────────────────────────────────────────────────
    const handleOpenEditAvail = (slot) => {
        setEditAvailForm({ timeID: slot.TimeID, dayOfWeek: slot.DayOfWeek || '', startTime: '', endTime: '' });
        setActiveModal('editAvail');
    };

    const handleEditAvailability = async () => {
        try {
            const payload = {};
            if (editAvailForm.dayOfWeek) payload.dayOfWeek = editAvailForm.dayOfWeek;
            if (editAvailForm.startTime) payload.startTime = editAvailForm.startTime;
            if (editAvailForm.endTime) payload.endTime = editAvailForm.endTime;

            const res = await axios.put(`${BASE_URL}/editDoctorAvailability/${editAvailForm.timeID}`, payload);
            if (res.data.success) {
                toast.success('Availability updated.');
                // Re-fetch availability for current doctor
                const r2 = await axios.get(`${BASE_URL}/viewDoctorAvailability/${selectedDoctor.DoctorID}`);
                setAvailabilityData(r2.data.data || []);
                setActiveModal('availability');
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error('Error updating availability.');
        }
    };

    // ── Edit Charges ───────────────────────────────────────────────────────────
    const handleOpenEditCharges = (charge) => {
        setEditChargesForm({ chargeID: charge.ChargeID, sessionType: charge.SessionType || '', newCharges: '' });
        setActiveModal('editCharges');
    };

    const handleEditCharges = async () => {
        try {
            const payload = {};
            if (editChargesForm.sessionType) payload.sessionType = editChargesForm.sessionType;
            if (editChargesForm.newCharges) payload.newCharges = parseFloat(editChargesForm.newCharges);

            const res = await axios.put(`${BASE_URL}/editDoctorCharges/${editChargesForm.chargeID}`, payload);
            if (res.data.success) {
                toast.success('Charges updated.');
                const r2 = await axios.get(`${BASE_URL}/viewDoctorCharges/${selectedDoctor.DoctorID}`);
                setChargesData(r2.data.data || []);
                setActiveModal('charges');
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error('Error updating charges.');
        }
    };

    // ── Free Doctors ───────────────────────────────────────────────────────────
    const handleViewFree = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/getFreeDoctors`);
            setFreeDoctors(res.data.data || []);
            setActiveView('free');
        } catch {
            toast.error('Failed to load free doctors.');
        }
    };

    // ── Dual Doctors ───────────────────────────────────────────────────────────
    const handleViewDual = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/getDualDoctors`);
            setDualDoctors(res.data.data || []);
            setActiveView('dual');
        } catch {
            toast.error('Failed to load dual-role doctors.');
        }
    };


    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="container-fluid min-vh-100 p-4" style={{ backgroundColor: '#f4f7f9', fontFamily: "'Inter', system-ui, sans-serif" }}>
            <ToastContainer theme="light" position="top-right" />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="fw-bolder mb-1" style={{ letterSpacing: '-0.02em', color: '#0f172a', fontSize: '2rem' }}>
                        Manage Doctors
                    </h2>
                    <p className="small mb-0" style={{ color: '#64748b', fontWeight: '500' }}>Administration Panel — Doctor Records & Insights</p>
                </div>
                <button
                    className="btn"
                    onClick={() => setActiveModal('add')}
                    style={{ backgroundColor: '#0ea5e9', color: '#fff', fontWeight: '600', padding: '0.6rem 1.25rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)' }}
                >
                    + Add New Doctor
                </button>
            </div>

            {/* View Tabs */}
            <div className="mb-4 d-flex flex-wrap">
                <TabBtn label="All Doctors" active={activeView === 'all'} onClick={() => setActiveView('all')} />
                <TabBtn label="Free Doctors" active={activeView === 'free'} onClick={handleViewFree} />
                <TabBtn label="Dual-Role Doctors" active={activeView === 'dual'} onClick={handleViewDual} />
            </div>

            {/* ── All Doctors Table ── */}
            {activeView === 'all' && (
                <div className="table-responsive bg-white" style={{ borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <table className="table table-hover mb-0 border-0">
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr>
                                <th style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f1f5f9', padding: '1rem' }}>#</th>
                                <th style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f1f5f9', padding: '1rem' }}>Name</th>
                                <th className="text-end" style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f1f5f9', padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.length === 0 ? (
                                <tr><td colSpan={3} className="text-center text-muted py-5">No doctors found.</td></tr>
                            ) : doctors.map((doc, i) => (
                                <tr key={doc.DoctorID} style={{ transition: 'all 0.2s' }}>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#94a3b8', fontWeight: '500' }}>{i + 1}</td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#1e293b', fontWeight: '600', fontSize: '1.05rem' }}>{doc.Name}</td>
                                    <td className="text-end" style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem' }}>
                                        <div className="d-flex justify-content-end flex-wrap gap-2">
                                            <button className="btn btn-sm" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '8px', fontWeight: '600', padding: '0.4rem 0.8rem' }} onClick={() => handleViewDetails(doc)}>Details</button>
                                            <button className="btn btn-sm" style={{ backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '8px', fontWeight: '600', padding: '0.4rem 0.8rem' }} onClick={() => handleViewAvailability(doc)}>Availability</button>
                                            <button className="btn btn-sm" style={{ backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '8px', fontWeight: '600', padding: '0.4rem 0.8rem' }} onClick={() => handleViewCharges(doc)}>Charges</button>
                                            <button className="btn btn-sm" style={{ backgroundColor: '#ede9fe', color: '#7c3aed', borderRadius: '8px', fontWeight: '600', padding: '0.4rem 0.8rem' }} onClick={() => handleViewEarnings(doc)}>Earnings</button>
                                            <button className="btn btn-sm" style={{ backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '8px', fontWeight: '600', padding: '0.4rem 0.8rem' }} onClick={() => handleOpenEditInfo(doc)}>Edit</button>
                                            <button className="btn btn-sm" style={{ backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '8px', fontWeight: '600', padding: '0.4rem 0.8rem' }} onClick={() => handleDelete(doc)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Free Doctors Table ── */}
            {activeView === 'free' && (
                <div className="table-responsive bg-white" style={{ borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500', marginBottom: '1.5rem' }}>Doctors currently with no active booked sessions.</p>
                    <table className="table table-hover mb-0 border-0">
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr>
                                <th style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f1f5f9', padding: '1rem' }}>#</th>
                                <th style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f1f5f9', padding: '1rem' }}>Doctor ID</th>
                                <th style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f1f5f9', padding: '1rem' }}>Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {freeDoctors.length === 0 ? (
                                <tr><td colSpan={3} className="text-center py-5" style={{ color: '#94a3b8' }}>No free doctors found.</td></tr>
                            ) : freeDoctors.map((d, i) => (
                                <tr key={d.DoctorID}>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#94a3b8', fontWeight: '500' }}>{i + 1}</td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#64748b' }}>{d.DoctorID}</td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#1e293b', fontWeight: '600' }}>{d.DoctorName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Dual-Role Doctors Table ── */}
            {activeView === 'dual' && (
                <div className="table-responsive bg-white" style={{ borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500', marginBottom: '1.5rem' }}>Doctors who have handled both Consultation and Operation sessions.</p>
                    <table className="table table-hover mb-0 border-0">
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr>
                                {['#', 'Doctor', 'Session ID', 'Session Type', 'Date', 'Start', 'End'].map((heading, idx) => (
                                    <th key={idx} style={{ color: '#64748b', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f1f5f9', padding: '1rem' }}>{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dualDoctors.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-5" style={{ color: '#94a3b8' }}>No dual-role doctors found.</td></tr>
                            ) : dualDoctors.map((d, i) => (
                                <tr key={`${d.DoctorID}-${d.SessionID}`}>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#94a3b8', fontWeight: '500' }}>{i + 1}</td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#1e293b', fontWeight: '600' }}>{d.Name}</td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#64748b' }}>{d.SessionID}</td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#1e293b', fontWeight: '600' }}>{d.SessionType}</td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#64748b' }}>{d.SessionDate ? new Date(d.SessionDate).toLocaleDateString() : '—'}</td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#64748b' }}>{d.StartTime || '—'}</td>
                                    <td style={{ verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', padding: '1rem', color: '#64748b' }}>{d.EndTime || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ══════════════════════════════════════════
                MODALS
            ══════════════════════════════════════════ */}

            {/* ── Add Doctor ── */}
            {activeModal === 'add' && (
                <Modal title="Add New Doctor" onClose={closeModal}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Full Name</label>
                            <input className="form-control"
                                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                value={addForm.name}
                                onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                                placeholder="Dr. John Smith" />
                        </div>
                        <div className="col-md-3">
                            <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Age</label>
                            <input type="number" className="form-control"
                                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                value={addForm.age}
                                onChange={e => setAddForm({ ...addForm, age: e.target.value })}
                                placeholder="35" />
                        </div>
                        <div className="col-md-3">
                            <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Gender</label>
                            <select className="form-select"
                                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                value={addForm.gender}
                                onChange={e => setAddForm({ ...addForm, gender: e.target.value })}>
                                <option value="M">Male (M)</option>
                                <option value="F">Female (F)</option>
                            </select>
                        </div>
                        <div className="col-12">
                            <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Specialization</label>
                            <input className="form-control"
                                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                value={addForm.specialization}
                                onChange={e => setAddForm({ ...addForm, specialization: e.target.value })}
                                placeholder="e.g. Cardiology" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 d-flex justify-content-end gap-3 border-top" style={{ borderColor: '#f1f5f9' }}>
                        <button className="btn" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600', borderRadius: '10px', padding: '0.6rem 1.25rem' }} onClick={closeModal}>Cancel</button>
                        <button className="btn" style={{ backgroundColor: '#0ea5e9', border: 'none', color: '#ffffff', fontWeight: '600', borderRadius: '10px', padding: '0.6rem 1.25rem', boxShadow: '0 4px 10px rgba(14, 165, 233, 0.3)' }} onClick={handleAddDoctor}>Save Doctor</button>
                    </div>
                </Modal>
            )}

            {/* ── Doctor Details ── */}
            {activeModal === 'details' && detailsData && (
                <Modal title={`Doctor Profile`} onClose={closeModal}>
                    <div className="row g-4 p-2">
                        {[
                            { label: 'Doctor ID', value: detailsData.DoctorID },
                            { label: 'Name', value: detailsData.Name },
                            { label: 'Age', value: detailsData.Age },
                            { label: 'Gender', value: detailsData.Gender === 'M' ? 'Male' : 'Female' },
                            { label: 'Specialization', value: detailsData.Specialization },
                        ].map(({ label, value }) => (
                            <div key={label} className="col-md-4">
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</p>
                                <p style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{value || '—'}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 d-flex justify-content-end border-top" style={{ borderColor: '#f1f5f9' }}>
                        <button className="btn" style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '600', borderRadius: '10px', padding: '0.5rem 1.25rem' }} onClick={() => handleOpenEditInfo(selectedDoctor)}>Edit Information</button>
                    </div>
                </Modal>
            )}

            {/* ── Availability ── */}
            {activeModal === 'availability' && (
                <Modal title={`Schedule: ${selectedDoctor?.Name}`} onClose={closeModal}>
                    {availabilityData.length === 0 ? (
                        <p style={{ color: '#94a3b8', padding: '2rem 0', textAlign: 'center' }}>No availability slots configured.</p>
                    ) : (
                        <div className="table-responsive" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <table className="table table-hover mb-0 border-0">
                                <thead style={{ backgroundColor: '#f8fafc' }}>
                                    <tr>
                                        {['Time ID', 'Day', 'Start', 'End', ''].map((h, i) => (
                                            <th key={i} style={{ color: '#64748b', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', padding: '0.75rem 1rem' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {availabilityData.map(slot => (
                                        <tr key={slot.TimeID}>
                                            <td style={{ padding: '1rem', verticalAlign: 'middle', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>{slot.TimeID}</td>
                                            <td style={{ padding: '1rem', verticalAlign: 'middle', color: '#1e293b', fontWeight: '600', borderBottom: '1px solid #f1f5f9' }}>{slot.DayOfWeek || '—'}</td>
                                            <td style={{ padding: '1rem', verticalAlign: 'middle', color: '#475569', borderBottom: '1px solid #f1f5f9' }}>{slot.StartTime || '—'}</td>
                                            <td style={{ padding: '1rem', verticalAlign: 'middle', color: '#475569', borderBottom: '1px solid #f1f5f9' }}>{slot.EndTime || '—'}</td>
                                            <td style={{ padding: '1rem', verticalAlign: 'middle', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>
                                                <button className="btn btn-sm"
                                                    style={{ backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '8px', fontWeight: '600', padding: '0.3rem 0.75rem' }}
                                                    onClick={() => handleOpenEditAvail(slot)}>
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Modal>
            )}

            {/* ── Edit Availability ── */}
            {activeModal === 'editAvail' && (
                <Modal title={`Edit Slot #${editAvailForm.timeID}`} onClose={() => setActiveModal('availability')}>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Update the timings for this specific slot.</p>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Day of Week</label>
                            <select className="form-select"
                                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                value={editAvailForm.dayOfWeek}
                                onChange={e => setEditAvailForm({ ...editAvailForm, dayOfWeek: e.target.value })}>
                                <option value="">— Keep existing —</option>
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Start Time</label>
                            <input type="time" className="form-control"
                                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                value={editAvailForm.startTime}
                                onChange={e => setEditAvailForm({ ...editAvailForm, startTime: e.target.value })} />
                        </div>
                        <div className="col-md-4">
                            <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>End Time</label>
                            <input type="time" className="form-control"
                                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                value={editAvailForm.endTime}
                                onChange={e => setEditAvailForm({ ...editAvailForm, endTime: e.target.value })} />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 d-flex justify-content-end gap-3 border-top" style={{ borderColor: '#f1f5f9' }}>
                        <button className="btn" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600', borderRadius: '10px', padding: '0.6rem 1.25rem' }} onClick={() => setActiveModal('availability')}>Back</button>
                        <button className="btn" style={{ backgroundColor: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '600', borderRadius: '10px', padding: '0.6rem 1.25rem', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }} onClick={handleEditAvailability}>Save Slot</button>
                    </div>
                </Modal>
            )}

            {/* ── Charges ── */}
            {activeModal === 'charges' && (
                <Modal title={`Fees Structure: ${selectedDoctor?.Name}`} onClose={closeModal}>
                    {chargesData.length === 0 ? (
                        <p style={{ color: '#94a3b8', padding: '2rem 0', textAlign: 'center' }}>No fee structures configured.</p>
                    ) : (
                        <div className="table-responsive" style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <table className="table table-hover mb-0 border-0">
                                <thead style={{ backgroundColor: '#f8fafc' }}>
                                    <tr>
                                        {['Charge ID', 'Session Type', 'Amount (PKR)', ''].map((h, i) => (
                                            <th key={i} style={{ color: '#64748b', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', padding: '0.75rem 1rem' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {chargesData.map(c => (
                                        <tr key={c.ChargeID}>
                                            <td style={{ padding: '1rem', verticalAlign: 'middle', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>{c.ChargeID}</td>
                                            <td style={{ padding: '1rem', verticalAlign: 'middle', color: '#1e293b', fontWeight: '600', borderBottom: '1px solid #f1f5f9' }}>
                                                <span style={{ backgroundColor: '#f1f5f9', padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.85rem', color: '#475569' }}>
                                                    {c.SessionType || '—'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', verticalAlign: 'middle', color: '#0f172a', fontWeight: '700', fontSize: '1.05rem', borderBottom: '1px solid #f1f5f9' }}>{c.Charges != null ? `Rs. ${Number(c.Charges).toLocaleString()}` : '—'}</td>
                                            <td style={{ padding: '1rem', verticalAlign: 'middle', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>
                                                <button className="btn btn-sm"
                                                    style={{ backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '8px', fontWeight: '600', padding: '0.3rem 0.75rem' }}
                                                    onClick={() => handleOpenEditCharges(c)}>
                                                    Update
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Modal>
            )}

            {/* ── Edit Charges ── */}
            {activeModal === 'editCharges' && (
                <Modal title={`Update Fee — ID #${editChargesForm.chargeID}`} onClose={() => setActiveModal('charges')}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Session Category</label>
                            <select className="form-select"
                                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                value={editChargesForm.sessionType}
                                onChange={e => setEditChargesForm({ ...editChargesForm, sessionType: e.target.value })}>
                                <option value="">— Keep existing —</option>
                                <option value="Consultation">Consultation</option>
                                <option value="Operation">Operation</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Amount (PKR)</label>
                            <input type="number" className="form-control"
                                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                value={editChargesForm.newCharges}
                                onChange={e => setEditChargesForm({ ...editChargesForm, newCharges: e.target.value })}
                                placeholder="e.g. 2500" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 d-flex justify-content-end gap-3 border-top" style={{ borderColor: '#f1f5f9' }}>
                        <button className="btn" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600', borderRadius: '10px', padding: '0.6rem 1.25rem' }} onClick={() => setActiveModal('charges')}>Back</button>
                        <button className="btn" style={{ backgroundColor: '#0ea5e9', border: 'none', color: '#ffffff', fontWeight: '600', borderRadius: '10px', padding: '0.6rem 1.25rem', boxShadow: '0 4px 10px rgba(14, 165, 233, 0.3)' }} onClick={handleEditCharges}>Save Changes</button>
                    </div>
                </Modal>
            )}

            {/* ── Edit Info ── */}
            {activeModal === 'editInfo' && selectedDoctor && (
                <Modal title={`Edit Profile — ${selectedDoctor.Name}`} onClose={closeModal}>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Update personal details. Leave blank to retain existing data.</p>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Full Name</label>
                            <input className="form-control"
                                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                value={editInfoForm.name}
                                onChange={e => setEditInfoForm({ ...editInfoForm, name: e.target.value })}
                                placeholder={selectedDoctor.Name} />
                        </div>
                        <div className="col-md-3">
                            <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Age</label>
                            <input type="number" className="form-control"
                                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                value={editInfoForm.age}
                                onChange={e => setEditInfoForm({ ...editInfoForm, age: e.target.value })}
                                placeholder="Age" />
                        </div>
                        <div className="col-md-3">
                            <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Gender</label>
                            <select className="form-select"
                                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                value={editInfoForm.gender}
                                onChange={e => setEditInfoForm({ ...editInfoForm, gender: e.target.value })}>
                                <option value="">— Keep —</option>
                                <option value="M">Male (M)</option>
                                <option value="F">Female (F)</option>
                            </select>
                        </div>
                        <div className="col-12">
                            <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Specialization</label>
                            <input className="form-control"
                                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', color: '#1e293b' }}
                                value={editInfoForm.specialization}
                                onChange={e => setEditInfoForm({ ...editInfoForm, specialization: e.target.value })}
                                placeholder="Specialization" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 d-flex justify-content-end gap-3 border-top" style={{ borderColor: '#f1f5f9' }}>
                        <button className="btn" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600', borderRadius: '10px', padding: '0.6rem 1.25rem' }} onClick={closeModal}>Cancel</button>
                        <button className="btn" style={{ backgroundColor: '#4f46e5', border: 'none', color: '#ffffff', fontWeight: '600', borderRadius: '10px', padding: '0.6rem 1.25rem', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }} onClick={handleEditInfo}>Save Changes</button>
                    </div>
                </Modal>
            )}

            {/* ── Earnings ── */}
            {activeModal === 'earnings' && (
                <Modal title={`Revenue Report`} onClose={closeModal}>
                    {!earningsData ? (
                        <p style={{ color: '#94a3b8', padding: '2rem 0', textAlign: 'center' }}>No historical earnings data found.</p>
                    ) : (
                        <div>
                            <div className="d-flex align-items-center mb-4 pb-3 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.2rem', marginRight: '1rem' }}>
                                    {earningsData.DoctorName ? earningsData.DoctorName.charAt(0) : 'D'}
                                </div>
                                <div>
                                    <h5 style={{ margin: 0, fontWeight: '700', color: '#0f172a' }}>{earningsData.DoctorName}</h5>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>{earningsData.Specialization}</p>
                                </div>
                            </div>

                            <div className="row g-3">
                                {[
                                    { label: 'Completed Sessions', value: earningsData.TotalCompletedSessions, bg: '#f1f5f9', color: '#334155' },
                                    { label: 'Consultations', value: earningsData.TotalConsultations, bg: '#f1f5f9', color: '#334155' },
                                    { label: 'Operations', value: earningsData.TotalOperations, bg: '#f1f5f9', color: '#334155' },
                                    { label: 'Consultation Rev', value: earningsData.ConsultationEarnings != null ? `Rs. ${Number(earningsData.ConsultationEarnings).toLocaleString()}` : '—', bg: '#e0f2fe', color: '#0284c7' },
                                    { label: 'Operation Rev', value: earningsData.OperationEarnings != null ? `Rs. ${Number(earningsData.OperationEarnings).toLocaleString()}` : '—', bg: '#fef3c7', color: '#d97706' },
                                    { label: 'Total Earnings', value: earningsData.TotalEarnings != null ? `Rs. ${Number(earningsData.TotalEarnings).toLocaleString()}` : '—', bg: '#dcfce7', color: '#166534', highlight: true },
                                ].map(({ label, value, bg, color, highlight }) => (
                                    <div key={label} className={highlight ? "col-12" : "col-md-4"}>
                                        <div style={{ backgroundColor: bg, borderRadius: '12px', padding: '1.25rem', border: highlight ? '2px solid #bbf7d0' : 'none' }}>
                                            <p style={{ color: highlight ? '#166534' : '#64748b', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{label}</p>
                                            <p style={{ color: color, fontSize: highlight ? '1.75rem' : '1.25rem', fontWeight: '700', margin: 0 }}>{value ?? '—'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
};

export default ManageDoctors;