import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Child } from '../types';
import { Dialog } from '@headlessui/react';

export default function ManageChildrenPage() {
  const { token } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [newChild, setNewChild] = useState({
    name: '',
    birthdate: '',
    gender: '',
    avatar_url: ''
  });
  const [editingChild, setEditingChild] = useState({
    id: '',
    name: '',
    birthdate: '',
    gender: '',
    avatar_url: ''
  });

  // Fetch children on component mount
  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/children`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch children');
      }

      const data = await response.json();
      setChildren(data.children || []);
    } catch (err) {
      console.error('Error fetching children:', err);
      setError('Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/children/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newChild)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add child');
      }

      // Reset form and close modal
      setNewChild({
        name: '',
        birthdate: '',
        gender: '',
        avatar_url: ''
      });
      setIsAddModalOpen(false);
      
      // Refresh children list
      fetchChildren();
    } catch (err) {
      console.error('Error adding child:', err);
      setError(err instanceof Error ? err.message : 'Failed to add child');
    }
  };

  const handleEditChild = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/children/${editingChild.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingChild.name,
          birthdate: editingChild.birthdate,
          gender: editingChild.gender,
          avatar_url: editingChild.avatar_url
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update child');
      }

      // Close modal
      setIsEditModalOpen(false);
      
      // Refresh children list
      fetchChildren();
    } catch (err) {
      console.error('Error updating child:', err);
      setError(err instanceof Error ? err.message : 'Failed to update child');
    }
  };

  const handleDeleteChild = async () => {
    if (!selectedChild) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/children/${selectedChild.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete child');
      }

      // Close modal
      setIsDeleteModalOpen(false);
      setSelectedChild(null);
      
      // Refresh children list
      fetchChildren();
    } catch (err) {
      console.error('Error deleting child:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete child');
    }
  };

  const formatGender = (gender: string) => {
    if (!gender) return '';
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  const formatBirthdate = (birthdate: string) => {
    if (!birthdate) return '';
    // Parse the date parts directly to avoid timezone issues
    const [year, month, day] = birthdate.split('-').map(Number);
    // Month is 0-indexed in JavaScript Date
    return `${month}/${day}/${year}`;
  };

  const openEditModal = (child: Child) => {
    // Format the birthdate to YYYY-MM-DD for the date input
    const formattedBirthdate = child.birthdate 
      ? new Date(child.birthdate).toISOString().split('T')[0]
      : '';

    setEditingChild({
      id: child.id,
      name: child.name,
      birthdate: formattedBirthdate,
      gender: child.gender || '',
      avatar_url: child.avatar_url || ''
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (child: Child) => {
    setSelectedChild(child);
    setIsDeleteModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kidoova-accent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading text-gray-900">Manage Children</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-kidoova-accent text-white px-4 py-2 rounded-lg hover:bg-kidoova-green transition"
        >
          Add Child
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {children.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No children added yet. Add your first child to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <div key={child.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4 overflow-hidden">
                  {child.avatar_url ? (
                    <img src={child.avatar_url} alt={child.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-gray-500">{child.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{child.name}</h3>
                  <p className="text-gray-600">Age Range: {child.age_range}</p>
                  {child.gender && <p className="text-gray-600">Gender: {formatGender(child.gender)}</p>}
                  {child.birthdate && <p className="text-gray-600">Birthdate: {formatBirthdate(child.birthdate)}</p>}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => openEditModal(child)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(child)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Child Modal */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <Dialog.Title className="text-xl font-semibold mb-4">Add New Child</Dialog.Title>
            
            <form onSubmit={handleAddChild}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newChild.name}
                  onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birthdate
                </label>
                <input
                  type="date"
                  value={newChild.birthdate}
                  onChange={(e) => setNewChild({ ...newChild, birthdate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={newChild.gender}
                  onChange={(e) => setNewChild({ ...newChild, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL (Optional)
                </label>
                <input
                  type="text"
                  value={newChild.avatar_url}
                  onChange={(e) => setNewChild({ ...newChild, avatar_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-kidoova-accent text-white rounded-md hover:bg-kidoova-green"
                >
                  Add Child
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Edit Child Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <Dialog.Title className="text-xl font-semibold mb-4">Edit Child</Dialog.Title>
            
            <form onSubmit={handleEditChild}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editingChild.name}
                    onChange={(e) => setEditingChild({ ...editingChild, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kidoova-accent focus:ring-kidoova-accent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-birthdate" className="block text-sm font-medium text-gray-700">
                    Birthdate
                  </label>
                  <input
                    type="date"
                    id="edit-birthdate"
                    value={editingChild.birthdate}
                    onChange={(e) => setEditingChild({ ...editingChild, birthdate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kidoova-accent focus:ring-kidoova-accent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-gender" className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    id="edit-gender"
                    value={editingChild.gender}
                    onChange={(e) => setEditingChild({ ...editingChild, gender: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kidoova-accent focus:ring-kidoova-accent"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-avatar" className="block text-sm font-medium text-gray-700">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    id="edit-avatar"
                    value={editingChild.avatar_url}
                    onChange={(e) => setEditingChild({ ...editingChild, avatar_url: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-kidoova-accent focus:ring-kidoova-accent"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-kidoova-accent text-white rounded-md hover:bg-kidoova-accent-dark"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <Dialog.Title className="text-xl font-semibold mb-4">Confirm Removal</Dialog.Title>
            
            <p className="mb-4">
              Are you sure you want to remove {selectedChild?.name}? This action cannot be undone and will permanently delete all associated data.
            </p>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChild}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Yes, Remove
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 