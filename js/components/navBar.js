import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { app } from "../utils/firebaseConfig.js";

const auth = getAuth(app);

let navTemplate = `
    <nav class="bg-white border-gray-200 dark:bg-gray-900 fixed top-0 left-0 w-full z-50 shadow">
        <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">

        <!-- Logo -->
        <a href="#" class="flex items-center space-x-3 rtl:space-x-reverse">
          <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">FernaShop</span>
        </a>

        <!-- Buscador + Carrito + Login -->
        <div class="flex items-center gap-4 md:order-2">
        
            <!-- Buscador -->
            <div class="relative hidden md:block">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
              </div>
              <input type="text" id="search-navbar" placeholder="Buscar..."
                class="block w-full pl-10 pr-4 py-2 text-sm border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div id="user-auth" class="flex items-center gap-4">
              <!-- Botón Login -->
              <button id="login-btn" class="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 cursor-pointer">
                Login / Registro
              </button>

              <!-- Info de usuario logueado -->
              <div id="user-info" class="hidden items-center gap-2">
                <div class="flex items-end">
                  <img id="user-photo" class="w-8 h-8 rounded-full mr-1" src="" alt="Foto perfil">
                  <span id="user-name" class="text-white text-lg"></span>
                </div>


                <!-- Boton cerrar sesion -->
                <button id="logout-btn" class="hidden flex px-3 py-1 text-white rounded text-sm cursor-pointer fadeBtn-in">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 12H9m9 0l-3-3m3 3l-3 3" />
                </svg>
                Cerrar sesion
                </button>
              </div>
            </div>

            <!-- Carrito -->
            <button type="button" id="cart-btn" class="text-gray-500 dark:text-gray-400 hover:text-blue-600 cursor-pointer">
                <div id="cart-icon" class="flex relative">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7h13l-1.5-7M7 13h10M10 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                    </svg>
                    <!-- Contador -->
                    <span 
                      id="cart-count"
                      class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      0
                    </span>
                </div>
            </button>


              <!-- Menú Móvil -->
                <button id="menu-toggle-btn" data-collapse-toggle="navbar-search" type="button"
                  class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-all duration-300"
                  aria-controls="navbar-search" aria-expanded="false">
                  <span class="sr-only">Abrir menú</span>

                  <!-- Icono hamburguesa -->
                  <svg id="icon-open" class="w-6 h-6 block" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>

                  <!-- Icono X -->
                  <svg id="icon-close" class="w-6 h-6 hidden" fill="none" stroke="currentColor" stroke-width="2"
                    viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
            </div>

            <!-- Menú de navegación -->
            <div id="navbar-search" 
                class="hidden flex-col gap-4 px-4 py-4 w-full bg-white dark:bg-gray-900 shadow-md rounded-b-lg transition-all duration-300 transform origin-top -translate-y-10 opacity-0
            md:flex md:flex-row md:items-center md:justify-start md:gap-8 md:w-auto md:bg-transparent md:shadow-none md:translate-y-0 md:opacity-100">
              <ul class="flex flex-col md:flex-row font-medium p-4 md:p-0 text-center md:text-left w-full md:w-auto">
                <li><a href="#" class="block py-2 px-3 text-gray-900 dark:text-white hover:text-blue-600">Inicio</a></li>
                <li><a href="#" class="block py-2 px-3 text-gray-900 dark:text-white hover:text-blue-600">Nosotros</a></li>
                <li>
                  <select id="categoria-select"
                    class="block w-full py-2 px-3 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 cursor-pointer">
                    <option disabled selected>Elige categoría</option>
                    <option value="todo">Ver todo</option>
                    <option value="hombre">Ropa Hombre</option>
                    <option value="mujer">Ropa Mujer</option>
                    <option value="tenis">Tenis</option>
                  </select>
                </li>
              </ul>
            </div>
        </div>
    </nav>

`;


export function renderNav(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (container) {
      container.innerHTML = navTemplate;
      // observarEstadoAuth(); // Activar estado auth en navbar
    } else {
      console.warn(`No se encontró el contenedor: ${containerSelector}`);
    }

    const overlay = document.createElement('div');
    overlay.id = 'menu-overlay';
    overlay.className = 'fixed inset-0 bg-black opacity-50 bg-opacity-50 z-2 hidden md:hidden';
    document.body.appendChild(overlay);

    // Evento para menú móvil
    const toggleBtn = document.getElementById('menu-toggle-btn');
    const menu = document.getElementById('navbar-search');
    const menuLinks = menu.querySelectorAll('a');
    const selectMenu = document.getElementById('categoria-select');
    const iconOpen = document.getElementById('icon-open');
    const iconClose = document.getElementById('icon-close');

    onAuthStateChanged(auth, (user) => {
      const loginBtn = document.getElementById("login-btn");
      const logoutBtn = document.getElementById("logout-btn");
      const userInfo = document.getElementById("user-info");
      const userPhoto = document.getElementById("user-photo");
      const userName = document.getElementById("user-name");

      if (user) {
        // Ocultar botón de login
        loginBtn?.classList.add("hidden");

        // Mostrar info de usuario
        userInfo?.classList.remove("hidden");
        userPhoto.src = user.photoURL || "https://via.placeholder.com/40";

        //Obtener solo el primer nombre
        const FirstName = user.displayName?.split(" ")[0] || "usuario"
        userName.textContent = `Hola, ${FirstName}`;
      } else {
      // Mostrar botón de login
      loginBtn?.classList.remove("hidden");

      // Ocultar info de usuario
      userInfo?.classList.add("hidden");
      }

      // Logout
      logoutBtn?.addEventListener("click", async () => {
        try {
          await signOut(auth);
        } catch (error) {
          console.error("Error al cerrar sesión:", error);
        }
      });

      // Login
      loginBtn?.addEventListener("click", () => {
        window.location.href = "./login.html"; // Redirige a tu página de login
      });
  });
    

    const openMenu = () => {
      menu.classList.remove('hidden');
      requestAnimationFrame(() => {
        menu.classList.add('translate-y-0', 'opacity-100');
        menu.classList.remove('-translate-y-10', 'opacity-0');
      });
  
      overlay.classList.remove('hidden');
      iconOpen?.classList.add('hidden');
      iconClose?.classList.remove('hidden');
    };
    
    const closeMenu = () => {
      menu.classList.remove('translate-y-0', 'opacity-100');
      menu.classList.add('-translate-y-10', 'opacity-0');
    
      setTimeout(() => {
        menu.classList.add('hidden');
      }, 300);
  
      overlay.classList.add('hidden');
      iconOpen?.classList.remove('hidden');
      iconClose?.classList.add('hidden');
    };

    // Botón hamburguesa
    toggleBtn?.addEventListener('click', () => {
      if (!isMobile()) return; // Solo abrir/cerrar en móvil

      if (menu.classList.contains('hidden')) {
        openMenu();
      } else {
        closeMenu();
      }
    });

    // Cerrar al hacer click en enlaces
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (isMobile()) closeMenu();
      });
    });

    selectMenu?.addEventListener('change', () => {
      if (isMobile()) closeMenu();
    });

    overlay?.addEventListener('click', () => {
      if (isMobile()) closeMenu();
    });

    window.addEventListener('resize', () => {
      if (!isMobile()) {
        // Forzamos cerrar si cambia a escritorio
        menu.classList.remove('hidden', 'opacity-0', '-translate-y-10');
        menu.classList.add('translate-y-0', 'opacity-100');
        overlay.classList.add('hidden');
      }
    });

    function isMobile() {
        return window.innerWidth < 768;
    }
}