# 📧 Configuración de Email - Resumen Rápido

## 🎯 Objetivo
Enviar emails de recuperación de contraseña desde `noreply@pbserum.com`

---

## 📋 Pasos de Configuración (30 minutos)

### 1️⃣ Crear cuenta en Resend (5 min)
```
https://resend.com/ → Sign Up → Verificar email
```

### 2️⃣ Obtener API Key (2 min)
```
Dashboard → API Keys → Create API Key
Nombre: Brand Portal - Production
Permisos: Sending access
→ Copiar API key (empieza con re_)
```

### 3️⃣ Agregar dominio en Resend (1 min)
```
Dashboard → Domains → Add Domain → pbserum.com
→ Copiar los 3 registros DNS que aparecen
```

### 4️⃣ Configurar DNS en Cloudflare (5 min)
```
Cloudflare Dashboard → pbserum.com → DNS → Add record

Registro 1 (SPF):
  Type: TXT
  Name: @
  Content: v=spf1 include:_spf.resend.com ~all
  Proxy: DNS only (nube gris)

Registro 2 (DKIM):
  Type: TXT
  Name: resend._domainkey
  Content: k=rsa; p=MIGfMA0GC... (copiar de Resend)
  Proxy: DNS only (nube gris)

Registro 3 (Custom Domain):
  Type: CNAME
  Name: resend
  Target: u1234567.wl123.sendgrid.net (copiar de Resend)
  Proxy: DNS only (nube gris)

→ Save en cada uno
```

### 5️⃣ Verificar DNS (10 min - esperar propagación)
```
Esperar 5-15 minutos
Resend Dashboard → Domains → pbserum.com → Verify DNS Records
→ Todos deben estar en ✅
```

### 6️⃣ Configurar API Key en producción (2 min)
```bash
cd /home/user/webapp
npx wrangler secret put RESEND_API_KEY --env production
# Pegar: re_xxxxxxxxxxxxx
```

### 7️⃣ Desplegar a producción (2 min)
```bash
npm run build
npx wrangler pages deploy dist --project-name brandcenter-pbserum
```

### 8️⃣ Probar (2 min)
```
1. Ir a https://brandcenter.pbserum.com/
2. Click en "¿Olvidaste tu contraseña?"
3. Ingresar tu email
4. Revisar bandeja de entrada (5-10 seg)
5. Click en "Restablecer Contraseña" del email
6. Ingresar nueva contraseña
```

---

## ✅ Checklist

- [ ] Crear cuenta Resend
- [ ] Obtener API Key
- [ ] Agregar dominio pbserum.com
- [ ] Copiar 3 registros DNS
- [ ] Agregar registros en Cloudflare DNS
- [ ] Esperar 5-15 min
- [ ] Verificar DNS en Resend (✅✅✅)
- [ ] `npx wrangler secret put RESEND_API_KEY`
- [ ] Deploy a producción
- [ ] Probar recuperación de contraseña
- [ ] ✅ Recibir email

---

## 🎁 Bonus: Desarrollo Local (opcional)

Si quieres probar emails en desarrollo local:

```bash
# Editar .dev.vars
echo "RESEND_API_KEY=re_xxxxxxxxxxxxx" >> .dev.vars

# Reiniciar servidor local
npm run build
pm2 restart brand-portal

# Probar
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"tu@email.com"}'
```

---

## 🚨 Importante

1. **NUNCA** subas `.dev.vars` a Git (ya está en .gitignore)
2. **NUNCA** compartas tu API key de Resend
3. **SIEMPRE** usa "DNS only" (nube gris) en registros DNS de email
4. **Resend Free Plan**: 100 emails/día, 3,000/mes (suficiente para empezar)

---

## 📞 Ayuda

- **Guía completa**: Ver `EMAIL_SETUP_GUIDE.md`
- **Resend Docs**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **Cloudflare Support**: https://dash.cloudflare.com/?to=/:account/support

---

## 🎉 Resultado Final

Cuando termines, los usuarios podrán:

1. Ir a login → "¿Olvidaste tu contraseña?"
2. Ingresar su email
3. Recibir email profesional con link de recuperación
4. Click en el link → formulario de nueva contraseña
5. Login con nueva contraseña

**Todo automático, seguro y profesional** ✨
