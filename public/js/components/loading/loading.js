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

// export function showLoader() {
//     const loader = document.getElementById("loader");
//     if (loader) loader.style.display = "flex";
// }

export function showLoader(estilo = "default") {
    const loader = document.getElementById("loader");
    if (!loader) return;

    loader.style.display = "flex";

    // Diferenciar estilo
    if (estilo === "admin") {
        loader.innerHTML = `
            <div class="admin-loader w-full absolute">
                <div class="relative flex w-[90%] animate-pulse gap-2 p-4">
                    <div class="h-18 w-16 bg-slate-400"></div>
                    <div class="flex-1">
                        <div class="mb-1 h-7 w-3/5 rounded-lg bg-slate-400 text-lg"></div>
                        <div class="h-7 w-[90%] rounded-lg bg-slate-400 text-sm"></div>
                    </div>
                    <div class="flex">
                        <div class="absolute bottom-5 right-0 h-4 w-4 rounded-full bg-slate-400 left-[95%]"></div>
                        <div class="absolute bottom-5 right-0 h-4 w-4 rounded-full bg-slate-400"></div>
                    </div>
                </div>
            </div>
        `;
    }
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