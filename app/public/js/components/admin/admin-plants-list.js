import { LitElement, html } from 'https://esm.run/lit';
import { fetchJson } from '../../utils/api_utils.js';

class AdminPlantsList extends LitElement {
  static get properties() {
    return {
      plants: { type: Array },
      loading: { type: Boolean },
      error: { type: String }
    };
  }

  constructor() {
    super();
    this.plants = [];
    this.loading = true;
    this.error = '';
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchPlants();
  }

  async fetchPlants() {
    try {
      this.loading = true;
      this.error = '';
      const plants = await fetchJson('/api/admin/plants');
      this.plants = plants;
    } catch (error) {
      console.error('Error fetching plants:', error);
      this.error = 'Failed to load plants. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  navigateToNewPlant() {
    window.location.href = '/admin/new-plant';
  }

  render() {
    return html`
      <div class="admin-plants">
        <div class="admin-plants-header">
          <h2 class="admin-plants-title">Plants</h2>
          <button @click=${this.navigateToNewPlant} class="admin-plants-add">
            <i class="fas fa-plus"></i> New Plant
          </button>
        </div>
        
        ${this.loading ? html`
          <div class="admin-plants-loading">
            <i class="fas fa-spinner fa-spin"></i> Loading plants...
          </div>
        ` : ''}
        
        ${this.error ? html`
          <div class="admin-plants-error">
            <i class="fas fa-exclamation-circle"></i> ${this.error}
            <button @click=${this.fetchPlants} class="admin-plants-retry">
              <i class="fas fa-sync-alt"></i> Retry
            </button>
          </div>
        ` : ''}
        
        ${!this.loading && !this.error && this.plants.length === 0 ? html`
          <div class="admin-plants-empty">
            <i class="fas fa-building"></i>
            <p>No plants found</p>
            <p>Create a new plant to get started</p>
          </div>
        ` : ''}
        
        ${!this.loading && !this.error && this.plants.length > 0 ? html`
          <div class="admin-plants-list">
            ${this.plants.map(plant => this.renderPlantCard(plant))}
          </div>
        ` : ''}
      </div>

      <style>
        .admin-plants {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .admin-plants-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .admin-plants-title {
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0;
          color: #ffffff;
        }
        
        .admin-plants-add {
          background-color: #f7eb00;
          color: #131624;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .admin-plants-add:hover {
          background-color: #e5d900;
        }
        
        .admin-plants-loading,
        .admin-plants-error,
        .admin-plants-empty {
          padding: 2rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        
        .admin-plants-error {
          color: #e74c3c;
        }
        
        .admin-plants-retry {
          background-color: transparent;
          color: #f7eb00;
          border: 1px solid #f7eb00;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .admin-plants-retry:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        .admin-plants-empty i {
          font-size: 2.5rem;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: 0.5rem;
        }
        
        .admin-plants-empty p {
          margin: 0.25rem 0;
        }
        
        .admin-plants-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .admin-plant-card {
          background-color: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .admin-plant-card:hover {
          background-color: rgba(247, 235, 0, 0.05);
          border-color: rgba(247, 235, 0, 0.3);
        }
        
        .admin-plant-name {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .admin-plant-icon {
          color: #f7eb00;
        }
        
        .admin-plant-arrow {
          color: rgba(255, 255, 255, 0.3);
          transition: transform 0.2s;
        }
        
        .admin-plant-card:hover .admin-plant-arrow {
          transform: translateX(4px);
          color: #f7eb00;
        }
      </style>
    `;
  }

  renderPlantCard(plant) {
    return html`
      <div class="admin-plant-card" @click=${() => this.navigateToPlant(plant.id)}>
        <div class="admin-plant-name">
          <i class="fas fa-building admin-plant-icon"></i>
          <span>${plant.name}</span>
        </div>
        <div class="admin-plant-arrow">
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    `;
  }

  navigateToPlant(plantId) {
    window.location.href = `/admin/plants/${plantId}`;
  }
}

customElements.define('admin-plants-list', AdminPlantsList);