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
  setDoc,
  query, 
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function actualizarProductosConNuevosCampos() {
  const snapshot = await getDocs(collection(db, "productos"));
  const updates = [];
  snapshot.forEach(docSnap => {
    const ref = doc(db, "productos", docSnap.id);
    // Solo agrega los campos si no existen, o actualiza el valor por defecto
    updates.push(setDoc(ref, {
      ...docSnap.data(),
      stock: docSnap.data().stock ?? 10, // Si ya tiene stock, lo deja igual, si no, pone 10
      descripcion: docSnap.data().descripcion ?? "",
      oferta: docSnap.data().oferta ?? false
    }));
  });
  await Promise.all(updates);
  alert("Todos los productos han sido actualizados con los nuevos campos.");
}
// Llama esta función UNA SOLA VEZ para agregar mas atributos a la BD FireStore
// actualizarProductosConNuevosCampos();

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
// const sidebar = document.getElementById('sidebar');
// const togleSidebar = document.getElementById('toggleSidebar');
const fileInput = document.getElementById('archivo-productos');
const nombreArchivo = document.getElementById('nombre-archivo');

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
// VALIDAR SI EXISTE PRODUCTOS IGUALES
// ===========================
async function validarDuplicado(nombre, imagen) {
    // Busca por nombre
    const qNombre = query(collection(db, "productos"), where("producto", "==", nombre.trim()));
    const snapNombre = await getDocs(qNombre);

    // Busca por imagen
    const qImagen = query(collection(db, "productos"), where("imagen", "==", imagen.trim()));
    const snapImagen = await getDocs(qImagen);

    return {
      duplicadoNombre: !snapNombre.empty,
      duplicadoImagen: !snapImagen.empty
    };
  }

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
// IMPORTAR PRODUCTOS MASIVOS CSV
// ===========================
document.getElementById('form-importar-productos').addEventListener('submit', async function(e) {
    e.preventDefault();
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(event) {
        const text = event.target.result;
        const rows = text.split('\n').filter(Boolean);
        let exitos = 0, fallos = 0, duplicadosNombre = 0, duplicadosImagen = 0;

        for (const row of rows) {
            const parts = row.includes(';') ? row.split(';') : row.split(',');
            const [nombre, precio, imagen, talla, genero] = parts;
            if (nombre && precio && imagen && talla && genero) {
              const { duplicadoNombre, duplicadoImagen } = await validarDuplicado(nombre, imagen);
                if (duplicadoNombre) {
                    duplicadosNombre++;
                    continue;
                }
                if (duplicadoImagen) {
                    duplicadosImagen++;
                    continue;
                }
                try {
                    await agregarProducto({ nombre, precio, imagen, talla, genero });
                    exitos++;
                } catch (err) {
                    fallos++;
                }
            } else {
                fallos++;
            }
        }

        let mensaje = `✅ Importados: ${exitos}\n❌ Fallidos: ${fallos}`;
        if (duplicadosNombre > 0) mensaje += `\n⚠️ Duplicados por nombre: ${duplicadosNombre}`;
        if (duplicadosImagen > 0) mensaje += `\n⚠️ Duplicados por imagen: ${duplicadosImagen}`;

        Swal.fire({
            title: 'Importación finalizada',
            text: mensaje,
            icon: exitos ? "success" : "error",
            draggable: true
        });

        cargarProductos();
    };
    reader.readAsText(file);
});

// ===========================
// CAMBIAR NOMBRE AL CARGAR EL ARCHIVO EN EL INPUT PARA IMPORTAR LOS PRODUCTOS
// ===========================
fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) {
        nombreArchivo.lastChild.textContent = fileInput.files[0].name;
    } else {
        nombreArchivo.lastChild.textContent = 'Elige un archivo';
    }
});

// ===========================
// CARGAR PRODUCTOS CSV
// ===========================
async function agregarProducto({ nombre, precio, imagen, talla, genero }) {
  try {
    await addDoc(collection(db, "productos"), {
      producto: nombre.trim(),
      precio: parseFloat(precio),
      imagen: imagen.trim(),
      genero: genero.trim(),
      talla: talla.trim()
    });
  } catch (err) {
    console.error("Error al agregar producto desde CSV:", err);
  }
}


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