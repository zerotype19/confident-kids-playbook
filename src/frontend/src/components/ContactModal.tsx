import React from 'react';
import Modal from './Modal';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contact Us">
      <div className="px-6 py-12 max-w-2xl mx-auto text-center">
        <p className="mb-4">Have questions, feedback, or need help with your account? We're here to help.</p>
        <p className="text-lg">Email us at <a href="mailto:support@kidoova.com" className="text-kidoova-accent underline">support@kidoova.com</a> and we'll get back to you within 24–48 hours.</p>
      </div>
    </Modal>
  );
} 