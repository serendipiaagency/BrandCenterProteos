// ============================================
// Proteos Biotech - Public Catalog
// Design based on: https://coworkingdf.com/ProteosBrandCenter/
// ============================================

// ============================================
// Authentication Check
// ============================================

const checkAuth = async () => {
  const token = localStorage.getItem('catalog_token') || sessionStorage.getItem('catalog_token')
  
  if (!token) {
    console.log('🔒 No token found, redirecting to login')
    window.location.href = '/login'
    return false
  }
  
  try {
    const response = await axios.post('/api/public/verify-token', { token })
    
    if (!response.data.valid) {
      console.log('🔒 Invalid token, redirecting to login')
      localStorage.removeItem('catalog_token')
      sessionStorage.removeItem('catalog_token')
      localStorage.removeItem('catalog_user')
      sessionStorage.removeItem('catalog_user')
      window.location.href = '/login'
      return false
    }
    
    console.log('✅ Authentication verified')
    return true
  } catch (error) {
    console.error('❌ Auth verification failed:', error)
    window.location.href = '/login'
    return false
  }
}

// Global state
const state = {
  brands: [],
  subBrands: [],
  materialTypes: [],
  assets: [],
  allAssets: [],    // unfiltered — used for 'Últimas actualizaciones'
  selectedBrands: [],
  selectedMaterialTypes: [],
  loading: false,
  language: localStorage.getItem('brandPortalLanguage') || 'en' // Default English
}

// ============================================
// Translations
// ============================================

const translations = {
  en: {
    // Header & Navigation
    brandName: 'PROTEOS BIOTECH',
    nav: {
      assetsLibrary: 'Assets Library',
      userGuide: 'User Guide',
      logout: 'Logout'
    },
    // Filters
    filters: {
      productLines: 'Product Lines',
      assetsCategory: 'Assets Category',
      clearAll: 'Clear all'
    },
    // Welcome Section
    welcome: {
      title: 'Welcome to our BRAND CENTER',
      subtitle: 'Find all the files, templates and resources you need.'
    },
    // Assets
    assets: {
      noResults: 'No assets found',
      noResultsDesc: 'Try adjusting your filters',
      download: 'Download',
      preview: 'Preview'
    },
    // Request Form
    requestForm: {
      headerText: 'Need something specific?',
      headerLink: 'Fill the form',
      modalTitle: 'Request Specific Materials',
      modalSubtitle: 'Tell us what you need and we\'ll get back to you as soon as possible.',
      name: 'Your Name',
      namePlaceholder: 'Enter your full name',
      email: 'Email Address',
      emailPlaceholder: 'your.email@example.com',
      subject: 'Subject',
      subjectPlaceholder: 'Brief description of your request',
      message: 'Message',
      messagePlaceholder: 'Please describe in detail what materials or resources you need...',
      cancel: 'Cancel',
      submit: 'Submit Request',
      successTitle: 'Request Sent!',
      successMessage: 'We have received your request and will get back to you shortly.',
      errorTitle: 'Error',
      errorMessage: 'There was an error sending your request. Please try again.'
    },
    // Footer
    footer: {
      copyright: 'Proteos Biotech. All rights reserved.',
      language: 'Language'
    },
    // Language Selector
    languageSelector: {
      english: 'English',
      spanish: 'Español'
    }
  },
  es: {
    // Header & Navigation
    brandName: 'PROTEOS BIOTECH',
    nav: {
      assetsLibrary: 'Biblioteca de Recursos',
      userGuide: 'Instrucciones de Uso',
      logout: 'Salir'
    },
    // Filters
    filters: {
      productLines: 'Líneas de Producto',
      assetsCategory: 'Categoría de Recursos',
      clearAll: 'Limpiar todo'
    },
    // Welcome Section
    welcome: {
      title: 'Bienvenido a nuestro Portal de Marca',
      subtitle: 'Encuentra todos los archivos, plantillas y recursos que necesitas.'
    },
    // Assets
    assets: {
      noResults: 'No se encontraron recursos',
      noResultsDesc: 'Intenta ajustar tus filtros',
      download: 'Descargar',
      preview: 'Vista previa'
    },
    // Request Form
    requestForm: {
      headerText: '¿Necesitas algo específico?',
      headerLink: 'Completa el formulario',
      modalTitle: 'Solicitar Materiales Específicos',
      modalSubtitle: 'Cuéntanos qué necesitas y nos pondremos en contacto contigo lo antes posible.',
      name: 'Tu Nombre',
      namePlaceholder: 'Ingresa tu nombre completo',
      email: 'Correo Electrónico',
      emailPlaceholder: 'tu.email@ejemplo.com',
      subject: 'Asunto',
      subjectPlaceholder: 'Breve descripción de tu solicitud',
      message: 'Mensaje',
      messagePlaceholder: 'Por favor describe en detalle qué materiales o recursos necesitas...',
      cancel: 'Cancelar',
      submit: 'Enviar Solicitud',
      successTitle: '¡Solicitud Enviada!',
      successMessage: 'Hemos recibido tu solicitud y nos pondremos en contacto contigo pronto.',
      errorTitle: 'Error',
      errorMessage: 'Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.'
    },
    // Footer
    footer: {
      copyright: 'Proteos Biotech. Todos los derechos reservados.',
      language: 'Idioma'
    },
    // Language Selector
    languageSelector: {
      english: 'English',
      spanish: 'Español'
    }
  }
}

