import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { FC } from 'hono/jsx'

// Type definitions
type Bindings = {
  DB: D1Database
  R2: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ============================================
// API ROUTES - Authentication
// ============================================

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  
  const user = await c.env.DB.prepare(`
    SELECT id, email, name, role, region, country, language, brands_access 
    FROM users WHERE email = ? AND active = 1
  `).bind(email).first()
  
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }
  
  // In production, verify password with bcrypt
  // For demo, we'll use simple check
  
  // Update last login
  await c.env.DB.prepare(`
    UPDATE users SET last_login = datetime('now') WHERE id = ?
  `).bind(user.id).run()
  
  // Log activity
  await c.env.DB.prepare(`
    INSERT INTO activity_log (user_id, action, details) 
    VALUES (?, 'login', ?)
  `).bind(user.id, JSON.stringify({ email })).run()
  
  return c.json({ 
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      region: user.region,
      country: user.country,
      language: user.language,
      brands_access: user.brands_access ? JSON.parse(user.brands_access as string) : []
    }
  })
})

app.get('/api/auth/session', async (c) => {
  // In production, verify JWT token
  const userId = c.req.query('userId')
  
  if (!userId) {
    return c.json({ error: 'Not authenticated' }, 401)
  }
  
  const user = await c.env.DB.prepare(`
    SELECT id, email, name, role, region, country, language, brands_access 
    FROM users WHERE id = ? AND active = 1
  `).bind(userId).first()
  
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }
  
  return c.json({ 
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      region: user.region,
      country: user.country,
      language: user.language,
      brands_access: user.brands_access ? JSON.parse(user.brands_access as string) : []
    }
  })
})

// ============================================
// API ROUTES - Users Management
// ============================================

app.get('/api/users', async (c) => {
  const currentUserId = c.req.query('currentUserId')
  
  // Verificar si es admin
  const currentUser = await c.env.DB.prepare(`
    SELECT role FROM users WHERE id = ?
  `).bind(currentUserId).first()
  
  const isAdmin = currentUser && currentUser.role === 'admin'
  
  // Si es admin, incluir password_hash
  const query = isAdmin 
    ? `SELECT id, email, name, role, region, country, distributor, language, brands_access, password_hash, active, created_at, last_login FROM users ORDER BY created_at DESC`
    : `SELECT id, email, name, role, region, country, distributor, language, brands_access, active, created_at, last_login FROM users ORDER BY created_at DESC`
  
  const { results } = await c.env.DB.prepare(query).all()
  
  return c.json({ users: results, isAdmin })
})

app.post('/api/users', async (c) => {
  const data = await c.req.json()
  
  // Generar contraseña aleatoria si no se proporciona
  const password = data.password || Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase()
  
  const result = await c.env.DB.prepare(`
    INSERT INTO users (email, password_hash, name, role, region, country, distributor, language, brands_access)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.email,
    password, // En producción, hash con bcrypt
    data.name,
    data.role,
    data.region || null,
    data.country || null,
    data.distributor || null,
    data.language || 'ING',
    data.brands_access ? JSON.stringify(data.brands_access) : null
  ).run()
  
  return c.json({ success: true, id: result.meta.last_row_id, password })
})

app.put('/api/users/:id', async (c) => {
  const id = c.req.param('id')
  const data = await c.req.json()
  
  await c.env.DB.prepare(`
    UPDATE users 
    SET name = ?, role = ?, region = ?, country = ?, distributor = ?, language = ?, brands_access = ?, active = ?
    WHERE id = ?
  `).bind(
    data.name,
    data.role,
    data.region,
    data.country,
    data.distributor,
    data.language,
    data.brands_access ? JSON.stringify(data.brands_access) : null,
    data.active ? 1 : 0,
    id
  ).run()
  
  return c.json({ success: true })
})

app.delete('/api/users/:id', async (c) => {
  const id = c.req.param('id')
  
  await c.env.DB.prepare(`
    UPDATE users SET active = 0 WHERE id = ?
  `).bind(id).run()
  
  return c.json({ success: true })
})

// ============================================
// API ROUTES - Brands
// ============================================

app.get('/api/brands', async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT id, name, display_name, description, logo_url, color, active
    FROM brands WHERE active = 1 ORDER BY name
  `).all()
  
  return c.json({ brands: results })
})

app.get('/api/brands/:id/sub-brands', async (c) => {
  const brandId = c.req.param('id')
  
  const { results } = await c.env.DB.prepare(`
    SELECT id, name, display_name, description
    FROM sub_brands WHERE brand_id = ? AND active = 1 ORDER BY name
  `).bind(brandId).all()
  
  return c.json({ subBrands: results })
})

