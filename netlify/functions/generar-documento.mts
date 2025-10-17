// Importar tipos y librerías
import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import expressionParser from 'docxtemplater/expressions.js';

// 1. Crear el cliente de Supabase (usando las variables de entorno)
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// La función handler de Netlify
export const handler: Handler = async (event: HandlerEvent) => {
  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ error: "No body provided" }) };
  }

  try {
    // --- 2. Descargar la plantilla desde Supabase Storage ---
    const { data: fileBlob, error: downloadError } = await supabase
      .storage
      .from('plantillas') // El nombre de tu bucket
      .download('usiiu-sf-f-01.docx'); // El nombre de tu archivo

    if (downloadError) {
      throw downloadError;
    }

    // Convertir el Blob descargado a un Buffer que PizZip pueda leer
    const content = Buffer.from(await fileBlob.arrayBuffer());

    // Cargar la plantilla
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      parser: expressionParser,
    });

    // --- 3. Recibir y usar los datos del formulario ---
    const datos = JSON.parse(event.body);

    // Opcional: Guardar los datos en la base de datos de Supabase
    // const { error: insertError } = await supabase.from('solicitudes').insert([datos]);
    // if (insertError) throw insertError;
    
    doc.setData(datos);
    doc.render();

    // Generar el buffer del documento final
    const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });

    // --- 4. Enviar el documento rellenado ---
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="solicitud-rellenada.docx"'
      },
      body: buf.toString('base64'),
      isBase64Encoded: true,
    };

  } catch (error: any) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};