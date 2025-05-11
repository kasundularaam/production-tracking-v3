// app/public/js/components/admin/admin-new-loss-reason-form.js

import { LitElement, html } from "https://esm.run/lit";
import { postJson } from "../../utils/api_utils.js";

class AdminNewLossReasonForm extends LitElement {
  static get properties() {
    return {
      id: { type: String },
      title: { type: String },
      department: { type: String },
      isSubmitting: { type: Boolean },
      error: { type: String },
      success: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.id = "";
    this.title = "";
    this.department = "";
    this.isSubmitting = false;
    this.error = "";
    this.success = false;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  handleIdChange(e) {
    this.id = e.target.value;
    this.error = "";
  }

  handleTitleChange(e) {
    this.title = e.target.value;
    this.error = "";
  }

  handleDepartmentChange(e) {
    this.department = e.target.value;
    this.error = "";
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!this.id || this.id.trim() === "") {
      this.error = "ID is required";
      return;
    }

    if (!/^\d+$/.test(this.id)) {
      this.error = "ID must be a number";
      return;
    }

    if (!this.title || this.title.trim() === "") {
      this.error = "Title is required";
      return;
    }

    if (!this.department || this.department.trim() === "") {
      this.error = "Department is required";
      return;
    }

    try {
      this.isSubmitting = true;
      this.error = "";

      const response = await postJson("/api/admin/loss-reasons", {
        id: parseInt(this.id, 10),
        title: this.title.trim(),
        department: this.department.trim(),
      });

      // Show success message
      this.success = true;

      // Redirect to loss reasons page after a short delay
      setTimeout(() => {
        window.location.href = "/admin/loss-reasons";
      }, 1500);
    } catch (error) {
      console.error("Error creating loss reason:", error);
      this.error =
        error.message || "Failed to create loss reason. Please try again.";
    } finally {
      this.isSubmitting = false;
    }
  }

  render() {
    if (this.success) {
      return html`
        <div class="admin-new-loss-reason-success">
          <div class="admin-new-loss-reason-success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3 class="admin-new-loss-reason-success-title">
            Loss Reason Created Successfully!
          </h3>
          <p class="admin-new-loss-reason-success-message">
            Redirecting to loss reasons page...
          </p>
        </div>
      `;
    }

    return html`
      <div class="admin-new-loss-reason-form-container">
        <form @submit=${this.handleSubmit} class="admin-new-loss-reason-form">
          ${this.error
            ? html`
                <div class="admin-new-loss-reason-error">
                  <i class="fas fa-exclamation-circle"></i> ${this.error}
                </div>
              `
            : ""}

          <div class="admin-new-loss-reason-field">
            <label for="id" class="admin-new-loss-reason-label">ID</label>
            <div class="admin-new-loss-reason-input-container">
              <i class="fas fa-hashtag admin-new-loss-reason-input-icon"></i>
              <input
                type="text"
                id="id"
                class="admin-new-loss-reason-input"
                placeholder="Enter numeric ID"
                .value=${this.id}
                @input=${this.handleIdChange}
                ?disabled=${this.isSubmitting}
                autofocus
              />
            </div>
            <small class="admin-new-loss-reason-hint"
              >Numeric identifier for the loss reason</small
            >
          </div>

          <div class="admin-new-loss-reason-field">
            <label for="title" class="admin-new-loss-reason-label">Title</label>
            <div class="admin-new-loss-reason-input-container">
              <i class="fas fa-heading admin-new-loss-reason-input-icon"></i>
              <input
                type="text"
                id="title"
                class="admin-new-loss-reason-input"
                placeholder="Enter title"
                .value=${this.title}
                @input=${this.handleTitleChange}
                ?disabled=${this.isSubmitting}
              />
            </div>
            <small class="admin-new-loss-reason-hint"
              >Title of the loss reason</small
            >
          </div>

          <div class="admin-new-loss-reason-field">
            <label for="department" class="admin-new-loss-reason-label"
              >Department</label
            >
            <div class="admin-new-loss-reason-input-container">
              <i class="fas fa-building admin-new-loss-reason-input-icon"></i>
              <input
                type="text"
                id="department"
                class="admin-new-loss-reason-input"
                placeholder="Enter department"
                .value=${this.department}
                @input=${this.handleDepartmentChange}
                ?disabled=${this.isSubmitting}
              />
            </div>
            <small class="admin-new-loss-reason-hint"
              >Department responsible for this loss reason</small
            >
          </div>

          <div class="admin-new-loss-reason-actions">
            <a
              href="/admin/loss-reasons"
              class="admin-new-loss-reason-cancel"
              ?disabled=${this.isSubmitting}
            >
              Cancel
            </a>
            <button
              type="submit"
              class="admin-new-loss-reason-submit"
              ?disabled=${this.isSubmitting}
            >
              ${this.isSubmitting
                ? html` <i class="fas fa-spinner fa-spin"></i> Creating... `
                : html` <i class="fas fa-plus"></i> Create Loss Reason `}
            </button>
          </div>
        </form>
      </div>

      <style>
        .admin-new-loss-reason-form-container {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 2rem;
          max-width: 600px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-new-loss-reason-error {
          background-color: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .admin-new-loss-reason-field {
          margin-bottom: 1.5rem;
        }

        .admin-new-loss-reason-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .admin-new-loss-reason-input-container {
          position: relative;
        }

        .admin-new-loss-reason-input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #f7eb00;
        }

        .admin-new-loss-reason-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          font-size: 1rem;
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          transition: border-color 0.2s;
        }

        .admin-new-loss-reason-input:focus {
          outline: none;
          border-color: #f7eb00;
          box-shadow: 0 0 0 2px rgba(247, 235, 0, 0.2);
        }

        .admin-new-loss-reason-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .admin-new-loss-reason-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-new-loss-reason-hint {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .admin-new-loss-reason-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        .admin-new-loss-reason-cancel {
          background-color: transparent;
          color: rgba(255, 255, 255, 0.7);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s;
          display: inline-flex;
          align-items: center;
        }

        .admin-new-loss-reason-cancel:hover {
          color: #ffffff;
        }

        .admin-new-loss-reason-cancel:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-new-loss-reason-submit {
          background-color: #f7eb00;
          color: #131624;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .admin-new-loss-reason-submit:hover {
          background-color: #e5d900;
        }

        .admin-new-loss-reason-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-new-loss-reason-success {
          background-color: rgba(46, 204, 113, 0.1);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }

        .admin-new-loss-reason-success-icon {
          font-size: 3rem;
          color: #2ecc71;
          margin-bottom: 1rem;
        }

        .admin-new-loss-reason-success-title {
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
        }

        .admin-new-loss-reason-success-message {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      </style>
    `;
  }
}

customElements.define("admin-new-loss-reason-form", AdminNewLossReasonForm);
