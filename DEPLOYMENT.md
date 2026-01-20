# 🚀 Instrucciones de Despliegue - Brand Portal

## 📋 Requisitos Previos

1. **Cuenta de Cloudflare** con:
   - Cloudflare Pages habilitado
   - Cloudflare D1 Database
   - Cloudflare R2 Storage
   - API Token configurado

## 🔧 Configuración Inicial

### Paso 1: Configurar Cloudflare API Token

```bash
# En la terminal del sandbox, ejecutar:
# (Este comando configurará el token de Cloudflare automáticamente)
# setup_cloudflare_api_key
```

**Importante**: Si el comando falla, debes ir al tab "Deploy" en la interfaz y configurar tu Cloudflare API Key manualmente.

### Paso 2: Crear Base de Datos D1

```bash
cd /home/user/webapp

# Crear la base de datos D1 en producción
npx wrangler d1 create webapp-production

# Copiar el database_id que aparece en la salida
# Actualizar wrangler.jsonc con el database_id real
```

Edita `wrangler.jsonc` y reemplaza:
```jsonc
"database_id": "your-database-id-here"
```

Con el ID real de tu base de datos.

### Paso 3: Crear Bucket R2

```bash
# Crear el bucket R2 para almacenar archivos
npx wrangler r2 bucket create brand-portal-assets
```

### Paso 4: Aplicar Migraciones a Producción

```bash
# Aplicar el esquema de base de datos a producción
npm run db:migrate:prod

# Cargar datos iniciales (brands, material types)
npx wrangler d1 execute webapp-production --file=./seed.sql
```

## 🌐 Despliegue a Cloudflare Pages

### Opción 1: Despliegue Directo (Recomendado)

```bash
cd /home/user/webapp

# Construir el proyecto
npm run build

# Crear el proyecto en Cloudflare Pages
npx wrangler pages project create brand-portal \
  --production-branch main \
  --compatibility-date 2026-01-20

# Desplegar a producción
npm run deploy
```

### Opción 2: Conectar con GitHub

```bash
# 1. Configurar GitHub authentication
# setup_github_environment

# 2. Crear repositorio y push
git remote add origin https://github.com/TU_USUARIO/brand-portal.git
git push -u origin main

# 3. En Cloudflare Dashboard:
# - Ve a Pages
# - Conecta tu repositorio de GitHub
# - Configura las variables de entorno
# - Activa deploys automáticos
```

## ⚙️ Configuración de Variables de Entorno

### Variables de Producción (Cloudflare Dashboard)

En Cloudflare Pages > Settings > Environment Variables:

```
NODE_ENV=production
```

### Secrets (Opcional - para futuras integraciones)

```bash
# Si necesitas agregar secrets:
npx wrangler pages secret put SECRET_NAME --project-name brand-portal
```

## 🔐 Configuración de Seguridad

### Actualizar Password Hashing

**IMPORTANTE**: El código actual usa passwords en texto plano para demo. Antes de producción:

1. Instalar bcrypt:
```bash
npm install bcryptjs
```

2. Actualizar el código de autenticación en `src/index.tsx`:
```typescript
import bcrypt from 'bcryptjs'

// En el login:
const isValidPassword = await bcrypt.compare(password, user.password_hash)

// Al crear usuarios:
const passwordHash = await bcrypt.hash(password, 10)
```

### Habilitar HTTPS Only

Cloudflare Pages automáticamente fuerza HTTPS, pero verifica en Settings:
- Always Use HTTPS: ✅ Enabled

## 🧪 Verificación Post-Despliegue

### 1. Verificar la Aplicación

```bash
# Tu app estará disponible en:
# https://brand-portal.pages.dev
# o
# https://[random-id].brand-portal.pages.dev
```

### 2. Probar Login

- URL: https://brand-portal.pages.dev
- Usuario: admin@proteos.com
- Password: admin123

### 3. Verificar APIs

```bash
# Probar endpoints:
curl https://brand-portal.pages.dev/api/brands
curl https://brand-portal.pages.dev/api/material-types
```

### 4. Crear Primer Usuario Real

1. Login como admin
2. Ir a "Users"
3. Crear nuevo usuario distribuidor/marketing
4. Asignar permisos de marcas

## 📝 Configuración de Dominio Personalizado (Opcional)

```bash
# Agregar dominio personalizado
npx wrangler pages domain add brandportal.proteos.com \
  --project-name brand-portal

# Configurar DNS en Cloudflare:
# CNAME: brandportal -> brand-portal.pages.dev
```

## 🔄 Actualizaciones Futuras

### Desplegar Cambios

```bash
cd /home/user/webapp

# 1. Hacer cambios en el código
# 2. Commit
git add .
git commit -m "feat: descripción del cambio"

# 3. Build y deploy
npm run build
npm run deploy

# O si usas GitHub, simplemente:
git push origin main
# (Auto-deploy configurado)
```

### Aplicar Nuevas Migraciones

```bash
# Crear nueva migración
# Archivo: migrations/0002_descripcion.sql

# Aplicar a producción
npx wrangler d1 migrations apply webapp-production
```

## 🐛 Troubleshooting

### Error: "Invalid database ID"
- Verifica que el `database_id` en `wrangler.jsonc` sea correcto
- Ejecuta `npx wrangler d1 list` para ver tus bases de datos

### Error: "R2 bucket not found"
- Crea el bucket: `npx wrangler r2 bucket create brand-portal-assets`
- Verifica el nombre en `wrangler.jsonc`

### Error de Login
- Verifica que las migraciones se aplicaron correctamente
- Ejecuta: `npx wrangler d1 execute webapp-production --command="SELECT * FROM users"`

### Problemas con File Upload
- Verifica que R2 esté configurado correctamente
- Revisa los logs: `npx wrangler pages deployment tail`

## 📊 Monitoreo

### Ver Logs en Tiempo Real

```bash
# Logs de producción
npx wrangler pages deployment tail

# Logs de requests
npx wrangler pages deployment list
```

### Analytics

- Cloudflare Dashboard > Pages > brand-portal > Analytics
- Ver requests, bandwidth, errores

## 🎯 Checklist Final

- [ ] Base de datos D1 creada y migrada
- [ ] Bucket R2 creado
- [ ] Variables de entorno configuradas
- [ ] Passwords hasheados con bcrypt
- [ ] Usuario admin funcional
- [ ] Subida de archivos probada
- [ ] HTTPS forzado
- [ ] Dominio personalizado configurado (opcional)
- [ ] Monitoreo activado
- [ ] Backups automáticos configurados
- [ ] Documentación de usuario creada

## 📞 Soporte

Si tienes problemas durante el despliegue:

1. Revisa los logs: `npx wrangler pages deployment tail`
2. Verifica la configuración en `wrangler.jsonc`
3. Consulta la documentación de Cloudflare: https://developers.cloudflare.com/pages/

---

**Última actualización**: 2026-01-20  
**Versión**: 1.0.0
