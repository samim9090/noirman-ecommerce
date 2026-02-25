import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import { PageSpinner } from '../../components/Skeleton';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/users?search=${search}`);
            setUsers(data.users);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, [search]);

    const handleToggleBlock = async (userId) => {
        try {
            const { data } = await api.put(`/api/users/${userId}/block`);
            toast.success(data.message);
            fetchUsers();
        } catch (e) { toast.error(e.response?.data?.message || 'Action failed'); }
    };

    return (
        <>
            <Helmet><title>Users — Admin — NOIR MAN</title></Helmet>
            <div>
                <div className="flex items-center justify-between mb-8">
                    <h1 className="font-heading text-3xl text-[#f5f0eb]">Users</h1>
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="bg-[#0a0a0a] border border-[rgba(201,168,76,0.2)] rounded px-4 py-2 text-sm text-[#f5f0eb] placeholder-[#9e9087] w-64 focus:outline-none focus:border-[#c9a84c]"
                    />
                </div>

                {loading ? <PageSpinner /> : (
                    <div className="bg-[#1e1a18] border border-[rgba(201,168,76,0.1)] rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[10px] tracking-widest uppercase text-[#9e9087] border-b border-[rgba(201,168,76,0.05)]">
                                        <th className="px-5 py-3 text-left">User</th>
                                        <th className="px-5 py-3 text-left">Role</th>
                                        <th className="px-5 py-3 text-left">Status</th>
                                        <th className="px-5 py-3 text-left">Joined</th>
                                        <th className="px-5 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id} className="border-b border-[rgba(201,168,76,0.04)] hover:bg-[rgba(201,168,76,0.02)]">
                                            <td className="px-5 py-3">
                                                <p className="text-sm font-medium text-[#f5f0eb]">{u.name}</p>
                                                <p className="text-xs text-[#9e9087]">{u.email}</p>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-[rgba(201,168,76,0.1)] text-[#c9a84c]' : 'bg-white/5 text-[#9e9087]'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs ${u.isBlocked ? 'text-red-400' : 'text-green-400'}`}>
                                                    {u.isBlocked ? 'Blocked' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-[#9e9087]">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                                            <td className="px-5 py-3 text-right">
                                                {u.role !== 'admin' && (
                                                    <button onClick={() => handleToggleBlock(u._id)}
                                                        className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border transition-all ${u.isBlocked ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : 'border-red-500/30 text-red-400 hover:bg-red-500/10'}`}>
                                                        {u.isBlocked ? <><Shield size={12} /> Unblock</> : <><ShieldOff size={12} /> Block</>}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && <p className="text-center py-10 text-[#9e9087] text-sm">No users found.</p>}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
