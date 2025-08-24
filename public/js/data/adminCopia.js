import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"; 
import { app, db } from "../utils/firebaseConfig.js"; 
import { renderProductosAdmin } from "../components/renderProductosAdmin.js "; 
import { observarEstadoAuth } from "../utils/authhState.js"; 
import { descargarPlantillaExcel } from "../utils/plantillaExcel.js";

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

/*
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
*/
// Llama esta función UNA SOLA VEZ para agregar mas atributos a la BD FireStore
// actualizarProductosConNuevosCampos();

const auth = getAuth(app);
const adminUID = "b2ofpkg90oZZVkpdhLe4Om2IvQC3";

// Elementos del DOM  y modal de edición
const modalEditar = document.getElementById("modal-editar");
const formEditar = document.getElementById("form-editar-producto");
const inputEditStock = document.getElementById("inputEditStock");
const inputEditDescripcion = document.getElementById("inputEditDescripcion");
const cancelarBtn = document.getElementById("btn-cancelar-edicion");
const welcomeText = document.getElementById("admin-welcome");
const logoutBtn = document.getElementById("logout-btn");
const form = document.getElementById("agregar-producto-form");
const lista = document.getElementById("lista-productos");
const inputBuscar = document.getElementById("input-buscar");
const contadorProductos = document.getElementById("contador-productos");
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

  // console.log(form);
  // console.log(form.description);

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

  try {
    await addDoc(collection(db, "productos"), {
      producto: nombre,
      precio,
      imagen,
      genero,
      talla,
      stock,
      descripcion
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

            // Verificar si todos los campos estan vacios
            if (parts.every(field => !field.trim())) continue;
            const [nombre, precio, imagen, talla, stock, genero, descripcion] = parts;
            if (nombre && precio && imagen && talla && stock && genero && descripcion) {
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
                    await agregarProducto({ nombre, precio, imagen, talla, stock, genero, descripcion });
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
// DESCARGAR PLANTILLA CSV
// ===========================
document.getElementById("descargar-ejemplo")?.addEventListener("click", () => {
  descargarPlantillaExcel();
  // const encabezados = "nombre,precio,imagen,talla,stock,genero,descripcion\n";
  // const ejemplo = "Camiseta Azul,50000,https://urlimagen.com/camiseta.jpg,M,20,Hombre,Bonita camiseta de algodón\n";
  
  // const blob = new Blob([encabezados + ejemplo], { type: "text/csv" });
  // const url = URL.createObjectURL(blob);
  // const a = document.createElement("a");
  // a.href = url;
  // a.download = "plantilla_productos.csv";
  // a.click();
  // URL.revokeObjectURL(url);
});

// ===========================
// CAMBIAR NOMBRE AL CARGAR EL ARCHIVO EN EL INPUT PARA IMPORTAR LOS PRODUCTOS
// ===========================
// fileInput.addEventListener('change', function () {
//     if (fileInput.files.length > 0) {
//         nombreArchivo.lastChild.textContent = fileInput.files[0].name;
//     } else {
//         nombreArchivo.lastChild.textContent = 'Elige un archivo';
//     }
// });

// ===========================
// PREVISUALIZAR CSV EN MODAL
// ===========================
let datosCSV = [];

fileInput.addEventListener("change", function () {
  if (fileInput.files.length > 0) {
    nombreArchivo.lastChild.textContent = fileInput.files[0].name;

    const reader = new FileReader();
    reader.onload = function (event) {
      const text = event.target.result;
      const rows = text.split("\n").filter(Boolean);
      datosCSV = rows.map(row => {
        const parts = row.includes(";") ? row.split(";") : row.split(",");
        return {
          nombre: parts[0]?.trim(),
          precio: parts[1]?.trim(),
          imagen: parts[2]?.trim(),
          talla: parts[3]?.trim(),
          stock: parts[4]?.trim(),
          genero: parts[5]?.trim(),
          descripcion: parts[6]?.trim()
        };
      });

      abrirModalPreview();
      renderizarPreview(datosCSV);
    };
    reader.readAsText(fileInput.files[0]);
  }
});


function renderizarPreview(datos) {
  const table = document.getElementById("preview-table");

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
  table.innerHTML = html;
}

// ===========================
// ABRIR / CERRAR MODAL PREVIEW
// ===========================
const modalPreview = document.getElementById("modal-preview");
const cancelarPreviewBtn = document.getElementById("cancelar-preview");
const confirmarPreviewBtn = document.getElementById("confirmar-importacion");
const previsualizarBtn = document.getElementById("previsualizar");

function abrirModalPreview() {
  modalPreview.classList.remove("hidden");
}

function cerrarModalPreview() {
  modalPreview.classList.add("hidden");
}

previsualizarBtn.addEventListener("click", () => {
  abrirModalPreview(); // 🔹 Reutilizamos la misma función
});

// console.log(previsualizarBtn)

cancelarPreviewBtn.addEventListener("click", cerrarModalPreview);
confirmarPreviewBtn.addEventListener("click", cerrarModalPreview);

// ===========================
// CONFIRMAR IMPORTACIÓN
// ===========================
// document.getElementById("confirmar-importacion").addEventListener("click", async () => {
//   let exitos = 0, fallos = 0;

//   for (const d of datosCSV) {
//     try {
//       if (d.nombre && d.precio && d.imagen && d.talla && d.stock && d.genero && d.descripcion) {
//         const { duplicadoNombre, duplicadoImagen } = await validarDuplicado(d.nombre, d.imagen);
//         if (!duplicadoNombre && !duplicadoImagen) {
//           await agregarProducto(d);
//           exitos++;
//         } else {
//           fallos++;
//         }
//       } else {
//         fallos++;
//       }
//     } catch {
//       fallos++;
//     }
//   }

//   Swal.fire({
//     title: "Importación completada",
//     text: `✅ Éxitos: ${exitos} | ❌ Fallos: ${fallos}`,
//     icon: exitos ? "success" : "error"
//   });

//   cargarProductos();
// });

// ===========================
// CARGAR PRODUCTOS CSV
// ===========================
async function agregarProducto({ nombre, precio, imagen, talla, genero, stock, descripcion}) {
  try {
    await addDoc(collection(db, "productos"), {
      producto: nombre.trim(),
      precio: parseFloat(precio),
      imagen: imagen.trim(),
      genero: genero.trim(),
      talla: talla.trim(),
      stock: parseInt(stock, 10),
      descripcion: descripcion.trim()
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
        inputEditStock.value = data.stock ?? 0;
        inputEditDescripcion.value = data.descripcion ?? "";

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
      talla: inputEditTalla.value.trim(),
      stock: parseInt(inputEditStock.value, 10),
      descripcion: inputEditDescripcion.value.trim()
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