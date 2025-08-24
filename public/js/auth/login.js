import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { app } from "../utils/firebaseConfig.js";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// UID del administrador autorizado
const adminUID = "b2ofpkg90oZZVkpdhLe4Om2IvQC3";
const btnGoogle = document.getElementById("btn-login-google");
const spinner = document.getElementById("spinner");

/* 
document.getElementById("btn-login-google").addEventListener("click", async () => {
   try {
     const result = await signInWithPopup(auth, provider);
     const user = result.user
     // Redirigir según el rol
     if (user.uid === adminUID) {
       window.location.href = "./admin.html";
     } else {
       window.location.href = "./index.html";
     }
   } catch (error) {
     console.error("Error al iniciar sesión:", error);
     alert("Ocurrió un error durante el inicio de sesión.");
   }
 });
*/

//Botn de google
btnGoogle.addEventListener("click", async () => {
  spinner.classList.remove("hidden");
  btnGoogle.disabled = true;

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (user.uid === adminUID) {
      window.location.href = "../admin.html";
    } else {
      window.location.href = "./index.html";
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Ocurrió un error durante el inicio de sesión.");
    spinnerOverlay.classList.add("hidden");
    btnGoogle.disabled = false;
  }
});
