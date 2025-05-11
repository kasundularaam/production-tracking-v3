import { LitElement, html } from 'https://esm.run/lit';
import { postJson } from '../../utils/api_utils.js';
import { saveToken, saveUser } from '../../utils/auth_utils.js';

class LoginForm extends LitElement {
  static get properties() {
    return {
      isLoading: { type: Boolean },
      errorMessage: { type: String }
    };
  }

  constructor() {
    super();
    this.isLoading = false;
    this.errorMessage = '';
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  async handleSubmit(e) {
    e.preventDefault();

    this.isLoading = true;
    this.errorMessage = '';

    const sapId = this.querySelector('#sap-id').value;
    const password = this.querySelector('#password').value;

    if (!sapId || !password) {
      this.errorMessage = 'SAP ID and Password are required';
      this.isLoading = false;
      return;
    }

    try {
      const response = await postJson('/api/auth/login', {
        sap_id: sapId,
        password: password
      });

      // Save authentication data
      saveToken(response.access_token);
      saveUser(response.user);

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      this.errorMessage = error.message || 'Invalid credentials. Please try again.';
      this.isLoading = false;
    }
  }

  render() {
    return html`
      <div class="login-form-container">
        <div class="login-image-container">
          <img src="/static/images/auth/background.jpg" alt="Production" class="login-image">
        </div>
        <div class="login-form-content">
          <h2 class="login-title">Welcome Back</h2>
          <p class="login-subtitle">Sign in to access production tracking</p>
          
          <form @submit=${this.handleSubmit} class="login-form">
            ${this.errorMessage ? html`
              <div class="error-message">
                <i class="fas fa-exclamation-circle"></i> ${this.errorMessage}
              </div>
            ` : ''}
            
            <div class="form-group">
              <label for="sap-id">SAP ID</label>
              <div class="input-with-icon">
                <i class="fas fa-user"></i>
                <input type="text" id="sap-id" placeholder="Enter your SAP ID" autocomplete="username">
              </div>
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-with-icon">
                <i class="fas fa-lock"></i>
                <input type="password" id="password" placeholder="Enter your password" autocomplete="current-password">
              </div>
            </div>
            
            <button type="submit" class="login-button" ?disabled=${this.isLoading}>
              ${this.isLoading ? html`<i class="fas fa-spinner fa-spin"></i> Signing In...` : 'Sign In'}
            </button>
          </form>
          
          <div class="login-footer">
            <p>ETD Production Tracking System</p>
            <p class="copyright">© ${new Date().getFullYear()} Michelin</p>
          </div>
        </div>
      </div>

      <style>
        .login-form-container {
          background-color: #131624;
          border-radius: 12px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          display: flex;
          width: 100%;
          max-width: 900px;
          height: 500px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .login-image-container {
          flex: 1;
          overflow: hidden;
          display: none;
        }
        
        @media (min-width: 768px) {
          .login-image-container {
            display: block;
          }
        }
        
        .login-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .login-form-content {
          flex: 1;
          padding: 2rem;
          background-color: #131624;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .login-title {
          color: #ffffff;
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        
        .login-subtitle {
          color: #aaaaaa;
          margin-bottom: 2rem;
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-group label {
          font-weight: 500;
          color: #ffffff;
        }
        
        .input-with-icon {
          position: relative;
        }
        
        .input-with-icon i {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #f7eb00;
        }
        
        .input-with-icon input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s;
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }
        
        .input-with-icon input:focus {
          outline: none;
          border-color: #f7eb00;
          box-shadow: 0 0 0 2px rgba(247, 235, 0, 0.2);
        }
        
        .login-button {
          background-color: #f7eb00;
          color: #131624;
          border: none;
          padding: 0.85rem;
          border-radius: 6px;
          font-weight: 500;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 1rem;
        }
        
        .login-button:hover {
          background-color: #e9dd00;
        }
        
        .login-button:disabled {
          background-color: #e9e9e9;
          color: #999;
          cursor: not-allowed;
        }
        
        .error-message {
          background-color: rgba(220, 38, 38, 0.1);
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .login-footer {
          margin-top: 2rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
        }
        
        .login-footer p {
          margin: 0.25rem 0;
        }
        
        .copyright {
          font-size: 0.75rem;
        }
      </style>
    `;
  }
}

customElements.define('login-form', LoginForm);