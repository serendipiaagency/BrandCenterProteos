# 📧 Guía de Configuración de Email con Resend

## 🎯 Resumen

Esta guía te ayudará a configurar el envío de emails de recuperación de contraseña usando **Resend**, el mejor servicio de email para Cloudflare Workers.

---

## 📊 Comparativa de Servicios de Email

| Servicio | Precio Gratis | API Simple | Edge-Friendly | Recomendado |
|----------|---------------|------------|---------------|-------------|
| **Resend** | 3,000/mes | ⭐⭐⭐⭐⭐ | ✅ Sí | **✅ SÍ** |
| SendGrid | 100/día | ⭐⭐⭐ | ✅ Sí | ✅ Alternativa |
| Mailgun | 5,000/mes | ⭐⭐⭐⭐ | ✅ Sí | ✅ Alternativa |
| AWS SES | 62,000/mes | ⭐⭐ | ⚠️ Complejo | ❌ No |

---

## 🚀 Opción 1: Resend (RECOMENDADO)

### ✅ Ventajas
- **100 emails gratis por día** (3,000/mes)
- API super simple (1 request)
- Diseñado para Cloudflare Workers
- Verificación de dominio fácil
- Dashboard excelente
- React Email templates

---

## 📝 Paso a Paso: Configuración de Resend

### **1. Crear cuenta en Resend**

1. Ve a https://resend.com/
2. Click en **Sign Up**
3. Regístrate con tu email de trabajo
4. Verifica tu email

---

### **2. Obtener API Key**

1. En dashboard de Resend, ve a **API Keys**
2. Click en **Create API Key**
3. Configuración:
   - **Name**: `Brand Portal - Production`
   - **Permission**: **Sending access**
   - **Domain**: `pbserum.com` (después de verificarlo)
4. **Copia la API key** (empieza con `re_...`)
5. ⚠️ **IMPORTANTE**: Guárdala en un lugar seguro, no se puede ver de nuevo

---

### **3. Verificar tu dominio pbserum.com**

#### **3.1 En Resend:**
1. Ve a **Domains**
2. Click en **Add Domain**
3. Ingresa: `pbserum.com`
4. Resend te dará 3 registros DNS

#### **3.2 Registros DNS que debes agregar:**

Resend te dará algo como esto:

```
┌──────┬────────────────────┬────────────────────────────────────────┐
│ Tipo │ Nombre             │ Valor                                  │
├──────┼────────────────────┼────────────────────────────────────────┤
│ TXT  │ @                  │ v=spf1 include:_spf.resend.com ~all    │
│ TXT  │ resend._domainkey  │ k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUA... │
│ CNAME│ resend             │ u1234567.wl123.sendgrid.net            │
└──────┴────────────────────┴────────────────────────────────────────┘
```

#### **3.3 En Cloudflare DNS:**

1. Ve a tu dashboard de Cloudflare
2. Selecciona tu dominio `pbserum.com`
3. Ve a **DNS** → **Records**
4. Agrega los 3 registros que te dio Resend:

**Registro 1 - SPF:**
- Type: `TXT`
- Name: `@`
- Content: `v=spf1 include:_spf.resend.com ~all`
- TTL: `Auto`
- Proxy status: `DNS only` (nube gris)

**Registro 2 - DKIM:**
- Type: `TXT`
- Name: `resend._domainkey`
- Content: `k=rsa; p=MIGfMA0GC...` (copia el valor completo de Resend)
- TTL: `Auto`
- Proxy status: `DNS only` (nube gris)

**Registro 3 - Custom Domain:**
- Type: `CNAME`
- Name: `resend`
- Target: `u1234567.wl123.sendgrid.net` (copia el valor de Resend)
- TTL: `Auto`
- Proxy status: `DNS only` (nube gris)

5. Click **Save** en cada registro

#### **3.4 Verificar en Resend:**

1. Espera **5-15 minutos** para propagación DNS
2. En Resend, ve a **Domains**
3. Click en el dominio `pbserum.com`
4. Click en **Verify DNS Records**
5. Deberías ver ✅ en todos los registros

---

### **4. Configurar API Key en Cloudflare Pages**

#### **4.1 Para Producción (Cloudflare Pages):**

```bash
cd /home/user/webapp

# Agregar API key como secret de producción
npx wrangler secret put RESEND_API_KEY --env production
# Cuando te pida, pega tu API key: re_xxxxxxxxxxxxx
```

#### **4.2 Para Desarrollo Local:**

1. Edita el archivo `.dev.vars` en la raíz del proyecto:

```bash
# .dev.vars
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

2. **NUNCA** subas este archivo a Git (ya está en `.gitignore`)

---

### **5. Probar el envío de email**

#### **5.1 En Desarrollo (Local):**

```bash
# Iniciar servidor local
cd /home/user/webapp
npm run build
pm2 restart brand-portal

