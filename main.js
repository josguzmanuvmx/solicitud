// 1. Seleccionar los elementos del DOM
const textArea = document.getElementById('especificaciones');
const contador = document.getElementById('contador');

// 2. Obtener el límite máximo de caracteres del atributo del textarea
const maxLength = textArea.getAttribute('maxlength');

// 3. Añadir un "escuchador de eventos" que se active con cada tecla presionada
textArea.addEventListener('input', () => {
    const caracteresEscritos = textArea.value.length;
    const caracteresRestantes = maxLength - caracteresEscritos;

    // 4. Actualizar el texto del contador
    contador.textContent = `${caracteresRestantes}/${maxLength}`;
});

/**
 * Actualiza el ícono del tema basado en el estado ACTUAL del HTML.
 * Muestra 'fa-sun' (sol) si el tema es 'dark'.
 * Muestra 'fa-moon' (luna) si el tema es 'light'.
 */
function updateToggleIcon() {
    const htmlElement = document.documentElement;
    const icon = document.querySelector('#theme-toggle i');

    // Salir si el ícono no existe
    if (!icon) return;

    // 1. Comprueba si el tema actual es 'dark'
    const isDark = htmlElement.getAttribute('data-bs-theme') === 'dark';

    // 2. Usa toggle con "fuerza"
    // Añade 'fa-sun' SI isDark es true, de lo contrario la quita.
    icon.classList.toggle('fa-sun', isDark);
    
    // Añade 'fa-moon' SI isDark es false (o sea, !isDark es true), de lo contrario la quita.
    icon.classList.toggle('fa-moon', !isDark);
}

/**
 * Cambia el tema de light a dark, o viceversa.
 */
function toggleDarkMode() {
    const htmlElement = document.documentElement;
    const isDark = htmlElement.getAttribute('data-bs-theme') === 'dark';

    // Determina el *nuevo* tema
    const newTheme = isDark ? 'light' : 'dark';

    // 1. Aplica el nuevo tema al localStorage
    localStorage.setItem('theme', newTheme);

    // 2. Aplica el nuevo tema al HTML
    if (newTheme === 'dark') {
        htmlElement.setAttribute('data-bs-theme', 'dark');
    } else {
        // Es importante usar removeAttribute para que Bootstrap 
        // vuelva al modo 'light' por defecto.
        htmlElement.removeAttribute('data-bs-theme');
    }

    // 3. Llama a la función que actualiza el ícono
    // Esta es la optimización clave: no repetimos código.
    updateToggleIcon();
}

/**
 * Aplica el tema guardado en localStorage al cargar la página.
 */
function applyInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    // Opcional: puedes checar las preferencias del sistema si no hay nada guardado
    // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    // Versión simple (solo basado en localStorage):
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
    }
    // No es necesario un 'else', ya que 'light' es la ausencia del atributo.
    
    // Asegúrate de que el ícono sea correcto desde el inicio
    updateToggleIcon();
}

// Llama a esta función cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', applyInitialTheme);

const forms = document.querySelectorAll('.needs-validation')

// Loop over them and prevent submission
Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
        }

        form.classList.add('was-validated')
    }, false)
})

function obtenerDatosFormulario() {
    return {
        // Fecha (se genera automáticamente)
        d: new Date().getDate(),
        m: new Date().getMonth() + 1, // +1 porque los meses son 0-11
        a: new Date().getFullYear(),

        // Datos del Usuario
        nombreEmpleado: document.getElementById('nombre-empleado').value,
        noPersonal: document.getElementById('numero-personal').value,
        correoInst: document.getElementById('correo-institucional').value,
        uRC: document.getElementById('unidad-responsable-clave').value,
        uRN: document.getElementById('unidad-responsable-nombre').value,
        rC: document.getElementById('region-clave').value,
        rN: document.getElementById('region-nombre').value,
        puestoEmpleado: document.getElementById('puesto-empleado').value,

        // Tipo de Permiso (Radio Buttons)
        // Busca el radio 'checked' dentro del grupo 'permisos' y obtiene su 'id'
        tipoPermiso: document.querySelector('input[name="permisos"]:checked').id,
        
        // Grupos (Botones Checkbox)
        // .checked devuelve 'true' o 'false'
        director: document.getElementById('check-director').checked,
        dirGen: document.getElementById('check-director-general').checked,
        admin: document.getElementById('check-admin').checked,
        auxAdmin: document.getElementById('check-aux-admin').checked,
        resProy: document.getElementById('check-res-proy').checked,
        resCB: document.getElementById('check-res-cb').checked,
        estudi: document.getElementById('check-estudiantes').checked,
        eveIng: document.getElementById('check-eventos').checked,
        super: document.getElementById('check-supervisor').checked,
        cajeros: document.getElementById('check-cajeros').checked,
        revisor: document.getElementById('check-revisor').checked,
        otroGrupo: document.getElementById('check-otro').checked,
        urAdic: document.getElementById('check-ur-adicional').checked,
        permEsp: document.getElementById('check-permiso-esp').checked,
        asigPerm: document.getElementById('check-permiso-similar').checked,

        // Especificaciones es un textarea
        especificaciones: document.getElementById('especificaciones').value,
    };
}

