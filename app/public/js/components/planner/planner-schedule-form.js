// app/public/js/components/planner/planner-schedule-form.js

import { LitElement, html } from "https://esm.run/lit";
import { postJson, fetchJson } from "../../utils/api_utils.js";

class PlannerScheduleForm extends LitElement {
  static get properties() {
    return {
      shiftId: { type: Number },
      lineId: { type: Number },
      hourPlans: { type: Object },
      isLoading: { type: Boolean },
      isSubmitting: { type: Boolean },
      error: { type: String },
      success: { type: Boolean },
      existingProductions: { type: Array },
    };
  }

  constructor() {
    super();
    this.shiftId = null;
    this.lineId = null;
    this.hourPlans = {
      "HOUR-01": "",
      "HOUR-02": "",
      "HOUR-03": "",
      "HOUR-04": "",
      "HOUR-05": "",
      "HOUR-06": "",
      "HOUR-07": "",
      "HOUR-08": "",
      "HOUR-09": "",
      "HOUR-10": "",
      "HOUR-11": "",
      "HOUR-12": "",
    };
    this.isLoading = false;
    this.isSubmitting = false;
    this.error = "";
    this.success = false;
    this.existingProductions = [];
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    // Get the shift ID and line ID from the window object
    this.shiftId = window.shiftId;
    this.lineId = window.lineId;

    if (this.shiftId && this.lineId) {
      this.checkExistingProductions();
    } else {
      this.error = "Missing shift ID or line ID";
    }
  }

  async checkExistingProductions() {
    try {
      this.isLoading = true;
      this.error = "";

      const response = await fetchJson(
        `/api/planner/productions?shift=${this.shiftId}&line=${this.lineId}`
      );
      this.existingProductions = response.items || [];

      // If productions exist, pre-fill the form
      if (this.existingProductions.length > 0) {
        this.existingProductions.forEach((production) => {
          if (
            production.hour &&
            production.plan !== null &&
            production.plan !== undefined
          ) {
            this.hourPlans[production.hour] = production.plan.toString();
          }
        });
      }
    } catch (error) {
      console.error("Error checking existing productions:", error);
      this.error =
        error.message ||
        "Failed to check existing productions. Please try again.";
    } finally {
      this.isLoading = false;
    }
  }

  handleInputChange(hour, event) {
    // Only allow numbers
    const value = event.target.value.replace(/[^0-9]/g, "");

    this.hourPlans = {
      ...this.hourPlans,
      [hour]: value,
    };

    // Clear error when input changes
    this.error = "";
  }

  validateForm() {
    // Check if at least one hour has a plan
    const hasAtLeastOnePlan = Object.values(this.hourPlans).some(
      (plan) => plan !== ""
    );

    if (!hasAtLeastOnePlan) {
      this.error = "Please enter at least one hourly production plan";
      return false;
    }

    return true;
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    try {
      this.isSubmitting = true;
      this.error = "";

      // Convert hourPlans to an array of production plans
      const productionPlans = Object.entries(this.hourPlans)
        .filter(([_, value]) => value !== "")
        .map(([hour, plan]) => ({
          hour: hour,
          plan: parseInt(plan, 10),
          line_id: parseInt(this.lineId, 10),
          shift_id: parseInt(this.shiftId, 10),
        }));

      const response = await postJson("/api/planner/productions", {
        productions: productionPlans,
      });

      // Show success message
      this.success = true;

      // Redirect to shift page after a short delay
      setTimeout(() => {
        window.location.href = `/planner/shifts/${this.shiftId}`;
      }, 1500);
    } catch (error) {
      console.error("Error submitting production plans:", error);
      this.error =
        error.message || "Failed to submit production plans. Please try again.";
    } finally {
      this.isSubmitting = false;
    }
  }

  // Format hour: HOUR-01 to Hour 1
  formatHour(hour) {
    if (!hour) return "";

    const parts = hour.split("-");
    if (parts.length !== 2) return hour;

    const hourNumber = parts[1].replace(/^0+/, ""); // Remove leading zeros
    return `Hour ${hourNumber}`;
  }