// Create new brand
app.post('/api/brands', async (c) => {
  const data = await c.req.json()
  
  const result = await c.env.DB.prepare(`
    INSERT INTO brands (name, display_name, description, logo_url, color, active)
    VALUES (?, ?, ?, ?, ?, 1)
  `).bind(
    data.name,
    data.display_name,
    data.description || null,
    data.logo_url || null,
    data.color || '#0ea5e9'
  ).run()
  
  return c.json({ success: true, id: result.meta.last_row_id })
})

// Update brand
app.put('/api/brands/:id', async (c) => {
  const id = c.req.param('id')
  const data = await c.req.json()
  
  await c.env.DB.prepare(`
    UPDATE brands 
    SET display_name = ?, description = ?, logo_url = ?, color = ?
    WHERE id = ?
  `).bind(
    data.display_name,
    data.description || null,
    data.logo_url || null,
    data.color,
    id
  ).run()
  
  return c.json({ success: true })
})

// Delete brand
app.delete('/api/brands/:id', async (c) => {
  const id = c.req.param('id')
  
  await c.env.DB.prepare(`
    UPDATE brands SET active = 0 WHERE id = ?
  `).bind(id).run()
  
  return c.json({ success: true })
})

// ============================================
// API ROUTES - Material Types
// ============================================

app.get('/api/material-types', async (c) => {
  const lang = c.req.query('lang') || 'en'
  
  const { results } = await c.env.DB.prepare(`
    SELECT id, name, 
           ${lang === 'es' ? 'display_name_es' : 'display_name_en'} as display_name,
           description, icon, sort_order
    FROM material_types WHERE active = 1 ORDER BY sort_order
  `).all()
  
  return c.json({ materialTypes: results })
})

// Create new material type
app.post('/api/material-types', async (c) => {
  const data = await c.req.json()
  
  const result = await c.env.DB.prepare(`
    INSERT INTO material_types (name, display_name_en, display_name_es, description, icon, sort_order, active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).bind(
    data.name,
    data.display_name_en,
    data.display_name_es || data.display_name_en,
    data.description || null,
    data.icon || 'fa-file',
    data.sort_order || 999
  ).run()
  
  return c.json({ success: true, id: result.meta.last_row_id })
})

// Update material type
app.put('/api/material-types/:id', async (c) => {
  const id = c.req.param('id')
  const data = await c.req.json()
  
  await c.env.DB.prepare(`
    UPDATE material_types 
    SET display_name_en = ?, display_name_es = ?, description = ?, icon = ?, sort_order = ?
    WHERE id = ?
  `).bind(
    data.display_name_en,
    data.display_name_es || data.display_name_en,
    data.description || null,
    data.icon,
    data.sort_order,
    id
  ).run()
  
  return c.json({ success: true })
})

// Delete material type
app.delete('/api/material-types/:id', async (c) => {
  const id = c.req.param('id')
  
  await c.env.DB.prepare(`
    UPDATE material_types SET active = 0 WHERE id = ?
  `).bind(id).run()
  
  return c.json({ success: true })
})

// ============================================
// API ROUTES - Assets
// ============================================

app.get('/api/assets', async (c) => {
  const brandId = c.req.query('brand_id')
  const subBrandId = c.req.query('sub_brand_id')
  const materialTypeId = c.req.query('material_type_id')
  const search = c.req.query('search')
  
  let query = `
    SELECT a.*, 
           b.display_name as brand_name,
           sb.display_name as sub_brand_name,
           mt.display_name_en as material_type_name,
           u.name as author_name
    FROM assets a
    LEFT JOIN brands b ON a.brand_id = b.id
    LEFT JOIN sub_brands sb ON a.sub_brand_id = sb.id
    LEFT JOIN material_types mt ON a.material_type_id = mt.id
    LEFT JOIN users u ON a.created_by = u.id
    WHERE 1=1
  `
  
  const params: any[] = []
  
  if (brandId) {
    query += ` AND a.brand_id = ?`
    params.push(brandId)
  }
  
  if (subBrandId) {
    query += ` AND a.sub_brand_id = ?`
    params.push(subBrandId)
  }
  
  if (materialTypeId) {
    query += ` AND a.material_type_id = ?`
    params.push(materialTypeId)
  }
  
  if (search) {
    query += ` AND (a.title LIKE ? OR a.original_filename LIKE ? OR a.description LIKE ?)`
    const searchTerm = `%${search}%`
    params.push(searchTerm, searchTerm, searchTerm)
  }
  
  query += ` ORDER BY a.created_at DESC LIMIT 100`
  
  const stmt = c.env.DB.prepare(query)
  const { results } = await (params.length > 0 ? stmt.bind(...params) : stmt).all()
  
  return c.json({ assets: results })
})

app.post('/api/assets', async (c) => {
  const data = await c.req.json()
  
  const result = await c.env.DB.prepare(`
    INSERT INTO assets (
      filename, original_filename, title, description, file_type, file_size, file_url,
      brand_id, sub_brand_id, material_type_id, region, country, regulatory, language,
      tags, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.filename,
    data.original_filename,
    data.title,
    data.description,
    data.file_type,
    data.file_size,
    data.file_url,
    data.brand_id,
    data.sub_brand_id,
    data.material_type_id,
    data.region,
    data.country,
    data.regulatory,
    data.language,
    data.tags ? JSON.stringify(data.tags) : null,
    data.created_by
  ).run()
  
  return c.json({ success: true, id: result.meta.last_row_id })
})

app.delete('/api/assets/:id', async (c) => {
  const id = c.req.param('id')
  
  // Get file URL to delete from R2
  const asset = await c.env.DB.prepare(`
    SELECT filename FROM assets WHERE id = ?
  `).bind(id).first()
  
  if (asset && asset.filename) {
    await c.env.R2.delete(asset.filename as string)
  }
  
  await c.env.DB.prepare(`
    DELETE FROM assets WHERE id = ?
  `).bind(id).run()
  
  return c.json({ success: true })
})

// ============================================
// API ROUTES - File Upload
// ============================================

app.post('/api/upload', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400)
  }
  
  const filename = `${Date.now()}-${file.name}`
  const buffer = await file.arrayBuffer()
  
  await c.env.R2.put(filename, buffer, {
    httpMetadata: {
      contentType: file.type
    }
  })
  
  const fileUrl = `/api/files/${filename}`
  
  return c.json({ 
    success: true, 
    filename,
    fileUrl,
    fileType: file.type,
    fileSize: file.size
  })
})

