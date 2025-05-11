// app/public/js/components/admin/admin-loss-reason-card.js

import { LitElement, html } from "https://esm.run/lit";

class AdminLossReasonCard extends LitElement {
  static get properties() {
    return {
      lossReason: { type: Object },
    };
  }

  constructor() {
    super();
    this.lossReason = null;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();

    const event = new CustomEvent("loss-reason-delete", {
      detail: { id: this.lossReason.id },
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);
  }

  render() {
    if (!this.lossReason) return html``;

    const { id, title, department } = this.lossReason;

    return html`
      <div class="admin-loss-reason-card">
        <div class="admin-loss-reason-card-id">${id}</div>
        <div class="admin-loss-reason-card-title">${title}</div>
        <div class="admin-loss-reason-card-department">${department}</div>
        <div class="admin-loss-reason-card-actions">
          <a
            href="/admin/loss-reasons/${id}/edit"
            class="admin-loss-reason-card-edit"
            title="Edit"
          >
            <i class="fas fa-edit"></i>
          </a>
          <button
            @click=${this.handleDelete}
            class="admin-loss-reason-card-delete"
            title="Delete"
          >
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>

      <style>
        .admin-loss-reason-card {
          display: grid;
          grid-template-columns: 80px 1fr 1fr 100px;
          gap: 1rem;
          padding: 1rem;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background-color 0.2s;
        }

        .admin-loss-reason-card:hover {
          background-color: rgba(255, 255, 255, 0.02);
        }

        .admin-loss-reason-card-id {
          color: #f7eb00;
          font-weight: 500;
          text-align: center;
        }

        .admin-loss-reason-card-title {
          color: rgba(255, 255, 255, 0.9);
        }

        .admin-loss-reason-card-department {
          color: rgba(255, 255, 255, 0.7);
        }

        .admin-loss-reason-card-actions {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
        }

        .admin-loss-reason-card-edit,
        .admin-loss-reason-card-delete {
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

        .admin-loss-reason-card-edit {
          background-color: rgba(52, 152, 219, 0.1);
          border: 1px solid rgba(52, 152, 219, 0.3);
          text-decoration: none;
        }

        .admin-loss-reason-card-edit:hover {
          background-color: rgba(52, 152, 219, 0.2);
          color: #3498db;
        }

        .admin-loss-reason-card-delete {
          background-color: rgba(231, 76, 60, 0.1);
          border: 1px solid rgba(231, 76, 60, 0.3);
        }

        .admin-loss-reason-card-delete:hover {
          background-color: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
        }

        @media (max-width: 768px) {
          .admin-loss-reason-card {
            grid-template-columns: 60px 1fr 100px;
          }

          .admin-loss-reason-card-department {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .admin-loss-reason-card {
            grid-template-columns: 60px 1fr auto;
            gap: 0.5rem;
            padding: 0.75rem;
          }

          .admin-loss-reason-card-actions {
            gap: 0.5rem;
          }

          .admin-loss-reason-card-edit,
          .admin-loss-reason-card-delete {
            width: 1.75rem;
            height: 1.75rem;
          }
        }
      </style>
    `;
  }
}

customElements.define("admin-loss-reason-card", AdminLossReasonCard);
