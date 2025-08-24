import { 
    collection, 
    addDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { db } from "../../utils/firebaseConfig.js";
import { validarDuplicado } from "./productos.js";

let datosCSV = [];
let fileInput = null;
let nombreArchivoElement = null;

export function inicializarImportacion(fileInputElement, nombreArchivo) {
    fileInput = fileInputElement;
    nombreArchivoElement = nombreArchivo;
    
    // Configurar evento change para el input de archivo
    fileInput.addEventListener("change", function () {
        if (fileInput.files.length > 0) {
            nombreArchivoElement.lastChild.textContent = fileInput.files[0].name;
            leerArchivoCSV(fileInput.files[0]);
        } else {
            nombreArchivoElement.lastChild.textContent = 'Elige un archivo';
        }
    });
}

// Leer archivo CSV
function leerArchivoCSV(archivo) {
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
    };
    reader.readAsText(archivo);
}

// Obtener datos CSV para previsualización
export function obtenerDatosCSV() {
    return datosCSV;
}

// Procesar importación
export async function procesarImportacion() {
    let exitos = 0, fallos = 0, duplicadosNombre = 0, duplicadosImagen = 0;

    for (const d of datosCSV) {
        try {
            if (d.nombre && d.precio && d.imagen && d.talla && d.stock && d.genero && d.descripcion) {
                const { duplicadoNombre, duplicadoImagen } = await validarDuplicado(d.nombre, d.imagen);
                if (duplicadoNombre) {
                    duplicadosNombre++;
                    continue;
                }
                if (duplicadoImagen) {
                    duplicadosImagen++;
                    continue;
                }
                
                await agregarProductoDesdeCSV(d);
                exitos++;
            } else {
                fallos++;
            }
        } catch {
            fallos++;
        }
    }

    return { exitos, fallos, duplicadosNombre, duplicadosImagen };
}

// Agregar producto desde CSV
async function agregarProductoDesdeCSV({ nombre, precio, imagen, talla, genero, stock, descripcion }) {
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
        throw err;
    }
}