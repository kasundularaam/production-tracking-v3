// app/public/js/components/planner/planner-new-shift-form.js

import { LitElement, html } from "https://esm.run/lit";
import { postJson } from "../../utils/api_utils.js";

class PlannerNewShiftForm extends LitElement {
  static get properties() {
    return {
      date: { type: String },
      dayNight: { type: String },
      shift: { type: String },
      isSubmitting: { type: Boolean },
      error: { type: String },
      success: { type: Boolean },
    };
  }

  constructor() {
    super();
    // Initialize with today's date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    this.date = `${year}-${month}-${day}`;
    this.dayNight = "DAY";
    this.shift = "SHIFT-A";
    this.isSubmitting = false;
    this.error = "";
    this.success = false;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  handleDateChange(e) {
    this.date = e.target.value;
    this.error = "";
  }

  handleDayNightChange(e) {
    this.dayNight = e.target.value;
    this.error = "";
  }

  handleShiftChange(e) {
    this.shift = e.target.value;
    this.error = "";
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!this.date) {
      this.error = "Date is required";
      return;
    }

    try {
      this.isSubmitting = true;
      this.error = "";

      const response = await postJson("/api/planner/shifts", {
        date: this.date,
        day_night: this.dayNight,
        shift: this.shift,
      });

      // Show success message
      this.success = true;

      // Reset form after a delay and refresh shift list
      setTimeout(() => {
        this.success = false;

        // Dispatch a custom event to notify shift list to refresh
        const event = new CustomEvent("shift-created", {
          detail: { shift: response },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      }, 2000);
    } catch (error) {
      console.error("Error creating shift:", error);
      this.error = error.message || "Failed to create shift. Please try again.";
    } finally {
      this.isSubmitting = false;
    }
  }

  render() {
    return html`
      <div class="planner-new-shift-form-container">
        <form @submit=${this.handleSubmit} class="planner-new-shift-form">
          ${this.error
            ? html`
                <div class="planner-new-shift-error">
                  <i class="fas fa-exclamation-circle"></i> ${this.error}
                </div>
              `
            : ""}
          ${this.success
            ? html`
                <div class="planner-new-shift-success">
                  <i class="fas fa-check-circle"></i> Shift created
                  successfully!
                </div>
              `
            : ""}

          <div class="planner-new-shift-fields">
            <div class="planner-new-shift-field">
              <label for="date" class="planner-new-shift-label">Date</label>
              <div class="planner-new-shift-input-container">
                <i class="fas fa-calendar-alt planner-new-shift-input-icon"></i>
                <input
                  type="date"
                  id="date"
                  class="planner-new-shift-input"
                  .value=${this.date}
                  @input=${this.handleDateChange}
                  ?disabled=${this.isSubmitting}
                />
              </div>
            </div>

            <div class="planner-new-shift-field">
              <label for="day-night" class="planner-new-shift-label"
                >Day/Night</label
              >
              <div class="planner-new-shift-input-container">
                <i class="fas fa-sun planner-new-shift-input-icon"></i>
                <select
                  id="day-night"
                  class="planner-new-shift-input"
                  .value=${this.dayNight}
                  @change=${this.handleDayNightChange}
                  ?disabled=${this.isSubmitting}
                >
                  <option value="DAY">Day</option>
                  <option value="NIGHT">Night</option>
                </select>
              </div>
            </div>

            <div class="planner-new-shift-field">
              <label for="shift" class="planner-new-shift-label">Shift</label>
              <div class="planner-new-shift-input-container">
                <i class="fas fa-clock planner-new-shift-input-icon"></i>
                <select
                  id="shift"
                  class="planner-new-shift-input"
                  .value=${this.shift}
                  @change=${this.handleShiftChange}
                  ?disabled=${this.isSubmitting}
                >
                  <option value="SHIFT-A">Shift A</option>
                  <option value="SHIFT-B">Shift B</option>
                  <option value="SHIFT-C">Shift C</option>
                </select>
              </div>
            </div>

            <div class="planner-new-shift-field">
              <button
                type="submit"
                class="planner-new-shift-submit"
                ?disabled=${this.isSubmitting}
              >
                ${this.isSubmitting
                  ? html` <i class="fas fa-spinner fa-spin"></i> Creating... `
                  : html` <i class="fas fa-plus"></i> Add Shift `}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>
        .planner-new-shift-form-container {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .planner-new-shift-error {
          background-color: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .planner-new-shift-success {
          background-color: rgba(46, 204, 113, 0.1);
          color: #2ecc71;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .planner-new-shift-fields {
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .planner-new-shift-field {
          flex: 1;
          min-width: 200px;
        }

        .planner-new-shift-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .planner-new-shift-input-container {
          position: relative;
        }

        .planner-new-shift-input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #f7eb00;
        }

        .planner-new-shift-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          font-size: 1rem;
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
          transition: border-color 0.2s;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }

        .planner-new-shift-input:focus {
          outline: none;
          border-color: #f7eb00;
          box-shadow: 0 0 0 2px rgba(247, 235, 0, 0.2);
        }

        .planner-new-shift-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .planner-new-shift-submit {
          background-color: #f7eb00;
          color: #131624;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          justify-content: center;
          height: 44px;
        }

        .planner-new-shift-submit:hover {
          background-color: #e5d900;
        }

        .planner-new-shift-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        select.planner-new-shift-input {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23f7eb00' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
          padding-right: 2.5rem;
        }

        select.planner-new-shift-input option {
          background-color: #131624;
          color: #ffffff;
        }

        @media (max-width: 768px) {
          .planner-new-shift-fields {
            flex-direction: column;
          }

          .planner-new-shift-field {
            width: 100%;
          }
        }
      </style>
    `;
  }
}

customElements.define("planner-new-shift-form", PlannerNewShiftForm);
