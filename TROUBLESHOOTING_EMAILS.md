# Troubleshooting - Sistema de Emails

## ⚠️ "No me llegan los emails"

### Causa Común #1: Usuario no existe en la base de datos

**Síntoma**: Solicitas recuperar contraseña pero no recibes email.

**Diagnóstico**:
```bash
# Verificar si el usuario existe
npx wrangler d1 execute brand-portal-db --remote \
  --command="SELECT id, email, name, active FROM users WHERE email = 'tu-email@example.com'"
```

**Solución**: Si no existe, crear el usuario desde el Admin Panel o con API.

---

### Causa Común #2: Emails en carpeta SPAM

**Síntoma**: El sistema dice que envió el email pero no aparece.

**Solución**: 
1. Revisa la carpeta **SPAM/Correo no deseado**
2. Busca remitente: **Brand Center <brandcenter@pbserum.com>**
3. Marca como "No es spam" para futuros emails

---

### Causa Común #3: Resend API Key no configurada

**Síntoma**: Los endpoints funcionan pero no se envían emails.

**Diagnóstico**:
```bash
curl https://brandcenter.pbserum.com/api/resend/status
```

Debe responder:
```json
{
  "configured": true,
  "hasApiKey": true,
  "emailsEnabled": true
}
```

**Solución**: Si está en `false`, configurar:
```bash
npx wrangler pages secret put RESEND_API_KEY --project-name brandcenter-pbserum
```

---

### Causa Común #4: Dominio no verificado en Resend

**Síntoma**: Emails se rechazan o no llegan.

**Solución**:
1. Ir a https://resend.com/domains
2. Verificar que `pbserum.com` está verificado
3. Añadir registros DNS si es necesario

---

## 🧪 Pruebas de Diagnóstico

### 1. Verificar configuración
```bash
curl https://brandcenter.pbserum.com/api/resend/status
```

### 2. Enviar email de prueba
```bash
curl -X POST https://brandcenter.pbserum.com/api/resend/test \
  -H "Content-Type: application/json" \
  -d '{"email": "tu-email@example.com"}'
```

### 3. Verificar usuario existe
```bash
curl https://brandcenter.pbserum.com/api/users?currentUserId=1
# Buscar el email en la lista
```

### 4. Crear usuario de prueba
```bash
curl -X POST https://brandcenter.pbserum.com/api/users?currentUserId=1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "role": "distributor",
    "region": "EMEA"
  }'
```

### 5. Probar recuperación de contraseña
```bash
curl -X POST https://brandcenter.pbserum.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## 📧 Tipos de Emails

### Email de Bienvenida
- **Trigger**: Crear nuevo usuario
- **Remitente**: Brand Center <brandcenter@pbserum.com>
- **Asunto**: "Welcome to Brand Center"
- **Contenido**: Credenciales + Link de acceso

### Email de Recuperación
- **Trigger**: Solicitar recuperar contraseña
- **Remitente**: Brand Center <brandcenter@pbserum.com>
- **Asunto**: "Reset Your Password"
- **Contenido**: Link con token (válido 1 hora)

### Email de Confirmación
- **Trigger**: Cambiar contraseña exitosamente
- **Remitente**: Brand Center <brandcenter@pbserum.com>
- **Asunto**: "Password Changed Successfully"
- **Contenido**: Confirmación + alerta de seguridad

---

## 🔍 Revisar Logs

### Cloudflare Pages Dashboard
1. Ir a https://dash.cloudflare.com
2. Pages > brandcenter-pbserum
3. Deployment > Logs
4. Buscar: "Welcome email sent" o "Password reset email sent"

### Logs de consola esperados

**Email enviado correctamente:**
```
✅ Welcome email sent to: user@example.com
```

**Email fallido:**
```
❌ Resend API error: [detalle del error]
```

---

## ✅ Checklist de Verificación

- [ ] Usuario existe en la base de datos
- [ ] Resend API Key configurada
- [ ] Dominio pbserum.com verificado en Resend
- [ ] Revisar carpeta SPAM
- [ ] Probar con endpoint de test
- [ ] Ver logs de Cloudflare Pages

---

## 📞 Soporte

Si después de revisar todo sigue sin funcionar:
1. Verificar secretos: `npx wrangler pages secret list --project-name brandcenter-pbserum`
2. Revisar Resend dashboard: https://resend.com/emails
3. Verificar límites de envío en Resend (free tier: 100 emails/día)

---

## 🎯 Solución Rápida

**Problema**: "No me llega el email de recuperación de contraseña"

**Solución inmediata**:
1. Verifica que tu usuario existe: Pídele al admin que busque tu email en el panel
2. Si no existe: Pide al admin que cree tu usuario
3. Recibirás email de bienvenida con contraseña temporal
4. Usa esa contraseña para entrar y cámbiala desde tu perfil

---

**Última actualización**: 25 de Marzo de 2026