# Probar endpoint
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@proteos.com"}'
```

Si NO configuraste `RESEND_API_KEY` en `.dev.vars`:
- Verás el token en console.log
- Response incluirá `dev_token` y `dev_reset_link`

Si SÍ configuraste `RESEND_API_KEY`:
- Se enviará email real a `admin@proteos.com`
- Response NO incluirá el token (por seguridad)

#### **5.2 En Producción:**

1. Ve a https://brandcenter.pbserum.com/
2. Click en "¿Olvidaste tu contraseña?"
3. Ingresa tu email
4. Deberías recibir un email en 5-10 segundos

---

### **6. Verificar que funciona**

#### **En Resend Dashboard:**

1. Ve a **Logs** en Resend
2. Deberías ver los emails enviados
3. Status: `Delivered` (entregado)

#### **En tu email:**

Deberías recibir un email como este:

```
┌─────────────────────────────────────────────┐
│     🔑 Recuperación de Contraseña          │
├─────────────────────────────────────────────┤
│                                             │
│  Hola Admin User,                           │
│                                             │
│  Recibimos una solicitud para restablecer  │
│  la contraseña de tu cuenta en Brand       │
│  Portal.                                    │
│                                             │
│  [ Restablecer Contraseña ]                 │
│                                             │
│  ⚠️ Importante:                             │
│  • Este enlace expira en 1 hora            │
│  • Solo se puede usar una vez               │
│  • Si no solicitaste esto, ignora este     │
│    email                                    │
│                                             │
│  Saludos,                                   │
│  Equipo de Brand Portal                    │
│                                             │
│  Proteos Biotech - Brand Portal            │
└─────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### **Problema 1: No recibo emails**

1. Verifica que el dominio está verificado en Resend
2. Revisa los logs en Resend Dashboard
3. Verifica que la API key está configurada correctamente
4. Checa spam/junk en tu email

### **Problema 2: Error "Invalid API Key"**

1. Verifica que copiaste la API key completa (empieza con `re_`)
2. Verifica que configuraste el secret correctamente:
   ```bash
   npx wrangler secret put RESEND_API_KEY --env production
   ```

### **Problema 3: DNS no verifica**

1. Espera más tiempo (puede tomar hasta 48 horas)
2. Verifica que los registros estén exactamente como los dio Resend
3. Verifica que Proxy status sea "DNS only" (nube gris)
4. Usa https://dnschecker.org/ para verificar propagación

---

## 📋 Checklist de Configuración

- [ ] Crear cuenta en Resend
- [ ] Obtener API Key
- [ ] Agregar dominio pbserum.com en Resend
- [ ] Copiar registros DNS de Resend
- [ ] Agregar registros DNS en Cloudflare
- [ ] Esperar 5-15 minutos
- [ ] Verificar DNS en Resend (todos con ✅)
- [ ] Configurar secret en producción: `npx wrangler secret put RESEND_API_KEY`
- [ ] (Opcional) Configurar `.dev.vars` para desarrollo local
- [ ] Probar endpoint en local
- [ ] Deploy a producción
- [ ] Probar en producción
- [ ] Verificar email recibido

---

## 🚀 Alternativa: SendGrid

Si prefieres usar SendGrid:

### **Configuración:**

1. Crear cuenta en https://sendgrid.com/
2. Verificar dominio pbserum.com
3. Obtener API Key
4. Configurar secret:
   ```bash
   npx wrangler secret put SENDGRID_API_KEY --env production
   ```

### **Código (reemplazar fetch en index.tsx):**

```typescript
const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${c.env.SENDGRID_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    personalizations: [{
      to: [{ email }],
      subject: 'Recuperación de Contraseña - Brand Portal'
    }],
    from: {
      email: 'noreply@pbserum.com',
      name: 'Brand Portal'
    },
    content: [{
      type: 'text/html',
      value: `<html>...</html>`
    }]
  })
})
```

---

## 💡 Mejores Prácticas

1. **Siempre usa dominio verificado** (no @gmail.com)
2. **Configura SPF, DKIM y DMARC** para mejor deliverability
3. **Usa templates profesionales** con HTML
4. **Incluye texto plano** como fallback
5. **No envíes spam** - respeta límites de rate
6. **Monitorea logs** en Resend Dashboard
7. **Configura webhooks** para tracking avanzado (opcional)

---

## 📞 Soporte

- **Resend Docs**: https://resend.com/docs
- **Resend Discord**: https://resend.com/discord
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/

---

## 🎉 ¡Listo!

Tu sistema de recuperación de contraseña está completamente configurado y listo para enviar emails profesionales a tus usuarios.

**URLs de producción:**
- Login: https://brandcenter.pbserum.com/
- Recuperación: Los usuarios recibirán un link por email

---

*Última actualización: 2026-01-26*