// Get translation
const t = (key) => {
  const keys = key.split('.')
  let value = translations[state.language]
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return value || key
}

// Change language
const changeLanguage = (lang) => {
  state.language = lang
  localStorage.setItem('brandPortalLanguage', lang)
  render()
}

// ============================================
// Utility Functions
// ============================================

const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => document.querySelectorAll(selector)

// ============================================
// API Functions
// ============================================

const api = {
  // Helper to get token
  getToken() {
    return localStorage.getItem('catalog_token') || sessionStorage.getItem('catalog_token')
  },
  
  // Helper to get headers with token
  getHeaders() {
    const token = this.getToken()
    return {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  },
  
  async getBrands() {
    const response = await axios.get('/api/public/brands', {
      headers: this.getHeaders()
    })
    return response.data.brands
  },
  
  async getSubBrands(brandId) {
    const response = await axios.get(`/api/brands/${brandId}/sub-brands`, {
      headers: this.getHeaders()
    })
    return response.data.subBrands || []
  },
  
  async getMaterialTypes() {
    const response = await axios.get('/api/public/material-types', {
      headers: this.getHeaders()
    })
    return response.data.materialTypes
  },
  
  async getAssets(filters = {}) {
    let url = '/api/public/assets?'
    if (filters.brand_id) url += `brand_id=${filters.brand_id}&`
    if (filters.material_type_id) url += `material_type_id=${filters.material_type_id}&`
    
    // Add cache-busting timestamp to force fresh data
    url += `_t=${Date.now()}&`
    
    const response = await axios.get(url, {
      headers: this.getHeaders()
    })
    return response.data.assets
  }
}

// ============================================
// Data Loading
// ============================================

const loadInitialData = async () => {
  try {
    state.loading = true
    render()
    
    const [brands, materialTypes] = await Promise.all([
      api.getBrands(),
      api.getMaterialTypes()
    ])
    
    state.brands = brands
    state.materialTypes = materialTypes
    
    // Check if there's a brand filter from URL (window.BRAND_FILTER is set in /brand/:brandName)
    if (window.BRAND_FILTER) {
      // Find the brand by name
      const filteredBrand = brands.find(b => b.name === window.BRAND_FILTER)
      if (filteredBrand) {
        // Select only the filtered brand
        state.selectedBrands = [filteredBrand.id]
      } else {
        // Brand not found, select all accessible brands
        state.selectedBrands = brands.map(brand => brand.id)
      }
    } else {
      // 🎯 SELECT ALL BRANDS BY DEFAULT (user's accessible brands)
      state.selectedBrands = brands.map(brand => brand.id)
    }
    
    // 🎯 SELECT ALL MATERIAL TYPES BY DEFAULT
    state.selectedMaterialTypes = materialTypes.map(type => type.id)
    
    // Load sub-brands for all brands
    for (const brand of brands) {
      try {
        const subBrands = await api.getSubBrands(brand.id)
        state.subBrands.push(...subBrands.map(sb => ({ ...sb, parent_brand_id: brand.id })))
      } catch (error) {
        console.error(`Error loading sub-brands for ${brand.id}:`, error)
      }
    }
    
    await loadAssets()
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    state.loading = false
    render()
  }
}

const loadAssets = async () => {
  try {
    console.log('🔄 Loading assets with filters:', {
      brands: state.selectedBrands.length,
      materialTypes: state.selectedMaterialTypes.length
    })
    
    // Load all assets first
    const allAssets = await api.getAssets()
    console.log('📦 Total assets loaded:', allAssets.length)

    // Keep unfiltered copy for 'Últimas actualizaciones'
    state.allAssets = allAssets

    // Apply filters client-side for better UX
    let filteredAssets = allAssets
    
    // Filter by brands
    // If NO brands are selected, show empty (user must select at least one brand)
    if (state.selectedBrands.length === 0) {
      filteredAssets = []
      console.log('⚠️  No brands selected, showing empty')
    } else if (state.selectedBrands.length > 0 && state.selectedBrands.length < state.brands.length) {
      // If SOME brands are selected (not all), filter by those brands
      filteredAssets = filteredAssets.filter(asset => {
        // Check if asset has brand_ids array
        if (asset.brand_ids && Array.isArray(asset.brand_ids)) {
          // Asset matches if it has at least one brand in common with selected brands
          return asset.brand_ids.some(brandId => state.selectedBrands.includes(brandId))
        }
        // Fallback to old brand_id field for backward compatibility
        return state.selectedBrands.includes(asset.brand_id)
      })
      console.log('🏷️  After brand filter:', filteredAssets.length, 'assets')
    }
    // If ALL brands are selected, don't filter (show all assets from accessible brands)
    
    // Filter by material types (only if some types are selected, not all or none)
    // If ALL material types are selected, don't filter (show all)
    if (state.selectedMaterialTypes.length > 0 && state.selectedMaterialTypes.length < state.materialTypes.length) {
      filteredAssets = filteredAssets.filter(asset => 
        state.selectedMaterialTypes.includes(asset.material_type_id)
      )
      console.log('📁 After material type filter:', filteredAssets.length, 'assets')
    }
    
    // If NO material types are selected, show empty
    if (state.selectedMaterialTypes.length === 0) {
      filteredAssets = []
      console.log('⚠️  No material types selected, showing empty')
    }
    
    state.assets = filteredAssets
    console.log('✅ Final assets to display:', state.assets.length)
    render()
  } catch (error) {
    console.error('❌ Error loading assets:', error)
    showNotification('Error loading assets', 'error')
  }
}

// ============================================
// Filter Actions
// ============================================

const toggleBrandFilter = async (brandId) => {
  const index = state.selectedBrands.indexOf(brandId)
  if (index > -1) {
    state.selectedBrands.splice(index, 1)
  } else {
    state.selectedBrands.push(brandId)
  }
  await loadAssets()
}

const toggleMaterialTypeFilter = async (typeId) => {
  const index = state.selectedMaterialTypes.indexOf(typeId)
  if (index > -1) {
    state.selectedMaterialTypes.splice(index, 1)
  } else {
    state.selectedMaterialTypes.push(typeId)
  }
  await loadAssets()
}

const clearBrandFilters = async () => {
  state.selectedBrands = []
  await loadAssets()
}

const clearCategoryFilters = async () => {
  state.selectedMaterialTypes = []
  await loadAssets()
}

const clearAllFilters = async () => {
  state.selectedBrands = []
  state.selectedMaterialTypes = []
  await loadAssets()
}

// ============================================
// Request Form Modal Functions
// ============================================

const openRequestModal = () => {
  const modal = $('#request-modal')
  if (modal) {
    modal.style.display = 'flex'
    document.body.style.overflow = 'hidden'
  }
}

const closeRequestModal = () => {
  const modal = $('#request-modal')
  if (modal) {
    modal.style.display = 'none'
    document.body.style.overflow = 'auto'
    // Reset form
    const form = $('#request-form')
    if (form) form.reset()
  }
}

const submitRequestForm = async (event) => {
  event.preventDefault()
  
  const form = event.target
  const submitBtn = form.querySelector('button[type="submit"]')
  const originalText = submitBtn.innerHTML
  
  // Get form data
  const formData = {
    name: form.name.value,
    email: form.email.value,
    subject: form.subject.value,
    message: form.message.value,
    language: state.language
  }
  
  try {
    // Show loading state
    submitBtn.disabled = true
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${state.language === 'en' ? 'Sending...' : 'Enviando...'}`
    
    // Send request to backend
    const response = await axios.post('/api/public/request', formData)
    
    if (response.data.success) {
      // Show success message
      showNotification(t('requestForm.successTitle'), t('requestForm.successMessage'), 'success')
      closeRequestModal()
    } else {
      throw new Error('Request failed')
    }
  } catch (error) {
    console.error('Error submitting request:', error)
    showNotification(t('requestForm.errorTitle'), t('requestForm.errorMessage'), 'error')
    submitBtn.disabled = false
    submitBtn.innerHTML = originalText
  }
}

const showNotification = (title, message, type = 'success') => {
  const notification = document.createElement('div')
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      </div>
      <div class="notification-text">
        <h4>${title}</h4>
        <p>${message}</p>
      </div>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `
  
  document.body.appendChild(notification)
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.opacity = '0'
    setTimeout(() => notification.remove(), 300)
  }, 5000)
}

