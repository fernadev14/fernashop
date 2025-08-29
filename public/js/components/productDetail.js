import { obtenerProductosFirestore } from '../data/productosFirestore.js';
import { renderNav } from './navBar.js';
import { renderFooter } from './footer.js';
import { agregarAlCarrito } from './cart.js';
import { showLoader, hideLoader } from './loading/loading.js';

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
                        <svg viewBox="0 0 16 16" class="bi bi-cart-check" height="24" width="24" xmlns="http://www.w3.org/2000/svg" fill="#fff">
                          <path d="M11.354 6.354a.5.5 0 0 0-.708-.708L8 8.293 6.854 7.146a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3z">
                          </path>
                          <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 
                          0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 
                          7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z">
                          </path>
                        </svg>
                          <p class="text">${producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}</p>
                        
                        
                    </button>
                    
                    <button class="btn-buy-now" id="buy-now" ${producto.stock <= 0 ? 'disabled' : ''}>
                        <svg viewBox="0 0 16 16" class="bi bi-cart-check" height="24" width="24" xmlns="http://www.w3.org/2000/svg" fill="#fff">
                          <path d="M11.354 6.354a.5.5 0 0 0-.708-.708L8 8.293 6.854 7.146a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3z">
                          </path>
                          <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 
                          0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 
                          7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z">
                          </path>
                        </svg>
                          <p class="text">Comprar ahora</p>
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
        
        //Deshabilitar el botón temporalmente para evitar múltiples clics
        btn.disabled = true;
        setTimeout(() => {
            btn.disabled = false;
        }, 1000);
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

    showLoader(); //APARECE LOADING
    
    // Obtener el ID del producto de la URL
    const productId = obtenerIdProductoDeURL();
    
    if (!productId) {
        renderProductoDetalle(null);
        hideLoader(); // OCULTA LOADING SI NO HAY PRODUCTOS
        return;
    }
    
    try {
        // Cargar los productos
        const productos = await obtenerProductosFirestore();
        const producto = productos.find(p => p.id === productId);

        // 📝 Cambiar el título dinámico
        if (producto) {
            // 📝 Cambiar el título dinámico
            document.title = `${producto.producto} | FernaShop`;

            // 📝 Meta Description
            let metaDescription = document.querySelector("meta[name='description']");
            if (!metaDescription) {
                metaDescription = document.createElement("meta");
                metaDescription.setAttribute("name", "description");
                document.head.appendChild(metaDescription);
            }
            metaDescription.setAttribute("content", producto.descripcion || `Compra ${producto.producto} en FernaShop al mejor precio.`);

            // 📝 Open Graph Tags
            const ogTags = {
                "og:title": `${producto.producto} | FernaShop`,
                "og:description": producto.descripcion || `Compra ${producto.producto} en FernaShop al mejor precio.`,
                "og:image": producto.imagen || "/img/default-product.png",
                "og:type": "product",
                "og:url": window.location.href
            };

            Object.entries(ogTags).forEach(([property, content]) => {
                let metaTag = document.querySelector(`meta[property='${property}']`);
                if (!metaTag) {
                    metaTag = document.createElement("meta");
                    metaTag.setAttribute("property", property);
                    document.head.appendChild(metaTag);
                }
                metaTag.setAttribute("content", content);
            });

        } else {
            document.title = "Producto no encontrado | FernaShop";
        }
        
        // Renderizar el detalle del producto
        renderProductoDetalle(producto);

        // Esperar a que cargue la imagen principal antes de ocultar loader
        const img = document.getElementById('main-image');
        if (img) {
            await new Promise((resolve) => {
                if (img.complete) resolve(); // ya estaba en caché
                else img.onload = resolve;
            });
        }
    } catch (error) {
        console.error('Error al cargar el producto:', error);
        renderProductoDetalle(null);
    } finally {
        hideLoader(); // SOLO DESAPARECE CUANDO TODO SE RENDERIZA
    }
});