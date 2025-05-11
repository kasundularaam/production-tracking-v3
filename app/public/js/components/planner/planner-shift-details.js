// app/public/js/components/planner/planner-shift-details.js

import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class PlannerShiftDetails extends LitElement {
  static get properties() {
    return {
      shiftId: { type: Number },
      shift: { type: Object },
      isLoading: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.shiftId = null;
    this.shift = null;
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
      this.fetchShiftDetails();
    } else {
      this.error = "No shift ID provided";
    }
  }

  async fetchShiftDetails() {
    try {
      this.isLoading = true;
      this.error = "";

      this.shift = await fetchJson(`/api/planner/shifts/${this.shiftId}`);
    } catch (error) {
      console.error("Error fetching shift details:", error);
      this.error =
        error.message || "Failed to load shift details. Please try again.";
    } finally {
      this.isLoading = false;
    }
  }

  // Format date: YYYY-MM-DD to DD MMM YYYY
  formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    const options = {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  // Format shift type: SHIFT-A to Shift A
  formatShiftType(shiftType) {
    if (!shiftType) return "";

    return shiftType
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  // Format day/night: DAY to Day
  formatDayNight(dayNight) {
    if (!dayNight) return "";

    return dayNight.charAt(0).toUpperCase() + dayNight.slice(1).toLowerCase();
  }

  render() {
    if (this.isLoading) {
      return html`
        <div class="planner-shift-details-loading">
          <i class="fas fa-spinner fa-spin"></i> Loading shift details...
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="planner-shift-details-error">
          <i class="fas fa-exclamation-circle"></i> ${this.error}
          <button
            @click=${this.fetchShiftDetails}
            class="planner-shift-details-retry"
          >
            <i class="fas fa-redo"></i> Retry
          </button>
        </div>
      `;
    }

    if (!this.shift) {
      return html``;
    }

    const { date, day_night, shift, plant } = this.shift;
    const plantName = plant?.name || "Unknown Plant";

    return html`
      <div class="planner-shift-details">
        <div class="planner-shift-details-header">
          <h1 class="planner-shift-details-title">
            ${this.formatDate(date)} - ${this.formatDayNight(day_night)}
            ${this.formatShiftType(shift)}
          </h1>
          <div class="planner-shift-details-plant">
            <i class="fas fa-industry"></i>
            <span>${plantName}</span>
          </div>
        </div>
      </div>

      <style>
        .planner-shift-details {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .planner-shift-details-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .planner-shift-details-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #f7eb00;
        }

        .planner-shift-details-plant {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .planner-shift-details-loading {
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

        .planner-shift-details-error {
          background-color: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
        }

        .planner-shift-details-retry {
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

        .planner-shift-details-retry:hover {
          background-color: rgba(231, 76, 60, 0.1);
        }
      </style>
    `;
  }
}

customElements.define("planner-shift-details", PlannerShiftDetails);
