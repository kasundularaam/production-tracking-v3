// app/public/js/components/team-leader/team-leader-production-cards.js

import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class TeamLeaderProductionCards extends LitElement {
  static get properties() {
    return {
      shiftId: { type: String },
      hour: { type: String },
      productionData: { type: Object },
      loading: { type: Boolean },
      error: { type: String },
      planFound: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.shiftId = "";
    this.hour = "HOUR-01";
    this.productionData = {
      plan: 0,
      achievement: 0,
      scraps: 0,
      defects: 0,
      flash: 0,
    };
    this.loading = false;
    this.error = "";
    this.planFound = false;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    // Listen for hour selection events
    window.addEventListener("hour-selected", async (e) => {
      console.log("Hour selected event received:", e.detail);
      this.shiftId = e.detail.shiftId;
      this.hour = e.detail.hour;
      await this.loadProductionData();
    });

    // Listen for shift selection events
    window.addEventListener("shift-selected", async (e) => {
      console.log("Shift selected event received:", e.detail);
      this.shiftId = e.detail.shiftId;
      await this.loadProductionData();
    });

    // Listen for get production data events (from submit button)
    window.addEventListener("get-production-data", (e) => {
      if (e.detail && e.detail.callback) {
        e.detail.callback({
          shift_id: parseInt(this.shiftId),
          hour: this.hour,
          ...this.productionData,
        });
      }
    });

    // Check URL parameters for initial load
    const urlParams = new URLSearchParams(window.location.search);
    const shiftParam = urlParams.get("shift");
    const hourParam = urlParams.get("hour");

    if (shiftParam) {
      this.shiftId = shiftParam;

      if (hourParam) {
        this.hour = hourParam;
      }

      await this.loadProductionData();
    }
  }

  async loadProductionData() {
    if (!this.shiftId || !this.hour) return;

    try {
      // Reset state before loading
      this.loading = true;
      this.error = "";
      this.planFound = false;

      // Reset production data
      this.productionData = {
        plan: 0,
        achievement: 0,
        scraps: 0,
        defects: 0,
        flash: 0,
      };

      // First, try to get existing production data
      try {
        const data = await fetchJson(
          `/api/team-leader/production?shift_id=${this.shiftId}&hour=${this.hour}`
        );

        // If production data exists, use it and we know plan is available
        if (data && data.id) {
          console.log("Found existing production data:", data);
          this.planFound = true;

          this.productionData = {
            plan: data.plan || 0,
            achievement: data.achievement || 0,
            scraps: data.scraps || 0,
            defects: data.defects || 0,
            flash: data.flash || 0,
          };
        } else {
          throw new Error("No production data found");
        }
      } catch (error) {
        // No existing data, check if plan exists
        console.log("No existing production data, checking for plan");

        try {
          const planData = await fetchJson(
            `/api/team-leader/production/plan?shift_id=${this.shiftId}&hour=${this.hour}`
          );

          if (planData && planData.plan) {
            console.log("Found production plan:", planData);
            this.planFound = true;
            this.productionData.plan = planData.plan;
          } else {
            console.log("No production plan found - empty response");
            this.planFound = false;
          }
        } catch (planError) {
          // 404 status indicates no plan found
          console.log("No production plan found - API returned 404");
          this.planFound = false;
        }
      }
    } catch (error) {
      console.error("Error loading production data:", error);
      this.error = "Failed to load production data";
      this.planFound = false;
    } finally {
      this.loading = false;
    }
  }

  handleInputChange(field, e) {
    // Don't allow changes to plan
    if (field === "plan") return;

    // Parse as number, default to 0
    const value = parseInt(e.target.value) || 0;

    // Update the specific field
    this.productionData = {
      ...this.productionData,
      [field]: value,
    };
  }

  render() {
    if (!this.shiftId || !this.hour) {
      return html`
        <div class="team-leader-production-empty">
          <i class="fas fa-info-circle"></i>
          Please select a shift and hour to view production data
        </div>

        <style>
          .team-leader-production-empty {
            padding: 3rem;
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
        </style>
      `;
    }

    if (this.loading) {
      return html`
        <div class="team-leader-production-loading">
          <i class="fas fa-spinner fa-spin"></i> Loading production data...
        </div>

        <style>
          .team-leader-production-loading {
            padding: 3rem;
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
        </style>
      `;
    }

    if (this.error) {
      return html`
        <div class="team-leader-production-error">
          <i class="fas fa-exclamation-circle"></i> ${this.error}
        </div>

        <style>
          .team-leader-production-error {
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
        </style>
      `;
    }

    if (!this.planFound) {
      return html`
        <div class="team-leader-production-not-available">
          <div class="team-leader-production-not-available-icon">
            <i class="fas fa-exclamation-circle"></i>
          </div>
          <h3 class="team-leader-production-not-available-title">
            Production Plan Not Available
          </h3>
          <p class="team-leader-production-not-available-message">
            The planner has not yet set a production plan for this shift and
            hour. Please check back later or contact your planner.
          </p>
        </div>

        <style>
          .team-leader-production-not-available {
            padding: 3rem;
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .team-leader-production-not-available-icon {
            font-size: 3rem;
            color: #f39c12;
            margin-bottom: 1rem;
          }

          .team-leader-production-not-available-title {
            font-size: 1.25rem;
            margin: 0 0 0.5rem 0;
          }

          .team-leader-production-not-available-message {
            color: rgba(255, 255, 255, 0.7);
            max-width: 500px;
            margin: 0 auto;
          }
        </style>
      `;
    }

    // Otherwise, show production cards
    return html`
      <div class="team-leader-production-cards">
        <div class="team-leader-production-notice">
          <i class="fas fa-info-circle"></i>
          ${this.productionData.achievement ||
          this.productionData.scraps ||
          this.productionData.defects ||
          this.productionData.flash
            ? `Production data has been recorded for this shift and hour. You can update the values below.`
            : `No production data has been recorded for this shift and hour yet. Please enter the values below.`}
        </div>

        <div class="team-leader-production-grid">
          <!-- Plan Card (Read-only) -->
          <div class="team-leader-production-card plan">
            <div class="team-leader-production-card-header">
              <i class="fas fa-clipboard-list"></i>
              <h3>Planned Production</h3>
            </div>
            <div class="team-leader-production-card-value read-only">
              <input type="text" value="${this.productionData.plan}" readonly />
              <div class="team-leader-production-card-hint">
                Set by planner (fixed)
              </div>
            </div>
          </div>

          <!-- Achievement Card -->
          <div class="team-leader-production-card achievement">
            <div class="team-leader-production-card-header">
              <i class="fas fa-trophy"></i>
              <h3>Achievement</h3>
            </div>
            <div class="team-leader-production-card-value">
              <input
                type="number"
                min="0"
                .value="${this.productionData.achievement}"
                @input=${(e) => this.handleInputChange("achievement", e)}
              />
              <div class="team-leader-production-card-hint">
                Actual units produced
              </div>
            </div>
          </div>

          <!-- Scraps Card -->
          <div class="team-leader-production-card scraps">
            <div class="team-leader-production-card-header">
              <i class="fas fa-trash-alt"></i>
              <h3>Scraps</h3>
            </div>
            <div class="team-leader-production-card-value">
              <input
                type="number"
                min="0"
                .value="${this.productionData.scraps}"
                @input=${(e) => this.handleInputChange("scraps", e)}
              />
              <div class="team-leader-production-card-hint">
                Discarded units
              </div>
            </div>
          </div>

          <!-- Defects Card -->
          <div class="team-leader-production-card defects">
            <div class="team-leader-production-card-header">
              <i class="fas fa-exclamation-triangle"></i>
              <h3>Defects</h3>
            </div>
            <div class="team-leader-production-card-value">
              <input
                type="number"
                min="0"
                .value="${this.productionData.defects}"
                @input=${(e) => this.handleInputChange("defects", e)}
              />
              <div class="team-leader-production-card-hint">
                Defective units
              </div>
            </div>
          </div>

          <!-- Flash Card -->
          <div class="team-leader-production-card flash">
            <div class="team-leader-production-card-header">
              <i class="fas fa-bolt"></i>
              <h3>Flash</h3>
            </div>
            <div class="team-leader-production-card-value">
              <input
                type="number"
                min="0"
                .value="${this.productionData.flash}"
                @input=${(e) => this.handleInputChange("flash", e)}
              />
              <div class="team-leader-production-card-hint">Flash units</div>
            </div>
          </div>
        </div>
      </div>

      <style>
        .team-leader-production-notice {
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

        .team-leader-production-notice i {
          color: #3498db;
          font-size: 1rem;
        }

        .team-leader-production-grid {
          display: flex;
          justify-content: space-between;
          flex-wrap: nowrap;
          gap: 1rem;
        }

        .team-leader-production-card {
          flex: 1;
          min-width: 0; /* Allow cards to shrink below content size if needed */
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.2s;
        }

        .team-leader-production-card:hover {
          transform: translateY(-3px);
        }

        .team-leader-production-card.plan {
          border-color: rgba(247, 235, 0, 0.3);
          background-color: rgba(247, 235, 0, 0.05);
        }

        .team-leader-production-card.achievement {
          border-color: rgba(46, 204, 113, 0.3);
          background-color: rgba(46, 204, 113, 0.05);
        }

        .team-leader-production-card.scraps {
          border-color: rgba(231, 76, 60, 0.3);
          background-color: rgba(231, 76, 60, 0.05);
        }

        .team-leader-production-card.defects {
          border-color: rgba(241, 196, 15, 0.3);
          background-color: rgba(241, 196, 15, 0.05);
        }

        .team-leader-production-card.flash {
          border-color: rgba(52, 152, 219, 0.3);
          background-color: rgba(52, 152, 219, 0.05);
        }

        .team-leader-production-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .team-leader-production-card-header i {
          font-size: 1.25rem;
        }

        .team-leader-production-card-header h3 {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .team-leader-production-card.plan
          .team-leader-production-card-header
          i {
          color: #f7eb00;
        }

        .team-leader-production-card.achievement
          .team-leader-production-card-header
          i {
          color: #2ecc71;
        }

        .team-leader-production-card.scraps
          .team-leader-production-card-header
          i {
          color: #e74c3c;
        }

        .team-leader-production-card.defects
          .team-leader-production-card-header
          i {
          color: #f1c40f;
        }

        .team-leader-production-card.flash
          .team-leader-production-card-header
          i {
          color: #3498db;
        }

        .team-leader-production-card-value {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .team-leader-production-card-value input {
          width: 100%;
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          padding: 0.75rem;
          font-size: 1.25rem;
          color: #ffffff;
          text-align: center;
          font-weight: 600;
        }

        .team-leader-production-card-value input:focus {
          outline: none;
          border-color: #f7eb00;
        }

        .team-leader-production-card-value.read-only input {
          opacity: 0.8;
          cursor: not-allowed;
        }

        .team-leader-production-card-hint {
          text-align: center;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 0.5rem;
        }
      </style>
    `;
  }
}

customElements.define(
  "team-leader-production-cards",
  TeamLeaderProductionCards
);
