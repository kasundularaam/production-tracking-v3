// app/public/js/components/planner/planner-shift-list.js

import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";
import "./planner-shift-card.js";

class PlannerShiftList extends LitElement {
  static get properties() {
    return {
      shifts: { type: Array },
      isLoading: { type: Boolean },
      error: { type: String },
      page: { type: Number },
      hasMore: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.shifts = [];
    this.isLoading = false;
    this.error = "";
    this.page = 1;
    this.limit = 10;
    this.hasMore = true;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchShifts();

    // Listen for shift creation events
    window.addEventListener(
      "shift-created",
      this.handleShiftCreated.bind(this)
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(
      "shift-created",
      this.handleShiftCreated.bind(this)
    );
  }

  handleShiftCreated(event) {
    this.page = 1;
    this.shifts = [];
    this.fetchShifts();
  }

  async fetchShifts() {
    try {
      this.isLoading = true;
      this.error = "";

      const response = await fetchJson(
        `/api/planner/shifts?page=${this.page}&limit=${this.limit}`
      );

      if (this.page === 1) {
        this.shifts = response.items;
      } else {
        this.shifts = [...this.shifts, ...response.items];
      }

      this.hasMore = response.total > this.shifts.length;
    } catch (error) {
      console.error("Error fetching shifts:", error);
      this.error = error.message || "Failed to load shifts. Please try again.";
    } finally {
      this.isLoading = false;
    }
  }

  loadMore() {
    this.page += 1;
    this.fetchShifts();
  }

  render() {
    return html`
      <div class="planner-shift-list-container">
        ${this.error
          ? html`
              <div class="planner-shift-list-error">
                <i class="fas fa-exclamation-circle"></i> ${this.error}
                <button
                  @click=${() => this.fetchShifts()}
                  class="planner-shift-list-retry"
                >
                  <i class="fas fa-redo"></i> Retry
                </button>
              </div>
            `
          : ""}
        ${this.shifts.length === 0 && !this.isLoading
          ? html`
              <div class="planner-shift-list-empty">
                <i class="fas fa-calendar-times"></i>
                <p>No shifts created yet.</p>
                <p>Use the form above to create your first shift.</p>
              </div>
            `
          : ""}

        <div class="planner-shift-list">
          ${this.shifts.map(
            (shift) => html`
              <planner-shift-card .shift=${shift}></planner-shift-card>
            `
          )}
          ${this.isLoading
            ? html`
                <div class="planner-shift-list-loading">
                  <i class="fas fa-spinner fa-spin"></i> Loading shifts...
                </div>
              `
            : ""}
        </div>

        ${this.hasMore && !this.isLoading
          ? html`
              <div class="planner-shift-list-load-more">
                <button
                  @click=${this.loadMore}
                  class="planner-shift-list-load-more-btn"
                >
                  <i class="fas fa-arrows-alt-v"></i> Load More
                </button>
              </div>
            `
          : ""}
      </div>

      <style>
        .planner-shift-list-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .planner-shift-list-error {
          background-color: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
        }

        .planner-shift-list-retry {
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

        .planner-shift-list-retry:hover {
          background-color: rgba(231, 76, 60, 0.1);
        }

        .planner-shift-list-empty {
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

        .planner-shift-list-empty i {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .planner-shift-list-empty p {
          margin: 0.2rem 0;
        }

        .planner-shift-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .planner-shift-list-loading {
          padding: 1rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .planner-shift-list-load-more {
          display: flex;
          justify-content: center;
          margin-top: 1rem;
        }

        .planner-shift-list-load-more-btn {
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

        .planner-shift-list-load-more-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      </style>
    `;
  }
}

customElements.define("planner-shift-list", PlannerShiftList);
