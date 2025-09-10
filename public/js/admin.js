// ====== ADMIN.JS ======

// --- Selección de elementos del DOM ---
const heroForm = document.getElementById('hero-form');
const heroWarning = document.getElementById('hero-warning');
const heroTitle = document.getElementById('hero-title');
const heroSubtitle = document.getElementById('hero-subtitle');

const articleForm = document.getElementById('article-form');
const articleTitle = document.getElementById('article-title');
const articleContent = document.getElementById('article-content');
const articlesList = document.getElementById('articles-list');

// ====== HERO ======

// Cargar hero al abrir admin
async function loadHeroAdmin() {
  try {
    const res = await fetch('/api/hero');
    if (!res.ok) throw new Error('Error al cargar hero');
    const data = await res.json();
    heroWarning.value = data.warningAlert;
    heroTitle.value = data.title;
    heroSubtitle.value = data.subtitle;
  } catch (err) {
    console.error(err);
    alert('No se pudo cargar el Hero');
  }
}

// Guardar cambios de hero
heroForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const newHero = {
      warningAlert: heroWarning.value,
      title: heroTitle.value,
      subtitle: heroSubtitle.value
    };
    const res = await fetch('/api/hero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHero)
    });
    if (!res.ok) throw new Error('Error al guardar hero');
    alert('Hero actualizado correctamente!');
  } catch (err) {
    console.error(err);
    alert('No se pudo guardar el Hero');
  }
});

// ====== ARTÍCULOS ======

// Cargar artículos existentes
async function loadArticles() {
  try {
    const res = await fetch('/api/articles');
    if (!res.ok) throw new Error('Error al cargar artículos');
    const data = await res.json();

    // Limpiar lista
    articlesList.innerHTML = '';

    data.forEach(article => {
      const li = document.createElement('li');
      li.textContent = `${article.title} - ${new Date(article.createdAt).toLocaleString()}`;

      const btnDelete = document.createElement('button');
      btnDelete.textContent = 'Eliminar';
      btnDelete.style.marginLeft = '10px';
      btnDelete.addEventListener('click', async () => {
        if (!confirm('¿Seguro que quieres eliminar este artículo?')) return;
        await fetch(`/api/articles/${article.id}`, { method: 'DELETE' });
        loadArticles();
      });

      li.appendChild(btnDelete);
      articlesList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    alert('No se pudieron cargar los artículos');
  }
}

// Guardar nuevo artículo
articleForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const newArticle = {
      title: articleTitle.value,
      content: articleContent.value
    };
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newArticle)
    });
    if (!res.ok) throw new Error('Error al crear artículo');

    // Limpiar formulario
    articleTitle.value = '';
    articleContent.value = '';
    loadArticles();
  } catch (err) {
    console.error(err);
    alert('No se pudo crear el artículo');
  }
});



// ====== INTRO SECCION ======
const introForm = document.getElementById('intro-form');
const introTitle = document.getElementById('intro-title');
const introHighlight = document.getElementById('intro-highlight');
const introTestimonialsDiv = document.getElementById('intro-testimonials');
const addTestimonialBtn = document.getElementById('add-testimonial');

function createTestimonialInput(testimonial = {}) {
  const div = document.createElement('div');
  div.classList.add('testimonial-input');
  div.style.border = '1px solid #ccc';
  div.style.padding = '10px';
  div.style.marginBottom = '10px';

  div.innerHTML = `
    <label>Texto:</label>
    <textarea class="testimonial-text" required>${testimonial.text || ''}</textarea>
    <label>Autor:</label>
    <input type="text" class="testimonial-author" value="${testimonial.author || ''}" required>
    <label>Rol:</label>
    <input type="text" class="testimonial-role" value="${testimonial.role || ''}" required>
    <label>Métrica:</label>
    <input type="text" class="testimonial-metric" value="${testimonial.metric || ''}" required>
    <button type="button" class="remove-testimonial">Eliminar</button>
  `;

  div.querySelector('.remove-testimonial').addEventListener('click', () => {
    div.remove();
  });

  introTestimonialsDiv.appendChild(div);
}

// Cargar intro
async function loadIntroAdmin() {
  try {
    const res = await fetch('/api/intro');
    const data = await res.json();
    introTitle.value = data.title;
    introHighlight.value = data.highlight;
    introTestimonialsDiv.innerHTML = '';
    data.testimonials.forEach(t => createTestimonialInput(t));
  } catch (err) {
    console.error(err);
    alert('Error al cargar sección Intro');
  }
}

// Añadir nuevo testimonio
addTestimonialBtn.addEventListener('click', () => createTestimonialInput());

// Guardar intro
introForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const testimonials = Array.from(document.querySelectorAll('.testimonial-input')).map(div => ({
    text: div.querySelector('.testimonial-text').value,
    author: div.querySelector('.testimonial-author').value,
    role: div.querySelector('.testimonial-role').value,
    metric: div.querySelector('.testimonial-metric').value
  }));

  try {
    const newIntro = {
      title: introTitle.value,
      highlight: introHighlight.value,
      testimonials
    };
    const res = await fetch('/api/intro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIntro)
    });
    if (!res.ok) throw new Error('Error al guardar intro');
    alert('Sección Introducción actualizada!');
  } catch (err) {
    console.error(err);
    alert('No se pudo guardar la sección Introducción');
  }
});

loadIntroAdmin();
// ====== INIT ======
loadHeroAdmin();
loadArticles();