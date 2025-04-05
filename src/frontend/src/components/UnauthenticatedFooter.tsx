import React from 'react';
import { Link } from 'react-router-dom';

const UnauthenticatedFooter: React.FC = () => {
  return (
    <footer className="bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Our Story */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Story</h3>
            <p className="text-gray-600 mb-4">
              It started with two kids—and two parents who wanted to do better.
            </p>
            <Link to="/our-story" className="text-gray-600 hover:text-gray-900">
              Learn More
            </Link>
          </div>

          {/* Team */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team</h3>
            <p className="text-gray-600 mb-4">
              We're a team of parents, educators, and child development researchers.
            </p>
            <Link to="/team" className="text-gray-600 hover:text-gray-900">
              Meet the Team
            </Link>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
            <p className="text-gray-600 mb-4">
              Need help? We're here for you.
            </p>
            <Link to="/support" className="text-gray-600 hover:text-gray-900">
              Get Support
            </Link>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/playbook" className="text-gray-600 hover:text-gray-900">
                  Confident Kids Playbook
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-gray-600 hover:text-gray-900">
                  Share Feedback
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex justify-center space-x-6">
            <Link to="/privacy-policy" className="text-gray-600 hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-gray-600 hover:text-gray-900">
              Terms of Service
            </Link>
          </div>
          <div className="mt-4 text-center text-gray-600">
            <p>&copy; 2024 Kidoova. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UnauthenticatedFooter; 