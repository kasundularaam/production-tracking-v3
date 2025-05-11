import { LitElement, html } from 'https://esm.run/lit';
import { fetchJson } from '../../utils/api_utils.js';

class AdminLineHeader extends LitElement {
    static get properties() {
        return {
            lineId: { type: Number },
            line: { type: Object },
            loading: { type: Boolean },
            error: { type: String }
        };
    }

    constructor() {
        super();
        this.lineId = null;
        this.line = null;
        this.loading = true;
        this.error = '';
    }

    // Disable Shadow DOM to access global styles
    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        // Use the global lineId from the window object
        this.lineId = window.lineId;
        console.log('Line Header - Using line ID from window:', this.lineId);
        this.fetchLineDetails();
    }

    async fetchLineDetails() {
        if (!this.lineId) {
            console.error('No line ID available');
            this.error = 'No line ID provided';
            this.loading = false;
            return;
        }

        console.log(`Fetching line details for ID: ${this.lineId}`);

        try {
            this.loading = true;
            this.error = '';

            // Log the API URL being called
            const apiUrl = `/api/admin/lines/${this.lineId}`;
            console.log(`Calling API: ${apiUrl}`);

            const line = await fetchJson(apiUrl);
            console.log('Line data received:', line);

            this.line = line;
        } catch (error) {
            console.error('Error fetching line details:', error);
            this.error = `Failed to load line details: ${error.message || 'Unknown error'}`;
        } finally {
            this.loading = false;
        }
    }

    render() {
        console.log('Rendering line header with state:', {
            lineId: this.lineId,
            line: this.line,
            loading: this.loading,
            error: this.error
        });

        if (this.loading) {
            return html`
        <div class="admin-line-header admin-line-header-loading">
          <div class="admin-line-header-loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <div class="admin-line-header-loading-text">Loading line details...</div>
        </div>
      `;
        }

        if (this.error) {
            return html`
        <div class="admin-line-header admin-line-header-error">
          <div class="admin-line-header-error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="admin-line-header-error-text">${this.error}</div>
          <button @click=${this.fetchLineDetails} class="admin-line-header-error-retry">
            <i class="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      `;
        }

        if (!this.line) {
            return html`
        <div class="admin-line-header admin-line-header-error">
          <div class="admin-line-header-error-icon">
            <i class="fas fa-project-diagram"></i>
          </div>
          <div class="admin-line-header-error-text">Line not found.</div>
          <a href="/admin/dashboard" class="admin-line-header-error-back">
            <i class="fas fa-arrow-left"></i> Back to Dashboard
          </a>
        </div>
      `;
        }

        return html`
      <div class="admin-line-header">
        <div class="admin-line-header-content">
          <div class="admin-line-header-icon">
            <i class="fas fa-project-diagram"></i>
          </div>
          <div class="admin-line-header-details">
            <div class="admin-line-header-loop">
              <a href="/admin/loops/${this.line.loop_id}" class="admin-line-header-loop-link">
                <i class="fas fa-route"></i> Loop ID: ${this.line.loop_id}
              </a>
            </div>
            <h1 class="admin-line-header-title">${this.line.name}</h1>
            <div class="admin-line-header-meta">
              <span class="admin-line-header-id">ID: ${this.line.id}</span>
              ${this.line.created_at ? html`
                <span class="admin-line-header-created">
                  Created: ${new Date(this.line.created_at).toLocaleDateString()}
                </span>
              ` : ''}
            </div>
          </div>
        </div>
        
        <div class="admin-line-header-actions">
          <button class="admin-line-header-action admin-line-header-edit">
            <i class="fas fa-edit"></i> Edit Line
          </button>
        </div>
      </div>

      <style>
        .admin-line-header {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }
        
        .admin-line-header-loading,
        .admin-line-header-error {
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          padding: 3rem 1.5rem;
          text-align: center;
        }
        
        .admin-line-header-loading-spinner,
        .admin-line-header-error-icon {
          font-size: 2rem;
          color: #f7eb00;
          margin-bottom: 0.5rem;
        }
        
        .admin-line-header-error-icon {
          color: #e74c3c;
        }
        
        .admin-line-header-loading-text,
        .admin-line-header-error-text {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .admin-line-header-error-retry,
        .admin-line-header-error-back {
          background-color: transparent;
          color: #f7eb00;
          border: 1px solid #f7eb00;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }
        
        .admin-line-header-error-retry:hover,
        .admin-line-header-error-back:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        .admin-line-header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .admin-line-header-icon {
          font-size: 2rem;
          color: #f7eb00;
          background-color: rgba(247, 235, 0, 0.1);
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        
        .admin-line-header-loop {
          margin-bottom: 0.5rem;
        }
        
        .admin-line-header-loop-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.875rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.2s;
        }
        
        .admin-line-header-loop-link:hover {
          color: #f7eb00;
        }
        
        .admin-line-header-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 500;
        }
        
        .admin-line-header-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .admin-line-header-action {
          background-color: transparent;
          color: #f7eb00;
          border: 1px solid #f7eb00;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .admin-line-header-action:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        @media (max-width: 768px) {
          .admin-line-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          
          .admin-line-header-actions {
            align-self: flex-start;
          }
        }
      </style>
    `;
    }
}

customElements.define('admin-line-header', AdminLineHeader);