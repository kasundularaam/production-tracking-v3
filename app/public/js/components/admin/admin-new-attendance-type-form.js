// app/public/js/components/admin/admin-new-attendance-type-form.js

import { LitElement, html } from "https://esm.run/lit";
import { postJson } from "../../utils/api_utils.js";

class AdminNewAttendanceTypeForm extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      color: { type: String },
      isSubmitting: { type: Boolean },
      error: { type: String },
      success: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.title = "";
    this.color = "#4CAF50"; // Default green color
    this.isSubmitting = false;
    this.error = "";
    this.success = false;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  handleTitleChange(e) {
    this.title = e.target.value;
    this.error = "";
  }

  handleColorChange(e) {
    this.color = e.target.value;
    this.error = "";
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!this.title || this.title.trim() === "") {
      this.error = "Title is required";
      return;
    }

    if (!this.color || this.color.trim() === "") {
      this.error = "Color is required";
      return;
    }

    try {
      this.isSubmitting = true;
      this.error = "";

      const response = await postJson("/api/admin/attendance-types", {
        title: this.title.trim(),
        color: this.color,
      });

      // Show success message
      this.success = true;

      // Redirect to attendance types page after a short delay
      setTimeout(() => {
        window.location.href = "/admin/attendance-types";
      }, 1500);
    } catch (error) {
      console.error("Error creating attendance type:", error);
      this.error =
        error.message || "Failed to create attendance type. Please try again.";
    } finally {
      this.isSubmitting = false;
    }
  }

  render() {
    if (this.success) {
      return html`
        <div class="admin-new-attendance-type-success">
          <div class="admin-new-attendance-type-success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3 class="admin-new-attendance-type-success-title">
            Attendance Type Created Successfully!
          </h3>
          <p class="admin-new-attendance-type-success-message">
            Redirecting to attendance types page...
          </p>
        </div>
      `;
    }

    return html`
      <div class="admin-new-attendance-type-form-container">
        <form
          @submit=${this.handleSubmit}
          class="admin-new-attendance-type-form"
        >
          ${this.error
            ? html`
                <div class="admin-new-attendance-type-error">
                  <i class="fas fa-exclamation-circle"></i> ${this.error}
                </div>
              `
            : ""}

          <div class="admin-new-attendance-type-field">
            <label for="title" class="admin-new-attendance-type-label"
              >Title</label
            >
            <div class="admin-new-attendance-type-input-container">
              <i
                class="fas fa-heading admin-new-attendance-type-input-icon"
              ></i>
              <input
                type="text"
                id="title"
                class="admin-new-attendance-type-input"
                placeholder="Enter attendance type title"
                .value=${this.title}
                @input=${this.handleTitleChange}
                ?disabled=${this.isSubmitting}
                autofocus
              />
            </div>
            <small class="admin-new-attendance-type-hint"
              >Ex: Present, Sick Leave, Vacation, Training, etc.</small
            >
          </div>

          <div class="admin-new-attendance-type-field">
            <label for="color" class="admin-new-attendance-type-label"
              >Color</label
            >
            <div class="admin-new-attendance-type-color-container">
              <div
                class="admin-new-attendance-type-color-preview"
                style="background-color: ${this.color};"
              ></div>
              <input
                type="color"
                id="color"
                class="admin-new-attendance-type-color-picker"
                .value=${this.color}
                @input=${this.handleColorChange}
                ?disabled=${this.isSubmitting}
              />
              <input
                type="text"
                class="admin-new-attendance-type-color-text"
                placeholder="#RRGGBB"
                .value=${this.color}
                @input=${this.handleColorChange}
                ?disabled=${this.isSubmitting}
              />
            </div>
            <small class="admin-new-attendance-type-hint"
              >Select a color for this attendance type</small
            >
          </div>

          <div class="admin-new-attendance-type-actions">
            <a
              href="/admin/attendance-types"
              class="admin-new-attendance-type-cancel"
              ?disabled=${this.isSubmitting}
            >
              Cancel
            </a>
            <button
              type="submit"
              class="admin-new-attendance-type-submit"
              ?disabled=${this.isSubmitting}
            >
              ${this.isSubmitting
                ? html` <i class="fas fa-spinner fa-spin"></i> Creating... `
                : html` <i class="fas fa-plus"></i> Create Attendance Type `}
            </button>
          </div>
        </form>
      </div>

      <style>
        .admin-new-attendance-type-form-container {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 2rem;
          max-width: 600px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-new-attendance-type-error {
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

        .admin-new-attendance-type-field {
          margin-bottom: 1.5rem;
        }

        .admin-new-attendance-type-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .admin-new-attendance-type-input-container {
          position: relative;
        }

        .admin-new-attendance-type-input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #f7eb00;
        }

        .admin-new-attendance-type-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          font-size: 1rem;
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          transition: border-color 0.2s;
        }

        .admin-new-attendance-type-input:focus {
          outline: none;
          border-color: #f7eb00;
          box-shadow: 0 0 0 2px rgba(247, 235, 0, 0.2);
        }

        .admin-new-attendance-type-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .admin-new-attendance-type-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-new-attendance-type-color-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-new-attendance-type-color-preview {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .admin-new-attendance-type-color-picker {
          height: 2.5rem;
          width: 2.5rem;
          padding: 0;
          border: none;
          background: none;
          cursor: pointer;
        }

        .admin-new-attendance-type-color-picker::-webkit-color-swatch-wrapper {
          padding: 0;
        }

        .admin-new-attendance-type-color-picker::-webkit-color-swatch {
          border: none;
          border-radius: 6px;
        }

        .admin-new-attendance-type-color-text {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          font-size: 1rem;
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          transition: border-color 0.2s;
          text-transform: uppercase;
        }

        .admin-new-attendance-type-color-text:focus {
          outline: none;
          border-color: #f7eb00;
          box-shadow: 0 0 0 2px rgba(247, 235, 0, 0.2);
        }

        .admin-new-attendance-type-hint {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .admin-new-attendance-type-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        .admin-new-attendance-type-cancel {
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

        .admin-new-attendance-type-cancel:hover {
          color: #ffffff;
        }

        .admin-new-attendance-type-cancel:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-new-attendance-type-submit {
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

        .admin-new-attendance-type-submit:hover {
          background-color: #e5d900;
        }

        .admin-new-attendance-type-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-new-attendance-type-success {
          background-color: rgba(46, 204, 113, 0.1);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }

        .admin-new-attendance-type-success-icon {
          font-size: 3rem;
          color: #2ecc71;
          margin-bottom: 1rem;
        }

        .admin-new-attendance-type-success-title {
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
        }

        .admin-new-attendance-type-success-message {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        @media (max-width: 640px) {
          .admin-new-attendance-type-color-container {
            flex-wrap: wrap;
          }

          .admin-new-attendance-type-color-text {
            margin-top: 0.5rem;
            width: 100%;
          }
        }
      </style>
    `;
  }
}

customElements.define(
  "admin-new-attendance-type-form",
  AdminNewAttendanceTypeForm
);
