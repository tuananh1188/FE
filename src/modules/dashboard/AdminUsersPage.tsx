import React, { useEffect, useState } from 'react';
import { adminUserApi } from './api/user.api';
import type { UserResponse } from './api/user.api';
import { toast } from 'sonner';
import { Loader2, ShieldAlert, ShieldCheck, Lock, Unlock, Trash2, User, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';


export const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await adminUserApi.getAllUsers();
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (userId: string, currentRole: 'admin' | 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await adminUserApi.updateUserRole(userId, newRole);
      if (res.data.success) {
        toast.success(`User role updated to ${newRole}`);
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update role');
    }
  };

  const handleToggleBlock = async (userId: string) => {
    try {
      const res = await adminUserApi.toggleBlockUser(userId);
      if (res.data.success) {
        toast.success(res.data.message);
        setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to toggle block status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const res = await adminUserApi.deleteUser(userId);
      if (res.data.success) {
        toast.success(res.data.message);
        setUsers(users.filter(u => u._id !== userId));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete user');
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{user.displayName || 'No Name'}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {user.isBlocked ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-black bg-red-100 text-red-700 w-fit flex items-center gap-1">
                          <Lock size={10} /> Blocked
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-black bg-green-100 text-green-700 w-fit flex items-center gap-1">
                          <ShieldCheck size={10} /> Active
                        </span>
                      )}
                      {!user.isEmailVerified && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-black bg-yellow-100 text-yellow-700 w-fit">
                          Unverified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-sm font-bold ${user.role === 'admin' ? 'text-purple-600' : 'text-gray-600'}`}>
                      {user.role === 'admin' ? <ShieldCheck size={16} /> : <User size={16} />}
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleRole(user._id, user.role)}
                        className={`h-9 rounded-lg font-bold text-xs border-2 transition-all ${user.role === 'admin' ? 'text-gray-500 border-gray-100 hover:bg-gray-50' : 'text-purple-600 border-purple-100 hover:bg-purple-50 hover:border-purple-200'}`}
                      >
                        {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      </Button>
                      
                      {user.role !== 'admin' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleBlock(user._id)}
                            className={`h-9 px-3 rounded-lg font-bold border-2 transition-all ${user.isBlocked ? 'text-green-600 border-green-100 hover:bg-green-50 hover:border-green-200' : 'text-red-500 border-red-50/50 hover:bg-red-50 hover:border-red-100'}`}
                            title={user.isBlocked ? 'Unlock this user' : 'Block this user'}
                          >
                            {user.isBlocked ? <Unlock size={16} /> : <Lock size={16} />}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user._id)}
                            className="h-9 px-3 rounded-lg text-gray-400 border-gray-100 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all border-2"
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
