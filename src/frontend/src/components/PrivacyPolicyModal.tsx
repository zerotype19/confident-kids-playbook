import React from 'react';
import Modal from './Modal';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Privacy Policy">
      <div className="px-6 py-12 max-w-4xl mx-auto">
        <p className="mb-4">At Kidoova, your privacy is important to us. We collect only the necessary information to provide and improve our services, such as your email, child's age, and progress data. We do not sell your personal data to third parties, and we do not track or share any personal or behavioral data about children.</p>
        <p className="mb-4">We encourage families to feel comfortable using alternate names or birthdates for their children if they prefer. This will not affect functionality and your experience with the Kidoova app will remain the same.</p>
        <p className="mb-4">We use Google for authentication, and store challenge progress and XP securely using encrypted databases. By using our app, you consent to the collection and use of this information in accordance with this policy.</p>
        <p>If you have any questions or would like your data deleted, please email <a href="mailto:support@kidoova.com" className="text-kidoova-accent underline">support@kidoova.com</a>.</p>
      </div>
    </Modal>
  );
} 