  render() {
    if (this.isLoading) {
      return html`
        <div class="planner-schedule-loading">
          <i class="fas fa-spinner fa-spin"></i> Loading production data...
        </div>
      `;
    }

    if (this.success) {
      return html`
        <div class="planner-schedule-success">
          <div class="planner-schedule-success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3 class="planner-schedule-success-title">
            Production Schedule Saved Successfully!
          </h3>
          <p class="planner-schedule-success-message">
            Redirecting to shift page...
          </p>
        </div>
      `;
    }

    // Array of hours for easier rendering
    const hours = [
      "HOUR-01",
      "HOUR-02",
      "HOUR-03",
      "HOUR-04",
      "HOUR-05",
      "HOUR-06",
      "HOUR-07",
      "HOUR-08",
      "HOUR-09",
      "HOUR-10",
      "HOUR-11",
      "HOUR-12",
    ];

    const hasExistingProductions = this.existingProductions.length > 0;

    return html`
      <div class="planner-schedule-container">
        <div class="planner-schedule-header">
          <h2 class="planner-schedule-title">Production Schedule</h2>
          <button
            @click=${this.handleSubmit}
            class="planner-schedule-submit"
            ?disabled=${this.isSubmitting}
          >
            ${this.isSubmitting
              ? html` <i class="fas fa-spinner fa-spin"></i> Saving... `
              : html`
                  <i class="fas fa-save"></i> ${hasExistingProductions
                    ? "Update"
                    : "Create"}
                  Schedule
                `}
          </button>
        </div>

        ${this.error
          ? html`
              <div class="planner-schedule-error">
                <i class="fas fa-exclamation-circle"></i> ${this.error}
              </div>
            `
          : ""}
        ${hasExistingProductions
          ? html`
              <div class="planner-schedule-info">
                <i class="fas fa-info-circle"></i>
                <span
                  >You are updating an existing production schedule. Empty
                  fields will not overwrite existing plans.</span
                >
              </div>
            `
          : ""}

        <form class="planner-schedule-form" @submit=${this.handleSubmit}>
          <div class="planner-schedule-hours">
            ${hours.map(
              (hour) => html`
                <div class="planner-schedule-hour">
                  <label class="planner-schedule-hour-label" for="${hour}">
                    ${this.formatHour(hour)}
                  </label>
                  <div class="planner-schedule-hour-input-container">
                    <input
                      type="text"
                      id="${hour}"
                      class="planner-schedule-hour-input"
                      placeholder="Enter plan"
                      .value=${this.hourPlans[hour]}
                      @input=${(e) => this.handleInputChange(hour, e)}
                      ?disabled=${this.isSubmitting}
                    />
                  </div>
                </div>
              `
            )}
          </div>
        </form>
      </div>

      <style>
        .planner-schedule-container {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .planner-schedule-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .planner-schedule-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .planner-schedule-submit {
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

        .planner-schedule-submit:hover {
          background-color: #e5d900;
        }

        .planner-schedule-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .planner-schedule-error {
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

        .planner-schedule-info {
          background-color: rgba(52, 152, 219, 0.1);
          border-radius: 4px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .planner-schedule-info i {
          color: #3498db;
          font-size: 1rem;
        }

        .planner-schedule-hours {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }

        .planner-schedule-hour {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .planner-schedule-hour-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }

        .planner-schedule-hour-input-container {
          position: relative;
        }

        .planner-schedule-hour-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          font-size: 1rem;
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          transition: border-color 0.2s;
        }

        .planner-schedule-hour-input:focus {
          outline: none;
          border-color: #f7eb00;
          box-shadow: 0 0 0 2px rgba(247, 235, 0, 0.2);
        }

        .planner-schedule-hour-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .planner-schedule-hour-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .planner-schedule-loading {
          padding: 3rem;
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

        .planner-schedule-success {
          background-color: rgba(46, 204, 113, 0.1);
          border-radius: 8px;
          padding: 3rem 2rem;
          text-align: center;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }

        .planner-schedule-success-icon {
          font-size: 3rem;
          color: #2ecc71;
          margin-bottom: 1rem;
        }

        .planner-schedule-success-title {
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
        }

        .planner-schedule-success-message {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        @media (max-width: 640px) {
          .planner-schedule-hours {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .planner-schedule-hours {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
  }
}

customElements.define("planner-schedule-form", PlannerScheduleForm);
