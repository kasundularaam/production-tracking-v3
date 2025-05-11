// app/public/js/components/admin/admin-new-planner-form.js

import { LitElement, html } from 'https://esm.run/lit';
import { postJson } from '../../utils/api_utils.js';

class AdminNewPlannerForm extends LitElement {
    static get properties() {
        return {
            plantId: { type: String },
            sapId: { type: String },
            name: { type: String },
            isSubmitting: { type: Boolean },
            error: { type: String },
            success: { type: Boolean }
        };
    }

    constructor() {
        super();
        this.plantId = null;
        this.sapId = '';
        this.name = '';
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
        console.log('New Planner Form - Using plant ID:', this.plantId);

        if (!this.plantId) {
            this.error = 'No plant ID provided';
        }
    }

    handleSapIdChange(e) {
        this.sapId = e.target.value;
        this.error = '';
    }

    handleNameChange(e) {
        this.name = e.target.value;
        this.error = '';
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate form
        if (!this.sapId || this.sapId.trim() === '') {
            this.error = 'SAP ID is required';
            return;
        }

        if (!this.name || this.name.trim() === '') {
            this.error = 'Name is required';
            return;
        }

        if (!this.plantId) {
            this.error = 'Plant ID is required';
            return;
        }

        try {
            this.isSubmitting = true;
            this.error = '';

            // Submit the form - note that role is fixed as 'PLANNER' and password is the same as SAP ID
            const cleanSapId = this.sapId.trim();

            await postJson('/api/admin/planners', {
                sap_id: cleanSapId,
                name: this.name.trim(),
                plant_id: parseInt(this.plantId)
                // The backend will handle setting the role as PLANNER
                // and setting password equal to SAP ID
            });

            // Show success message
            this.success = true;

            // Redirect to plant page after a short delay
            setTimeout(() => {
                window.location.href = `/admin/plants/${this.plantId}`;
            }, 1500);

        } catch (error) {
            console.error('Error creating planner:', error);
            this.error = error.message || 'Failed to create planner. Please try again.';
        } finally {
            this.isSubmitting = false;
        }
    }

    render() {
        if (this.success) {
            return html`
        <div class="admin-new-planner-success">
          <div class="admin-new-planner-success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3 class="admin-new-planner-success-title">Planner Created Successfully!</h3>
          <p class="admin-new-planner-success-message">Redirecting to plant page...</p>
        </div>
      `;
        }

        return html`
      <div class="admin-new-planner-form-container">
        <form @submit=${this.handleSubmit} class="admin-new-planner-form">
          ${this.error ? html`
            <div class="admin-new-planner-error">
              <i class="fas fa-exclamation-circle"></i> ${this.error}
            </div>
          ` : ''}
          
          <div class="admin-new-planner-field">
            <label for="sap-id" class="admin-new-planner-label">SAP ID</label>
            <div class="admin-new-planner-input-container">
              <i class="fas fa-id-card admin-new-planner-input-icon"></i>
              <input 
                type="text" 
                id="sap-id" 
                class="admin-new-planner-input" 
                placeholder="Enter SAP ID" 
                .value=${this.sapId}
                @input=${this.handleSapIdChange}
                ?disabled=${this.isSubmitting}
                autofocus
              />
            </div>
            <small class="admin-new-planner-hint">The SAP ID must be unique and will also be used as the password</small>
          </div>
          
          <div class="admin-new-planner-field">
            <label for="name" class="admin-new-planner-label">Full Name</label>
            <div class="admin-new-planner-input-container">
              <i class="fas fa-user admin-new-planner-input-icon"></i>
              <input 
                type="text" 
                id="name" 
                class="admin-new-planner-input" 
                placeholder="Enter full name" 
                .value=${this.name}
                @input=${this.handleNameChange}
                ?disabled=${this.isSubmitting}
              />
            </div>
            <small class="admin-new-planner-hint">Full name of the planner</small>
          </div>
          
          <div class="admin-new-planner-info">
            <i class="fas fa-info-circle"></i>
            <span>Planner will be created with role <strong>PLANNER</strong> and password set to the SAP ID</span>
          </div>
          
          <div class="admin-new-planner-actions">
            <a href="/admin/plants/${this.plantId}" class="admin-new-planner-cancel" ?disabled=${this.isSubmitting}>
              Cancel
            </a>
            <button type="submit" class="admin-new-planner-submit" ?disabled=${this.isSubmitting || !this.plantId}>
              ${this.isSubmitting ? html`
                <i class="fas fa-spinner fa-spin"></i> Creating...
              ` : html`
                <i class="fas fa-plus"></i> Create Planner
              `}
            </button>
          </div>
        </form>
      </div>

      <style>
        .admin-new-planner-form-container {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 2rem;
          max-width: 600px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .admin-new-planner-error {
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
        
        .admin-new-planner-field {
          margin-bottom: 1.5rem;
        }
        
        .admin-new-planner-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .admin-new-planner-input-container {
          position: relative;
        }
        
        .admin-new-planner-input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #f7eb00;
        }
        
        .admin-new-planner-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          font-size: 1rem;
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          transition: border-color 0.2s;
        }
        
        .admin-new-planner-input:focus {
          outline: none;
          border-color: #f7eb00;
          box-shadow: 0 0 0 2px rgba(247, 235, 0, 0.2);
        }
        
        .admin-new-planner-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .admin-new-planner-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-planner-hint {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .admin-new-planner-info {
          background-color: rgba(52, 152, 219, 0.1);
          border-radius: 4px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }
        
        .admin-new-planner-info i {
          color: #3498db;
          font-size: 1rem;
        }
        
        .admin-new-planner-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .admin-new-planner-cancel {
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
        
        .admin-new-planner-cancel:hover {
          color: #ffffff;
        }
        
        .admin-new-planner-cancel:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-planner-submit {
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
        
        .admin-new-planner-submit:hover {
          background-color: #e5d900;
        }
        
        .admin-new-planner-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-planner-success {
          background-color: rgba(46, 204, 113, 0.1);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }
        
        .admin-new-planner-success-icon {
          font-size: 3rem;
          color: #2ecc71;
          margin-bottom: 1rem;
        }
        
        .admin-new-planner-success-title {
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
        }
        
        .admin-new-planner-success-message {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      </style>
    `;
    }
}

customElements.define('admin-new-planner-form', AdminNewPlannerForm);