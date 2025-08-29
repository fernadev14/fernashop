// Importaciones de Firebase
// import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"; 
// import { app, db } from "../utils/firebaseConfig.js"; 

// Importaciones de componentes
// import { renderProductosAdmin } from "../components/renderProductosAdmin.js";
import { observarEstadoAuth } from "../utils/authhState.js"; 
import { descargarPlantillaExcel } from "../utils/plantillaExcel.js";
import { showLoader, hideLoader } from "../components/loading/loading.js";

// Importaciones de módulos propios
import { 
    verificarAutenticacion, 
    cerrarSesion 
} from "./modules/auth.js";

import {
    inicializarProductos,
    validarDuplicado,
    agregarProducto,
    cargarProductos as cargarProductosDB,
    eliminarProducto,
    obtenerProductoPorId,
    actualizarProducto,
    filtrarProductos,
    renderizarProductos,
    actualizarContador
} from "./modules/productos.js";

import {
    inicializarImportacion,
    obtenerDatosCSV,
    procesarImportacion
} from "./modules/importacion.js";

import {
    inicializarModal,
    abrirModalEditar,
    cerrarModalEditar,
    obtenerProductoEditandoId,
    configurarEventosModal
} from "./modules/modalEdicion.js";

import {
    mostrarSaludoUsuario,
    configurarSidebar,
    renderizarPreview
} from "./modules/ui.js";

// Elementos del DOM
const welcomeText = document.getElementById("admin-welcome");
const logoutBtn = document.getElementById("logout-btn");
const form = document.getElementById("agregar-producto-form");
const lista = document.getElementById("lista-productos");
const inputBuscar = document.getElementById("input-buscar");
const contadorProductos = document.getElementById("contador-productos");
const fileInput = document.getElementById('archivo-productos');
const nombreArchivo = document.getElementById('nombre-archivo');
const modalEditar = document.getElementById("modal-editar");
const formEditar = document.getElementById("form-editar-producto");
const cancelarBtn = document.getElementById("btn-cancelar-edicion");
const modalPreview = document.getElementById("modal-preview");
const cancelarPreviewBtn = document.getElementById("cancelar-preview");
const confirmarPreviewBtn = document.getElementById("confirmar-importacion");
const previsualizarBtn = document.getElementById("previsualizar");

// Inicializar módulos
inicializarProductos(contadorProductos);
inicializarImportacion(fileInput, nombreArchivo);
inicializarModal(modalEditar, formEditar);
configurarEventosModal();
configurarSidebar();

// Verificar autenticación
verificarAutenticacion((user) => {
    mostrarSaludoUsuario(user, welcomeText);
});

observarEstadoAuth();

// ===========================
// EVENT LISTENERS
// ===========================

// Cerrar sesión
logoutBtn.addEventListener("click", async () => {
    await cerrarSesion();
});

// Agregar producto
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const precio = parseFloat(form.precio.value);
    const imagen = form.imagen.value.trim();
    const genero = form.genero.value;
    const talla = form.talla.value;
    const stock = parseInt(form.stock.value, 10);
    const descripcion = form.description.value.trim();

    if (!nombre || isNaN(precio) || precio <= 0 || !imagen || !genero || !talla || isNaN(stock) || stock < 0) {
        alert("Todos los campos son obligatorios");
        return;
    }

    const { duplicadoNombre, duplicadoImagen } = await validarDuplicado(nombre, imagen);

    if (duplicadoNombre) {
        Swal.fire({ 
            title: "Ya existe un producto con ese nombre.", 
            icon: "error",
            draggable: true
        });
        return;
    }
    if (duplicadoImagen) {
        Swal.fire({ 
            title: "Ya existe un producto con esa imagen.", 
            icon: "error",
            draggable: true
        });
        return;
    }

    const resultado = await agregarProducto({
        producto: nombre,
        precio,
        imagen,
        genero,
        talla,
        stock,
        descripcion
    });

    if (resultado.exito) {
        alert(resultado.mensaje);
        form.reset();
        await cargarYRenderizarProductos();
    } else {
        alert(resultado.mensaje);
    }
});

