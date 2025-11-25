import { useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import productosData from '../data/productos.json';
import Button from '../components/Button';
import { IconShoppingCartPlus, IconHeart, IconHeartFilled, IconArrowLeft, IconCheck, IconX, IconMinus, IconPlus } from '@tabler/icons-react';
import ButtonIcon from '../components/ButtonIcon';
import Chip from '../components/Chip';
import Avatar from '../components/Avatar';
import ListaProductos from '../components/ListaProductos';

function Producto() {
    const { slug } = useParams();
    const [producto, setProducto] = useState(null);

    // seleccion de tipo
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // visuales
    const [selectedImage, setSelectedImage] = useState(0);
    const [liked, setLiked] = useState(false);

    // carrito
    const [agregando, setAgregando] = useState(false);

    // Estados de carga y error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // --- CARGAR PRODUCTO ---
    useEffect(() => {
        const fetchProducto = async () => {
            setLoading(true);

            try {
                const response = await fetch(`http://localhost:3000/api/products/${slug}`);
                if (!response.ok) throw new Error('Producto no encontrado');
                const dbProduct = await response.json();

                // !! Guardo "dbProduct" completo en el estado 'producto' para tener acceso a las variantes reales (ProductVariants)
                setProducto(dbProduct);

                // Seleccionar imagen por defecto si existe
                if (dbProduct.ProductImages?.length > 0) {
                    setSelectedImage(0);
                }
            } catch (error) {
                console.error('Error al obtener el producto:', error);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        if (slug) {
            fetchProducto();
        }
    }, [slug]);

    // --- LÓGICA INTELIGENTE: CALCULAR OPCIONES ---

    // 1. Extraer Colores y Talles disponibles de las variantes reales
    const opciones = useMemo(() => {
        if (!producto) return { colores: [], talles: [] };

        const coloresSet = new Set();
        const tallesSet = new Set();

        producto.ProductVariants?.forEach(variant => {
            variant.VariantAttributes?.forEach(attr => {
                if (attr.attribute_name === 'Color') coloresSet.add(attr.attribute_value);
                if (attr.attribute_name === 'Talle') tallesSet.add(attr.attribute_value);
            });
        });

        return {
            colores: Array.from(coloresSet),
            talles: Array.from(tallesSet)
        };
    }, [producto]);

    // 2. Buscar la Variante exacta basada en la selección actual
    const varianteSeleccionada = useMemo(() => {
        if (!producto || !selectedColor || !selectedSize) return null;

        return producto.ProductVariants.find(variant => {
            const attrs = variant.VariantAttributes;
            const tieneColor = attrs.some(a => a.attribute_name === 'Color' && a.attribute_value === selectedColor);
            const tieneTalle = attrs.some(a => a.attribute_name === 'Talle' && a.attribute_value === selectedSize);
            return tieneColor && tieneTalle;
        });
    }, [producto, selectedColor, selectedSize]);


    // --- HANDLERS ---

    const handleQuantityChange = (operation) => {
        if (operation === 'inc') {
            // Validar stock máximo si ya seleccionó variante
            if (varianteSeleccionada && quantity >= varianteSeleccionada.stock) return;
            setQuantity(q => q + 1);
        } else {
            if (quantity > 1) setQuantity(q => q - 1);
        }
    };

    const handleAddToCart = async () => {
        const userStored = localStorage.getItem('user');
        if (!userStored) return alert("Debes iniciar sesión");

        if (!selectedColor || !selectedSize) return alert("Selecciona color y talle");
        if (!varianteSeleccionada) return alert("Esta combinación no está disponible");
        if (quantity > varianteSeleccionada.stock) return alert(`Solo quedan ${varianteSeleccionada.stock} unidades`);

        setAgregando(true);
        try {
            const user = JSON.parse(userStored);
            const response = await fetch('http://localhost:3000/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    variantId: varianteSeleccionada.id,
                    quantity: quantity
                })
            });

            if (response.ok) alert("¡Agregado al carrito!");
            else alert("Error al agregar");
        } catch (error) {
            console.error(error);
        } finally {
            setAgregando(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h2 className="texto-headline text-text-800 dark:text-text-200">Cargando producto...</h2>
                <Button href="/productos" style="primary" iconLeft={<IconArrowLeft />}>
                    Volver a productos
                </Button>
            </div>
        );
    }

    if (error || !producto) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h2 className="texto-headline text-text-800 dark:text-text-200">Error al cargar el producto</h2>
                <Button href="/productos" style="primary" iconLeft={<IconArrowLeft />}>
                    Volver a productos
                </Button>
            </div>
        );
    }

    // Si hay variante seleccionada muestra su precio, sino el base
    const precioMostrar = varianteSeleccionada
        ? parseFloat(varianteSeleccionada.price)
        : parseFloat(producto.price);

    // Imágenes: Intentar filtrar por color seleccionado (Opcional PRO)
    const imagenesMostrar = producto.ProductImages?.length > 0
        ? producto.ProductImages
        : [{ image_url: "/image/placeholder.png", color: null }];

    return (
        <section className="container">
            <Button href="/productos" style="tertiary" iconLeft={<IconArrowLeft />} className="mb-6">
                Volver
            </Button>

            <article className="grid relative grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-6">
                {/* Images Section */}
                <aside className="relative md:sticky top-3 self-start col-span-4 md:col-span-3 sm:col-span-6 lg:col-span-5 w-full gap-3 grid grid-cols-subgrid">

                    {/* Main Image */}
                    <div className="col-span-4 md:col-span-3 sm:col-start-1 sm:col-end-6 lg:col-span-5 xl:col-start-2 relative aspect-3/4 w-full overflow-hidden rounded-3xl bg-background-100 dark:bg-background-900 outline-2 outline-background-300 dark:outline-background-700">
                        <img
                            src={imagenesMostrar[selectedImage].image_url}
                            alt={producto.name}
                            className="w-full h-full object-cover"
                        />
                        <ButtonIcon
                            onClick={() => setLiked(!liked)}
                            style="secondary"
                            className="absolute top-4 right-4"
                        >
                            {liked ? <IconHeartFilled className="text-danger-600" /> : <IconHeart />}
                        </ButtonIcon>
                    </div>

                    {/* Images */}
                    <div className="relative col-span-4 gap-2 flex flex-row sm:flex-col sm:col-start-6 md:flex-row md:col-span-3 md:overflow-x-scroll lg:overflow-x-auto lg:col-span-5 xl:col-start-1 xl:row-start-1 xl:col-span-1 xl:flex-col">
                        {imagenesMostrar.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`relative p-0 w-full max-h-24 aspect-square rounded-xl transition-all border-2 border-background-300 dark:border-background-700
                                    ${selectedImage === index
                                        ? 'border-primary-500 opacity-100'
                                        : 'opacity-70 hover:opacity-100'
                                    }`}
                            >
                                <img
                                    src={img.image_url}
                                    alt={img.color}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Details Section */}
                <main className="col-span-4 sm:col-span-6 md:col-span-5 xl:col-span-7 flex flex-col gap-6">
                    {/* Product Details Card */}
                    <section className="flex flex-col gap-6 bg-background-100 dark:bg-background-900 p-4 rounded-3xl outline-2 outline-background-300 dark:outline-background-700">
                        <header>
                            <h1 className="texto-display text-primary-600 dark:text-primary-400 mb-2">
                                {producto.name}
                            </h1>
                            <section className="flex texto-headline text-secondary-600 dark:text-secondary-400 items-center gap-3">
                                ${precioMostrar.toLocaleString('es-AR')}
                            </section>
                        </header>

                        <div className="prose dark:prose-invert max-w-none text-text-600 dark:text-text-300">
                            <p>
                                {producto.description}
                            </p>
                        </div>

                        <div>
                            <h3 className="texto-label font-bold mb-2">Color: {selectedColor}</h3>
                            <div className="flex flex-wrap gap-2">
                                {opciones.colores.map(color => (
                                    <Chip
                                        key={color}
                                        selection={selectedColor === color}
                                        onClick={() => setSelectedColor(color)}
                                        className="cursor-pointer capitalize"
                                        iconLeft={selectedColor === color && <IconCheck size={16} />}
                                    >
                                        {color}
                                    </Chip>
                                ))}
                            </div>
                        </div>

                        {/* --- SELECTOR DE TALLE --- */}
                        <div>
                            <h3 className="texto-label font-bold mb-2">Talle: {selectedSize}</h3>
                            <div className="flex flex-wrap gap-2">
                                {opciones.talles.map(talle => (
                                    <Chip
                                        key={talle}
                                        selection={selectedSize === talle}
                                        onClick={() => setSelectedSize(talle)}
                                        className="cursor-pointer uppercase"
                                        iconLeft={selectedSize === talle && <IconCheck size={16} />}
                                    >
                                        {talle}
                                    </Chip>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 py-4 border-y-2 border-background-300 dark:border-background-700">
                            <span className="texto-label text-text-600 dark:text-text-300">Cantidad:</span>
                            <div className="flex items-center gap-3 bg-background-100 dark:bg-background-800 rounded-xl p-1">
                                <ButtonIcon size="sm" style="tertiary" onClick={() => handleQuantityChange('dec')} disabled={quantity <= 1}>
                                    <IconMinus size={18} />
                                </ButtonIcon>
                                <span
                                    className="w-8 text-center texto-label text-primary-600 dark:text-primary-400"
                                    style={{ fontWeight: 'bold' }}>
                                    {quantity}
                                </span>
                                <ButtonIcon size="sm" style="tertiary" onClick={() => handleQuantityChange('inc')}
                                    // Deshabilitar si llegamos al stock máximo de la variante seleccionada
                                    disabled={varianteSeleccionada && quantity >= varianteSeleccionada.stock}
                                >
                                    <IconPlus size={18} />
                                </ButtonIcon>
                            </div>

                            {/* Mensaje de Stock dinámico */}
                            {varianteSeleccionada ? (
                                <span className="texto-label text-text-500">
                                    {varianteSeleccionada.stock} disponibles
                                </span>
                            ) : (
                                <span className="texto-label text-warning-600">Selecciona opciones para ver stock</span>
                            )}
                        </div>

                        <div className="flex gap-3 mt-4">
                            <Button
                                style="primary"
                                iconLeft={<IconShoppingCartPlus />}
                                className="w-full py-4 text-lg"
                                onClick={handleAddToCart}
                                disabled={agregando || !varianteSeleccionada || varianteSeleccionada.stock === 0}
                            >
                                {varianteSeleccionada?.stock === 0
                                    ? "Sin Stock"
                                    : agregando ? "Agregando..." : "Agregar al Carrito"
                                }
                            </Button>
                        </div>

                    </section>

                    {/* Opinions Section */}
                    <section className="flex flex-col gap-4 bg-background-100 dark:bg-background-900 p-6 rounded-3xl outline-2 outline-background-300 dark:outline-background-700">
                        <header>
                            <h2 className="texto-headline text-primary-600 dark:text-primary-400">Opiniones del producto</h2>
                        </header>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex flex-col items-center">
                                <span className="text-4xl font-bold text-primary-600">4.8</span>
                                <div className="flex text-warning-400" aria-label="4.8 de 5 estrellas">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <IconHeartFilled key={star} size={20} />
                                    ))}
                                </div>
                                <span className="text-sm text-text-500">Based on 128 reviews</span>
                            </div>

                            <div className="flex-1 space-y-2">
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <div key={rating} className="flex items-center gap-2">
                                        <span className="text-sm font-medium w-3">{rating}</span>
                                        <div className="flex-1 h-2 bg-background-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={rating === 5 ? 70 : rating === 4 ? 20 : 5} aria-valuemin="0" aria-valuemax="100">
                                            <div
                                                className="h-full bg-primary-500 rounded-full"
                                                style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : 5}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Placeholder reviews */}
                            {[1, 2].map((review) => (
                                <article key={review} className="border-b border-background-200 pb-4 last:border-0 last:pb-0">
                                    <header className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <Avatar
                                                name={`Usuario ${review}`}
                                                size="small"
                                            />
                                            <span className="font-medium">{`Usuario ${review}`}</span>
                                        </div>
                                        <time className="text-sm text-text-400">Hace 2 días</time>
                                    </header>
                                    <p className="text-text-600 dark:text-text-300">
                                        Excelente producto, muy buena calidad y llegó rápido. Totalmente recomendado.
                                    </p>
                                </article>
                            ))}
                        </div>

                        <Button style="secondary" className="w-full mt-2">
                            Ver todas las opiniones
                        </Button>
                    </section>

                    {/* Q&A Section */}
                    <section className="flex flex-col gap-4 bg-background-100 dark:bg-background-900 p-6 rounded-3xl outline-2 outline-background-300 dark:outline-background-700">
                        <header>
                            <h2 className="texto-headline text-primary-600 dark:text-primary-400">Preguntas y respuestas</h2>
                        </header>

                        <form className="flex gap-2 mb-4" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="text"
                                placeholder="Escribí una pregunta..."
                                className="flex-1 px-4 py-2 rounded-xl bg-background-50 dark:bg-background-800 border border-background-300 dark:border-background-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                aria-label="Escribe tu pregunta"
                            />
                            <Button style="primary" type="submit">
                                Preguntar
                            </Button>
                        </form>

                        <div className="space-y-6">
                            {[1, 2, 3].map((qa) => (
                                <article key={qa} className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <span className="font-bold text-text-900 dark:text-text-100" aria-hidden="true">P:</span>
                                        <h3 className="text-text-800 dark:text-text-200 font-medium text-base m-0">
                                            ¿Tienen stock en talle M?
                                        </h3>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <span className="font-bold text-text-500" aria-hidden="true">R:</span>
                                        <p className="text-text-600 dark:text-text-400">
                                            Hola! Sí, tenemos stock disponible en talle M. ¡Esperamos tu compra!
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <Button style="tertiary" className="w-full mt-2">
                            Ver más preguntas
                        </Button>
                    </section>
                </main>
            </article>


        </section>
    );
}

export default Producto;
