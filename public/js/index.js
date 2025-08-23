// import PRODUCTOS from "./productsArray.js";
// import { obtenerProductos } from './utils/productService.js';
import { obtenerProductosFirestore } from './data/productosFirestore.js';
import { renderNav } from './components/navBar.js';
import { observarEstadoAuth } from './utils/authhState.js';
import { renderFooter } from './components/footer.js';
import { renderProductos } from './components/renderProductos.js';
import { agregarAlCarrito, manejarEventosCarrito, abrirCarrito, countadorCarritoIcon, renderCarrito } from './components/cart.js';

export let productosFirestore = [];


console.log(obtenerProductosFirestore())

document.addEventListener('DOMContentLoaded', async () => {
    productosFirestore = await obtenerProductosFirestore();

    const carritoGuardado = JSON.parse(localStorage.getItem('carrito')) || [];
    carritoGuardado.forEach(itemCarrito => {
        const producto = productosFirestore.find(p => p.id === itemCarrito.id);
        if (producto) {
            producto.stock = Math.max(0, producto.stock - itemCarrito.cantidad);
        }
    });

    renderProductos(productosFirestore, '#productos');
    // console.log(productosFirestore)

    renderNav('header'); // se pasa el parametro de la etiqueta a la funcion renderNav
    observarEstadoAuth(); // funcion oauth
    renderFooter('footer');
    renderCarrito();
    manejarEventosCarrito(); // Activamos la escucha de eventos del carrito
    countadorCarritoIcon()   // Contador de productos en el carrito icon de compras

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
    if (btn) {
        e.preventDefault(); // Previene el submit si está en un form
        const id = btn.dataset.id;
        const producto = productosFirestore.find(p => p.id === id);
        if(producto){
            agregarAlCarrito(producto); // Agrega al carrito
            if (producto.stock > 0) {
                producto.stock -= 1;
                renderProductos(productosFirestore, '#productos');
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
