# Brand Portal - Sistema de Rutas

## 🌍 Rutas Públicas vs Privadas

### **Página Pública (Sin Login)**
**URL**: `/` (raíz)
- **Título**: Proteos Biotech - Brand Materials Catalog
- **Funcionalidad**: Catálogo público para que CUALQUIER visitante pueda ver y descargar materiales
- **Características**:
  - Hero banner con estadísticas
  - Filtros por marca, tipo de material y región
  - Búsqueda de texto completo
  - Descargas directas sin autenticación
  - Botón "Admin Login" para ir al panel privado

### **Panel de Administración (Requiere Login)**
**URL**: `/admin`
- **Título**: Brand Portal - Admin Panel
- **Funcionalidad**: Panel completo de gestión para usuarios autenticados
- **Características**:
  - Login obligatorio
  - Dashboard con estadísticas
  - Gestión de usuarios (solo admin)
  - Subida de archivos (admin y marketing)
  - Biblioteca de assets con permisos
  - Gestión de contraseñas (admin)

---

## 🔌 API Endpoints

### **APIs Públicas** (Sin autenticación)
```
GET /api/public/brands          → Lista de marcas activas
GET /api/public/material-types  → Lista de tipos de material
GET /api/public/assets          → Búsqueda/filtrado de assets
GET /api/public/stats           → Estadísticas del catálogo
```

**Parámetros para /api/public/assets**:
- `brand_id` - Filtrar por marca específica
- `material_type_id` - Filtrar por tipo de material
- `region` - Filtrar por región (GLOBAL, USA, LATAM, EUROPA, MENA, ASIA)
- `search` - Búsqueda de texto en título, descripción y nombre de archivo

**Ejemplo**:
```bash
curl "http://localhost:3000/api/public/assets?brand_id=2&region=LATAM"
```

### **APIs Privadas** (Requieren autenticación)
```
POST /api/auth/login                → Iniciar sesión
GET  /api/auth/session              → Verificar sesión
GET  /api/brands                    → Lista completa de marcas
GET  /api/material-types            → Tipos de material con idioma
GET  /api/assets                    → Assets con permisos de usuario
POST /api/assets                    → Crear nuevo asset (admin/marketing)
DELETE /api/assets/:id              → Eliminar asset (admin)
POST /api/upload                    → Subir archivo a R2 (admin/marketing)
GET  /api/users                     → Lista de usuarios (admin)
POST /api/users                     → Crear usuario (admin)
PUT  /api/users/:id                 → Actualizar usuario (admin)
DELETE /api/users/:id               → Eliminar usuario (admin)
GET  /api/users/:id/password        → Ver contraseña (admin)
PUT  /api/users/:id/password        → Cambiar contraseña (admin/propio)
POST /api/users/:id/reset-password  → Resetear contraseña (admin)
```

---

## 🎯 Casos de Uso

### **Caso 1: Visitante Público**
1. Usuario entra a la URL principal `/`
2. Ve el catálogo completo de materiales sin login
3. Puede filtrar por marca, tipo, región
4. Descarga cualquier material directamente
5. No necesita cuenta ni permisos

**Ejemplo de flujo**:
```
Visitante → https://your-domain.com
         → Ve todos los materiales de pbserum
         → Filtra por "Packshots"
         → Descarga PDF de catálogo
         → Sin necesidad de login
```

### **Caso 2: Distribuidor (Cuenta Básica)**
1. Usuario tiene cuenta creada por admin
2. Entra a `/admin`
3. Hace login con email y contraseña
4. Ve solo las marcas asignadas en `brands_access`
5. Puede descargar materiales de sus marcas
6. NO puede subir archivos ni crear usuarios

**Ejemplo de flujo**:
```
Distribuidor → https://your-domain.com/admin
            → Login: maria@distributor.com
            → Ve solo marca "WAID" (asignada)
            → Descarga materiales de WAID
            → NO ve otras marcas
```

