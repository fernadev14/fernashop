import { mostrarToast } from '../utils/notificaciones.js';
import { renderNav } from './navBar.js';
import { renderFooter } from './footer.js';
import { obtenerProductosFirestore } from '../data/productosFirestore.js';

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let productosFirestore = [];

async function cargarProductos() {
    try {
        productosFirestore = await obtenerProductosFirestore();
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarToast('Error al cargar información de stock', 'error');
    }
}

function obtenerStockDisponible(productoId) {
    const producto = productosFirestore.find(p => p.id === productoId);
    return producto ? producto.stock : 0;
}

function renderResumenCompra() {
    const container = document.getElementById('resumen-compra');
    const totalContainer = document.getElementById('total-compra');
    
    if (!container) return;

    container.innerHTML = carrito.map(item =>{ 
        const stockDisponible = obtenerStockDisponible(item.id);
        const maxCantidad = Math.min(stockDisponible, item.stock);

       return `
        <div class="flex justify-between items-center py-4 border-b">
            <div class="flex items-center">
                <img src="${item.imagen}" alt="${item.producto}" class="w-16 h-16 object-cover rounded">
                <div class="ml-4">
                    <p class="font-medium">${item.producto}</p>
                    <p class="text-sm text-gray-500">Talla: ${item.talla}</p>
                    <p class="text-sm font-semibold">$${item.precio.toLocaleString('es-CO')} c/u</p>
                    <p class="text-xs ${stockDisponible > 0 ? 'text-green-600' : 'text-red-600'}">
                        Stock disponible: ${stockDisponible}
                    </p>
                </div>
            </div>
            
            <div class="flex flex-col items-end">
                <!-- Selector de cantidad con límite de stock -->
                <div class="flex items-center gap-2 mb-2">
                    <button class="decrement-qty w-8 h-8 bg-gray-200 rounded ${item.cantidad <= 1 ? 'opacity-50 cursor-not-allowed' : ''}" 
                            data-id="${item.id}" ${item.cantidad <= 1 ? 'disabled' : ''}>−</button>
                    
                    <span class="quantity-display w-8 text-center">${item.cantidad}</span>
                    
                    <button class="increment-qty w-8 h-8 bg-gray-200 rounded ${item.cantidad >= maxCantidad ? 'opacity-50 cursor-not-allowed' : ''}" 
                            data-id="${item.id}" ${item.cantidad >= maxCantidad ? 'disabled' : ''}>+</button>
                </div>
                
                <!-- Subtotal -->
                <p class="font-semibold text-lg">
                    $${(item.cantidad * item.precio).toLocaleString('es-CO')}
                </p>
                
                <!-- Eliminar producto -->
                <button class="eliminar-item text-sm text-red-600 underline mt-2" data-id="${item.id}">
                    Eliminar
                </button>
            </div>
        </div>
    `;
    }).join('');

    actualizarTotal();
    configurarEventosCantidad();

    // const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    // totalContainer.textContent = `$${total.toLocaleString('es-CO')}`;
}

function actualizarTotal() {
    const totalContainer = document.getElementById('total-compra');
    if (!totalContainer) return;

    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    totalContainer.textContent = `$${total.toLocaleString('es-CO')}`;
}

function configurarEventosCantidad() {
    // Incrementar cantidad
    document.querySelectorAll('.increment-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const item = carrito.find(p => p.id === id);
            
            if (item) {
                // Verificar stock disponible (aquí necesitarías acceder al stock real)
                // Por ahora solo incrementamos
                item.cantidad++;
                guardarCarrito();
                renderResumenCompra();
            }
        });
    });

    // Decrementar cantidad
    document.querySelectorAll('.decrement-qty').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const item = carrito.find(p => p.id === id);
            
            if (item && item.cantidad > 1) {
                item.cantidad--;
                guardarCarrito();
                renderResumenCompra();
            }
        });
    });

    // Eliminar producto
    document.querySelectorAll('.eliminar-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            carrito = carrito.filter(p => p.id !== id);
            
            if (carrito.length === 0) {
                mostrarToast('Carrito vacío', 'info');
                setTimeout(() => window.location.href = 'index.html', 1000);
            } else {
                guardarCarrito();
                renderResumenCompra();
            }
        });
    });
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

document.getElementById('formulario-pago').addEventListener('submit', function(e) {
    e.preventDefault();

    // Verificar stock antes de procesar el pago
    let stockInsuficiente = false;
    
    for (const item of carrito) {
        const stockDisponible = obtenerStockDisponible(item.id);
        if (item.cantidad > stockDisponible) {
            mostrarToast(`Stock insuficiente para: ${item.producto}`, 'error');
            stockInsuficiente = true;
            
            // Ajustar la cantidad al máximo disponible
            item.cantidad = stockDisponible;
            if (item.cantidad === 0) {
                // Eliminar producto si no hay stock
                carrito = carrito.filter(p => p.id !== item.id);
            }
        }
    }
    
    if (stockInsuficiente) {
        guardarCarrito();
        renderResumenCompra();
        return;
    }
    
    // Si todo está bien, procesar pago
    mostrarToast('Procesando pago...', 'info');
    
    setTimeout(() => {
        mostrarToast('¡Pago exitoso! Tu pedido ha sido procesado.', 'success');
        localStorage.removeItem('carrito');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }, 3000);
});

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    if (carrito.length === 0) {
        window.location.href = 'index.html';
        return;
    }

    renderNav('header');
    renderFooter('footer');
    
    // Cargar productos para verificar stock
    await cargarProductos();
    renderResumenCompra();
});