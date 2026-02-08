// app/admin/users/page.tsx
'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { FiRefreshCw, FiUser, FiDatabase } from 'react-icons/fi';

export default function AdminUsersPage() {
  const [authUsers, setAuthUsers] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get current session user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get all profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Note: Can't directly query auth.users from client
      // So we'll use profiles as reference
      setProfiles(profilesData || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fixMissingProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please login as admin');
        return;
      }

      // This would need a server action or edge function
      // For now, just show alert
      alert('Use the SQL query in Supabase to fix profiles');
      
    } catch (error) {
      console.error('Error fixing profiles:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">👥 User Management</h1>
      
      <div className="flex gap-4 mb-6">
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
        
        <button 
          onClick={fixMissingProfiles}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <FiDatabase />
          Fix Missing Profiles
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <FiUser className="text-2xl text-blue-600" />
            <h3 className="text-lg font-semibold">Profiles in Database</h3>
          </div>
          <p className="text-3xl font-bold">{profiles.length}</p>
          <p className="text-sm text-gray-600 mt-2">Total user profiles</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <FiDatabase className="text-2xl text-green-600" />
            <h3 className="text-lg font-semibold">Status</h3>
          </div>
          <p className="text-lg font-semibold">
            {profiles.length > 0 ? '✅ System Active' : '⚠️ No Profiles'}
          </p>
          <p className="text-sm text-gray-600 mt-2">Trigger: {profiles.length > 0 ? 'Working' : 'Check Trigger'}</p>
        </div>
      </div>

      {/* Profiles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Profiles List</h3>
          <p className="text-sm text-gray-600">All user profiles in database</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px 6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {profile.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{profile.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      profile.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {profile.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No profiles found in database. Check trigger function.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Fix Instructions</h3>
        <ol className="list-decimal pl-5 space-y-2 text-yellow-700">
          <li>Go to Supabase SQL Editor</li>
          <li>Run the fix SQL query above</li>
          <li>Register a new user to test trigger</li>
          <li>Check profiles table for new entry</li>
        </ol>
      </div>
    </div>
  );
}