export function descargarPlantillaExcel() {
  // Crear libro de trabajo
  const wb = XLSX.utils.book_new();
  
  // Datos de la plantilla - más organizados y con información clara
  const datos = [
    ["Nombre*", "Precio*", "Imagen*", "Talla*", "Stock*", "Género*", "Descripción"],
    ["Camiseta Básica Azul", 49900, "https://ejemplo.com/camisetazul.jpg", "M", 25, "hombre", "Camiseta de algodón 100% de alta calidad"],
    ["Pantalón Jeans Clásico", 89900, "https://ejemplo.com/jeans.jpg", "32", 15, "hombre", "Jeans ajustados color azul oscuro"],
    ["Vestido Floral Verano", 75900, "https://ejemplo.com/vestido.jpg", "S", 18, "mujer", "Vestido ligero con estampado floral"],
    ["Zapatillas Deportivas", 120000, "https://ejemplo.com/zapatillas.jpg", "40", 10, "tenis", "Zapatillas para running con amortiguación"],
    [""], // línea en blanco
    ["PLANTILLA DE IMPORTACIÓN DE PRODUCTOS - FERNASHOP"],
    [""], // línea en blanco
    ["NOTA: Esta plantilla funciona mejor en Microsoft Excel. En Google Sheets,", "los colores y formatos pueden no verse correctamente."],
    ["Para importar, guarde como CSV (UTF-8) después de completar los datos."]
    [""], // línea en blanco
    ["INSTRUCCIONES:"],
    ["1. Complete los datos de los productos en la tabla inferior"],
    ["2. No modifique los encabezados de la tabla"],
    ["3. Los campos marcados con * son obligatorios"],
    ["4. Use solo números para Precio y Stock (sin símbolos)"],
    ["5. Para Género, use: hombre, mujer o tenis"],
    ["6. Guarde el archivo como CSV o Excel para importar"],
    [""], // línea en blanco
  ];

  // Crear hoja de cálculo
  const ws = XLSX.utils.aoa_to_sheet(datos);
  
  // Ajustar anchos de columnas
  ws['!cols'] = [
    { wch: 25 }, // Nombre
    { wch: 12 }, // Precio
    { wch: 40 }, // Imagen
    { wch: 8 },  // Talla
    { wch: 8 },  // Stock
    { wch: 10 }, // Género
    { wch: 35 }  // Descripción
  ];
  
  // Añadir hoja al libro
  XLSX.utils.book_append_sheet(wb, ws, "Productos");
  
  // Crear segunda hoja con formato CSV listo para copiar y pegar
  const csvData = [
    ["PARA USAR EN GOOGLE SHEETS O EDITORES DE TEXTO:"],
    [""],
    ["Copie y pegue los siguientes datos en un archivo CSV:"],
    [""],
    ["Nombre,Precio,Imagen,Talla,Stock,Género,Descripción"],
    ["Camiseta Básica Azul,49900,https://ejemplo.com/camisetazul.jpg,M,25,hombre,Camiseta de algodón 100% de alta calidad"],
    ["Pantalón Jeans Clásico,89900,https://ejemplo.com/jeans.jpg,32,15,hombre,Jeans ajustados color azul oscuro"],
    ["Vestido Floral Verano,75900,https://ejemplo.com/vestido.jpg,S,18,mujer,Vestido ligero con estampado floral"],
    ["Zapatillas Deportivas,120000,https://ejemplo.com/zapatillas.jpg,40,10,tenis,Zapatillas para running con amortiguación"],
    [""],
    ["Instrucciones para CSV:"],
    ["1. Abra un editor de texto simple (Bloc de notas, TextEdit, etc.)"],
    ["2. Pegue el contenido anterior"],
    ["3. Guarde el archivo con extensión .csv"],
    ["4. En el administrador, use este archivo para importar"]
  ];
  
  const wsCSV = XLSX.utils.aoa_to_sheet(csvData);
  XLSX.utils.book_append_sheet(wb, wsCSV, "Formato CSV");
  
  // Exportar como .xlsx
  XLSX.writeFile(wb, "Plantilla_Productos_FernaShop.xlsx");
  
  // Mostrar mensaje con instrucciones adicionales
  Swal.fire({
    title: 'Plantilla descargada',
    html: `
      <div class="text-left">
        <p class="mb-2">✅ <strong>Plantilla descargada correctamente</strong></p>
        <p class="mb-1">📝 <strong>Recomendaciones:</strong></p>
        <ul class="list-disc pl-5">
          <li>Use Microsoft Excel para ver los formatos y colores</li>
          <li>Para Google Sheets, utilice la pestaña "Formato CSV"</li>
          <li>Guarde como CSV (UTF-8) antes de importar</li>
          <li>Elimine las filas de ejemplo y las instrucciónes antes de importar</li>
        </ul>
      </div>
    `,
    icon: 'success',
    confirmButtonText: 'Entendido'
  });
}