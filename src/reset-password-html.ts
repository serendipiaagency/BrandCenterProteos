export const resetPasswordHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - Brand Center</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 100%;
      padding: 40px;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    .logo {
      font-size: 3rem;
      color: #667eea;
      margin-bottom: 1rem;
    }

    .title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.6;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .password-requirements {
      background: #f3f4f6;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }

    .password-requirements .title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .password-requirements ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .password-requirements li {
      color: #6b7280;
      padding: 0.25rem 0;
      padding-left: 1.25rem;
      position: relative;
    }

    .password-requirements li:before {
      content: "•";
      position: absolute;
      left: 0.5rem;
    }

    .btn-primary {
      width: 100%;
      padding: 0.875rem;
      font-size: 1rem;
      font-weight: 600;
      color: white;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .back-link {
      display: block;
      text-align: center;
      margin-top: 1.5rem;
      color: #667eea;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: #764ba2;
    }

    .message {
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      display: none;
    }

    .message.success {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #6ee7b7;
    }

    .message.error {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }

    .message.info {
      background: #dbeafe;
      color: #1e40af;
      border: 1px solid #93c5fd;
    }

    .message.show {
      display: block;
    }

    .spinner {
      border: 2px solid #f3f3f3;
      border-top: 2px solid #667eea;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      animation: spin 1s linear infinite;
      display: none;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .btn-primary:disabled .spinner {
      display: inline-block;
    }

    #form-container {
      display: none;
    }

    #form-container.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <i class="fas fa-lock"></i>
      </div>
      <h1 class="title">Restablecer Contraseña</h1>
      <p class="subtitle">
        Ingresa tu nueva contraseña
      </p>
    </div>

    <div id="message" class="message"></div>

    <div id="form-container">
      <form id="reset-password-form">
        <div class="form-group">
          <label class="form-label">
            <i class="fas fa-lock"></i> Nueva Contraseña
          </label>
          <input
            type="password"
            id="password"
            class="form-input"
            placeholder="••••••••"
            required
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            <i class="fas fa-lock"></i> Confirmar Nueva Contraseña
          </label>
          <input
            type="password"
            id="confirmPassword"
            class="form-input"
            placeholder="••••••••"
            required
            minlength="6"
          />
        </div>

        <div class="password-requirements">
          <div class="title">
            <i class="fas fa-info-circle"></i>
            Requisitos de la nueva contraseña:
          </div>
          <ul>
            <li>Mínimo 6 caracteres</li>
            <li>Se recomienda usar letras, números y símbolos</li>
          </ul>
        </div>

        <button type="submit" class="btn-primary" id="submit-btn">
          <span class="spinner"></span>
          <i class="fas fa-check"></i>
          Restablecer Contraseña
        </button>
      </form>
    </div>

    <a href="/" class="back-link">
      <i class="fas fa-arrow-left"></i> Volver al Login
    </a>
  </div>

  <script>
    const form = document.getElementById('reset-password-form');
    const formContainer = document.getElementById('form-container');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('submit-btn');
    const messageDiv = document.getElementById('message');

    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    function showMessage(text, type) {
      messageDiv.innerHTML = text;
      messageDiv.className = 'message ' + type + ' show';
    }

    function hideMessage() {
      messageDiv.className = 'message';
    }

    // Verify token on page load
    async function verifyToken() {
      if (!token) {
        showMessage('❌ Token de recuperación no válido o faltante.', 'error');
        return;
      }

      try {
        const response = await fetch(\`/api/auth/verify-reset-token?token=\${token}\`);
        const data = await response.json();

        if (data.valid) {
          formContainer.classList.add('show');
          showMessage(
            '<i class="fas fa-check-circle"></i> Token válido. Puedes proceder a cambiar tu contraseña.',
            'info'
          );
        } else {
          showMessage(
            '❌ ' + (data.error || 'El enlace ha expirado o no es válido. Por favor, solicita uno nuevo.'),
            'error'
          );
        }
      } catch (error) {
        console.error('Error:', error);
        showMessage('❌ Error al verificar el token. Intenta nuevamente.', 'error');
      }
    }

    // Verify token when page loads
    verifyToken();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideMessage();

      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      if (password.length < 6) {
        showMessage('❌ La contraseña debe tener al menos 6 caracteres', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showMessage('❌ Las contraseñas no coinciden', 'error');
        return;
      }

      submitBtn.disabled = true;

      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            token: token,
            newPassword: password
          })
        });

        const data = await response.json();

        if (data.success) {
          showMessage(
            '✅ ¡Contraseña restablecida exitosamente!<br><br>Serás redirigido al login en 3 segundos...',
            'success'
          );
          
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        } else {
          showMessage('❌ ' + (data.message || 'Error al restablecer la contraseña'), 'error');
          submitBtn.disabled = false;
        }
      } catch (error) {
        console.error('Error:', error);
        showMessage('❌ Error al conectar con el servidor. Intenta nuevamente.', 'error');
        submitBtn.disabled = false;
      }
    });
  </script>
</body>
</html>
`;
