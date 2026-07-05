import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// ─── Nav card data ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    {
        label: 'Book Appointment',
        description: 'Schedule a new patient session with a doctor',
        route: '/book',
        color: '#0ea5e9',
        bg: '#f0f9ff',
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="8" y1="14" x2="8" y2="14" />
                <line x1="12" y1="14" x2="12" y2="14" />
                <line x1="16" y1="14" x2="16" y2="14" />
            </svg>
        ),
    },
    {
        label: 'Cancel Appointment',
        description: 'Remove or reschedule an existing session',
        route: '/cancel',
        color: '#ef4444',
        bg: '#fff1f2',
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        ),
    },
    {
        label: 'Clear Dues',
        description: 'Settle outstanding balances and generate bills',
        route: '/clearpendingsdues',
        color: '#f59e0b',
        bg: '#fffbeb',
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
        ),
    },
    {
        label: 'Analyze Profits',
        description: 'Revenue insights by doctor or department',
        route: '/analyzeprofit',
        color: '#10b981',
        bg: '#f0fdf4',
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
            </svg>
        ),
    },
    {
        label: 'Manage Doctors',
        description: 'Add, update, or remove doctor profiles',
        route: '/doctors',
        color: '#8b5cf6',
        bg: '#faf5ff',
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
    {
        label: 'Pharmacy',
        description: 'Manage medicines, prescriptions and inventory',
        route: '/pharmacy',
        color: '#0ea5e9',
        bg: '#f0f9ff',
        pharmacyCard: true,
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" />
            </svg>
        ),
    },
    {
        label: 'Manage Sessions',
        description: 'View, create and modify consultation sessions',
        route: '/sessions',
        color: '#4f46e5',
        bg: '#eef2ff',
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        ),
    },
    {
        label: 'Reports & Diagnostics',
        description: 'Analytics, disease trends and patient insights',
        route: '/reports',
        color: '#0f172a',
        bg: '#f8fafc',
        icon: (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
        ),
    },
]

// ─── Clock hook ───────────────────────────────────────────────────────────────
function useClock() {
    const [now, setNow] = useState(new Date())
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(t)
    }, [])
    return now
}