// ============================================
// Rendering Functions
// ============================================

const renderHeader = () => {
  return `
    <header class="brand-header">
      <div class="header-top">
        <div class="header-top-left">
          <!-- OCULTO: Need something specific? Fill the form -->
        </div>
        <div class="header-top-right">
          <div class="language-selector">
            <i class="fas fa-globe"></i>
            <select id="language-select" onchange="changeLanguage(this.value)" class="language-dropdown">
              <option value="en" ${state.language === 'en' ? 'selected' : ''}>English</option>
              <option value="es" ${state.language === 'es' ? 'selected' : ''}>Español</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="header-main">
        <a href="/" class="brand-logo">
          <i class="fas fa-cube" style="font-size: 2rem;"></i>
          <span>${t('brandName')}</span>
        </a>
        
        <nav class="main-nav">
          <a href="#" onclick="showUserGuide(); return false;" style="cursor: pointer;">${t('nav.userGuide')}</a>
          <a href="/admin">${t('nav.logout')}</a>
        </nav>
      </div>
    </header>
  `
}

// Toggle filter section collapse
const toggleFilterSection = (sectionId) => {
  const section = $(`#${sectionId}`)
  const icon = $(`#${sectionId}-icon`)
  const content = $(`#${sectionId}-content`)
  
  if (content.style.maxHeight) {
    content.style.maxHeight = null
    icon.style.transform = 'rotate(0deg)'
    section.classList.remove('expanded')
  } else {
    content.style.maxHeight = content.scrollHeight + 'px'
    icon.style.transform = 'rotate(180deg)'
    section.classList.add('expanded')
  }
}

