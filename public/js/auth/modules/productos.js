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
import { db } from "../../utils/firebaseConfig.js"; // Ruta corregida
import { renderProductosAdmin } from "../../components/renderProductosAdmin.js"; // Ruta corregida

let productosGlobal = [];
let contadorProductosElement = null;

export function inicializarProductos(contadorElement) {
    contadorProductosElement = contadorElement;
}

// Validar si existe producto duplicado
export async function validarDuplicado(nombre, imagen) {
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

// Agregar producto
export async function agregarProducto(productoData) {
    try {
        await addDoc(collection(db, "productos"), productoData);
        return { exito: true, mensaje: "Producto agregado" };
    } catch (err) {
        console.error("Error al agregar producto:", err);
        return { exito: false, mensaje: "No se pudo agregar" };
    }
}

// Cargar todos los productos
export async function cargarProductos() {
    const productos = [];
    const snapshot = await getDocs(collection(db, "productos"));
    snapshot.forEach(docSnap => {
        productos.push({ id: docSnap.id, ...docSnap.data() });
    });

    productosGlobal = productos;
    return productos;
}

// Eliminar producto
export async function eliminarProducto(id) {
    await deleteDoc(doc(db, "productos", id));
}

// Obtener producto por ID
export async function obtenerProductoPorId(id) {
    const productoRef = doc(db, "productos", id);
    const docSnap = await getDoc(productoRef);
    
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    
    return null;
}

// Actualizar producto
export async function actualizarProducto(id, datos) {
    try {
        const docRef = doc(db, "productos", id);
        await setDoc(docRef, datos);
        return { exito: true, mensaje: "Producto actualizado correctamente." };
    } catch (err) {
        console.error("Error actualizando producto:", err);
        return { exito: false, mensaje: "Error al actualizar el producto." };
    }
}

// Filtrar productos
export function filtrarProductos(texto) {
    const filtrados = productosGlobal.filter(p =>
        p.producto.toLowerCase().includes(texto.toLowerCase())
    );
    return filtrados;
}

// Renderizar productos
export function renderizarProductos(productos, contenedor) {
    renderProductosAdmin(productos, contenedor);
}

// Actualizar contador
export function actualizarContador(cantidad) {
    if (contadorProductosElement) {
        contadorProductosElement.textContent = `Total: ${cantidad} producto${cantidad !== 1 ? 's' : ''}`;
    }
}