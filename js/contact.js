// ============================================
// EMAILJS + SUPABASE CONFIGURATION
// ============================================
const EMAILJS_SERVICE_ID = 'service_7cx8hgg'
const EMAILJS_TEMPLATE_ID = 'template_xc2g917'
const EMAILJS_PUBLIC_KEY = 'Nix5GJ_NWkdJjS-xh'

const SUPABASE_URL = 'https://yccfysavrsffpztvdhiy.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljY2Z5c2F2cnNmZnB6dHZkaGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTgwMDYsImV4cCI6MjEwMjQ3NDAwNn0.3NDs75nsM1X2eJKaREOcEmOtLN-cIVpe2W2UaS_yJ4Y'

const { createClient } = supabase
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY)

// ============================================
// DOM ELEMENTS
// ============================================
const submitBtn = document.getElementById('contact-submit')
const feedback = document.getElementById('contact-feedback')

// ============================================
// VALIDATE FORM
// ============================================
function validateContactForm() {
    const name = document.getElementById('full-name').value.trim()
    const email = document.getElementById('email').value.trim()
    const phone = document.getElementById('phone').value.trim()
    const subject = document.getElementById('subject').value
    const message = document.getElementById('message').value.trim()

    if (!name) {
        showFeedback('Please enter your full name.', 'error')
        return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
        showFeedback('Please enter a valid email address.', 'error')
        return false
    }

    if (!subject) {
        showFeedback('Please select a subject.', 'error')
        return false
    }

    if (!message || message.length < 10) {
        showFeedback('Please enter a message of at least 10 characters.', 'error')
        return false
    }

    return { name, email, phone, subject, message }
}

// ============================================
// SHOW FEEDBACK
// ============================================
function showFeedback(message, type) {
    feedback.innerHTML = message
    feedback.style.color = type === 'error' ? '#dc3545' : '#28a745'
}

// ============================================
// SUBMIT CONTACT FORM
// ============================================
async function submitContactForm() {
    if (submitBtn.disabled) return
    submitBtn.disabled = true
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...'
    feedback.textContent = ''

    const data = validateContactForm()
    if (!data) {
        submitBtn.disabled = false
        submitBtn.innerHTML = 'Send Message'
        return
    }

    const { name, email, phone, subject, message } = data

    // Generate idempotency token — unique per submission attempt
    const idempotencyToken = `${email}-${subject}-${Date.now()}`

    try {
        // Check for duplicate submission in last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
        const { data: existing } = await db
            .from('contacts')
            .select('id')
            .eq('email', email)
            .eq('subject', subject)
            .gte('created_at', fiveMinutesAgo)
            .maybeSingle()

        if (existing) {
            showFeedback('Your message was already received. We will get back to you shortly.', 'success')
            submitBtn.disabled = false
            submitBtn.innerHTML = 'Send Message'
            return
        }

        // Save to Supabase
        const { error: dbError } = await db
            .from('contacts')
            .insert([{
                full_name: name,
                email: email,
                phone: phone || null,
                subject: subject,
                message: message
            }])

        if (dbError) throw dbError

        // Send email notification
        await sendEmailNotification({ name, email, phone, subject, message })

       // 3. Success
        showFeedback('<i class="fa-solid fa-circle-check"></i> Message sent successfully! We will get back to you shortly.', 'success')


        // Clear form
        document.getElementById('full-name').value = ''
        document.getElementById('email').value = ''
        document.getElementById('phone').value = ''
        document.getElementById('subject').value = ''
        document.getElementById('message').value = ''

        submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Sent!'
        setTimeout(() => {
            submitBtn.disabled = false
            submitBtn.innerHTML = 'Send Message'
        }, 5000)

    } catch (error) {
        console.error('Contact form error:', error)

        // If database saved but email failed — don't show error
        // The message is already saved, email is secondary
        if (error.status === 400 && error.text?.includes('Public Key')) {
            showFeedback('<i class="fa-solid fa-circle-check"></i> Message received! We will get back to you shortly.', 'success')
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Sent!'
            setTimeout(() => {
                submitBtn.disabled = false
                submitBtn.innerHTML = 'Send Message'
            }, 5000)
        } else {
            showFeedback('Something went wrong. Please try again or call us directly.', 'error')
            submitBtn.disabled = false
            submitBtn.innerHTML = 'Send Message'
        }
    }
}
// ============================================
// EMAIL NOTIFICATION — SWAPPABLE FUNCTION
// To switch to Resend or SendGrid later:
// Replace only this function body.
// All other code stays exactly the same.
// ============================================
async function sendEmailNotification({ name, email, phone, subject, message }) {
    return emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
            name: name,
            email: email,
            phone: phone || 'Not provided',
            subject: subject,
            message: message,
            submitted_at: new Date().toLocaleString('en-KE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }
    )
}

// ============================================
// EVENT LISTENER
// ============================================
submitBtn.addEventListener('click', submitContactForm)