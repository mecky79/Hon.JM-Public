// ============================================
// ACTIVE STATE — BOTTOM NAV & DESKTOP NAV
// ============================================
function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html'

    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active-link')
        }
    })

    document.querySelectorAll('.bottom-nav-item').forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active')
        }
    })
}

// Run immediately and also after DOM loads
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