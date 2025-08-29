// import PRODUCTOS from "./productsArray.js";
// import { obtenerProductos } from './utils/productService.js';
import { obtenerProductosFirestore } from './data/productosFirestore.js';
import { renderNav } from './components/navBar.js';
import { observarEstadoAuth } from './utils/authhState.js';
import { renderFooter } from './components/footer.js';
import { renderProductos, actualizarProductoIndividual } from './components/renderProductos.js';
import { agregarAlCarrito, inicializarCarrito, abrirCarrito } from './components/cart.js';
import { init } from './components/loading/loading.js';

// FUNCION LOADING AL INICIAR
init();

export let productosFirestore = [];


console.log(obtenerProductosFirestore())

document.addEventListener('DOMContentLoaded', async () => {
    productosFirestore = await obtenerProductosFirestore();

    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];

    carritoGuardado.forEach(itemCarrito => {
        const producto = productosFirestore.find(p => p.id === itemCarrito.id);
        if (producto) {
            // agregarAlCarrito(producto);
            producto.stock -= itemCarrito.cantidad; // Descontar lo que ya estaba en el carrito
            if (producto.stock < 0) producto.stock = 0; // Por seguridad
            // actualizarProductoIndividual(producto);
        }
    });

    // Renderizar productos con stock ya actualizado
    renderProductos(productosFirestore, '#productos');
    preloadImages();
    // console.log(productosFirestore)

    renderNav('header'); // se pasa el parametro de la etiqueta a la funcion renderNav
    observarEstadoAuth(); // funcion oauth
    inicializarCarrito();
    renderFooter('footer');

    // Añadir listener despues de renderNav()
    const categoriaSelect = document.getElementById('categoria-select');
    if(categoriaSelect){
        categoriaSelect.addEventListener('change', (e) => {
            const categoria = e.target.value;
            const productoFiltrados = 
                categoria === 'todo'
                ? productosFirestore 
                : productosFirestore.filter(product => product.genero === categoria);
                renderProductos(productoFiltrados, '#productos')
                scrollBehaivor()
                // console.log(productoFiltrados)
        });
    }

    //Evento para buscar productos que coinciden con palabras en el input de buscar
    document.addEventListener('input', (e) => {
        if (e.target && e.target.id === 'search-navbar') {
            const texto = e.target.value.trim().toLowerCase();
            const productosFiltrados = productosFirestore.filter(p =>
                p.producto.toLowerCase().includes(texto)
            );

            const container = document.querySelector('#productos');

            if(productosFiltrados.length === 0){
                container.innerHTML = '<p class="text-center text-gray-500">No se encontraron productos</p>';
            } else {
                renderProductos(productosFiltrados, '#productos')
            }
            scrollBehaivor()
        }
    });

});

// Evento para agregar al carrito producto
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-add-cart');
    if (btn && !btn.disabled) {
        e.preventDefault();
        e.stopPropagation(); // ← Esto evita que el clic se propague al enlace

        // Animación de confirmación
        const originalBg = btn.style.backgroundColor;
        const originalHtml = btn.innerHTML;
        
        btn.style.backgroundColor = '#10B981'; // Verde
        btn.innerHTML = `
          <svg class="cart" fill="currentColor" viewBox="0 0 448 512" height="1em" xmlns="http://www.w3.org/2000/svg">
            <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
          </svg>
          <span class="text">¡Agregado!</span>
        `;

        // Restaurar después de 1.5 segundos
        setTimeout(() => {
            btn.style.backgroundColor = originalBg;
            btn.innerHTML = originalHtml;
        }, 1500);

        const id = btn.dataset.id;
        const producto = productosFirestore.find(p => p.id === id);
        if(producto){
            agregarAlCarrito(producto); // Agrega al carrito
            if (producto.stock > 0) {
                producto.stock -= 1;
                // renderProductos(productosFirestore, '#productos');
                actualizarProductoIndividual(producto);
                //preloadImages(); // Precargar imágenes nuevamente
            }
        } else {
            console.warn("producto no encontrado para ID: ", id);
        }
    }
    const cartBtn = document.getElementById('cart-btn');
    cartBtn?.addEventListener('click', abrirCarrito);
});

// Funcion para el Scroll suave
function scrollBehaivor() {
            const productosSection = document.querySelector('#productos');
            productosSection.scrollIntoView({ behavior: 'smooth' });
}

// Función para precargar imágenes y evitar layout shifting
function preloadImages() {
  const images = document.querySelectorAll('.product-img');
  images.forEach(img => {
    // Agregar una clase de skeleton mientras carga
    img.classList.add('skeleton');
    
    // Cuando la imagen cargue, quitar el skeleton
    if (img.complete) {
      img.classList.remove('skeleton');
    } else {
      img.addEventListener('load', function() {
        this.classList.remove('skeleton');
      });
      
      img.addEventListener('error', function() {
        this.classList.remove('skeleton');
        this.src = 'https://via.placeholder.com/300x300?text=Imagen+No+Disponible';
      });
    }
  });
}
