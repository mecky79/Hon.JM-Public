// ============================================
// ACTIVE STATE — BOTTOM NAV & DESKTOP NAV
// ============================================
function setActiveNav() {
    let currentPage = window.location.pathname.split('/').pop() || 'index.html'

    // Handle URLs without .html extension (Cloudflare Workers strips .html)
    if (!currentPage.includes('.')) {
        currentPage = currentPage + '.html'
    }

    // Handle root URL
    if (currentPage === '.html' || currentPage === '') {
        currentPage = 'index.html'
    }

    // Desktop nav
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active-link')
        }
    })

    // Bottom nav
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active')
        }
    })
}

setActiveNav()
document.addEventListener('DOMContentLoaded', setActiveNav)
window.addEventListener('load', setActiveNav)

// ============================================
// SCROLL — NAVBAR BACKGROUND CHANGE
// ============================================
const navbar = document.querySelector('.navbar')

if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled')
        } else {
            navbar.classList.remove('scrolled')
        }
    })
}

// ============================================
// SCROLL REVEAL ANIMATION
// ============================================
const revealElements = document.querySelectorAll(
    '.issue-card, .why-card, .info-card, .news-card, .pillar-promise, .timeline-item'
)

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            revealObserver.unobserve(entry.target)
        }
    })
}, { threshold: 0.15 })

revealElements.forEach(el => {
    el.classList.add('reveal')
    revealObserver.observe(el)
})