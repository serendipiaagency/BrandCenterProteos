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
  loading: false
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
// Rendering Functions
// ============================================

const renderHeader = () => {
  return `
    <header class="brand-header">
      <div class="header-top">
        <div class="header-top-left">
          Need something specific? <strong>Fill the form</strong>
        </div>
        <div class="header-top-right">
          <span>English</span>
        </div>
      </div>
      
      <div class="header-main">
        <a href="/" class="brand-logo">
          <i class="fas fa-cube" style="font-size: 2rem;"></i>
          <span>PROTEOS BIOTECH</span>
        </a>
        
        <nav class="main-nav">
          <a href="#" class="active">Assets Library</a>
          <a href="#">Brand Architecture</a>
          <a href="#">Brand Guidelines</a>
          <a href="#">Creative Services</a>
          <a href="#">Search</a>
          <a href="/admin">Salir</a>
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
            <h3 class="filter-title">Product Lines</h3>
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
              <i class="fas fa-times"></i> Clear all
            </button>
          ` : ''}
        </div>
      </div>
      
      <!-- Assets Category Filter -->
      <div id="category-filter" class="filter-section expanded">
        <button class="filter-header" onclick="toggleFilterSection('category-filter')">
          <div class="filter-header-left">
            <i class="fas fa-folder-open filter-icon"></i>
            <h3 class="filter-title">Assets Category</h3>
            ${state.selectedMaterialTypes.length > 0 ? `<span class="filter-badge">${state.selectedMaterialTypes.length}</span>` : ''}
          </div>
          <i id="category-filter-icon" class="fas fa-chevron-down filter-toggle" style="transform: rotate(180deg);"></i>
        </button>
        
        <div id="category-filter-content" class="filter-content" style="max-height: 1000px;">
          <ul class="filter-list">
            ${state.materialTypes.map(type => `
              <li class="filter-item">
                <label class="filter-checkbox">
                  <input 
                    type="checkbox" 
                    value="${type.id}"
                    ${state.selectedMaterialTypes.includes(type.id) ? 'checked' : ''}
                    onchange="toggleMaterialTypeFilter(${type.id})"
                  />
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-label">${type.display_name}</span>
                </label>
              </li>
            `).join('')}
          </ul>
          
          ${state.selectedMaterialTypes.length > 0 ? `
            <button class="clear-filters-btn" onclick="clearCategoryFilters()">
              <i class="fas fa-times"></i> Clear all
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
      <h1 class="welcome-title">Welcome to our Brand Portal</h1>
      <p class="welcome-subtitle">Find all the files, templates and resources you need.</p>
    </div>
  `
}

const renderAssets = () => {
  if (state.assets.length === 0) {
    return `
      <div class="empty-state">
        <i class="fas fa-folder-open"></i>
        <h3>No assets found</h3>
        <p>Try adjusting your filters</p>
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
                  Download
                </a>
                <a href="${asset.file_url}" target="_blank" class="btn btn-secondary">
                  Preview
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
        <p>Copyright ${new Date().getFullYear()} - Proteos Biotech - Brand Center</p>
      </div>
    </footer>
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
