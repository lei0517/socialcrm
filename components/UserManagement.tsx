import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/db';
import { ChevronLeft, Plus, Trash2, Shield, User as UserIcon } from 'lucide-react';

interface UserManagementProps {
  onBack: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
       const data = await db.getUsers();
       setUsers(data);
    } catch (e) {
       console.error(e);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.addUser(newUsername, newPassword);
      await loadUsers();
      setNewUsername('');
      setNewPassword('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('确定要删除此管理员吗？')) {
      await db.deleteUser(id);
      await loadUsers();
    }
  };

  const togglePermission = async (user: User) => {
    await db.updateUserPermission(user.id, !user.canViewAll);
    await loadUsers();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
       <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
               <ChevronLeft size={20} />
             </button>
             <h1 className="text-lg font-bold text-gray-900">团队权限管理</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Add User */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
           <h2 className="text-base font-bold text-gray-900 mb-6">添加新成员</h2>
           <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-4">
               <input 
                 value={newUsername}
                 onChange={e => setNewUsername(e.target.value)}
                 placeholder="用户名"
                 className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-black text-sm"
                 required
               />
               <input 
                 value={newPassword}
                 onChange={e => setNewPassword(e.target.value)}
                 placeholder="登录密码"
                 className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-black text-sm"
                 required
               />
               <button type="submit" className="bg-black text-white font-bold py-3 px-6 rounded-lg text-sm hover:bg-gray-800">
                 确认添加
               </button>
           </form>
        </div>

        {/* User List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-500 uppercase">管理员列表</h3>
           </div>
           {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
             <div className="divide-y divide-gray-100">
             {users.map((user) => (
               <div key={user.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm">
                        {user.username.charAt(0).toUpperCase()}
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">{user.username}</h3>
                          {user.role === UserRole.SUPER_ADMIN && <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded">超级管理员</span>}
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     {user.role !== UserRole.SUPER_ADMIN && (
                       <>
                          <div className="flex items-center gap-3">
                             <span className="text-xs text-gray-500 font-medium">查看全部数据</span>
                             <button 
                               onClick={() => togglePermission(user)}
                               className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${user.canViewAll ? 'bg-green-500 justify-end' : 'bg-gray-200 justify-start'}`}
                             >
                                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                             </button>
                          </div>
                          <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-gray-300 hover:text-red-600 rounded">
                            <Trash2 size={18} />
                          </button>
                       </>
                     )}
                  </div>
               </div>
             ))}
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default UserManagement;