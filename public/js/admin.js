// admin.js - Editor CMS con JSON directo

async function loadJson(endpoint, textareaId) {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    const data = await res.json();
    document.getElementById(textareaId).value = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error(`Error cargando ${endpoint}`, err);
    alert(`No se pudo cargar ${endpoint}: ${err.message}`);
  }
}

async function saveJson(endpoint, textareaId) {
  try {
    const content = document.getElementById(textareaId).value;
    const parsed = JSON.parse(content); // valida que sea JSON válido
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed, null, 2)
    });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    alert(`Guardado en ${endpoint}`);
  } catch (err) {
    console.error(`Error guardando en ${endpoint}`, err);
    alert(`Error al guardar: ${err.message}`);
  }
}

// --- Inicialización al cargar la página ---

document.addEventListener('DOMContentLoaded', () => {
  // Cargar JSON inicial de cada sección
  loadJson('/api/hero', 'hero-json');
  loadJson('/api/intro', 'intro-json');
  loadJson('/api/highlight-info', 'highlight-info-json');

  // Botones de guardar
  document.getElementById('save-hero')
    .addEventListener('click', () => saveJson('/api/hero', 'hero-json'));

  document.getElementById('save-intro')
    .addEventListener('click', () => saveJson('/api/intro', 'intro-json'));

  document.getElementById('save-highlight-info')
    .addEventListener('click', () => saveJson('/api/highlight-info', 'highlight-info-json'));
});


loadJson('/api/config', 'config-json');
document.getElementById('save-config')
  .addEventListener('click', () => saveJson('/api/config', 'config-json'));