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
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    z-index: 1000;
    font-weight: 500;
  `
  notification.textContent = message
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.remove()
  }, 3000)
}

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
    const response = await axios.get(`/api/users?currentUserId=${state.currentUser.id}`)
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
  
  async getUserPassword(userId) {
    const response = await axios.get(`/api/users/${userId}/password`)
    return response.data
  },
  
  async updateUserPassword(userId, newPassword) {
    const response = await axios.put(`/api/users/${userId}/password`, { new_password: newPassword })
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
let passwordModal = null

const openUserModal = (user = null) => {
  userModal = user || { 
    email: '', 
    name: '', 
    role: 'distributor',
    region: '',
    country: '',
    distributor: '',
    language: 'ENG',
    brands_access: [],
    active: true
  }
  render()
}

const closeUserModal = () => {
  userModal = null
  render()
}

const openPasswordModal = async (userId) => {
  try {
    const result = await api.getUserPassword(userId)
    passwordModal = {
      userId,
      currentPassword: result.password
    }
    render()
  } catch (error) {
    console.error('Error loading password:', error)
    showNotification('Error loading password', 'error')
  }
}

const closePasswordModal = () => {
  passwordModal = null
  render()
}

const handlePasswordChange = async (e) => {
  e.preventDefault()
  
  const newPassword = $('#new-password').value
  
  try {
    showLoading()
    await api.updateUserPassword(passwordModal.userId, newPassword)
    showNotification('Password updated successfully!', 'success')
    closePasswordModal()
  } catch (error) {
    console.error('Password update error:', error)
    showNotification('Error updating password', 'error')
  } finally {
    hideLoading()
  }
}

const handleUserSubmit = async (e) => {
  e.preventDefault()
  
  const userData = {
    email: $('#user-email').value,
    name: $('#user-name').value,
    role: $('#user-role').value,
    region: $('#user-region').value,
    country: $('#user-country').value,
    distributor: $('#user-distributor').value,
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

// ============================================
// RENDERING FUNCTIONS
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
      <div>
        <h1 class="page-title">Assets Library</h1>
        <p class="page-subtitle">
          ${state.selectedBrand ? `Brand: ${state.selectedBrand.display_name}` : 'All brands'}
          ${state.selectedMaterialType ? ` | ${state.selectedMaterialType.display_name}` : ''}
        </p>
      </div>
      
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

const renderUsersPage = () => {
  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">User Management</h1>
        <p class="page-subtitle">Manage user accounts and permissions</p>
      </div>
      
      <div class="page-actions">
        <button onclick="openUserModal()" class="btn-primary">
          <i class="fas fa-user-plus"></i>
          Add User
        </button>
      </div>
    </div>
    
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Region / Country</th>
            <th>Distributor</th>
            <th>Last Login</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${state.users.map(user => `
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div class="user-avatar-small">
                    <i class="fas fa-user"></i>
                  </div>
                  <div>
                    <div style="font-weight: 600; color: var(--gray-900);">${user.name}</div>
                    <div style="font-size: 0.75rem; color: var(--gray-600);">${user.email}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge badge-${user.role}">
                  ${user.role}
                </span>
              </td>
              <td style="color: var(--gray-700);">
                ${user.region || 'N/A'} ${user.country ? `/ ${user.country}` : ''}
              </td>
              <td style="color: var(--gray-700); font-size: 0.875rem;">
                ${user.distributor || 'N/A'}
              </td>
              <td style="color: var(--gray-600); font-size: 0.875rem;">
                ${formatDate(user.last_login)}
              </td>
              <td>
                <span class="badge ${user.active ? 'badge-active' : 'badge-inactive'}">
                  ${user.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div style="display: flex; gap: 0.5rem;">
                  <button 
                    onclick='openUserModal(${JSON.stringify(user).replace(/"/g, '&quot;')})'
                    class="icon-btn"
                    title="Edit user"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    onclick="openPasswordModal(${user.id})"
                    class="icon-btn"
                    title="View/Change password"
                  >
                    <i class="fas fa-key"></i>
                  </button>
                  <button 
                    onclick="handleDeleteUser(${user.id})"
                    class="icon-btn danger"
                    title="Delete user"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}

