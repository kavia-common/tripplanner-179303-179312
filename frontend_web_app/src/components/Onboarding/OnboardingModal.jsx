import React, { useEffect, useRef } from 'react';
import './Onboarding.css';

/**
 * PUBLIC_INTERFACE
 * OnboardingModal
 * A simple modal that introduces the user to the WanderPlan planner.
 */
function OnboardingModal({ open, onClose }) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (open) {
      // focus primary action for accessibility
      setTimeout(() => btnRef.current?.focus(), 0);
      const onKey = (e) => {
        if (e.key === 'Escape') onClose?.();
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="wp-modal-backdrop" role="dialog" aria-modal="true" aria-label="Onboarding">
      <div className="wp-modal">
        <h2 className="modal-title">Welcome to WanderPlan</h2>
        <p className="modal-body">
          Create activities on the left, then drag them into days on your board.
          Everything saves automatically in your browser.
        </p>
        <div className="modal-actions">
          <button ref={btnRef} className="btn btn-primary" onClick={onClose}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;
