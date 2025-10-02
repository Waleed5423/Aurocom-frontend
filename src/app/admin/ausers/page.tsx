'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Button } from '@/components/ui/button';

export default function AdminUsersPage() {
  const { users, fetchUsers, updateUserStatus, updateUserRole, isLoading } = useAdminStore();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers({ page, limit: 10, search: searchTerm });
  }, [page, searchTerm]);

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserStatus(userId, !currentStatus);
      fetchUsers({ page, limit: 10, search: searchTerm });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      fetchUsers({ page, limit: 10, search: searchTerm });
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <Button type="submit">Search</Button>
          {searchTerm && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setSearchTerm('')}
            >
              Clear
            </Button>
          )}
        </div>
      </form>

      {isLoading ? (
        <div>Loading users...</div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user._id} className="border p-4 rounded">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold">{user.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                    {!user.isActive && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                    {!user.emailVerified && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Unverified
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-4 mt-2 text-sm">
                    <span>Orders: 0</span> {/* Would need to fetch order count */}
                    <span>Reviews: 0</span> {/* Would need to fetch review count */}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="border p-2 rounded text-sm"
                      disabled={user.role === 'super_admin'} // Prevent changing super_admin role
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                      {user.role === 'super_admin' && (
                        <option value="super_admin">Super Admin</option>
                      )}
                    </select>
                    <Button 
                      variant={user.isActive ? "destructive" : "default"}
                      onClick={() => handleStatusToggle(user._id, user.isActive)}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      View Orders
                    </Button>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <Button 
          disabled={page === 1} 
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">Page {page}</span>
        <Button onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>

      {users.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No users found matching your search.' : 'No users found.'}
        </div>
      )}
    </div>
  );
}