import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Animals from './pages/Animals';
import Donate from './pages/Donate';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import Blogs from './pages/Blogs';
import Team from './pages/Team';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="tiere" element={<Animals />} />
        <Route path="team" element={<Team />} />
        <Route path="spenden" element={<Donate />} />
        <Route path="blog" element={<Blogs />} />
        <Route path="login" element={<Login />} />
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="impressum" element={<Impressum />} />
        <Route path="datenschutz" element={<Datenschutz />} />
      </Route>
    </Routes>
  );
}

