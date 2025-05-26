import { mostrarToast, animarIconoCarrito } from '../utils/notificaciones.js';

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

export function agregarAlCarrito(producto) {
  const existente = carrito.find(p => p.id === producto.id);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
    console.log(carrito)
  }
  
  if (typeof carrito === 'undefined') {
    console.warn("Variable 'carrito' no está definida.");
    return;
  }
  
  mostrarToast('Producto agregado correctamente', 'success');
  animarIconoCarrito();


  guardarCarrito();
  renderCarrito();
  countadorCarritoIcon();
  // abrirCarrito();
}


// Funcion de contador de productos en el icono del carrito
export function countadorCarritoIcon() {
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
          <button class="increment text-lg px-2 border rounded" data-id="${item.id}">+</button>
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

    if (e.target.classList.contains('increment')) {
      const item = carrito.find(p => p.id === id);
      if (item) item.cantidad++;
      guardarCarrito();
      renderCarrito();
      countadorCarritoIcon()
    }
    
    if (e.target.classList.contains('decrement')) {
      const id = e.target.dataset.id;
      const prod = carrito.find(p => p.id == id);
      if (prod && prod.cantidad > 1) {
        prod.cantidad--;
        guardarCarrito();
        renderCarrito();
         countadorCarritoIcon()
      }
    }

    /* ELIMINAR ITEM INDIVIDUAL EN EL CARRITO */
    if (e.target.classList.contains('eliminar-item')) {
      carrito = carrito.filter(p => p.id != id);
      guardarCarrito();
      renderCarrito();
      countadorCarritoIcon()
    }

    /* VACIAR TODO EL CARRITO */

    if(e.target.id === 'vaciar-carrito'){
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
