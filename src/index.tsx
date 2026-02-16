import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { FC } from 'hono/jsx'
import { changePasswordHTML } from './change-password-html'

// Type definitions
type Bindings = {
  DB: D1Database
  R2: R2Bucket
  RESEND_API_KEY?: string  // Optional for backward compatibility
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Change password page - serve the HTML content
app.get('/change-password', (c) => {
  return c.html(changePasswordHTML)
})
app.get('/change-password.html', (c) => {
  return c.html(changePasswordHTML)
})

// ============================================
// API ROUTES - Authentication
// ============================================

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  
  const user = await c.env.DB.prepare(`
    SELECT id, email, password_hash, name, role, region, country, language, brands_access 
    FROM users WHERE email = ? AND active = 1
  `).bind(email).first()
  
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }
  
  // Verify password
  if (user.password_hash !== password) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }
  
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

// Get current user info from localStorage userId
app.get('/api/auth/me', async (c) => {
  // Try to get userId from multiple sources
  const userId = c.req.query('userId') || c.req.header('X-User-Id')
  
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

// Password Reset - Request token
app.post('/api/auth/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json()
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400)
    }
    
    // Check if user exists
    const user = await c.env.DB.prepare(`
      SELECT id, email, name FROM users WHERE email = ? AND active = 1
    `).bind(email).first()
    
    if (!user) {
      // Don't reveal if email exists or not (security)
      return c.json({ 
        success: true, 
        message: 'If the email exists, a password reset link has been sent.' 
      })
    }
    
    // Generate reset token (random string)
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2)
    
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    
    // Save token to database
    await c.env.DB.prepare(`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).bind(user.id, token, expiresAt).run()
    
    // Send email with Resend (if API key is configured)
    const resetLink = `https://brandcenter.pbserum.com/reset-password?token=${token}`
    
    if (c.env.RESEND_API_KEY) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Brand Portal <noreply@pbserum.com>',
            to: [email],
            subject: 'Recuperación de Contraseña - Brand Portal',
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
                  .button { display: inline-block; background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                  .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
                  .warning { background: #fef3c7; border-left: 4px solid #fbbf24; padding: 15px; margin: 20px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">🔑 Recuperación de Contraseña</h1>
                  </div>
                  <div class="content">
                    <p>Hola <strong>${user.name}</strong>,</p>
                    
                    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Brand Portal</strong>.</p>
                    
                    <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                    
                    <div style="text-align: center;">
                      <a href="${resetLink}" class="button">Restablecer Contraseña</a>
                    </div>
                    
                    <p>O copia y pega este enlace en tu navegador:</p>
                    <p style="background: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 14px;">
                      ${resetLink}
                    </p>
                    
                    <div class="warning">
                      <strong>⚠️ Importante:</strong>
                      <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                        <li>Este enlace expira en <strong>1 hora</strong></li>
                        <li>Solo se puede usar una vez</li>
                        <li>Si no solicitaste esto, ignora este email</li>
                      </ul>
                    </div>
                    
                    <p>Saludos,<br><strong>Equipo de Brand Portal</strong></p>
                  </div>
                  <div class="footer">
                    <p>Proteos Biotech - Brand Portal</p>
                    <p>Este es un email automático, por favor no respondas.</p>
                  </div>
                </div>
              </body>
              </html>
            `
          })
        })
        
        if (!resendResponse.ok) {
          console.error('❌ Resend API error:', await resendResponse.text())
        } else {
          console.log('✅ Email sent successfully via Resend')
        }
      } catch (emailError) {
        console.error('❌ Error sending email:', emailError)
        // Continue anyway - don't fail the request if email fails
      }
    } else {
      // DEV MODE: No email service configured
      console.log(`🔑 Password reset token for ${email}: ${token}`)
      console.log(`🔗 Reset link: ${resetLink}`)
    }
    
    // Log activity
    await c.env.DB.prepare(`
      INSERT INTO activity_log (user_id, action, details) 
      VALUES (?, 'password_reset_requested', ?)
    `).bind(user.id, JSON.stringify({ email })).run()
    
    // Response (same for both dev and production for security)
    const response: any = { 
      success: true, 
      message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña.'
    }
    
    // DEV ONLY: Include token in response if no Resend API key
    if (!c.env.RESEND_API_KEY) {
      response.dev_token = token
      response.dev_reset_link = resetLink
    }
    
    return c.json(response)
    
  } catch (error: any) {
    console.error('❌ Error in forgot-password:', error)
    return c.json({ error: 'Failed to process request' }, 500)
  }
})

// Password Reset - Verify token
app.get('/api/auth/verify-reset-token', async (c) => {
  try {
    const token = c.req.query('token')
    
    if (!token) {
      return c.json({ valid: false, error: 'Token is required' }, 400)
    }
    
    // Check if token exists and is valid
    const resetToken = await c.env.DB.prepare(`
      SELECT prt.*, u.email, u.name 
      FROM password_reset_tokens prt
      JOIN users u ON prt.user_id = u.id
      WHERE prt.token = ? AND prt.used = 0 AND prt.expires_at > datetime('now')
    `).bind(token).first()
    
    if (!resetToken) {
      return c.json({ valid: false, error: 'Invalid or expired token' })
    }
    
    return c.json({ 
      valid: true,
      email: resetToken.email,
      name: resetToken.name
    })
    
  } catch (error: any) {
    console.error('❌ Error verifying token:', error)
    return c.json({ valid: false, error: 'Failed to verify token' }, 500)
  }
})

// Password Reset - Set new password
app.post('/api/auth/reset-password', async (c) => {
  try {
    const { token, newPassword } = await c.req.json()
    
    if (!token || !newPassword) {
      return c.json({ error: 'Token and new password are required' }, 400)
    }
    
    if (newPassword.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400)
    }
    
    // Check if token is valid
    const resetToken = await c.env.DB.prepare(`
      SELECT * FROM password_reset_tokens 
      WHERE token = ? AND used = 0 AND expires_at > datetime('now')
    `).bind(token).first()
    
    if (!resetToken) {
      return c.json({ error: 'Invalid or expired token' }, 400)
    }
    
    // Update user password
    // In production: hash with bcrypt
    await c.env.DB.prepare(`
      UPDATE users SET password_hash = ? WHERE id = ?
    `).bind(newPassword, resetToken.user_id).run()
    
    // Mark token as used
    await c.env.DB.prepare(`
      UPDATE password_reset_tokens SET used = 1 WHERE token = ?
    `).bind(token).run()
    
    // Log activity
    await c.env.DB.prepare(`
      INSERT INTO activity_log (user_id, action, details) 
      VALUES (?, 'password_reset_completed', ?)
    `).bind(resetToken.user_id, JSON.stringify({ token_id: resetToken.id })).run()
    
    console.log(`✅ Password reset successful for user ID: ${resetToken.user_id}`)
    
    return c.json({ 
      success: true, 
      message: 'Password has been reset successfully. You can now login with your new password.' 
    })
    
  } catch (error: any) {
    console.error('❌ Error resetting password:', error)
    return c.json({ error: 'Failed to reset password' }, 500)
  }
})

// Change Password - Requires current password
app.post('/api/auth/change-password', async (c) => {
  try {
    const { email, currentPassword, newPassword } = await c.req.json()
    
    if (!email || !currentPassword || !newPassword) {
      return c.json({ 
        success: false,
        message: 'Email, contraseña actual y nueva contraseña son requeridos' 
      }, 400)
    }
    
    if (newPassword.length < 6) {
      return c.json({ 
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres' 
      }, 400)
    }
    
    // Check if user exists and verify current password
    const user = await c.env.DB.prepare(`
      SELECT id, email, name, password_hash FROM users WHERE email = ? AND active = 1
    `).bind(email).first()
    
    if (!user) {
      return c.json({ 
        success: false,
        message: 'Credenciales inválidas' 
      }, 401)
    }
    
    // Verify current password
    // The system stores passwords as plain text (password_hash field)
    // In production, this should use bcrypt.compare(currentPassword, user.password_hash)
    if (user.password_hash !== currentPassword) {
      return c.json({ 
        success: false,
        message: 'La contraseña actual es incorrecta' 
      }, 401)
    }
    
    // Same password check
    if (currentPassword === newPassword) {
      return c.json({ 
        success: false,
        message: 'La nueva contraseña debe ser diferente a la actual' 
      }, 400)
    }
    
    // Update user password
    // Store as plain text (password_hash field name is misleading)
    // In production with proper backend: use bcrypt.hash(newPassword, 10)
    await c.env.DB.prepare(`
      UPDATE users SET password_hash = ? WHERE id = ?
    `).bind(newPassword, user.id).run()
    
    // Log activity
    await c.env.DB.prepare(`
      INSERT INTO activity_log (user_id, action, details) 
      VALUES (?, 'password_changed', ?)
    `).bind(user.id, JSON.stringify({ 
      email: user.email,
      changed_at: new Date().toISOString() 
    })).run()
    
    console.log(`✅ Password changed successfully for user: ${user.email}`)
    
    return c.json({ 
      success: true, 
      message: 'Contraseña cambiada exitosamente' 
    })
    
  } catch (error: any) {
    console.error('❌ Error changing password:', error)
    return c.json({ 
      success: false,
      message: 'Error al cambiar la contraseña' 
    }, 500)
  }
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
  const userId = c.req.query('userId')  // For brand permissions
  
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
  
  // Get user's brands_access if userId provided
  let userBrandsAccess: number[] = []
  let userRegions: string[] = []
  let userRole: string = ''
  
  if (userId) {
    const user = await c.env.DB.prepare(`
      SELECT brands_access, region, role FROM users WHERE id = ? AND active = 1
    `).bind(userId).first()
    
    if (user) {
      userRole = user.role as string
      
      // Only admin has access to all brands and regions
      if (user.role === 'admin') {
        userBrandsAccess = [] // Empty means all brands
        userRegions = [] // Empty means all regions
      } else {
        // Parse brands_access
        if (user.brands_access) {
          userBrandsAccess = JSON.parse(user.brands_access as string)
        }
        
        // Parse user regions
        if (user.region) {
          try {
            // Try to parse as JSON array (new format)
            userRegions = JSON.parse(user.region as string)
          } catch {
            // Fallback: treat as single region (old format)
            userRegions = [user.region as string]
          }
        }
      }
    }
  }
  
  // For each asset, fetch its associated brand_ids from asset_brands table
  const assetsWithBrands = await Promise.all(
    (results as any[]).map(async (asset) => {
      const { results: brandResults } = await c.env.DB.prepare(`
        SELECT brand_id FROM asset_brands WHERE asset_id = ?
      `).bind(asset.id).all()
      
      // Parse regions from JSON string to array
      let regions = []
      if (asset.region) {
        try {
          // Try to parse as JSON array
          regions = JSON.parse(asset.region)
        } catch {
          // Fallback: treat as single region
          regions = [asset.region]
        }
      }
      
      return {
        ...asset,
        brand_ids: brandResults.map((b: any) => b.brand_id),
        regions: regions  // Add parsed regions array
      }
    })
  )
  
  // Filter assets based on user's brands_access and regions
  let filteredAssets = assetsWithBrands
  
  // 🎯 CRITICAL: If userId exists, we MUST filter
  if (userId) {
    // If user is not admin and has NO brands, return empty
    if (userRole !== 'admin' && userBrandsAccess.length === 0) {
      filteredAssets = []
    } else if (userBrandsAccess.length > 0 || userRegions.length > 0) {
      filteredAssets = assetsWithBrands.filter((asset: any) => {
      // Check brand access
      let hasBrandAccess = false
      
      if (userBrandsAccess.length === 0) {
        // Admin/Marketing: all brands
        hasBrandAccess = true
      } else {
        // IMPORTANT: Check primary brand_id first
        // If user doesn't have access to primary brand, deny access even if asset has other brands
        if (asset.brand_id && !userBrandsAccess.includes(asset.brand_id)) {
          hasBrandAccess = false
        } else {
          // Check if asset has at least one brand_id in user's brands_access
          if (asset.brand_ids && asset.brand_ids.length > 0) {
            hasBrandAccess = asset.brand_ids.some((brandId: number) => userBrandsAccess.includes(brandId))
          } else if (asset.brand_id) {
            // Fallback to old brand_id field
            hasBrandAccess = userBrandsAccess.includes(asset.brand_id)
          }
        }
      }
      
      // Check region access
      let hasRegionAccess = false
      
      if (userRegions.length === 0) {
        // Admin/Marketing: all regions
        hasRegionAccess = true
      } else if (!asset.regions || asset.regions.length === 0) {
        // Asset has no regions specified: allow access
        hasRegionAccess = true
      } else {
        // Check if asset has GLOBAL or any region matching user's regions
        if (asset.regions.includes('GLOBAL')) {
          hasRegionAccess = true
        } else {
          // Check if any asset region matches user's regions (case-insensitive)
          hasRegionAccess = asset.regions.some((assetRegion: string) => 
            userRegions.some((userRegion: string) => 
              assetRegion.toUpperCase() === userRegion.toUpperCase()
            )
          )
        }
      }
      
      // Asset must pass BOTH brand and region checks
      return hasBrandAccess && hasRegionAccess
    })
    }
  }
  
  return c.json({ assets: filteredAssets }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
})

// Get single asset by ID (public - with brand/region check)
app.get('/api/assets/:id', async (c) => {
  const assetId = c.req.param('id')
  
  // Get asset with joined data
  const asset = await c.env.DB.prepare(`
    SELECT a.*, 
           b.display_name as brand_name,
           b.color as brand_color,
           sb.display_name as sub_brand_name,
           mt.display_name_en as material_type_name,
           u.name as author_name
    FROM assets a
    LEFT JOIN brands b ON a.brand_id = b.id
    LEFT JOIN sub_brands sb ON a.sub_brand_id = sb.id
    LEFT JOIN material_types mt ON a.material_type_id = mt.id
    LEFT JOIN users u ON a.created_by = u.id
    WHERE a.id = ?
  `).bind(assetId).first()
  
  if (!asset) {
    return c.json({ error: 'Asset not found' }, 404)
  }
  
  // Get associated brand_ids from asset_brands table
  const { results: brandResults } = await c.env.DB.prepare(`
    SELECT brand_id FROM asset_brands WHERE asset_id = ?
  `).bind(assetId).all()
  
  const brand_ids = brandResults.map((r: any) => r.brand_id)
  
  // Parse regions
  let regions = []
  if (asset.region) {
    try {
      regions = JSON.parse(asset.region as string)
    } catch {
      regions = [asset.region]
    }
  }
  
  return c.json({
    ...asset,
    brand_ids,
    regions
  })
})

app.post('/api/assets', async (c) => {
  const data = await c.req.json()
  
  console.log('📥 POST /api/assets - Creating new asset')
  console.log('📦 Request data:', JSON.stringify(data, null, 2))
  console.log('📝 Title:', data.title)
  console.log('📝 Description:', data.description)
  
  // Sanitize data: convert empty strings, undefined, and 'null' string to null
  const sanitize = (value: any) => {
    if (value === '' || value === undefined || value === 'undefined' || value === 'null' || value === null) return null
    return value
  }
  
  // First, create the asset record
  // Keep brand_id for backward compatibility (use first brand if multiple)
  const primaryBrandId = Array.isArray(data.brand_ids) && data.brand_ids.length > 0 
    ? data.brand_ids[0] 
    : sanitize(data.brand_id)
  
  // Handle regions (can be single or array)
  const regions = data.regions ? 
    (Array.isArray(data.regions) ? data.regions : [data.regions]) :
    (data.region ? [data.region] : [])
  
  // Convert regions array to JSON string for storage
  const regionString = regions.length > 0 ? JSON.stringify(regions) : null
  
  const result = await c.env.DB.prepare(`
    INSERT INTO assets (
      filename, original_filename, title, description, file_type, file_size, file_url,
      brand_id, sub_brand_id, material_type_id, region, country, regulatory, language,
      tags, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.filename,
    data.original_filename,
    sanitize(data.title),
    sanitize(data.description),
    data.file_type,
    data.file_size,
    data.file_url,
    primaryBrandId,
    sanitize(data.sub_brand_id),
    sanitize(data.material_type_id),
    regionString,  // Store as JSON string
    sanitize(data.country),
    sanitize(data.regulatory) || 'GLOBAL',
    sanitize(data.language) || 'ENG',
    data.tags ? JSON.stringify(data.tags) : null,
    data.created_by
  ).run()
  
  const assetId = result.meta.last_row_id
  
  console.log(`✅ Asset ${assetId} created with title: "${sanitize(data.title)}"`)
  
  // Now, insert all brand associations into asset_brands
  const brandIds = Array.isArray(data.brand_ids) ? data.brand_ids : (data.brand_id ? [data.brand_id] : [])
  
  if (brandIds.length > 0) {
    for (const brandId of brandIds) {
      if (brandId) {
        await c.env.DB.prepare(`
          INSERT OR IGNORE INTO asset_brands (asset_id, brand_id)
          VALUES (?, ?)
        `).bind(assetId, brandId).run()
      }
    }
  }
  
  console.log(`✅ Asset ${assetId} associated with brands: ${brandIds.join(', ')}`)
  
  return c.json({ success: true, id: assetId }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Clear-Site-Data': '"cache"',
      'X-Cache-Invalidate': 'all'
    }
  })
})

