// app/public/js/components/admin/admin-loss-reason-list.js

import { LitElement, html } from "https://esm.run/lit";
import { fetchJson, deleteJson } from "../../utils/api_utils.js";
import "./admin-loss-reason-card.js";

class AdminLossReasonList extends LitElement {
  static get properties() {
    return {
      lossReasons: { type: Array },
      isLoading: { type: Boolean },
      error: { type: String },
      page: { type: Number },
      hasMore: { type: Boolean },
      limit: { type: Number },
      deleteConfirmId: { type: Number },
    };
  }

  constructor() {
    super();
    this.lossReasons = [];
    this.isLoading = false;
    this.error = "";
    this.page = 1;
    this.limit = 20;
    this.hasMore = false;
    this.deleteConfirmId = null;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchLossReasons();

    // Listen for loss reason deleted event
    this.addEventListener("loss-reason-delete", this.handleDeleteClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("loss-reason-delete", this.handleDeleteClick);
  }

  async fetchLossReasons() {
    try {
      this.isLoading = true;
      this.error = "";

      const response = await fetchJson(
        `/api/admin/loss-reasons?page=${this.page}&limit=${this.limit}`
      );

      if (this.page === 1) {
        this.lossReasons = response.items;
      } else {
        this.lossReasons = [...this.lossReasons, ...response.items];
      }

      this.hasMore = response.total > this.lossReasons.length;
    } catch (error) {
      console.error("Error fetching loss reasons:", error);
      this.error =
        error.message || "Failed to load loss reasons. Please try again.";
    } finally {
      this.isLoading = false;
    }
  }

  loadMore() {
    this.page += 1;
    this.fetchLossReasons();
  }

  handleDeleteClick(event) {
    this.deleteConfirmId = event.detail.id;
  }

  async confirmDelete() {
    try {
      await deleteJson(`/api/admin/loss-reasons/${this.deleteConfirmId}`);

      // Remove the deleted item from the list
      this.lossReasons = this.lossReasons.filter(
        (reason) => reason.id !== this.deleteConfirmId
      );

      // Reset deleteConfirmId
      this.deleteConfirmId = null;
    } catch (error) {
      console.error("Error deleting loss reason:", error);
      this.error =
        error.message || "Failed to delete loss reason. Please try again.";
    }
  }

  cancelDelete() {
    this.deleteConfirmId = null;
  }

  render() {
    return html`
      <div class="admin-loss-reason-list-container">
        ${this.error
          ? html`
              <div class="admin-loss-reason-list-error">
                <i class="fas fa-exclamation-circle"></i> ${this.error}
                <button
                  @click=${() => this.fetchLossReasons()}
                  class="admin-loss-reason-list-retry"
                >
                  <i class="fas fa-redo"></i> Retry
                </button>
              </div>
            `
          : ""}
        ${this.deleteConfirmId
          ? html`
              <div class="admin-loss-reason-delete-confirm">
                <div class="admin-loss-reason-delete-confirm-content">
                  <div class="admin-loss-reason-delete-confirm-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                  </div>
                  <div class="admin-loss-reason-delete-confirm-message">
                    <h3>Confirm Deletion</h3>
                    <p>
                      Are you sure you want to delete this loss reason? This
                      action cannot be undone.
                    </p>
                  </div>
                  <div class="admin-loss-reason-delete-confirm-actions">
                    <button
                      @click=${this.cancelDelete}
                      class="admin-loss-reason-delete-cancel"
                    >
                      Cancel
                    </button>
                    <button
                      @click=${this.confirmDelete}
                      class="admin-loss-reason-delete-confirm-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            `
          : ""}
        ${this.lossReasons.length === 0 && !this.isLoading
          ? html`
              <div class="admin-loss-reason-list-empty">
                <i class="fas fa-folder-open"></i>
                <p>No loss reasons found.</p>
                <p>Click the "Add New Loss Reason" button to create one.</p>
              </div>
            `
          : html`
              <div class="admin-loss-reason-list">
                <div class="admin-loss-reason-list-header">
                  <div class="admin-loss-reason-id">ID</div>
                  <div class="admin-loss-reason-title">Title</div>
                  <div class="admin-loss-reason-department">Department</div>
                  <div class="admin-loss-reason-actions">Actions</div>
                </div>

                ${this.lossReasons.map(
                  (reason) => html`
                    <admin-loss-reason-card
                      .lossReason=${reason}
                    ></admin-loss-reason-card>
                  `
                )}
              </div>

              ${this.isLoading
                ? html`
                    <div class="admin-loss-reason-list-loading">
                      <i class="fas fa-spinner fa-spin"></i> Loading loss
                      reasons...
                    </div>
                  `
                : ""}
              ${this.hasMore && !this.isLoading
                ? html`
                    <div class="admin-loss-reason-list-load-more">
                      <button
                        @click=${this.loadMore}
                        class="admin-loss-reason-list-load-more-btn"
                      >
                        <i class="fas fa-arrows-alt-v"></i> Load More
                      </button>
                    </div>
                  `
                : ""}
            `}
      </div>

      <style>
        .admin-loss-reason-list-container {
          position: relative;
        }

        .admin-loss-reason-list-error {
          background-color: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .admin-loss-reason-list-retry {
          margin-left: auto;
          background-color: transparent;
          color: #e74c3c;
          border: 1px solid #e74c3c;
          border-radius: 4px;
          padding: 0.4rem 0.75rem;
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          transition: all 0.2s;
        }

        .admin-loss-reason-list-retry:hover {
          background-color: rgba(231, 76, 60, 0.1);
        }

        .admin-loss-reason-list-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
          background-color: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.6);
        }

