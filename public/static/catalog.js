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
      title: 'Welcome to our Brand Portal',
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
          <a href="#" class="active">${t('nav.assetsLibrary')}</a>
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
            <div class="asset-thumbnail">
              ${asset.thumbnail_url ? `
                <img src="${asset.thumbnail_url}" alt="${asset.title || asset.original_filename}" loading="lazy" />
              ` : asset.file_type && asset.file_type.includes('image') ? `
                <img src="${asset.file_url}" alt="${asset.title || asset.original_filename}" loading="lazy" />
              ` : `
                <i class="fas fa-file-pdf" style="font-size: 4rem; color: #dc2626;"></i>
              `}
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
// Initialize Application
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication first
  const isAuthenticated = await checkAuth()
  
  if (isAuthenticated) {
    await loadInitialData()
  }
})
