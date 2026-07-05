// ── copied directly from your original script.js ──────────────────────────
export function formatTime(timeStr) {
    return timeStr.split('T')[1].slice(0, 5)
}
export function formatDate(dateStr) {
    return dateStr.split('T')[0]
}
