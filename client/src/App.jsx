import {Toaster} from 'react-hot-toast'
import {Navigate, Route, Routes} from 'react-router-dom'
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { useAuth } from './context/GlobalContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/admin/dashboard';
import AddToCard from './components/AddToCard';
function App() {
 
  const {user} = useAuth();


  return (
    <div className='bg-slate-100'>
      <Toaster/>
      {user && <Navbar/>}
      <Routes>
        <Route path="/" element={user ?<Home user={user}/>:<Navigate to="/login"/>}/>
        <Route path="/login" element={!user ? <Login/> : <Navigate to="/"/>}/>
        <Route path="/profile" element={user ? <Profile/> : <Navigate to="/login"/>}/>
        <Route path="/card" element={user ? <AddToCard/> : <Navigate to="/login"/>}/>
        <Route path="/admin" element={user ? <Dashboard/> : <Navigate to="/login"/>}/>
      </Routes>
    </div>
  )
}

export default App
