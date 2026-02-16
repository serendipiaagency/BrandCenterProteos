// Asset Page Client-Side JavaScript
// Handles authentication, asset loading, and download tracking

(function() {
  'use strict';
  
  // Get asset ID from global variable
  const assetId = window.ASSET_ID;
  
  // Login form handler
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('asset-login-email').value;
      const password = document.getElementById('asset-login-password').value;
      const loginError = document.getElementById('login-error');
      
      console.log('[LOGIN] Attempting login with email:', email);
      
      try {
        const response = await axios.post('/api/auth/login', {
          email,
          password
        });
        
        console.log('[LOGIN] Response:', response.data);
        
        if (response.data && response.data.success) {
          // Save user ID to localStorage for session persistence
          localStorage.setItem('userId', response.data.user.id);
          console.log('[LOGIN] Saved userId to localStorage:', response.data.user.id);
          
          // Login successful, reload the page to show asset
          console.log('[LOGIN] Reloading page...');
          window.location.reload();
        } else {
          console.error('[LOGIN] Failed - invalid response', response.data);
          loginError.textContent = 'Invalid credentials';
          loginError.style.display = 'block';
        }
      } catch (error) {
        console.error('[LOGIN] Error:', error);
        loginError.textContent = 'Invalid email or password';
        loginError.style.display = 'block';
      }
    });
  }
  
  // Check authentication
  async function checkAuth() {
    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId');
      console.log('[AUTH] Checking auth, userId from localStorage:', userId);
      
      if (!userId) {
        console.log('[AUTH] No userId found in localStorage');
        return null;
      }
      
      console.log('[AUTH] Calling /api/auth/me with userId:', userId);
      const response = await axios.get('/api/auth/me?userId=' + userId);
      console.log('[AUTH] Response:', response.data);
      
      if (response.data && response.data.user) {
        console.log('[AUTH] User authenticated:', response.data.user.email);
        return response.data.user;
      }
      console.log('[AUTH] No user in response');
      return null;
    } catch (error) {
      console.error('[AUTH] Error:', error);
      return null;
    }
  }
  
  // Load asset data
  async function loadAsset(user) {
    try {
      console.log('[ASSET] Loading asset:', assetId);
      const response = await axios.get('/api/assets/' + assetId);
      const asset = response.data;
      console.log('[ASSET] Asset loaded:', asset);
      
      // Check if user has access to this asset
      if (!checkAssetAccess(user, asset)) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('no-access').style.display = 'block';
        return;
      }
      
      displayAsset(asset);
      
      // Track view event
      trackView(assetId, user.id);
    } catch (error) {
      console.error('[ASSET] Error loading asset:', error);
      document.getElementById('loading').style.display = 'none';
      document.getElementById('error').style.display = 'block';
    }
  }
  
  // Track view event
  async function trackView(assetId, userId) {
    try {
      await axios.post('/api/analytics/track/view', {
        assetId,
        userId
      });
      console.log('[TRACKING] View tracked');
    } catch (error) {
      console.error('[TRACKING] Failed to track view:', error);
    }
  }
  
  // Check if user has access to asset
  function checkAssetAccess(user, asset) {
    console.log('[ACCESS] Checking asset access for user:', user.email, 'asset:', asset.id);
    
    // Admin has access to everything
    if (user.role === 'admin') {
      console.log('[ACCESS] Admin user - access granted');
      return true;
    }
    
    // Parse user's brands_access
    let userBrands = [];
    try {
      userBrands = typeof user.brands_access === 'string' 
        ? JSON.parse(user.brands_access) 
        : (user.brands_access || []);
      console.log('[ACCESS] User brands:', userBrands);
    } catch (e) {
      console.error('[ACCESS] Error parsing brands_access:', e);
      userBrands = [];
    }
    
    console.log('[ACCESS] Asset brand_id:', asset.brand_id, 'brand_ids:', asset.brand_ids);
    
    // Check if user has access to any of the asset's brands
    if (asset.brand_ids && asset.brand_ids.length > 0) {
      const hasAccess = asset.brand_ids.some(brandId => userBrands.includes(brandId));
      console.log('[ACCESS] Checking brand_ids access:', hasAccess);
      if (!hasAccess && asset.brand_id && !userBrands.includes(asset.brand_id)) {
        console.log('[ACCESS] No access - brand not in user brands');
        return false;
      }
    } else if (asset.brand_id && !userBrands.includes(asset.brand_id)) {
      console.log('[ACCESS] No access - brand_id not in user brands');
      return false;
    }
    
    console.log('[ACCESS] Access granted');
    return true;
  }
  
  // Display asset on page
  function displayAsset(asset) {
    const isImage = asset.file_type && asset.file_type.includes('image');
    const isPdf = asset.file_type && asset.file_type.includes('pdf');
    const isVideo = asset.file_type && asset.file_type.includes('video');
    
    let preview = '';
    if (asset.thumbnail_url) {
      preview = '<img src="' + asset.thumbnail_url + '" alt="' + (asset.title || '') + '" />';
    } else if (isImage) {
      preview = '<img src="' + asset.file_url + '" alt="' + (asset.title || '') + '" />';
    } else if (isPdf) {
      preview = '<i class="fas fa-file-pdf" style="color: #dc2626; font-size: 4rem;"></i>';
    } else if (isVideo) {
      preview = '<i class="fas fa-file-video" style="color: #7c3aed; font-size: 4rem;"></i>';
    } else {
      preview = '<i class="fas fa-file" style="font-size: 4rem;"></i>';
    }
    
    const fileSize = (asset.file_size / 1024).toFixed(2);
    const fileSizeUnit = asset.file_size > 1024 * 1024 
      ? ((asset.file_size / (1024 * 1024)).toFixed(2) + ' MB') 
      : (fileSize + ' KB');
    
    // Get shareable URL
    const shareUrl = window.location.origin + '/asset/' + asset.id;
    
    const contentHTML = 
      '<div class="asset-preview">' + preview + '</div>' +
      '<div class="asset-info">' +
        '<h2 class="asset-title">' + (asset.title || asset.original_filename) + '</h2>' +
        (asset.description ? '<p class="asset-description">' + asset.description + '</p>' : '') +
      '</div>' +
      '<div class="asset-meta">' +
        '<div class="meta-item">' +
          '<div class="meta-label">Brand</div>' +
          '<div class="meta-value">' +
            '<span class="brand-badge" style="background-color: ' + (asset.brand_color || '#002f57') + ';">' +
              (asset.brand_name || 'N/A') +
            '</span>' +
          '</div>' +
        '</div>' +
        '<div class="meta-item">' +
          '<div class="meta-label">Material Type</div>' +
          '<div class="meta-value">' + (asset.material_type_name || 'N/A') + '</div>' +
        '</div>' +
        '<div class="meta-item">' +
          '<div class="meta-label">File Type</div>' +
          '<div class="meta-value">' + (asset.file_type ? asset.file_type.split('/')[1].toUpperCase() : 'N/A') + '</div>' +
        '</div>' +
        '<div class="meta-item">' +
          '<div class="meta-label">File Size</div>' +
          '<div class="meta-value">' + fileSizeUnit + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="actions" style="display: flex; gap: 1rem; align-items: center;">' +
        '<a id="download-btn" href="' + asset.file_url + '" download class="btn btn-primary" style="flex: 1; min-width: 200px;">' +
          '<i class="fas fa-download"></i> Download Asset' +
        '</a>' +
        '<button id="copy-link-btn" class="btn-icon" title="Copy link">' +
          '<i class="fas fa-link"></i>' +
        '</button>' +
        '<a href="/catalog" class="btn btn-secondary" style="flex: 1; min-width: 150px;">' +
          '<i class="fas fa-th"></i> Browse Catalog' +
        '</a>' +
      '</div>';
    
    document.getElementById('loading').style.display = 'none';
    document.getElementById('asset-content').innerHTML = contentHTML;
    document.getElementById('asset-content').style.display = 'block';
    
    // Add download tracking
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function() {
        trackDownload(asset.id);
      });
    }
    
    // Add copy link handler
    const copyBtn = document.getElementById('copy-link-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        copyAssetLink(shareUrl);
      });
    }
    
    document.title = (asset.title || asset.original_filename) + ' - Proteos Biotech BRAND CENTER';
  }
  
  // Copy asset link to clipboard
  function copyAssetLink(url) {
    navigator.clipboard.writeText(url).then(function() {
      const btn = document.getElementById('copy-link-btn');
      btn.classList.add('copied');
      btn.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(function() {
        btn.classList.remove('copied');
        btn.innerHTML = '<i class="fas fa-link"></i>';
      }, 2000);
    }).catch(function(err) {
      console.error('Failed to copy:', err);
    });
  }
  
  // Track download event
  async function trackDownload(assetId) {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.warn('[TRACKING] No userId found for download tracking');
        return;
      }
      
      await axios.post('/api/analytics/track/download', {
        assetId: assetId,
        userId: parseInt(userId)
      });
      console.log('[TRACKING] Download tracked');
    } catch (error) {
      console.error('[TRACKING] Failed to track download:', error);
    }
  }
  
  // Initialize page
  async function init() {
    console.log('[INIT] Initializing asset page, assetId:', assetId);
    
    const user = await checkAuth();
    
    if (user) {
      // User is logged in, load asset and check permissions
      document.getElementById('auth-check').style.display = 'none';
      document.getElementById('loading').style.display = 'block';
      await loadAsset(user);
    } else {
      // User is not logged in, show login form
      document.getElementById('auth-check').style.display = 'block';
      document.getElementById('loading').style.display = 'none';
    }
  }
  
  // Start initialization
  init();
})();
