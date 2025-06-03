const WORDS_PER_MINUTE = 200;

const newsContainer = document.getElementById('newsContainer');
const mostPopularContainer = document.getElementById('mostPopular');
const sortSelect = document.getElementById('sortSelect');
const themeToggle = document.getElementById('themeToggle');
const categoryFilters = document.getElementById('categoryFilters');
const navbarBrand = document.querySelector('.site-title');

let articles = [];
let currentTheme = localStorage.getItem('theme') || 'light';
let selectedCategory = 'all';
document.addEventListener('DOMContentLoaded', async () => {
    await loadArticles();
    applyTheme();
    renderCategoryFilters();
    renderArticles();
    updateMostPopular();

    navbarBrand.addEventListener('click', function(e) {
        e.preventDefault();
        selectedCategory = 'all';
        sortSelect.value = 'date';
        document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
        document.querySelector('.category-filter[data-category="all"]').classList.add('active');
        renderArticles();
    });

    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
        themeSwitch.addEventListener('change', (e) => {
            toggleTheme(e.target.checked);
        });
    }
});


async function loadArticles() {
    try {
        const response = await fetch('Articles.json');
        const data = await response.json();
        articles = data.articles;
    } catch (error) {
        console.error('Failed to load articles:', error);
        newsContainer.innerHTML = '<div class="col-12"><div class="alert alert-danger">Failed to load articles. Please try again later.</div></div>';
    }
}

function calculateReadingTime(wordCount) {
    const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
    return `${minutes} min`;
}

function renderCategoryFilters() {
    const categories = [...new Set(articles.map(article => article.category))];
    const categoryCounts = categories.reduce((acc, category) => {
        acc[category] = articles.filter(article => article.category === category).length;
        return acc;
    }, {});

    categoryFilters.innerHTML = `
        <div class="category-filter ${selectedCategory === 'all' ? 'active' : ''}" data-category="all">
            All categories
            <span class="badge">${articles.length}</span>
        </div>
        ${categories.map(category => `
            <div class="category-filter ${selectedCategory === category ? 'active' : ''}" data-category="${category}">
                ${category}
                <span class="badge">${categoryCounts[category]}</span>
            </div>
        `).join('')}
    `;

    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.addEventListener('click', () => {
            selectedCategory = filter.dataset.category;
            document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            renderArticles();
        });
    });
}

function renderArticles() {
    let filteredArticles = articles;

    if (selectedCategory !== 'all') {
        filteredArticles = articles.filter(article => article.category === selectedCategory);
    }

    const sortedArticles = [...filteredArticles].sort((a, b) => {
        if (sortSelect.value === 'date') {
            return new Date(b.date) - new Date(a.date);
        }
        return b.views - a.views;
    });

    if (sortedArticles.length === 0) {
        newsContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">No articles found in this category.</div></div>';
        return;
    }

    newsContainer.innerHTML = sortedArticles.map(article => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card news-card h-100">
                <div class="card-body">
                    <span class="badge bg-primary category-badge">${article.category}</span>
                    <h5 class="card-title mt-2">${article.title}</h5>
                    <p class="card-text">${article.content.substring(0, 150)}...</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div>
                            <span class="reading-time">⏱️ ${calculateReadingTime(article.wordCount)}</span>
                            <span class="views-count ms-3">👁️ ${article.views}</span>
                        </div>
                        <small class="text-muted">${formatDate(article.date)}</small>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function updateMostPopular() {
    const mostPopular = articles.reduce((max, article) =>
        article.views > max.views ? article : max
    , articles[0]);

    mostPopularContainer.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h6 class="card-title">${mostPopular.title}</h6>
                <p class="card-text small text-muted mb-2">${mostPopular.content.substring(0, 100)}...</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-primary">${mostPopular.category}</span>
                    <small class="text-muted">${formatDate(mostPopular.date)}</small>
                </div>
                <div class="mt-2">
                    <span class="reading-time">⏱️ ${calculateReadingTime(mostPopular.wordCount)}</span>
                    <span class="views-count ms-3">👁️ ${mostPopular.views}</span>
                </div>
            </div>
        </div>
    `;
}

function toggleTheme(checked) {
    currentTheme = checked ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme();
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const switchInput = document.getElementById('themeSwitch');
    if (switchInput) {
        switchInput.checked = currentTheme === 'dark';
    }
}


sortSelect.addEventListener('change', renderArticles);
themeSwitch.addEventListener('change', (e) => {
    toggleTheme(e.target.checked);
});

