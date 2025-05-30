import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { app, db } from "../js/utils/firebaseConfig.js";
import { renderProductosAdmin } from "../js/components/renderProductosAdmin.js";
import { observarEstadoAuth } from "../js/utils/authhState.js";

//IMPORTAR PRODUCTOS
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const adminUID = "b2ofpkg90oZZVkpdhLe4Om2IvQC3";

// Elementos del DOM  y modal de edición
const modalEditar = document.getElementById("modal-editar");
const formEditar = document.getElementById("form-editar-producto");
const cancelarBtn = document.getElementById("btn-cancelar-edicion");
const welcomeText = document.getElementById("admin-welcome");
const logoutBtn = document.getElementById("logout-btn");
const form = document.getElementById("agregar-producto-form");
const lista = document.getElementById("lista-productos");
const inputBuscar = document.getElementById("input-buscar");
const contadorProductos = document.getElementById("contador-productos");
const sidebar = document.getElementById('sidebar');
const togleSidebar = document.getElementById('toggleSidebar');

// Para edicion y busqueda
let productosGlobal = [];
let productoEditandoId = null;

// Verifica autenticación y rol
onAuthStateChanged(auth, user => {
    if (!user || user.uid !== adminUID) {
      alert("Acceso denegado. No tienes permisos de administrador.");
      window.location.href = "../login.html";
      return;
    }

  // Mostrar saludo personalizado
    welcomeText.innerHTML = `
      <div class="flex items-center gap-3">
        <img src="${user.photoURL}" alt="Avatar" class="w-10 h-10 rounded-full">
        <p class="text-lg text-gray-100">Hola, <strong>${user.displayName}</strong></p>
      </div>
    `;
});

observarEstadoAuth();

// ===========================
// CERRAR SESIÓN
// ===========================
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "../login.html";
  } catch (error) {
    console.error("Error cerrando sesión:", error);
    alert("Ocurrió un error al cerrar sesión.");
  }
});

// ===========================
// AGREGAR / EDITAR PRODUCTO
// ===========================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = form.nombre.value.trim();
  const precio = parseFloat(form.precio.value);
  const imagen = form.imagen.value.trim();
  const genero = form.genero.value;
  const talla = form.talla.value;

  if (!nombre || !precio || !imagen || !genero || !talla) {
    alert("Todos los campos son obligatorios");
    return;
  }

  try {
    await addDoc(collection(db, "productos"), {
      producto: nombre,
      precio,
      imagen,
      genero,
      talla
    });
    alert("Producto agregado");
    form.reset();
    cargarProductos();
  } catch (err) {
    console.error("Error al agregar producto:", err);
    alert("No se pudo agregar");
  }

});

// ===========================
// CERRAR SIDEBAR EN ADMIN.HTML
// ===========================
document.getElementById('toggleSidebar')?.addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('hidden');
});


// ===========================
// CARGAR PRODUCTOS
// ===========================
async function cargarProductos() {
  const productos = [];
  const snapshot = await getDocs(collection(db, "productos"));
  snapshot.forEach(docSnap => {
    productos.push({ id: docSnap.id, ...docSnap.data() 
    });
  });

  productosGlobal = productos;
  renderProductosAdmin(productos, "#lista-productos");
  actualizarContador(productosGlobal.length);
}

// Contador de productos en el panel admin
function actualizarContador(cantidad) {
  contadorProductos.textContent = `Total: ${cantidad} producto${cantidad !== 1 ? 's' : ''}`;
}

// Buscar productos
inputBuscar.addEventListener("input", () => {
  const texto = inputBuscar.value.toLowerCase();
  const filtrados = productosGlobal.filter(p =>
    p.producto.toLowerCase().includes(texto)
  );

  renderProductosAdmin(filtrados, "#lista-productos");
  actualizarContador(filtrados.length);
});

// ===========================
// ELIMINAR / CARGAR PARA EDITAR
// ===========================
lista.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;

    // Eliminar
  if (e.target.classList.contains("eliminar-btn")) {
    if (confirm("¿Eliminar este producto?")) {
      await deleteDoc(doc(db, "productos", id));
      cargarProductos();
    }
  }

  // Editar
  if(e.target.classList.contains("editar-btn")){
    const id = e.target.dataset.id;
    const productoRef = doc(db, "productos", id);
    const docSnap = await getDoc(productoRef);

    if(docSnap.exists()){
        const data = docSnap.data();

        //rellenar el formulario con los datos
        inputEditNombre.value = data.producto;
        inputEditPrecio.value = data.precio;
        inputEditImagen.value = data.imagen;
        inputEditGenero.value = data.genero;
        inputEditTalla.value = data.talla;

        //Guardamos el ID del boton
        productoEditandoId = id;
        abrirModalEditar();
    }
  }
});

function abrirModalEditar() {
  const contenido = modalEditar.querySelector("div"); // contenedor interno
  contenido.classList.remove("fade-out");
  contenido.classList.add("fade-in");
  modalEditar.classList.remove("hidden");
}

function cerrarModalEditar() {
  const contenido = modalEditar.querySelector("div");
  contenido.classList.remove("fade-in");
  contenido.classList.add("fade-out");

  // Esperar animación antes de ocultar
  setTimeout(() => {
    modalEditar.classList.add("hidden");
  }, 150);

  productoEditandoId = null;
}

// ===========================
// EVENTO SUBMIT PARA EL FORM MODAL
// ===========================
formEditar.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!productoEditandoId) return;

  try {
    const docRef = doc(db, "productos", productoEditandoId);
    await setDoc(docRef, {
      producto: inputEditNombre.value.trim(),
      precio: parseFloat(inputEditPrecio.value),
      imagen: inputEditImagen.value.trim(),
      genero: inputEditGenero.value,
      talla: inputEditTalla.value.trim()
    });

    alert("Producto actualizado correctamente.");
    cerrarModalEditar()
    cargarProductos();
  } catch (err) {
    console.error("Error actualizando producto:", err);
    alert("Error al actualizar el producto.");
  }
});


// Cancelar edición
cancelarBtn.addEventListener("click", cerrarModalEditar);

//Cerrar modal al hacer click fuera del modal
modalEditar.addEventListener("click", (e) => {
  if (e.target === modalEditar) cerrarModalEditar();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalEditar.classList.contains("hidden")) {
    cerrarModalEditar();
  }
});

cargarProductos();