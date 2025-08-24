import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { app } from "../utils/firebaseConfig.js";

// UID del administrador
const ADMIN_UID = "b2ofpkg90oZZVkpdhLe4Om2IvQC3";

export function observarEstadoAuth() {
  const auth = getAuth(app);

  onAuthStateChanged(auth, user => {
    const logoutBtn = document.getElementById("logout-btn");
    const loginBtn = document.getElementById("login-btn");
    const saludo = document.getElementById("user-greeting");
    const tiendaBtn = document.getElementById("btnTienda");

    if (user) {
      // Mostrar saludo
      if (saludo) {
        saludo.textContent = `Hola, ${user.displayName || "Usuario"}`;
        saludo.classList.remove("hidden");
      }

      // Mostrar botón de logout
      logoutBtn?.classList.remove("hidden");
      loginBtn?.classList.add("hidden");

      // Redirigir si es admin
      const isAdmin = user.uid === ADMIN_UID;

      if (isAdmin && tiendaBtn) {
      // Mostrar botón de tienda
        if (tiendaBtn.classList.contains('hidden')) {
          tiendaBtn.classList.remove("hidden");
        
          // Evento para redirigir a tienda
          tiendaBtn.addEventListener("click", () => {
            window.open("/index.html", "_blank");
          });
        }
      }

      // Logout handler
      logoutBtn?.addEventListener("click", () => {
        signOut(auth).then(() => {
          window.location.reload();
        });
      });

    } else {
      saludo?.classList.add("hidden");
      logoutBtn?.classList.add("hidden");
      loginBtn?.classList.remove("hidden");
    }
  });
}
