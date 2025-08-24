export function descargarPlantillaExcel() {
  // Encabezados
  const encabezados = [
    ["Nombre", "Precio", "Imagen", "Talla", "Stock", "Género", "Descripción"]
  ];

  // Ejemplo de fila (para que el usuario entienda el formato)
  const ejemplo = [
    ["Camiseta Azul", 50000, "https://urlimagen.com/camiseta.jpg", "M", 20, "hombre", "Bonita camiseta de algodón"]
  ];

  // Combinar encabezados + ejemplo
  const datos = [...encabezados, ...ejemplo];

  // Crear hoja de Excel
  const ws = XLSX.utils.aoa_to_sheet(datos);

  // Ajustar ancho de columnas
  ws['!cols'] = [
    { wch: 20 }, // Nombre
    { wch: 10 }, // Precio
    { wch: 40 }, // Imagen
    { wch: 8 },  // Talla
    { wch: 8 },  // Stock
    { wch: 12 }, // Género
    { wch: 40 }  // Descripción
  ];

  // Crear libro y añadir hoja
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Productos");

  // Exportar como .xlsx
  XLSX.writeFile(wb, "plantilla_productos.xlsx");
}
