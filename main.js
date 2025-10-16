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
