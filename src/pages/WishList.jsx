import { useState, useEffect } from 'react';
import CardProducto from '../components/CardProducto';
import Button from '../components/Button';
import { IconHeartOff } from '@tabler/icons-react';

function Wishlist() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = async () => {
        const userStored = localStorage.getItem('user');
        if (!userStored) return setLoading(false);

        const user = JSON.parse(userStored);

        try {
            const response = await fetch(`http://localhost:3000/api/wishlist/${user.id}`);
            const data = await response.json();

            // Adaptamos los datos para que CardProducto los entienda
            // La API devuelve objetos Wishlist que tienen adentro un "Product"
            const productosAdaptados = data.map(item => {
                const p = item.Product;
                const img = p.ProductImages?.[0]?.image_url || "/image/placeholder.png";

                return {
                    id: p.id,
                    nombre: p.name,
                    categoria: p.category,
                    precio: { regular: parseFloat(p.price), oferta: null },
                    imgs: [{ url: img, alt: p.name }],
                    slug: p.id.toString()
                };
            });

            setWishlistItems(productosAdaptados);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    if (loading) return <div className="min-h-[50vh] flex items-center justify-center">Cargando favoritos...</div>;

    return (
        <section className="container py-8">
            <header className="mb-8 text-center">
                <h1 className="texto-headline text-text-900 dark:text-text-100">Mis Favoritos</h1>
            </header>

            {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {wishlistItems.map(producto => (
                        <CardProducto key={producto.id} producto={producto} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 py-20 text-text-500">
                    <IconHeartOff size={64} />
                    <h3 className="texto-title">Aún no tienes favoritos</h3>
                    <Button href="/productos" style="primary">Explorar productos</Button>
                </div>
            )}
        </section>
    );
}

export default Wishlist;