app.put('/api/assets/:id', async (c) => {
  const id = c.req.param('id')
  const data = await c.req.json()
  
  console.log('📥 PUT /api/assets/' + id)
  console.log('📦 RAW Request data:', data)
  console.log('📦 Request data (stringified):', JSON.stringify(data, null, 2))
  console.log('📊 Data types:')
  Object.keys(data).forEach(key => {
    console.log(`  ${key}: ${typeof data[key]} = ${data[key]}`)
  })
  
  try {
    // Sanitize data: convert empty strings, undefined, and literal string 'null' to null
    // BUT preserve actual text values (including whitespace-only if trimmed)
    const sanitize = (value: any) => {
      if (value === '' || value === undefined || value === 'undefined' || value === 'null' || value === null) {
        return null
      }
      // If it's a string, trim it and check if it's empty
      if (typeof value === 'string') {
        const trimmed = value.trim()
        return trimmed === '' ? null : trimmed
      }
      return value
    }
    
    // Handle brand_ids (can be single or array)
    const brandIds = data.brand_ids ? 
      (Array.isArray(data.brand_ids) ? data.brand_ids : [data.brand_ids]) :
      (data.brand_id ? [data.brand_id] : [])
    
    // Primary brand_id for backward compatibility (use first brand)
    const primaryBrandId = brandIds.length > 0 ? brandIds[0] : null
    
    // Handle regions (can be single or array)
    const regions = data.regions ? 
      (Array.isArray(data.regions) ? data.regions : [data.regions]) :
      (data.region ? [data.region] : [])
    
    // Convert regions array to JSON string for storage
    const regionString = regions.length > 0 ? JSON.stringify(regions) : null
    
    const sanitizedData = {
      title: sanitize(data.title),
      description: sanitize(data.description),
      brand_id: sanitize(primaryBrandId),
      material_type_id: sanitize(data.material_type_id),
      region: regionString,  // Store as JSON string
      country: sanitize(data.country),
      regulatory: sanitize(data.regulatory) || 'GLOBAL',
      language: sanitize(data.language) || 'ENG'
    }
    
    console.log('🧹 Sanitized data:', JSON.stringify(sanitizedData, null, 2))
    console.log('📝 Title sanitized:', {
      original: data.title,
      sanitized: sanitizedData.title,
      type: typeof sanitizedData.title
    })
    console.log('📝 Description sanitized:', {
      original: data.description,
      sanitized: sanitizedData.description,
      type: typeof sanitizedData.description
    })
    console.log('🏷️ Brand IDs to associate:', brandIds)
    
    const result = await c.env.DB.prepare(`
      UPDATE assets SET
        title = ?,
        description = ?,
        brand_id = ?,
        material_type_id = ?,
        region = ?,
        country = ?,
        regulatory = ?,
        language = ?
      WHERE id = ?
    `).bind(
      sanitizedData.title,
      sanitizedData.description,
      sanitizedData.brand_id,
      sanitizedData.material_type_id,
      sanitizedData.region,
      sanitizedData.country,
      sanitizedData.regulatory,
      sanitizedData.language,
      id
    ).run()
    
    console.log('✅ Update result:', result.meta.changes, 'row(s) affected')
    
    // Verify the update by reading back the asset
    const updatedAsset = await c.env.DB.prepare(`
      SELECT id, title, description FROM assets WHERE id = ?
    `).bind(id).first()
    console.log('🔍 Verified updated asset:', updatedAsset)
    
    // Update brand associations in asset_brands table
    // First, delete existing associations
    await c.env.DB.prepare(`
      DELETE FROM asset_brands WHERE asset_id = ?
    `).bind(id).run()
    
    // Then, insert new associations
    if (brandIds.length > 0) {
      for (const brandId of brandIds) {
        if (brandId) {
          await c.env.DB.prepare(`
            INSERT OR IGNORE INTO asset_brands (asset_id, brand_id)
            VALUES (?, ?)
          `).bind(id, brandId).run()
        }
      }
    }
    
    console.log(`✅ Asset ${id} now associated with brands: ${brandIds.join(', ')}`)
    
    return c.json({ success: true, changes: result.meta.changes }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Clear-Site-Data': '"cache"',
        'X-Cache-Invalidate': 'all'
      }
    })
  } catch (error: any) {
    console.error('❌ Error updating asset:', error.message)
    console.error('Stack:', error.stack)
    return c.json({ error: 'Failed to update asset', message: error.message }, 500)
  }
})

