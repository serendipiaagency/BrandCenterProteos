// API Configuration
const API_BASE = ''

// Where to send the viewer after a successful (or already-valid) login.
// Reads ?redirect=<path>, set by catalog.js when it bounces an unauthenticated
// visit to login (e.g. a shared /category/:name or /brand/:name link).
// Only accepts a same-site path (starts with a single '/') to avoid being
// turned into an open redirect — anything else falls back to /catalog.
const getRedirectTarget = () => {
  const params = new URLSearchParams(window.location.search)
  const target = params.get('redirect')
  if (target && target.startsWith('/') && !target.startsWith('//')) {
    try {
      return decodeURIComponent(target)
    } catch {
      return '/catalog'
    }
  }
  return '/catalog'
}

// Check if already logged in
const checkAuth = () => {
  const token = localStorage.getItem('catalog_token')
  if (token) {
    window.location.href = getRedirectTarget()
  }
}

// Handle login form submission
const handleLogin = async (e) => {
  e.preventDefault()
  
  const username = document.getElementById('username').value
  const password = document.getElementById('password').value
  const remember = document.getElementById('remember').checked
  const errorMessage = document.getElementById('error-message')
  
  // Hide previous error
  errorMessage.style.display = 'none'
  
  // Disable button
  const button = document.querySelector('.login-button')
  button.disabled = true
  button.textContent = 'Logging in...'
  
  try {
    const response = await axios.post(`${API_BASE}/api/public/login`, {
      email: username,
      password: password
    })
    
    if (response.data.success) {
      // Store token
      if (remember) {
        localStorage.setItem('catalog_token', response.data.token)
        localStorage.setItem('catalog_user', JSON.stringify(response.data.user))
      } else {
        sessionStorage.setItem('catalog_token', response.data.token)
        sessionStorage.setItem('catalog_user', JSON.stringify(response.data.user))
      }
      
      // Redirect to catalog (or wherever the viewer originally tried to reach)
      window.location.href = getRedirectTarget()
    } else {
      throw new Error(response.data.message || 'Invalid credentials')
    }
  } catch (error) {
    console.error('Login error:', error)
    
    // Show error message
    errorMessage.textContent = error.response?.data?.message || 'Invalid username or password. Please try again.'
    errorMessage.style.display = 'block'
    
    // Re-enable button
    button.disabled = false
    button.textContent = 'Login'
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth()
  
  const form = document.getElementById('login-form')
  form.addEventListener('submit', handleLogin)
})
