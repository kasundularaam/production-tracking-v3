// app/public/js/components/admin/admin-header.js

import { LitElement, html } from "https://esm.run/lit";
import { getUser, signOut } from "../../utils/auth_utils.js";

class AdminHeader extends LitElement {
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
      <header class="admin-header">
        <div class="admin-header-left">
          <div class="admin-logo">
            <img
              src="/static/images/michelin-logo.png"
              alt="Michelin Logo"
              class="admin-logo-img"
            />
          </div>
          <h1 class="admin-title">Production Tracking | ETD</h1>
        </div>

        <nav class="admin-header-nav">
          <a href="/admin" class="admin-nav-link">
            <i class="fas fa-tachometer-alt"></i> Dashboard
          </a>
          <a href="/admin/attendance-types" class="admin-nav-link">
            <i class="fas fa-calendar-check"></i> Attendance Types
          </a>
          <a href="/admin/loss-reasons" class="admin-nav-link">
            <i class="fas fa-exclamation-triangle"></i> Loss Reasons
          </a>
        </nav>

        <div class="admin-header-right">
          ${this.user
            ? html`
                <div class="admin-user">
                  <span class="admin-user-name">
                    <i class="fas fa-user-circle"></i> ${this.user.name}
                  </span>
                  <button
                    @click=${this.handleSignOut}
                    class="admin-signout-btn"
                  >
                    <i class="fas fa-sign-out-alt"></i> Sign Out
                  </button>
                </div>
              `
            : ""}
        </div>
      </header>

      <style>
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .admin-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-logo-img {
          height: 40px;
        }

        .admin-title {
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0;
          color: #ffffff;
        }

        .admin-header-nav {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .admin-nav-link:hover {
          color: #ffffff;
          background-color: rgba(255, 255, 255, 0.05);
        }

        .admin-nav-link.active {
          color: #f7eb00;
          background-color: rgba(247, 235, 0, 0.1);
        }

        .admin-header-right {
          display: flex;
          align-items: center;
        }

        .admin-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-user-name {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .admin-signout-btn {
          background-color: transparent;
          color: #f7eb00;
          border: 1px solid #f7eb00;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .admin-signout-btn:hover {
          background-color: #f7eb00;
          color: #131624;
        }

        @media (max-width: 1024px) {
          .admin-header {
            flex-wrap: wrap;
            gap: 1rem;
          }

          .admin-header-nav {
            order: 3;
            width: 100%;
            justify-content: center;
            margin-top: 0.5rem;
          }
        }

        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .admin-header-right {
            width: 100%;
            justify-content: flex-end;
          }

          .admin-header-nav {
            justify-content: flex-start;
            overflow-x: auto;
            width: 100%;
            padding-bottom: 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .admin-user {
            flex-direction: column;
            align-items: flex-end;
            gap: 0.5rem;
          }
        }
      </style>
    `;
  }
}

customElements.define("admin-header", AdminHeader);