// Bulk edit assets
app.post('/api/assets/bulk-edit', async (c) => {
  try {
    const data = await c.req.json()
    const { asset_ids, operation, brand_ids } = data
    
    console.log('🔧 Bulk edit operation:', operation)
    console.log('📦 Assets:', asset_ids)
    console.log('🏷️  Brands:', brand_ids)
    
    if (!asset_ids || !Array.isArray(asset_ids) || asset_ids.length === 0) {
      return c.json({ error: 'asset_ids is required and must be a non-empty array' }, 400)
    }
    
    if (!operation) {
      return c.json({ error: 'operation is required' }, 400)
    }
    
    if (!brand_ids || !Array.isArray(brand_ids) || brand_ids.length === 0) {
      return c.json({ error: 'brand_ids is required and must be a non-empty array' }, 400)
    }
    
    let updatedCount = 0
    
    if (operation === 'set_brands') {
      // Replace all brands with the new ones
      for (const assetId of asset_ids) {
        // Update primary brand_id for backward compatibility
        await c.env.DB.prepare(`
          UPDATE assets SET brand_id = ? WHERE id = ?
        `).bind(brand_ids[0], assetId).run()
        
        // Delete existing brand associations
        await c.env.DB.prepare(`
          DELETE FROM asset_brands WHERE asset_id = ?
        `).bind(assetId).run()
        
        // Insert new brand associations
        for (const brandId of brand_ids) {
          await c.env.DB.prepare(`
            INSERT OR IGNORE INTO asset_brands (asset_id, brand_id)
            VALUES (?, ?)
          `).bind(assetId, brandId).run()
        }
        updatedCount++
      }
      
    } else if (operation === 'add_brands') {
      // Add brands to existing ones (no duplicates)
      for (const assetId of asset_ids) {
        for (const brandId of brand_ids) {
          await c.env.DB.prepare(`
            INSERT OR IGNORE INTO asset_brands (asset_id, brand_id)
            VALUES (?, ?)
          `).bind(assetId, brandId).run()
        }
        
        // Update primary brand_id if not set
        const asset = await c.env.DB.prepare(`
          SELECT brand_id FROM assets WHERE id = ?
        `).bind(assetId).first()
        
        if (!asset || !asset.brand_id) {
          await c.env.DB.prepare(`
            UPDATE assets SET brand_id = ? WHERE id = ?
          `).bind(brand_ids[0], assetId).run()
        }
        
        updatedCount++
      }
      
    } else if (operation === 'remove_brands') {
      // Remove specific brands from assets
      for (const assetId of asset_ids) {
        for (const brandId of brand_ids) {
          await c.env.DB.prepare(`
            DELETE FROM asset_brands WHERE asset_id = ? AND brand_id = ?
          `).bind(assetId, brandId).run()
        }
        
        // Update primary brand_id if the removed brand was the primary
        const asset = await c.env.DB.prepare(`
          SELECT brand_id FROM assets WHERE id = ?
        `).bind(assetId).first()
        
        if (asset && brand_ids.includes(asset.brand_id as number)) {
          // Get first remaining brand or set to null
          const { results: remainingBrands } = await c.env.DB.prepare(`
            SELECT brand_id FROM asset_brands WHERE asset_id = ? LIMIT 1
          `).bind(assetId).all()
          
          const newPrimaryBrand = remainingBrands.length > 0 ? (remainingBrands[0] as any).brand_id : null
          
          await c.env.DB.prepare(`
            UPDATE assets SET brand_id = ? WHERE id = ?
          `).bind(newPrimaryBrand, assetId).run()
        }
        
        updatedCount++
      }
      
    } else {
      return c.json({ error: 'Invalid operation. Must be: set_brands, add_brands, or remove_brands' }, 400)
    }
    
    console.log(`✅ Bulk edit completed: ${updatedCount} asset(s) updated`)
    
    return c.json({ 
      success: true, 
      updated: updatedCount,
      operation,
      message: `Successfully updated ${updatedCount} asset(s)`
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Clear-Site-Data': '"cache"',
        'X-Cache-Invalidate': 'all'
      }
    })
    
  } catch (error: any) {
    console.error('❌ Error in bulk edit:', error.message)
    console.error('Stack:', error.stack)
    return c.json({ error: 'Failed to bulk edit assets', message: error.message }, 500)
  }
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
  
  return c.json({ success: true }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Clear-Site-Data': '"cache"',
      'X-Cache-Invalidate': 'all'
    }
  })
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

