export function renderProductos(productos, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  //  console.log("Renderizando productos:", productos);

  container.innerHTML = productos.map((prod, id) => `
    <div class="container-product p-4 shadow hover:shadow-lg transition">
      <img src="${prod.imagen}" alt="${prod.producto}" class="product-img mb-4" />
      
      <div class="flex-grow">
        <h3 class="text-lg font-semibold">${prod.producto}</h3>
        <div class="flex">
            <p class="text-blue-600 font-bold mr-4">$${prod.precio}</p>
            <p class="text-gray-400">Talla: ${prod.talla}</p>
        </div>
        <div class="w-full flex justify-center py-4"></div>
      </div>

        <button data-id="${prod.id}" class="button">
            <svg viewBox="0 0 16 16" class="bi bi-cart-check" height="24" width="24" xmlns="http://www.w3.org/2000/svg" fill="#fff">
                <path d="M11.354 6.354a.5.5 0 0 0-.708-.708L8 8.293 6.854 7.146a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3z"></path>
                <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path>
            </svg>
            <p class="text">Agregar carrito</p>
        </button>
    </div>
  `).join('');
}