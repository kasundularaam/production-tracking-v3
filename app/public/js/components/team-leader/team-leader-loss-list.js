// app/public/js/components/team-leader/team-leader-loss-list.js

import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class TeamLeaderLossList extends LitElement {
  static get properties() {
    return {
      currentShiftId: { type: String },
      currentHour: { type: String },
      productionId: { type: Number },
      losses: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
      totalLoss: { type: Number },
      explainedLoss: { type: Number },
      unexplainedLoss: { type: Number },
      showList: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.currentShiftId = null;
    this.currentHour = null;
    this.productionId = null;
    this.losses = [];
    this.loading = false;
    this.error = "";
    this.totalLoss = 0;
    this.explainedLoss = 0;
    this.unexplainedLoss = 0;
    this.showList = false;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();

    // Listen for hour selected events
    window.addEventListener(
      "hour-selected",
      this.handleHourSelected.bind(this)
    );

    // Listen for production saved events
    window.addEventListener(
      "production-saved",
      this.handleProductionSaved.bind(this)
    );

    // Listen for losses added events
    window.addEventListener("losses-added", this.handleLossesAdded.bind(this));
  }

  disconnectedCallback() {
    // Clean up event listeners
    window.removeEventListener(
      "hour-selected",
      this.handleHourSelected.bind(this)
    );
    window.removeEventListener(
      "production-saved",
      this.handleProductionSaved.bind(this)
    );
    window.removeEventListener(
      "losses-added",
      this.handleLossesAdded.bind(this)
    );
    super.disconnectedCallback();
  }

  handleHourSelected(e) {
    console.log("Loss list - Hour selected:", e.detail);

    // Immediately clear the list when shift/hour changes
    this.resetState();

    // Store current shift and hour
    this.currentShiftId = e.detail.shiftId;
    this.currentHour = e.detail.hour;

    // Check if there's production data with a loss
    this.checkForLoss(this.currentShiftId, this.currentHour);
  }

  resetState() {
    // Reset all state to default values
    this.productionId = null;
    this.losses = [];
    this.totalLoss = 0;
    this.explainedLoss = 0;
    this.unexplainedLoss = 0;
    this.showList = false;
  }

  handleProductionSaved(e) {
    console.log("Loss list - Production saved:", e.detail);

    if (e.detail && e.detail.productionId) {
      this.productionId = e.detail.productionId;
      this.totalLoss = e.detail.totalLoss || 0;

      // Only show and load losses if there's an actual loss
      if (this.totalLoss > 0) {
        this.showList = true;
        this.loadLosses();
      } else {
        this.showList = false;
      }
    }
  }

  handleLossesAdded(e) {
    console.log("Loss list - Losses added");
    if (this.productionId && this.showList) {
      this.loadLosses();
    }
  }

  async checkForLoss(shiftId, hour) {
    if (!shiftId || !hour) return;

    try {
      this.loading = true;
      console.log(
        `Loss list - Checking for loss (Shift: ${shiftId}, Hour: ${hour})`
      );

      try {
        // Try to get existing production data
        const data = await fetchJson(
          `/api/team-leader/production?shift_id=${shiftId}&hour=${hour}`
        );

        if (data && data.id) {
          console.log("Loss list - Found production data:", data);

          // Calculate if there's a loss
          const loss = data.plan - data.achievement;

          if (loss > 0) {
            // There's a loss, show the list and load losses
            console.log(`Loss list - Found loss: ${loss}`);
            this.productionId = data.id;
            this.totalLoss = loss;
            this.showList = true;
            this.loadLosses();
          } else {
            // No loss, hide the list
            console.log("Loss list - No loss found");
            this.showList = false;
          }
        } else {
          // No production data, hide the list
          console.log("Loss list - No production data found");
          this.showList = false;
        }
      } catch (error) {
        // Error loading production data, hide the list
        console.log("Loss list - Error loading production data:", error);
        this.showList = false;
      }
    } catch (error) {
      console.error("Loss list - Error checking for loss:", error);
      this.showList = false;
    } finally {
      this.loading = false;
    }
  }

  async loadLosses() {
    if (!this.productionId || !this.showList) {
      console.log(
        "Loss list - Not loading losses (no production ID or not showing list)"
      );
      return;
    }

    try {
      console.log(
        `Loss list - Loading losses for production ${this.productionId}`
      );
      this.loading = true;
      this.losses = await fetchJson(
        `/api/team-leader/production/${this.productionId}/losses`
      );

      console.log("Loss list - Loaded losses:", this.losses);

      // Calculate explained loss amount
      this.explainedLoss = this.losses.reduce(
        (sum, loss) => sum + loss.amount,
        0
      );

      // Calculate unexplained loss amount
      this.unexplainedLoss = this.totalLoss - this.explainedLoss;
    } catch (error) {
      console.error("Loss list - Error loading losses:", error);
      this.error = "Failed to load loss reasons";
      this.losses = [];
      this.explainedLoss = 0;
      this.unexplainedLoss = this.totalLoss;
    } finally {
      this.loading = false;
    }
  }

  render() {
    console.log(
      `Loss list rendering - Show list: ${this.showList}, Production ID: ${this.productionId}`
    );

    // Only show if both showList is true and we have a production ID
    if (!this.showList || !this.productionId) {
      return html``; // Return empty
    }

    if (this.loading && !this.losses.length) {
      return html`
        <div class="team-leader-loss-list">
          <div class="team-leader-loss-list-loading">
            <i class="fas fa-spinner fa-spin"></i> Loading loss reasons...
          </div>
        </div>
      `;
    }

    return html`
      <div class="team-leader-loss-list">
        <h3 class="team-leader-loss-list-title">
          <i class="fas fa-exclamation-triangle"></i> Production Loss Breakdown
        </h3>

        <div class="team-leader-loss-list-summary">
          <div class="team-leader-loss-list-summary-item">
            <span class="team-leader-loss-list-summary-label">Total Loss:</span>
            <span class="team-leader-loss-list-summary-value"
              >${this.totalLoss}</span
            >
          </div>
          <div class="team-leader-loss-list-summary-item">
            <span class="team-leader-loss-list-summary-label">Explained:</span>
            <span class="team-leader-loss-list-summary-value explained"
              >${this.explainedLoss}</span
            >
          </div>
          <div class="team-leader-loss-list-summary-item">
            <span class="team-leader-loss-list-summary-label"
              >Unexplained:</span
            >
            <span class="team-leader-loss-list-summary-value unexplained"
              >${this.unexplainedLoss}</span
            >
          </div>
        </div>

        ${this.error
          ? html`
              <div class="team-leader-loss-list-error">
                <i class="fas fa-exclamation-circle"></i> ${this.error}
              </div>
            `
          : ""}
        ${this.loading
          ? html`
              <div class="team-leader-loss-list-loading">
                <i class="fas fa-spinner fa-spin"></i> Loading loss reasons...
              </div>
            `
          : ""}
        ${!this.loading && this.losses.length === 0
          ? html`
              <div class="team-leader-loss-list-empty">
                <i class="fas fa-info-circle"></i> No loss reasons added yet
              </div>
            `
          : ""}
        ${!this.loading && this.losses.length > 0
          ? html`
              <div class="team-leader-loss-list-items">
                ${this.losses.map(
                  (loss) => html`
                    <div class="team-leader-loss-list-item">
                      <div class="team-leader-loss-list-item-amount">
                        <span class="team-leader-loss-list-item-amount-value"
                          >${loss.amount}</span
                        >
                        <span class="team-leader-loss-list-item-amount-label"
                          >units</span
                        >
                      </div>
                      <div class="team-leader-loss-list-item-reason">
                        <span class="team-leader-loss-list-item-reason-title"
                          >${loss.loss_reason.title}</span
                        >
                        <span
                          class="team-leader-loss-list-item-reason-department"
                          >${loss.loss_reason.department}</span
                        >
                      </div>
                    </div>
                  `
                )}
              </div>
            `
          : ""}
      </div>

      <style>
        .team-leader-loss-list {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .team-leader-loss-list-title {
          font-size: 1rem;
          font-weight: 500;
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .team-leader-loss-list-title i {
          color: #f7eb00;
        }

        .team-leader-loss-list-summary {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .team-leader-loss-list-summary-item {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .team-leader-loss-list-summary-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .team-leader-loss-list-summary-value {
          font-size: 1rem;
          font-weight: 600;
        }

        .team-leader-loss-list-summary-value.explained {
          color: #2ecc71;
        }

        .team-leader-loss-list-summary-value.unexplained {
          color: #e74c3c;
        }

        .team-leader-loss-list-error {
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

        .team-leader-loss-list-loading,
        .team-leader-loss-list-empty {
          padding: 2rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .team-leader-loss-list-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .team-leader-loss-list-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          border-left: 3px solid #f7eb00;
        }

        .team-leader-loss-list-item-amount {
          background-color: rgba(255, 255, 255, 0.1);
          padding: 0.5rem;
          border-radius: 4px;
          min-width: 80px;
          text-align: center;
          display: flex;
          flex-direction: column;
        }

        .team-leader-loss-list-item-amount-value {
          font-size: 1.125rem;
          font-weight: 600;
        }

        .team-leader-loss-list-item-amount-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .team-leader-loss-list-item-reason {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .team-leader-loss-list-item-reason-title {
          font-weight: 500;
        }

        .team-leader-loss-list-item-reason-department {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }
      </style>
    `;
  }
}

customElements.define("team-leader-loss-list", TeamLeaderLossList);
