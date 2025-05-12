// app/public/js/components/team-leader/team-leader-shift-details.js

import { LitElement, html } from "https://esm.run/lit";
import { fetchJson, postJson } from "../../utils/api_utils.js";

class TeamLeaderShiftDetails extends LitElement {
  static get properties() {
    return {
      shiftId: { type: String },
      shiftDetails: { type: Object },
      selectedHour: { type: String },
      loading: { type: Boolean },
      submitting: { type: Boolean },
      error: { type: String },
    };
  }

  constructor() {
    super();
    this.shiftId = "";
    this.shiftDetails = null;
    this.selectedHour = "HOUR-01";
    this.loading = false;
    this.submitting = false;
    this.error = "";
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    // Listen for shift selection events
    window.addEventListener("shift-selected", (e) => {
      this.shiftId = e.detail.shiftId;
      this.loadShiftDetails();
    });

    // Check URL parameters for initial load
    const urlParams = new URLSearchParams(window.location.search);
    const shiftParam = urlParams.get("shift");
    const hourParam = urlParams.get("hour");

    if (shiftParam) {
      this.shiftId = shiftParam;
      await this.loadShiftDetails();
    }

    if (hourParam) {
      this.selectedHour = hourParam;
    }

    // Notify other components about the hour
    this.hourChanged();
  }

  async loadShiftDetails() {
    if (!this.shiftId) return;

    try {
      this.loading = true;
      this.error = "";
      this.shiftDetails = await fetchJson(
        `/api/team-leader/shifts/${this.shiftId}`
      );
    } catch (error) {
      console.error("Error loading shift details", error);
      this.error = "Failed to load shift details";
      this.shiftDetails = null;
    } finally {
      this.loading = false;
    }
  }

  handleHourChange(e) {
    this.selectedHour = e.target.value;

    // Update URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("hour", this.selectedHour);
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({}, "", newUrl);

    // Notify other components
    this.hourChanged();
  }

  hourChanged() {
    // Dispatch event for production cards component
    window.dispatchEvent(
      new CustomEvent("hour-selected", {
        detail: {
          hour: this.selectedHour,
          shiftId: this.shiftId,
        },
      })
    );
  }

  async handleSubmit() {
    try {
      this.submitting = true;
      this.error = "";

      // The production cards component will handle getting the production data
      // Dispatch event to get current production data from it
      const getDataEvent = new CustomEvent("get-production-data", {
        detail: { callback: this.submitProductionData.bind(this) },
      });

      window.dispatchEvent(getDataEvent);
    } catch (error) {
      console.error("Error submitting production data", error);
      this.error = "Failed to submit production data";
    } finally {
      this.submitting = false;
    }
  }