const renderSidebar = () => {
  const totalMaterialTypes = state.materialTypes.length
  const selectedCount = state.selectedMaterialTypes.length
  
  return `
    <aside class="sidebar sidebar-narrow">
      <!-- Assets Category Filter (Always expanded by default) -->
      <div id="category-filter" class="filter-section expanded">
        <button class="filter-header" onclick="toggleFilterSection('category-filter')">
          <div class="filter-header-left">
            <i class="fas fa-folder-open filter-icon"></i>
            <h3 class="filter-title">${t('filters.assetsCategory')}</h3>
            <span class="filter-count">(${totalMaterialTypes})</span>
            ${selectedCount > 0 && selectedCount < totalMaterialTypes ? `<span class="filter-badge">${selectedCount}</span>` : ''}
          </div>
          <i id="category-filter-icon" class="fas fa-chevron-up filter-toggle" style="transform: rotate(180deg);"></i>
        </button>
        
        <div id="category-filter-content" class="filter-content" style="max-height: 1000px; overflow: visible;">
          <!-- Clear All Button (Always visible at top) -->
          <div class="filter-actions">
            <button class="clear-filters-btn-top" onclick="clearCategoryFilters()">
              <i class="fas fa-times-circle"></i>
              ${t('filters.clearAll')}
            </button>
            ${selectedCount === totalMaterialTypes ? `
              <span class="all-selected-badge">
                <i class="fas fa-check-circle"></i>
                All selected
              </span>
            ` : ''}
          </div>
          
          <ul class="filter-list">
            ${state.materialTypes.map(type => {
              const displayName = type.display_name;
              const isSelected = state.selectedMaterialTypes.includes(type.id);
              
              return `
                <li class="filter-item ${isSelected ? 'selected' : ''}" onclick="toggleMaterialTypeFilter(${type.id})">
                  <label class="filter-checkbox">
                    <input 
                      type="checkbox" 
                      value="${type.id}"
                      ${isSelected ? 'checked' : ''}
                      onchange="event.stopPropagation(); toggleMaterialTypeFilter(${type.id})"
                    />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-label">${displayName}</span>
                  </label>
                </li>
              `
            }).join('')}
          </ul>
        </div>
      </div>
    </aside>
  `
}

const renderWelcome = () => {
  return `
    <div class="welcome-section">
      <h1 class="welcome-title">${t('welcome.title')}</h1>
      <p class="welcome-subtitle">${t('welcome.subtitle')}</p>
    </div>
  `
}

// Horizontal Product Lines Filter
const renderHorizontalBrandFilter = () => {
  // 🎯 HIDE brand filter if user has 0 or 1 brands (no filtering needed)
  if (state.brands.length <= 1) {
    return ''
  }
  
  const brandGroups = state.brands.map(brand => ({
    ...brand,
    subBrands: state.subBrands.filter(sb => sb.parent_brand_id === brand.id)
  }))
  
  return `
    <div class="horizontal-filter-container">
      <div class="horizontal-filter-header">
        <i class="fas fa-tag filter-icon"></i>
        <h3 class="horizontal-filter-title">${t('filters.productLines')}</h3>
        ${state.selectedBrands.length > 0 ? `
          <button onclick="clearBrandFilters()" class="clear-filters-btn-inline">
            <i class="fas fa-times-circle"></i>
            ${t('filters.clearAll')}
          </button>
        ` : ''}
      </div>
      <div class="horizontal-filter-items">
        ${brandGroups.map(brand => {
          const isSelected = state.selectedBrands.includes(brand.id);
          
          // If brand has sub-brands, show sub-brand names
          if (brand.subBrands.length > 0) {
            return brand.subBrands.map(subBrand => `
              <button 
                class="horizontal-filter-chip ${isSelected ? 'selected' : ''}"
                onclick="toggleBrandFilter(${brand.id})"
              >
                ${subBrand.display_name}
                ${isSelected ? '<i class="fas fa-check-circle"></i>' : ''}
              </button>
            `).join('')
          } else {
            return `
              <button 
                class="horizontal-filter-chip ${isSelected ? 'selected' : ''}"
                onclick="toggleBrandFilter(${brand.id})"
              >
                ${brand.display_name}
                ${isSelected ? '<i class="fas fa-check-circle"></i>' : ''}
              </button>
            `
          }
        }).join('')}
      </div>
    </div>
  `
}