// NEW: Initialize multipart upload for large files
app.post('/api/upload/start-multipart', async (c) => {
  try {
    const { filename, contentType } = await c.req.json()
    
    if (!filename) {
      return c.json({ error: 'Filename is required' }, 400)
    }
    
    // Generate unique filename
    const uniqueFilename = `${Date.now()}-${filename}`
    
    // Create multipart upload
    const multipartUpload = await c.env.R2.createMultipartUpload(uniqueFilename, {
      httpMetadata: {
        contentType: contentType || 'application/octet-stream'
      }
    })
    
    return c.json({
      success: true,
      uploadId: multipartUpload.uploadId,
      filename: uniqueFilename,
      key: multipartUpload.key
    })
  } catch (error) {
    console.error('Start multipart error:', error)
    return c.json({ error: 'Failed to start upload' }, 500)
  }
})

// NEW: Upload chunk endpoint using R2 multipart upload
app.post('/api/upload/chunk', async (c) => {
  try {
    const formData = await c.req.formData()
    const chunk = formData.get('chunk') as File
    const key = formData.get('key') as string
    const uploadId = formData.get('uploadId') as string
    const partNumber = parseInt(formData.get('partNumber') as string)
    
    if (!chunk || !key || !uploadId || !partNumber) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    // Get the multipart upload object
    const multipartUpload = c.env.R2.resumeMultipartUpload(key, uploadId)
    
    // Upload part using R2 multipart upload
    const buffer = await chunk.arrayBuffer()
    const uploadedPart = await multipartUpload.uploadPart(partNumber, buffer)
    
    return c.json({
      success: true,
      partNumber,
      etag: uploadedPart.etag
    })
  } catch (error) {
    console.error('Chunk upload error:', error)
    return c.json({ error: 'Failed to upload chunk' }, 500)
  }
})

// NEW: Complete multipart upload
app.post('/api/upload/complete-multipart', async (c) => {
  try {
    const { key, uploadId, parts } = await c.req.json()
    
    if (!key || !uploadId || !parts) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    // Get the multipart upload object
    const multipartUpload = c.env.R2.resumeMultipartUpload(key, uploadId)
    
    // Complete the multipart upload
    await multipartUpload.complete(parts)
    
    // Extract filename from key (remove timestamp prefix)
    const filename = key
    
    return c.json({
      success: true,
      filename,
      fileUrl: `/api/files/${filename}`
    })
  } catch (error) {
    console.error('Complete multipart error:', error)
    return c.json({ error: 'Failed to complete upload' }, 500)
  }
})

// NEW: Abort multipart upload (cleanup on error)
app.post('/api/upload/abort-multipart', async (c) => {
  try {
    const { key, uploadId } = await c.req.json()
    
    if (!key || !uploadId) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    // Get the multipart upload object
    const multipartUpload = c.env.R2.resumeMultipartUpload(key, uploadId)
    
    // Abort the upload
    await multipartUpload.abort()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Abort multipart error:', error)
    return c.json({ error: 'Failed to abort upload' }, 500)
  }
})

