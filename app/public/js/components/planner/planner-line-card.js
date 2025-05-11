// app/public/js/components/planner/planner-line-card.js

import { LitElement, html } from "https://esm.run/lit";

class PlannerLineCard extends LitElement {
  static get properties() {
    return {
      line: { type: Object },
      shiftId: { type: Number },
    };
  }

  constructor() {
    super();
    this.line = null;
    this.shiftId = null;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  render() {
    if (!this.line) return html``;

    const { id, name, loop } = this.line;
    const loopName = loop?.name || "Unknown Loop";
    const zoneName = loop?.zone?.name || "Unknown Zone";
    const plantName = loop?.zone?.plant?.name || "Unknown Plant";

    return html`
      <a
        href="/planner/schedule?line=${id}&shift=${this.shiftId}"
        class="planner-line-card"
      >
        <div class="planner-line-card-header">
          <div class="planner-line-card-name">
            <i class="fas fa-sitemap"></i>
            <span>${name}</span>
          </div>
        </div>

        <div class="planner-line-card-details">
          <div class="planner-line-card-detail">
            <i class="fas fa-industry"></i>
            <span>${plantName}</span>
          </div>

          <div class="planner-line-card-detail">
            <i class="fas fa-map-marker-alt"></i>
            <span>${zoneName}</span>
          </div>

          <div class="planner-line-card-detail">
            <i class="fas fa-code-branch"></i>
            <span>${loopName}</span>
          </div>
        </div>

        <div class="planner-line-card-action">
          <span class="planner-line-card-action-text">Schedule Line</span>
          <i class="fas fa-arrow-right"></i>
        </div>
      </a>

      <style>
        .planner-line-card {
          display: flex;
          flex-direction: column;
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          overflow: hidden;
          transition: all 0.2s;
        }

        .planner-line-card:hover {
          background-color: rgba(255, 255, 255, 0.07);
          transform: translateY(-3px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .planner-line-card-header {
          padding: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .planner-line-card-name {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .planner-line-card-name i {
          color: #f7eb00;
        }

        .planner-line-card-details {
          padding: 1.25rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .planner-line-card-detail {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
        }

        .planner-line-card-detail i {
          color: #f7eb00;
          width: 1rem;
          text-align: center;
        }

        .planner-line-card-action {
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: rgba(247, 235, 0, 0.1);
          color: #f7eb00;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .planner-line-card:hover .planner-line-card-action {
          background-color: rgba(247, 235, 0, 0.2);
        }
      </style>
    `;
  }
}

customElements.define("planner-line-card", PlannerLineCard);
