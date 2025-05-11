import { LitElement, html } from 'https://esm.run/lit';
import { postJson } from '../../utils/api_utils.js';

class AdminNewLoopForm extends LitElement {
    static get properties() {
        return {
            zoneId: { type: String },
            loopName: { type: String },
            isSubmitting: { type: Boolean },
            error: { type: String },
            success: { type: Boolean }
        };
    }

    constructor() {
        super();
        this.zoneId = null;
        this.loopName = '';
        this.isSubmitting = false;
        this.error = '';
        this.success = false;
    }

    // Disable Shadow DOM to access global styles
    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        // Use the global zoneId from the window object
        this.zoneId = window.zoneId;
        console.log('New Loop Form - Using zone ID:', this.zoneId);

        if (!this.zoneId) {
            this.error = 'No zone ID provided';
        }
    }

    handleInputChange(e) {
        this.loopName = e.target.value;
        this.error = '';
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate form
        if (!this.loopName || this.loopName.trim() === '') {
            this.error = 'Loop name is required';
            return;
        }

        if (!this.zoneId) {
            this.error = 'Zone ID is required';
            return;
        }

        try {
            this.isSubmitting = true;
            this.error = '';

            // Submit the form
            await postJson('/api/admin/loops', {
                name: this.loopName.trim(),
                zone_id: parseInt(this.zoneId)
            });

            // Show success message
            this.success = true;

            // Redirect to zone page after a short delay
            setTimeout(() => {
                window.location.href = `/admin/zones/${this.zoneId}`;
            }, 1500);

        } catch (error) {
            console.error('Error creating loop:', error);
            this.error = error.message || 'Failed to create loop. Please try again.';
        } finally {
            this.isSubmitting = false;
        }
    }

    render() {
        console.log('Rendering new loop form with state:', {
            zoneId: this.zoneId,
            loopName: this.loopName,
            isSubmitting: this.isSubmitting,
            error: this.error,
            success: this.success
        });

        if (this.success) {
            return html`
        <div class="admin-new-loop-success">
          <div class="admin-new-loop-success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3 class="admin-new-loop-success-title">Loop Created Successfully!</h3>
          <p class="admin-new-loop-success-message">Redirecting to zone page...</p>
        </div>
      `;
        }

        return html`
      <div class="admin-new-loop-form-container">
        <form @submit=${this.handleSubmit} class="admin-new-loop-form">
          ${this.error ? html`
            <div class="admin-new-loop-error">
              <i class="fas fa-exclamation-circle"></i> ${this.error}
            </div>
          ` : ''}
          
          <div class="admin-new-loop-field">
            <label for="loop-name" class="admin-new-loop-label">Loop Name</label>
            <div class="admin-new-loop-input-container">
              <i class="fas fa-route admin-new-loop-input-icon"></i>
              <input 
                type="text" 
                id="loop-name" 
                class="admin-new-loop-input" 
                placeholder="Enter loop name" 
                .value=${this.loopName}
                @input=${this.handleInputChange}
                ?disabled=${this.isSubmitting}
                autofocus
              />
            </div>
            <small class="admin-new-loop-hint">The loop name should be unique and descriptive</small>
          </div>
          
          <div class="admin-new-loop-actions">
            <a href="/admin/zones/${this.zoneId}" class="admin-new-loop-cancel" ?disabled=${this.isSubmitting}>
              Cancel
            </a>
            <button type="submit" class="admin-new-loop-submit" ?disabled=${this.isSubmitting || !this.zoneId}>
              ${this.isSubmitting ? html`
                <i class="fas fa-spinner fa-spin"></i> Creating...
              ` : html`
                <i class="fas fa-plus"></i> Create Loop
              `}
            </button>
          </div>
        </form>
      </div>

      <style>
        .admin-new-loop-form-container {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 2rem;
          max-width: 600px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .admin-new-loop-error {
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
        
        .admin-new-loop-field {
          margin-bottom: 1.5rem;
        }
        
        .admin-new-loop-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .admin-new-loop-input-container {
          position: relative;
        }
        
        .admin-new-loop-input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #f7eb00;
        }
        
        .admin-new-loop-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          font-size: 1rem;
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          transition: border-color 0.2s;
        }
        
        .admin-new-loop-input:focus {
          outline: none;
          border-color: #f7eb00;
          box-shadow: 0 0 0 2px rgba(247, 235, 0, 0.2);
        }
        
        .admin-new-loop-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .admin-new-loop-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-loop-hint {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .admin-new-loop-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .admin-new-loop-cancel {
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
        
        .admin-new-loop-cancel:hover {
          color: #ffffff;
        }
        
        .admin-new-loop-cancel:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-loop-submit {
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
        
        .admin-new-loop-submit:hover {
          background-color: #e5d900;
        }
        
        .admin-new-loop-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-loop-success {
          background-color: rgba(46, 204, 113, 0.1);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }
        
        .admin-new-loop-success-icon {
          font-size: 3rem;
          color: #2ecc71;
          margin-bottom: 1rem;
        }
        
        .admin-new-loop-success-title {
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
        }
        
        .admin-new-loop-success-message {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      </style>
    `;
    }
}

customElements.define('admin-new-loop-form', AdminNewLoopForm);