// ── File icon helpers ──────────────────────────────────────────
const getFileIcon = (fileType) => {
  if (!fileType) return 'fa-file'
  const ft = fileType.toLowerCase()
  if (ft.includes('pdf')) return 'fa-file-pdf'
  if (ft.includes('image') || /jpg|jpeg|png|webp|gif|svg/.test(ft)) return 'fa-file-image'
  if (ft.includes('video') || /mp4|mov|avi/.test(ft)) return 'fa-file-video'
  if (ft.includes('zip') || ft.includes('rar') || ft.includes('7z')) return 'fa-file-archive'
  if (/doc|docx|ppt|pptx|xls|xlsx/.test(ft)) return 'fa-file-word'
  return 'fa-file'
}
const getFileColor = (fileType) => {
  if (!fileType) return '#718096'
  const ft = fileType.toLowerCase()
  if (ft.includes('pdf')) return '#dc2626'
  if (ft.includes('image') || /jpg|jpeg|png|webp/.test(ft)) return '#7c3aed'
  if (ft.includes('video')) return '#2563eb'
  if (ft.includes('zip') || ft.includes('rar')) return '#d97706'
  return '#718096'
}

// ── Últimas actualizaciones ────────────────────────────────────
const renderLatestUpdates = () => {
  if (!state.allAssets || state.allAssets.length === 0) return ''

  const latestAssets = [...state.allAssets]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8)

  const isEs = state.language !== 'en'

  const relDate = (dateStr) => {
    if (!dateStr) return ''
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
    if (diff === 0) return isEs ? 'Hoy' : 'Today'
    if (diff === 1) return isEs ? 'Ayer' : 'Yesterday'
    if (diff < 7) return isEs ? `Hace ${diff} días` : `${diff}d ago`
    if (diff < 30) { const w = Math.floor(diff/7); return isEs ? `Hace ${w} sem.` : `${w}w ago` }
    return new Date(dateStr).toLocaleDateString(isEs ? 'es-ES' : 'en-US', { day: '2-digit', month: 'short' })
  }

  return `
    <div style="margin-bottom: 2rem;">
      <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem;">
        <i class="fas fa-bolt" style="color: #002f57; font-size: 1rem;"></i>
        <h2 style="font-size: 1.05rem; font-weight: 700; color: #1a202c; margin: 0;">
          ${isEs ? 'Últimas actualizaciones' : 'Latest Updates'}
        </h2>
      </div>

      <div style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.75rem; scrollbar-width: thin; scrollbar-color: #cbd5e0 transparent; -webkit-overflow-scrolling: touch;">
        ${latestAssets.map(asset => `
          <div style="flex: 0 0 180px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; cursor: default; transition: transform 0.18s, box-shadow 0.18s;"
               onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 6px 16px rgba(0,0,0,0.13)'"
               onmouseout="this.style.transform='';this.style.boxShadow='0 1px 4px rgba(0,0,0,0.08)'">

            <!-- Thumbnail -->
            <div style="position: relative; height: 110px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              ${asset.thumbnail_url
                ? `<img src="${asset.thumbnail_url}" alt="${asset.title || asset.original_filename}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" />`
                : (asset.file_type && (asset.file_type.includes('image') || /jpg|jpeg|png|webp/.test(asset.file_type)))
                  ? `<img src="${asset.file_url}" alt="${asset.title || asset.original_filename}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" />`
                  : `<i class="fas ${getFileIcon(asset.file_type)}" style="font-size: 2.25rem; color: ${getFileColor(asset.file_type)};"></i>`
              }
              ${asset.labels && asset.labels.length > 0 ? `
                <div style="position: absolute; bottom: 0.35rem; left: 0.35rem; display: flex; flex-direction: column; gap: 0.2rem; z-index: 5;">
                  ${asset.labels.slice(0, 2).map(label => `
                    <span style="background:${label.color};color:${label.text_color};font-size:0.58rem;font-weight:800;padding:0.12rem 0.38rem;border-radius:3px;letter-spacing:0.05em;text-transform:uppercase;box-shadow:0 1px 3px rgba(0,0,0,0.22);">${label.name}</span>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            <!-- Info -->
            <div style="padding: 0.65rem 0.75rem 0.75rem;">
              <p style="font-size: 0.78rem; font-weight: 600; color: #1a202c; margin: 0 0 0.2rem 0; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2rem;">
                ${asset.title || asset.original_filename}
              </p>
              <p style="font-size: 0.7rem; color: #718096; margin: 0 0 0.65rem 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${asset.brand_name || ''}</p>

              <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.4rem;">
                <span style="font-size: 0.68rem; color: #a0aec0; white-space: nowrap;">
                  <i class="fas fa-clock" style="margin-right: 0.15rem;"></i>${relDate(asset.created_at)}
                </span>
                <a href="${asset.file_url}" download
                   onclick="trackDownload(${asset.id})"
                   style="flex-shrink:0; display:inline-flex; align-items:center; gap:0.2rem; padding:0.28rem 0.55rem; background:#002f57; color:white; border-radius:6px; font-size:0.68rem; font-weight:700; text-decoration:none;">
                  <i class="fas fa-download"></i>
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

const renderAssets = () => {
  if (state.assets.length === 0) {
    return `
      <div class="empty-state">
        <i class="fas fa-folder-open"></i>
        <h3>${t('assets.noResults')}</h3>
        <p>${t('assets.noResultsDesc')}</p>
      </div>
    `
  }
  
  // Group assets by brand
  const assetsByBrand = {}
  state.assets.forEach(asset => {
    const brandName = asset.brand_name || 'Other'
    if (!assetsByBrand[brandName]) {
      assetsByBrand[brandName] = []
    }
    assetsByBrand[brandName].push(asset)
  })
  
  // Add download tracking listeners after rendering
  setTimeout(() => {
    document.querySelectorAll('[id^="download-asset-"]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const assetId = this.getAttribute('data-asset-id')
        if (assetId) {
          trackDownload(assetId)
        }
      })
    })
  }, 100)
  
  return Object.entries(assetsByBrand).map(([brandName, assets]) => `
    <div class="brand-section">
      <h2 class="brand-section-title">${brandName}</h2>
      <div class="assets-grid">
        ${assets.map(asset => `
          <div class="asset-card">
            <div class="asset-thumbnail" style="position: relative;">
              ${asset.thumbnail_url ? `
                <img src="${asset.thumbnail_url}" alt="${asset.title || asset.original_filename}" loading="lazy" />
              ` : asset.file_type && asset.file_type.includes('image') ? `
                <img src="${asset.file_url}" alt="${asset.title || asset.original_filename}" loading="lazy" />
              ` : `
                <i class="fas fa-file-pdf" style="font-size: 4rem; color: #dc2626;"></i>
              `}
              ${asset.labels && asset.labels.length > 0 ? `
                <div style="position: absolute; bottom: 0.5rem; left: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem; z-index: 5;">
                  ${asset.labels.map(label => `
                    <span style="display: inline-block; background-color: ${label.color}; color: ${label.text_color}; font-size: 0.65rem; font-weight: 800; padding: 0.2rem 0.55rem; border-radius: 4px; letter-spacing: 0.06em; text-transform: uppercase; box-shadow: 0 1px 3px rgba(0,0,0,0.25);">
                      ${label.name}
                    </span>
                  `).join('')}
                </div>
              ` : ''}
            </div>
            
            <div class="asset-content">
              <h3 class="asset-title">${asset.title || asset.original_filename}</h3>
              
              ${asset.description ? `
                <p class="asset-description" style="font-size: 0.875rem; color: var(--gray-600); margin: 0.5rem 0 1rem 0; line-height: 1.4; min-height: 1.5rem;">
                  ${asset.description}
                </p>
              ` : `
                <div class="asset-description-placeholder" style="min-height: 1.5rem; margin: 0.5rem 0 1rem 0;"></div>
              `}
              
              <div class="asset-actions" style="display: grid; grid-template-columns: auto 1fr 1fr; gap: 0.5rem; margin-top: auto; padding-top: 1rem;">
                <button onclick="copyAssetLink(${asset.id})" class="btn btn-icon-only" title="Copy link">
                  <i class="fas fa-link"></i>
                </button>
                <a href="${asset.file_url}" download class="btn btn-primary" id="download-asset-${asset.id}" data-asset-id="${asset.id}">
                  <i class="fas fa-download"></i>
                  ${t('assets.download')}
                </a>
                <a href="${asset.file_url}" target="_blank" class="btn btn-secondary">
                  <i class="fas fa-eye"></i>
                  ${t('assets.preview')}
                </a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('')
}

