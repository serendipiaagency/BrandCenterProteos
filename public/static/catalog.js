// ============================================
// Proteos Biotech - Public Catalog
// Design based on: https://coworkingdf.com/ProteosBrandCenter/
// ============================================

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
      brandArchitecture: 'Brand Architecture',
      brandGuidelines: 'Brand Guidelines',
      creativeServices: 'Creative Services',
      search: 'Search',
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
      brandArchitecture: 'Arquitectura de Marca',
      brandGuidelines: 'Guías de Marca',
      creativeServices: 'Servicios Creativos',
      search: 'Buscar',
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
  async getBrands() {
    const response = await axios.get('/api/public/brands')
    return response.data.brands
  },
  
  async getSubBrands(brandId) {
    const response = await axios.get(`/api/brands/${brandId}/sub-brands`)
    return response.data.subBrands || []
  },
  
  async getMaterialTypes() {
    const response = await axios.get('/api/public/material-types')
    return response.data.materialTypes
  },
  
  async getAssets(filters = {}) {
    let url = '/api/public/assets?'
    if (filters.brand_id) url += `brand_id=${filters.brand_id}&`
    if (filters.material_type_id) url += `material_type_id=${filters.material_type_id}&`
    
    const response = await axios.get(url)
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
    if (state.selectedBrands.length === 0 && state.selectedMaterialTypes.length === 0) {
      state.assets = await api.getAssets()
    } else {
      const allAssets = []
      
      if (state.selectedBrands.length > 0) {
        for (const brandId of state.selectedBrands) {
          const assets = await api.getAssets({ brand_id: brandId })
          allAssets.push(...assets)
        }
      }
      
      if (state.selectedMaterialTypes.length > 0 && state.selectedBrands.length === 0) {
        for (const typeId of state.selectedMaterialTypes) {
          const assets = await api.getAssets({ material_type_id: typeId })
          allAssets.push(...assets)
        }
      } else if (state.selectedMaterialTypes.length > 0) {
        const filtered = allAssets.filter(asset => 
          state.selectedMaterialTypes.includes(asset.material_type_id)
        )
        state.assets = filtered
        render()
        return
      }
      
      // Remove duplicates
      const uniqueAssets = allAssets.filter((asset, index, self) =>
        index === self.findIndex((a) => a.id === asset.id)
      )
      
      state.assets = uniqueAssets
    }
    
    render()
  } catch (error) {
    console.error('Error loading assets:', error)
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
          ${t('requestForm.headerText')} 
          <strong><a href="#" onclick="openRequestModal(); return false;" class="request-link">${t('requestForm.headerLink')}</a></strong>
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
          <a href="#">${t('nav.brandArchitecture')}</a>
          <a href="#">${t('nav.brandGuidelines')}</a>
          <a href="#">${t('nav.creativeServices')}</a>
          <a href="#">${t('nav.search')}</a>
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
  // Group sub-brands by parent brand
  const brandGroups = state.brands.map(brand => ({
    ...brand,
    subBrands: state.subBrands.filter(sb => sb.parent_brand_id === brand.id)
  }))
  
  return `
    <aside class="sidebar">
      <!-- Product Lines Filter -->
      <div id="brands-filter" class="filter-section expanded">
        <button class="filter-header" onclick="toggleFilterSection('brands-filter')">
          <div class="filter-header-left">
            <i class="fas fa-tag filter-icon"></i>
            <h3 class="filter-title">${t('filters.productLines')}</h3>
            ${state.selectedBrands.length > 0 ? `<span class="filter-badge">${state.selectedBrands.length}</span>` : ''}
          </div>
          <i id="brands-filter-icon" class="fas fa-chevron-down filter-toggle" style="transform: rotate(180deg);"></i>
        </button>
        
        <div id="brands-filter-content" class="filter-content" style="max-height: 1000px;">
          <ul class="filter-list">
            ${brandGroups.map(brand => `
              ${brand.subBrands.length > 0 ? `
                ${brand.subBrands.map(subBrand => `
                  <li class="filter-item">
                    <label class="filter-checkbox">
                      <input 
                        type="checkbox" 
                        value="${brand.id}"
                        ${state.selectedBrands.includes(brand.id) ? 'checked' : ''}
                        onchange="toggleBrandFilter(${brand.id})"
                      />
                      <span class="checkbox-custom"></span>
                      <span class="checkbox-label">${subBrand.display_name}</span>
                    </label>
                  </li>
                `).join('')}
              ` : `
                <li class="filter-item">
                  <label class="filter-checkbox">
                    <input 
                      type="checkbox" 
                      value="${brand.id}"
                      ${state.selectedBrands.includes(brand.id) ? 'checked' : ''}
                      onchange="toggleBrandFilter(${brand.id})"
                    />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-label">${brand.display_name}</span>
                  </label>
                </li>
              `}
            `).join('')}
          </ul>
          
          ${state.selectedBrands.length > 0 ? `
            <button class="clear-filters-btn" onclick="clearBrandFilters()">
              <i class="fas fa-times"></i> ${t('filters.clearAll')}
            </button>
          ` : ''}
        </div>
      </div>
      
      <!-- Assets Category Filter -->
      <div id="category-filter" class="filter-section expanded">
        <button class="filter-header" onclick="toggleFilterSection('category-filter')">
          <div class="filter-header-left">
            <i class="fas fa-folder-open filter-icon"></i>
            <h3 class="filter-title">${t('filters.assetsCategory')}</h3>
            ${state.selectedMaterialTypes.length > 0 ? `<span class="filter-badge">${state.selectedMaterialTypes.length}</span>` : ''}
          </div>
          <i id="category-filter-icon" class="fas fa-chevron-down filter-toggle" style="transform: rotate(180deg);"></i>
        </button>
        
        <div id="category-filter-content" class="filter-content" style="max-height: 1000px;">
          <ul class="filter-list">
            ${state.materialTypes.map(type => {
              // Use translated display name based on language
              const displayName = state.language === 'es' && type.display_name_es 
                ? type.display_name_es 
                : type.display_name;
              
              return `
                <li class="filter-item">
                  <label class="filter-checkbox">
                    <input 
                      type="checkbox" 
                      value="${type.id}"
                      ${state.selectedMaterialTypes.includes(type.id) ? 'checked' : ''}
                      onchange="toggleMaterialTypeFilter(${type.id})"
                    />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-label">${displayName}</span>
                  </label>
                </li>
              `
            }).join('')}
          </ul>
          
          ${state.selectedMaterialTypes.length > 0 ? `
            <button class="clear-filters-btn" onclick="clearCategoryFilters()">
              <i class="fas fa-times"></i> ${t('filters.clearAll')}
            </button>
          ` : ''}
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
  
  return Object.entries(assetsByBrand).map(([brandName, assets]) => `
    <div class="brand-section">
      <h2 class="brand-section-title">${brandName}</h2>
      <div class="assets-grid">
        ${assets.map(asset => `
          <div class="asset-card">
            <div class="asset-thumbnail">
              ${asset.file_type && asset.file_type.includes('image') ? `
                <img src="${asset.file_url}" alt="${asset.title || asset.original_filename}" />
              ` : `
                <i class="fas fa-file-pdf" style="font-size: 4rem; color: #dc2626;"></i>
              `}
            </div>
            
            <div class="asset-content">
              <h3 class="asset-title">${asset.title || asset.original_filename}</h3>
              
              <div class="asset-actions">
                <a href="${asset.file_url}" download class="btn btn-primary">
                  ${t('assets.download')}
                </a>
                <a href="${asset.file_url}" target="_blank" class="btn btn-secondary">
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
// Initialize Application
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  await loadInitialData()
})
