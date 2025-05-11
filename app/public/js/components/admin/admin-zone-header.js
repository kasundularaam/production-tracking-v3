import { LitElement, html } from 'https://esm.run/lit';
import { fetchJson } from '../../utils/api_utils.js';

class AdminZoneHeader extends LitElement {
    static get properties() {
        return {
            zoneId: { type: Number },
            zone: { type: Object },
            loading: { type: Boolean },
            error: { type: String }
        };
    }

    constructor() {
        super();
        this.zoneId = null;
        this.zone = null;
        this.loading = true;
        this.error = '';
    }

    // Disable Shadow DOM to access global styles
    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        // Use the global zoneId from the window object
        this.zoneId = window.zoneId;
        console.log('Zone Header - Using zone ID from window:', this.zoneId);
        this.fetchZoneDetails();
    }

    async fetchZoneDetails() {
        if (!this.zoneId) {
            console.error('No zone ID available');
            this.error = 'No zone ID provided';
            this.loading = false;
            return;
        }

        console.log(`Fetching zone details for ID: ${this.zoneId}`);

        try {
            this.loading = true;
            this.error = '';

            // Log the API URL being called
            const apiUrl = `/api/admin/zones/${this.zoneId}`;
            console.log(`Calling API: ${apiUrl}`);

            const zone = await fetchJson(apiUrl);
            console.log('Zone data received:', zone);

            this.zone = zone;
        } catch (error) {
            console.error('Error fetching zone details:', error);
            this.error = `Failed to load zone details: ${error.message || 'Unknown error'}`;
        } finally {
            this.loading = false;
        }
    }

    render() {
        console.log('Rendering zone header with state:', {
            zoneId: this.zoneId,
            zone: this.zone,
            loading: this.loading,
            error: this.error
        });

        if (this.loading) {
            return html`
        <div class="admin-zone-header admin-zone-header-loading">
          <div class="admin-zone-header-loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <div class="admin-zone-header-loading-text">Loading zone details...</div>
        </div>
      `;
        }

        if (this.error) {
            return html`
        <div class="admin-zone-header admin-zone-header-error">
          <div class="admin-zone-header-error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="admin-zone-header-error-text">${this.error}</div>
          <button @click=${this.fetchZoneDetails} class="admin-zone-header-error-retry">
            <i class="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      `;
        }

        if (!this.zone) {
            return html`
        <div class="admin-zone-header admin-zone-header-error">
          <div class="admin-zone-header-error-icon">
            <i class="fas fa-map-marker-alt"></i>
          </div>
          <div class="admin-zone-header-error-text">Zone not found.</div>
          <a href="/admin/dashboard" class="admin-zone-header-error-back">
            <i class="fas fa-arrow-left"></i> Back to Dashboard
          </a>
        </div>
      `;
        }

        return html`
      <div class="admin-zone-header">
        <div class="admin-zone-header-content">
          <div class="admin-zone-header-icon">
            <i class="fas fa-map-marker-alt"></i>
          </div>
          <div class="admin-zone-header-details">
            <div class="admin-zone-header-plant">
              <a href="/admin/plants/${this.zone.plant_id}" class="admin-zone-header-plant-link">
                <i class="fas fa-building"></i> Plant ID: ${this.zone.plant_id}
              </a>
            </div>
            <h1 class="admin-zone-header-title">${this.zone.name}</h1>
            <div class="admin-zone-header-meta">
              <span class="admin-zone-header-id">ID: ${this.zone.id}</span>
              ${this.zone.created_at ? html`
                <span class="admin-zone-header-created">
                  Created: ${new Date(this.zone.created_at).toLocaleDateString()}
                </span>
              ` : ''}
            </div>
          </div>
        </div>
        
        <div class="admin-zone-header-actions">
          <button class="admin-zone-header-action admin-zone-header-edit">
            <i class="fas fa-edit"></i> Edit Zone
          </button>
        </div>
      </div>

      <style>
        .admin-zone-header {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 2rem;
        }
        
        .admin-zone-header-loading,
        .admin-zone-header-error {
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          padding: 3rem 1.5rem;
          text-align: center;
        }
        
        .admin-zone-header-loading-spinner,
        .admin-zone-header-error-icon {
          font-size: 2rem;
          color: #f7eb00;
          margin-bottom: 0.5rem;
        }
        
        .admin-zone-header-error-icon {
          color: #e74c3c;
        }
        
        .admin-zone-header-loading-text,
        .admin-zone-header-error-text {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .admin-zone-header-error-retry,
        .admin-zone-header-error-back {
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
        
        .admin-zone-header-error-retry:hover,
        .admin-zone-header-error-back:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        .admin-zone-header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .admin-zone-header-icon {
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
        
        .admin-zone-header-plant {
          margin-bottom: 0.5rem;
        }
        
        .admin-zone-header-plant-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.875rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.2s;
        }
        
        .admin-zone-header-plant-link:hover {
          color: #f7eb00;
        }
        
        .admin-zone-header-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 500;
        }
        
        .admin-zone-header-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .admin-zone-header-action {
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
        
        .admin-zone-header-action:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        @media (max-width: 768px) {
          .admin-zone-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          
          .admin-zone-header-actions {
            align-self: flex-start;
          }
        }
      </style>
    `;
    }
}

customElements.define('admin-zone-header', AdminZoneHeader);