import React from 'react';
import Modal from './Modal';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Terms of Service">
      <div className="px-6 py-12 max-w-4xl mx-auto">
        <p className="mb-4">By using Kidoova, you agree to follow our guidelines and use the platform only for personal, non-commercial use. You are responsible for any activity that occurs under your account.</p>
        <p className="mb-4">Kidoova is intended to support positive parenting and personal growth for children ages 3–13. We are not a medical or psychological service and should not be used as a substitute for professional advice.</p>
        <p className="mb-4">We reserve the right to modify or discontinue any part of the service at any time. We may update these terms, and continued use constitutes acceptance of any changes.</p>
      </div>
    </Modal>
  );
} 