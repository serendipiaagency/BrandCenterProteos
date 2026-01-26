# 🌐 Configuración del Dominio Personalizado

## Dominio: `brandcenter.pbserum.com`

---

## 📋 Pasos para Configurar el Dominio en Cloudflare Pages

### **1️⃣ Acceder al Dashboard de Cloudflare Pages**

1. Ve a: https://dash.cloudflare.com/
2. Login con tu cuenta de Cloudflare
3. Selecciona tu cuenta/workspace
4. Ve a **Workers & Pages** en el menú lateral

---

### **2️⃣ Configurar el Dominio Personalizado**

1. Busca y click en el proyecto: **`brandcenter-pbserum`**
2. Ve a la pestaña **Custom domains**
3. Click en **"Set up a custom domain"**
4. Ingresa el dominio: **`brandcenter.pbserum.com`**
5. Click en **"Continue"**

---

### **3️⃣ Configurar DNS en Cloudflare**

Cloudflare te mostrará los registros DNS que necesitas agregar. Generalmente serán:

#### **Opción A: CNAME (Recomendado)**
```
Type: CNAME
Name: brandcenter
Content: brand-portal-proteos.pages.dev
Proxy status: Proxied (naranja)
TTL: Auto
```

#### **Opción B: Si el dominio base pbserum.com está en Cloudflare**

Cloudflare automáticamente detectará el dominio y configurará los registros DNS.

---

### **4️⃣ Agregar DNS Records Manualmente**

Si `pbserum.com` está en Cloudflare:

1. Ve a **DNS** → **Records** para el dominio `pbserum.com`
2. Click en **"Add record"**
3. Configura:
   - **Type**: `CNAME`
   - **Name**: `brandcenter`
   - **Target**: `brand-portal-proteos.pages.dev`
   - **Proxy status**: ✅ **Proxied** (naranja)
   - **TTL**: Auto
4. Click **"Save"**

---

### **5️⃣ Verificar Configuración**

Una vez agregado el dominio, Cloudflare automáticamente:

- ✅ Verificará el dominio
- ✅ Generará certificado SSL/TLS automático
- ✅ Activará el dominio personalizado

**Tiempo estimado**: 5-15 minutos

---

## 🔍 Verificación de DNS

Puedes verificar que el DNS esté configurado correctamente con estos comandos:

```bash
# Verificar CNAME
dig brandcenter.pbserum.com CNAME +short

# Debería retornar algo como:
# brand-portal-proteos.pages.dev.
```

O usar herramientas online:
- https://dnschecker.org/
- https://www.whatsmydns.net/

---

## 🚀 URLs Finales

Después de la configuración, tu aplicación estará disponible en:

### **Dominio Personalizado (Producción)**
- 🌐 **Login**: https://brandcenter.pbserum.com/login
- 📦 **Catálogo Público**: https://brandcenter.pbserum.com/catalog
- 🔧 **Admin Panel**: https://brandcenter.pbserum.com/admin
- 🔗 **Root**: https://brandcenter.pbserum.com/

### **Dominio Cloudflare (Backup)**
- 🌐 https://d967882e.brand-portal-proteos.pages.dev/
- 📦 https://brand-portal-proteos.pages.dev/

---

## 🔒 SSL/TLS

Cloudflare Pages automáticamente provee:
- ✅ **Certificado SSL/TLS** gratuito
- ✅ **HTTPS forzado** (redirección automática)
- ✅ **HTTP/2** y **HTTP/3** habilitados
- ✅ **HSTS** preload ready

---

## ⚙️ Configuración Adicional Recomendada

### **En Cloudflare Pages Dashboard**

#### **1. Settings → General**
- ✅ **Production branch**: `main`
- ✅ **Build command**: `npm run build`
- ✅ **Build output directory**: `dist`

#### **2. Settings → Environment variables**
Si tienes variables de entorno, agrégalas aquí.

#### **3. Settings → Functions**
- ✅ **Compatibility date**: `2024-01-01`
- ✅ **Compatibility flags**: `nodejs_compat`

---

## 🔄 Redirecciones Opcionales

Si quieres redirigir el dominio base a brandcenter:

### **Opción 1: Redirect Rules en Cloudflare**
1. Ve a tu zona `pbserum.com`
2. **Rules** → **Redirect Rules**
3. Agregar regla:
   ```
   If: Hostname equals "pbserum.com" or "www.pbserum.com"
   Then: Redirect to "https://brandcenter.pbserum.com/"
   Status code: 301 (Permanent)
   ```

---

## 📊 Estado del Proyecto

- ✅ **Proyecto**: `brandcenter-pbserum`
- ✅ **Deployment**: Exitoso
- ✅ **Build Size**: 59.41 kB
- ✅ **Database**: Cloudflare D1 (brand-portal-db)
- ✅ **Storage**: Cloudflare R2
- ⏳ **Dominio Personalizado**: Pendiente de configuración manual

---

## 🆘 Troubleshooting

### **"DNS resolution error"**
- Espera 5-15 minutos para propagación DNS
- Verifica que el CNAME esté en Proxied (naranja)
- Limpia caché de DNS: `ipconfig /flushdns` (Windows) o `sudo dscacheutil -flushcache` (Mac)

### **"ERR_SSL_VERSION_OR_CIPHER_MISMATCH"**
- Espera a que Cloudflare genere el certificado SSL (5-15 min)
- Verifica que SSL/TLS esté en "Full" o "Full (strict)" en Cloudflare

### **"Too many redirects"**
- Cambia SSL/TLS mode a "Full" en vez de "Flexible"

---

## 📞 Contacto

Si necesitas ayuda con la configuración:
- **Cloudflare Support**: https://dash.cloudflare.com/support
- **Cloudflare Docs**: https://developers.cloudflare.com/pages/

---

**Última actualización**: 2026-01-26
**Versión**: 1.0