// Upload thumbnail for an asset
app.post('/api/assets/:id/thumbnail', async (c) => {
  try {
    const assetId = c.req.param('id')
    console.log('🖼️ Thumbnail upload for asset:', assetId)
    
    const formData = await c.req.formData()
    const file = formData.get('thumbnail') as File
    
    console.log('📦 FormData received:', {
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size
    })
    
    if (!file) {
      console.error('❌ No thumbnail file provided')
      return c.json({ error: 'No thumbnail file provided' }, 400)
    }
    
    // Validate file type (only images)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Invalid file type:', file.type)
      return c.json({ error: 'Invalid file type. Only JPG, PNG, and WebP are allowed' }, 400)
    }
    
    // Validate file size (max 500KB)
    const maxSize = 500 * 1024 // 500KB
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size)
      return c.json({ error: 'File too large. Maximum size is 500KB' }, 400)
    }
    
    // Generate thumbnail filename
    const extension = file.type.split('/')[1]
    const thumbnailKey = `thumbnails/${assetId}.${extension}`
    
    console.log('📤 Uploading to R2:', thumbnailKey)
    
    // Upload to R2
    const buffer = await file.arrayBuffer()
    await c.env.R2.put(thumbnailKey, buffer, {
      httpMetadata: {
        contentType: file.type
      }
    })
    
    console.log('✅ R2 upload successful')
    
    // Update asset with thumbnail URL
    const thumbnailUrl = `/api/files/${thumbnailKey}`
    
    console.log('📝 Updating DB with URL:', thumbnailUrl)
    
    const result = await c.env.DB.prepare(`
      UPDATE assets SET thumbnail_url = ? WHERE id = ?
    `).bind(thumbnailUrl, assetId).run()
    
    console.log('✅ DB update result:', {
      success: result.success,
      changes: result.meta.changes,
      thumbnailUrl: thumbnailUrl
    })
    
    return c.json({ 
      success: true, 
      thumbnailUrl 
    })
  } catch (error) {
    console.error('❌ Thumbnail upload error:', error)
    return c.json({ 
      error: 'Failed to upload thumbnail',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Delete thumbnail for an asset
app.delete('/api/assets/:id/thumbnail', async (c) => {
  try {
    const assetId = c.req.param('id')
    console.log('🗑️ Deleting thumbnail for asset:', assetId)
    
    // Get current thumbnail URL from DB
    const asset = await c.env.DB.prepare(`
      SELECT thumbnail_url FROM assets WHERE id = ?
    `).bind(assetId).first()
    
    if (!asset || !asset.thumbnail_url) {
      console.log('⚠️ No thumbnail found for asset:', assetId)
      return c.json({ error: 'No thumbnail found' }, 404)
    }
    
    // Extract the R2 key from the URL
    // URL format: /api/files/thumbnails/42.jpg
    const thumbnailKey = asset.thumbnail_url.replace('/api/files/', '')
    
    console.log('🗑️ Deleting from R2:', thumbnailKey)
    
    // Delete from R2
    await c.env.R2.delete(thumbnailKey)
    
    console.log('✅ R2 delete successful')
    
    // Update DB to remove thumbnail URL
    const result = await c.env.DB.prepare(`
      UPDATE assets SET thumbnail_url = NULL WHERE id = ?
    `).bind(assetId).run()
    
    console.log('✅ DB update result:', {
      success: result.success,
      changes: result.meta.changes
    })
    
    return c.json({ 
      success: true,
      message: 'Thumbnail deleted successfully'
    })
  } catch (error) {
    console.error('❌ Thumbnail delete error:', error)
    return c.json({ 
      error: 'Failed to delete thumbnail',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// ============================================
// API ROUTES - Analytics
// ============================================

// Track view event
app.post('/api/analytics/track/view', async (c) => {
  try {
    const { assetId, userId } = await c.req.json()
    
    console.log('👁️ Track view:', { assetId, userId })
    
    // Get user info
    const user = await c.env.DB.prepare(`
      SELECT email, name, role, region FROM users WHERE id = ? AND active = 1
    `).bind(userId).first()
    
    console.log('👤 User found:', user ? user.email : 'not found')
    
    // Get asset info
    const asset = await c.env.DB.prepare(`
      SELECT a.title, a.original_filename, a.brand_id, b.name as brand_name, 
             mt.name as material_type, a.file_type
      FROM assets a
      LEFT JOIN brands b ON a.brand_id = b.id
      LEFT JOIN material_types mt ON a.material_type_id = mt.id
      WHERE a.id = ?
    `).bind(assetId).first()
    
    console.log('📄 Asset found:', asset ? asset.title : 'not found')
    
    if (!asset) {
      return c.json({ error: 'Asset not found' }, 404)
    }
    
    // Insert analytics event
    const result = await c.env.DB.prepare(`
      INSERT INTO analytics_events 
      (event_type, asset_id, asset_title, user_id, user_email, user_name, user_role, 
       user_region, brand_id, brand_name, material_type, file_type, 
       ip_address, user_agent, referer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      'view',
      assetId,
      asset.title ?? asset.original_filename ?? null,
      userId,
      user?.email ?? null,
      user?.name ?? null,
      user?.role ?? null,
      user?.region ?? null,
      asset.brand_id ?? null,
      asset.brand_name ?? null,
      asset.material_type ?? null,
      asset.file_type ?? null,
      c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? null,
      c.req.header('User-Agent') ?? null,
      c.req.header('Referer') ?? null
    ).run()
    
    console.log('✅ View tracked successfully:', result.meta)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('❌ Analytics track view error:', error)
    return c.json({ error: 'Failed to track view', details: error.message }, 500)
  }
})

// Track download event
app.post('/api/analytics/track/download', async (c) => {
  try {
    const { assetId, userId } = await c.req.json()
    
    console.log('📥 Track download:', { assetId, userId })
    
    // Get user info
    const user = await c.env.DB.prepare(`
      SELECT email, name, role, region FROM users WHERE id = ? AND active = 1
    `).bind(userId).first()
    
    console.log('👤 User found:', user ? user.email : 'not found')
    
    // Get asset info
    const asset = await c.env.DB.prepare(`
      SELECT a.title, a.original_filename, a.brand_id, b.name as brand_name, 
             mt.name as material_type, a.file_type
      FROM assets a
      LEFT JOIN brands b ON a.brand_id = b.id
      LEFT JOIN material_types mt ON a.material_type_id = mt.id
      WHERE a.id = ?
    `).bind(assetId).first()
    
    console.log('📄 Asset found:', asset ? asset.title : 'not found')
    
    if (!asset) {
      return c.json({ error: 'Asset not found' }, 404)
    }
    
    // Insert analytics event
    const result = await c.env.DB.prepare(`
      INSERT INTO analytics_events 
      (event_type, asset_id, asset_title, user_id, user_email, user_name, user_role, 
       user_region, brand_id, brand_name, material_type, file_type, 
       ip_address, user_agent, referer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      'download',
      assetId,
      asset.title ?? asset.original_filename ?? null,
      userId,
      user?.email ?? null,
      user?.name ?? null,
      user?.role ?? null,
      user?.region ?? null,
      asset.brand_id ?? null,
      asset.brand_name ?? null,
      asset.material_type ?? null,
      asset.file_type ?? null,
      c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? null,
      c.req.header('User-Agent') ?? null,
      c.req.header('Referer') ?? null
    ).run()
    
    console.log('✅ Download tracked successfully:', result.meta)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('❌ Analytics track download error:', error)
    return c.json({ error: 'Failed to track download', details: error.message }, 500)
  }
})

// Get analytics stats (admin only)
app.get('/api/analytics/stats', async (c) => {
  try {
    const days = c.req.query('days') || '30'
    
    const stats = await c.env.DB.prepare(`
      SELECT 
        COUNT(CASE WHEN event_type = 'view' THEN 1 END) as total_views,
        COUNT(CASE WHEN event_type = 'download' THEN 1 END) as total_downloads,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT asset_id) as assets_accessed
      FROM analytics_events
      WHERE timestamp >= datetime('now', '-' || ? || ' days')
    `).bind(days).first()
    
    return c.json(stats)
  } catch (error) {
    console.error('Analytics stats error:', error)
    return c.json({ error: 'Failed to get stats' }, 500)
  }
})

// Get top assets
app.get('/api/analytics/top-assets', async (c) => {
  try {
    const days = c.req.query('days') || '30'
    const limit = c.req.query('limit') || '10'
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        asset_id,
        asset_title,
        brand_name,
        COUNT(CASE WHEN event_type = 'view' THEN 1 END) as views,
        COUNT(CASE WHEN event_type = 'download' THEN 1 END) as downloads
      FROM analytics_events
      WHERE timestamp >= datetime('now', '-' || ? || ' days')
      GROUP BY asset_id
      ORDER BY views DESC
      LIMIT ?
    `).bind(days, limit).all()
    
    return c.json({ assets: results })
  } catch (error) {
    console.error('Analytics top assets error:', error)
    return c.json({ error: 'Failed to get top assets' }, 500)
  }
})

// Get user activity
app.get('/api/analytics/by-user', async (c) => {
  try {
    const days = c.req.query('days') || '30'
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        user_email,
        user_name,
        user_role,
        COUNT(CASE WHEN event_type = 'view' THEN 1 END) as views,
        COUNT(CASE WHEN event_type = 'download' THEN 1 END) as downloads,
        MAX(timestamp) as last_activity
      FROM analytics_events
      WHERE user_id IS NOT NULL 
        AND timestamp >= datetime('now', '-' || ? || ' days')
      GROUP BY user_id
      ORDER BY views DESC
    `).bind(days).all()
    
    return c.json({ users: results })
  } catch (error) {
    console.error('Analytics by user error:', error)
    return c.json({ error: 'Failed to get user activity' }, 500)
  }
})

// Get activity by brand
app.get('/api/analytics/by-brand', async (c) => {
  try {
    const days = c.req.query('days') || '30'
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        brand_name,
        COUNT(CASE WHEN event_type = 'view' THEN 1 END) as views,
        COUNT(CASE WHEN event_type = 'download' THEN 1 END) as downloads
      FROM analytics_events
      WHERE brand_id IS NOT NULL 
        AND timestamp >= datetime('now', '-' || ? || ' days')
      GROUP BY brand_id
      ORDER BY views DESC
    `).bind(days).all()
    
    return c.json({ brands: results })
  } catch (error) {
    console.error('Analytics by brand error:', error)
    return c.json({ error: 'Failed to get brand activity' }, 500)
  }
})

// Get timeline
app.get('/api/analytics/timeline', async (c) => {
  try {
    const days = c.req.query('days') || '30'
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        DATE(timestamp) as date,
        COUNT(CASE WHEN event_type = 'view' THEN 1 END) as views,
        COUNT(CASE WHEN event_type = 'download' THEN 1 END) as downloads
      FROM analytics_events
      WHERE timestamp >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `).bind(days).all()
    
    return c.json({ timeline: results })
  } catch (error) {
    console.error('Analytics timeline error:', error)
    return c.json({ error: 'Failed to get timeline' }, 500)
  }
})

// Get all assets with analytics
app.get('/api/analytics/all-assets', async (c) => {
  try {
    const days = c.req.query('days') || '30'
    
    // Optimized query using LEFT JOINs instead of correlated subqueries
    const { results } = await c.env.DB.prepare(`
      SELECT 
        a.id,
        a.title,
        a.original_filename,
        a.brand_id,
        b.name as brand_name,
        b.display_name as brand_display_name,
        mt.name as material_type,
        COALESCE(SUM(CASE WHEN ae.event_type = 'view' THEN 1 ELSE 0 END), 0) as views,
        COALESCE(SUM(CASE WHEN ae.event_type = 'download' THEN 1 ELSE 0 END), 0) as downloads,
        MAX(ae.timestamp) as last_activity,
        a.created_at
      FROM assets a
      LEFT JOIN brands b ON a.brand_id = b.id
      LEFT JOIN material_types mt ON a.material_type_id = mt.id
      LEFT JOIN analytics_events ae ON ae.asset_id = a.id 
        AND ae.timestamp >= datetime('now', '-' || ? || ' days')
      GROUP BY a.id, a.title, a.original_filename, a.brand_id, b.name, b.display_name, mt.name, a.created_at
      ORDER BY views DESC, downloads DESC, a.created_at DESC
    `).bind(days).all()
    
    return c.json({ assets: results })
  } catch (error) {
    console.error('Analytics all assets error:', error)
    return c.json({ error: 'Failed to get all assets analytics', details: error.message }, 500)
  }
})

app.get('/api/files/:filename{.*}', async (c) => {
  const filename = c.req.param('filename')
  
  console.log('📁 Requesting file:', filename)
  
  const object = await c.env.R2.get(filename)
  
  if (!object) {
    console.log('❌ File not found in R2:', filename)
    return c.notFound()
  }
  
  console.log('✅ File found in R2:', filename)
  
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
  
  // Get token from header
  const token = c.req.header('Authorization')?.replace('Bearer ', '') || c.req.query('token')
  
  let userBrandsAccess: number[] = []
  let userRegions: string[] = []
  let isAdmin = false
  
  // If token exists, get user's brands_access and regions
  if (token) {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [userId] = decoded.split(':')
      
      const user = await c.env.DB.prepare(`
        SELECT brands_access, region, role FROM users WHERE id = ? AND active = 1
      `).bind(userId).first()
      
      if (user) {
        // Only admin sees all brands and regions
        if (user.role === 'admin') {
          isAdmin = true
        } else {
          // Parse brands_access
          try {
            userBrandsAccess = typeof user.brands_access === 'string'
              ? JSON.parse(user.brands_access)
              : (user.brands_access || [])
          } catch (e) {
            userBrandsAccess = []
          }
          
          // Parse user regions
          if (user.region) {
            try {
              // Try to parse as JSON array (new format)
              userRegions = JSON.parse(user.region as string)
            } catch {
              // Fallback: treat as single region (old format)
              userRegions = [user.region as string]
            }
          }
        }
      }
    } catch (e) {
      console.error('Error parsing token:', e)
    }
  }
  
  let query = `
    SELECT 
      a.*,
      b.display_name as brand_name,
      b.color as brand_color,
      sb.display_name as sub_brand_name,
      mt.display_name_en as material_type_name,
      mt.icon as material_type_icon
    FROM assets a
    LEFT JOIN brands b ON a.brand_id = b.id
    LEFT JOIN sub_brands sb ON a.sub_brand_id = sb.id
    LEFT JOIN material_types mt ON a.material_type_id = mt.id
    WHERE 1=1
  `
  
  const params: any[] = []
  
  // 🎯 CRITICAL: If user has no brand access and is not admin, return empty results immediately
  if (!isAdmin && userBrandsAccess.length === 0) {
    return c.json({ assets: [] })
  }
  
  // Filter by brands_access if user is not admin
  if (!isAdmin && userBrandsAccess.length > 0) {
    const placeholders = userBrandsAccess.map(() => '?').join(',')
    query += ` AND a.brand_id IN (${placeholders})`
    params.push(...userBrandsAccess)
  }
  
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
  
  // Add brand_ids and regions to each asset
  const assetsWithBrandsAndRegions = await Promise.all(
    (result.results || []).map(async (asset: any) => {
      const { results: brandResults } = await c.env.DB.prepare(`
        SELECT brand_id FROM asset_brands WHERE asset_id = ?
      `).bind(asset.id).all()
      
      // Parse regions from JSON string to array
      let regions = []
      if (asset.region) {
        try {
          regions = JSON.parse(asset.region)
        } catch {
          regions = [asset.region]
        }
      }
      
      return {
        ...asset,
        brand_ids: brandResults.map((b: any) => b.brand_id),
        regions: regions
      }
    })
  )
  
  // Apply brand and region filtering
  let filteredAssets = assetsWithBrandsAndRegions
  
  if (!isAdmin && (userBrandsAccess.length > 0 || userRegions.length > 0)) {
    filteredAssets = assetsWithBrandsAndRegions.filter((asset: any) => {
      // Check brand access
      let hasBrandAccess = false
      
      if (userBrandsAccess.length === 0) {
        // No brand restriction (shouldn't happen for non-admin)
        hasBrandAccess = true
      } else {
        // IMPORTANT: Check primary brand_id first
        // If user doesn't have access to primary brand, deny access even if asset has other brands
        if (asset.brand_id && !userBrandsAccess.includes(asset.brand_id)) {
          hasBrandAccess = false
        } else {
          // Check if asset has at least one brand_id in user's brands_access
          if (asset.brand_ids && asset.brand_ids.length > 0) {
            hasBrandAccess = asset.brand_ids.some((brandId: number) => userBrandsAccess.includes(brandId))
          } else if (asset.brand_id) {
            // Fallback to old brand_id field
            hasBrandAccess = userBrandsAccess.includes(asset.brand_id)
          }
        }
      }
      
      // Check region access
      let hasRegionAccess = false
      
      if (userRegions.length === 0) {
        // No region restriction (shouldn't happen for non-admin, but allow)
        hasRegionAccess = true
      } else if (!asset.regions || asset.regions.length === 0) {
        // Asset has no regions specified: allow access
        hasRegionAccess = true
      } else {
        // Check if asset has GLOBAL or any region matching user's regions
        if (asset.regions.includes('GLOBAL')) {
          hasRegionAccess = true
        } else {
          // Check if any asset region matches user's regions (case-insensitive)
          hasRegionAccess = asset.regions.some((assetRegion: string) => 
            userRegions.some((userRegion: string) => 
              assetRegion.toUpperCase() === userRegion.toUpperCase()
            )
          )
        }
      }
      
      // Asset must pass BOTH brand and region checks
      return hasBrandAccess && hasRegionAccess
    })
  }
  
  return c.json({ assets: filteredAssets })
})

// Public brands list
app.get('/api/public/brands', async (c) => {
  try {
    // Get token from header or query
    const token = c.req.header('Authorization')?.replace('Bearer ', '') || c.req.query('token')
    
    let userBrandsAccess: number[] = []
    let isAdmin = false
    
    // If token exists, get user's brands_access
    if (token) {
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8')
        const [userId] = decoded.split(':')
        
        const user = await c.env.DB.prepare(`
          SELECT brands_access, role FROM users WHERE id = ? AND active = 1
        `).bind(userId).first()
        
        if (user) {
          // Only admin sees all brands
          if (user.role === 'admin') {
            isAdmin = true
            userBrandsAccess = []
          } else {
            // Parse brands_access
            try {
              userBrandsAccess = typeof user.brands_access === 'string'
                ? JSON.parse(user.brands_access)
                : (user.brands_access || [])
            } catch (e) {
              userBrandsAccess = []
            }
          }
        }
      } catch (e) {
        console.error('Error parsing token:', e)
      }
    }
    
    // 🎯 CRITICAL: If user has no brand access and is not admin, return empty
    if (!isAdmin && userBrandsAccess.length === 0) {
      return c.json({ brands: [] })
    }
    
    // Build query
    let query = `SELECT * FROM brands WHERE active = 1`
    const params: any[] = []
    
    // Filter by brands_access if user is not admin
    if (!isAdmin && userBrandsAccess.length > 0) {
      const placeholders = userBrandsAccess.map(() => '?').join(',')
      query += ` AND id IN (${placeholders})`
      params.push(...userBrandsAccess)
    }
    
    query += ` ORDER BY display_name`
    
    const result = await c.env.DB.prepare(query).bind(...params).all()
    
    return c.json({ brands: result.results || [] })
  } catch (error: any) {
    console.error('Error fetching public brands:', error)
    return c.json({ brands: [] })
  }
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

// Public request form submission
app.post('/api/public/request', async (c) => {
  try {
    const body = await c.req.json()
    const { name, email, subject, message, language } = body
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return c.json({ success: false, error: 'Missing required fields' }, 400)
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return c.json({ success: false, error: 'Invalid email format' }, 400)
    }
    
    // Insert request into database
    const result = await c.env.DB.prepare(`
      INSERT INTO user_requests (name, email, subject, message, language, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))
    `).bind(name, email, subject, message, language || 'en').run()
    
    // TODO: Send email notification to admin
    // This would require email service integration (SendGrid, Mailgun, etc.)
    
    return c.json({ 
      success: true, 
      message: 'Request submitted successfully',
      requestId: result.meta.last_row_id 
    })
  } catch (error) {
    console.error('Error submitting request:', error)
    return c.json({ success: false, error: 'Internal server error' }, 500)
  }
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="/static/styles.css?v=4" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
      </head>
      <body>
        <div id="app"></div>
        <script src="/static/app.js?v=20"></script>
      </body>
    </html>
  )
})

// Edit asset page (dedicated page, no modal)
app.get('/admin/edit-asset/:id', async (c) => {
  const { generateEditAssetHTML } = await import('./edit-asset-template')
  const assetId = c.req.param('id')
  
  try {
    // Fetch asset data
    const asset = await c.env.DB.prepare(`
      SELECT a.*, 
             b.display_name as brand_name,
             mt.display_name_en as material_type_name
      FROM assets a
      LEFT JOIN brands b ON a.brand_id = b.id
      LEFT JOIN material_types mt ON a.material_type_id = mt.id
      WHERE a.id = ?
    `).bind(assetId).first()
    
    if (!asset) {
      return c.text('Asset not found', 404)
    }
    
    // Parse regions
    let regions: string[] = []
    if (asset.region) {
      try {
        regions = JSON.parse(asset.region as string)
      } catch {
        regions = [asset.region as string]
      }
    }
    
    // Get all brands
    const { results: brands } = await c.env.DB.prepare(`
      SELECT id, display_name FROM brands ORDER BY display_name
    `).all()
    
    // Get material types
    const { results: materialTypes } = await c.env.DB.prepare(`
      SELECT id, display_name_en FROM material_types ORDER BY display_name_en
    `).all()
    
    // Get asset's brand associations
    const { results: assetBrands } = await c.env.DB.prepare(`
      SELECT brand_id FROM asset_brands WHERE asset_id = ?
    `).bind(assetId).all()
    
    const selectedBrandIds = assetBrands.map((b: any) => b.brand_id)
    
    const html = generateEditAssetHTML(asset, brands as any[], materialTypes as any[], selectedBrandIds, regions)
    return c.html(html)
  } catch (error) {
    console.error('Edit asset error:', error)
    return c.text('Internal Server Error: ' + error.message, 500)
  }
})


// Admin panel (login required)
app.get('/admin', (c) => {
  return c.html(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Brand Portal - Admin Panel</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="/static/style.css?v=4" rel="stylesheet" />
      </head>
      <body class="bg-gray-50">
        <div id="app"></div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js?v=20"></script>
      </body>
    </html>
  )
})

// Public catalog page (no login required)
// ============================================
// Public Catalog Authentication
// ============================================

app.post('/api/public/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    console.log('📥 Public login attempt:', email)
    
    // Verify credentials against users table
    const user = await c.env.DB.prepare(`
      SELECT id, email, name, role, active, password_hash
      FROM users
      WHERE email = ? AND active = 1
    `).bind(email).first()
    
    if (!user || user.password_hash !== password) {
      return c.json({ success: false, message: 'Invalid credentials' }, 401)
    }
    
    // Generate simple token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64')
    
    return c.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error: any) {
    console.error('❌ Login error:', error.message)
    return c.json({ success: false, message: 'Login failed' }, 500)
  }
})

// Public login endpoint (for catalog users)
app.post('/api/public/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ success: false, message: 'Email y contraseña son requeridos' }, 400)
    }
    
    // Find user
    const user = await c.env.DB.prepare(`
      SELECT id, email, password_hash, name, role, region, country, language, brands_access, active
      FROM users
      WHERE email = ? AND active = 1
    `).bind(email).first()
    
    if (!user) {
      return c.json({ success: false, message: 'Credenciales inválidas' }, 401)
    }
    
    // Check password (in production, use bcrypt.compare)
    // For now, we'll check against the stored password_hash
    if (!user.password_hash || user.password_hash !== password) {
      return c.json({ success: false, message: 'Credenciales inválidas' }, 401)
    }
    
    // Update last login
    await c.env.DB.prepare(`
      UPDATE users SET last_login = datetime('now') WHERE id = ?
    `).bind(user.id).run()
    
    // Log activity
    await c.env.DB.prepare(`
      INSERT INTO activity_log (user_id, action, details)
      VALUES (?, 'login', ?)
    `).bind(user.id, `User logged in from catalog: ${email}`).run()
    
    // Generate simple token (base64 encoded user_id:timestamp)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
    
    // Parse brands_access if it's a string
    let brandsAccess = []
    if (user.brands_access) {
      try {
        brandsAccess = typeof user.brands_access === 'string' 
          ? JSON.parse(user.brands_access) 
          : user.brands_access
      } catch (e) {
        brandsAccess = []
      }
    }
    
    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        region: user.region,
        country: user.country,
        language: user.language,
        brands_access: brandsAccess
      }
    })
  } catch (error: any) {
    console.error('Public login error:', error)
    return c.json({ success: false, message: 'Error al iniciar sesión' }, 500)
  }
})

