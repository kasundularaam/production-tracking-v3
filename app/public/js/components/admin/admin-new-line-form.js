import { LitElement, html } from 'https://esm.run/lit';
import { postJson } from '../../utils/api_utils.js';

class AdminNewLineForm extends LitElement {
    static get properties() {
        return {
            loopId: { type: String },
            lineName: { type: String },
            isSubmitting: { type: Boolean },
            error: { type: String },
            success: { type: Boolean }
        };
    }

    constructor() {
        super();
        this.loopId = null;
        this.lineName = '';
        this.isSubmitting = false;
        this.error = '';
        this.success = false;
    }

    // Disable Shadow DOM to access global styles
    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        // Use the global loopId from the window object
        this.loopId = window.loopId;
        console.log('New Line Form - Using loop ID:', this.loopId);

        if (!this.loopId) {
            this.error = 'No loop ID provided';
        }
    }

    handleInputChange(e) {
        this.lineName = e.target.value;
        this.error = '';
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate form
        if (!this.lineName || this.lineName.trim() === '') {
            this.error = 'Line name is required';
            return;
        }

        if (!this.loopId) {
            this.error = 'Loop ID is required';
            return;
        }

        try {
            this.isSubmitting = true;
            this.error = '';

            // Submit the form
            await postJson('/api/admin/lines', {
                name: this.lineName.trim(),
                loop_id: parseInt(this.loopId)
            });

            // Show success message
            this.success = true;

            // Redirect to loop page after a short delay
            setTimeout(() => {
                window.location.href = `/admin/loops/${this.loopId}`;
            }, 1500);

        } catch (error) {
            console.error('Error creating line:', error);
            this.error = error.message || 'Failed to create line. Please try again.';
        } finally {
            this.isSubmitting = false;
        }
    }

    render() {
        console.log('Rendering new line form with state:', {
            loopId: this.loopId,
            lineName: this.lineName,
            isSubmitting: this.isSubmitting,
            error: this.error,
            success: this.success
        });

        if (this.success) {
            return html`
        <div class="admin-new-line-success">
          <div class="admin-new-line-success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3 class="admin-new-line-success-title">Line Created Successfully!</h3>
          <p class="admin-new-line-success-message">Redirecting to loop page...</p>
        </div>
      `;
        }

        return html`
      <div class="admin-new-line-form-container">
        <form @submit=${this.handleSubmit} class="admin-new-line-form">
          ${this.error ? html`
            <div class="admin-new-line-error">
              <i class="fas fa-exclamation-circle"></i> ${this.error}
            </div>
          ` : ''}
          
          <div class="admin-new-line-field">
            <label for="line-name" class="admin-new-line-label">Line Name</label>
            <div class="admin-new-line-input-container">
              <i class="fas fa-project-diagram admin-new-line-input-icon"></i>
              <input 
                type="text" 
                id="line-name" 
                class="admin-new-line-input" 
                placeholder="Enter line name" 
                .value=${this.lineName}
                @input=${this.handleInputChange}
                ?disabled=${this.isSubmitting}
                autofocus
              />
            </div>
            <small class="admin-new-line-hint">The line name should be unique and descriptive</small>
          </div>
          
          <div class="admin-new-line-actions">
            <a href="/admin/loops/${this.loopId}" class="admin-new-line-cancel" ?disabled=${this.isSubmitting}>
              Cancel
            </a>
            <button type="submit" class="admin-new-line-submit" ?disabled=${this.isSubmitting || !this.loopId}>
              ${this.isSubmitting ? html`
                <i class="fas fa-spinner fa-spin"></i> Creating...
              ` : html`
                <i class="fas fa-plus"></i> Create Line
              `}
            </button>
          </div>
        </form>
      </div>

      <style>
        .admin-new-line-form-container {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 2rem;
          max-width: 600px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .admin-new-line-error {
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
        
        .admin-new-line-field {
          margin-bottom: 1.5rem;
        }
        
        .admin-new-line-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .admin-new-line-input-container {
          position: relative;
        }
        
        .admin-new-line-input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #f7eb00;
        }
        
        .admin-new-line-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          font-size: 1rem;
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          transition: border-color 0.2s;
        }
        
        .admin-new-line-input:focus {
          outline: none;
          border-color: #f7eb00;
          box-shadow: 0 0 0 2px rgba(247, 235, 0, 0.2);
        }
        
        .admin-new-line-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .admin-new-line-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-line-hint {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .admin-new-line-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .admin-new-line-cancel {
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
        
        .admin-new-line-cancel:hover {
          color: #ffffff;
        }
        
        .admin-new-line-cancel:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-line-submit {
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
        
        .admin-new-line-submit:hover {
          background-color: #e5d900;
        }
        
        .admin-new-line-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-line-success {
          background-color: rgba(46, 204, 113, 0.1);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }
        
        .admin-new-line-success-icon {
          font-size: 3rem;
          color: #2ecc71;
          margin-bottom: 1rem;
        }
        
        .admin-new-line-success-title {
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
        }
        
        .admin-new-line-success-message {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      </style>
    `;
    }
}

customElements.define('admin-new-line-form', AdminNewLineForm);