import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import BookAppointment from './pages/BookAppointment'
import CancelAppointment from './pages/CancelAppointment'
import ClearDues from './pages/ClearDues'
import AnalyzeProfits from './pages/AnalyzeProfits'
import ManageDoctors from './pages/ManageDoctors'
import Pharmacy from './pages/Pharmacy'
import ManageSessions from './pages/ManageSessions'
import ReportsAndDiagnostics from './pages/ReportsAndDiagnostics'  // ← new

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/cancel" element={<CancelAppointment />} />
        <Route path="/clearpendingsdues" element={<ClearDues />} />
        <Route path="/analyzeprofit" element={<AnalyzeProfits />} />
        <Route path="/doctors" element={<ManageDoctors />} />
        <Route path="/pharmacy" element={<Pharmacy />} />
        <Route path="/sessions" element={<ManageSessions />} />
        <Route path="/reports" element={<ReportsAndDiagnostics />} />  {/* ← new */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