const renderUploadModal = () => {
  if (!uploadModal) return ''
  
  return `
    <div class="modal-overlay" onclick="closeUploadModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">Upload Asset</h3>
          <button onclick="closeUploadModal()" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form onsubmit="handleFileUpload(event)" class="modal-body">
          <div class="form-group">
            <label class="form-label">File *</label>
            <input 
              id="upload-file" 
              type="file" 
              required
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Title</label>
            <input 
              id="upload-title" 
              type="text" 
              class="form-input"
              placeholder="Asset title"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea 
              id="upload-description" 
              rows="3"
              class="form-input"
              placeholder="Asset description"
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Brand *</label>
              <select id="upload-brand" required class="form-input">
                <option value="">Select brand</option>
                ${state.brands.map(brand => `<option value="${brand.id}">${brand.display_name}</option>`).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Material Type *</label>
              <select id="upload-material-type" required class="form-input">
                <option value="">Select type</option>
                ${state.materialTypes.map(type => `<option value="${type.id}">${type.display_name}</option>`).join('')}
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Region</label>
              <select id="upload-region" class="form-input">
                <option value="">Select region</option>
                <option value="GLOBAL">GLOBAL</option>
                <option value="USA">USA</option>
                <option value="LATAM">LATAM</option>
                <option value="EUROPA">EUROPA</option>
                <option value="MENA">MENA</option>
                <option value="ASIA">ASIA</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Country</label>
              <input id="upload-country" type="text" class="form-input" placeholder="Country" />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Regulatory</label>
              <select id="upload-regulatory" class="form-input">
                <option value="GLOBAL">GLOBAL</option>
                <option value="EU">EU</option>
                <option value="NON-EU">NON-EU</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Language</label>
              <select id="upload-language" class="form-input">
                <option value="ESP">Español</option>
                <option value="ENG">English</option>
                <option value="BRA">Português</option>
                <option value="RUS">Русский</option>
              </select>
            </div>
          </div>
          
          <input type="hidden" id="upload-subbrand" value="" />
          
          <div class="modal-footer">
            <button type="button" onclick="closeUploadModal()" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary">
              <i class="fas fa-upload"></i>
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
    <div class="modal-overlay" onclick="closeUserModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">${userModal.id ? 'Edit User' : 'Add User'}</h3>
          <button onclick="closeUserModal()" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form onsubmit="handleUserSubmit(event)" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input id="user-email" type="email" required value="${userModal.email || ''}" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Name *</label>
              <input id="user-name" type="text" required value="${userModal.name || ''}" class="form-input" />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Role *</label>
              <select id="user-role" required class="form-input">
                <option value="admin" ${userModal.role === 'admin' ? 'selected' : ''}>Admin</option>
                <option value="marketing" ${userModal.role === 'marketing' ? 'selected' : ''}>Marketing</option>
                <option value="distributor" ${userModal.role === 'distributor' ? 'selected' : ''}>Distributor</option>
                <option value="agency" ${userModal.role === 'agency' ? 'selected' : ''}>Agency</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Language</label>
              <select id="user-language" class="form-input">
                <option value="ESP" ${userModal.language === 'ESP' ? 'selected' : ''}>Español</option>
                <option value="ENG" ${userModal.language === 'ENG' ? 'selected' : ''}>English</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Region</label>
              <input id="user-region" type="text" value="${userModal.region || ''}" class="form-input" />
            </div>
            <div class="form-group">
              <label class="form-label">Country</label>
              <input id="user-country" type="text" value="${userModal.country || ''}" class="form-input" />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Distributor</label>
            <input id="user-distributor" type="text" value="${userModal.distributor || ''}" class="form-input" />
          </div>
          
          <div class="form-group">
            <label class="form-label">Brand Access</label>
            <div id="user-brands" class="checkbox-grid">
              ${state.brands.map(brand => `
                <label class="checkbox-label">
                  <input type="checkbox" value="${brand.id}" ${(userModal.brands_access || []).includes(brand.id) ? 'checked' : ''} />
                  <span>${brand.display_name}</span>
                </label>
              `).join('')}
            </div>
          </div>
          
          ${userModal.id ? `
            <div class="form-group">
              <label class="checkbox-label">
                <input id="user-active" type="checkbox" ${userModal.active ? 'checked' : ''} />
                <span>Active</span>
              </label>
            </div>
          ` : ''}
          
          <div class="modal-footer">
            <button type="button" onclick="closeUserModal()" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">
              <i class="fas fa-save"></i>${userModal.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
}

const renderPasswordModal = () => {
  if (!passwordModal) return ''
  
  return `
    <div class="modal-overlay" onclick="closePasswordModal()">
      <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title">Manage Password</h3>
          <button onclick="closePasswordModal()" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form onsubmit="handlePasswordChange(event)" class="modal-body">
          <div class="form-group">
            <label class="form-label">Current Password</label>
            <div style="padding: 0.75rem; background: #f8f9fa; border-radius: 8px; font-family: monospace; font-size: 0.875rem; color: var(--gray-900);">
              ${passwordModal.currentPassword}
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">New Password</label>
            <input 
              id="new-password" 
              type="text" 
              required
              class="form-input"
              placeholder="Enter new password"
            />
          </div>
          
          <div class="modal-footer">
            <button type="button" onclick="closePasswordModal()" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary">
              <i class="fas fa-save"></i>
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  `
}

// ============================================
// Main Render Function
// ============================================

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
    <div class="app-wrapper">
      ${renderHeader()}
      <div class="app-main">
        ${renderSidebar()}
        <main class="app-content">
          ${pageContent}
        </main>
      </div>
    </div>
    
    ${renderUploadModal()}
    ${renderUserModal()}
    ${renderPasswordModal()}
    
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
  await checkAuth()
  render()
})
