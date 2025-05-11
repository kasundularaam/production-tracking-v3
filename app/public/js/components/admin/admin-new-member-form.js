import { LitElement, html } from 'https://esm.run/lit';
import { postJson } from '../../utils/api_utils.js';

class AdminNewMemberForm extends LitElement {
    static get properties() {
        return {
            cellId: { type: String },
            sapId: { type: String },
            name: { type: String },
            isSubmitting: { type: Boolean },
            error: { type: String },
            success: { type: Boolean }
        };
    }

    constructor() {
        super();
        this.cellId = null;
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
        // Use the global cellId from the window object
        this.cellId = window.cellId;
        console.log('New Member Form - Using cell ID:', this.cellId);

        if (!this.cellId) {
            this.error = 'No cell ID provided';
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

        if (!this.cellId) {
            this.error = 'Cell ID is required';
            return;
        }

        try {
            this.isSubmitting = true;
            this.error = '';

            // Submit the form - note that role is fixed as 'MEMBER' and password is the same as SAP ID
            const cleanSapId = this.sapId.trim();

            await postJson('/api/admin/members', {
                sap_id: cleanSapId,
                name: this.name.trim(),
                cell_id: parseInt(this.cellId)
                // Note: The backend will handle setting the role as MEMBER 
                // and setting password equal to SAP ID
            });

            // Show success message
            this.success = true;

            // Redirect to cell page after a short delay
            setTimeout(() => {
                window.location.href = `/admin/cells/${this.cellId}`;
            }, 1500);

        } catch (error) {
            console.error('Error creating member:', error);
            this.error = error.message || 'Failed to create member. Please try again.';
        } finally {
            this.isSubmitting = false;
        }
    }

    render() {
        console.log('Rendering new member form with state:', {
            cellId: this.cellId,
            sapId: this.sapId,
            name: this.name,
            isSubmitting: this.isSubmitting,
            error: this.error,
            success: this.success
        });

        if (this.success) {
            return html`
        <div class="admin-new-member-success">
          <div class="admin-new-member-success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3 class="admin-new-member-success-title">Member Created Successfully!</h3>
          <p class="admin-new-member-success-message">Redirecting to cell page...</p>
        </div>
      `;
        }

        return html`
      <div class="admin-new-member-form-container">
        <form @submit=${this.handleSubmit} class="admin-new-member-form">
          ${this.error ? html`
            <div class="admin-new-member-error">
              <i class="fas fa-exclamation-circle"></i> ${this.error}
            </div>
          ` : ''}
          
          <div class="admin-new-member-field">
            <label for="sap-id" class="admin-new-member-label">SAP ID</label>
            <div class="admin-new-member-input-container">
              <i class="fas fa-id-card admin-new-member-input-icon"></i>
              <input 
                type="text" 
                id="sap-id" 
                class="admin-new-member-input" 
                placeholder="Enter SAP ID" 
                .value=${this.sapId}
                @input=${this.handleSapIdChange}
                ?disabled=${this.isSubmitting}
                autofocus
              />
            </div>
            <small class="admin-new-member-hint">The SAP ID must be unique and will also be used as the password</small>
          </div>
          
          <div class="admin-new-member-field">
            <label for="name" class="admin-new-member-label">Full Name</label>
            <div class="admin-new-member-input-container">
              <i class="fas fa-user admin-new-member-input-icon"></i>
              <input 
                type="text" 
                id="name" 
                class="admin-new-member-input" 
                placeholder="Enter full name" 
                .value=${this.name}
                @input=${this.handleNameChange}
                ?disabled=${this.isSubmitting}
              />
            </div>
            <small class="admin-new-member-hint">Full name of the member</small>
          </div>
          
          <div class="admin-new-member-info">
            <i class="fas fa-info-circle"></i>
            <span>Member will be created with role <strong>MEMBER</strong> and password set to the SAP ID</span>
          </div>
          
          <div class="admin-new-member-actions">
            <a href="/admin/cells/${this.cellId}" class="admin-new-member-cancel" ?disabled=${this.isSubmitting}>
              Cancel
            </a>
            <button type="submit" class="admin-new-member-submit" ?disabled=${this.isSubmitting || !this.cellId}>
              ${this.isSubmitting ? html`
                <i class="fas fa-spinner fa-spin"></i> Creating...
              ` : html`
                <i class="fas fa-plus"></i> Create Member
              `}
            </button>
          </div>
        </form>
      </div>

      <style>
        .admin-new-member-form-container {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 2rem;
          max-width: 600px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .admin-new-member-error {
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
        
        .admin-new-member-field {
          margin-bottom: 1.5rem;
        }
        
        .admin-new-member-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .admin-new-member-input-container {
          position: relative;
        }
        
        .admin-new-member-input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #f7eb00;
        }
        
        .admin-new-member-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          font-size: 1rem;
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          transition: border-color 0.2s;
        }
        
        .admin-new-member-input:focus {
          outline: none;
          border-color: #f7eb00;
          box-shadow: 0 0 0 2px rgba(247, 235, 0, 0.2);
        }
        
        .admin-new-member-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .admin-new-member-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-member-hint {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .admin-new-member-info {
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
        
        .admin-new-member-info i {
          color: #3498db;
          font-size: 1rem;
        }
        
        .admin-new-member-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .admin-new-member-cancel {
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
        
        .admin-new-member-cancel:hover {
          color: #ffffff;
        }
        
        .admin-new-member-cancel:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-member-submit {
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
        
        .admin-new-member-submit:hover {
          background-color: #e5d900;
        }
        
        .admin-new-member-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .admin-new-member-success {
          background-color: rgba(46, 204, 113, 0.1);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }
        
        .admin-new-member-success-icon {
          font-size: 3rem;
          color: #2ecc71;
          margin-bottom: 1rem;
        }
        
        .admin-new-member-success-title {
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
        }
        
        .admin-new-member-success-message {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      </style>
    `;
    }
}

customElements.define('admin-new-member-form', AdminNewMemberForm);