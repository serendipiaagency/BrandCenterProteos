# 🔐 Password Reset Flow - Brand Center

## Flujo Completo Implementado

### ✅ 1. Solicitud de Recuperación de Contraseña
**Página**: `/forgot-password`
- Usuario ingresa solo su **email**
- Sistema valida si el email existe en la base de datos
- Se genera un token único y se guarda en `password_reset_tokens`
- Token expira en **1 hora**
- Se envía email con enlace de recuperación vía **Resend**

**API Endpoint**: `POST /api/auth/forgot-password`
```json
{
  "email": "user@example.com"
}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Si el email existe, recibirás instrucciones para recuperar tu contraseña."
}
```

### ✅ 2. Email de Recuperación
**Remitente**: `Brand Center <brandcenter@pbserum.com>`
**Asunto**: `🔐 Recupera tu contraseña - Brand Center`

**Contenido del email**:
- Saludo personalizado con el nombre del usuario
- Enlace de recuperación: `https://brandcenter.pbserum.com/reset-password?token={token}`
- Mensaje de advertencia si no solicitó el cambio
- Tiempo de expiración: **1 hora**

### ✅ 3. Página de Restablecimiento de Contraseña
**URL**: `/reset-password?token={token}`

**Proceso**:
1. Al cargar la página, verifica automáticamente si el token es válido
2. Si el token es válido:
   - Muestra el formulario
   - Muestra mensaje: "Token válido. Puedes proceder a cambiar tu contraseña"
3. Si el token NO es válido:
   - Muestra mensaje de error
   - Oculta el formulario
   - Indica que debe solicitar un nuevo enlace

**API Endpoint de verificación**: `GET /api/auth/verify-reset-token?token={token}`

**Campos del formulario**:
- Nueva contraseña (mínimo 6 caracteres)
- Confirmar nueva contraseña
- Validación frontend: las contraseñas deben coincidir

### ✅ 4. Actualización de Contraseña
**API Endpoint**: `POST /api/auth/reset-password`

```json
{
  "token": "uk1hn19824mn5te94eds5f6hjo7hu",
  "newPassword": "nuevapassword123"
}
```

**Proceso backend**:
1. Verifica que el token sea válido y no haya expirado
2. Actualiza la contraseña del usuario en la tabla `users`
3. Marca el token como usado (`used = 1`)
4. Envía email de confirmación vía **Resend**
5. Registra la actividad en `activity_log`

**Respuesta exitosa**:
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

**Después del éxito**:
- Muestra mensaje de éxito
- Redirige automáticamente al login después de **3 segundos**

### ✅ 5. Email de Confirmación de Cambio
**Remitente**: `Brand Center <brandcenter@pbserum.com>`
**Asunto**: `✅ Tu contraseña ha sido cambiada - Brand Center`

**Contenido**:
- Confirma que la contraseña fue cambiada exitosamente
- Muestra fecha y hora del cambio
- Botón para acceder al Brand Center
- Mensaje de seguridad: contactar soporte si no realizó el cambio

---

## 🔄 Diferencia con el Flujo Anterior `/change-password`

### `/change-password` (Sistema anterior - aún disponible)
- Requiere estar **logueado**
- Pide **email + contraseña actual + nueva contraseña**
- Usado cuando el usuario conoce su contraseña actual
- Envía email de confirmación del cambio

### `/forgot-password` + `/reset-password` (Sistema nuevo)
- **No requiere login**
- Solo pide **email** inicialmente
- Envía enlace por email con token temporal (1 hora)
- Usuario puede cambiar contraseña sin conocer la actual
- Ideal para recuperación de cuenta

---

## 📊 Estructura de Base de Datos

### Tabla: `password_reset_tokens`
```sql
CREATE TABLE password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  used INTEGER DEFAULT 0,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

---

## 🧪 Testing del Flujo Completo

### 1. Solicitar recuperación
```bash
curl -X POST https://brandcenter.pbserum.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"david@serendipiaagency.com"}'
```

### 2. Obtener token de la BD (para testing)
```bash
npx wrangler d1 execute brand-portal-db --remote \
  --command="SELECT token FROM password_reset_tokens WHERE user_id = 175 ORDER BY created_at DESC LIMIT 1"
```

### 3. Verificar token
```bash
curl "https://brandcenter.pbserum.com/api/auth/verify-reset-token?token={TOKEN}"
```

### 4. Cambiar contraseña
```bash
curl -X POST https://brandcenter.pbserum.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"{TOKEN}","newPassword":"newpassword123"}'
```

---

## 🌐 URLs Importantes

| Página/API | URL |
|------------|-----|
| Login | https://brandcenter.pbserum.com/ |
| Olvidé mi contraseña | https://brandcenter.pbserum.com/forgot-password |
| Restablecer contraseña | https://brandcenter.pbserum.com/reset-password?token={token} |
| Cambiar contraseña (logueado) | https://brandcenter.pbserum.com/change-password |
| API - Solicitar reset | POST /api/auth/forgot-password |
| API - Verificar token | GET /api/auth/verify-reset-token |
| API - Cambiar con token | POST /api/auth/reset-password |

---

## ✅ Estado Actual

- ✅ **Flujo completo funcional**
- ✅ **Email de recuperación enviado vía Resend**
- ✅ **Email de confirmación enviado vía Resend**
- ✅ **Tokens con expiración (1 hora)**
- ✅ **Validación de tokens en frontend y backend**
- ✅ **Tokens marcados como usados después del cambio**
- ✅ **Redirección automática al login después del éxito**
- ✅ **Mensajes de error/éxito en tiempo real**
- ✅ **Responsive design con gradientes**
- ✅ **Log de actividad para auditoría**

---

## 🔒 Seguridad Implementada

1. **Tokens únicos y aleatorios** - 36+ caracteres
2. **Expiración de 1 hora** - Tokens inválidos después de 60 minutos
3. **Un solo uso** - Token marcado como usado después del reset
4. **No revela existencia de emails** - Mismo mensaje para emails que existen y no existen
5. **Validación en frontend y backend** - Doble capa de seguridad
6. **HTTPS obligatorio** - Todos los endpoints en HTTPS
7. **Log de actividad** - Registro de todas las acciones de password reset
8. **Email de confirmación** - Usuario notificado de cambios en su cuenta

---

## 📝 Commits Relacionados

- `d6e040d` - feat: Add password reset page with token verification and secure flow
- `c760750` - docs: Update deployment URL after password reset page implementation
- `376d5a8` - feat: Add forgot-password page (email only)
- `5bc0511` - feat: Add Resend status and test endpoints

---

## 🎯 Próximos Pasos (Opcional)

1. ⚡ **Rate limiting** - Limitar intentos de reset por IP
2. 🔐 **CAPTCHA** - Proteger contra bots
3. 📱 **SMS 2FA** - Doble factor de autenticación
4. 🌍 **Internacionalización** - Soporte multi-idioma
5. 📊 **Analytics** - Tracking de recuperaciones exitosas/fallidas

---

**Última actualización**: 2026-03-25  
**Deployment**: https://86429dea.brand-portal-proteos.pages.dev  
**Producción**: https://brandcenter.pbserum.com
