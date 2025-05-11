import { LitElement, html } from 'https://esm.run/lit';
import { fetchJson } from '../../utils/api_utils.js';

class AdminCellMembers extends LitElement {
    static get properties() {
        return {
            cellId: { type: Number },
            members: { type: Array },
            loading: { type: Boolean },
            error: { type: String }
        };
    }

    constructor() {
        super();
        this.cellId = null;
        this.members = [];
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
        console.log('Cell Members - Using cell ID from window:', this.cellId);
        this.fetchMembers();
    }

    async fetchMembers() {
        if (!this.cellId) {
            console.error('No cell ID available');
            this.error = 'No cell ID provided';
            this.loading = false;
            return;
        }

        console.log(`Fetching members for cell ID: ${this.cellId}`);

        try {
            this.loading = true;
            this.error = '';

            // Log the API URL being called
            const apiUrl = `/api/admin/cells/${this.cellId}/members`;
            console.log(`Calling API: ${apiUrl}`);

            const members = await fetchJson(apiUrl);
            console.log('Members data received:', members);

            this.members = Array.isArray(members) ? members : [];
        } catch (error) {
            console.error('Error fetching members:', error);
            this.error = `Failed to load members: ${error.message || 'Unknown error'}`;
        } finally {
            this.loading = false;
        }
    }

    navigateToNewMember() {
        window.location.href = `/admin/members/new?cell=${this.cellId}`;
    }

    navigateToMember(memberId) {
        window.location.href = `/admin/members/${memberId}`;
    }

    render() {
        console.log('Rendering members component with state:', {
            cellId: this.cellId,
            members: this.members,
            membersLength: this.members.length,
            loading: this.loading,
            error: this.error
        });

        return html`
      <div class="admin-cell-members">
        <div class="admin-cell-members-header">
          <h2 class="admin-cell-members-title">Members</h2>
          <button @click=${this.navigateToNewMember} class="admin-cell-members-add">
            <i class="fas fa-plus"></i> New Member
          </button>
        </div>
        
        <div class="admin-cell-members-content">
          ${this.renderContent()}
        </div>
      </div>

      <style>
        .admin-cell-members {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .admin-cell-members-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .admin-cell-members-title {
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0;
          color: #ffffff;
        }
        
        .admin-cell-members-add {
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
        
        .admin-cell-members-add:hover {
          background-color: #e5d900;
        }
        
        .admin-cell-members-content {
          flex: 1;
        }
        
        .admin-cell-members-loading,
        .admin-cell-members-error,
        .admin-cell-members-empty {
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
        
        .admin-cell-members-error {
          color: #e74c3c;
        }
        
        .admin-cell-members-retry {
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
        
        .admin-cell-members-retry:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        .admin-cell-members-empty-icon {
          font-size: 2.5rem;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: 0.5rem;
        }
        
        .admin-cell-members-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .admin-member-card {
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
        
        .admin-member-card:hover {
          background-color: rgba(247, 235, 0, 0.05);
          border-color: rgba(247, 235, 0, 0.3);
        }
        
        .admin-member-avatar {
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
        
        .admin-member-info {
          flex: 1;
        }
        
        .admin-member-name {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        .admin-member-sap-id {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .admin-member-arrow {
          color: rgba(255, 255, 255, 0.3);
          transition: transform 0.2s;
        }
        
        .admin-member-card:hover .admin-member-arrow {
          transform: translateX(4px);
          color: #f7eb00;
        }
      </style>
    `;
    }

    renderContent() {
        if (this.loading) {
            return html`
        <div class="admin-cell-members-loading">
          <i class="fas fa-spinner fa-spin"></i> Loading members...
        </div>
      `;
        }

        if (this.error) {
            return html`
        <div class="admin-cell-members-error">
          <i class="fas fa-exclamation-circle"></i> ${this.error}
          <button @click=${this.fetchMembers} class="admin-cell-members-retry">
            <i class="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      `;
        }

        if (!this.members || this.members.length === 0) {
            return html`
        <div class="admin-cell-members-empty">
          <i class="fas fa-users admin-cell-members-empty-icon"></i>
          <p>No members found</p>
          <p>Create a new member to get started</p>
        </div>
      `;
        }

        return html`
      <div class="admin-cell-members-list">
        ${this.members.map(member => this.renderMemberCard(member))}
      </div>
    `;
    }

    renderMemberCard(member) {
        // Safe checks for user data
        const userName = member.user && member.user.name ? member.user.name : 'Unknown';
        const userId = member.user_id || 'Unknown';

        return html`
      <div class="admin-member-card" @click=${() => this.navigateToMember(userId)}>
        <div class="admin-member-avatar">
          <i class="fas fa-user"></i>
        </div>
        <div class="admin-member-info">
          <div class="admin-member-name">${userName}</div>
          <div class="admin-member-sap-id">SAP ID: ${userId}</div>
        </div>
        <div class="admin-member-arrow">
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    `;
    }
}

customElements.define('admin-cell-members', AdminCellMembers);