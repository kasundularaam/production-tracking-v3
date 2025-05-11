import { LitElement, html } from 'https://esm.run/lit';
import { fetchJson } from '../../utils/api_utils.js';

class AdminPlantPlanners extends LitElement {
    static get properties() {
        return {
            plantId: { type: Number },
            planners: { type: Array },
            loading: { type: Boolean },
            error: { type: String }
        };
    }

    constructor() {
        super();
        this.plantId = null;
        this.planners = [];
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
        console.log('Plant Planners - Using plant ID from window:', this.plantId);
        this.fetchPlanners();
    }

    async fetchPlanners() {
        if (!this.plantId) {
            console.error('No plant ID available');
            this.error = 'No plant ID provided';
            this.loading = false;
            return;
        }

        console.log(`Fetching planners for plant ID: ${this.plantId}`);

        try {
            this.loading = true;
            this.error = '';

            // Log the API URL being called
            const apiUrl = `/api/admin/plants/${this.plantId}/planners`;
            console.log(`Calling API: ${apiUrl}`);

            const planners = await fetchJson(apiUrl);
            console.log('Planners data received:', planners);

            this.planners = Array.isArray(planners) ? planners : [];
        } catch (error) {
            console.error('Error fetching planners:', error);
            this.error = `Failed to load planners: ${error.message || 'Unknown error'}`;
        } finally {
            this.loading = false;
        }
    }

    navigateToNewPlanner() {
        window.location.href = `/admin/planners/new?plant=${this.plantId}`;
    }

    navigateToPlanner(plannerId) {
        window.location.href = `/admin/planners/${plannerId}`;
    }

    render() {
        console.log('Rendering planners component with state:', {
            plantId: this.plantId,
            planners: this.planners,
            plannersLength: this.planners.length,
            loading: this.loading,
            error: this.error
        });

        return html`
      <div class="admin-plant-planners">
        <div class="admin-plant-planners-header">
          <h2 class="admin-plant-planners-title">Planners</h2>
          <button @click=${this.navigateToNewPlanner} class="admin-plant-planners-add">
            <i class="fas fa-plus"></i> New Planner
          </button>
        </div>
        
        <div class="admin-plant-planners-content">
          ${this.renderContent()}
        </div>
      </div>

      <style>
        .admin-plant-planners {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .admin-plant-planners-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .admin-plant-planners-title {
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0;
          color: #ffffff;
        }
        
        .admin-plant-planners-add {
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
        
        .admin-plant-planners-add:hover {
          background-color: #e5d900;
        }
        
        .admin-plant-planners-content {
          flex: 1;
        }
        
        .admin-plant-planners-loading,
        .admin-plant-planners-error,
        .admin-plant-planners-empty {
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
        
        .admin-plant-planners-error {
          color: #e74c3c;
        }
        
        .admin-plant-planners-retry {
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
        
        .admin-plant-planners-retry:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        .admin-plant-planners-empty-icon {
          font-size: 2.5rem;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: 0.5rem;
        }
        
        .admin-plant-planners-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .admin-planner-card {
          background-color: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .admin-planner-card:hover {
          background-color: rgba(247, 235, 0, 0.05);
          border-color: rgba(247, 235, 0, 0.3);
        }
        
        .admin-planner-avatar {
          font-size: 1.25rem;
          color: #f7eb00;
          background-color: rgba(247, 235, 0, 0.1);
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        
        .admin-planner-info {
          flex: 1;
        }
        
        .admin-planner-name {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        .admin-planner-sap-id {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .admin-planner-arrow {
          color: rgba(255, 255, 255, 0.3);
          transition: transform 0.2s;
        }
        
        .admin-planner-card:hover .admin-planner-arrow {
          transform: translateX(4px);
          color: #f7eb00;
        }
      </style>
    `;
    }

    renderContent() {
        if (this.loading) {
            return html`
        <div class="admin-plant-planners-loading">
          <i class="fas fa-spinner fa-spin"></i> Loading planners...
        </div>
      `;
        }

        if (this.error) {
            return html`
        <div class="admin-plant-planners-error">
          <i class="fas fa-exclamation-circle"></i> ${this.error}
          <button @click=${this.fetchPlanners} class="admin-plant-planners-retry">
            <i class="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      `;
        }

        if (!this.planners || this.planners.length === 0) {
            return html`
        <div class="admin-plant-planners-empty">
          <i class="fas fa-calendar-alt admin-plant-planners-empty-icon"></i>
          <p>No planners found</p>
          <p>Create a new planner to get started</p>
        </div>
      `;
        }

        return html`
      <div class="admin-plant-planners-list">
        ${this.planners.map(planner => this.renderPlannerCard(planner))}
      </div>
    `;
    }

    renderPlannerCard(planner) {
        // Add safe checks for the user property
        const userName = planner.user && planner.user.name ? planner.user.name : 'Unknown';
        const userId = planner.user_id || 'Unknown';

        return html`
      <div class="admin-planner-card" @click=${() => this.navigateToPlanner(userId)}>
        <div class="admin-planner-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="admin-planner-info">
          <div class="admin-planner-name">${userName}</div>
          <div class="admin-planner-sap-id">SAP ID: ${userId}</div>
        </div>
        <div class="admin-planner-arrow">
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    `;
    }
}

customElements.define('admin-plant-planners', AdminPlantPlanners);