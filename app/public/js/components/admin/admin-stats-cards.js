import { LitElement, html } from 'https://esm.run/lit';
import { fetchJson } from '../../utils/api_utils.js';

class AdminStatsCards extends LitElement {
    static get properties() {
        return {
            stats: { type: Object },
            loading: { type: Boolean }
        };
    }

    constructor() {
        super();
        this.stats = {
            plants: 0,
            zones: 0,
            loops: 0,
            lines: 0,
            cells: 0,
            planners: 0,
            teamLeaders: 0,
            members: 0
        };
        this.loading = true;
    }

    // Disable Shadow DOM to access global styles
    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback();
        this.fetchStats();
    }

    async fetchStats() {
        try {
            this.loading = true;
            const stats = await fetchJson('/api/admin/dashboard/stats');
            this.stats = stats;
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            this.loading = false;
        }
    }

    render() {
        return html`
      <div class="admin-stats">
        <div class="admin-stats-header">
          <h2 class="admin-stats-title">System Overview</h2>
          <button @click=${this.fetchStats} class="admin-stats-refresh" ?disabled=${this.loading}>
            <i class="fas fa-sync-alt ${this.loading ? 'fa-spin' : ''}"></i>
          </button>
        </div>
        
        <div class="admin-stats-grid">
          ${this.renderStatCard('Plants', this.stats.plants, 'fa-building')}
          ${this.renderStatCard('Zones', this.stats.zones, 'fa-map-marker-alt')}
          ${this.renderStatCard('Loops', this.stats.loops, 'fa-route')}
          ${this.renderStatCard('Lines', this.stats.lines, 'fa-conveyor-belt')}
          ${this.renderStatCard('Cells', this.stats.cells, 'fa-th')}
          ${this.renderStatCard('Planners', this.stats.planners, 'fa-calendar-alt')}
          ${this.renderStatCard('Team Leaders', this.stats.teamLeaders, 'fa-user-tie')}
          ${this.renderStatCard('Members', this.stats.members, 'fa-users')}
        </div>
      </div>

      <style>
        .admin-stats {
          margin-bottom: 2rem;
        }
        
        .admin-stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .admin-stats-title {
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0;
          color: #ffffff;
        }
        
        .admin-stats-refresh {
          background-color: transparent;
          color: #f7eb00;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        
        .admin-stats-refresh:hover {
          background-color: rgba(247, 235, 0, 0.1);
        }
        
        .admin-stats-refresh:disabled {
          color: rgba(247, 235, 0, 0.5);
          cursor: not-allowed;
        }
        
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        
        @media (min-width: 768px) {
          .admin-stats-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        .admin-stat-card {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .admin-stat-icon {
          font-size: 1.5rem;
          color: #f7eb00;
          margin-bottom: 0.5rem;
        }
        
        .admin-stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        
        .admin-stat-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }
      </style>
    `;
    }

    renderStatCard(label, value, iconClass) {
        return html`
      <div class="admin-stat-card">
        <div class="admin-stat-icon">
          <i class="fas ${iconClass}"></i>
        </div>
        <div class="admin-stat-value">${value}</div>
        <div class="admin-stat-label">${label}</div>
      </div>
    `;
    }
}

customElements.define('admin-stats-cards', AdminStatsCards);