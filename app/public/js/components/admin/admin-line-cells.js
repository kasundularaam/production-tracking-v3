import { LitElement, html } from 'https://esm.run/lit';
import { fetchJson } from '../../utils/api_utils.js';

class AdminLineCells extends LitElement {
    static get properties() {
        return {
            lineId: { type: Number },
            cells: { type: Array },
            loading: { type: Boolean },
            error: { type: String }
        };
    }

    constructor() {
        super();
        this.lineId = null;
        this.cells = [];
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
        console.log('Line Cells - Using line ID from window:', this.lineId);
        this.fetchCells();
    }

    async fetchCells() {
        if (!this.lineId) {
            console.error('No line ID available');
            this.error = 'No line ID provided';
            this.loading = false;
            return;
        }

        console.log(`Fetching cells for line ID: ${this.lineId}`);

        try {
            this.loading = true;
            this.error = '';

            // Log the API URL being called
            const apiUrl = `/api/admin/lines/${this.lineId}/cells`;
            console.log(`Calling API: ${apiUrl}`);

            const cells = await fetchJson(apiUrl);
            console.log('Cells data received:', cells);

            this.cells = Array.isArray(cells) ? cells : [];
        } catch (error) {
            console.error('Error fetching cells:', error);
            this.error = `Failed to load cells: ${error.message || 'Unknown error'}`;
        } finally {
            this.loading = false;
        }
    }

    navigateToNewCell() {
        window.location.href = `/admin/cells/new?line=${this.lineId}`;
    }

    navigateToCell(cellId) {
        window.location.href = `/admin/cells/${cellId}`;
    }

    render() {
        console.log('Rendering cells component with state:', {
            lineId: this.lineId,
            cells: this.cells,
            cellsLength: this.cells.length,
            loading: this.loading,
            error: this.error
        });

        return html`
      <div class="admin-line-cells">
        <div class="admin-line-cells-header">
          <h2 class="admin-line-cells-title">Cells</h2>
          <button @click=${this.navigateToNewCell} class="admin-line-cells-add">
            <i class="fas fa-plus"></i> New Cell
          </button>
        </div>
        
        <div class="admin-line-cells-content">
          ${this.renderContent()}
        </div>
      </div>

      <style>
        .admin-line-cells {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .admin-line-cells-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .admin-line-cells-title {
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0;
          color: #ffffff;
        }
        
        .admin-line-cells-add {
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
        
        .admin-line-cells-add:hover {
          background-color: #e5d900;
        }
        
        .admin-line-cells-content {
          flex: 1;
        }
        
        .admin-line-cells-loading,
        .admin-line-cells-error,
        .admin-line-cells-empty {
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
        
        .admin-line-cells-error {
          color: #e74c3c;
        }
        
        .admin-line-cells-retry {
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
        
        .admin-line-cells-retry:hover {
          background-color: #f7eb00;
          color: #131624;
        }
        
        .admin-line-cells-empty-icon {
          font-size: 2.5rem;
          color: rgba(255, 255, 255, 0.3);
          margin-bottom: 0.5rem;
        }
        
        .admin-line-cells-list {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
        
        .admin-cell-card {
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
        
        .admin-cell-card:hover {
          background-color: rgba(247, 235, 0, 0.05);
          border-color: rgba(247, 235, 0, 0.3);
        }
        
        .admin-cell-icon {
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
        
        .admin-cell-name {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        .admin-cell-id {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .admin-cell-members {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
      </style>
    `;
    }

    renderContent() {
        if (this.loading) {
            return html`
        <div class="admin-line-cells-loading">
          <i class="fas fa-spinner fa-spin"></i> Loading cells...
        </div>
      `;
        }

        if (this.error) {
            return html`
        <div class="admin-line-cells-error">
          <i class="fas fa-exclamation-circle"></i> ${this.error}
          <button @click=${this.fetchCells} class="admin-line-cells-retry">
            <i class="fas fa-sync-alt"></i> Retry
          </button>
        </div>
      `;
        }

        if (!this.cells || this.cells.length === 0) {
            return html`
        <div class="admin-line-cells-empty">
          <i class="fas fa-th admin-line-cells-empty-icon"></i>
          <p>No cells found</p>
          <p>Create a new cell to get started</p>
        </div>
      `;
        }

        return html`
      <div class="admin-line-cells-list">
        ${this.cells.map(cell => this.renderCellCard(cell))}
      </div>
    `;
    }

    renderCellCard(cell) {
        return html`
      <div class="admin-cell-card" @click=${() => this.navigateToCell(cell.id)}>
        <div class="admin-cell-icon">
          <i class="fas fa-th"></i>
        </div>
        <div class="admin-cell-name">${cell.name}</div>
        <div class="admin-cell-id">ID: ${cell.id}</div>
        <div class="admin-cell-members">
          <i class="fas fa-users"></i>
          <span>${cell.members_count || 0} Members</span>
        </div>
      </div>
    `;
    }
}

customElements.define('admin-line-cells', AdminLineCells);