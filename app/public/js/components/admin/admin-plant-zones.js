import { LitElement, html } from 'https://esm.run/lit';
import { fetchJson } from '../../utils/api_utils.js';

class AdminPlantZones extends LitElement {
  static get properties() {
    return {
      plantId: { type: Number },
      zones: { type: Array },
      loading: { type: Boolean },
      error: { type: String }
    };
  }

  constructor() {
    super();
    this.plantId = null;
    this.zones = [];
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
    console.log('Plant Zones - Using plant ID from window:', this.plantId);
    this.fetchZones();
  }

  async fetchZones() {
    if (!this.plantId) {
      console.error('No plant ID available');
      this.error = 'No plant ID provided';
      this.loading = false;
      return;
    }

    console.log(`Fetching zones for plant ID: ${this.plantId}`);

    try {
      this.loading = true;
      this.error = '';

      // Log the API URL being called
      const apiUrl = `/api/admin/plants/${this.plantId}/zones`;
      console.log(`Calling API: ${apiUrl}`);

      const zones = await fetchJson(apiUrl);
      console.log('Zones data received:', zones);

      this.zones = Array.isArray(zones) ? zones : [];
    } catch (error) {
      console.error('Error fetching zones:', error);
      this.error = `Failed to load zones: ${error.message || 'Unknown error'}`;
    } finally {
      this.loading = false;
    }
  }

  navigateToNewZone() {
    window.location.href = `/admin/zones/new?plant=${this.plantId}`;
  }

  navigateToZone(zoneId) {
    window.location.href = `/admin/zones/${zoneId}`;
  }

  render() {
    console.log('Rendering zones component with state:', {
      plantId: this.plantId,
      zones: this.zones,
      zonesLength: this.zones.length,
      loading: this.loading,
      error: this.error
    });

    return html`
      <div class="admin-plant-zones">
        <div class="admin-plant-zones-header">
          <h2 class="admin-plant-zones-title">Zones</h2>
          <button @click=${this.navigateToNewZone} class="admin-plant-zones-add">
            <i class="fas fa-plus"></i> New Zone
          </button>
        </div>
        
        <div class="admin-plant-zones-content">
          ${this.renderContent()}
        </div>
      </div>

      <style>
        .admin-plant-zones {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .admin-plant-zones-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .admin-plant-zones-title {
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0;
          color: #ffffff;
        }
        
        .admin-plant-zones-add {
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
        
        .admin-plant-zones-add:hover {
          background-color: #e5d900;
        }
        
        .admin-plant-zones-content {
          flex: 1;
        }
        
        .admin-plant-zones-loading,
        .admin-plant-zones-error,
        .admin-plant-zones-empty {
          padding: 2rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          height: 100%;
          justify-content: center;
        }
        
        .admin-plant-zones-error {
          color: #e74c3c;
        }
        
        .admin-plant-zones-retry {
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
        
        .admin-plant-zones-retry:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        .admin-plant-zones-empty-icon {
          font-size: 2.5rem;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: 0.5rem;
        }
        
        .admin-plant-zones-list {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
        
        .admin-zone-card {
          background-color: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .admin-zone-card:hover {
          background-color: rgba(247, 235, 0, 0.05);
          border-color: rgba(247, 235, 0, 0.3);
        }
        
        .admin-zone-icon {
          font-size: 1.5rem;
          color: #f7eb00;
          background-color: rgba(247, 235, 0, 0.1);
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin-bottom: 1rem;
        }
        
        .admin-zone-name {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        .admin-zone-id {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }
      </style>
    `;
  }

  renderContent() {
    if (this.loading) {
      return html`
        <div class="admin-plant-zones-loading">
          <i class="fas fa-spinner fa-spin"></i> Loading zones...
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="admin-plant-zones-error">
          <i class="fas fa-exclamation-circle"></i> ${this.error}
          <button @click=${this.fetchZones} class="admin-plant-zones-retry">
            <i class="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      `;
    }

    if (!this.zones || this.zones.length === 0) {
      return html`
        <div class="admin-plant-zones-empty">
          <i class="fas fa-map-marker-alt admin-plant-zones-empty-icon"></i>
          <p>No zones found</p>
          <p>Create a new zone to get started</p>
        </div>
      `;
    }

    return html`
      <div class="admin-plant-zones-list">
        ${this.zones.map(zone => this.renderZoneCard(zone))}
      </div>
    `;
  }

  renderZoneCard(zone) {
    return html`
      <div class="admin-zone-card" @click=${() => this.navigateToZone(zone.id)}>
        <div class="admin-zone-icon">
          <i class="fas fa-map-marker-alt"></i>
        </div>
        <div class="admin-zone-name">${zone.name}</div>
        <div class="admin-zone-id">ID: ${zone.id}</div>
      </div>
    `;
  }
}

customElements.define('admin-plant-zones', AdminPlantZones);