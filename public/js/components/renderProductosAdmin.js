export function renderProductosAdmin(productos, containerSelector) {
  const container = document.querySelector(containerSelector);
  container.innerHTML = "";

  if (!productos.length) {
    contenedor.innerHTML = "<p class='text-gray-500'>No hay productos para mostrar.</p>";
    return;
  }

  productos.forEach(p => {
    const card = document.createElement("div");
    card.className = "border p-4 rounded shadow flex justify-between items-center hover:bg-slate-200";
    card.innerHTML = `
      <div class="flex">
      <div class="w-20 mr-5">
        <img src="${p.imagen}" class="rounded"/>
      </div>
      <div>
        <h3 class="font-bold">${p.producto}</h3>
        <p class="text-sm text-gray-600">Categoría: ${p.genero}</p>
        <p class="text-sm text-gray-600">Talla: ${p.talla}</p>
        <p class="text-sm text-gray-800">$${p.precio}</p>
        <p class="text-sm text-gray-800">Stock:${p.stock}</p>
        <p class="text-sm text-gray-800">Descripción: ${p.descripcion}</p>
      </div>
      </div>
      <div>
        <button data-id="${p.id}" class="editar-btn bg-yellow-500 text-white px-3 py-1 rounded">Editar</button>
        <button data-id="${p.id}" class="eliminar-btn bg-red-500 text-white px-3 py-1 rounded">Eliminar</button>
      </div>
    `;
    container.appendChild(card);
  });
}
