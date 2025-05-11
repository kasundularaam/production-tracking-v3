import { LitElement, html } from 'https://esm.run/lit';
import { fetchJson } from '../../utils/api_utils.js';

class AdminPlantHeader extends LitElement {
    static get properties() {
        return {
            plantId: { type: Number },
            plant: { type: Object },
            loading: { type: Boolean },
            error: { type: String }
        };
    }

    constructor() {
        super();
        this.plantId = null;
        this.plant = null;
        this.loading = true;
        this.error = '';
    }

    // Disable Shadow DOM to access global styles
    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        // Use the global plantId from the window object
        this.plantId = window.plantId;
        console.log('Plant Header - Using plant ID from window:', this.plantId);
        this.fetchPlantDetails();
    }

    async fetchPlantDetails() {
        if (!this.plantId) {
            console.error('No plant ID available');
            this.error = 'No plant ID provided';
            this.loading = false;
            return;
        }

        console.log(`Fetching plant details for ID: ${this.plantId}`);

        try {
            this.loading = true;
            this.error = '';

            // Log the API URL being called
            const apiUrl = `/api/admin/plants/${this.plantId}`;
            console.log(`Calling API: ${apiUrl}`);

            const plant = await fetchJson(apiUrl);
            console.log('Plant data received:', plant);

            this.plant = plant;
        } catch (error) {
            console.error('Error fetching plant details:', error);
            this.error = `Failed to load plant details: ${error.message || 'Unknown error'}`;
        } finally {
            this.loading = false;
        }
    }

    render() {
        console.log('Rendering plant header with state:', {
            plantId: this.plantId,
            plant: this.plant,
            loading: this.loading,
            error: this.error
        });

        if (this.loading) {
            return html`
        <div class="admin-plant-header admin-plant-header-loading">
          <div class="admin-plant-header-loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <div class="admin-plant-header-loading-text">Loading plant details...</div>
        </div>
      `;
        }

        if (this.error) {
            return html`
        <div class="admin-plant-header admin-plant-header-error">
          <div class="admin-plant-header-error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="admin-plant-header-error-text">${this.error}</div>
          <button @click=${this.fetchPlantDetails} class="admin-plant-header-error-retry">
            <i class="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      `;
        }

        if (!this.plant) {
            return html`
        <div class="admin-plant-header admin-plant-header-error">
          <div class="admin-plant-header-error-icon">
            <i class="fas fa-building"></i>
          </div>
          <div class="admin-plant-header-error-text">Plant not found.</div>
          <a href="/admin/dashboard" class="admin-plant-header-error-back">
            <i class="fas fa-arrow-left"></i> Back to Dashboard
          </a>
        </div>
      `;
        }

        return html`
      <div class="admin-plant-header">
        <div class="admin-plant-header-content">
          <div class="admin-plant-header-icon">
            <i class="fas fa-building"></i>
          </div>
          <div class="admin-plant-header-details">
            <h1 class="admin-plant-header-title">${this.plant.name}</h1>
            <div class="admin-plant-header-meta">
              <span class="admin-plant-header-id">ID: ${this.plant.id}</span>
              ${this.plant.created_at ? html`
                <span class="admin-plant-header-created">
                  Created: ${new Date(this.plant.created_at).toLocaleDateString()}
                </span>
              ` : ''}
            </div>
          </div>
        </div>
        
        <div class="admin-plant-header-actions">
          <button class="admin-plant-header-action admin-plant-header-edit">
            <i class="fas fa-edit"></i> Edit Plant
          </button>
        </div>
      </div>

      <style>
        .admin-plant-header {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .admin-plant-header-loading,
        .admin-plant-header-error {
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          padding: 3rem 1.5rem;
          text-align: center;
        }
        
        .admin-plant-header-loading-spinner,
        .admin-plant-header-error-icon {
          font-size: 2rem;
          color: #f7eb00;
          margin-bottom: 0.5rem;
        }
        
        .admin-plant-header-error-icon {
          color: #e74c3c;
        }
        
        .admin-plant-header-loading-text,
        .admin-plant-header-error-text {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .admin-plant-header-error-retry,
        .admin-plant-header-error-back {
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
        
        .admin-plant-header-error-retry:hover,
        .admin-plant-header-error-back:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        .admin-plant-header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .admin-plant-header-icon {
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
        
        .admin-plant-header-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 500;
        }
        
        .admin-plant-header-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .admin-plant-header-action {
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
        
        .admin-plant-header-action:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        @media (max-width: 768px) {
          .admin-plant-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          
          .admin-plant-header-actions {
            align-self: flex-start;
          }
        }
      </style>
    `;
    }
}

customElements.define('admin-plant-header', AdminPlantHeader);