app.get('/api/files/:filename', async (c) => {
  const filename = c.req.param('filename')
  
  const object = await c.env.R2.get(filename)
  
  if (!object) {
    return c.notFound()
  }
  
  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000'
    }
  })
})

// ============================================
// API ROUTES - Statistics
// ============================================

app.get('/api/stats', async (c) => {
  const totalUsers = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM users WHERE active = 1
  `).first()
  
  const totalAssets = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM assets
  `).first()
  
  const totalBrands = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM brands WHERE active = 1
  `).first()
  
  const recentActivity = await c.env.DB.prepare(`
    SELECT al.*, u.name as user_name
    FROM activity_log al
    LEFT JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT 10
  `).all()
  
  return c.json({
    totalUsers: totalUsers?.count || 0,
    totalAssets: totalAssets?.count || 0,
    totalBrands: totalBrands?.count || 0,
    recentActivity: recentActivity.results
  })
})

// ============================================
// API ROUTES - Password Management
// ============================================

app.get('/api/users/:id/password', async (c) => {
  const id = c.req.param('id')
  const currentUserId = c.req.query('currentUserId')
  
  // Solo admin puede ver contraseñas
  const currentUser = await c.env.DB.prepare(`
    SELECT role FROM users WHERE id = ?
  `).bind(currentUserId).first()
  
  if (!currentUser || currentUser.role !== 'admin') {
    return c.json({ error: 'Unauthorized' }, 403)
  }
  
  const user = await c.env.DB.prepare(`
    SELECT password_hash FROM users WHERE id = ?
  `).bind(id).first()
  
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }
  
  return c.json({ password: user.password_hash })
})

app.put('/api/users/:id/password', async (c) => {
  const id = c.req.param('id')
  const { newPassword, currentUserId } = await c.req.json()
  
  // Verificar permisos: admin puede cambiar cualquier contraseña, usuario solo la suya
  const currentUser = await c.env.DB.prepare(`
    SELECT id, role FROM users WHERE id = ?
  `).bind(currentUserId).first()
  
  if (!currentUser) {
    return c.json({ error: 'Unauthorized' }, 403)
  }
  
  // Si no es admin, solo puede cambiar su propia contraseña
  if (currentUser.role !== 'admin' && currentUser.id !== parseInt(id)) {
    return c.json({ error: 'Unauthorized' }, 403)
  }
  
  // En producción, hashear con bcrypt
  await c.env.DB.prepare(`
    UPDATE users SET password_hash = ? WHERE id = ?
  `).bind(newPassword, id).run()
  
  // Log activity
  await c.env.DB.prepare(`
    INSERT INTO activity_log (user_id, action, details) 
    VALUES (?, 'password_change', ?)
  `).bind(id, JSON.stringify({ changed_by: currentUserId })).run()
  
  return c.json({ success: true })
})

app.post('/api/users/:id/reset-password', async (c) => {
  const id = c.req.param('id')
  const { currentUserId } = await c.req.json()
  
  // Solo admin puede resetear contraseñas
  const currentUser = await c.env.DB.prepare(`
    SELECT role FROM users WHERE id = ?
  `).bind(currentUserId).first()
  
  if (!currentUser || currentUser.role !== 'admin') {
    return c.json({ error: 'Unauthorized' }, 403)
  }
  
  // Generar nueva contraseña aleatoria
  const newPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase()
  
  await c.env.DB.prepare(`
    UPDATE users SET password_hash = ? WHERE id = ?
  `).bind(newPassword, id).run()
  
  // Log activity
  await c.env.DB.prepare(`
    INSERT INTO activity_log (user_id, action, details) 
    VALUES (?, 'password_reset', ?)
  `).bind(id, JSON.stringify({ reset_by: currentUserId })).run()
  
  return c.json({ success: true, newPassword })
})

// ============================================
// PUBLIC API ROUTES (No authentication required)
// ============================================

// Public catalog - Get all public assets
app.get('/api/public/assets', async (c) => {
  const { brand_id, material_type_id, region, search } = c.req.query()
  
  let query = `
    SELECT 
      a.*,
      b.display_name as brand_name,
      b.color as brand_color,
      sb.display_name as sub_brand_name,
      mt.display_name as material_type_name,
      mt.icon as material_type_icon
    FROM assets a
    LEFT JOIN brands b ON a.brand_id = b.id
    LEFT JOIN sub_brands sb ON a.sub_brand_id = sb.id
    LEFT JOIN material_types mt ON a.material_type_id = mt.id
    WHERE 1=1
  `
  
  const params: any[] = []
  
  if (brand_id) {
    query += ` AND a.brand_id = ?`
    params.push(brand_id)
  }
  
  if (material_type_id) {
    query += ` AND a.material_type_id = ?`
    params.push(material_type_id)
  }
  
  if (region) {
    query += ` AND (a.region = ? OR a.region = 'GLOBAL')`
    params.push(region)
  }
  
  if (search) {
    query += ` AND (a.title LIKE ? OR a.description LIKE ? OR a.original_filename LIKE ?)`
    const searchTerm = `%${search}%`
    params.push(searchTerm, searchTerm, searchTerm)
  }
  
  query += ` ORDER BY a.created_at DESC`
  
  const stmt = c.env.DB.prepare(query)
  const result = await stmt.bind(...params).all()
  
  return c.json({ assets: result.results || [] })
})

// Public brands list
app.get('/api/public/brands', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT * FROM brands WHERE active = 1 ORDER BY display_name
  `).all()
  
  return c.json({ brands: result.results || [] })
})

