// app/public/js/components/team-leader/team-leader-loss-modal.js

import { LitElement, html } from "https://esm.run/lit";
import { fetchJson, postJson } from "../../utils/api_utils.js";

class TeamLeaderLossModal extends LitElement {
  static get properties() {
    return {
      isOpen: { type: Boolean },
      productionId: { type: Number },
      planAmount: { type: Number },
      achievementAmount: { type: Number },
      lossReasons: { type: Array },
      losses: { type: Array },
      newLossEntries: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
      totalLoss: { type: Number },
    };
  }

  constructor() {
    super();
    this.isOpen = false;
    this.productionId = null;
    this.planAmount = 0;
    this.achievementAmount = 0;
    this.lossReasons = [];
    this.losses = [];
    this.newLossEntries = [{ amount: 0, loss_reason_id: "" }];
    this.loading = false;
    this.error = "";
    this.totalLoss = 0;
  }

  // Disable Shadow DOM to access global styles
  createRenderRoot() {
    return this;
  }

  async firstUpdated() {
    // Load loss reasons
    await this.loadLossReasons();
  }

  open(productionId, planAmount, achievementAmount) {
    this.productionId = productionId;
    this.planAmount = planAmount;
    this.achievementAmount = achievementAmount;
    this.totalLoss = planAmount - achievementAmount;
    this.newLossEntries = [{ amount: 0, loss_reason_id: "" }];
    this.error = "";

    // Load existing losses
    this.loadLosses();

    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  async loadLossReasons() {
    try {
      this.loading = true;
      this.lossReasons = await fetchJson("/api/team-leader/loss-reasons");
    } catch (error) {
      console.error("Error loading loss reasons:", error);
      this.error = "Failed to load loss reasons";
    } finally {
      this.loading = false;
    }
  }

  async loadLosses() {
    if (!this.productionId) return;

    try {
      this.loading = true;
      this.losses = await fetchJson(
        `/api/team-leader/production/${this.productionId}/losses`
      );
    } catch (error) {
      console.error("Error loading losses:", error);
      this.error = "Failed to load existing losses";
    } finally {
      this.loading = false;
    }
  }

  handleAmountChange(index, e) {
    const value = parseInt(e.target.value) || 0;
    this.newLossEntries = [
      ...this.newLossEntries.slice(0, index),
      { ...this.newLossEntries[index], amount: value },
      ...this.newLossEntries.slice(index + 1),
    ];
  }

  handleReasonChange(index, e) {
    const value = e.target.value;
    this.newLossEntries = [
      ...this.newLossEntries.slice(0, index),
      { ...this.newLossEntries[index], loss_reason_id: value },
      ...this.newLossEntries.slice(index + 1),
    ];
  }

  addNewLossEntry() {
    this.newLossEntries = [
      ...this.newLossEntries,
      { amount: 0, loss_reason_id: "" },
    ];
  }

  removeLossEntry(index) {
    this.newLossEntries = [
      ...this.newLossEntries.slice(0, index),
      ...this.newLossEntries.slice(index + 1),
    ];
  }

  async handleDeleteLoss(lossId) {
    try {
      this.loading = true;
      await fetch(`/api/team-leader/losses/${lossId}`, {
        method: "DELETE",
      });

      // Reload losses
      await this.loadLosses();

      // Notify other components that losses were updated
      this.dispatchEvent(new CustomEvent("losses-added"));
    } catch (error) {
      console.error("Error deleting loss:", error);
      this.error = "Failed to delete loss";
    } finally {
      this.loading = false;
    }
  }

  validateForm() {
    // Check if all entries have amount and reason
    const invalidEntries = this.newLossEntries.filter(
      (entry) => entry.amount <= 0 || !entry.loss_reason_id
    );

    if (invalidEntries.length > 0) {
      this.error = "All loss entries must have an amount and reason";
      return false;
    }

    // Calculate total new loss amount
    const newLossTotal = this.newLossEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    // Calculate existing loss amount
    const existingLossTotal = this.losses.reduce(
      (sum, loss) => sum + loss.amount,
      0
    );

    // Check if total exceeds available loss amount
    if (newLossTotal + existingLossTotal > this.totalLoss) {
      this.error = `Total loss amount cannot exceed ${this.totalLoss}. Current total: ${existingLossTotal}, New total: ${newLossTotal}`;
      return false;
    }

    return true;
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    try {
      this.loading = true;
      this.error = "";

      // Submit each loss entry
      for (const entry of this.newLossEntries) {
        await postJson("/api/team-leader/losses", {
          amount: entry.amount,
          loss_reason_id: parseInt(entry.loss_reason_id),
          production_id: this.productionId,
        });
      }

      // Reload losses
      await this.loadLosses();

      // Reset form
      this.newLossEntries = [{ amount: 0, loss_reason_id: "" }];

      // Notify parent that losses were added
      this.dispatchEvent(new CustomEvent("losses-added"));

      // Close the modal
      this.close();
    } catch (error) {
      console.error("Error submitting losses:", error);
      this.error = error.message || "Failed to submit loss data";
    } finally {
      this.loading = false;
    }
  }

  getRemainingLossAmount() {
    const existingLossTotal = this.losses.reduce(
      (sum, loss) => sum + loss.amount,
      0
    );
    return this.totalLoss - existingLossTotal;
  }

  getLossReasonTitle(id) {
    const reason = this.lossReasons.find(
      (reason) => reason.id === parseInt(id)
    );
    return reason ? reason.title : "";
  }

  render() {
    if (!this.isOpen) {
      return html``;
    }

    const remainingLoss = this.getRemainingLossAmount();

    return html`
      <div class="team-leader-loss-modal-backdrop">
        <div class="team-leader-loss-modal">
          <div class="team-leader-loss-modal-header">
            <h2 class="team-leader-loss-modal-title">
              <i class="fas fa-exclamation-triangle"></i> Production Loss
            </h2>
            <button class="team-leader-loss-modal-close" @click=${this.close}>
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="team-leader-loss-modal-body">
            <div class="team-leader-loss-modal-summary">
              <div class="team-leader-loss-modal-summary-item">
                <span class="team-leader-loss-modal-summary-label">Plan:</span>
                <span class="team-leader-loss-modal-summary-value"
                  >${this.planAmount}</span
                >
              </div>
              <div class="team-leader-loss-modal-summary-item">
                <span class="team-leader-loss-modal-summary-label"
                  >Achievement:</span
                >
                <span class="team-leader-loss-modal-summary-value"
                  >${this.achievementAmount}</span
                >
              </div>
              <div class="team-leader-loss-modal-summary-item">
                <span class="team-leader-loss-modal-summary-label"
                  >Total Loss:</span
                >
                <span class="team-leader-loss-modal-summary-value total-loss"
                  >${this.totalLoss}</span
                >
              </div>
              <div class="team-leader-loss-modal-summary-item">
                <span class="team-leader-loss-modal-summary-label"
                  >Remaining to Explain:</span
                >
                <span
                  class="team-leader-loss-modal-summary-value remaining-loss"
                  >${remainingLoss}</span
                >
              </div>
            </div>

            ${this.error
              ? html`
                  <div class="team-leader-loss-modal-error">
                    <i class="fas fa-exclamation-circle"></i> ${this.error}
                  </div>
                `
              : ""}

            <div class="team-leader-loss-modal-existing">
              <h3 class="team-leader-loss-modal-section-title">
                <i class="fas fa-list"></i> Existing Loss Reasons
              </h3>

              ${this.loading
                ? html`
                    <div class="team-leader-loss-modal-loading">
                      <i class="fas fa-spinner fa-spin"></i> Loading...
                    </div>
                  `
                : ""}
              ${!this.loading && this.losses.length === 0
                ? html`
                    <div class="team-leader-loss-modal-empty">
                      <i class="fas fa-info-circle"></i> No loss reasons added
                      yet
                    </div>
                  `
                : ""}
              ${!this.loading && this.losses.length > 0
                ? html`
                    <div class="team-leader-loss-modal-existing-list">
                      ${this.losses.map(
                        (loss) => html`
                          <div class="team-leader-loss-modal-existing-item">
                            <div class="team-leader-loss-modal-existing-amount">
                              <span
                                class="team-leader-loss-modal-existing-amount-value"
                                >${loss.amount}</span
                              >
                              <span
                                class="team-leader-loss-modal-existing-amount-label"
                                >units</span
                              >
                            </div>
                            <div class="team-leader-loss-modal-existing-reason">
                              <span
                                class="team-leader-loss-modal-existing-reason-title"
                                >${loss.loss_reason.title}</span
                              >
                              <span
                                class="team-leader-loss-modal-existing-reason-department"
                                >${loss.loss_reason.department}</span
                              >
                            </div>
                            <button
                              class="team-leader-loss-modal-existing-delete"
                              @click=${() => this.handleDeleteLoss(loss.id)}
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        `
                      )}
                    </div>
                  `
                : ""}
            </div>

            <div class="team-leader-loss-modal-new">
              <h3 class="team-leader-loss-modal-section-title">
                <i class="fas fa-plus-circle"></i> Add New Loss Reasons
              </h3>

              <form
                class="team-leader-loss-modal-form"
                @submit=${this.handleSubmit}
              >
                ${this.newLossEntries.map(
                  (entry, index) => html`
                    <div class="team-leader-loss-modal-form-row">
                      <div class="team-leader-loss-modal-form-field">
                        <label class="team-leader-loss-modal-form-label"
                          >Amount</label
                        >
                        <input
                          type="number"
                          min="1"
                          max="${remainingLoss}"
                          class="team-leader-loss-modal-form-input"
                          .value=${entry.amount}
                          @input=${(e) => this.handleAmountChange(index, e)}
                          ?disabled=${this.loading}
                          required
                        />
                      </div>

                      <div class="team-leader-loss-modal-form-field">
                        <label class="team-leader-loss-modal-form-label"
                          >Reason</label
                        >
                        <select
                          class="team-leader-loss-modal-form-select"
                          .value=${entry.loss_reason_id}
                          @change=${(e) => this.handleReasonChange(index, e)}
                          ?disabled=${this.loading}
                          required
                        >
                          <option value="">Select Loss Reason</option>
                          ${this.lossReasons.map(
                            (reason) => html`
                              <option value="${reason.id}">
                                ${reason.title} (${reason.department})
                              </option>
                            `
                          )}
                        </select>
                      </div>

                      ${this.newLossEntries.length > 1
                        ? html`
                            <button
                              type="button"
                              class="team-leader-loss-modal-form-remove"
                              @click=${() => this.removeLossEntry(index)}
                              ?disabled=${this.loading}
                            >
                              <i class="fas fa-minus-circle"></i>
                            </button>
                          `
                        : ""}
                      ${index === this.newLossEntries.length - 1
                        ? html`
                            <button
                              type="button"
                              class="team-leader-loss-modal-form-add"
                              @click=${this.addNewLossEntry}
                              ?disabled=${this.loading || remainingLoss <= 0}
                            >
                              <i class="fas fa-plus-circle"></i>
                            </button>
                          `
                        : ""}
                    </div>
                  `
                )}

                <div class="team-leader-loss-modal-form-actions">
                  <button
                    type="button"
                    class="team-leader-loss-modal-form-cancel"
                    @click=${this.close}
                    ?disabled=${this.loading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    class="team-leader-loss-modal-form-submit"
                    ?disabled=${this.loading || remainingLoss <= 0}
                  >
                    ${this.loading
                      ? html` <i class="fas fa-spinner fa-spin"></i> Saving... `
                      : html` <i class="fas fa-save"></i> Save Loss Reasons `}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>
        .team-leader-loss-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .team-leader-loss-modal {
          background-color: #131624;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
        }

        .team-leader-loss-modal-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .team-leader-loss-modal-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .team-leader-loss-modal-title i {
          color: #f7eb00;
        }

        .team-leader-loss-modal-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .team-leader-loss-modal-close:hover {
          color: #ffffff;
        }

        .team-leader-loss-modal-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .team-leader-loss-modal-summary {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          padding: 1rem;
        }

        .team-leader-loss-modal-summary-item {
          flex: 1;
          min-width: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .team-leader-loss-modal-summary-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .team-leader-loss-modal-summary-value {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .team-leader-loss-modal-summary-value.total-loss {
          color: #e74c3c;
        }

        .team-leader-loss-modal-summary-value.remaining-loss {
          color: #f39c12;
        }

        .team-leader-loss-modal-error {
          background-color: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .team-leader-loss-modal-section-title {
          font-size: 1rem;
          font-weight: 500;
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .team-leader-loss-modal-section-title i {
          color: #f7eb00;
        }

        .team-leader-loss-modal-loading,
        .team-leader-loss-modal-empty {
          padding: 1.5rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          background-color: rgba(255, 255, 255, 0.02);
          border-radius: 6px;
        }

        .team-leader-loss-modal-existing-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .team-leader-loss-modal-existing-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          border-left: 3px solid #f7eb00;
        }

        .team-leader-loss-modal-existing-amount {
          background-color: rgba(255, 255, 255, 0.1);
          padding: 0.5rem;
          border-radius: 4px;
          min-width: 80px;
          text-align: center;
          display: flex;
          flex-direction: column;
        }

        .team-leader-loss-modal-existing-amount-value {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .team-leader-loss-modal-existing-amount-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .team-leader-loss-modal-existing-reason {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .team-leader-loss-modal-existing-reason-title {
          font-weight: 500;
        }

        .team-leader-loss-modal-existing-reason-department {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .team-leader-loss-modal-existing-delete {
          background-color: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .team-leader-loss-modal-existing-delete:hover {
          background-color: rgba(231, 76, 60, 0.2);
        }

        .team-leader-loss-modal-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .team-leader-loss-modal-form-row {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
        }

        .team-leader-loss-modal-form-field {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .team-leader-loss-modal-form-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .team-leader-loss-modal-form-input,
        .team-leader-loss-modal-form-select {
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 0.75rem;
          color: #ffffff;
          font-size: 0.875rem;
        }

        .team-leader-loss-modal-form-input:focus,
        .team-leader-loss-modal-form-select:focus {
          outline: none;
          border-color: #f7eb00;
        }

        .team-leader-loss-modal-form-select option {
          background-color: #131624;
          color: #ffffff;
        }

        .team-leader-loss-modal-form-remove,
        .team-leader-loss-modal-form-add {
          background: none;
          border: none;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          cursor: pointer;
        }

        .team-leader-loss-modal-form-remove {
          color: #e74c3c;
        }

        .team-leader-loss-modal-form-add {
          color: #2ecc71;
        }

        .team-leader-loss-modal-form-remove:disabled,
        .team-leader-loss-modal-form-add:disabled {
          color: rgba(255, 255, 255, 0.2);
          cursor: not-allowed;
        }

        .team-leader-loss-modal-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
        }

        .team-leader-loss-modal-form-cancel {
          background-color: rgba(255, 255, 255, 0.1);
          border: none;
          color: #ffffff;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .team-leader-loss-modal-form-cancel:hover {
          background-color: rgba(255, 255, 255, 0.15);
        }

        .team-leader-loss-modal-form-submit {
          background-color: #f7eb00;
          color: #131624;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: background-color 0.2s;
        }

        .team-leader-loss-modal-form-submit:hover {
          background-color: #e5d900;
        }

        .team-leader-loss-modal-form-submit:disabled {
          background-color: rgba(247, 235, 0, 0.4);
          cursor: not-allowed;
        }
      </style>
    `;
  }
}

customElements.define("team-leader-loss-modal", TeamLeaderLossModal);
