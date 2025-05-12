// app/public/js/components/team-leader/team-leader-nav.js

import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class TeamLeaderNav extends LitElement {
  static get properties() {
    return {
      selectedDate: { type: String },
      shifts: { type: Array },
      selectedShiftId: { type: String },
      loading: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.selectedDate = this.formatDate(new Date());
    this.shifts = [];
    this.selectedShiftId = "";
    this.loading = false;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async firstUpdated() {
    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const shiftParam = urlParams.get("shift");

    if (shiftParam) {
      this.selectedShiftId = shiftParam;
    }

    // Load shifts for initial date
    await this.loadShifts();

    // If no shift was selected from URL, select the first one
    if (!this.selectedShiftId && this.shifts.length > 0) {
      this.selectShift(this.shifts[0].id);
    }

    // Listen for URL parameter changes
    window.addEventListener("url-params-initialized", (e) => {
      if (e.detail.shiftId) {
        this.selectedShiftId = e.detail.shiftId;
      }
    });
  }

  async handleDateChange(e) {
    this.selectedDate = e.target.value;

    // Clear selected shift
    this.selectedShiftId = "";

    // Load shifts for the new date
    await this.loadShifts();

    // Select first shift by default
    if (this.shifts.length > 0) {
      this.selectShift(this.shifts[0].id);
    }
  }

  async loadShifts() {
    try {
      this.loading = true;
      this.shifts = await fetchJson(
        `/api/team-leader/shifts?date=${this.selectedDate}`
      );
    } catch (error) {
      console.error("Error loading shifts", error);
      this.shifts = [];
    } finally {
      this.loading = false;
    }
  }

  selectShift(shiftId) {
    this.selectedShiftId = shiftId;

    // Update URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("shift", shiftId);

    // Keep the hour parameter if it exists
    const hour = urlParams.get("hour");
    if (!hour) {
      urlParams.set("hour", "HOUR-01"); // Default to first hour
    }

    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({}, "", newUrl);

    // Dispatch event for other components
    window.dispatchEvent(
      new CustomEvent("shift-selected", {
        detail: { shiftId },
      })
    );
  }

  getShiftLabel(shift) {
    const dateObj = new Date(shift.date);
    const timeStr = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${shift.shift} (${shift.day_night}) - ${timeStr}`;
  }

  render() {
    return html`
      <div class="team-leader-nav">
        <div class="team-leader-nav-section">
          <h3 class="team-leader-nav-title">
            <i class="fas fa-calendar-day"></i> Select Date
          </h3>
          <div class="team-leader-date-picker">
            <input
              type="date"
              .value=${this.selectedDate}
              @change=${this.handleDateChange}
              class="team-leader-date-input"
            />
          </div>
        </div>

        <div class="team-leader-nav-section">
          <h3 class="team-leader-nav-title">
            <i class="fas fa-clock"></i> Available Shifts
          </h3>

          ${this.loading
            ? html`
                <div class="team-leader-nav-loading">
                  <i class="fas fa-spinner fa-spin"></i> Loading shifts...
                </div>
              `
            : ""}
          ${!this.loading && this.shifts.length === 0
            ? html`
                <div class="team-leader-nav-empty">
                  <i class="fas fa-info-circle"></i>
                  No shifts available for this date
                </div>
              `
            : ""}

          <div class="team-leader-shifts-list">
            ${this.shifts.map(
              (shift) => html`
                <button
                  class="team-leader-shift-item ${this.selectedShiftId ==
                  shift.id
                    ? "selected"
                    : ""}"
                  @click=${() => this.selectShift(shift.id)}
                >
                  <div class="team-leader-shift-icon">
                    <i
                      class="fas fa-${shift.day_night === "DAY"
                        ? "sun"
                        : "moon"}"
                    ></i>
                  </div>
                  <div class="team-leader-shift-details">
                    <div class="team-leader-shift-name">
                      ${this.getShiftLabel(shift)}
                    </div>
                    <div class="team-leader-shift-plant">
                      ${shift.plant.name}
                    </div>
                  </div>
                  ${this.selectedShiftId == shift.id
                    ? html`
                        <div class="team-leader-shift-selected">
                          <i class="fas fa-check-circle"></i>
                        </div>
                      `
                    : ""}
                </button>
              `
            )}
          </div>
        </div>
      </div>

      <style>
        .team-leader-nav {
          padding: 1.5rem 1rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .team-leader-nav-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .team-leader-nav-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .team-leader-date-picker {
          width: 100%;
        }

        .team-leader-date-input {
          width: 100%;
          padding: 0.5rem;
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: #ffffff;
          font-size: 0.875rem;
        }

        .team-leader-date-input:focus {
          outline: none;
          border-color: #f7eb00;
        }

        .team-leader-nav-loading,
        .team-leader-nav-empty {
          padding: 1rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .team-leader-shifts-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .team-leader-shift-item {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          color: #ffffff;
          gap: 0.75rem;
        }

        .team-leader-shift-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .team-leader-shift-item.selected {
          background-color: rgba(247, 235, 0, 0.1);
          border-color: #f7eb00;
        }

        .team-leader-shift-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: #f7eb00;
        }

        .team-leader-shift-details {
          flex: 1;
        }

        .team-leader-shift-name {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .team-leader-shift-plant {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 0.25rem;
        }

        .team-leader-shift-selected {
          color: #f7eb00;
        }
      </style>
    `;
  }
}

customElements.define("team-leader-nav", TeamLeaderNav);
