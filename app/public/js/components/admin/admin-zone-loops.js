import { LitElement, html } from 'https://esm.run/lit';
import { fetchJson } from '../../utils/api_utils.js';

class AdminZoneLoops extends LitElement {
    static get properties() {
        return {
            zoneId: { type: Number },
            loops: { type: Array },
            loading: { type: Boolean },
            error: { type: String }
        };
    }

    constructor() {
        super();
        this.zoneId = null;
        this.loops = [];
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
        console.log('Zone Loops - Using zone ID from window:', this.zoneId);
        this.fetchLoops();
    }

    async fetchLoops() {
        if (!this.zoneId) {
            console.error('No zone ID available');
            this.error = 'No zone ID provided';
            this.loading = false;
            return;
        }

        console.log(`Fetching loops for zone ID: ${this.zoneId}`);

        try {
            this.loading = true;
            this.error = '';

            // Log the API URL being called
            const apiUrl = `/api/admin/zones/${this.zoneId}/loops`;
            console.log(`Calling API: ${apiUrl}`);

            const loops = await fetchJson(apiUrl);
            console.log('Loops data received:', loops);

            this.loops = Array.isArray(loops) ? loops : [];
        } catch (error) {
            console.error('Error fetching loops:', error);
            this.error = `Failed to load loops: ${error.message || 'Unknown error'}`;
        } finally {
            this.loading = false;
        }
    }

    navigateToNewLoop() {
        window.location.href = `/admin/loops/new?zone=${this.zoneId}`;
    }

    navigateToLoop(loopId) {
        window.location.href = `/admin/loops/${loopId}`;
    }

    render() {
        console.log('Rendering loops component with state:', {
            zoneId: this.zoneId,
            loops: this.loops,
            loopsLength: this.loops.length,
            loading: this.loading,
            error: this.error
        });

        return html`
      <div class="admin-zone-loops">
        <div class="admin-zone-loops-header">
          <h2 class="admin-zone-loops-title">Loops</h2>
          <button @click=${this.navigateToNewLoop} class="admin-zone-loops-add">
            <i class="fas fa-plus"></i> New Loop
          </button>
        </div>
        
        <div class="admin-zone-loops-content">
          ${this.renderContent()}
        </div>
      </div>

      <style>
        .admin-zone-loops {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .admin-zone-loops-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .admin-zone-loops-title {
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0;
          color: #ffffff;
        }
        
        .admin-zone-loops-add {
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
        
        .admin-zone-loops-add:hover {
          background-color: #e5d900;
        }
        
        .admin-zone-loops-content {
          flex: 1;
        }
        
        .admin-zone-loops-loading,
        .admin-zone-loops-error,
        .admin-zone-loops-empty {
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
        
        .admin-zone-loops-error {
          color: #e74c3c;
        }
        
        .admin-zone-loops-retry {
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
        
        .admin-zone-loops-retry:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        .admin-zone-loops-empty-icon {
          font-size: 2.5rem;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: 0.5rem;
        }
        
        .admin-zone-loops-list {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        }
        
        .admin-loop-card {
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
        
        .admin-loop-card:hover {
          background-color: rgba(247, 235, 0, 0.05);
          border-color: rgba(247, 235, 0, 0.3);
        }
        
        .admin-loop-icon {
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
        
        .admin-loop-name {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        .admin-loop-id {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }
      </style>
    `;
    }

    renderContent() {
        if (this.loading) {
            return html`
        <div class="admin-zone-loops-loading">
          <i class="fas fa-spinner fa-spin"></i> Loading loops...
        </div>
      `;
        }

        if (this.error) {
            return html`
        <div class="admin-zone-loops-error">
          <i class="fas fa-exclamation-circle"></i> ${this.error}
          <button @click=${this.fetchLoops} class="admin-zone-loops-retry">
            <i class="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      `;
        }

        if (!this.loops || this.loops.length === 0) {
            return html`
        <div class="admin-zone-loops-empty">
          <i class="fas fa-route admin-zone-loops-empty-icon"></i>
          <p>No loops found</p>
          <p>Create a new loop to get started</p>
        </div>
      `;
        }

        return html`
      <div class="admin-zone-loops-list">
        ${this.loops.map(loop => this.renderLoopCard(loop))}
      </div>
    `;
    }

    renderLoopCard(loop) {
        return html`
      <div class="admin-loop-card" @click=${() => this.navigateToLoop(loop.id)}>
        <div class="admin-loop-icon">
          <i class="fas fa-route"></i>
        </div>
        <div class="admin-loop-name">${loop.name}</div>
        <div class="admin-loop-id">ID: ${loop.id}</div>
      </div>
    `;
    }
}

customElements.define('admin-zone-loops', AdminZoneLoops);