app.post('/api/public/verify-token', async (c) => {
  try {
    const { token } = await c.req.json()
    
    if (!token) {
      return c.json({ valid: false }, 401)
    }
    
    // Decode token
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [userId] = decoded.split(':')
    
    // Verify user still exists and is active
    const user = await c.env.DB.prepare(`
      SELECT id, email, name, role
      FROM users
      WHERE id = ? AND active = 1
    `).bind(userId).first()
    
    if (!user) {
      return c.json({ valid: false }, 401)
    }
    
    return c.json({ valid: true, user })
  } catch (error) {
    return c.json({ valid: false }, 401)
  }
})

// ============================================
// Public Catalog Routes (Protected)
// ============================================

// Login page
app.get('/login', (c) => {
  return c.html(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Login - Proteos Biotech Brand Portal</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet" />
        <link href="/static/catalog-login.css" rel="stylesheet" />
      </head>
      <body>
        <div class="login-container">
          <div class="login-left">
            <div class="login-form-wrapper">
              <div class="login-header">
                <h2 class="login-title">Login required</h2>
                <div class="login-subtitle">
                  <div class="blue-bar"></div>
                  <p>Find all the files, templates, and resources you need.</p>
                </div>
              </div>
              <form id="login-form" class="login-form">
                <div class="form-group">
                  <label class="form-label">Username or email address *</label>
                  <input type="text" id="username" class="form-input" placeholder="admin" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Password *</label>
                  <input type="password" id="password" class="form-input" placeholder="••••••••••" required />
                </div>
                <div class="form-group-checkbox">
                  <label class="checkbox-label">
                    <input type="checkbox" id="remember" />
                    <span>Remember me</span>
                  </label>
                </div>
                <button type="submit" class="login-button">Login</button>
                <div class="login-footer">
                  <a href="/change-password" class="forgot-password">Lost your password?</a>
                </div>
              </form>
              <div id="error-message" class="error-message" style="display: none;"></div>
            </div>
          </div>
          <div class="login-right">
            <div class="welcome-content">
              <h3 class="welcome-subtitle">Welcome to</h3>
              <h1 class="welcome-title">PROTEOS BIOTECH Brand Portal</h1>
              <div class="hero-image">
                <div class="image-placeholder"></div>
              </div>
            </div>
          </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/catalog-login.js"></script>
      </body>
    </html>
  )
})

