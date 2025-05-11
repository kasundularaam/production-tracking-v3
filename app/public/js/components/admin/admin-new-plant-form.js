import { LitElement, html } from 'https://esm.run/lit';
import { postJson } from '../../utils/api_utils.js';

class AdminNewPlantForm extends LitElement {
    static get properties() {
        return {
            plantName: { type: String },
            isSubmitting: { type: Boolean },
            error: { type: String },
            success: { type: Boolean }
        };
    }

    constructor() {
        super();
        this.plantName = '';
        this.isSubmitting = false;
        this.error = '';
        this.success = false;
    }

    // Disable Shadow DOM to access global styles
    createRenderRoot() {
        return this;
    }

    handleInputChange(e) {
        this.plantName = e.target.value;
        this.error = '';
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate form
        if (!this.plantName || this.plantName.trim() === '') {
            this.error = 'Plant name is required';
            return;
        }

        try {
            this.isSubmitting = true;
            this.error = '';

            // Submit the form
            await postJson('/api/admin/plants', {
                name: this.plantName.trim()
            });

            // Show success message
            this.success = true;

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = '/admin/dashboard';
            }, 1500);

        } catch (error) {
            console.error('Error creating plant:', error);
            this.error = error.message || 'Failed to create plant. Please try again.';
        } finally {
            this.isSubmitting = false;
        }
    }

    render() {
        if (this.success) {
            return html`
        <div class="admin-new-plant-success">
          <div class="admin-new-plant-success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3 class="admin-new-plant-success-title">Plant Created Successfully!</h3>
          <p class="admin-new-plant-success-message">Redirecting to dashboard...</p>
        </div>
      `;
        }

        return html`
      <div class="admin-new-plant-form-container">
        <form @submit=${this.handleSubmit} class="admin-new-plant-form">
          ${this.error ? html`
            <div class="admin-new-plant-error">
              <i class="fas fa-exclamation-circle"></i> ${this.error}
            </div>
          ` : ''}
          
          <div class="admin-new-plant-field">
            <label for="plant-name" class="admin-new-plant-label">Plant Name</label>
            <div class="admin-new-plant-input-container">
              <i class="fas fa-building admin-new-plant-input-icon"></i>
              <input 
                type="text" 
                id="plant-name" 
                class="admin-new-plant-input" 
                placeholder="Enter plant name" 
                .value=${this.plantName}
                @input=${this.handleInputChange}
                ?disabled=${this.isSubmitting}
                autofocus
              />
            </div>
            <small class="admin-new-plant-hint">The plant name should be unique and descriptive</small>
          </div>
          
          <div class="admin-new-plant-actions">
            <a href="/admin" class="admin-new-plant-cancel" ?disabled=${this.isSubmitting}>
              Cancel
            </a>
            <button type="submit" class="admin-new-plant-submit" ?disabled=${this.isSubmitting}>
              ${this.isSubmitting ? html`
                <i class="fas fa-spinner fa-spin"></i> Creating...
              ` : html`
                <i class="fas fa-plus"></i> Create Plant
              `}
            </button>
          </div>
        </form>
      </div>

      <style>
        .admin-new-plant-form-container {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 2rem;
          max-width: 600px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .admin-new-plant-error {
          background-color: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        
        .admin-new-plant-field {
          margin-bottom: 1.5rem;
        }
        
        .admin-new-plant-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .admin-new-plant-input-container {
          position: relative;
        }
        
        .admin-new-plant-input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #f7eb00;
        }
        
        .admin-new-plant-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          font-size: 1rem;
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          transition: border-color 0.2s;
        }
        
        .admin-new-plant-input:focus {
          outline: none;
          border-color: #f7eb00;
          box-shadow: 0 0 0 2px rgba(247, 235, 0, 0.2);
        }
        
        .admin-new-plant-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .admin-new-plant-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-plant-hint {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .admin-new-plant-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .admin-new-plant-cancel {
          background-color: transparent;
          color: rgba(255, 255, 255, 0.7);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s;
          display: inline-flex;
          align-items: center;
        }
        
        .admin-new-plant-cancel:hover {
          color: #ffffff;
        }
        
        .admin-new-plant-cancel:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-plant-submit {
          background-color: #f7eb00;
          color: #131624;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .admin-new-plant-submit:hover {
          background-color: #e5d900;
        }
        
        .admin-new-plant-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-plant-success {
          background-color: rgba(46, 204, 113, 0.1);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }
        
        .admin-new-plant-success-icon {
          font-size: 3rem;
          color: #2ecc71;
          margin-bottom: 1rem;
        }
        
        .admin-new-plant-success-title {
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
        }
        
        .admin-new-plant-success-message {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      </style>
    `;
    }
}

customElements.define('admin-new-plant-form', AdminNewPlantForm);