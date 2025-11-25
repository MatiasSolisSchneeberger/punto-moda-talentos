import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { IconUser, IconMail, IconArrowLeft } from '@tabler/icons-react';

function Perfil() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userStored = localStorage.getItem('user');
        if (!userStored) {
            // Si no hay usuario, redirigir al login
            navigate('/login');
            return;
        }
        setUser(JSON.parse(userStored));
    }, [navigate]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h2 className="texto-headline text-text-800 dark:text-text-200">Cargando perfil...</h2>
            </div>
        );
    }

    return (
        <section className="container py-8">
            <Button href="/" style="tertiary" iconLeft={<IconArrowLeft />} className="mb-6">
                Volver
            </Button>

            <div className="max-w-2xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="texto-display text-primary-600 dark:text-primary-400">Mi Perfil</h1>
                </header>

                <div className="bg-background-100 dark:bg-background-900 p-8 rounded-3xl outline-2 outline-background-300 dark:outline-background-700">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="texto-display flex h-24 w-24 items-center justify-center rounded-full border-2 border-background-100 bg-primary-400 text-center text-primary-800 dark:border-background-800 dark:bg-primary-600 dark:text-primary-200 select-none">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <h2 className="texto-headline text-text-900 dark:text-text-100">
                            @{user.name}
                        </h2>
                    </div>

                    {/* User Information */}
                    <div className="space-y-6">
                        {/* Name */}
                        <div className="flex items-start gap-4 p-4 bg-background-50 dark:bg-background-800 rounded-xl">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                                <IconUser className="text-primary-600 dark:text-primary-400" size={24} />
                            </div>
                            <div className="flex-1">
                                <label className="texto-label text-text-500 dark:text-text-400 block mb-1">
                                    Nombre
                                </label>
                                <p className="texto-body text-text-900 dark:text-text-100">
                                    {user.name}
                                </p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start gap-4 p-4 bg-background-50 dark:bg-background-800 rounded-xl">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                                <IconMail className="text-primary-600 dark:text-primary-400" size={24} />
                            </div>
                            <div className="flex-1">
                                <label className="texto-label text-text-500 dark:text-text-400 block mb-1">
                                    Correo Electrónico
                                </label>
                                <p className="texto-body text-text-900 dark:text-text-100">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Perfil;
