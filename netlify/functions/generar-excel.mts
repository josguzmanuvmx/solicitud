// Importar tipos y librerías
import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

// Crear el cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// La función handler de Netlify
export const handler: Handler = async (event: HandlerEvent) => {
  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ error: "No body provided" }) };
  }

  try {
    // --- 1. Descargar la plantilla .xlsx desde Supabase ---
    const { data: fileBlob, error: downloadError } = await supabase
      .storage
      .from('plantillas') // El nombre de tu bucket
      .download('usiiu-sf-f-02.xlsx'); // El nombre de tu archivo Excel

    if (downloadError) throw downloadError;

    const templateBuffer = Buffer.from(await fileBlob.arrayBuffer());

    // --- 2. Cargar y rellenar la plantilla con SheetJS ---
    const workbook = XLSX.read(templateBuffer);
    const sheetName = workbook.SheetNames[0]; // Obtener el nombre de la primera hoja
    const worksheet = workbook.Sheets[sheetName];
    const datos = JSON.parse(event.body);

    // Iterar sobre todas las celdas de la hoja para buscar y reemplazar
    for (const cellAddress in worksheet) {
      // Filtrar propiedades internas de la hoja que empiezan con '!'
      if (cellAddress[0] === '!') continue;

      const cell = worksheet[cellAddress];
      // Asegurarse de que la celda tenga un valor de tipo string
      if (cell.v && typeof cell.v === 'string') {
        let cellValue = cell.v;
        // Buscar todos los placeholders en el valor de la celda
        const placeholders = cellValue.match(/{{(.*?)}}/g);
        if (placeholders) {
          placeholders.forEach((placeholder: string) => {
            const key = placeholder.replace(/{{|}}/g, '');
            if (datos[key] !== undefined) {
              cellValue = cellValue.replace(placeholder, datos[key]);
            }
          });
          // Actualizar el valor de la celda
          worksheet[cellAddress].v = cellValue;
        }
      }
    }

    // --- 3. Generar el nuevo archivo Excel en memoria ---
    const newFileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // --- 4. Enviar el documento rellenado ---
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="solicitud-rellenada.xlsx"'
      },
      body: newFileBuffer.toString('base64'),
      isBase64Encoded: true,
    };

  } catch (error: any) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};