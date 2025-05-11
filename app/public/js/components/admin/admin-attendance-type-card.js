// app/public/js/components/admin/admin-attendance-type-card.js

import { LitElement, html } from "https://esm.run/lit";

class AdminAttendanceTypeCard extends LitElement {
  static get properties() {
    return {
      attendanceType: { type: Object },
    };
  }

  constructor() {
    super();
    this.attendanceType = null;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();

    const event = new CustomEvent("attendance-type-delete", {
      detail: { id: this.attendanceType.id },
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);
  }

  render() {
    if (!this.attendanceType) return html``;

    const { id, title, color } = this.attendanceType;

    return html`
      <div class="admin-attendance-type-card">
        <div class="admin-attendance-type-card-id">${id}</div>
        <div class="admin-attendance-type-card-title">${title}</div>
        <div class="admin-attendance-type-card-color">
          <div
            class="admin-attendance-type-card-color-preview"
            style="background-color: ${color};"
          ></div>
          <span class="admin-attendance-type-card-color-value">${color}</span>
        </div>
        <div class="admin-attendance-type-card-actions">
          <a
            href="/admin/attendance-types/${id}/edit"
            class="admin-attendance-type-card-edit"
            title="Edit"
          >
            <i class="fas fa-edit"></i>
          </a>
          <button
            @click=${this.handleDelete}
            class="admin-attendance-type-card-delete"
            title="Delete"
          >
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>

      <style>
        .admin-attendance-type-card {
          display: grid;
          grid-template-columns: 80px 1fr 120px 100px;
          gap: 1rem;
          padding: 1rem;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background-color 0.2s;
        }

        .admin-attendance-type-card:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }

        .admin-attendance-type-card-id {
          color: #f7eb00;
          font-weight: 500;
          text-align: center;
        }

        .admin-attendance-type-card-title {
          color: rgba(255, 255, 255, 0.9);
        }

        .admin-attendance-type-card-color {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
        }

        .admin-attendance-type-card-color-preview {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .admin-attendance-type-card-color-value {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .admin-attendance-type-card-actions {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
        }

        .admin-attendance-type-card-edit,
        .admin-attendance-type-card-delete {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.2s;
          cursor: pointer;
        }

        .admin-attendance-type-card-edit {
          background-color: rgba(52, 152, 219, 0.1);
          border: 1px solid rgba(52, 152, 219, 0.3);
          text-decoration: none;
        }

        .admin-attendance-type-card-edit:hover {
          background-color: rgba(52, 152, 219, 0.2);
          color: #3498db;
        }

        .admin-attendance-type-card-delete {
          background-color: rgba(231, 76, 60, 0.1);
          border: 1px solid rgba(231, 76, 60, 0.3);
        }

        .admin-attendance-type-card-delete:hover {
          background-color: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
        }

        @media (max-width: 768px) {
          .admin-attendance-type-card {
            grid-template-columns: 60px 1fr 120px;
          }

          .admin-attendance-type-card-actions {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .admin-attendance-type-card {
            grid-template-columns: 60px 1fr;
            gap: 0.5rem;
            padding: 0.75rem;
          }

          .admin-attendance-type-card-color {
            display: none;
          }
        }
      </style>
    `;
  }
}

customElements.define("admin-attendance-type-card", AdminAttendanceTypeCard);
