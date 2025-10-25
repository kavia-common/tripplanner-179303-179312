import React from 'react';

/**
 * PUBLIC_INTERFACE
 * OnboardingModal
 * A simple modal that introduces the user to the WanderPlan planner.
 */
function OnboardingModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="wp-modal-backdrop" role="dialog" aria-modal="true" aria-label="Onboarding">
      <div className="wp-modal">
        <h2 className="modal-title">Welcome to WanderPlan</h2>
        <p className="modal-body">
          Build your trip by dragging activities from the left into each day on the board.
          Your progress is saved locally in your browser.
        </p>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>Get Started</button>
        </div>
      </div>

      <style>{`
        .wp-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(17, 24, 39, 0.35);
          display: grid;
          place-items: center;
          padding: 16px;
          z-index: 50;
        }
        .wp-modal {
          width: 100%;
          max-width: 520px;
          background: var(--color-surface);
          color: var(--color-text);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          padding: 18px;
        }
        .modal-title {
          margin: 0 0 8px 0;
          font-size: 20px;
        }
        .modal-body {
          margin: 0 0 16px 0;
          color: var(--color-text-muted);
          font-size: 14px;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
        }
        .btn {
          appearance: none;
          border-radius: 8px;
          padding: 8px 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text);
          transition: transform .15s ease, box-shadow .2s ease, background .2s ease, color .2s ease, border-color .2s ease;
          box-shadow: var(--shadow-sm);
        }
        .btn-primary {
          background: var(--color-primary);
          color: #fff;
          border-color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}

export default OnboardingModal;
