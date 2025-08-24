let productoEditandoId = null;
let modalEditar = null;
let formEditar = null;

export function inicializarModal(modalElement, formElement) {
    modalEditar = modalElement;
    formEditar = formElement;
}

// Abrir modal de edición
export function abrirModalEditar(producto) {
    if (!modalEditar) return;
    
    productoEditandoId = producto.id;
    
    // Rellenar formulario con datos del producto
    document.getElementById("inputEditNombre").value = producto.producto;
    document.getElementById("inputEditPrecio").value = producto.precio;
    document.getElementById("inputEditImagen").value = producto.imagen;
    document.getElementById("inputEditGenero").value = producto.genero;
    document.getElementById("inputEditTalla").value = producto.talla;
    document.getElementById("inputEditStock").value = producto.stock ?? 0;
    document.getElementById("inputEditDescripcion").value = producto.descripcion ?? "";

    // Mostrar modal con animación
    const contenido = modalEditar.querySelector("div");
    contenido.classList.remove("fade-out");
    contenido.classList.add("fade-in");
    modalEditar.classList.remove("hidden");
}

// Cerrar modal de edición
export function cerrarModalEditar() {
    if (!modalEditar) return;
    
    const contenido = modalEditar.querySelector("div");
    contenido.classList.remove("fade-in");
    contenido.classList.add("fade-out");

    // Esperar animación antes de ocultar
    setTimeout(() => {
        modalEditar.classList.add("hidden");
    }, 150);

    productoEditandoId = null;
}

// Obtener ID del producto en edición
export function obtenerProductoEditandoId() {
    return productoEditandoId;
}

// Configurar eventos del modal
export function configurarEventosModal() {
    if (!modalEditar || !formEditar) return;
    
    // Cerrar modal al hacer click fuera
    /* 
    modalEditar.addEventListener("click", (e) => {
        if (e.target === modalEditar) cerrarModalEditar();
    });
    */

    // Cerrar modal con tecla Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modalEditar.classList.contains("hidden")) {
            cerrarModalEditar();
        }
    });
}