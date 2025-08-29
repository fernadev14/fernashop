import { mostrarToast, animarIconoCarrito } from '../utils/notificaciones.js';
// import { renderProductos } from './renderProductos.js';
import { actualizarProductoIndividual } from './renderProductos.js';
import { productosFirestore } from '../index.js';

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

export function agregarAlCarrito(producto, cantidad = 1) {
  console.log('agregarAlCarrito llamado para:', producto.producto, 'Cantidad:', cantidad);

  const existente = carrito.find(p => p.id === producto.id);

  if (existente) {
    if (existente.cantidad + cantidad <= existente.stock) {
      existente.cantidad += cantidad;
    } else {
      mostrarToast('No hay suficiente stock disponible', 'error');
      return;
    }
  } else {
    if (producto.stock >= cantidad) {
      carrito.push({ ...producto, cantidad: cantidad });
    } else {
      mostrarToast('No hay suficiente stock disponible', 'error');
      return;
    }
  }

  mostrarToast('Producto agregado correctamente', 'success');
  animarIconoCarrito();

  guardarCarrito();
  renderCarrito();
  countadorCarritoIcon();
}


// Funcion de contador de productos en el icono del carrito
export function countadorCarritoIcon() {
  console.log('countadorCarritoIcon llamado. Carrito:', carrito);
  const countSpanCar = document.getElementById('cart-count');
  if (!countSpanCar) {
    console.warn("Elemento con ID 'cart-count' no encontrado.");
    return;
  }
  const totalItems = carrito.length;
  countSpanCar.textContent = totalItems;
}

export function abrirCarrito() {
  document.getElementById('cart-sidebar')?.classList.remove('translate-x-full');
}

export function cerrarCarrito() {
  document.getElementById('cart-sidebar')?.classList.add('translate-x-full');
}

function guardarCarrito() {
      localStorage.setItem('carrito', JSON.stringify(carrito));
}

export function renderCarrito() {
  const container = document.getElementById('cart-items');
  const totalContainer = document.getElementById('cart-total');
  const vaciarBtnContainer = document.getElementById('vaciar-carrito-container');
  if (!container || !totalContainer) return;

  container.innerHTML = '';

  carrito.forEach(item => {
    // Busca el stock real en productosFirestore
    const productoActual = productosFirestore.find(p => p.id === item.id);
    const stockDisponible = productoActual ? productoActual.stock : item.stock;

    const itemDiv = document.createElement('div');
    itemDiv.className = "flex justify-between items-center border p-2 rounded";

    const subtotal = (item.precio * item.cantidad).toFixed(2);

    itemDiv.innerHTML = `
      <div class="w-10">
        <img src="${item.imagen}" class="w-full"/>
      </div>
      <div>
        <p class="font-semibold">${item.producto}</p>
        <p class="text-sm text-gray-500">Talla: ${item.talla}</p>
        <p id="precio-cart" class="text-sm text-gray-600">$${subtotal}</p>
      </div>
      <div class="flex flex-col items-center">
        <div class="flex items-center gap-2">
          <button class="decrement text-lg px-2 border rounded" data-id="${item.id}">−</button>
          <span>${item.cantidad}</span>
          <button class="increment text-lg px-2 border rounded" data-id="${item.id}" ${item.cantidad >= item.stock ? 'disabled style="background:#ccc;cursor:not-allowed;"' : ''}>+</button>
          <span class="text-xs ml-2 ${stockDisponible <= 0 ? 'text-red-500' : 'text-gray-400'}">
            ${stockDisponible <= 0 ? 'Agotado' : `Stock: ${stockDisponible}`}
          </span>
        </div>
        <button class="eliminar-item mt-2 text-sm text-red-600 underline cursor-pointer" data-id="${item.id}">Eliminar</button>
      </div>
    `;

    container.appendChild(itemDiv);
  });

    actualizarTotal();

    // Mostrar botón "Vaciar carrito" si hay productos
    if (carrito.length > 0 && vaciarBtnContainer) {
      vaciarBtnContainer.innerHTML = `
        <button id="vaciar-carrito" 
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
        >
          Vaciar carrito
        </button>
      `;
    } else if (vaciarBtnContainer) {
      vaciarBtnContainer.innerHTML = '';
    }
}

function actualizarTotal() {
  const totalContainer = document.getElementById('cart-total');
  if (!totalContainer) return;

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  totalContainer.textContent = `Total: $${total.toFixed(2)}`;
}

export function manejarEventosCarrito() {
  document.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    
    // Incrementar cantidad
    if (e.target.classList.contains('increment')) {
      const item = carrito.find(p => p.id === id);
      if (item) {
        if (item.cantidad < item.stock) {
          item.cantidad++;
          // ↓↓↓ RESTA 1 al stock visual del producto
          const prod = productosFirestore.find(p => p.id === id);
          if (prod && prod.stock > 0) {
            prod.stock -= 1;
            // renderProductos(productosFirestore, '#productos');
            actualizarProductoIndividual(prod);
          }
          guardarCarrito();
          renderCarrito();
          countadorCarritoIcon();
        } else {
          mostrarToast('No hay más stock disponible para este producto', 'error');
        }
      } 
        
      guardarCarrito();
      renderCarrito();
      countadorCarritoIcon()
    }
    
    // Decrementar cantidad
    if (e.target.classList.contains('decrement')) {
      const prod = carrito.find(p => p.id == id);

      if (prod && prod.cantidad > 1) {
        prod.cantidad--;
        // ↑↑↑ SUMA 1 al stock visual del producto
        const producto = productosFirestore.find(p => p.id === id);
        if (producto) {
          producto.stock += 1;
          // renderProductos(productosFirestore, '#productos');
          actualizarProductoIndividual(producto);
        }
        guardarCarrito();
        renderCarrito();
         countadorCarritoIcon()
      }
    }

    /* ELIMINAR ITEM INDIVIDUAL EN EL CARRITO */
    if (e.target.classList.contains('eliminar-item')) {
      const prod = carrito.find(p => p.id == id);

      if (prod) {
        // ↑↑↑ SUMA el stock de vuelta al producto visual
        const producto = productosFirestore.find(p => p.id === id);
        if (producto) {
          producto.stock += prod.cantidad;
          // renderProductos(productosFirestore, '#productos');
          actualizarProductoIndividual(producto);
        }
      }

      carrito = carrito.filter(p => p.id != id);
      guardarCarrito();
      renderCarrito();
      countadorCarritoIcon()
    }

    /* VACIAR TODO EL CARRITO */
    if(e.target.id === 'vaciar-carrito'){
      // ↑↑↑ SUMA el stock de todos los productos de vuelta
      carrito.forEach(item => {
        const producto = productosFirestore.find(p => p.id === item.id);
        if (producto) {
          producto.stock += item.cantidad;
        }
        actualizarProductoIndividual(producto);
      });
      // renderProductos(productosFirestore, '#productos');
      carrito = [];
      guardarCarrito();
      renderCarrito();
      countadorCarritoIcon()
    }

    if (e.target.id === 'close-cart') {
      cerrarCarrito();
    }


  });
}

// En cart.js, agrega esta función al final
export function inicializarCarrito() {
    renderCarrito();
    countadorCarritoIcon();
    manejarEventosCarrito();
    
    // Configurar evento para el botón del carrito
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', abrirCarrito);
    }
}
