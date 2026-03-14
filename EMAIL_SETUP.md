# Email Transaccional - Configuración Resend

## ✅ Sistema Implementado

El sistema de emails transaccionales está completamente implementado usando **Resend** con las siguientes funcionalidades:

### 📧 Emails Configurados

1. **Email de Bienvenida** (`newUserWelcome`)
   - Se envía automáticamente al crear un nuevo usuario
   - Incluye credenciales de acceso (email + password temporal)
   - Botón de acceso directo al Brand Center
   - Advertencia de seguridad para cambiar contraseña

2. **Email de Recuperación de Contraseña** (`passwordReset`)
   - Se envía cuando el usuario solicita reset de contraseña
   - Incluye link único con token de seguridad
   - Expira en 1 hora
   - Solo se puede usar una vez

3. **Email de Confirmación de Cambio** (`passwordChanged`)
   - Se envía después de cambiar la contraseña exitosamente
   - Incluye fecha/hora del cambio
   - Alerta de seguridad si no fue el usuario

### 🎨 Diseño de Plantillas

Todas las plantillas tienen:
- ✅ Diseño profesional responsive (HTML + texto plano)
- ✅ Gradiente azul corporativo de Proteos Biotech
- ✅ Iconos visuales para cada tipo de email
- ✅ Secciones destacadas con bordes de color
- ✅ Footer con copyright y marca Brand Center
- ✅ Compatible con todos los clientes de email

### 🔐 Seguridad Implementada

- **Tokens de reset**: Expiran en 1 hora
- **Uso único**: Tokens marcados como usados después del reset
- **Validaciones**: Mínimo 6 caracteres para contraseñas
- **Logging**: Todas las acciones registradas en activity_log
- **Rate limiting**: Mismo mensaje de respuesta si email existe o no (seguridad)

---

## 🚀 Configuración Requerida

### Paso 1: Crear Cuenta en Resend

1. Ve a https://resend.com
2. Crea una cuenta o inicia sesión
3. Verifica tu email

### Paso 2: Verificar Dominio

Para enviar desde `brandcenter@pbserum.com`, necesitas verificar el dominio `pbserum.com`:

1. En Resend Dashboard → **Domains**
2. Click en **Add Domain**
3. Introduce: `pbserum.com`
4. Resend te dará los registros DNS que necesitas añadir:
   ```
   Type: TXT
   Name: _resend
   Value: [valor proporcionado por Resend]
   
   Type: MX
   Name: pbserum.com
   Value: [valor proporcionado por Resend]
   Priority: 10
   
   Type: TXT (DKIM)
   Name: resend._domainkey
   Value: [valor proporcionado por Resend]
   ```

5. Añade estos registros en tu proveedor DNS (Cloudflare, GoDaddy, etc.)
6. Espera a que Resend verifique el dominio (puede tardar hasta 24h)

### Paso 3: Obtener API Key

1. En Resend Dashboard → **API Keys**
2. Click en **Create API Key**
3. Nombre: `Brand Center Production`
4. Permission: **Sending access**
5. **Copia la API Key** (solo se muestra una vez)

### Paso 4: Configurar en Cloudflare Pages

#### Opción A: Usando Cloudflare Dashboard (Recomendado)

1. Ve a https://dash.cloudflare.com
2. Workers & Pages → **brandcenter-pbserum**
3. Settings → **Environment Variables**
4. Add variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: tu API key de Resend
   - **Environment**: Production (y Preview si quieres)
5. **Save**

#### Opción B: Usando Wrangler CLI

```bash
cd /home/user/webapp
npx wrangler pages secret put RESEND_API_KEY --project-name brandcenter-pbserum
# Pega tu API key cuando te lo pida
```

### Paso 5: Re-deploy (Si usaste CLI)

Si configuraste la variable con la CLI, haz un redeploy:

```bash
npm run build
npx wrangler pages deploy dist --project-name brandcenter-pbserum
```

Si usaste el Dashboard, el cambio es automático en el próximo deploy.

---

## 🧪 Pruebas

### 1. Prueba Email de Bienvenida

1. Ve a Admin Panel → Users
2. Click en "Add User"
3. Completa los datos de un usuario nuevo
4. Click en "Create User"
5. **Verifica** que el email llega a la dirección proporcionada

### 2. Prueba Recuperación de Contraseña

1. Ve a la página de login
2. Click en "¿Olvidaste tu contraseña?"
3. Introduce un email existente
4. Click en "Enviar"
5. **Verifica** que llega el email con el link de reset
6. Click en el link del email
7. Introduce nueva contraseña
8. **Verifica** que llega el email de confirmación

### 3. Prueba Cambio de Contraseña

1. Inicia sesión en Brand Center
2. Ve a tu perfil/configuración
3. Busca "Cambiar Contraseña"
4. Introduce contraseña actual y nueva
5. Click en "Cambiar"
6. **Verifica** que llega el email de confirmación

---

## 📊 Monitoreo

### Ver Logs en Cloudflare

```bash
npx wrangler pages deployment tail --project-name brandcenter-pbserum
```

Busca estos mensajes:
- ✅ `Welcome email sent to: user@example.com`
- ✅ `Password reset email sent successfully`
- ✅ `Password change confirmation email sent`

### Ver Logs en Resend

1. Ve a Resend Dashboard → **Logs**
2. Verás todos los emails enviados con:
   - Estado (sent, delivered, bounced, etc.)
   - Timestamp
   - Destinatario
   - Subject

---

## 🔧 Desarrollo Local

Para desarrollo local sin enviar emails reales:

1. **NO configures** `RESEND_API_KEY` en `.dev.vars`
2. Los tokens y links se mostrarán en la consola:
   ```
   🔑 Password reset token for user@example.com: abc123...
   🔗 Reset link: https://brandcenter.pbserum.com/reset-password?token=abc123...
   ```

---

## 📈 Límites de Resend

### Plan Gratuito
- **100 emails/día**
- **1 dominio verificado**
- API access
- Email logs (30 días)

### Plan Pro ($20/mes)
- **50,000 emails/mes**
- **Dominios ilimitados**
- Email analytics
- Email logs (90 días)

Para Brand Center con ~100 usuarios, el plan gratuito es suficiente inicialmente.

---

## 🆘 Troubleshooting

### Email no llega

1. **Verifica dominio verificado**: Dashboard Resend → Domains
2. **Revisa logs**: Cloudflare Pages deployment logs
3. **Revisa spam**: Algunos proveedores filtran emails transaccionales
4. **Verifica API Key**: Debe estar configurada correctamente

### Error "API key not configured"

- La variable `RESEND_API_KEY` no está configurada en Cloudflare
- Revisa el Paso 4 de esta guía

### Email enviado pero no recibido

- Revisa carpeta de spam
- Algunos dominios (Gmail, Outlook) pueden tardar
- Verifica en Resend Logs si fue delivered o bounced

---

## 📝 URLs de Producción

- **Brand Center**: https://brandcenter.pbserum.com
- **Admin Panel**: https://brandcenter.pbserum.com/admin
- **Última versión**: https://e779b1f0.brand-portal-proteos.pages.dev

---

## 🎯 Próximos Pasos

Una vez configurado:

1. ✅ Crea un usuario de prueba
2. ✅ Verifica que llega el email de bienvenida
3. ✅ Prueba el flujo de recuperación de contraseña
4. ✅ Prueba el cambio de contraseña
5. ✅ Monitorea logs durante los primeros días

Si todo funciona correctamente, el sistema está listo para producción! 🚀
