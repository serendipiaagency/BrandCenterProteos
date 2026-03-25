export const forgotPasswordHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperar Contraseña - Brand Center</title>
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <i class="fas fa-key"></i>
      </div>
      <h1 class="title">Recuperar Contraseña</h1>
      <p class="subtitle">
        Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
      </p>
    </div>

    <div id="message" class="message"></div>

    <form id="forgot-password-form">
      <div class="form-group">
        <label class="form-label">
          <i class="fas fa-envelope"></i> Email
        </label>
        <input
          type="email"
          id="email"
          class="form-input"
          placeholder="tu-email@example.com"
          required
        />
      </div>

      <button type="submit" class="btn-primary" id="submit-btn">
        <span class="spinner"></span>
        <i class="fas fa-paper-plane"></i>
        Enviar Enlace de Recuperación
      </button>
    </form>

    <a href="/" class="back-link">
      <i class="fas fa-arrow-left"></i> Volver al Login
    </a>
  </div>

  <script>
    const form = document.getElementById('forgot-password-form');
    const emailInput = document.getElementById('email');
    const submitBtn = document.getElementById('submit-btn');
    const messageDiv = document.getElementById('message');

    function showMessage(text, type) {
      messageDiv.textContent = text;
      messageDiv.className = 'message ' + type + ' show';
    }

    function hideMessage() {
      messageDiv.className = 'message';
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideMessage();

      const email = emailInput.value.trim();

      if (!email) {
        showMessage('Por favor, ingresa tu email', 'error');
        return;
      }

      submitBtn.disabled = true;

      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (data.success) {
          showMessage(
            '✅ Si el email existe en nuestro sistema, recibirás un enlace de recuperación en tu bandeja de entrada. Por favor, revisa también tu carpeta de spam.',
            'success'
          );
          emailInput.value = '';
        } else {
          showMessage(data.message || 'Error al procesar la solicitud', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showMessage('Error al conectar con el servidor. Intenta nuevamente.', 'error');
      } finally {
        submitBtn.disabled = false;
      }
    });
  </script>
</body>
</html>
`;
