import { obtenerProductosFirestore } from '../../data/productosFirestore.js';
import { renderNav } from '../../components/navBar.js';
import { renderFooter } from '../../components/footer.js';
import { agregarAlCarrito, inicializarCarrito } from '../../components/cart.js';

// Obtener el ID del producto de la URL
function obtenerIdProductoDeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Renderizar el detalle del producto
function renderProductoDetalle(producto) {
    const container = document.getElementById('producto-detalle');
    
    if (!producto) {
        container.innerHTML = `
            <div class="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 class="text-xl font-semibold text-gray-800 mb-2">Producto no encontrado</h2>
                <p class="text-gray-600 mb-6">El producto que buscas no existe o no está disponible.</p>
                <a href="index.html" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Volver a la tienda</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="breadcrumb">
            <a href="index.html">Inicio</a> / 
            <a href="index.html?categoria=${producto.genero}">${producto.genero.charAt(0).toUpperCase() + producto.genero.slice(1)}</a> / 
            <span>${producto.producto}</span>
        </div>
        
        <div class="product-detail-container">
            <div class="product-images">
                <img src="${producto.imagen}" alt="${producto.producto}" class="product-image" id="main-image">
                
                <div class="product-gallery">
                    <img src="${producto.imagen}" alt="Vista 1" class="thumbnail active" data-image="${producto.imagen}">
                    <!-- Puedes agregar más miniaturas si tienes más imágenes -->
                </div>
            </div>
            
            <div class="product-info">
                <h1 class="product-title">${producto.producto}</h1>
                <p class="product-price">$${Number(producto.precio).toLocaleString('es-CO')}</p>
                
                <div class="product-meta">
                    <div class="meta-item">
                        <span class="meta-label">Disponibilidad</span>
                        <span class="meta-value ${producto.stock > 0 ? 'text-green-600' : 'text-red-600'}">
                            ${producto.stock > 0 ? 'En stock' : 'Agotado'}
                        </span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Categoría</span>
                        <span class="meta-value">${producto.genero.charAt(0).toUpperCase() + producto.genero.slice(1)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Talla</span>
                        <span class="meta-value">${producto.talla}</span>
                    </div>
                </div>
                
                <div class="size-selector">
                    <span class="text-sm font-medium text-gray-700 mb-2 block">Talla:</span>
                    <div class="size-option selected" data-size="${producto.talla}">
                        ${producto.talla}
                    </div>
                    <!-- Puedes agregar más tallas si el producto tiene variantes -->
                </div>
                
                <div class="quantity-selector">
                    <span class="text-sm font-medium text-gray-700">Cantidad:</span>
                    <button class="quantity-btn" id="decrease-qty">-</button>
                    <span class="quantity-display" id="quantity">1</span>
                    <button class="quantity-btn" id="increase-qty">+</button>
                    <span class="text-sm text-gray-500 ml-2">${producto.stock} disponibles</span>
                </div>
                
                <div class="action-buttons">
                    <button class="btn-add-cart btn-add-cart-large" id="add-to-cart-detail" 
                            data-id="${producto.id}" ${producto.stock <= 0 ? 'disabled' : ''}>
                        <svg class="cart" fill="currentColor" viewBox="0 0 576 512" height="1.2em" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/>
                        </svg>
                        ${producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
                    </button>
                    
                    <button class="btn-buy-now" id="buy-now" ${producto.stock <= 0 ? 'disabled' : ''}>
                        Comprar ahora
                    </button>
                </div>
                
                <div class="product-description">
                    <h3 class="description-title">Descripción</h3>
                    <p class="description-content">
                        ${producto.descripcion || 'Este producto no tiene descripción adicional.'}
                    </p>
                </div>
            </div>
        </div>
    `;
    
    // Configurar eventos
    configurarEventosProducto(producto);
}

// Configurar eventos para la página de detalle
function configurarEventosProducto(producto) {
    // Cambiar imagen principal al hacer clic en miniaturas
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', () => {
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            document.getElementById('main-image').src = thumb.dataset.image;
        });
    });
    
    // Control de cantidad
    let quantity = 1;
    const quantityDisplay = document.getElementById('quantity');
    const maxQuantity = producto.stock;
    
    document.getElementById('increase-qty').addEventListener('click', () => {
        if (quantity < maxQuantity) {
            quantity++;
            quantityDisplay.textContent = quantity;
        }
    });
    
    document.getElementById('decrease-qty').addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            quantityDisplay.textContent = quantity;
        }
    });
    
    // Agregar al carrito - VERSIÓN CORREGIDA
    document.getElementById('add-to-cart-detail').onclick = function(e) {
        // Prevenir comportamiento por defecto y propagación
        e.preventDefault();
        e.stopPropagation();
        // event.stopImmediatePropagation();
        
        console.log('🟢 CLIC en agregar carrito - cantidad:', quantity);
        console.log('🟢 Producto:', producto.producto);
        
        // Agregar solo UNA vez
        agregarAlCarrito(producto, quantity);
        
        // Animación de confirmación
        const btn = document.getElementById('add-to-cart-detail');
        const originalText = btn.innerHTML;
        btn.innerHTML = `
            <svg class="cart" fill="currentColor" viewBox="0 0 448 512" height="1.2em" xmlns="http://www.w3.org/2000/svg">
                <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
            </svg>
            ¡Agregado${quantity > 1 ? 's ' + quantity : ''}!
        `;
        
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
        
        // Deshabilitar el botón temporalmente para evitar múltiples clics
        // btn.disabled = true;
        // setTimeout(() => {
        //     btn.disabled = false;
        // }, 1000);
    };
    
    // Comprar ahora - VERSIÓN CORREGIDA
    document.getElementById('buy-now').onclick = function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        console.log('Botón comprar ahora clickeado - cantidad:', quantity);
        agregarAlCarrito(producto, quantity);
        window.location.href = 'cart.html';
    };


}

// Inicializar la página
document.addEventListener('DOMContentLoaded', async () => {
    // Renderizar navegación y pie de página
    renderNav('header');
    renderFooter('footer');

    // Inicializar funcionalidad del carrito
    // inicializarCarrito();
    
    // Obtener el ID del producto de la URL
    const productId = obtenerIdProductoDeURL();
    
    if (!productId) {
        renderProductoDetalle(null);
        return;
    }
    
    try {
        // Cargar los productos
        const productos = await obtenerProductosFirestore();
        const producto = productos.find(p => p.id === productId);
        
        // Renderizar el detalle del producto
        renderProductoDetalle(producto);
    } catch (error) {
        console.error('Error al cargar el producto:', error);
        renderProductoDetalle(null);
    }
});