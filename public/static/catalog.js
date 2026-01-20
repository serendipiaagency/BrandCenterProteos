// ============================================
// Proteos Biotech - Public Catalog
// ============================================

// Global state
const state = {
  brands: [],
  materialTypes: [],
  assets: [],
  selectedBrand: null,
  selectedMaterialType: null,
  selectedRegion: null,
  searchQuery: '',
  loading: false,
  stats: {
    totalAssets: 0,
    totalBrands: 0
  }
}

// ============================================
// Utility Functions
// ============================================

const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => document.querySelectorAll(selector)

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const getFileIcon = (fileType) => {
  if (!fileType) return 'fa-file'
  
  if (fileType.includes('pdf')) return 'fa-file-pdf'
  if (fileType.includes('word') || fileType.includes('doc')) return 'fa-file-word'
  if (fileType.includes('excel') || fileType.includes('sheet')) return 'fa-file-excel'
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fa-file-powerpoint'
  if (fileType.includes('image') || fileType.includes('jpg') || fileType.includes('png')) return 'fa-file-image'
  if (fileType.includes('video')) return 'fa-file-video'
  if (fileType.includes('zip') || fileType.includes('rar')) return 'fa-file-zipper'
  
  return 'fa-file'
}

const getFileIconColor = (fileType) => {
  if (!fileType) return ''
  
  if (fileType.includes('pdf')) return 'pdf-icon'
  if (fileType.includes('word') || fileType.includes('doc')) return 'word-icon'
  if (fileType.includes('excel') || fileType.includes('sheet')) return 'excel-icon'
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'ppt-icon'
  if (fileType.includes('image')) return 'image-icon'
  if (fileType.includes('video')) return 'video-icon'
  if (fileType.includes('zip') || fileType.includes('rar')) return 'zip-icon'
  
  return ''
}

// ============================================
// API Functions
// ============================================

const api = {
  async getBrands() {
    const response = await axios.get('/api/public/brands')
    return response.data.brands
  },
  
  async getMaterialTypes() {
    const response = await axios.get('/api/public/material-types')
    return response.data.materialTypes
  },
  
  async getAssets(filters = {}) {
    let url = '/api/public/assets?'
    if (filters.brand_id) url += `brand_id=${filters.brand_id}&`
    if (filters.material_type_id) url += `material_type_id=${filters.material_type_id}&`
    if (filters.region) url += `region=${filters.region}&`
    if (filters.search) url += `search=${filters.search}&`
    
    const response = await axios.get(url)
    return response.data.assets
  },
  
  async getStats() {
    const response = await axios.get('/api/public/stats')
    return response.data
  }
}

// ============================================
// Data Loading
// ============================================

const loadInitialData = async () => {
  try {
    state.loading = true
    render()
    
    const [brands, materialTypes, stats] = await Promise.all([
      api.getBrands(),
      api.getMaterialTypes(),
      api.getStats()
    ])
    
    state.brands = brands
    state.materialTypes = materialTypes
    state.stats = stats
    
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
    const filters = {}
    
    if (state.selectedBrand) {
      filters.brand_id = state.selectedBrand.id
    }
    
    if (state.selectedMaterialType) {
      filters.material_type_id = state.selectedMaterialType.id
    }
    
    if (state.selectedRegion) {
      filters.region = state.selectedRegion
    }
    
    if (state.searchQuery) {
      filters.search = state.searchQuery
    }
    
    state.assets = await api.getAssets(filters)
    render()
  } catch (error) {
    console.error('Error loading assets:', error)
  }
}

// ============================================
// Actions
// ============================================

const selectBrand = async (brand) => {
  state.selectedBrand = brand
  await loadAssets()
}

const selectMaterialType = async (materialType) => {
  state.selectedMaterialType = materialType
  await loadAssets()
}

const selectRegion = async (region) => {
  state.selectedRegion = region
  await loadAssets()
}

const clearFilters = async () => {
  state.selectedBrand = null
  state.selectedMaterialType = null
  state.selectedRegion = null
  state.searchQuery = ''
  await loadAssets()
}

const handleSearch = async (e) => {
  e.preventDefault()
  state.searchQuery = $('#search-input').value
  await loadAssets()
}

// ============================================
// Rendering Functions
// ============================================

const renderHeader = () => {
  return `
    <header class="app-header">
      <div class="header-content">
        <div class="header-brand">
          <div class="header-logo">
            <i class="fas fa-cube"></i>
            <span>Proteos Biotech</span>
          </div>
          <div class="header-subtitle">Brand Materials Catalog</div>
        </div>
        
        <div class="header-user">
          <a href="/admin" class="btn-secondary" style="text-decoration: none;">
            <i class="fas fa-sign-in-alt"></i>
            Admin Login
          </a>
        </div>
      </div>
    </header>
  `
}

