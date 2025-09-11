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


//obtener todo el full html
app.get('/api/full-html', (req, res) => {
  try {
    // Leer los JSONs configurables
    const hero = fs.existsSync(HERO_FILE) ? JSON.parse(fs.readFileSync(HERO_FILE, 'utf8')) : {};
    const intro = fs.existsSync(INTRO_FILE) ? JSON.parse(fs.readFileSync(INTRO_FILE, 'utf8')) : {};
    const highlightInfo = fs.existsSync(HIGHLIGHT_INFO_FILE) ? JSON.parse(fs.readFileSync(HIGHLIGHT_INFO_FILE, 'utf8')) : {};

    // Leer el template HTML original
    const htmlTemplate = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

    // Reemplazar las secciones del HTML con los JSONs
    let htmlFinal = htmlTemplate;

    // Hero
    htmlFinal = htmlFinal.replace(
      /<div class="hero-content fade-in-up">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/,
      `
      <div class="hero-content fade-in-up">
        <div class="warning-alert">${hero.alert || ''}</div>
        <h1>${hero.title || ''}</h1>
        <p class="hero-subtitle">${hero.subtitle || ''}</p>
      </div>
    </div>
    </section>
      `
    );

    // Intro (testimonials)
    const testimonialsHtml = (intro.testimonials || []).map(t => `
      <div class="testimonial">
        <div class="testimonial-text">${t.text}</div>
        <div class="testimonial-author">${t.author}</div>
        <div class="testimonial-role">${t.role}</div>
        <div class="testimonial-metric">${t.metric}</div>
      </div>
    `).join('\n');

    htmlFinal = htmlFinal.replace(
      /<section id="intro" class="section[\s\S]*?<\/section>/,
      `
      <section id="intro" class="section visible">
        <h2>${intro.title || ''}</h2>
        <div class="testimonials">
          ${testimonialsHtml}
        </div>
      </section>
      `
    );

    // Highlight-info
    htmlFinal = htmlFinal.replace(
      /<div class="highlight highlight-info">[\s\S]*?<\/div>/,
      `<div class="highlight highlight-info">${highlightInfo.text || ''}</div>`
    );

    // Retornar HTML completo
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlFinal);
  } catch (err) {
    console.error("Error generando HTML completo:", err);
    res.status(500).send("Error generando HTML completo");
  }
});


app.get('/api/html-for-wordpress', (req, res) => {
  try {
    // Leer los JSONs configurables
    const hero = fs.existsSync(HERO_FILE) ? JSON.parse(fs.readFileSync(HERO_FILE, 'utf8')) : {};
    const intro = fs.existsSync(INTRO_FILE) ? JSON.parse(fs.readFileSync(INTRO_FILE, 'utf8')) : {};
    const highlightInfo = fs.existsSync(HIGHLIGHT_INFO_FILE) ? JSON.parse(fs.readFileSync(HIGHLIGHT_INFO_FILE, 'utf8')) : {};

    // Leer el template HTML original
    const htmlTemplate = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

    // Inyectar JSONs dentro del HTML
    let htmlFinal = htmlTemplate;

    // Hero
    htmlFinal = htmlFinal.replace(
      /<div class="hero-content fade-in-up">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/,
      `
      <div class="hero-content fade-in-up">
        <div class="warning-alert">${hero.alert || ''}</div>
        <h1>${hero.title || ''}</h1>
        <p class="hero-subtitle">${hero.subtitle || ''}</p>
      </div>
    </div>
    </section>
      `
    );

    // Intro (testimonials)
    const testimonialsHtml = (intro.testimonials || []).map(t => `
      <div class="testimonial">
        <div class="testimonial-text">${t.text}</div>
        <div class="testimonial-author">${t.author}</div>
        <div class="testimonial-role">${t.role}</div>
        <div class="testimonial-metric">${t.metric}</div>
      </div>
    `).join('\n');

    htmlFinal = htmlFinal.replace(
      /<section id="intro" class="section[\s\S]*?<\/section>/,
      `
      <section id="intro" class="section visible">
        <h2>${intro.title || ''}</h2>
        <div class="testimonials">
          ${testimonialsHtml}
        </div>
      </section>
      `
    );

    // Highlight-info
    htmlFinal = htmlFinal.replace(
      /<div class="highlight highlight-info">[\s\S]*?<\/div>/,
      `<div class="highlight highlight-info">${highlightInfo.text || ''}</div>`
    );

    // Retornar JSON con HTML
    res.json({
      html: htmlFinal
    });
  } catch (err) {
    console.error("Error generando HTML para WordPress:", err);
    res.status(500).json({ error: "No se pudo generar el HTML para WordPress" });
  }
});



