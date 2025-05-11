import { LitElement, html } from 'https://esm.run/lit';
import { postJson } from '../../utils/api_utils.js';

class AdminNewZoneForm extends LitElement {
    static get properties() {
        return {
            plantId: { type: String },
            zoneName: { type: String },
            isSubmitting: { type: Boolean },
            error: { type: String },
            success: { type: Boolean }
        };
    }

    constructor() {
        super();
        this.plantId = null;
        this.zoneName = '';
        this.isSubmitting = false;
        this.error = '';
        this.success = false;
    }

    // Disable Shadow DOM to access global styles
    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        // Use the global plantId from the window object
        this.plantId = window.plantId;
        console.log('New Zone Form - Using plant ID:', this.plantId);

        if (!this.plantId) {
            this.error = 'No plant ID provided';
        }
    }

    handleInputChange(e) {
        this.zoneName = e.target.value;
        this.error = '';
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate form
        if (!this.zoneName || this.zoneName.trim() === '') {
            this.error = 'Zone name is required';
            return;
        }

        if (!this.plantId) {
            this.error = 'Plant ID is required';
            return;
        }

        try {
            this.isSubmitting = true;
            this.error = '';

            // Submit the form
            await postJson('/api/admin/zones', {
                name: this.zoneName.trim(),
                plant_id: parseInt(this.plantId)
            });

            // Show success message
            this.success = true;

            // Redirect to plant page after a short delay
            setTimeout(() => {
                window.location.href = `/admin/plants/${this.plantId}`;
            }, 1500);

        } catch (error) {
            console.error('Error creating zone:', error);
            this.error = error.message || 'Failed to create zone. Please try again.';
        } finally {
            this.isSubmitting = false;
        }
    }

    render() {
        console.log('Rendering new zone form with state:', {
            plantId: this.plantId,
            zoneName: this.zoneName,
            isSubmitting: this.isSubmitting,
            error: this.error,
            success: this.success
        });

        if (this.success) {
            return html`
        <div class="admin-new-zone-success">
          <div class="admin-new-zone-success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3 class="admin-new-zone-success-title">Zone Created Successfully!</h3>
          <p class="admin-new-zone-success-message">Redirecting to plant page...</p>
        </div>
      `;
        }

        return html`
      <div class="admin-new-zone-form-container">
        <form @submit=${this.handleSubmit} class="admin-new-zone-form">
          ${this.error ? html`
            <div class="admin-new-zone-error">
              <i class="fas fa-exclamation-circle"></i> ${this.error}
            </div>
          ` : ''}
          
          <div class="admin-new-zone-field">
            <label for="zone-name" class="admin-new-zone-label">Zone Name</label>
            <div class="admin-new-zone-input-container">
              <i class="fas fa-map-marker-alt admin-new-zone-input-icon"></i>
              <input 
                type="text" 
                id="zone-name" 
                class="admin-new-zone-input" 
                placeholder="Enter zone name" 
                .value=${this.zoneName}
                @input=${this.handleInputChange}
                ?disabled=${this.isSubmitting}
                autofocus
              />
            </div>
            <small class="admin-new-zone-hint">The zone name should be unique and descriptive</small>
          </div>
          
          <div class="admin-new-zone-actions">
            <a href="/admin/plants/${this.plantId}" class="admin-new-zone-cancel" ?disabled=${this.isSubmitting}>
              Cancel
            </a>
            <button type="submit" class="admin-new-zone-submit" ?disabled=${this.isSubmitting || !this.plantId}>
              ${this.isSubmitting ? html`
                <i class="fas fa-spinner fa-spin"></i> Creating...
              ` : html`
                <i class="fas fa-plus"></i> Create Zone
              `}
            </button>
          </div>
        </form>
      </div>

      <style>
        .admin-new-zone-form-container {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 2rem;
          max-width: 600px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .admin-new-zone-error {
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
        
        .admin-new-zone-field {
          margin-bottom: 1.5rem;
        }
        
        .admin-new-zone-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .admin-new-zone-input-container {
          position: relative;
        }
        
        .admin-new-zone-input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #f7eb00;
        }
        
        .admin-new-zone-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          font-size: 1rem;
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          transition: border-color 0.2s;
        }
        
        .admin-new-zone-input:focus {
          outline: none;
          border-color: #f7eb00;
          box-shadow: 0 0 0 2px rgba(247, 235, 0, 0.2);
        }
        
        .admin-new-zone-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .admin-new-zone-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-zone-hint {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .admin-new-zone-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .admin-new-zone-cancel {
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
        
        .admin-new-zone-cancel:hover {
          color: #ffffff;
        }
        
        .admin-new-zone-cancel:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-zone-submit {
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
        
        .admin-new-zone-submit:hover {
          background-color: #e5d900;
        }
        
        .admin-new-zone-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-zone-success {
          background-color: rgba(46, 204, 113, 0.1);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }
        
        .admin-new-zone-success-icon {
          font-size: 3rem;
          color: #2ecc71;
          margin-bottom: 1rem;
        }
        
        .admin-new-zone-success-title {
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
        }
        
        .admin-new-zone-success-message {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      </style>
    `;
    }
}

customElements.define('admin-new-zone-form', AdminNewZoneForm);