const renderHero = () => {
  return `
    <div style="background: linear-gradient(135deg, #0066cc 0%, #004999 100%); color: white; padding: 4rem 2rem; text-align: center;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h1 style="font-size: 3rem; font-weight: 700; margin-bottom: 1rem;">
          Welcome to Proteos Biotech Brand Center
        </h1>
        <p style="font-size: 1.25rem; opacity: 0.95; margin-bottom: 2rem;">
          Explore our comprehensive library of brand materials, marketing assets, and resources
        </p>
        
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-top: 3rem;">
          <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 2rem; border-radius: 12px;">
            <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">
              ${state.stats.totalAssets}
            </div>
            <div style="font-size: 1rem; opacity: 0.9;">
              <i class="fas fa-file-alt" style="margin-right: 0.5rem;"></i>
              Assets Available
            </div>
          </div>
          
          <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 2rem; border-radius: 12px;">
            <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">
              ${state.stats.totalBrands}
            </div>
            <div style="font-size: 1rem; opacity: 0.9;">
              <i class="fas fa-tags" style="margin-right: 0.5rem;"></i>
              Active Brands
            </div>
          </div>
          
          <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 2rem; border-radius: 12px;">
            <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">
              ${state.materialTypes.length}
            </div>
            <div style="font-size: 1rem; opacity: 0.9;">
              <i class="fas fa-layer-group" style="margin-right: 0.5rem;"></i>
              Categories
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

const renderFilters = () => {
  return `
    <div class="page-content" style="max-width: 1400px; margin: 0 auto; padding: 2rem;">
      <div style="background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--gray-900);">
          <i class="fas fa-filter" style="margin-right: 0.5rem; color: #0066cc;"></i>
          Filter Materials
        </h2>
        
        <form onsubmit="handleSearch(event)" style="margin-bottom: 1.5rem;">
          <div style="display: flex; gap: 1rem;">
            <input 
              id="search-input" 
              type="text" 
              placeholder="Search by title, description, or filename..."
              value="${state.searchQuery}"
              class="form-input"
              style="flex: 1;"
            />
            <button type="submit" class="btn-primary">
              <i class="fas fa-search"></i>
              Search
            </button>
          </div>
        </form>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
          <!-- Brands -->
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--gray-700);">
              Brand
            </label>
            <select 
              onchange="selectBrand(this.value ? JSON.parse(this.value) : null)" 
              class="form-input"
            >
              <option value="">All Brands</option>
              ${state.brands.map(brand => `
                <option value='${JSON.stringify(brand)}' ${state.selectedBrand?.id === brand.id ? 'selected' : ''}>
                  ${brand.display_name}
                </option>
              `).join('')}
            </select>
          </div>
          
          <!-- Material Types -->
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--gray-700);">
              Material Type
            </label>
            <select 
              onchange="selectMaterialType(this.value ? JSON.parse(this.value) : null)" 
              class="form-input"
            >
              <option value="">All Types</option>
              ${state.materialTypes.map(type => `
                <option value='${JSON.stringify(type)}' ${state.selectedMaterialType?.id === type.id ? 'selected' : ''}>
                  ${type.display_name}
                </option>
              `).join('')}
            </select>
          </div>
          
          <!-- Regions -->
          <div>
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--gray-700);">
              Region
            </label>
            <select 
              onchange="selectRegion(this.value || null)" 
              class="form-input"
            >
              <option value="">All Regions</option>
              <option value="GLOBAL" ${state.selectedRegion === 'GLOBAL' ? 'selected' : ''}>GLOBAL</option>
              <option value="USA" ${state.selectedRegion === 'USA' ? 'selected' : ''}>USA</option>
              <option value="LATAM" ${state.selectedRegion === 'LATAM' ? 'selected' : ''}>LATAM</option>
              <option value="EUROPA" ${state.selectedRegion === 'EUROPA' ? 'selected' : ''}>EUROPA</option>
              <option value="MENA" ${state.selectedRegion === 'MENA' ? 'selected' : ''}>MENA</option>
              <option value="ASIA" ${state.selectedRegion === 'ASIA' ? 'selected' : ''}>ASIA</option>
            </select>
          </div>
        </div>
        
        ${(state.selectedBrand || state.selectedMaterialType || state.selectedRegion || state.searchQuery) ? `
          <div style="margin-top: 1rem; text-align: right;">
            <button onclick="clearFilters()" class="btn-secondary">
              <i class="fas fa-times"></i>
              Clear All Filters
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `
}

