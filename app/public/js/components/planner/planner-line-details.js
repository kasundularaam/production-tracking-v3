// app/public/js/components/planner/planner-line-details.js

import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class PlannerLineDetails extends LitElement {
  static get properties() {
    return {
      lineId: { type: Number },
      line: { type: Object },
      isLoading: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.lineId = null;
    this.line = null;
    this.isLoading = false;
    this.error = "";
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    // Get the line ID from the window object
    this.lineId = window.lineId;
    if (this.lineId) {
      this.fetchLineDetails();
    } else {
      this.error = "No line ID provided";
    }
  }

  async fetchLineDetails() {
    try {
      this.isLoading = true;
      this.error = "";

      this.line = await fetchJson(`/api/planner/lines/${this.lineId}`);
    } catch (error) {
      console.error("Error fetching line details:", error);
      this.error =
        error.message || "Failed to load line details. Please try again.";
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    if (this.isLoading) {
      return html`
        <div class="planner-line-details-loading">
          <i class="fas fa-spinner fa-spin"></i> Loading line details...
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="planner-line-details-error">
          <i class="fas fa-exclamation-circle"></i> ${this.error}
          <button
            @click=${this.fetchLineDetails}
            class="planner-line-details-retry"
          >
            <i class="fas fa-redo"></i> Retry
          </button>
        </div>
      `;
    }

    if (!this.line) {
      return html``;
    }

    const { name, loop } = this.line;
    const loopName = loop?.name || "Unknown Loop";
    const zoneName = loop?.zone?.name || "Unknown Zone";
    const plantName = loop?.zone?.plant?.name || "Unknown Plant";

    return html`
      <div class="planner-line-details">
        <div class="planner-line-details-header">
          <h2 class="planner-line-details-title">
            <i class="fas fa-sitemap"></i> ${name}
          </h2>
        </div>

        <div class="planner-line-details-info">
          <div class="planner-line-details-item">
            <div class="planner-line-details-label">Plant:</div>
            <div class="planner-line-details-value">
              <i class="fas fa-industry"></i> ${plantName}
            </div>
          </div>

          <div class="planner-line-details-item">
            <div class="planner-line-details-label">Zone:</div>
            <div class="planner-line-details-value">
              <i class="fas fa-map-marker-alt"></i> ${zoneName}
            </div>
          </div>

          <div class="planner-line-details-item">
            <div class="planner-line-details-label">Loop:</div>
            <div class="planner-line-details-value">
              <i class="fas fa-code-branch"></i> ${loopName}
            </div>
          </div>
        </div>
      </div>

      <style>
        .planner-line-details {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          height: 100%;
        }

        .planner-line-details-header {
          margin-bottom: 1.25rem;
        }

        .planner-line-details-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #f7eb00;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .planner-line-details-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .planner-line-details-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .planner-line-details-label {
          font-weight: 500;
          width: 4rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .planner-line-details-value {
          color: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .planner-line-details-value i {
          color: #f7eb00;
        }

        .planner-line-details-loading {
          padding: 2rem;
          text-align: center;
          background-color: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          height: 100%;
        }

        .planner-line-details-error {
          background-color: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          height: 100%;
        }

        .planner-line-details-retry {
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

        .planner-line-details-retry:hover {
          background-color: rgba(231, 76, 60, 0.1);
        }
      </style>
    `;
  }
}

customElements.define("planner-line-details", PlannerLineDetails);