// Espera a que todo el contenido HTML se cargue antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    // 1. Busca el formulario por su ID
    const form = document.getElementById('form-solicitud');

    // 2. Agrega un "escuchador" para el evento 'submit'
    form.addEventListener('submit', async (event) => {
        
        // 3. Previene que el formulario se envíe de la forma tradicional (recargando la página)
        event.preventDefault();

        // (Opcional) Muestra un 'spinner' o deshabilita el botón de envío aquí
        // ej: event.submitter.disabled = true;

        console.log("Formulario enviado. Recopilando datos...");

        // 4. Recopila todos los datos del formulario
        // Asegúrate de que los IDs aquí coincidan EXACTAMENTE con los de tu HTML
        const datos = obtenerDatosFormulario();

        console.log("Datos a enviar:", datos);

        try {
            const response = await fetch('/.netlify/functions/generar-documento', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Convierte el objeto JavaScript a un string JSON
                body: JSON.stringify(datos) 
            });

            if (!response.ok) {
                // Si el servidor (función) da un error, lo captura aquí
                throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
            }

            // 6. Recibe el archivo .docx como un 'blob' (un archivo binario)
            const blob = await response.blob();

            // 7. Crea un link de descarga en memoria
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'solicitud-completada.docx'; // Nombre del archivo que se descargará

            // 8. Simula un clic en el link para iniciar la descarga
            document.body.appendChild(a);
            a.click();

            // 9. Limpia la URL del 'blob' de la memoria
            window.URL.revokeObjectURL(url);
            a.remove();

            console.log("¡Documento generado y descargado!");
            
            // (Opcional) Limpia el formulario o muestra un mensaje de éxito
            // form.reset();
            // alert('Solicitud generada con éxito.');

        } catch (error) {
            // 10. Maneja cualquier error de red o del servidor
            console.error('Error al generar el documento:', error);
            alert('Error: No se pudo generar el documento. Revisa la consola para más detalles.');
        } finally {
            // (Opcional) Vuelve a habilitar el botón de envío
            // ej: event.submitter.disabled = false;
        }
    });
});

async function descargarWord(datos) {
    // 5. Envía los datos a la Netlify Function
    try {
        const response = await fetch('/.netlify/functions/generar-documento', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Convierte el objeto JavaScript a un string JSON
            body: JSON.stringify(datos) 
        });

        if (!response.ok) {
            // Si el servidor (función) da un error, lo captura aquí
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }

        // 6. Recibe el archivo .docx como un 'blob' (un archivo binario)
        const blob = await response.blob();

        // 7. Crea un link de descarga en memoria
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'solicitud-completada.docx'; // Nombre del archivo que se descargará

        // 8. Simula un clic en el link para iniciar la descarga
        document.body.appendChild(a);
        a.click();

        // 9. Limpia la URL del 'blob' de la memoria
        window.URL.revokeObjectURL(url);
        a.remove();

        console.log("¡Documento generado y descargado!");
        
        // (Opcional) Limpia el formulario o muestra un mensaje de éxito
        // form.reset();
        // alert('Solicitud generada con éxito.');

    } catch (error) {
        // 10. Maneja cualquier error de red o del servidor
        console.error('Error al generar el documento:', error);
        alert('Error: No se pudo generar el documento. Revisa la consola para más detalles.');
    } finally {
        // (Opcional) Vuelve a habilitar el botón de envío
        // ej: event.submitter.disabled = false;
    }
}

async function descargarPDF(datos) {
    // 5. Envía los datos a la Netlify Function
    try {
        const response = await fetch('/.netlify/functions/generar-documento', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Convierte el objeto JavaScript a un string JSON
            body: JSON.stringify(datos) 
        });

        if (!response.ok) {
            // Si el servidor (función) da un error, lo captura aquí
            throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }

        // 6. Recibe el archivo .docx como un 'blob' (un archivo binario)
        const blob = await response.blob();

        // 7. Crea un link de descarga en memoria
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'solicitud-completada.docx'; // Nombre del archivo que se descargará

        // 8. Simula un clic en el link para iniciar la descarga
        document.body.appendChild(a);
        a.click();

        // 9. Limpia la URL del 'blob' de la memoria
        window.URL.revokeObjectURL(url);
        a.remove();

        console.log("¡Documento generado y descargado!");
        
        // (Opcional) Limpia el formulario o muestra un mensaje de éxito
        // form.reset();
        // alert('Solicitud generada con éxito.');

    } catch (error) {
        // 10. Maneja cualquier error de red o del servidor
        console.error('Error al generar el documento:', error);
        alert('Error: No se pudo generar el documento. Revisa la consola para más detalles.');
    } finally {
        // (Opcional) Vuelve a habilitar el botón de envío
        // ej: event.submitter.disabled = false;
    }
}