// Single Asset Page (shareable URL - requires login)
app.get('/asset/:id', (c) => {
  const assetId = c.req.param('id')
  
  return c.html(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Asset - Proteos Biotech Brand Portal</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Manrope', sans-serif;
            background: linear-gradient(135deg, #002f57 0%, #004080 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          
          .container {
            max-width: 800px;
            width: 100%;
            background: white;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #002f57 0%, #004080 100%);
            padding: 2rem;
            color: white;
            text-align: center;
          }
          
          .header h1 {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }
          
          .header p {
            opacity: 0.9;
            font-size: 0.95rem;
          }
          
          .content {
            padding: 2.5rem;
          }
          
          .loading {
            text-align: center;
            padding: 3rem;
            color: #666;
          }
          
          .loading i {
            font-size: 3rem;
            color: #002f57;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          .auth-required {
            text-align: center;
            padding: 3rem;
          }
          
          .auth-required i {
            font-size: 4rem;
            color: #f59e0b;
            margin-bottom: 1.5rem;
          }
          
          .auth-required h2 {
            font-size: 1.75rem;
            color: #1a202c;
            margin-bottom: 1rem;
          }
          
          .auth-required p {
            color: #4a5568;
            margin-bottom: 2rem;
            font-size: 1.1rem;
          }
          
          .btn {
            padding: 1rem 2rem;
            border-radius: 12px;
            border: none;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            text-decoration: none;
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #002f57 0%, #004080 100%);
            color: white;
          }
          
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 47, 87, 0.4);
          }
          
          .asset-preview {
            text-align: center;
            margin-bottom: 2rem;
            background: #ffffff;
            padding: 0;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          
          .asset-preview img {
            width: 100%;
            height: auto;
            max-height: 500px;
            object-fit: cover;
            display: block;
          }
          
          .asset-preview i {
            font-size: 8rem;
            color: #cbd5e0;
            margin: 4rem 0;
            opacity: 0.5;
          }
          
          .asset-info {
            margin-bottom: 1.5rem;
          }
          
          .asset-title {
            font-size: 2rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 0.75rem;
            line-height: 1.2;
          }
          
          .asset-description {
            color: #4a5568;
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 1.5rem;
          }
          
          .asset-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 12px;
          }
          
          .meta-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .meta-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #718096;
            font-weight: 600;
          }
          
          .meta-value {
            font-size: 1rem;
            color: #1a202c;
            font-weight: 600;
          }
          
          .brand-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            font-size: 0.9rem;
          }
          
          .actions {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
          }
          
          .btn-secondary {
            background: white;
            color: #2d3748;
            border: 2px solid #e2e8f0;
          }
          
          .btn-secondary:hover {
            background: #f8f9fa;
            border-color: #cbd5e0;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .btn-icon {
            background: white;
            color: #4a5568;
            border: 2px solid #e2e8f0;
            padding: 0.75rem;
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
          }
          
          .btn-icon:hover {
            background: #f8f9fa;
            border-color: #cbd5e0;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .btn-icon.copied {
            background: #10b981;
            color: white;
            border-color: #10b981;
          }
          
          .file-info-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.25rem;
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-size: 0.95rem;
            font-weight: 600;
            color: #4a5568;
          }
          
          .error {
            text-align: center;
            padding: 3rem;
            color: #e53e3e;
          }
          
          .error i {
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          
          .error h2 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }
          
          @media (max-width: 640px) {
            .actions {
              flex-direction: column;
            }
            
            .btn {
              width: 100%;
            }
          }
        `}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1><i class="fas fa-layer-group"></i> Proteos Biotech</h1>
            <p>Brand Asset Center</p>
          </div>
          
          <div class="content">
            <div id="auth-check" class="auth-required">
              <i class="fas fa-lock"></i>
              <h2>Login Required</h2>
              <p>Please login to view this asset</p>
              
              <form id="login-form" style="max-width: 400px; margin: 2rem auto 0;">
                <div style="margin-bottom: 1rem;">
                  <input 
                    type="email" 
                    id="asset-login-email" 
                    placeholder="Email" 
                    required
                    style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem;"
                  />
                </div>
                <div style="margin-bottom: 1.5rem;">
                  <input 
                    type="password" 
                    id="asset-login-password" 
                    placeholder="Password" 
                    required
                    style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem;"
                  />
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">
                  <i class="fas fa-sign-in-alt"></i>
                  Login
                </button>
                <div id="login-error" style="display: none; margin-top: 1rem; padding: 0.75rem; background: #fee; color: #c53030; border-radius: 8px; font-size: 0.9rem;"></div>
              </form>
            </div>
            
            <div id="loading" class="loading" style="display: none;">
              <i class="fas fa-spinner"></i>
              <p>Loading asset...</p>
            </div>
            
            <div id="asset-content" style="display: none;"></div>
            
            <div id="error" style="display: none;" class="error">
              <i class="fas fa-exclamation-circle"></i>
              <h2>Asset Not Found</h2>
              <p>This asset doesn't exist or you don't have permission to view it.</p>
            </div>
            
            <div id="no-access" style="display: none;" class="error">
              <i class="fas fa-ban"></i>
              <h2>Access Denied</h2>
              <p>You don't have permission to view this asset. Please contact your administrator.</p>
              <a href="/catalog" class="btn btn-primary" style="margin-top: 1.5rem;">
                <i class="fas fa-th"></i>
                Back to Catalog
              </a>
            </div>
          </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            const assetId = ${assetId};
            
            // Handle login form submission
            document.getElementById('login-form').addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const email = document.getElementById('asset-login-email').value;
              const password = document.getElementById('asset-login-password').value;
              const loginError = document.getElementById('login-error');
              
              try {
                const response = await axios.post('/api/auth/login', {
                  email,
                  password
                });
                
                if (response.data && response.data.success) {
                  // Save user ID to localStorage for session persistence
                  localStorage.setItem('userId', response.data.user.id);
                  
                  // Login successful, reload the page to show asset
                  window.location.reload();
                } else {
                  loginError.textContent = 'Invalid credentials';
                  loginError.style.display = 'block';
                }
              } catch (error) {
                console.error('Login error:', error);
                loginError.textContent = 'Invalid email or password';
                loginError.style.display = 'block';
              }
            });
            
            // Check authentication
            async function checkAuth() {
              try {
                // Get userId from localStorage
                const userId = localStorage.getItem('userId');
                if (!userId) {
                  return null;
                }
                
                const response = await axios.get('/api/auth/me?userId=' + userId);
                if (response.data && response.data.user) {
                  return response.data.user;
                }
                return null;
              } catch (error) {
                return null;
              }
            }
            
            async function loadAsset(user) {
              try {
                console.log('Loading asset:', assetId);
                const response = await axios.get('/api/assets/' + assetId);
                const asset = response.data;
                console.log('Asset loaded:', asset);
                
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
                console.error('Error loading asset:', error);
                document.getElementById('loading').style.display = 'none';
                document.getElementById('error').style.display = 'block';
              }
            }
            
            async function trackView(assetId, userId) {
              try {
                await axios.post('/api/analytics/track/view', {
                  assetId,
                  userId
                });
              } catch (error) {
                console.error('Failed to track view:', error);
              }
            }
            
            function checkAssetAccess(user, asset) {
              // Admin has access to everything
              if (user.role === 'admin') {
                return true;
              }
              
              // Parse user's brands_access
              let userBrands = [];
              try {
                userBrands = typeof user.brands_access === 'string' 
                  ? JSON.parse(user.brands_access) 
                  : (user.brands_access || []);
              } catch (e) {
                userBrands = [];
              }
              
              // Check if user has access to any of the asset's brands
              if (asset.brand_ids && asset.brand_ids.length > 0) {
                const hasAccess = asset.brand_ids.some(brandId => userBrands.includes(brandId));
                if (!hasAccess && asset.brand_id && !userBrands.includes(asset.brand_id)) {
                  return false;
                }
              } else if (asset.brand_id && !userBrands.includes(asset.brand_id)) {
                return false;
              }
              
              return true;
            }
            
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
                preview = '<i class="fas fa-file-pdf" style="color: #dc2626;"></i>';
              } else if (isVideo) {
                preview = '<i class="fas fa-file-video" style="color: #7c3aed;"></i>';
              } else {
                preview = '<i class="fas fa-file"></i>';
              }
              
              const fileSize = (asset.file_size / 1024).toFixed(2);
              const fileSizeUnit = asset.file_size > 1024 * 1024 ? ((asset.file_size / (1024 * 1024)).toFixed(2) + ' MB') : (fileSize + ' KB');
              
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
                    '<div class="meta-value">' + (asset.file_type?.split('/')[1]?.toUpperCase() || 'N/A') + '</div>' +
                  '</div>' +
                  '<div class="meta-item">' +
                    '<div class="meta-label">File Size</div>' +
                    '<div class="meta-value">' + fileSizeUnit + '</div>' +
                  '</div>' +
                '</div>' +
                '<div class="actions" style="align-items: center;">' +
                  '<a id="download-btn" href="' + asset.file_url + '" download class="btn btn-primary" style="flex: 1; min-width: 200px;">' +
                    '<i class="fas fa-download"></i> Download Asset' +
                  '</a>' +
                  '<button id="copy-link-btn" class="btn-icon" title="Copy link" onclick="copyAssetLink(\'' + shareUrl + '\')">' +
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
              
              document.title = (asset.title || asset.original_filename) + ' - Proteos Biotech';
            }
            
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
            
            async function trackDownload(assetId) {
              try {
                const userId = localStorage.getItem('userId');
                if (!userId) return;
                
                await axios.post('/api/analytics/track/download', {
                  assetId,
                  userId
                });
              } catch (error) {
                console.error('Failed to track download:', error);
              }
            }
            
            // Initialize
            async function init() {
              const user = await checkAuth();
              
              if (user) {
                // User is logged in, load asset and check permissions
                document.getElementById('auth-check').style.display = 'none';
                document.getElementById('loading').style.display = 'block';
                await loadAsset(user);
              } else {
                // User is not logged in, show login form
                document.getElementById('auth-check').style.display = 'block';
              }
            }
            
            init();
          })();
        `}} />
      </body>
    </html>
  )
})

// Catalog page (redirect to login or serve catalog)
app.get('/catalog', (c) => {
  return c.html(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Proteos Biotech - Brand Portal</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="/static/catalog.css?v=6" rel="stylesheet" />
      </head>
      <body>
        <div id="catalog"></div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/catalog.js?v=11"></script>
      </body>
    </html>
  )
})

// Brand page - Show all assets from a specific brand
app.get('/brand/:brandName', (c) => {
  const brandName = c.req.param('brandName')
  
  return c.html(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{brandName} - Proteos Biotech Brand Portal</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="/static/catalog.css?v=7" rel="stylesheet" />
      </head>
      <body>
        <div id="catalog"></div>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script dangerouslySetInnerHTML={{__html: `
          window.BRAND_FILTER = '${brandName}';
        `}} />
        <script src="/static/catalog.js?v=12"></script>
      </body>
    </html>
  )
})

// Root redirects to login
app.get('/', (c) => {
  return c.redirect('/login')
})

export default app
