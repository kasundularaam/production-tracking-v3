// app/public/js/components/planner/planner-header.js

import { LitElement, html } from "https://esm.run/lit";
import { getUser, signOut } from "../../utils/auth_utils.js";

class PlannerHeader extends LitElement {
  static get properties() {
    return {
      user: { type: Object },
    };
  }

  constructor() {
    super();
    this.user = null;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.user = getUser();
  }

  handleSignOut(e) {
    e.preventDefault();
    signOut();
  }

  render() {
    return html`
      <header class="planner-header">
        <div class="planner-header-brand">
          <div class="planner-header-logo">
            <i class="fas fa-industry"></i>
          </div>
          <div class="planner-header-title">Production Tracking | ETD</div>
        </div>

        <div class="planner-header-user">
          ${this.user
            ? html`
                <div class="planner-header-user-name">${this.user.name}</div>
                <button
                  @click=${this.handleSignOut}
                  class="planner-header-signout"
                >
                  <i class="fas fa-sign-out-alt"></i> Sign Out
                </button>
              `
            : ""}
        </div>
      </header>

      <style>
        .planner-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .planner-header-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .planner-header-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background-color: #f7eb00;
          color: #131624;
          border-radius: 6px;
          font-size: 1.25rem;
        }

        .planner-header-title {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .planner-header-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .planner-header-user-name {
          font-weight: 500;
        }

        .planner-header-signout {
          background-color: transparent;
          color: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .planner-header-signout:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }
      </style>
    `;
  }
}

customElements.define("planner-header", PlannerHeader);