app.get('/api/html-for-post-inline', (req, res) => {
  try {
    // Leer los JSONs configurables
    const hero = fs.existsSync(HERO_FILE) ? JSON.parse(fs.readFileSync(HERO_FILE, 'utf8')) : {};
    const intro = fs.existsSync(INTRO_FILE) ? JSON.parse(fs.readFileSync(INTRO_FILE, 'utf8')) : {};
    const highlightInfo = fs.existsSync(HIGHLIGHT_INFO_FILE) ? JSON.parse(fs.readFileSync(HIGHLIGHT_INFO_FILE, 'utf8')) : {};

    // Bloque HTML completo con CSS inline
    const blockHtml = `
      <style>
        .cms-block { font-family: 'Inter', sans-serif; line-height:1.6; }
        .hero-content { background: #1e40af; color: #fff; padding: 24px; border-radius: 12px; text-align:center; margin-bottom:24px; }
        .warning-alert { background:#ef4444; color:#fff; padding:12px 24px; border-radius:50px; font-weight:700; margin-bottom:16px; display:inline-block; }
        .hero-subtitle { opacity:0.9; font-weight:400; margin-top:12px; }
        .testimonial { background:#f8fafc; padding:16px; border-left:4px solid #10b981; border-radius:12px; margin-bottom:16px; }
        .testimonial-text { font-style:italic; color:#111827; }
        .testimonial-author { font-weight:700; color:#1e40af; margin-top:8px; }
        .testimonial-role { color:#6b7280; font-size:14px; margin-bottom:8px; }
        .testimonial-metric { background:#ecfdf5; color:#10b981; padding:8px 12px; border-radius:6px; font-size:14px; font-weight:600; display:inline-block; }
        .highlight-info { background:#eff6ff; border:2px solid #1e40af; color:#1e40af; padding:16px; border-radius:12px; margin-top:24px; }
      </style>

      <div class="cms-block">
        <!-- Hero -->
        <div class="hero-content">
          <div class="warning-alert">${hero.alert || ''}</div>
          <h1>${hero.title || ''}</h1>
          <p class="hero-subtitle">${hero.subtitle || ''}</p>
        </div>

        <!-- Intro / Testimonials -->
        <section id="intro">
          <h2>${intro.title || ''}</h2>
          <div class="testimonials">
            ${(intro.testimonials || []).map(t => `
              <div class="testimonial">
                <div class="testimonial-text">${t.text}</div>
                <div class="testimonial-author">${t.author}</div>
                <div class="testimonial-role">${t.role}</div>
                <div class="testimonial-metric">${t.metric}</div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Highlight Info -->
        <div class="highlight-info">${highlightInfo.text || ''}</div>
      </div>
    `;

    // Retornar HTML completo para copiar/pegar
    res.setHeader('Content-Type', 'text/html');
    res.send(blockHtml);
  } catch (err) {
    console.error("Error generando HTML inline para post:", err);
    res.status(500).send("No se pudo generar el HTML inline para el post");
  }
});



app.get('/api/html-for-post-inline-json', (req, res) => {
  try {
    // Leer los JSONs configurables
    const hero = fs.existsSync(HERO_FILE) ? JSON.parse(fs.readFileSync(HERO_FILE, 'utf8')) : {};
    const intro = fs.existsSync(INTRO_FILE) ? JSON.parse(fs.readFileSync(INTRO_FILE, 'utf8')) : {};
    const highlightInfo = fs.existsSync(HIGHLIGHT_INFO_FILE) ? JSON.parse(fs.readFileSync(HIGHLIGHT_INFO_FILE, 'utf8')) : {};

    // HTML completo como string
    const blockHtml = `
      <div class="cms-block">
        <div class="hero-content fade-in-up">
          <div class="warning-alert">${hero.alert || ''}</div>
          <h1>${hero.title || ''}</h1>
          <p class="hero-subtitle">${hero.subtitle || ''}</p>
        </div>

        <section id="intro">
          <h2>${intro.title || ''}</h2>
          <div class="testimonials">
            ${(intro.testimonials || []).map(t => `
              <div class="testimonial">
                <div class="testimonial-text">${t.text}</div>
                <div class="testimonial-author">${t.author}</div>
                <div class="testimonial-role">${t.role}</div>
                <div class="testimonial-metric">${t.metric}</div>
              </div>
            `).join('')}
          </div>
        </section>

        <div class="highlight highlight-info">${highlightInfo.text || ''}</div>
      </div>
    `;

    // Retornar JSON con el HTML
    res.json({
      success: true,
      html: blockHtml
    });
  } catch (err) {
    console.error("Error generando HTML inline para post:", err);
    res.status(500).json({ success: false, error: "No se pudo generar el HTML" });
  }
});


app.get('/api/html-for-post-inline-json-all', (req, res) => {
  try {
    // 1. Leer configuraciones desde JSON
    const hero = fs.existsSync(HERO_FILE) ? JSON.parse(fs.readFileSync(HERO_FILE, 'utf8')) : {};
    const intro = fs.existsSync(INTRO_FILE) ? JSON.parse(fs.readFileSync(INTRO_FILE, 'utf8')) : {};
    const highlightInfo = fs.existsSync(HIGHLIGHT_INFO_FILE) ? JSON.parse(fs.readFileSync(HIGHLIGHT_INFO_FILE, 'utf8')) : {};

    // 2. Construir HTML completo con CSS + contenido + JS inline
    const fullHtml = `
      <style>
        body { font-family: 'Inter', sans-serif; margin:0; padding:0; }
        .cms-block { max-width:900px; margin:40px auto; padding:20px; }
        .hero-content { background:#1e40af; color:#fff; padding:24px; border-radius:12px; text-align:center; margin-bottom:24px; }
        .warning-alert { background:#ef4444; color:#fff; padding:12px 24px; border-radius:50px; font-weight:700; margin-bottom:16px; display:inline-block; }
        .hero-subtitle { opacity:0.9; font-weight:400; margin-top:12px; }
        .testimonial { background:#f8fafc; padding:16px; border-left:4px solid #10b981; border-radius:12px; margin-bottom:16px; }
        .testimonial-text { font-style:italic; color:#111827; }
        .testimonial-author { font-weight:700; color:#1e40af; margin-top:8px; }
        .testimonial-role { color:#6b7280; font-size:14px; margin-bottom:8px; }
        .testimonial-metric { background:#ecfdf5; color:#10b981; padding:8px 12px; border-radius:6px; font-size:14px; font-weight:600; display:inline-block; }
        .highlight-info { background:#eff6ff; border:2px solid #1e40af; color:#1e40af; padding:16px; border-radius:12px; margin-top:24px; }
      </style>

      <article class="cms-block">
        <!-- Hero -->
        <div class="hero-content fade-in-up">
          <div class="warning-alert">${hero.alert || ''}</div>
          <h1>${hero.title || ''}</h1>
          <p class="hero-subtitle">${hero.subtitle || ''}</p>
        </div>

        <!-- Intro / Testimonials -->
        <section id="intro">
          <h2>${intro.title || ''}</h2>
          <div class="testimonials">
            ${(intro.testimonials || []).map(t => `
              <div class="testimonial">
                <div class="testimonial-text">${t.text}</div>
                <div class="testimonial-author">${t.author}</div>
                <div class="testimonial-role">${t.role}</div>
                <div class="testimonial-metric">${t.metric}</div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Highlight Info -->
        <div class="highlight-info">
          ${highlightInfo.text || ''}
        </div>
      </article>

      <script>
        // JS de ejemplo: animación fade-in
        document.addEventListener("DOMContentLoaded", () => {
          document.querySelectorAll(".fade-in-up").forEach(el => {
            el.style.opacity = 0;
            el.style.transform = "translateY(20px)";
            setTimeout(() => {
              el.style.transition = "all 0.8s ease";
              el.style.opacity = 1;
              el.style.transform = "translateY(0)";
            }, 300);
          });
        });
      </script>
    `;

    // 3. Retornar JSON con el HTML como string
    res.json({
      success: true,
      html: fullHtml
    });
  } catch (err) {
    console.error("Error generando HTML inline para post:", err);
    res.status(500).json({ success: false, error: "No se pudo generar el HTML" });
  }
});





app.get('/api/html-for-post-inline-full', (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (!fs.existsSync(indexPath)) {
      return res.status(404).json({ success: false, error: "index.html no encontrado" });
    }

    // 1. Leer el HTML base
    let fullHtml = fs.readFileSync(indexPath, 'utf8');

    // 2. Forzar !important en todas las reglas CSS dentro de <style>
    fullHtml = fullHtml.replace(/([^;}{]+):\s*([^;}{]+);/g, (match, prop, value) => {
      if (value.includes('!important')) return match;
      return `${prop.trim()}: ${value.trim()} !important;`;
    });

    // 3. Leer configuraciones JSON
    const hero = fs.existsSync(HERO_FILE) ? JSON.parse(fs.readFileSync(HERO_FILE, 'utf8')) : {};
    const intro = fs.existsSync(INTRO_FILE) ? JSON.parse(fs.readFileSync(INTRO_FILE, 'utf8')) : {};
    const highlightInfo = fs.existsSync(HIGHLIGHT_INFO_FILE) ? JSON.parse(fs.readFileSync(HIGHLIGHT_INFO_FILE, 'utf8')) : {};

    // 4. Reemplazar dinámicamente en el HTML (ejemplo de placeholders en index.html)
    if (hero.alert) {
      fullHtml = fullHtml.replace(/<div class="warning-alert">.*?<\/div>/, `<div class="warning-alert">${hero.alert}</div>`);
    }
    if (hero.title) {
      fullHtml = fullHtml.replace(/<h1>.*?<\/h1>/, `<h1>${hero.title}</h1>`);
    }
    if (hero.subtitle) {
      fullHtml = fullHtml.replace(/<p class="hero-subtitle">.*?<\/p>/, `<p class="hero-subtitle">${hero.subtitle}</p>`);
    }

    if (intro.title) {
      fullHtml = fullHtml.replace(/<section id="intro"[\s\S]*?<h2>.*?<\/h2>/, `<section id="intro">\n  <h2>${intro.title}</h2>`);
    }
    if (intro.testimonials) {
      const testimonialsHtml = intro.testimonials.map(t => `
        <div class="testimonial">
          <div class="testimonial-text">${t.text}</div>
          <div class="testimonial-author">${t.author}</div>
          <div class="testimonial-role">${t.role}</div>
          <div class="testimonial-metric">${t.metric}</div>
        </div>
      `).join("\n");

      fullHtml = fullHtml.replace(/<div class="testimonials">[\s\S]*?<\/div>/, `<div class="testimonials">${testimonialsHtml}</div>`);
    }

    if (highlightInfo.text) {
      fullHtml = fullHtml.replace(/<div class="highlight highlight-info">[\s\S]*?<\/div>/, `<div class="highlight highlight-info">${highlightInfo.text}</div>`);
    }

    // 5. Retornar JSON
    res.json({
      success: true,
      html: fullHtml
    });

  } catch (err) {
    console.error("Error generando HTML inline para post:", err);
    res.status(500).json({ success: false, error: "No se pudo generar el HTML" });
  }
});



app.get('/api/html-for-post-inline-style', (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (!fs.existsSync(indexPath)) {
      return res.status(404).json({ success: false, error: "index.html no encontrado" });
    }

    // 1. Leer el HTML base
    let rawHtml = fs.readFileSync(indexPath, 'utf8');

    // 2. Extraer solo desde <style> hasta el final del body (sin <!DOCTYPE>, <head>, <meta>)
    const match = rawHtml.match(/<style[\s\S]*<\/body>/i);
    if (!match) {
      return res.status(500).json({ success: false, error: "No se pudo extraer estilos y body del index.html" });
    }
    let fullHtml = match[0];

    // 3. Forzar !important en CSS
    fullHtml = fullHtml.replace(/([^;}{]+):\s*([^;}{]+);/g, (match, prop, value) => {
      if (value.includes('!important')) return match;
      return `${prop.trim()}: ${value.trim()} !important;`;
    });

    // 4. Leer configuraciones JSON
    const hero = fs.existsSync(HERO_FILE) ? JSON.parse(fs.readFileSync(HERO_FILE, 'utf8')) : {};
    const intro = fs.existsSync(INTRO_FILE) ? JSON.parse(fs.readFileSync(INTRO_FILE, 'utf8')) : {};
    const highlightInfo = fs.existsSync(HIGHLIGHT_INFO_FILE) ? JSON.parse(fs.readFileSync(HIGHLIGHT_INFO_FILE, 'utf8')) : {};

    // 5. Sustituir dinámicamente secciones
    if (hero.alert) {
      fullHtml = fullHtml.replace(/<div class="warning-alert">.*?<\/div>/, `<div class="warning-alert">${hero.alert}</div>`);
    }
    if (hero.title) {
      fullHtml = fullHtml.replace(/<h1>.*?<\/h1>/, `<h1>${hero.title}</h1>`);
    }
    if (hero.subtitle) {
      fullHtml = fullHtml.replace(/<p class="hero-subtitle">.*?<\/p>/, `<p class="hero-subtitle">${hero.subtitle}</p>`);
    }

    if (intro.title) {
      fullHtml = fullHtml.replace(/<section id="intro"[\s\S]*?<h2>.*?<\/h2>/, `<section id="intro">\n  <h2>${intro.title}</h2>`);
    }
    if (intro.testimonials) {
      const testimonialsHtml = intro.testimonials.map(t => `
        <div class="testimonial">
          <div class="testimonial-text">${t.text}</div>
          <div class="testimonial-author">${t.author}</div>
          <div class="testimonial-role">${t.role}</div>
          <div class="testimonial-metric">${t.metric}</div>
        </div>
      `).join("\n");

      fullHtml = fullHtml.replace(/<div class="testimonials">[\s\S]*?<\/div>/, `<div class="testimonials">${testimonialsHtml}</div>`);
    }

    if (highlightInfo.text) {
      fullHtml = fullHtml.replace(/<div class="highlight highlight-info">[\s\S]*?<\/div>/, `<div class="highlight highlight-info">${highlightInfo.text}</div>`);
    }

    // 6. Retornar JSON
    res.json({
      success: true,
      html: fullHtml
    });

  } catch (err) {
    console.error("Error generando HTML inline para post:", err);
    res.status(500).json({ success: false, error: "No se pudo generar el HTML" });
  }
});