import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const BASE_URL = 'http://localhost:3000';

const Pharmacy = () => {
    const [medicines, setMedicines] = useState([]);
    const [top5Used, setTop5Used] = useState([]);
    const [top5Profits, setTop5Profits] = useState([]);
    const [activeView, setActiveView] = useState('inventory'); // 'inventory' | 'top5used' | 'top5profits'
    const [activeModal, setActiveModal] = useState(null); // 'addMedicine' | 'addStock'

    // Add Medicine form
    const [addForm, setAddForm] = useState({ Name: '', Type: '', Price: '', MinStock: '' });

    // Add Stock form
    const [stockForm, setStockForm] = useState({ ID: '', stock: '' });

    // ── Fetch all medicines ───────────────────────────────────────────────────
    const fetchMedicines = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/getMedicines`);
            setMedicines(res.data.data || []);
        } catch {
            toast.error('Failed to load pharmacy inventory.');
        }
    };

    const fetchTop5Used = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/top5medUsed`);
            setTop5Used(res.data.data || []);
        } catch {
            toast.error('Failed to load top used medicines.');
        }
    };

    const fetchTop5Profits = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/top5MedProfits`);
            setTop5Profits(res.data.data || []);
        } catch {
            toast.error('Failed to load top profit medicines.');
        }
    };

    useEffect(() => { fetchMedicines(); }, []);

    const handleTabChange = (view) => {
        setActiveView(view);
        if (view === 'top5used') fetchTop5Used();
        if (view === 'top5profits') fetchTop5Profits();
    };

    // ── Add Medicine ──────────────────────────────────────────────────────────
    const handleAddMedicine = async () => {
        if (!addForm.Name || !addForm.Type || !addForm.Price || !addForm.MinStock) {
            toast.warn('Please fill all fields.');
            return;
        }
        try {
            const res = await axios.post(`${BASE_URL}/addMedicine`, {
                Name: addForm.Name,
                Type: addForm.Type,
                Price: parseFloat(addForm.Price),
                MinStock: parseInt(addForm.MinStock),
            });
            if (res.data.success) {
                toast.success('Medicine added successfully.');
                setAddForm({ Name: '', Type: '', Price: '', MinStock: '' });
                setActiveModal(null);
                fetchMedicines();
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error('Error adding medicine.');
        }
    };

    // ── Add Stock ─────────────────────────────────────────────────────────────
    const handleAddStock = async () => {
        if (!stockForm.ID || !stockForm.stock) {
            toast.warn('Please fill all fields.');
            return;
        }
        try {
            const res = await axios.post(`${BASE_URL}/addMedicineStock`, {
                ID: parseInt(stockForm.ID),
                stock: parseInt(stockForm.stock),
            });
            if (res.data.success) {
                toast.success('Stock updated successfully.');
                setStockForm({ ID: '', stock: '' });
                setActiveModal(null);
                fetchMedicines();
            } else {
                toast.error(res.data.message);
            }
        } catch {
            toast.error('Error updating stock.');
        }
    };

    const closeModal = () => {
        setActiveModal(null);
        setAddForm({ Name: '', Type: '', Price: '', MinStock: '' });
        setStockForm({ ID: '', stock: '' });
    };

    // ── Tab Button ────────────────────────────────────────────────────────────
    const TabBtn = ({ label, view }) => (
        <button
            onClick={() => handleTabChange(view)}
            style={{
                padding: '10px 24px',
                borderRadius: '30px',
                border: activeView === view ? 'none' : '1px solid #e2e8f0',
                fontWeight: activeView === view ? '600' : '500',
                fontSize: '0.9rem',
                cursor: 'pointer',
                backgroundColor: activeView === view ? '#4f46e5' : '#ffffff',
                color: activeView === view ? '#ffffff' : '#64748b',
                boxShadow: activeView === view ? '0 4px 14px rgba(79, 70, 229, 0.35)' : '0 2px 4px rgba(0,0,0,0.02)',
                transition: 'all 0.25s ease',
            }}
        >
            {label}
        </button>
    );

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f4f7f9', padding: '40px 20px', fontFamily: "'Inter', system-ui, sans-serif" }}>
            <ToastContainer theme="light" position="top-right" />

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontWeight: '800', fontSize: '2.5rem', letterSpacing: '-0.02em', color: '#0f172a', margin: 0 }}>
                    Pharmacy Inventory
                </h1>
                <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px' }}>Manage stock levels, top usages, and profitability</p>
            </div>

            {/* Action Buttons (MOVED TO TOP) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
                <button onClick={() => setActiveModal('addMedicine')} style={btnStyle('#0ea5e9')}>
                    + Add New Medicine
                </button>
                <button onClick={() => setActiveModal('addStock')} style={btnStyle('#4f46e5')}>
                    + Add Medicine Stock
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <TabBtn label="Inventory" view="inventory" />
                <TabBtn label="Top 5 Used" view="top5used" />
                <TabBtn label="Top 5 Profits" view="top5profits" />
            </div>

            {/* ── Inventory Table ── */}
            {activeView === 'inventory' && (
                <>
                    <div style={{ overflowX: 'auto', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc' }}>
                                    {['ID', 'Name', 'Type', 'Price (Rs.)', 'Current Stock', 'Minimum Stock Level', 'Last Update'].map(h => (
                                        <th key={h} style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f1f5f9' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.length === 0 ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No medicines found.</td></tr>
                                ) : medicines.map((m, i) => {
                                    const lowStock = m.CurrentQuantity < m.MinimumStockLevel;
                                    const outOfStock = m.CurrentQuantity === 0;
                                    return (
                                        <tr key={m.MedicineID} style={{
                                            backgroundColor: lowStock ? '#ef9797ff' : 'transparent',
                                            borderBottom: '1px solid #f1f5f9',
                                            transition: 'background-color 0.2s'
                                        }}>
                                            <td style={{ ...tdStyle, color: '#171718ff', fontWeight: '500' }}>{m.MedicineID}</td>
                                            <td style={{ ...tdStyle, fontWeight: '600', color: '#1e293b', fontSize: '1.05rem' }}>{m.Name}</td>
                                            <td style={tdStyle}>
                                                <span style={{ backgroundColor: '#f1f5f9', padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>
                                                    {m.Type}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>Rs. {m.Price}</td>
                                            <td style={{ ...tdStyle, color: outOfStock ? '#ef4444' : lowStock ? '#d97706' : '#10b981', fontWeight: '700', fontSize: '1.05rem' }}>
                                                {m.CurrentQuantity}
                                            </td>
                                            <td style={tdStyle}>{m.MinimumStockLevel}</td>
                                            <td style={tdStyle}>{m.LastUpdated ? new Date(m.LastUpdated).toLocaleDateString() : '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Low stock legend */}
                    <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '3px', marginRight: '8px', verticalAlign: 'middle' }}></span>
                        Highlighted rows indicate current stock is below the minimum required level
                    </p>
                </>
            )}

            {/* ── Top 5 Used ── */}
            {activeView === 'top5used' && (
                <div style={{ overflowX: 'auto', maxWidth: '700px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <table style={tableStyle}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                                {['Rank', 'ID', 'Name', 'Total Usage'].map(h => (
                                    <th key={h} style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f1f5f9' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {top5Used.length === 0 ? (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No data found.</td></tr>
                            ) : top5Used.map((m, i) => (
                                <tr key={m.MedicineID} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ ...tdStyle, fontWeight: '800', fontSize: '1.1rem', color: i === 0 ? '#d97706' : i === 1 ? '#64748b' : i === 2 ? '#b45309' : '#94a3b8' }}>#{i + 1}</td>
                                    <td style={{ ...tdStyle, color: '#94a3b8' }}>{m.MedicineID}</td>
                                    <td style={{ ...tdStyle, fontWeight: '600', color: '#1e293b' }}>{m.Name}</td>
                                    <td style={{ ...tdStyle, fontWeight: '700', color: '#0ea5e9', fontSize: '1.05rem' }}>{m.total_usage}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Top 5 Profits ── */}
            {activeView === 'top5profits' && (
                <div style={{ overflowX: 'auto', maxWidth: '700px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <table style={tableStyle}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                                {['Rank', 'ID', 'Name', 'Sales Revenue (Rs.)'].map(h => (
                                    <th key={h} style={{ padding: '16px', textAlign: 'center', fontWeight: '600', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #f1f5f9' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {top5Profits.length === 0 ? (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No data found.</td></tr>
                            ) : top5Profits.map((m, i) => (
                                <tr key={m.MedicineID} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ ...tdStyle, fontWeight: '800', fontSize: '1.1rem', color: i === 0 ? '#d97706' : i === 1 ? '#64748b' : i === 2 ? '#b45309' : '#94a3b8' }}>#{i + 1}</td>
                                    <td style={{ ...tdStyle, color: '#94a3b8' }}>{m.MedicineID}</td>
                                    <td style={{ ...tdStyle, fontWeight: '600', color: '#1e293b' }}>{m.Name}</td>
                                    <td style={{ ...tdStyle, fontWeight: '700', color: '#10b981', fontSize: '1.05rem' }}>Rs. {Number(m.SalesAmount).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ══════════════════════════════════════════
                MODALS
            ══════════════════════════════════════════ */}

            {/* ── Add Medicine Modal ── */}
            {activeModal === 'addMedicine' && (
                <div style={overlayStyle}>
                    <div style={modalBoxStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontWeight: '700', color: '#0f172a' }}>Register Medicine</h3>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {/* Form Fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            {[
                                { label: 'Medicine Name', key: 'Name', placeholder: 'e.g. Paracetamol', type: 'text', full: true },
                                { label: 'Type', key: 'Type', placeholder: 'e.g. Tablet, Syrup', type: 'text', full: false },
                                { label: 'Price (Rs.)', key: 'Price', placeholder: '0.00', type: 'number', full: false },
                                { label: 'Minimum Stock Level', key: 'MinStock', placeholder: 'e.g. 50', type: 'number', full: true },
                            ].map(({ label, key, placeholder, type, full }) => (
                                <div key={key} style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
                                    <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>{label}</label>
                                    <input
                                        type={type}
                                        placeholder={placeholder}
                                        value={addForm[key]}
                                        onChange={e => setAddForm({ ...addForm, [key]: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                            <button onClick={closeModal} style={{ ...btnStyle('#ffffff'), color: '#475569', border: '1px solid #cbd5e1' }}>Cancel</button>
                            <button onClick={handleAddMedicine} style={{ ...btnStyle('#0ea5e9'), boxShadow: '0 4px 10px rgba(14, 165, 233, 0.3)' }}>Add Medicine</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Stock Modal ── */}
            {activeModal === 'addStock' && (
                <div style={overlayStyle}>
                    <div style={modalBoxStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontWeight: '700', color: '#0f172a' }}>Update Stock</h3>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>Select Medicine</label>
                            <select
                                value={stockForm.ID}
                                onChange={e => setStockForm({ ...stockForm, ID: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="">— Select a medicine —</option>
                                {medicines.map(m => (
                                    <option key={m.MedicineID} value={m.MedicineID}>
                                        {m.Name} (ID: {m.MedicineID}) — Current Stock: {m.CurrentQuantity}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>Quantity to Add</label>
                            <input
                                type="number"
                                placeholder="Enter quantity amount"
                                value={stockForm.stock}
                                onChange={e => setStockForm({ ...stockForm, stock: e.target.value })}
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                            <button onClick={closeModal} style={{ ...btnStyle('#ffffff'), color: '#475569', border: '1px solid #cbd5e1' }}>Cancel</button>
                            <button onClick={handleAddStock} style={{ ...btnStyle('#4f46e5'), boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }}>Update Stock</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Shared Styles ────────────────────────────────────────────────────────────
const tdStyle = {
    padding: '16px',
    textAlign: 'center',
    fontSize: '0.95rem',
    color: '#475569',
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    border: 'none',
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

const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1050,
};

const modalBoxStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '32px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
};

const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '0.95rem',
    color: '#1e293b',
    outline: 'none',
    backgroundColor: '#f8fafc',
    transition: 'border-color 0.2s',
};

export default Pharmacy;