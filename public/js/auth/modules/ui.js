// Mostrar saludo de usuario
export function mostrarSaludoUsuario(user, elemento) {
    elemento.innerHTML = `
        <div class="flex items-center gap-3">
            <img src="${user.photoURL}" alt="Avatar" class="w-10 h-10 rounded-full">
            <p class="text-lg text-gray-100">Hola, <strong>${user.displayName}</strong></p>
        </div>
    `;
}

// Alternar visibilidad del sidebar
export function configurarSidebar() {
    document.getElementById('toggleSidebar')?.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('hidden');
    });
}

// Renderizar previsualización de CSV
export function renderizarPreview(datos, tablaElement) {
    let html = `
        <thead class="bg-gray-100 sticky top-0">
            <tr>
                <th class="border px-3 py-2">Nombre</th>
                <th class="border px-3 py-2">Precio</th>
                <th class="border px-3 py-2">Imagen</th>
                <th class="border px-3 py-2">Talla</th>
                <th class="border px-3 py-2">Stock</th>
                <th class="border px-3 py-2">Género</th>
                <th class="border px-3 py-2">Descripción</th>
            </tr>
        </thead>
        <tbody>
    `;

    datos.forEach(d => {
        html += `
            <tr>
                <td class="border px-3 py-2">${d.nombre}</td>
                <td class="border px-3 py-2">${d.precio}</td>
                <td class="border px-3 py-2">
                    <img src="${d.imagen}" alt="img" class="w-12 h-12 object-cover rounded">
                </td>
                <td class="border px-3 py-2">${d.talla}</td>
                <td class="border px-3 py-2">${d.stock}</td>
                <td class="border px-3 py-2">${d.genero}</td>
                <td class="border px-3 py-2">${d.descripcion}</td>
            </tr>
        `;
    });

    html += "</tbody>";
    tablaElement.innerHTML = html;
}