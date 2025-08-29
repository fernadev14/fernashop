import { obtenerProductosFirestore } from '../../data/productosFirestore.js';
import { renderProductos } from '../renderProductos.js';

export async function init() {
    showLoader(); // mostrar loading al inicio
    
    try {
        const productos = await obtenerProductosFirestore(); // espera firestore
        renderProductos(productos, "#productos"); // pinta productos en el DOM
    } catch (err) {
        console.error("Error cargando productos:", err);
    } finally {
        hideLoader(); // ocultar loader solo cuando ya están pintados
    }
}

export function showLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "flex";
}

export function hideLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    
    loader.classList.add("opacity-0");
    setTimeout(() => loader.style.display = "none", 500);
    
    // Mostrar contenido
    document.querySelector("header")?.classList.remove("hidden");
    document.querySelector("main")?.classList.remove("hidden");
    document.querySelector("footer")?.classList.remove("hidden");
}

/*
export function initLoading() {
    const loader = document.getElementById('loader');

    window.addEventListener('load', () => {
        if(!loader) return;

        //ocultar loading con animacion
        loader.classList.add('opacity-0');
        setTimeout(() => loader.style.display = 'none', 500);

        //Mostrar contenido
        document.querySelector('header')?.classList.remove('hidden');
        document.querySelector('main')?.classList.remove('hidden');
        document.querySelector('footer')?.classList.remove('hidden');
    });

}
*/