// app/public/js/components/admin/admin-attendance-type-list.js

import { LitElement, html } from "https://esm.run/lit";
import { fetchJson, deleteJson } from "../../utils/api_utils.js";
import "./admin-attendance-type-card.js";

class AdminAttendanceTypeList extends LitElement {
  static get properties() {
    return {
      attendanceTypes: { type: Array },
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
    this.attendanceTypes = [];
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
    this.fetchAttendanceTypes();

    // Listen for attendance type deleted event
    this.addEventListener("attendance-type-delete", this.handleDeleteClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("attendance-type-delete", this.handleDeleteClick);
  }

  async fetchAttendanceTypes() {
    try {
      this.isLoading = true;
      this.error = "";

      const response = await fetchJson(
        `/api/admin/attendance-types?page=${this.page}&limit=${this.limit}`
      );

      if (this.page === 1) {
        this.attendanceTypes = response.items;
      } else {
        this.attendanceTypes = [...this.attendanceTypes, ...response.items];
      }

      this.hasMore = response.total > this.attendanceTypes.length;
    } catch (error) {
      console.error("Error fetching attendance types:", error);
      this.error =
        error.message || "Failed to load attendance types. Please try again.";
    } finally {
      this.isLoading = false;
    }
  }

  loadMore() {
    this.page += 1;
    this.fetchAttendanceTypes();
  }

  handleDeleteClick(event) {
    this.deleteConfirmId = event.detail.id;
  }

  async confirmDelete() {
    try {
      await deleteJson(`/api/admin/attendance-types/${this.deleteConfirmId}`);

      // Remove the deleted item from the list
      this.attendanceTypes = this.attendanceTypes.filter(
        (type) => type.id !== this.deleteConfirmId
      );

      // Reset deleteConfirmId
      this.deleteConfirmId = null;
    } catch (error) {
      console.error("Error deleting attendance type:", error);
      this.error =
        error.message || "Failed to delete attendance type. Please try again.";
    }
  }

  cancelDelete() {
    this.deleteConfirmId = null;
  }

  render() {
    return html`
      <div class="admin-attendance-type-list-container">
        ${this.error
          ? html`
              <div class="admin-attendance-type-list-error">
                <i class="fas fa-exclamation-circle"></i> ${this.error}
                <button
                  @click=${() => this.fetchAttendanceTypes()}
                  class="admin-attendance-type-list-retry"
                >
                  <i class="fas fa-redo"></i> Retry
                </button>
              </div>
            `
          : ""}
        ${this.deleteConfirmId
          ? html`
              <div class="admin-attendance-type-delete-confirm">
                <div class="admin-attendance-type-delete-confirm-content">
                  <div class="admin-attendance-type-delete-confirm-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                  </div>
                  <div class="admin-attendance-type-delete-confirm-message">
                    <h3>Confirm Deletion</h3>
                    <p>
                      Are you sure you want to delete this attendance type? This
                      action cannot be undone.
                    </p>
                  </div>
                  <div class="admin-attendance-type-delete-confirm-actions">
                    <button
                      @click=${this.cancelDelete}
                      class="admin-attendance-type-delete-cancel"
                    >
                      Cancel
                    </button>
                    <button
                      @click=${this.confirmDelete}
                      class="admin-attendance-type-delete-confirm-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            `
          : ""}
        ${this.attendanceTypes.length === 0 && !this.isLoading
          ? html`
              <div class="admin-attendance-type-list-empty">
                <i class="fas fa-calendar-times"></i>
                <p>No attendance types found.</p>
                <p>Click the "Add New Attendance Type" button to create one.</p>
              </div>
            `
          : html`
              <div class="admin-attendance-type-list">
                <div class="admin-attendance-type-list-header">
                  <div class="admin-attendance-type-id">ID</div>
                  <div class="admin-attendance-type-title">Title</div>
                  <div class="admin-attendance-type-color">Color</div>
                  <div class="admin-attendance-type-actions">Actions</div>
                </div>

                ${this.attendanceTypes.map(
                  (type) => html`
                    <admin-attendance-type-card
                      .attendanceType=${type}
                    ></admin-attendance-type-card>
                  `
                )}
              </div>

              ${this.isLoading
                ? html`
                    <div class="admin-attendance-type-list-loading">
                      <i class="fas fa-spinner fa-spin"></i> Loading attendance
                      types...
                    </div>
                  `
                : ""}
              ${this.hasMore && !this.isLoading
                ? html`
                    <div class="admin-attendance-type-list-load-more">
                      <button
                        @click=${this.loadMore}
                        class="admin-attendance-type-list-load-more-btn"
                      >
                        <i class="fas fa-arrows-alt-v"></i> Load More
                      </button>
                    </div>
                  `
                : ""}
            `}
      </div>

      <style>
        .admin-attendance-type-list-container {
          position: relative;
        }

        .admin-attendance-type-list-error {
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

        .admin-attendance-type-list-retry {
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

        .admin-attendance-type-list-retry:hover {
          background-color: rgba(231, 76, 60, 0.1);
        }

        .admin-attendance-type-list-empty {
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

        .admin-attendance-type-list-empty i {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .admin-attendance-type-list-empty p {
          margin: 0.2rem 0;
        }

        .admin-attendance-type-list {
          background-color: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .admin-attendance-type-list-header {
          display: grid;
          grid-template-columns: 80px 1fr 120px 100px;
          gap: 1rem;
          background-color: #131624;
          padding: 1rem;
          font-weight: 600;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-attendance-type-id {
          text-align: center;
        }

        .admin-attendance-type-color {
          text-align: center;
        }

        .admin-attendance-type-actions {
          text-align: center;
        }

        .admin-attendance-type-list-loading {
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

        .admin-attendance-type-list-load-more {
          display: flex;
          justify-content: center;
          margin-top: 1rem;
        }

        .admin-attendance-type-list-load-more-btn {
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

        .admin-attendance-type-list-load-more-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .admin-attendance-type-delete-confirm {
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

        .admin-attendance-type-delete-confirm-content {
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

        .admin-attendance-type-delete-confirm-icon {
          font-size: 2.5rem;
          color: #e74c3c;
          margin-bottom: 1rem;
        }

        .admin-attendance-type-delete-confirm-message h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 1.25rem;
        }

        .admin-attendance-type-delete-confirm-message p {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .admin-attendance-type-delete-confirm-actions {
          display: flex;
          gap: 1rem;
        }

        .admin-attendance-type-delete-cancel {
          background-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .admin-attendance-type-delete-cancel:hover {
          background-color: rgba(255, 255, 255, 0.15);
        }

        .admin-attendance-type-delete-confirm-btn {
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

        .admin-attendance-type-delete-confirm-btn:hover {
          background-color: #c0392b;
        }

        @media (max-width: 768px) {
          .admin-attendance-type-list-header {
            grid-template-columns: 60px 1fr 120px;
          }

          .admin-attendance-type-actions {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .admin-attendance-type-list-header {
            grid-template-columns: 60px 1fr;
            gap: 0.5rem;
            padding: 0.75rem;
          }

          .admin-attendance-type-color {
            display: none;
          }
        }
      </style>
    `;
  }
}

customElements.define("admin-attendance-type-list", AdminAttendanceTypeList);