// Buscar productos
inputBuscar.addEventListener("input", () => {
    const texto = inputBuscar.value;
    const productosFiltrados = filtrarProductos(texto);
    renderizarProductos(productosFiltrados, "#lista-productos");
    actualizarContador(productosFiltrados.length);
});

// Eventos para eliminar y editar productos
lista.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;

    // Eliminar producto
    if (e.target.classList.contains("eliminar-btn")) {
        if (confirm("¿Eliminar este producto?")) {
            await eliminarProducto(id);
            await cargarYRenderizarProductos();
        }
    }

    // Editar producto
    if (e.target.classList.contains("editar-btn")) {
        const producto = await obtenerProductoPorId(id);
        if (producto) {
            abrirModalEditar(producto);
        }
    }
});

// Formulario de edición
formEditar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const productoId = obtenerProductoEditandoId();
    if (!productoId) return;

    try {
        const resultado = await actualizarProducto(productoId, {
            producto: document.getElementById("inputEditNombre").value.trim(),
            precio: parseFloat(document.getElementById("inputEditPrecio").value),
            imagen: document.getElementById("inputEditImagen").value.trim(),
            genero: document.getElementById("inputEditGenero").value,
            talla: document.getElementById("inputEditTalla").value.trim(),
            stock: parseInt(document.getElementById("inputEditStock").value, 10),
            descripcion: document.getElementById("inputEditDescripcion").value.trim()
        });

        if (resultado.exito) {
            alert(resultado.mensaje);
            cerrarModalEditar();
            await cargarYRenderizarProductos();
        } else {
            alert(resultado.mensaje);
        }
    } catch (err) {
        console.error("Error actualizando producto:", err);
        alert("Error al actualizar el producto.");
    }
});

// Cancelar edición
cancelarBtn.addEventListener("click", cerrarModalEditar);

// Previsualizar CSV
previsualizarBtn.addEventListener("click", () => {
    const datos = obtenerDatosCSV();
    if (datos.length > 0) {
        renderizarPreview(datos, document.getElementById("preview-table"));
        modalPreview.classList.remove("hidden");
    } else {
      Swal.fire({
        title: "No hay datos para ver. Selecciona un archivo CSV.",
        icon: "error",
        draggable: true
      });
    }
});

// Cancelar previsualización
cancelarPreviewBtn.addEventListener("click", () => {
    modalPreview.classList.add("hidden");
});

// Confirmar importación
confirmarPreviewBtn.addEventListener("click", async () => {
    modalPreview.classList.add("hidden");
    
    const { exitos, fallos, duplicadosNombre, duplicadosImagen } = await procesarImportacion();
    
    let mensaje = `✅ Importados: ${exitos}\n❌ Fallidos: ${fallos}`;
    if (duplicadosNombre > 0) mensaje += `\n⚠️ Duplicados por nombre: ${duplicadosNombre}`;
    if (duplicadosImagen > 0) mensaje += `\n⚠️ Duplicados por imagen: ${duplicadosImagen}`;

    Swal.fire({
        title: 'Importación finalizada',
        text: mensaje,
        icon: exitos ? "success" : "error",
        draggable: true
    });

    await cargarYRenderizarProductos();
});

// Descargar plantilla CSV
document.getElementById("descargar-ejemplo")?.addEventListener("click", () => {
    descargarPlantillaExcel();
});

// ===========================
// FUNCIONES AUXILIARES
// ===========================

// Cargar y renderizar productos
async function cargarYRenderizarProductos() {
    const productos = await cargarProductosDB();
    renderizarProductos(productos, "#lista-productos");
    actualizarContador(productos.length);
}

// Inicializar la aplicación
async function inicializar() {
    showLoader("admin"); // 👈 loader en modo admin

    try {
        await cargarYRenderizarProductos(); // carga inicial de productos
    } catch (err) {
        console.error("Error inicializando admin:", err);
    } finally {
        hideLoader(); // 👈 ocultar cuando ya estén pintados
    }
}

// Iniciar la aplicación
inicializar();