        .admin-loss-reason-list-empty i {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .admin-loss-reason-list-empty p {
          margin: 0.2rem 0;
        }

        .admin-loss-reason-list {
          background-color: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .admin-loss-reason-list-header {
          display: grid;
          grid-template-columns: 80px 1fr 1fr 100px;
          gap: 1rem;
          background-color: #131624;
          padding: 1rem;
          font-weight: 600;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-loss-reason-id {
          text-align: center;
        }

        .admin-loss-reason-actions {
          text-align: center;
        }

        .admin-loss-reason-list-loading {
          padding: 1rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .admin-loss-reason-list-load-more {
          display: flex;
          justify-content: center;
          margin-top: 1rem;
        }

        .admin-loss-reason-list-load-more-btn {
          background-color: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 0.6rem 1.5rem;
          font-size: 0.875rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .admin-loss-reason-list-load-more-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .admin-loss-reason-delete-confirm {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .admin-loss-reason-delete-confirm-content {
          background-color: #1a1f30;
          border-radius: 8px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .admin-loss-reason-delete-confirm-icon {
          font-size: 2.5rem;
          color: #e74c3c;
          margin-bottom: 1rem;
        }

        .admin-loss-reason-delete-confirm-message h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 1.25rem;
        }

        .admin-loss-reason-delete-confirm-message p {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .admin-loss-reason-delete-confirm-actions {
          display: flex;
          gap: 1rem;
        }

        .admin-loss-reason-delete-cancel {
          background-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .admin-loss-reason-delete-cancel:hover {
          background-color: rgba(255, 255, 255, 0.15);
        }

        .admin-loss-reason-delete-confirm-btn {
          background-color: #e74c3c;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .admin-loss-reason-delete-confirm-btn:hover {
          background-color: #c0392b;
        }

        @media (max-width: 768px) {
          .admin-loss-reason-list-header {
            grid-template-columns: 60px 1fr 100px;
          }

          .admin-loss-reason-department {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .admin-loss-reason-list-header {
            grid-template-columns: 60px 1fr auto;
            gap: 0.5rem;
            padding: 0.75rem;
          }
        }
      </style>
    `;
  }
}

customElements.define("admin-loss-reason-list", AdminLossReasonList);