// ─── Chart illustration SVG ───────────────────────────────────────────────────
function ChartIllustration() {
    return (
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="16" fill="#f1f5f9" />
            <rect x="14" y="44" width="12" height="24" rx="3" fill="#4f46e5" />
            <rect x="34" y="28" width="12" height="40" rx="3" fill="#10b981" />
            <rect x="54" y="36" width="12" height="32" rx="3" fill="#f59e0b" />
            <polyline points="20,44 40,28 60,36" stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

// ─── Arrow icon ───────────────────────────────────────────────────────────────
function ArrowIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
function Home() {
    const navigate = useNavigate()
    const [hasLowStock, setHasLowStock] = useState(false)
    const [mounted, setMounted] = useState(false)
    const now = useClock()

    useEffect(() => {
        const link = document.createElement('link')
        link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap'
        link.rel = 'stylesheet'
        document.head.appendChild(link)

        const style = document.createElement('style')
        style.textContent = `
            * { box-sizing: border-box; }
            @keyframes fadeSlideUp {
                from { opacity: 0; transform: translateY(20px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes pulse-ring {
                0%   { transform: scale(1);   opacity: 1; }
                70%  { transform: scale(2.2); opacity: 0; }
                100% { transform: scale(1);   opacity: 0; }
            }
            .hms-card {
                background: #ffffff;
                border-radius: 16px;
                padding: 24px 28px;
                border: 1.5px solid #e8edf2;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 20px;
                transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
                position: relative;
                overflow: hidden;
                opacity: 0;
                animation: fadeSlideUp 0.45s ease forwards;
            }
            .hms-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 32px rgba(0,0,0,0.08);
                border-color: #d1d5db;
            }
            .hms-card:hover .hms-arrow {
                opacity: 1;
                transform: translateX(0);
                color: #4f46e5;
            }
            .hms-card:hover .hms-icon-wrap {
                transform: scale(1.08);
            }
            .hms-arrow {
                opacity: 0.3;
                transform: translateX(-4px);
                transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease;
                color: #94a3b8;
                margin-left: auto;
                flex-shrink: 0;
            }
            .hms-icon-wrap {
                transition: transform 0.22s ease;
                flex-shrink: 0;
            }
            .low-stock-card {
                border-color: #fecaca !important;
            }
            .low-stock-card:hover {
                border-color: #fca5a5 !important;
                box-shadow: 0 12px 32px rgba(239,68,68,0.10) !important;
            }
        `
        document.head.appendChild(style)

        fetch('http://localhost:3000/getMedicines')
            .then(res => res.json())
            .then(data => {
                if (data?.data) {
                    setHasLowStock(data.data.some(med => med.CurrentQuantity < 20))
                }
            })
            .catch(err => console.error('Error fetching medicines:', err))

        setTimeout(() => setMounted(true), 50)
    }, [])

    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f4f7f9',
            fontFamily: "'Outfit', system-ui, sans-serif",
        }}>
            {/* ── Top bar ── */}
            <div style={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #f1f5f9',
                padding: '0 48px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 1px 12px rgba(0,0,0,0.04)',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px', height: '36px',
                        backgroundColor: '#4f46e5',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
                        MediCare <span style={{ color: '#4f46e5' }}>HMS</span>
                    </span>
                </div>

                {/* Clock */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a', letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums' }}>{timeStr}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Dashboard</div>
                </div>
            </div>

            {/* ── Main content ── */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px 64px' }}>

                {/* ── Welcome banner ── */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    padding: '36px 40px',
                    marginBottom: '36px',
                    border: '1.5px solid #e8edf2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '2.2rem',
                            fontWeight: '800',
                            color: '#0f172a',
                            letterSpacing: '-0.03em',
                            lineHeight: 1.2,
                            margin: '0 0 10px 0',
                        }}>
                            Welcome back, <span style={{ color: '#4f46e5' }}>Admin</span>
                        </h1>
                        <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0, fontWeight: '400' }}>
                            Hospital systems are fully operational. Select a module to begin.
                        </p>
                    </div>
                    <ChartIllustration />
                </div>

                {/* ── Card grid ── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                }}>
                    {NAV_ITEMS.map((item, i) => {
                        const isPharmacy = item.pharmacyCard
                        const alertActive = isPharmacy && hasLowStock
                        const cardColor = alertActive ? '#ef4444' : item.color
                        const cardBg = alertActive ? '#fff1f2' : item.bg

                        return (
                            <div
                                key={item.route}
                                className={`hms-card${alertActive ? ' low-stock-card' : ''}`}
                                style={{ animationDelay: `${i * 55}ms` }}
                                onClick={() => navigate(item.route)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && navigate(item.route)}
                            >
                                {/* Icon bubble */}
                                <div
                                    className="hms-icon-wrap"
                                    style={{
                                        width: '50px', height: '50px',
                                        borderRadius: '14px',
                                        backgroundColor: cardBg,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: cardColor,
                                        position: 'relative',
                                    }}
                                >
                                    {item.icon}
                                    {/* Low stock pulse dot */}
                                    {alertActive && (
                                        <span style={{
                                            position: 'absolute', top: '-4px', right: '-4px',
                                            width: '12px', height: '12px',
                                        }}>
                                            <span style={{
                                                display: 'block', width: '12px', height: '12px',
                                                backgroundColor: '#ef4444', borderRadius: '50%',
                                                position: 'absolute',
                                                animation: 'pulse-ring 1.4s ease-out infinite',
                                            }} />
                                            <span style={{
                                                display: 'block', width: '12px', height: '12px',
                                                backgroundColor: '#ef4444', borderRadius: '50%',
                                                position: 'relative',
                                            }} />
                                        </span>
                                    )}
                                </div>

                                {/* Text */}
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        color: '#0f172a',
                                        margin: '0 0 4px 0',
                                        letterSpacing: '-0.01em',
                                    }}>
                                        {item.label}
                                        {alertActive && (
                                            <span style={{
                                                marginLeft: '8px',
                                                fontSize: '0.68rem',
                                                backgroundColor: '#fecaca',
                                                color: '#ef4444',
                                                padding: '2px 8px',
                                                borderRadius: '20px',
                                                fontWeight: '700',
                                                verticalAlign: 'middle',
                                            }}>
                                                LOW STOCK
                                            </span>
                                        )}
                                    </h3>
                                    <p style={{
                                        fontSize: '0.875rem',
                                        color: '#94a3b8',
                                        margin: 0,
                                        lineHeight: 1.5,
                                        fontWeight: '400',
                                    }}>
                                        {item.description}
                                    </p>
                                </div>

                                {/* Arrow */}
                                <div className="hms-arrow">
                                    <ArrowIcon />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* ── Footer ── */}
                <div style={{
                    marginTop: '48px',
                    textAlign: 'center',
                }}>
                    <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Medicare Health Management System &bull; V2.4.0 &bull; Enterprise Edition
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Home