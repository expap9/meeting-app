import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import ThankYou from './pages/ThankYou';
import AdminDashboard from './pages/AdminDashboard';
import AdminMeetingForm from './pages/AdminMeetingForm';

function App() {
  return (
    <div className="app-wrapper">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register/:id" element={<Register />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/create" element={<AdminMeetingForm />} />
        <Route path="/admin/edit/:id" element={<AdminMeetingForm />} />
      </Routes>
    </div>
  );
}

export default App;
