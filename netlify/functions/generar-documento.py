import json
import io
import base64
import os  # <-- Importa 'os'
from docxtpl import DocxTemplate

def handler(event, context):
    try:
        # --- INICIO DEL CAMBIO ---
        # Obtiene el directorio donde se está ejecutando el script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        # Crea la ruta completa a la plantilla
        template_path = os.path.join(script_dir, "usiiu-sf-f-01.docx")

        # Carga la plantilla desde la nueva ruta
        doc = DocxTemplate(template_path)
        # --- FIN DEL CAMBIO ---

        # 2. Recibir los datos... (el resto del código es igual)
        datos = json.loads(event['body'])
        context = datos

        # 3. Renderizar...
        doc.render(context)

        # ... (el resto del código es igual) ...

        output_stream = io.BytesIO()
        doc.save(output_stream)
        output_stream.seek(0)

        file_content = output_stream.read()
        encoded_body = base64.b64encode(file_content).decode('utf-8')

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': 'attachment; filename="solicitud-rellenada.docx"'
            },
            'body': encoded_body,
            'isBase64Encoded': True
        }

    except Exception as e:
        # Imprime el error en el log de Netlify para depurar
        print(f"ERROR: {e}") 
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }