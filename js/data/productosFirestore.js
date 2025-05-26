import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { app } from "../utils/firebaseConfig.js";

const db = getFirestore(app);

export async function obtenerProductosFirestore() {
  const productosCol = collection(db, 'productos');
  const productosSnap = await getDocs(productosCol);
  const productos = productosSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // console.log(productos)
  return productos;
}