// app/public/js/components/team-leader/team-leader-header.js

import { LitElement, html } from "https://esm.run/lit";
import { fetchJson } from "../../utils/api_utils.js";

class TeamLeaderHeader extends LitElement {
  static get properties() {
    return {
      teamLeaderName: { type: String },
      activeTab: { type: String },
    };
  }

  constructor() {
    super();
    this.teamLeaderName = "";
    this.activeTab = "production";
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    try {
      const userData = await fetchJson("/api/team-leader/me");
      this.teamLeaderName = userData.name;
    } catch (error) {
      console.error("Error fetching team leader data", error);
    }
  }

  switchTab(tab) {
    this.activeTab = tab;

    // Navigate to the appropriate page
    if (tab === "production") {
      // Stay on the dashboard
    } else if (tab === "attendance") {
      window.location.href = "/team-leader/attendance";
    }
  }

  handleSignout() {
    // Clear any auth tokens
    localStorage.removeItem("auth_token");
    // Redirect to login page
    window.location.href = "/login";
  }

  render() {
    return html`
      <header class="team-leader-header">
        <div class="team-leader-header-left">
          <div class="team-leader-header-logo">
            <i class="fas fa-industry"></i>
          </div>
          <div class="team-leader-header-title">Production Tracking | ETD</div>
        </div>

        <div class="team-leader-header-center">
          <div class="team-leader-header-tabs">
            <button
              class="team-leader-header-tab ${this.activeTab === "production"
                ? "active"
                : ""}"
              @click=${() => this.switchTab("production")}
            >
              <i class="fas fa-chart-line"></i>
              Production
            </button>
            <button
              class="team-leader-header-tab ${this.activeTab === "attendance"
                ? "active"
                : ""}"
              @click=${() => this.switchTab("attendance")}
            >
              <i class="fas fa-user-check"></i>
              Attendance
            </button>
          </div>
        </div>

        <div class="team-leader-header-right">
          <div class="team-leader-header-user">
            <i class="fas fa-user-circle"></i>
            <span>${this.teamLeaderName}</span>
          </div>
          <button
            class="team-leader-header-signout"
            @click=${this.handleSignout}
          >
            <i class="fas fa-sign-out-alt"></i>
            Sign Out
          </button>
        </div>
      </header>

      <style>
        .team-leader-header {
          background-color: #131624;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.75rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 60px;
        }

        .team-leader-header-left {
          display: flex;
          align-items: center;
        }

        .team-leader-header-logo {
          font-size: 1.5rem;
          color: #f7eb00;
          margin-right: 1rem;
        }

        .team-leader-header-title {
          font-weight: 600;
          font-size: 1.125rem;
        }

        .team-leader-header-center {
          display: flex;
        }

        .team-leader-header-tabs {
          display: flex;
          gap: 1rem;
        }

        .team-leader-header-tab {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .team-leader-header-tab:hover {
          color: #ffffff;
          background-color: rgba(255, 255, 255, 0.05);
        }

        .team-leader-header-tab.active {
          color: #131624;
          background-color: #f7eb00;
          font-weight: 500;
        }

        .team-leader-header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .team-leader-header-user {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .team-leader-header-signout {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #ffffff;
          font-size: 0.75rem;
          padding: 0.375rem 0.75rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.2s;
        }

        .team-leader-header-signout:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
      </style>
    `;
  }
}

customElements.define("team-leader-header", TeamLeaderHeader);
