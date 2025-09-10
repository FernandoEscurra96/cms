// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⚠️ Desactivar CSP para evitar errores de inline scripts
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// === Directorio de datos ===
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// --- Hero dinámico ---
const HERO_FILE = path.join(DATA_DIR, 'hero.json');
if (!fs.existsSync(HERO_FILE)) {
  fs.writeFileSync(HERO_FILE, JSON.stringify({
    warningAlert: "⚠️ ALERTA: Rotura = $2,500 diarios perdidos",
    title: "Resistencia en Cocina Profesional: Test Real de 5 Batidoras Industriales",
    subtitle: "(y los 2 Modelos que Mis Clientes Usan Sin Parar)"
  }, null, 2));
}

// Obtener hero
app.get('/api/hero', (req, res) => {
  const data = fs.readFileSync(HERO_FILE, 'utf8');
  res.json(JSON.parse(data));
});

// Actualizar hero
app.post('/api/hero', (req, res) => {
  const { warningAlert, title, subtitle } = req.body;
  if (!warningAlert || !title || !subtitle) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  const newHero = { warningAlert, title, subtitle };
  fs.writeFileSync(HERO_FILE, JSON.stringify(newHero, null, 2));
  res.json(newHero);
});

// --- Artículos ---
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
if (!fs.existsSync(ARTICLES_FILE)) fs.writeFileSync(ARTICLES_FILE, JSON.stringify([]));

// Obtener todos los artículos
app.get('/api/articles', (req, res) => {
  const data = fs.readFileSync(ARTICLES_FILE, 'utf8');
  res.json(JSON.parse(data));
});

// Crear nuevo artículo
app.post('/api/articles', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Faltan campos obligatorios' });

  const data = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
  const newArticle = { id: Date.now(), title, content, createdAt: new Date() };
  data.push(newArticle);
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(data, null, 2));
  res.status(201).json(newArticle);
});

// Eliminar artículo
app.delete('/api/articles/:id', (req, res) => {
  let data = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
  const id = parseInt(req.params.id);
  if (!data.some(a => a.id === id)) return res.status(404).json({ error: 'Artículo no encontrado' });

  data = data.filter(a => a.id !== id);
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(data, null, 2));
  res.json({ message: 'Artículo eliminado' });
});

// --- Panel de administración ---
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});




// Archivo JSON de intro
const INTRO_FILE = path.join(DATA_DIR, 'intro.json');
if (!fs.existsSync(INTRO_FILE)) {
  fs.writeFileSync(INTRO_FILE, JSON.stringify({
    title: "¿Por Qué las Batidoras Industriales Son Críticas en Cocina Profesional?",
    testimonials: [],
    highlight: ""
  }, null, 2));
}

// Obtener intro
app.get('/api/intro', (req, res) => {
  const data = fs.readFileSync(INTRO_FILE, 'utf8');
  res.json(JSON.parse(data));
});

// Actualizar intro
app.post('/api/intro', (req, res) => {
  const { title, testimonials, highlight } = req.body;
  if (!title || !testimonials || !highlight) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  const newIntro = { title, testimonials, highlight };
  fs.writeFileSync(INTRO_FILE, JSON.stringify(newIntro, null, 2));
  res.json(newIntro);
});


const HIGHLIGHT_INFO_FILE = path.join(DATA_DIR, 'highlight-info.json');

// Obtener highlight-info
app.get('/api/highlight-info', (req, res) => {
  if (!fs.existsSync(HIGHLIGHT_INFO_FILE)) {
    return res.json({ text: "" });
  }
  const data = fs.readFileSync(HIGHLIGHT_INFO_FILE, 'utf8');
  res.json(JSON.parse(data));
});

// Actualizar highlight-info
app.post('/api/highlight-info', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Falta el campo text" });
  }
  const newData = { text };
  fs.writeFileSync(HIGHLIGHT_INFO_FILE, JSON.stringify(newData, null, 2));
  res.json(newData);
});



//let HERO_FILE = path.join(DATA_DIR, 'hero.json');
//let INTRO_FILE = path.join(DATA_DIR, 'intro.json');
//let HIGHLIGHT_INFO_FILE = path.join(DATA_DIR, 'highlight-info.json');

// Obtener toda la config
app.get('/api/config', (req, res) => {
  try {
    const hero = fs.existsSync(HERO_FILE)
      ? JSON.parse(fs.readFileSync(HERO_FILE, 'utf8'))
      : {};
    const intro = fs.existsSync(INTRO_FILE)
      ? JSON.parse(fs.readFileSync(INTRO_FILE, 'utf8'))
      : {};
    const highlightInfo = fs.existsSync(HIGHLIGHT_INFO_FILE)
      ? JSON.parse(fs.readFileSync(HIGHLIGHT_INFO_FILE, 'utf8'))
      : {};

    res.json({ hero, intro, highlightInfo });
  } catch (err) {
    console.error("Error leyendo config:", err);
    res.status(500).json({ error: "No se pudo leer la configuración" });
  }
});

// Guardar toda la config
app.post('/api/config', (req, res) => {
  try {
    const { hero, intro, highlightInfo } = req.body;

    // Leer los archivos existentes primero
    const currentHero = fs.existsSync(HERO_FILE)
      ? JSON.parse(fs.readFileSync(HERO_FILE, 'utf8'))
      : {};
    const currentIntro = fs.existsSync(INTRO_FILE)
      ? JSON.parse(fs.readFileSync(INTRO_FILE, 'utf8'))
      : {};
    const currentHighlightInfo = fs.existsSync(HIGHLIGHT_INFO_FILE)
      ? JSON.parse(fs.readFileSync(HIGHLIGHT_INFO_FILE, 'utf8'))
      : {};

    // Solo sobrescribimos lo que venga en el body
    const newHero = hero || currentHero;
    const newIntro = intro || currentIntro;
    const newHighlightInfo = highlightInfo || currentHighlightInfo;

    // Guardar archivos
    fs.writeFileSync(HERO_FILE, JSON.stringify(newHero, null, 2));
    fs.writeFileSync(INTRO_FILE, JSON.stringify(newIntro, null, 2));
    fs.writeFileSync(HIGHLIGHT_INFO_FILE, JSON.stringify(newHighlightInfo, null, 2));

    res.json({ hero: newHero, intro: newIntro, highlightInfo: newHighlightInfo });
  } catch (err) {
    console.error("Error guardando config:", err);
    res.status(500).json({ error: "No se pudo guardar la configuración" });
  }
});