const renderFooter = () => {
  return `
    <footer class="brand-footer">
      <div class="footer-content">
        <div class="footer-left">
          <p>© ${new Date().getFullYear()} ${t('footer.copyright')}</p>
        </div>
        <div class="footer-right">
          <div class="footer-language">
            <i class="fas fa-globe"></i>
            <span>${t('footer.language')}:</span>
            <select id="footer-language-select" onchange="changeLanguage(this.value)" class="footer-language-dropdown">
              <option value="en" ${state.language === 'en' ? 'selected' : ''}>${t('languageSelector.english')}</option>
              <option value="es" ${state.language === 'es' ? 'selected' : ''}>${t('languageSelector.spanish')}</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  `
}

const renderRequestModal = () => {
  return `
    <div id="request-modal" class="request-modal">
      <div class="request-modal-overlay" onclick="closeRequestModal()"></div>
      <div class="request-modal-content">
        <button class="request-modal-close" onclick="closeRequestModal()">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="request-modal-header">
          <div class="request-modal-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <h2>${t('requestForm.modalTitle')}</h2>
          <p>${t('requestForm.modalSubtitle')}</p>
        </div>
        
        <form id="request-form" class="request-form" onsubmit="submitRequestForm(event)">
          <div class="form-group">
            <label for="request-name">
              <i class="fas fa-user"></i>
              ${t('requestForm.name')} <span class="required">*</span>
            </label>
            <input 
              type="text" 
              id="request-name" 
              name="name" 
              placeholder="${t('requestForm.namePlaceholder')}"
              required
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="request-email">
              <i class="fas fa-envelope"></i>
              ${t('requestForm.email')} <span class="required">*</span>
            </label>
            <input 
              type="email" 
              id="request-email" 
              name="email" 
              placeholder="${t('requestForm.emailPlaceholder')}"
              required
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="request-subject">
              <i class="fas fa-tag"></i>
              ${t('requestForm.subject')} <span class="required">*</span>
            </label>
            <input 
              type="text" 
              id="request-subject" 
              name="subject" 
              placeholder="${t('requestForm.subjectPlaceholder')}"
              required
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="request-message">
              <i class="fas fa-comment-alt"></i>
              ${t('requestForm.message')} <span class="required">*</span>
            </label>
            <textarea 
              id="request-message" 
              name="message" 
              rows="6" 
              placeholder="${t('requestForm.messagePlaceholder')}"
              required
              class="form-textarea"
            ></textarea>
          </div>
          
          <div class="request-form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeRequestModal()">
              ${t('requestForm.cancel')}
            </button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-paper-plane"></i>
              ${t('requestForm.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
}

const render = () => {
  const catalog = $('#catalog')
  
  catalog.innerHTML = `
    ${renderHeader()}
    
    <div class="catalog-container">
      ${renderWelcome()}
      ${renderLatestUpdates()}
      ${renderHorizontalBrandFilter()}
      
      <div class="catalog-layout">
        ${renderSidebar()}
        
        <main class="content-area">
          ${renderAssets()}
        </main>
      </div>
    </div>
    
    ${renderFooter()}
    ${renderRequestModal()}
    
    ${state.loading ? `
      <div class="loading-overlay">
        <div class="spinner"></div>
      </div>
    ` : ''}
  `
}

// ============================================
// Copy Asset Link Function
// ============================================

const copyAssetLink = (assetId) => {
  const assetUrl = `${window.location.origin}/asset/${assetId}`
  
  // Try to copy to clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(assetUrl)
      .then(() => {
        showNotification(state.language === 'ESP' ? '✅ Link copiado al portapapeles' : '✅ Link copied to clipboard', 'success')
      })
      .catch(() => {
        fallbackCopy(assetUrl)
      })
  } else {
    fallbackCopy(assetUrl)
  }
}

const fallbackCopy = (text) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-9999px'
  document.body.appendChild(textArea)
  textArea.select()
  
  try {
    document.execCommand('copy')
    showNotification(state.language === 'ESP' ? '✅ Link copiado al portapapeles' : '✅ Link copied to clipboard', 'success')
  } catch (err) {
    showNotification(state.language === 'ESP' ? '❌ Error al copiar link' : '❌ Failed to copy link', 'error')
  }
  
  document.body.removeChild(textArea)
}

// ============================================
// Analytics Tracking
// ============================================

const trackDownload = async (assetId) => {
  try {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      console.warn('No user ID found for tracking')
      return
    }
    
    await axios.post('/api/analytics/track/download', {
      assetId: parseInt(assetId),
      userId: parseInt(userId)
    })
    
    console.log('✅ Download tracked:', assetId)
  } catch (error) {
    console.error('❌ Failed to track download:', error)
  }
}

// ============================================
// User Guide Modal
// ============================================

const showUserGuide = () => {
  const modal = document.createElement('div')
  modal.id = 'user-guide-modal'
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
    padding: 2rem 1rem;
  `
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 16px; max-width: 1200px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <!-- Header -->
      <div style="padding: 2rem; border-bottom: 2px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #002f57 0%, #004080 100%);">
        <div>
          <h2 style="margin: 0; font-size: 1.75rem; font-weight: 700; color: white; display: flex; align-items: center; gap: 0.75rem;">
            <i class="fas fa-book-open"></i>
            ${t('nav.userGuide')}
          </h2>
          <p style="margin: 0.5rem 0 0 0; color: rgba(255,255,255,0.9); font-size: 0.95rem;">
            ${state.language === 'en' ? 'Video tutorials for Brand Center platform' : 'Tutoriales en vídeo para la plataforma Brand Center'}
          </p>
        </div>
        <button onclick="closeUserGuide()" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.25rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Content -->
      <div style="padding: 2rem;">
        <!-- Video Tutorials -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
          
          <!-- English Video -->
          <div style="background: #f9fafb; border-radius: 12px; overflow: hidden; border: 2px solid #e5e7eb;">
            <div style="position: relative; padding-top: 56.25%; background: #000;">
              <video 
                controls 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect fill='%23002f57' width='640' height='360'/%3E%3Ctext fill='white' font-size='24' font-family='Arial' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ETraining%3C/text%3E%3C/svg%3E">
                <source src="https://brandcenter.pbserum.com/api/files/VIDEOS/Brand Center Video ENG (1).mp4" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>
            <div style="padding: 1.5rem;">
              <h3 style="font-size: 1.125rem; font-weight: 600; color: #1f2937; margin: 0 0 0.75rem 0;">
                Brand Center Video ENG
              </h3>
              <p style="color: #6b7280; font-size: 0.9rem; line-height: 1.6; margin: 0 0 1rem 0;">
                Learn how to easily navigate the Brand Center platform in this tutorial video. Discover where to find assets, how to download official materials, and how to make the most of all available tools.
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                <span style="font-size: 0.875rem; color: #9ca3af;">29.73 MB</span>
                <a href="https://brandcenter.pbserum.com/api/files/VIDEOS/Brand Center Video ENG (1).mp4" download style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #002f57; color: white; text-decoration: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500; transition: background 0.2s;">
                  <i class="fas fa-download"></i>
                  Download
                </a>
              </div>
            </div>
          </div>
          
          <!-- Spanish Video -->
          <div style="background: #f9fafb; border-radius: 12px; overflow: hidden; border: 2px solid #e5e7eb;">
            <div style="position: relative; padding-top: 56.25%; background: #000;">
              <video 
                controls 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect fill='%23002f57' width='640' height='360'/%3E%3Ctext fill='white' font-size='24' font-family='Arial' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ETraining%3C/text%3E%3C/svg%3E">
                <source src="https://brandcenter.pbserum.com/api/files/1771429270942-Brand Center Video ESP.mp4" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>
            <div style="padding: 1.5rem;">
              <h3 style="font-size: 1.125rem; font-weight: 600; color: #1f2937; margin: 0 0 0.75rem 0;">
                Brand Center Video Guía ESP
              </h3>
              <p style="color: #6b7280; font-size: 0.9rem; line-height: 1.6; margin: 0 0 1rem 0;">
                Aprende a navegar fácilmente por la plataforma del Brand Center en este vídeo tutorial. Descubre dónde encontrar recursos de marca, cómo descargar materiales oficiales y cómo aprovechar todas las herramientas disponibles.
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                <span style="font-size: 0.875rem; color: #9ca3af;">27.9 MB</span>
                <a href="https://brandcenter.pbserum.com/api/files/1771429270942-Brand Center Video ESP.mp4" download style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #002f57; color: white; text-decoration: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500; transition: background 0.2s;">
                  <i class="fas fa-download"></i>
                  Download
                </a>
              </div>
            </div>
          </div>
          
        </div>
        
        <!-- Close Button -->
        <div style="text-align: center; padding-top: 1rem; border-top: 2px solid #e5e7eb;">
          <button onclick="closeUserGuide()" style="padding: 0.75rem 2rem; background: #002f57; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 500; transition: background 0.2s;">
            ${state.language === 'en' ? 'Close' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  `
  
  document.body.appendChild(modal)
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeUserGuide()
    }
  })
}

const closeUserGuide = () => {
  const modal = document.getElementById('user-guide-modal')
  if (modal) {
    modal.remove()
  }
}

// ============================================
// Initialize Application
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication first
  const isAuthenticated = await checkAuth()
  
  if (isAuthenticated) {
    await loadInitialData()
  }
})
