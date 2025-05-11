// app/public/js/components/planner/planner-line-list.js

import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";
import "./planner-line-card.js";

class PlannerLineList extends LitElement {
  static get properties() {
    return {
      shiftId: { type: Number },
      lines: { type: Array },
      isLoading: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.shiftId = null;
    this.lines = [];
    this.isLoading = false;
    this.error = "";
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    // Get the shift ID from the window object
    this.shiftId = window.shiftId;
    if (this.shiftId) {
      this.fetchLines();
    } else {
      this.error = "No shift ID provided";
    }
  }

  async fetchLines() {
    try {
      this.isLoading = true;
      this.error = "";

      const response = await fetchJson(
        `/api/planner/shifts/${this.shiftId}/lines`
      );
      this.lines = response.items || [];
    } catch (error) {
      console.error("Error fetching lines:", error);
      this.error = error.message || "Failed to load lines. Please try again.";
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    if (this.isLoading) {
      return html`
        <div class="planner-line-list-loading">
          <i class="fas fa-spinner fa-spin"></i> Loading lines...
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="planner-line-list-error">
          <i class="fas fa-exclamation-circle"></i> ${this.error}
          <button @click=${this.fetchLines} class="planner-line-list-retry">
            <i class="fas fa-redo"></i> Retry
          </button>
        </div>
      `;
    }

    if (this.lines.length === 0) {
      return html`
        <div class="planner-line-list-empty">
          <i class="fas fa-exclamation-circle"></i>
          <p>No lines found for this plant.</p>
          <p>Please contact an administrator to set up lines.</p>
        </div>
      `;
    }

    return html`
      <div class="planner-line-list">
        ${this.lines.map(
          (line) => html`
            <planner-line-card
              .line=${line}
              .shiftId=${this.shiftId}
            ></planner-line-card>
          `
        )}
      </div>

      <style>
        .planner-line-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .planner-line-list-loading {
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
        }

        .planner-line-list-error {
          background-color: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
        }

        .planner-line-list-retry {
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

        .planner-line-list-retry:hover {
          background-color: rgba(231, 76, 60, 0.1);
        }

        .planner-line-list-empty {
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

        .planner-line-list-empty i {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .planner-line-list-empty p {
          margin: 0.2rem 0;
        }

        @media (max-width: 640px) {
          .planner-line-list {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
  }
}

customElements.define("planner-line-list", PlannerLineList);