// Public material types
app.get('/api/public/material-types', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT id, name, display_name_en as display_name, display_name_es, description, icon, sort_order, active
    FROM material_types 
    WHERE active = 1
    ORDER BY sort_order, display_name_en
  `).all()
  
  return c.json({ materialTypes: result.results || [] })
})

// Public stats
app.get('/api/public/stats', async (c) => {
  const totalAssets = await c.env.DB.prepare('SELECT COUNT(*) as count FROM assets').first()
  const totalBrands = await c.env.DB.prepare('SELECT COUNT(*) as count FROM brands WHERE active = 1').first()
  
  return c.json({
    totalAssets: totalAssets?.count || 0,
    totalBrands: totalBrands?.count || 0
  })
})

// ============================================
// MAIN PAGES
// ============================================

// Admin panel (login required)
app.get('/admin', (c) => {
  return c.html(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Brand Portal - Admin Panel</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="/static/style.css?v=4" rel="stylesheet" />
      </head>
      <body class="bg-gray-50">
        <div id="app"></div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js?v=4"></script>
      </body>
    </html>
  )
})

// Public catalog page (no login required)
app.get('/', (c) => {
  return c.html(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Proteos Biotech - Brand Center</title>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="/static/catalog.css?v=5" rel="stylesheet" />
      </head>
      <body>
        <div id="catalog"></div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/catalog.js?v=5"></script>
      </body>
    </html>
  )
})

export default app
