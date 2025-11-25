import { useEffect, useState } from 'react'
import Navbar from '/src/section/Navbar'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Productos from './pages/Productos.jsx'
import Index from './pages/Index.jsx'
import DetalleProducto from './pages/Producto.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

function App() {
    // estado del usuario (null si no)
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    //verifica si hay sesion al cargar
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            const userData = JSON.parse(storedUser);
            setUser({ ...userData, isLoggedIn: true });
        }
    }, []);

    // Funcion para actualzar estado al loguearse
    const handleLogin = (userData) => {
        setUser({ ...userData, isLoggedIn: true });
    }


    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    }
    return (
        <>
            <Navbar user={user || { isLoggedIn: false }} onLogout={handleLogout} />
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/productos/:slug" element={<DetalleProducto />} />

                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register onRegister={handleLogin} />} />
            </Routes>
        </>
    )
}

export default App
