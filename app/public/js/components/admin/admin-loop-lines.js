import { LitElement, html } from 'https://esm.run/lit';
import { fetchJson } from '../../utils/api_utils.js';

class AdminLoopLines extends LitElement {
    static get properties() {
        return {
            loopId: { type: Number },
            lines: { type: Array },
            loading: { type: Boolean },
            error: { type: String }
        };
    }

    constructor() {
        super();
        this.loopId = null;
        this.lines = [];
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
        console.log('Loop Lines - Using loop ID from window:', this.loopId);
        this.fetchLines();
    }

    async fetchLines() {
        if (!this.loopId) {
            console.error('No loop ID available');
            this.error = 'No loop ID provided';
            this.loading = false;
            return;
        }

        console.log(`Fetching lines for loop ID: ${this.loopId}`);

        try {
            this.loading = true;
            this.error = '';

            // Log the API URL being called
            const apiUrl = `/api/admin/loops/${this.loopId}/lines`;
            console.log(`Calling API: ${apiUrl}`);

            const lines = await fetchJson(apiUrl);
            console.log('Lines data received:', lines);

            this.lines = Array.isArray(lines) ? lines : [];
        } catch (error) {
            console.error('Error fetching lines:', error);
            this.error = `Failed to load lines: ${error.message || 'Unknown error'}`;
        } finally {
            this.loading = false;
        }
    }

    navigateToNewLine() {
        window.location.href = `/admin/lines/new?loop=${this.loopId}`;
    }

    navigateToLine(lineId) {
        window.location.href = `/admin/lines/${lineId}`;
    }

    render() {
        console.log('Rendering lines component with state:', {
            loopId: this.loopId,
            lines: this.lines,
            linesLength: this.lines.length,
            loading: this.loading,
            error: this.error
        });

        return html`
      <div class="admin-loop-lines">
        <div class="admin-loop-lines-header">
          <h2 class="admin-loop-lines-title">Lines</h2>
          <button @click=${this.navigateToNewLine} class="admin-loop-lines-add">
            <i class="fas fa-plus"></i> New Line
          </button>
        </div>
        
        <div class="admin-loop-lines-content">
          ${this.renderContent()}
        </div>
      </div>

      <style>
        .admin-loop-lines {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .admin-loop-lines-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .admin-loop-lines-title {
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0;
          color: #ffffff;
        }
        
        .admin-loop-lines-add {
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
        
        .admin-loop-lines-add:hover {
          background-color: #e5d900;
        }
        
        .admin-loop-lines-content {
          flex: 1;
        }
        
        .admin-loop-lines-loading,
        .admin-loop-lines-error,
        .admin-loop-lines-empty {
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
        
        .admin-loop-lines-error {
          color: #e74c3c;
        }
        
        .admin-loop-lines-retry {
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
        
        .admin-loop-lines-retry:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        .admin-loop-lines-empty-icon {
          font-size: 2.5rem;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: 0.5rem;
        }
        
        .admin-loop-lines-list {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        }
        
        .admin-line-card {
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
        
        .admin-line-card:hover {
          background-color: rgba(247, 235, 0, 0.05);
          border-color: rgba(247, 235, 0, 0.3);
        }
        
        .admin-line-icon {
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
        
        .admin-line-name {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        .admin-line-id {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .admin-line-details {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 0.5rem;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .admin-line-detail {
          background-color: rgba(255, 255, 255, 0.05);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }
      </style>
    `;
    }

    renderContent() {
        if (this.loading) {
            return html`
        <div class="admin-loop-lines-loading">
          <i class="fas fa-spinner fa-spin"></i> Loading lines...
        </div>
      `;
        }

        if (this.error) {
            return html`
        <div class="admin-loop-lines-error">
          <i class="fas fa-exclamation-circle"></i> ${this.error}
          <button @click=${this.fetchLines} class="admin-loop-lines-retry">
            <i class="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      `;
        }

        if (!this.lines || this.lines.length === 0) {
            return html`
        <div class="admin-loop-lines-empty">
          <i class="fas fa-project-diagram admin-loop-lines-empty-icon"></i>
          <p>No lines found</p>
          <p>Create a new line to get started</p>
        </div>
      `;
        }

        return html`
      <div class="admin-loop-lines-list">
        ${this.lines.map(line => this.renderLineCard(line))}
      </div>
    `;
    }

    renderLineCard(line) {
        return html`
      <div class="admin-line-card" @click=${() => this.navigateToLine(line.id)}>
        <div class="admin-line-icon">
          <i class="fas fa-project-diagram"></i>
        </div>
        <div class="admin-line-name">${line.name}</div>
        <div class="admin-line-id">ID: ${line.id}</div>
        <div class="admin-line-details">
          <span class="admin-line-detail">
            <i class="fas fa-cubes"></i> ${line.cells_count || 0} Cells
          </span>
          <span class="admin-line-detail">
            <i class="fas fa-user-tie"></i> ${line.team_leaders_count || 0} Leaders
          </span>
        </div>
      </div>
    `;
    }
}

customElements.define('admin-loop-lines', AdminLoopLines);