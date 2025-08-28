export function renderProductos(productos, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  if (productos.length === 0) {
    // APARECE SOLO CUANDO NO CARGAN PRODUCTOS DE LA BASE DE DATOS
    container.innerHTML = `
      <div class="no-products">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-gray-500 text-lg">No se encontraron productos</p>
        <p class="text-gray-400 mt-2">Intenta con otros términos de búsqueda</p>
      </div>
    `;
    return;
  }

  container.innerHTML = productos.map((prod) => `
    <div class="container-product group">
      ${prod.stock <= 0 ? '<div class="out-of-stock-badge">Agotado</div>' : ''}
      
      <!-- Envuelve la parte clickeable (imagen e info) en un enlace -->
      <a href="productDetail.html?id=${prod.id}" class="product-link block cursor-pointer">
        <div class="image-container">
          <img 
            src="${prod.imagen}" 
            alt="${prod.producto}" 
            class="product-img"
            loading="lazy"
            onerror="this.src='https://via.placeholder.com/300x300?text=Imagen+No+Disponible'"
          />
        </div>
        
        <div class="product-info">
          <h3 class="product-title">${prod.producto}</h3>
          
          <div class="flex justify-between items-center mb-2">
            <p class="product-price">$${Number(prod.precio).toLocaleString('es-CO')}</p>
            <p class="product-size">Talla: ${prod.talla}</p>
          </div>
          
          <div class="mt-auto">
            <p class="${prod.stock > 0 ? 'in-stock' : 'out-of-stock'} product-stock">
              ${prod.stock > 0 ? `En stock: ${prod.stock} unidades` : 'Producto agotado'}
            </p>
          </div>
        </div>
      </a>
      
      <!-- El botón queda FUERA del enlace para evitar conflictos -->
      <div class="w-full flex justify-center mt-4">
        <button
          class="btn-add-cart cartBtn ${prod.stock <= 0 ? 'disabled' : ''}"
          data-id="${prod.id}" 
          ${prod.stock <= 0 ? 'disabled' : ''}
        >
          <svg class="cart" fill="currentColor" viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 
            31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 
            24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 
            0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"></path>
          </svg>
          <span class="text">${prod.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512" class="product">
            <path d="M211.8 0c7.8 0 14.3 5.7 16.7 13.2C240.8 51.9 277.1 80 320 80s79.2-28.1 91.5-66.8C413.9 
            5.7 420.4 0 428.2 0h12.6c22.5 0 44.2 7.9 61.5 22.3L628.5 127.4c6.6 5.5 10.7 13.5 11.4 22.1s-2.1 
            17.1-7.8 23.6l-56 64c-11.4 13.1-31.2 14.6-44.6 3.5L480 197.7V448c0 35.3-28.7 64-64 64H224c-35.3 
            0-64-28.7-64-64V197.7l-51.5 42.9c-13.3 11.1-33.1 9.6-44.6-3.5l-56-64c-5.7-6.5-8.5-15-7.8-23.6s4.8-16.6 
            11.4-22.1L137.7 22.3C155 7.9 176.7 0 199.2 0h12.6z"></path>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

// Función para actualizar solo un producto específico
export function actualizarProductoIndividual(producto) {
  const productElement = document.querySelector(`.container-product button[data-id="${producto.id}"]`)?.closest('.container-product');
  
  if (!productElement) return;
  
  // Actualizar el stock
  const stockElement = productElement.querySelector('.product-stock');
  if (stockElement) {
    stockElement.innerHTML = producto.stock > 0 ? 
      `<span class="in-stock">En stock: ${producto.stock} unidades</span>` : 
      '<span class="out-of-stock">Producto agotado</span>';
  }
  
  // Actualizar el botón
  const button = productElement.querySelector('.cartBtn');
  if (button) {
    if (producto.stock <= 0) {
      button.disabled = true;
      button.querySelector('.text').textContent = 'Sin stock';
    } else {
      button.disabled = false;
      button.querySelector('.text').textContent = 'Agregar al carrito';
    }
  }
  
  // Actualizar badge de agotado
  const outOfStockBadge = productElement.querySelector('.out-of-stock-badge');
  if (producto.stock <= 0) {
    if (!outOfStockBadge) {
      productElement.querySelector('.image-container').insertAdjacentHTML('beforeend', '<div class="out-of-stock-badge">Agotado</div>');
    }
  } else if (outOfStockBadge) {
    outOfStockBadge.remove();
  }
}