### **Caso 3: Administrador**
1. Usuario admin entra a `/admin`
2. Hace login con credenciales de admin
3. Acceso completo al panel:
   - Dashboard con todas las estadísticas
   - Gestión de usuarios (crear, editar, eliminar)
   - Ver y cambiar contraseñas de usuarios
   - Subir nuevos materiales
   - Eliminar assets
   - Ver todas las marcas

**Ejemplo de flujo**:
```
Admin → https://your-domain.com/admin
      → Login: admin@proteos.com
      → Dashboard: ve 61 usuarios, 0 assets, 4 marcas
      → Users: crea nuevo distribuidor
      → Asigna acceso a marca "pbserum"
      → Gestiona contraseña del usuario
      → Upload: sube nuevo catálogo PDF
```

---

## 📁 Estructura de Archivos

### **Frontend Público**
```
/public/static/catalog.js     → JavaScript del catálogo público
```

### **Frontend Privado**
```
/public/static/app.js         → JavaScript del panel admin
/public/static/style.css      → CSS personalizado
```

### **Backend**
```
/src/index.tsx                → Rutas y APIs principales
/src/renderer.tsx             → Renderizado JSX (no usado actualmente)
```

---

## 🔄 Flujo de Navegación

```
┌─────────────────────────────────────┐
│  https://your-domain.com/           │
│  (Catálogo Público)                 │
│  - No requiere login                │
│  - catalog.js                       │
└─────────────┬───────────────────────┘
              │
              │ Click "Admin Login"
              │
              ▼
┌─────────────────────────────────────┐
│  https://your-domain.com/admin      │
│  (Panel Administración)             │
│  - Requiere login                   │
│  - app.js                           │
└─────────────────────────────────────┘
```

---

## 🚀 Ventajas de Esta Arquitectura

### **Para Marketing/Público**
✅ **Acceso inmediato**: Sin fricción de registro  
✅ **SEO amigable**: Contenido público indexable  
✅ **Compartible**: Enlaces directos a materiales  
✅ **Rápido**: Sin autenticación = más velocidad

### **Para Administración**
✅ **Control total**: Panel separado con autenticación  
✅ **Seguridad**: Datos sensibles protegidos  
✅ **Permisos granulares**: Por usuario y marca  
✅ **Auditoría**: Logs de todas las acciones

### **Para Distribuidores**
✅ **Acceso controlado**: Solo sus marcas asignadas  
✅ **Interfaz profesional**: Dashboard personalizado  
✅ **Autoservicio**: Descargas 24/7 sin contactar admin  
✅ **Actualizado**: Materiales siempre al día

---

## 📊 Resumen Técnico

| Aspecto | Catálogo Público | Panel Admin |
|---------|------------------|-------------|
| **URL** | `/` | `/admin` |
| **Autenticación** | ❌ No requerida | ✅ Obligatoria |
| **JavaScript** | `catalog.js` | `app.js` |
| **API Base** | `/api/public/*` | `/api/*` |
| **Funcionalidad** | Ver y descargar | Gestión completa |
| **Usuarios** | Cualquier visitante | Solo autenticados |
| **SEO** | ✅ Indexable | ❌ Protegido |
| **Uso principal** | Marketing, público | Administración interna |

---

## 🔐 Seguridad

### **Catálogo Público**
- Sin datos sensibles expuestos
- Solo lectura de assets públicos
- No se muestran emails ni contraseñas
- Rate limiting recomendado en producción

### **Panel Admin**
- Login obligatorio con sesión
- Verificación de permisos por rol
- Contraseñas visibles solo para admin
- Activity log para auditoría
- CORS habilitado solo para APIs

---

## 💡 Próximos Pasos Recomendados

1. **Subir materiales reales** desde el panel admin
2. **Probar el catálogo público** sin login
3. **Configurar dominios** personalizados
4. **Añadir CDN** para archivos estáticos
5. **Implementar analytics** para tracking de descargas
