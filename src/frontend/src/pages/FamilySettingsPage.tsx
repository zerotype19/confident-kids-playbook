import React, { useState, useEffect } from 'react';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import type { Family, FamilyMember } from '../types/index';

interface ApiResponse<T> {
  data: T;
  error?: string;
}

interface InviteResponse {
  success: boolean;
}

interface RemoveMemberResponse {
  success: boolean;
}

interface InviteRequest {
  email: string;
  role: 'owner' | 'member';
}

interface RemoveMemberRequest {
  member_id: string;
}

export const FamilySettingsPage: React.FC = () => {
  const { isFeatureEnabled } = useFeatureFlags();
  const [family, setFamily] = useState<Family | null>(null);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'member'>('member');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/family/view');
        if (!response.ok) throw new Error('Failed to fetch family data');
        const data: ApiResponse<Family> = await response.json();
        if (data.error) throw new Error(data.error);
        setFamily(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch family data');
      } finally {
        setLoading(false);
      }
    };

    if (isFeatureEnabled('premium.family_sharing')) {
      fetchFamily();
    }
  }, [isFeatureEnabled]);

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setError(null);
      setSuccessMessage(null);
      const request: InviteRequest = {
        email: inviteEmail.trim(),
        role: inviteRole
      };

      const response = await fetch('/api/family/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) throw new Error('Failed to send invitation');
      const data: ApiResponse<InviteResponse> = await response.json();
      if (data.error) throw new Error(data.error);
      setSuccessMessage('Invitation sent successfully');
      setInviteEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this family member?')) return;

    try {
      setError(null);
      setSuccessMessage(null);
      const request: RemoveMemberRequest = { member_id: memberId };

      const response = await fetch('/api/family/remove-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) throw new Error('Failed to remove family member');
      const data: ApiResponse<RemoveMemberResponse> = await response.json();
      if (data.error) throw new Error(data.error);
      setSuccessMessage('Family member removed successfully');
      setFamily((prev) => prev ? {
        ...prev,
        members: prev.members.filter((m) => m.id !== memberId)
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove family member');
    }
  };

  if (!isFeatureEnabled('premium.family_sharing')) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Family Sharing
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              This feature is available for premium members only.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading family settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">No family data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Family Settings
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Manage your family members and sharing settings
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Family Members</h2>
            <div className="space-y-3 sm:space-y-4">
              {family.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      {member.user_id}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 capitalize">
                      {member.role}
                    </p>
                  </div>
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Invite Family Member</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'owner' | 'member')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="member">Member</option>
                  <option value="owner">Owner</option>
                </select>
              </div>

              {successMessage && (
                <div className="text-sm text-green-600">{successMessage}</div>
              )}

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Send Invitation
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}; 