  async submitProductionData(productionData) {
    if (!productionData) {
      this.error = "No production data to submit";
      this.submitting = false;
      return;
    }

    try {
      // Submit the data
      await postJson("/api/team-leader/production", productionData);

      // Show success feedback
      const successToast = document.createElement("div");
      successToast.className = "team-leader-success-toast";
      successToast.innerHTML =
        '<i class="fas fa-check-circle"></i> Production data saved successfully!';
      document.body.appendChild(successToast);

      // Auto-remove toast after 3 seconds
      setTimeout(() => {
        successToast.classList.add("hide");
        setTimeout(() => document.body.removeChild(successToast), 300);
      }, 3000);
    } catch (error) {
      console.error("Error in production submission", error);
      this.error = error.message || "Failed to submit production data";
    } finally {
      this.submitting = false;
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  render() {
    if (this.loading) {
      return html`
        <div class="team-leader-shift-details-loading">
          <i class="fas fa-spinner fa-spin"></i> Loading shift details...
        </div>
      `;
    }

    if (!this.shiftDetails) {
      return html`
        <div class="team-leader-shift-details-empty">
          <i class="fas fa-info-circle"></i>
          Select a shift to view details
        </div>
      `;
    }

    return html`
      <div class="team-leader-shift-details">
        ${this.error
          ? html`
              <div class="team-leader-shift-details-error">
                <i class="fas fa-exclamation-circle"></i> ${this.error}
              </div>
            `
          : ""}

        <div class="team-leader-shift-details-card">
          <div class="team-leader-shift-details-info">
            <div class="team-leader-shift-date">
              <i class="fas fa-calendar-alt"></i>
              <span>${this.formatDate(this.shiftDetails.date)}</span>
            </div>

            <div class="team-leader-shift-type">
              <i
                class="fas fa-${this.shiftDetails.day_night === "DAY"
                  ? "sun"
                  : "moon"}"
              ></i>
              <span
                >${this.shiftDetails.shift}
                (${this.shiftDetails.day_night})</span
              >
            </div>

            <div class="team-leader-shift-plant">
              <i class="fas fa-industry"></i>
              <span>${this.shiftDetails.plant.name}</span>
            </div>
          </div>

          <div class="team-leader-shift-controls">
            <div class="team-leader-hour-selector">
              <label for="hour-select">Production Hour:</label>
              <select
                id="hour-select"
                class="team-leader-hour-select"
                .value=${this.selectedHour}
                @change=${this.handleHourChange}
              >
                <option value="HOUR-01">Hour 1</option>
                <option value="HOUR-02">Hour 2</option>
                <option value="HOUR-03">Hour 3</option>
                <option value="HOUR-04">Hour 4</option>
                <option value="HOUR-05">Hour 5</option>
                <option value="HOUR-06">Hour 6</option>
                <option value="HOUR-07">Hour 7</option>
                <option value="HOUR-08">Hour 8</option>
                <option value="HOUR-09">Hour 9</option>
                <option value="HOUR-10">Hour 10</option>
                <option value="HOUR-11">Hour 11</option>
                <option value="HOUR-12">Hour 12</option>
              </select>
            </div>

            <button
              class="team-leader-submit-button"
              @click=${this.handleSubmit}
              ?disabled=${this.submitting}
            >
              ${this.submitting
                ? html` <i class="fas fa-spinner fa-spin"></i> Saving... `
                : html` <i class="fas fa-save"></i> Save Production Data `}
            </button>
          </div>
        </div>
      </div>

      <style>
        .team-leader-shift-details {
          margin-bottom: 1.5rem;
        }

        .team-leader-shift-details-loading,
        .team-leader-shift-details-empty {
          padding: 2rem;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .team-leader-shift-details-error {
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

        .team-leader-shift-details-card {
          display: flex;
          justify-content: space-between;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .team-leader-shift-details-info {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .team-leader-shift-date,
        .team-leader-shift-type,
        .team-leader-shift-plant {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .team-leader-shift-date i,
        .team-leader-shift-type i,
        .team-leader-shift-plant i {
          color: #f7eb00;
        }

        .team-leader-shift-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .team-leader-hour-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .team-leader-hour-select {
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          color: #ffffff;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }

        .team-leader-hour-select:focus {
          outline: none;
          border-color: #f7eb00;
        }

        .team-leader-hour-select option {
          background-color: #131624;
          color: #ffffff;
        }

        .team-leader-submit-button {
          background-color: #f7eb00;
          color: #131624;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.2s;
        }

        .team-leader-submit-button:hover {
          background-color: #dbd400;
        }

        .team-leader-submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Success Toast */
        .team-leader-success-toast {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          background-color: rgba(46, 204, 113, 0.9);
          color: #ffffff;
          padding: 1rem 1.5rem;
          border-radius: 6px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          z-index: 1000;
          transform: translateY(0);
          opacity: 1;
          transition: transform 0.3s, opacity 0.3s;
        }

        .team-leader-success-toast.hide {
          transform: translateY(30px);
          opacity: 0;
        }
      </style>
    `;
  }
}

customElements.define("team-leader-shift-details", TeamLeaderShiftDetails);