const renderAssets = () => {
  return `
    <div class="page-content" style="max-width: 1400px; margin: 0 auto; padding: 0 2rem 4rem;">
      <h2 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--gray-900);">
        ${state.selectedBrand ? state.selectedBrand.display_name : 'All'} Materials
        <span style="font-size: 1rem; font-weight: 400; color: var(--gray-600); margin-left: 0.5rem;">
          (${state.assets.length} ${state.assets.length === 1 ? 'asset' : 'assets'})
        </span>
      </h2>
      
      ${state.assets.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-folder-open"></i>
          </div>
          <h3 class="empty-title">No materials found</h3>
          <p class="empty-description">Try adjusting your filters or search terms</p>
        </div>
      ` : `
        <div class="asset-grid">
          ${state.assets.map(asset => `
            <div class="asset-card">
              <div class="asset-thumbnail">
                <i class="fas ${getFileIcon(asset.file_type)} ${getFileIconColor(asset.file_type)}"></i>
              </div>
              
              <div class="asset-body">
                <h4 class="asset-title">${asset.title || asset.original_filename}</h4>
                
                <div style="margin-bottom: 0.75rem;">
                  <span class="badge" style="background-color: ${asset.brand_color}20; color: ${asset.brand_color}; font-size: 0.75rem;">
                    ${asset.brand_name || 'N/A'}
                  </span>
                  ${asset.material_type_name ? `
                    <span class="badge badge-info" style="font-size: 0.75rem; margin-left: 0.25rem;">
                      <i class="fas ${asset.material_type_icon}"></i>
                      ${asset.material_type_name}
                    </span>
                  ` : ''}
                </div>
                
                ${asset.description ? `
                  <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 1rem; line-height: 1.5;">
                    ${asset.description.substring(0, 100)}${asset.description.length > 100 ? '...' : ''}
                  </p>
                ` : ''}
                
                <div class="asset-meta">
                  <span><i class="fas fa-hdd" style="margin-right: 0.25rem;"></i>${formatFileSize(asset.file_size)}</span>
                  <span><i class="fas fa-calendar" style="margin-right: 0.25rem;"></i>${formatDate(asset.created_at)}</span>
                </div>
                
                ${asset.region || asset.country ? `
                  <div style="font-size: 0.75rem; color: var(--gray-600); margin-top: 0.5rem;">
                    <i class="fas fa-globe" style="margin-right: 0.25rem;"></i>
                    ${asset.region || ''} ${asset.country ? `| ${asset.country}` : ''}
                  </div>
                ` : ''}
                
                <div class="asset-actions" style="margin-top: 1rem;">
                  <a href="${asset.file_url}" download class="btn-download" style="flex: 1;">
                    <i class="fas fa-download"></i>
                    Download
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `
}

const renderFooter = () => {
  return `
    <footer style="background: var(--gray-900); color: white; padding: 3rem 2rem; margin-top: 4rem;">
      <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
        <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">
          <i class="fas fa-cube" style="margin-right: 0.5rem;"></i>
          Proteos Biotech
        </div>
        <p style="opacity: 0.8; margin-bottom: 2rem;">
          Advanced biotechnology solutions for aesthetic medicine
        </p>
        <div style="display: flex; gap: 2rem; justify-content: center; margin-bottom: 2rem;">
          <a href="/admin" style="color: white; text-decoration: none; opacity: 0.8; transition: opacity 0.3s;">
            <i class="fas fa-lock" style="margin-right: 0.5rem;"></i>
            Admin Access
          </a>
          <a href="#" style="color: white; text-decoration: none; opacity: 0.8; transition: opacity 0.3s;">
            <i class="fas fa-envelope" style="margin-right: 0.5rem;"></i>
            Contact Us
          </a>
        </div>
        <div style="opacity: 0.6; font-size: 0.875rem;">
          © ${new Date().getFullYear()} Proteos Biotech. All rights reserved.
        </div>
      </div>
    </footer>
  `
}

const render = () => {
  const catalog = $('#catalog')
  
  catalog.innerHTML = `
    ${renderHeader()}
    ${renderHero()}
    ${renderFilters()}
    ${renderAssets()}
    ${renderFooter()}
    
    ${state.loading ? `
      <div class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p style="color: var(--gray-700); font-weight: 500;">Loading...</p>
        </div>
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
