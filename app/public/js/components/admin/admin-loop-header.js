import { LitElement, html } from 'https://esm.run/lit';
import { fetchJson } from '../../utils/api_utils.js';

class AdminLoopHeader extends LitElement {
    static get properties() {
        return {
            loopId: { type: Number },
            loop: { type: Object },
            loading: { type: Boolean },
            error: { type: String }
        };
    }

    constructor() {
        super();
        this.loopId = null;
        this.loop = null;
        this.loading = true;
        this.error = '';
    }

    // Disable Shadow DOM to access global styles
    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        // Use the global loopId from the window object
        this.loopId = window.loopId;
        console.log('Loop Header - Using loop ID from window:', this.loopId);
        this.fetchLoopDetails();
    }

    async fetchLoopDetails() {
        if (!this.loopId) {
            console.error('No loop ID available');
            this.error = 'No loop ID provided';
            this.loading = false;
            return;
        }

        console.log(`Fetching loop details for ID: ${this.loopId}`);

        try {
            this.loading = true;
            this.error = '';

            // Log the API URL being called
            const apiUrl = `/api/admin/loops/${this.loopId}`;
            console.log(`Calling API: ${apiUrl}`);

            const loop = await fetchJson(apiUrl);
            console.log('Loop data received:', loop);

            this.loop = loop;
        } catch (error) {
            console.error('Error fetching loop details:', error);
            this.error = `Failed to load loop details: ${error.message || 'Unknown error'}`;
        } finally {
            this.loading = false;
        }
    }

    render() {
        console.log('Rendering loop header with state:', {
            loopId: this.loopId,
            loop: this.loop,
            loading: this.loading,
            error: this.error
        });

        if (this.loading) {
            return html`
        <div class="admin-loop-header admin-loop-header-loading">
          <div class="admin-loop-header-loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <div class="admin-loop-header-loading-text">Loading loop details...</div>
        </div>
      `;
        }

        if (this.error) {
            return html`
        <div class="admin-loop-header admin-loop-header-error">
          <div class="admin-loop-header-error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="admin-loop-header-error-text">${this.error}</div>
          <button @click=${this.fetchLoopDetails} class="admin-loop-header-error-retry">
            <i class="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      `;
        }

        if (!this.loop) {
            return html`
        <div class="admin-loop-header admin-loop-header-error">
          <div class="admin-loop-header-error-icon">
            <i class="fas fa-route"></i>
          </div>
          <div class="admin-loop-header-error-text">Loop not found.</div>
          <a href="/admin/dashboard" class="admin-loop-header-error-back">
            <i class="fas fa-arrow-left"></i> Back to Dashboard
          </a>
        </div>
      `;
        }

        return html`
      <div class="admin-loop-header">
        <div class="admin-loop-header-content">
          <div class="admin-loop-header-icon">
            <i class="fas fa-route"></i>
          </div>
          <div class="admin-loop-header-details">
            <div class="admin-loop-header-zone">
              <a href="/admin/zones/${this.loop.zone_id}" class="admin-loop-header-zone-link">
                <i class="fas fa-map-marker-alt"></i> Zone ID: ${this.loop.zone_id}
              </a>
            </div>
            <h1 class="admin-loop-header-title">${this.loop.name}</h1>
            <div class="admin-loop-header-meta">
              <span class="admin-loop-header-id">ID: ${this.loop.id}</span>
              ${this.loop.created_at ? html`
                <span class="admin-loop-header-created">
                  Created: ${new Date(this.loop.created_at).toLocaleDateString()}
                </span>
              ` : ''}
            </div>
          </div>
        </div>
        
        <div class="admin-loop-header-actions">
          <button class="admin-loop-header-action admin-loop-header-edit">
            <i class="fas fa-edit"></i> Edit Loop
          </button>
        </div>
      </div>

      <style>
        .admin-loop-header {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }
        
        .admin-loop-header-loading,
        .admin-loop-header-error {
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          padding: 3rem 1.5rem;
          text-align: center;
        }
        
        .admin-loop-header-loading-spinner,
        .admin-loop-header-error-icon {
          font-size: 2rem;
          color: #f7eb00;
          margin-bottom: 0.5rem;
        }
        
        .admin-loop-header-error-icon {
          color: #e74c3c;
        }
        
        .admin-loop-header-loading-text,
        .admin-loop-header-error-text {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .admin-loop-header-error-retry,
        .admin-loop-header-error-back {
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
        
        .admin-loop-header-error-retry:hover,
        .admin-loop-header-error-back:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        .admin-loop-header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .admin-loop-header-icon {
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
        
        .admin-loop-header-zone {
          margin-bottom: 0.5rem;
        }
        
        .admin-loop-header-zone-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.875rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.2s;
        }
        
        .admin-loop-header-zone-link:hover {
          color: #f7eb00;
        }
        
        .admin-loop-header-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 500;
        }
        
        .admin-loop-header-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .admin-loop-header-action {
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
        
        .admin-loop-header-action:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        @media (max-width: 768px) {
          .admin-loop-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          
          .admin-loop-header-actions {
            align-self: flex-start;
          }
        }
      </style>
    `;
    }
}

customElements.define('admin-loop-header', AdminLoopHeader);