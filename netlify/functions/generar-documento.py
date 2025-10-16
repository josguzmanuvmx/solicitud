import json
import io
import base64  # Necesario para devolver archivos
from docxtpl import DocxTemplate

# El nombre de la función DEBE ser 'handler'
def handler(event, context):
    try:
        # 1. Cargar la plantilla .docx
        # Netlify necesita la ruta completa desde la raíz de la función
        doc = DocxTemplate("usiiu-sf-f-01.docx")

        # 2. Recibir los datos del formulario JS
        # Los datos vienen en el 'body' del evento
        datos = json.loads(event['body'])
        context = datos

        # 3. Renderizar el documento
        doc.render(context)

        # 4. Guardar en memoria
        output_stream = io.BytesIO()
        doc.save(output_stream)
        output_stream.seek(0)
        
        # 5. Codificar el archivo en Base64 para la respuesta
        file_content = output_stream.read()
        encoded_body = base64.b64encode(file_content).decode('utf-8')

        # 6. Enviar la respuesta
        return {
            'statusCode': 200,
            'headers': {
                # El mimetype del .docx
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                # Esto le dice al navegador que lo descargue
                'Content-Disposition': 'attachment; filename="solicitud-rellenada.docx"'
            },
            'body': encoded_body,
            'isBase64Encoded': True  # ¡Muy importante!
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }