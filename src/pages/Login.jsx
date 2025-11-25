import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const Login = ({ onLogin }) => {
    //datos del formulario
    const [formData, setFormData] = React.useState({
        email: '',
        password: ''
    });
    //errores
    const [error, setError] = React.useState('');
    const navigate = useNavigate();

    // manejo de cambios
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    // manejo de envio
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {

                // Guardar en LocalStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // acualizar estado 
                onLogin(data.user);
                navigate('/');
            } else {
                setError(data.message);
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setError('Error al iniciar sesión');
        }
    }


    return (
        <section className="flex items-center justify-center min-h-[60vh]">
            <form onSubmit={handleSubmit} className="bg-background-100 dark:bg-background-900 p-8 rounded-3xl shadow-lg w-full max-w-md flex flex-col gap-4 outline-1 outline-background-300 dark:outline-background-700">
                <h2 className="texto-headline text-center text-text-900 dark:text-text-100">Iniciar Sesión</h2>

                {error && <p className="text-danger-600 text-center">{error}</p>}

                <div className="flex flex-col gap-2">
                    <label className="texto-label text-text-800 dark:text-text-200">Email</label>
                    <input
                        type="email" name="email" required
                        onChange={handleChange}
                        className="p-3 rounded-xl bg-background-50 dark:bg-background-800 border border-background-300 dark:border-background-600 focus:outline-primary-500"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="texto-label text-text-800 dark:text-text-200">Contraseña</label>
                    <input
                        type="password" name="password" required
                        onChange={handleChange}
                        className="p-3 rounded-xl bg-background-50 dark:bg-background-800 border border-background-300 dark:border-background-600 focus:outline-primary-500"
                    />
                </div>

                <Button style="primary" type="submit" className="mt-4 w-full justify-center">
                    Ingresar
                </Button>
                <Button style="tertiary" href="/registrarse" className="w-full justify-center">
                    ¿No tienes cuenta? Regístrate
                </Button>
            </form>
        </section>
    );
}

export default Login;
