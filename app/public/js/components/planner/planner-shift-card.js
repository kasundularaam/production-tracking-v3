// Updated app/public/js/components/planner/planner-shift-card.js

import { LitElement, html } from "https://esm.run/lit";

class PlannerShiftCard extends LitElement {
  static get properties() {
    return {
      shift: { type: Object },
    };
  }

  constructor() {
    super();
    this.shift = null;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  // Format date: YYYY-MM-DD to DD MMM YYYY
  formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  // Format time: ISO string to HH:MM AM/PM
  formatTime(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Get avatar letter (first letter of name)
  getAvatarLetter(name) {
    if (!name) return "";
    return name.charAt(0).toUpperCase();
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
    if (!this.shift) return html``;

    const { id, date, day_night, shift, created_at, planner } = this.shift;
    const plannerName = planner?.user?.name || "Unknown";

    return html`
      <a href="/planner/shifts/${id}" class="planner-shift-card">
        <div class="planner-shift-card-date">
          <div class="planner-shift-card-date-icon">
            <i class="fas fa-calendar"></i>
          </div>
          <div class="planner-shift-card-date-text">
            ${this.formatDate(date)}
          </div>
        </div>

        <div class="planner-shift-card-shift">
          <div class="planner-shift-card-shift-icon">
            <i class="fas ${day_night === "DAY" ? "fa-sun" : "fa-moon"}"></i>
          </div>
          <div class="planner-shift-card-shift-text">
            ${this.formatDayNight(day_night)} / ${this.formatShiftType(shift)}
          </div>
        </div>

        <div class="planner-shift-card-creator">
          <div class="planner-shift-card-avatar">
            ${this.getAvatarLetter(plannerName)}
          </div>
          <div class="planner-shift-card-creator-details">
            <span class="planner-shift-card-creator-name">${plannerName}</span>
            <span class="planner-shift-card-creator-separator">•</span>
            <span class="planner-shift-card-created-at">
              <i class="fas fa-clock"></i>
              ${this.formatTime(created_at)}
            </span>
          </div>
        </div>
      </a>

      <style>
        .planner-shift-card {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
          padding: 1rem;
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
          align-items: center;
        }

        .planner-shift-card:hover {
          background-color: rgba(255, 255, 255, 0.07);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .planner-shift-card-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .planner-shift-card-date-icon {
          color: #f7eb00;
          font-size: 1rem;
        }

        .planner-shift-card-date-text {
          font-weight: 500;
        }

        .planner-shift-card-shift {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-self: center;
        }

        .planner-shift-card-shift-icon {
          color: #f7eb00;
          font-size: 1rem;
        }

        .planner-shift-card-shift-text {
          color: rgba(255, 255, 255, 0.9);
        }

        .planner-shift-card-creator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          justify-self: end;
        }

        .planner-shift-card-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background-color: #1e293b;
          color: #f7eb00;
          border-radius: 50%;
          font-weight: 600;
          flex-shrink: 0;
        }

        .planner-shift-card-creator-details {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .planner-shift-card-creator-name {
          font-weight: 500;
          font-size: 0.875rem;
        }

        .planner-shift-card-creator-separator {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.75rem;
        }

        .planner-shift-card-created-at {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
        }

        @media (max-width: 768px) {
          .planner-shift-card {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto;
          }

          .planner-shift-card-shift {
            justify-self: start;
          }

          .planner-shift-card-creator {
            grid-column: span 2;
            justify-self: start;
            margin-top: 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .planner-shift-card {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto;
          }

          .planner-shift-card-date,
          .planner-shift-card-shift,
          .planner-shift-card-creator {
            justify-self: start;
          }

          .planner-shift-card-creator {
            grid-column: 1;
          }
        }
      </style>
    `;
  }
}

customElements.define("planner-shift-card", PlannerShiftCard);
