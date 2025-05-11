import { LitElement, html } from 'https://esm.run/lit';
import { fetchJson } from '../../utils/api_utils.js';

class AdminLineTeamLeaders extends LitElement {
    static get properties() {
        return {
            lineId: { type: Number },
            teamLeaders: { type: Array },
            loading: { type: Boolean },
            error: { type: String }
        };
    }

    constructor() {
        super();
        this.lineId = null;
        this.teamLeaders = [];
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
        console.log('Line Team Leaders - Using line ID from window:', this.lineId);
        this.fetchTeamLeaders();
    }

    async fetchTeamLeaders() {
        if (!this.lineId) {
            console.error('No line ID available');
            this.error = 'No line ID provided';
            this.loading = false;
            return;
        }

        console.log(`Fetching team leaders for line ID: ${this.lineId}`);

        try {
            this.loading = true;
            this.error = '';

            // Log the API URL being called
            const apiUrl = `/api/admin/lines/${this.lineId}/team-leaders`;
            console.log(`Calling API: ${apiUrl}`);

            const teamLeaders = await fetchJson(apiUrl);
            console.log('Team leaders data received:', teamLeaders);

            this.teamLeaders = Array.isArray(teamLeaders) ? teamLeaders : [];
        } catch (error) {
            console.error('Error fetching team leaders:', error);
            this.error = `Failed to load team leaders: ${error.message || 'Unknown error'}`;
        } finally {
            this.loading = false;
        }
    }

    navigateToNewTeamLeader() {
        window.location.href = `/admin/team-leaders/new?line=${this.lineId}`;
    }

    navigateToTeamLeader(teamLeaderId) {
        window.location.href = `/admin/team-leaders/${teamLeaderId}`;
    }

    render() {
        console.log('Rendering team leaders component with state:', {
            lineId: this.lineId,
            teamLeaders: this.teamLeaders,
            teamLeadersLength: this.teamLeaders.length,
            loading: this.loading,
            error: this.error
        });

        return html`
      <div class="admin-line-team-leaders">
        <div class="admin-line-team-leaders-header">
          <h2 class="admin-line-team-leaders-title">Team Leaders</h2>
          <button @click=${this.navigateToNewTeamLeader} class="admin-line-team-leaders-add">
            <i class="fas fa-plus"></i> New Team Leader
          </button>
        </div>
        
        <div class="admin-line-team-leaders-content">
          ${this.renderContent()}
        </div>
      </div>

      <style>
        .admin-line-team-leaders {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .admin-line-team-leaders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .admin-line-team-leaders-title {
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0;
          color: #ffffff;
        }
        
        .admin-line-team-leaders-add {
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
        
        .admin-line-team-leaders-add:hover {
          background-color: #e5d900;
        }
        
        .admin-line-team-leaders-content {
          flex: 1;
        }
        
        .admin-line-team-leaders-loading,
        .admin-line-team-leaders-error,
        .admin-line-team-leaders-empty {
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
        
        .admin-line-team-leaders-error {
          color: #e74c3c;
        }
        
        .admin-line-team-leaders-retry {
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
        
        .admin-line-team-leaders-retry:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        .admin-line-team-leaders-empty-icon {
          font-size: 2.5rem;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: 0.5rem;
        }
        
        .admin-line-team-leaders-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .admin-team-leader-card {
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
        
        .admin-team-leader-card:hover {
          background-color: rgba(247, 235, 0, 0.05);
          border-color: rgba(247, 235, 0, 0.3);
        }
        
        .admin-team-leader-avatar {
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
        
        .admin-team-leader-info {
          flex: 1;
        }
        
        .admin-team-leader-name {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        .admin-team-leader-sap-id {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .admin-team-leader-arrow {
          color: rgba(255, 255, 255, 0.3);
          transition: transform 0.2s;
        }
        
        .admin-team-leader-card:hover .admin-team-leader-arrow {
          transform: translateX(4px);
          color: #f7eb00;
        }
      </style>
    `;
    }

    renderContent() {
        if (this.loading) {
            return html`
        <div class="admin-line-team-leaders-loading">
          <i class="fas fa-spinner fa-spin"></i> Loading team leaders...
        </div>
      `;
        }

        if (this.error) {
            return html`
        <div class="admin-line-team-leaders-error">
          <i class="fas fa-exclamation-circle"></i> ${this.error}
          <button @click=${this.fetchTeamLeaders} class="admin-line-team-leaders-retry">
            <i class="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      `;
        }

        if (!this.teamLeaders || this.teamLeaders.length === 0) {
            return html`
        <div class="admin-line-team-leaders-empty">
          <i class="fas fa-user-tie admin-line-team-leaders-empty-icon"></i>
          <p>No team leaders found</p>
          <p>Create a new team leader to get started</p>
        </div>
      `;
        }

        return html`
      <div class="admin-line-team-leaders-list">
        ${this.teamLeaders.map(teamLeader => this.renderTeamLeaderCard(teamLeader))}
      </div>
    `;
    }

    renderTeamLeaderCard(teamLeader) {
        // Safe checks for user data
        const userName = teamLeader.user && teamLeader.user.name ? teamLeader.user.name : 'Unknown';
        const userId = teamLeader.user_id || 'Unknown';

        return html`
      <div class="admin-team-leader-card" @click=${() => this.navigateToTeamLeader(userId)}>
        <div class="admin-team-leader-avatar">
          <i class="fas fa-user-tie"></i>
        </div>
        <div class="admin-team-leader-info">
          <div class="admin-team-leader-name">${userName}</div>
          <div class="admin-team-leader-sap-id">SAP ID: ${userId}</div>
        </div>
        <div class="admin-team-leader-arrow">
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    `;
    }
}

customElements.define('admin-line-team-leaders', AdminLineTeamLeaders);