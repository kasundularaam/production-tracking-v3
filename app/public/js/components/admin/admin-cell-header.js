import { LitElement, html } from 'https://esm.run/lit';
import { fetchJson } from '../../utils/api_utils.js';

class AdminCellHeader extends LitElement {
    static get properties() {
        return {
            cellId: { type: Number },
            cell: { type: Object },
            loading: { type: Boolean },
            error: { type: String }
        };
    }

    constructor() {
        super();
        this.cellId = null;
        this.cell = null;
        this.loading = true;
        this.error = '';
    }

    // Disable Shadow DOM to access global styles
    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        // Use the global cellId from the window object
        this.cellId = window.cellId;
        console.log('Cell Header - Using cell ID from window:', this.cellId);
        this.fetchCellDetails();
    }

    async fetchCellDetails() {
        if (!this.cellId) {
            console.error('No cell ID available');
            this.error = 'No cell ID provided';
            this.loading = false;
            return;
        }

        console.log(`Fetching cell details for ID: ${this.cellId}`);

        try {
            this.loading = true;
            this.error = '';

            // Log the API URL being called
            const apiUrl = `/api/admin/cells/${this.cellId}`;
            console.log(`Calling API: ${apiUrl}`);

            const cell = await fetchJson(apiUrl);
            console.log('Cell data received:', cell);

            this.cell = cell;
        } catch (error) {
            console.error('Error fetching cell details:', error);
            this.error = `Failed to load cell details: ${error.message || 'Unknown error'}`;
        } finally {
            this.loading = false;
        }
    }

    render() {
        console.log('Rendering cell header with state:', {
            cellId: this.cellId,
            cell: this.cell,
            loading: this.loading,
            error: this.error
        });

        if (this.loading) {
            return html`
        <div class="admin-cell-header admin-cell-header-loading">
          <div class="admin-cell-header-loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <div class="admin-cell-header-loading-text">Loading cell details...</div>
        </div>
      `;
        }

        if (this.error) {
            return html`
        <div class="admin-cell-header admin-cell-header-error">
          <div class="admin-cell-header-error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="admin-cell-header-error-text">${this.error}</div>
          <button @click=${this.fetchCellDetails} class="admin-cell-header-error-retry">
            <i class="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      `;
        }

        if (!this.cell) {
            return html`
        <div class="admin-cell-header admin-cell-header-error">
          <div class="admin-cell-header-error-icon">
            <i class="fas fa-th"></i>
          </div>
          <div class="admin-cell-header-error-text">Cell not found.</div>
          <a href="/admin/dashboard" class="admin-cell-header-error-back">
            <i class="fas fa-arrow-left"></i> Back to Dashboard
          </a>
        </div>
      `;
        }

        return html`
      <div class="admin-cell-header">
        <div class="admin-cell-header-content">
          <div class="admin-cell-header-icon">
            <i class="fas fa-th"></i>
          </div>
          <div class="admin-cell-header-details">
            <div class="admin-cell-header-line">
              <a href="/admin/lines/${this.cell.line_id}" class="admin-cell-header-line-link">
                <i class="fas fa-project-diagram"></i> Line ID: ${this.cell.line_id}
              </a>
            </div>
            <h1 class="admin-cell-header-title">${this.cell.name}</h1>
            <div class="admin-cell-header-meta">
              <span class="admin-cell-header-id">ID: ${this.cell.id}</span>
              ${this.cell.created_at ? html`
                <span class="admin-cell-header-created">
                  Created: ${new Date(this.cell.created_at).toLocaleDateString()}
                </span>
              ` : ''}
            </div>
          </div>
        </div>
        
        <div class="admin-cell-header-actions">
          <button class="admin-cell-header-action admin-cell-header-edit">
            <i class="fas fa-edit"></i> Edit Cell
          </button>
        </div>
      </div>

      <style>
        .admin-cell-header {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }
        
        .admin-cell-header-loading,
        .admin-cell-header-error {
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          padding: 3rem 1.5rem;
          text-align: center;
        }
        
        .admin-cell-header-loading-spinner,
        .admin-cell-header-error-icon {
          font-size: 2rem;
          color: #f7eb00;
          margin-bottom: 0.5rem;
        }
        
        .admin-cell-header-error-icon {
          color: #e74c3c;
        }
        
        .admin-cell-header-loading-text,
        .admin-cell-header-error-text {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .admin-cell-header-error-retry,
        .admin-cell-header-error-back {
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
        
        .admin-cell-header-error-retry:hover,
        .admin-cell-header-error-back:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        .admin-cell-header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .admin-cell-header-icon {
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
        
        .admin-cell-header-line {
          margin-bottom: 0.5rem;
        }
        
        .admin-cell-header-line-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.875rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.2s;
        }
        
        .admin-cell-header-line-link:hover {
          color: #f7eb00;
        }
        
        .admin-cell-header-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 500;
        }
        
        .admin-cell-header-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .admin-cell-header-action {
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
        
        .admin-cell-header-action:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        @media (max-width: 768px) {
          .admin-cell-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          
          .admin-cell-header-actions {
            align-self: flex-start;
          }
        }
      </style>
    `;
    }
}

customElements.define('admin-cell-header', AdminCellHeader);