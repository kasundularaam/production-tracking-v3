import { LitElement, html } from "https://esm.run/lit";
import { postJson } from "../../utils/api_utils.js";

class AdminNewCellForm extends LitElement {
  static get properties() {
    return {
      lineId: { type: String },
      cellName: { type: String },
      isSubmitting: { type: Boolean },
      error: { type: String },
      success: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.lineId = null;
    this.cellName = "";
    this.isSubmitting = false;
    this.error = "";
    this.success = false;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    // Use the global lineId from the window object
    this.lineId = window.lineId;
    console.log("New Cell Form - Using line ID:", this.lineId);

    if (!this.lineId) {
      this.error = "No line ID provided";
    }
  }

  handleInputChange(e) {
    this.cellName = e.target.value;
    this.error = "";
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!this.cellName || this.cellName.trim() === "") {
      this.error = "Cell name is required";
      return;
    }

    if (!this.lineId) {
      this.error = "Line ID is required";
      return;
    }

    try {
      this.isSubmitting = true;
      this.error = "";

      // Submit the form
      await postJson("/api/admin/cells", {
        name: this.cellName.trim(),
        line_id: parseInt(this.lineId),
      });

      // Show success message
      this.success = true;

      // Redirect to line page after a short delay
      setTimeout(() => {
        window.location.href = `/admin/lines/${this.lineId}`;
      }, 1500);
    } catch (error) {
      console.error("Error creating cell:", error);
      this.error = error.message || "Failed to create cell. Please try again.";
    } finally {
      this.isSubmitting = false;
    }
  }

  render() {
    console.log("Rendering new cell form with state:", {
      lineId: this.lineId,
      cellName: this.cellName,
      isSubmitting: this.isSubmitting,
      error: this.error,
      success: this.success,
    });

    if (this.success) {
      return html`
        <div class="admin-new-cell-success">
          <div class="admin-new-cell-success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3 class="admin-new-cell-success-title">
            Cell Created Successfully!
          </h3>
          <p class="admin-new-cell-success-message">
            Redirecting to line page...
          </p>
        </div>
      `;
    }

    return html`
      <div class="admin-new-cell-form-container">
        <form @submit=${this.handleSubmit} class="admin-new-cell-form">
          ${this.error
            ? html`
                <div class="admin-new-cell-error">
                  <i class="fas fa-exclamation-circle"></i> ${this.error}
                </div>
              `
            : ""}

          <div class="admin-new-cell-field">
            <label for="cell-name" class="admin-new-cell-label"
              >Cell Name</label
            >
            <div class="admin-new-cell-input-container">
              <i class="fas fa-th admin-new-cell-input-icon"></i>
              <input
                type="text"
                id="cell-name"
                class="admin-new-cell-input"
                placeholder="Enter cell name"
                .value=${this.cellName}
                @input=${this.handleInputChange}
                ?disabled=${this.isSubmitting}
                autofocus
              />
            </div>
            <small class="admin-new-cell-hint"
              >The cell name should be unique and descriptive</small
            >
          </div>

          <div class="admin-new-cell-actions">
            <a
              href="/admin/lines/${this.lineId}"
              class="admin-new-cell-cancel"
              ?disabled=${this.isSubmitting}
            >
              Cancel
            </a>
            <button
              type="submit"
              class="admin-new-cell-submit"
              ?disabled=${this.isSubmitting || !this.lineId}
            >
              ${this.isSubmitting
                ? html` <i class="fas fa-spinner fa-spin"></i> Creating... `
                : html` <i class="fas fa-plus"></i> Create Cell `}
            </button>
          </div>
        </form>
      </div>

      <style>
        .admin-new-cell-form-container {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 2rem;
          max-width: 600px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-new-cell-error {
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

        .admin-new-cell-field {
          margin-bottom: 1.5rem;
        }

        .admin-new-cell-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .admin-new-cell-input-container {
          position: relative;
        }

        .admin-new-cell-input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #f7eb00;
        }

        .admin-new-cell-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          font-size: 1rem;
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          transition: border-color 0.2s;
        }

        .admin-new-cell-input:focus {
          outline: none;
          border-color: #f7eb00;
          box-shadow: 0 0 0 2px rgba(247, 235, 0, 0.2);
        }

        .admin-new-cell-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .admin-new-cell-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-new-cell-hint {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .admin-new-cell-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        .admin-new-cell-cancel {
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

        .admin-new-cell-cancel:hover {
          color: #ffffff;
        }

        .admin-new-cell-cancel:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-new-cell-submit {
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

        .admin-new-cell-submit:hover {
          background-color: #e5d900;
        }

        .admin-new-cell-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-new-cell-success {
          background-color: rgba(46, 204, 113, 0.1);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }

        .admin-new-cell-success-icon {
          font-size: 3rem;
          color: #2ecc71;
          margin-bottom: 1rem;
        }

        .admin-new-cell-success-title {
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
        }

        .admin-new-cell-success-message {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      </style>
    `;
  }
}

customElements.define("admin-new-cell-form", AdminNewCellForm);
