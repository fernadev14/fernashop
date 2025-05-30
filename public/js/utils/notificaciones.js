/**
 * Muestrar una notificación tipo toast
 * @param {string} mensaje - Texto a mostrar
 * @param {'success' | 'error' | 'info' | 'warning'} tipo - Tipo de mensaje
*/


// Mostrar toast único con ícono y cerrar
export function mostrarToast(mensaje, tipo = 'success') {
  const toast = document.createElement('div');

  const colores = {
    success: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800',
  };

  const iconos = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  toast.className = `
    relative flex items-center gap-3 border-l-4 p-4 pr-10 rounded shadow-lg animate-slide-in-right transition-opacity duration-300
    ${colores[tipo] || colores.info}
  `;

  toast.innerHTML = `
    <span class="text-xl">${iconos[tipo] || 'ℹ️'}</span>
    <div class="text-sm font-medium">${mensaje}</div>
    <button class="absolute top-1 right-1 text-lg px-2 text-gray-600 hover:text-black focus:outline-none" aria-label="Cerrar">&times;</button>
  `;

  const container = document.getElementById('toast-container');
  if (!container) return;
  container.appendChild(toast);

  // Cerrar manual
  toast.querySelector('button').addEventListener('click', () => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  });

  // Auto cierre
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

// Animación del ícono del carrito
export function animarIconoCarrito() {
  const icono = document.getElementById('cart-icon');
  if (!icono) return;

  icono.classList.add('animate-bounce');
  setTimeout(() => icono.classList.remove('animate-bounce'), 1000);
}