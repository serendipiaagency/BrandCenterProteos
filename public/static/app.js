// ============================================
// Brand Portal - Frontend Application
// ============================================

// Global state
const state = {
  currentUser: null,
  currentPage: 'login',
  brands: [],
  materialTypes: [],
  assets: [],
  users: [],
  selectedBrand: null,
  selectedSubBrand: null,
  selectedMaterialType: null,
  loading: false
}

// ============================================
// Utility Functions
// ============================================

const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => document.querySelectorAll(selector)

const showLoading = () => {
  state.loading = true
  render()
}

const hideLoading = () => {
  state.loading = false
  render()
}

const showNotification = (message, type = 'success') => {
  const notification = document.createElement('div')
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } z-50 animate-fade-in`
  notification.textContent = message
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.remove()
  }, 3000)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { 
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
  if (!fileType) return 'text-gray-400'
  
  if (fileType.includes('pdf')) return 'text-red-500'
  if (fileType.includes('word') || fileType.includes('doc')) return 'text-blue-500'
  if (fileType.includes('excel') || fileType.includes('sheet')) return 'text-green-500'
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'text-orange-500'
  if (fileType.includes('image')) return 'text-purple-500'
  if (fileType.includes('video')) return 'text-pink-500'
  if (fileType.includes('zip') || fileType.includes('rar')) return 'text-yellow-500'
  
  return 'text-gray-400'
}

// ============================================
// API Functions
// ============================================

const api = {
  async login(email, password) {
    const response = await axios.post('/api/auth/login', { email, password })
    return response.data
  },
  
  async getSession(userId) {
    const response = await axios.get(`/api/auth/session?userId=${userId}`)
    return response.data
  },
  
  async getBrands() {
    const response = await axios.get('/api/brands')
    return response.data.brands
  },
  
  async getSubBrands(brandId) {
    const response = await axios.get(`/api/brands/${brandId}/sub-brands`)
    return response.data.subBrands
  },
  
  async getMaterialTypes(lang = 'en') {
    const response = await axios.get(`/api/material-types?lang=${lang}`)
    return response.data.materialTypes
  },
  
  async getAssets(filters = {}) {
    let url = '/api/assets?'
    if (filters.brand_id) url += `brand_id=${filters.brand_id}&`
    if (filters.sub_brand_id) url += `sub_brand_id=${filters.sub_brand_id}&`
    if (filters.material_type_id) url += `material_type_id=${filters.material_type_id}&`
    if (filters.search) url += `search=${filters.search}&`
    
    const response = await axios.get(url)
    return response.data.assets
  },
  
  async createAsset(data) {
    const response = await axios.post('/api/assets', data)
    return response.data
  },
  
  async deleteAsset(id) {
    const response = await axios.delete(`/api/assets/${id}`)
    return response.data
  },
  
  async uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  
  async getUsers() {
    const response = await axios.get('/api/users')
    return response.data.users
  },
  
  async createUser(data) {
    const response = await axios.post('/api/users', data)
    return response.data
  },
  
  async updateUser(id, data) {
    const response = await axios.put(`/api/users/${id}`, data)
    return response.data
  },
  
  async deleteUser(id) {
    const response = await axios.delete(`/api/users/${id}`)
    return response.data
  },
  
  async getStats() {
    const response = await axios.get('/api/stats')
    return response.data
  }
}

// ============================================
// Authentication
// ============================================

const handleLogin = async (e) => {
  e.preventDefault()
  
  const email = $('#login-email').value
  const password = $('#login-password').value
  
  try {
    showLoading()
    const result = await api.login(email, password)
    
    if (result.success) {
      state.currentUser = result.user
      localStorage.setItem('userId', result.user.id)
      state.currentPage = 'dashboard'
      await loadInitialData()
      showNotification('Welcome back!', 'success')
    }
  } catch (error) {
    console.error('Login error:', error)
    showNotification('Invalid credentials', 'error')
  } finally {
    hideLoading()
  }
}

const handleLogout = () => {
  state.currentUser = null
  state.currentPage = 'login'
  localStorage.removeItem('userId')
  render()
}

const checkAuth = async () => {
  const userId = localStorage.getItem('userId')
  
  if (userId) {
    try {
      const result = await api.getSession(userId)
      state.currentUser = result.user
      state.currentPage = 'dashboard'
      await loadInitialData()
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('userId')
    }
  }
}

// ============================================
// Data Loading
// ============================================

const loadInitialData = async () => {
  try {
    showLoading()
    
    const [brands, materialTypes] = await Promise.all([
      api.getBrands(),
      api.getMaterialTypes(state.currentUser?.language === 'ESP' ? 'es' : 'en')
    ])
    
    state.brands = brands
    state.materialTypes = materialTypes
    
    // Load assets for first brand if available
    if (brands.length > 0) {
      state.selectedBrand = brands[0]
      await loadAssets()
    }
  } catch (error) {
    console.error('Error loading data:', error)
    showNotification('Error loading data', 'error')
  } finally {
    hideLoading()
  }
}

const loadAssets = async () => {
  try {
    const filters = {}
    
    if (state.selectedBrand) {
      filters.brand_id = state.selectedBrand.id
    }
    
    if (state.selectedSubBrand) {
      filters.sub_brand_id = state.selectedSubBrand.id
    }
    
    if (state.selectedMaterialType) {
      filters.material_type_id = state.selectedMaterialType.id
    }
    
    state.assets = await api.getAssets(filters)
    render()
  } catch (error) {
    console.error('Error loading assets:', error)
    showNotification('Error loading assets', 'error')
  }
}

const loadUsers = async () => {
  try {
    state.users = await api.getUsers()
    render()
  } catch (error) {
    console.error('Error loading users:', error)
    showNotification('Error loading users', 'error')
  }
}

// ============================================
// Navigation
// ============================================

const navigateTo = (page) => {
  state.currentPage = page
  
  if (page === 'users' && state.users.length === 0) {
    loadUsers()
  } else {
    render()
  }
}

const selectBrand = async (brand) => {
  state.selectedBrand = brand
  state.selectedSubBrand = null
  state.selectedMaterialType = null
  await loadAssets()
}

const selectMaterialType = async (materialType) => {
  state.selectedMaterialType = materialType
  await loadAssets()
}

// ============================================
// File Upload
// ============================================

let uploadModal = null

const openUploadModal = () => {
  uploadModal = true
  render()
}

const closeUploadModal = () => {
  uploadModal = null
  render()
}

const handleFileUpload = async (e) => {
  e.preventDefault()
  
  const fileInput = $('#upload-file')
  const file = fileInput.files[0]
  
  if (!file) {
    showNotification('Please select a file', 'error')
    return
  }
  
  try {
    showLoading()
    
    // Upload file to R2
    const uploadResult = await api.uploadFile(file)
    
    // Create asset record
    const assetData = {
      filename: uploadResult.filename,
      original_filename: file.name,
      title: $('#upload-title').value || file.name,
      description: $('#upload-description').value,
      file_type: uploadResult.fileType,
      file_size: uploadResult.fileSize,
      file_url: uploadResult.fileUrl,
      brand_id: parseInt($('#upload-brand').value),
      sub_brand_id: $('#upload-subbrand').value ? parseInt($('#upload-subbrand').value) : null,
      material_type_id: parseInt($('#upload-material-type').value),
      region: $('#upload-region').value,
      country: $('#upload-country').value,
      regulatory: $('#upload-regulatory').value,
      language: $('#upload-language').value,
      created_by: state.currentUser.id
    }
    
    await api.createAsset(assetData)
    
    showNotification('File uploaded successfully!', 'success')
    closeUploadModal()
    await loadAssets()
  } catch (error) {
    console.error('Upload error:', error)
    showNotification('Error uploading file', 'error')
  } finally {
    hideLoading()
  }
}

// ============================================
// User Management
// ============================================

let userModal = null

const openUserModal = (user = null) => {
  userModal = user || { 
    email: '', 
    name: '', 
    role: 'distributor',
    region: '',
    country: '',
    language: 'ESP',
    brands_access: [],
    active: true
  }
  render()
}

const closeUserModal = () => {
  userModal = null
  render()
}

const handleUserSubmit = async (e) => {
  e.preventDefault()
  
  const userData = {
    email: $('#user-email').value,
    name: $('#user-name').value,
    role: $('#user-role').value,
    region: $('#user-region').value,
    country: $('#user-country').value,
    language: $('#user-language').value,
    brands_access: Array.from($$('#user-brands input:checked')).map(cb => parseInt(cb.value)),
    active: $('#user-active')?.checked ?? true
  }
  
  try {
    showLoading()
    
    if (userModal.id) {
      await api.updateUser(userModal.id, userData)
      showNotification('User updated successfully!', 'success')
    } else {
      await api.createUser(userData)
      showNotification('User created successfully!', 'success')
    }
    
    closeUserModal()
    await loadUsers()
  } catch (error) {
    console.error('User save error:', error)
    showNotification('Error saving user', 'error')
  } finally {
    hideLoading()
  }
}

const handleDeleteUser = async (userId) => {
  if (!confirm('Are you sure you want to delete this user?')) return
  
  try {
    showLoading()
    await api.deleteUser(userId)
    showNotification('User deleted successfully!', 'success')
    await loadUsers()
  } catch (error) {
    console.error('Delete error:', error)
    showNotification('Error deleting user', 'error')
  } finally {
    hideLoading()
  }
}

// ============================================
// Rendering Functions
// ============================================

const renderLoginPage = () => {
  return `
    <div class="login-container flex items-center justify-center p-4">
      <div class="login-card w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Brand Portal</h1>
          <p class="text-gray-600">Proteos Biotech</p>
        </div>
        
        <form onsubmit="handleLogin(event)">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input 
              id="login-email" 
              type="email" 
              required
              value="admin@proteos.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>
          
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input 
              id="login-password" 
              type="password" 
              required
              value="admin123"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            class="w-full btn-primary text-white font-bold py-3 px-4 rounded-lg"
          >
            <i class="fas fa-sign-in-alt mr-2"></i>
            Sign In
          </button>
        </form>
        
        <div class="mt-6 text-center text-sm text-gray-600">
          <p>Demo: admin@proteos.com / admin123</p>
        </div>
      </div>
    </div>
  `
}

const renderHeader = () => {
  return `
    <header class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl font-bold text-gray-800">
              <i class="fas fa-cube text-blue-500 mr-2"></i>
              Brand Portal
            </h1>
            <span class="text-sm text-gray-500">Proteos Biotech</span>
          </div>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">
              <i class="fas fa-user-circle mr-2"></i>
              ${state.currentUser.name} (${state.currentUser.role})
            </span>
            <button 
              onclick="handleLogout()"
              class="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <i class="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  `
}

const renderSidebar = () => {
  return `
    <aside class="w-64 bg-white shadow-lg h-screen sticky top-0 overflow-y-auto">
      <nav class="p-4">
        <div class="mb-6">
          <h2 class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Navigation</h2>
          
          <button 
            onclick="navigateTo('dashboard')"
            class="sidebar-item w-full text-left px-4 py-3 rounded-lg mb-1 ${state.currentPage === 'dashboard' ? 'active' : ''}"
          >
            <i class="fas fa-home mr-3"></i>
            Dashboard
          </button>
          
          <button 
            onclick="navigateTo('assets')"
            class="sidebar-item w-full text-left px-4 py-3 rounded-lg mb-1 ${state.currentPage === 'assets' ? 'active' : ''}"
          >
            <i class="fas fa-folder-open mr-3"></i>
            Assets
          </button>
          
          ${state.currentUser.role === 'admin' ? `
            <button 
              onclick="navigateTo('users')"
              class="sidebar-item w-full text-left px-4 py-3 rounded-lg mb-1 ${state.currentPage === 'users' ? 'active' : ''}"
            >
              <i class="fas fa-users mr-3"></i>
              Users
            </button>
          ` : ''}
        </div>
        
        <div class="mb-6">
          <h2 class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Brands</h2>
          ${state.brands.map(brand => `
            <button 
              onclick="selectBrand(${JSON.stringify(brand).replace(/"/g, '&quot;')})"
              class="sidebar-item w-full text-left px-4 py-3 rounded-lg mb-1 ${state.selectedBrand?.id === brand.id ? 'active' : ''}"
            >
              <i class="fas fa-tag mr-3" style="color: ${brand.color}"></i>
              ${brand.display_name}
            </button>
          `).join('')}
        </div>
        
        <div class="mb-6">
          <h2 class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Material Types</h2>
          ${state.materialTypes.slice(0, 8).map(type => `
            <button 
              onclick="selectMaterialType(${JSON.stringify(type).replace(/"/g, '&quot;')})"
              class="sidebar-item w-full text-left px-4 py-2 rounded-lg mb-1 text-sm ${state.selectedMaterialType?.id === type.id ? 'active' : ''}"
            >
              <i class="fas ${type.icon} mr-2"></i>
              ${type.display_name}
            </button>
          `).join('')}
        </div>
      </nav>
    </aside>
  `
}

const renderDashboard = () => {
  return `
    <div class="p-8">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Welcome back, ${state.currentUser.name}!</h2>
        <p class="text-gray-600">Manage your brand assets and materials</p>
      </div>
      
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">Total Assets</p>
              <p class="text-3xl font-bold text-gray-800">${state.assets.length}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i class="fas fa-file-alt text-2xl text-blue-500"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">Brands</p>
              <p class="text-3xl font-bold text-gray-800">${state.brands.length}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <i class="fas fa-tags text-2xl text-purple-500"></i>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-md p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">Material Types</p>
              <p class="text-3xl font-bold text-gray-800">${state.materialTypes.length}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i class="fas fa-layer-group text-2xl text-green-500"></i>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Brands Grid -->
      <div class="mb-8">
        <h3 class="text-2xl font-bold text-gray-800 mb-4">Our Brands</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${state.brands.map(brand => `
            <div 
              class="brand-card bg-white rounded-xl shadow-md p-6 cursor-pointer"
              onclick="selectBrand(${JSON.stringify(brand).replace(/"/g, '&quot;')}); navigateTo('assets')"
            >
              <div class="w-16 h-16 rounded-full mb-4 flex items-center justify-center" style="background-color: ${brand.color}20">
                <i class="fas fa-cube text-3xl" style="color: ${brand.color}"></i>
              </div>
              <h4 class="text-xl font-bold text-gray-800 mb-2">${brand.display_name}</h4>
              <p class="text-sm text-gray-600">${brand.description || 'Brand materials'}</p>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- Material Types -->
      <div>
        <h3 class="text-2xl font-bold text-gray-800 mb-4">Material Categories</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          ${state.materialTypes.map(type => `
            <button 
              onclick="selectMaterialType(${JSON.stringify(type).replace(/"/g, '&quot;')}); navigateTo('assets')"
              class="bg-white rounded-lg shadow p-4 hover:shadow-lg transition text-center"
            >
              <i class="fas ${type.icon} text-3xl text-blue-500 mb-2"></i>
              <p class="text-sm font-medium text-gray-800">${type.display_name}</p>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `
}

const renderAssetsPage = () => {
  return `
    <div class="p-8">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Assets Library</h2>
          <p class="text-gray-600">
            ${state.selectedBrand ? `Brand: ${state.selectedBrand.display_name}` : 'All brands'}
            ${state.selectedMaterialType ? ` | ${state.selectedMaterialType.display_name}` : ''}
          </p>
        </div>
        
        ${state.currentUser.role === 'admin' || state.currentUser.role === 'marketing' ? `
          <button 
            onclick="openUploadModal()"
            class="btn-primary text-white px-6 py-3 rounded-lg font-bold"
          >
            <i class="fas fa-upload mr-2"></i>
            Upload Asset
          </button>
        ` : ''}
      </div>
      
      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex-1 min-w-[200px]">
            <input 
              type="text" 
              placeholder="Search assets..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            <i class="fas fa-filter mr-2"></i>
            Filters
          </button>
        </div>
      </div>
      
      <!-- Assets Grid -->
      ${state.assets.length === 0 ? `
        <div class="text-center py-20">
          <i class="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
          <p class="text-xl text-gray-500">No assets found</p>
          <p class="text-sm text-gray-400 mt-2">Upload your first asset to get started</p>
        </div>
      ` : `
        <div class="asset-grid">
          ${state.assets.map(asset => `
            <div class="asset-item bg-white rounded-lg shadow-md overflow-hidden">
              <div class="h-40 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <i class="fas ${getFileIcon(asset.file_type)} ${getFileIconColor(asset.file_type)} text-6xl"></i>
              </div>
              
              <div class="p-4">
                <h4 class="font-bold text-gray-800 mb-2 truncate">${asset.title || asset.original_filename}</h4>
                <p class="text-xs text-gray-500 mb-3">
                  ${asset.brand_name || 'N/A'} 
                  ${asset.sub_brand_name ? `| ${asset.sub_brand_name}` : ''}
                </p>
                
                <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>${formatFileSize(asset.file_size)}</span>
                  <span>${formatDate(asset.created_at)}</span>
                </div>
                
                <div class="flex gap-2">
                  <a 
                    href="${asset.file_url}" 
                    download
                    class="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded text-center"
                  >
                    <i class="fas fa-download mr-1"></i>
                    Download
                  </a>
                  
                  ${state.currentUser.role === 'admin' ? `
                    <button 
                      onclick="handleDeleteAsset(${asset.id})"
                      class="bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `
}

const handleDeleteAsset = async (assetId) => {
  if (!confirm('Are you sure you want to delete this asset?')) return
  
  try {
    showLoading()
    await api.deleteAsset(assetId)
    showNotification('Asset deleted successfully!', 'success')
    await loadAssets()
  } catch (error) {
    console.error('Delete error:', error)
    showNotification('Error deleting asset', 'error')
  } finally {
    hideLoading()
  }
}

// Continue in next part...

const renderUsersPage = () => {
  return `
    <div class="p-8">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">User Management</h2>
          <p class="text-gray-600">Manage user accounts and permissions</p>
        </div>
        
        <button 
          onclick="openUserModal()"
          class="btn-primary text-white px-6 py-3 rounded-lg font-bold"
        >
          <i class="fas fa-user-plus mr-2"></i>
          Add User
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${state.users.map(user => `
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <i class="fas fa-user text-blue-500"></i>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">${user.name}</div>
                      <div class="text-sm text-gray-500">${user.email}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                      user.role === 'marketing' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'distributor' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'}">
                    ${user.role}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${user.region || 'N/A'} ${user.country ? `| ${user.country}` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${formatDate(user.last_login)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${user.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onclick='openUserModal(${JSON.stringify(user).replace(/"/g, '&quot;')})'
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    onclick="handleDeleteUser(${user.id})"
                    class="text-red-600 hover:text-red-900"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

const renderUploadModal = () => {
  if (!uploadModal) return ''
  
  return `
    <div class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-2xl font-bold text-gray-800">Upload Asset</h3>
            <button onclick="closeUploadModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-2xl"></i>
            </button>
          </div>
        </div>
        
        <form onsubmit="handleFileUpload(event)" class="p-6">
          <div class="mb-6">
            <label class="block text-sm font-bold text-gray-700 mb-2">File</label>
            <div class="file-upload-zone p-8 rounded-lg text-center">
              <i class="fas fa-cloud-upload-alt text-5xl text-gray-400 mb-4"></i>
              <p class="text-gray-600 mb-2">Drop your file here or click to browse</p>
              <input 
                id="upload-file" 
                type="file" 
                required
                class="w-full"
              />
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-2">Title</label>
            <input 
              id="upload-title" 
              type="text" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Asset title"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea 
              id="upload-description" 
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Asset description"
            ></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Brand *</label>
              <select id="upload-brand" required class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">Select brand</option>
                ${state.brands.map(brand => `<option value="${brand.id}">${brand.display_name}</option>`).join('')}
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Sub-brand</label>
              <select id="upload-subbrand" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">None</option>
              </select>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-2">Material Type *</label>
            <select id="upload-material-type" required class="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="">Select material type</option>
              ${state.materialTypes.map(type => `<option value="${type.id}">${type.display_name}</option>`).join('')}
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Region</label>
              <select id="upload-region" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">Select region</option>
                <option value="GLOBAL">GLOBAL</option>
                <option value="USA">USA</option>
                <option value="LATAM">LATAM</option>
                <option value="EUROPA">EUROPA</option>
                <option value="MENA">MENA</option>
                <option value="ASIA">ASIA</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Country</label>
              <input id="upload-country" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Country" />
            </div>
            
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Regulatory</label>
              <select id="upload-regulatory" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="GLOBAL">GLOBAL</option>
                <option value="EU">EU</option>
                <option value="NON-EU">NON-EU</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Language</label>
              <select id="upload-language" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="ESP">Español</option>
                <option value="ING">English</option>
                <option value="BRA">Português</option>
                <option value="RUS">Русский</option>
              </select>
            </div>
          </div>
          
          <div class="flex justify-end gap-3">
            <button type="button" onclick="closeUploadModal()" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" class="btn-primary text-white px-6 py-2 rounded-lg">
              <i class="fas fa-upload mr-2"></i>
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  `
}

const renderUserModal = () => {
  if (!userModal) return ''
  
  return `
    <div class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-2xl font-bold text-gray-800">${userModal.id ? 'Edit User' : 'Add User'}</h3>
            <button onclick="closeUserModal()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-2xl"></i></button>
          </div>
        </div>
        
        <form onsubmit="handleUserSubmit(event)" class="p-6">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Email *</label>
              <input id="user-email" type="email" required value="${userModal.email || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Name *</label>
              <input id="user-name" type="text" required value="${userModal.name || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Role *</label>
              <select id="user-role" required class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="admin" ${userModal.role === 'admin' ? 'selected' : ''}>Admin</option>
                <option value="marketing" ${userModal.role === 'marketing' ? 'selected' : ''}>Marketing</option>
                <option value="distributor" ${userModal.role === 'distributor' ? 'selected' : ''}>Distributor</option>
                <option value="agency" ${userModal.role === 'agency' ? 'selected' : ''}>Agency</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Language</label>
              <select id="user-language" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="ESP" ${userModal.language === 'ESP' ? 'selected' : ''}>Español</option>
                <option value="ING" ${userModal.language === 'ING' ? 'selected' : ''}>English</option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Region</label>
              <input id="user-region" type="text" value="${userModal.region || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Country</label>
              <input id="user-country" type="text" value="${userModal.country || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-2">Brand Access</label>
            <div id="user-brands" class="grid grid-cols-2 gap-2">
              ${state.brands.map(brand => `
                <label class="flex items-center space-x-2">
                  <input type="checkbox" value="${brand.id}" ${userModal.brands_access?.includes(brand.id) ? 'checked' : ''} class="rounded text-blue-500" />
                  <span class="text-sm">${brand.display_name}</span>
                </label>
              `).join('')}
            </div>
          </div>
          
          ${userModal.id ? `
            <div class="mb-4">
              <label class="flex items-center space-x-2">
                <input id="user-active" type="checkbox" ${userModal.active ? 'checked' : ''} class="rounded text-blue-500" />
                <span class="text-sm font-bold text-gray-700">Active</span>
              </label>
            </div>
          ` : ''}
          
          <div class="flex justify-end gap-3">
            <button type="button" onclick="closeUserModal()" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" class="btn-primary text-white px-6 py-2 rounded-lg">
              <i class="fas fa-save mr-2"></i>${userModal.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
}

const render = () => {
  const app = $('#app')
  
  if (state.currentPage === 'login') {
    app.innerHTML = renderLoginPage()
    return
  }
  
  let pageContent = ''
  
  switch (state.currentPage) {
    case 'dashboard':
      pageContent = renderDashboard()
      break
    case 'assets':
      pageContent = renderAssetsPage()
      break
    case 'users':
      pageContent = renderUsersPage()
      break
  }
  
  app.innerHTML = `
    ${renderHeader()}
    <div class="flex">
      ${renderSidebar()}
      <main class="flex-1 overflow-y-auto bg-gray-50">
        ${pageContent}
        ${renderUploadModal()}
        ${renderUserModal()}
      </main>
    </div>
    
    ${state.loading ? `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-8 rounded-xl shadow-2xl text-center">
          <div class="spinner mx-auto mb-4"></div>
          <p class="text-gray-700">Loading...</p>
        </div>
      </div>
    ` : ''}
  `
}

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth()
  render()
})
// ============================================
// RENDERING FUNCTIONS - CORPORATE DESIGN
// ============================================

const renderLoginPage = () => {
  return `
    <div class="login-page">
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <div class="login-logo-placeholder" style="text-align: center; margin-bottom: 1.5rem;">
              <i class="fas fa-cube" style="font-size: 4rem; color: #0066cc;"></i>
            </div>
            <h1 class="login-title">Brand Portal</h1>
            <p class="login-subtitle">Proteos Biotech Asset Management</p>
          </div>
          
          <form onsubmit="handleLogin(event)">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input 
                id="login-email" 
                type="email" 
                required
                value="admin@proteos.com"
                class="form-input"
                placeholder="your@email.com"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Password</label>
              <input 
                id="login-password" 
                type="password" 
                required
                value="admin123"
                class="form-input"
                placeholder="••••••••"
              />
            </div>
            
            <button type="submit" class="btn-login">
              <i class="fas fa-sign-in-alt"></i>
              Sign In
            </button>
          </form>
          
          <div class="login-footer">
            <p>Demo credentials provided above</p>
          </div>
        </div>
      </div>
    </div>
  `
}

const renderHeader = () => {
  return `
    <header class="app-header">
      <div class="header-content">
        <div class="header-brand">
          <div class="header-logo">
            <i class="fas fa-cube"></i>
            <span>Brand Portal</span>
          </div>
          <div class="header-subtitle">Proteos Biotech</div>
        </div>
        
        <div class="header-user">
          <div class="user-info">
            <div class="user-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-details">
              <span class="user-name">${state.currentUser.name}</span>
              <span class="user-role">${state.currentUser.role}</span>
            </div>
          </div>
          
          <button onclick="handleLogout()" class="btn-logout">
            <i class="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>
    </header>
  `
}

const renderSidebar = () => {
  return `
    <aside class="app-sidebar">
      <div class="sidebar-section">
        <h3 class="sidebar-title">Navigation</h3>
        <ul class="sidebar-menu">
          <li class="sidebar-item">
            <a href="#" onclick="navigateTo('dashboard'); return false;" class="sidebar-link ${state.currentPage === 'dashboard' ? 'active' : ''}">
              <i class="fas fa-home"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a href="#" onclick="navigateTo('assets'); return false;" class="sidebar-link ${state.currentPage === 'assets' ? 'active' : ''}">
              <i class="fas fa-folder-open"></i>
              <span>Assets Library</span>
            </a>
          </li>
          ${state.currentUser.role === 'admin' ? `
            <li class="sidebar-item">
              <a href="#" onclick="navigateTo('users'); return false;" class="sidebar-link ${state.currentPage === 'users' ? 'active' : ''}">
                <i class="fas fa-users"></i>
                <span>Users</span>
              </a>
            </li>
          ` : ''}
        </ul>
      </div>
      
      <div class="sidebar-section">
        <h3 class="sidebar-title">Brands</h3>
        <ul class="sidebar-menu">
          ${state.brands.map(brand => `
            <li class="sidebar-item">
              <a href="#" onclick='selectBrand(${JSON.stringify(brand).replace(/"/g, '&quot;')}); return false;' class="sidebar-link ${state.selectedBrand?.id === brand.id ? 'active' : ''}">
                <span class="brand-badge" style="background-color: ${brand.color}"></span>
                <span>${brand.display_name}</span>
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
      
      <div class="sidebar-section">
        <h3 class="sidebar-title">Categories</h3>
        <ul class="sidebar-menu">
          ${state.materialTypes.slice(0, 8).map(type => `
            <li class="sidebar-item">
              <a href="#" onclick='selectMaterialType(${JSON.stringify(type).replace(/"/g, '&quot;')}); return false;' class="sidebar-link ${state.selectedMaterialType?.id === type.id ? 'active' : ''}">
                <i class="fas ${type.icon}"></i>
                <span>${type.display_name}</span>
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    </aside>
  `
}

const renderDashboard = () => {
  return `
    <div class="page-header">
      <h1 class="page-title">Welcome back, ${state.currentUser.name}!</h1>
      <p class="page-subtitle">Manage your brand assets and materials</p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-label">Total Assets</div>
            <div class="stat-value">${state.assets.length}</div>
          </div>
          <div class="stat-icon blue">
            <i class="fas fa-file-alt"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-label">Brands</div>
            <div class="stat-value">${state.brands.length}</div>
          </div>
          <div class="stat-icon purple">
            <i class="fas fa-tags"></i>
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-header">
          <div>
            <div class="stat-label">Categories</div>
            <div class="stat-value">${state.materialTypes.length}</div>
          </div>
          <div class="stat-icon green">
            <i class="fas fa-layer-group"></i>
          </div>
        </div>
      </div>
    </div>
    
    <div style="margin-bottom: 3rem;">
      <h2 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--gray-900);">Our Brands</h2>
      <div class="brand-grid">
        ${state.brands.map(brand => `
          <div class="brand-card" style="--brand-color: ${brand.color}" onclick="selectBrand(${JSON.stringify(brand).replace(/"/g, '&quot;')}); navigateTo('assets')">
            <div class="brand-icon" style="background-color: ${brand.color}">
              <i class="fas fa-cube"></i>
            </div>
            <h3 class="brand-name">${brand.display_name}</h3>
            <p class="brand-description">${brand.description || 'Brand materials and assets'}</p>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div>
      <h2 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--gray-900);">Material Categories</h2>
      <div class="material-grid">
        ${state.materialTypes.map(type => `
          <div class="material-card" onclick="selectMaterialType(${JSON.stringify(type).replace(/"/g, '&quot;')}); navigateTo('assets')">
            <div class="material-icon">
              <i class="fas ${type.icon}"></i>
            </div>
            <div class="material-name">${type.display_name}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

const renderAssetsPage = () => {
  return `
    <div class="page-header">
      <h1 class="page-title">Assets Library</h1>
      <p class="page-subtitle">
        ${state.selectedBrand ? `Brand: ${state.selectedBrand.display_name}` : 'All brands'}
        ${state.selectedMaterialType ? ` | ${state.selectedMaterialType.display_name}` : ''}
      </p>
      
      ${state.currentUser.role === 'admin' || state.currentUser.role === 'marketing' ? `
        <div class="page-actions">
          <button onclick="openUploadModal()" class="btn-primary">
            <i class="fas fa-upload"></i>
            Upload Asset
          </button>
        </div>
      ` : ''}
    </div>
    
    ${state.assets.length === 0 ? `
      <div class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-folder-open"></i>
        </div>
        <h3 class="empty-title">No assets found</h3>
        <p class="empty-description">Upload your first asset to get started</p>
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
              
              <div class="asset-meta">
                <span>${formatFileSize(asset.file_size)}</span>
                <span>${formatDate(asset.created_at)}</span>
              </div>
              
              <div style="font-size: 0.75rem; color: var(--gray-700); margin-bottom: 1rem;">
                <div>${asset.brand_name || 'N/A'}</div>
                ${asset.sub_brand_name ? `<div>${asset.sub_brand_name}</div>` : ''}
              </div>
              
              <div class="asset-actions">
                <a href="${asset.file_url}" download class="btn-download">
                  <i class="fas fa-download"></i>
                  Download
                </a>
                ${state.currentUser.role === 'admin' ? `
                  <button onclick="handleDeleteAsset(${asset.id})" style="background: #dc2626; color: white; border: none; padding: 0.625rem; border-radius: 8px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `
}


// Actualizar función render principal
const renderMain = () => {
  const app = $('#app')
  
  if (state.currentPage === 'login') {
    app.innerHTML = renderLoginPage()
    return
  }
  
  let pageContent = ''
  
  switch (state.currentPage) {
    case 'dashboard':
      pageContent = renderDashboard()
      break
    case 'assets':
      pageContent = renderAssetsPage()
      break
    case 'users':
      pageContent = renderUsersPage()
      break
  }
  
  app.innerHTML = `
    <div class="app-wrapper">
      ${renderHeader()}
      <div class="app-main">
        ${renderSidebar()}
        <main class="app-content">
          ${pageContent}
          ${renderUploadModal()}
          ${renderUserModal()}
        </main>
      </div>
    </div>
    
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

// Override render function
window.render = renderMain

