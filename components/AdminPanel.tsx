import React, { useState, useMemo, useEffect } from 'react';
import { useDataStore } from '../stores/dataStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Protocol, PublicUserProfile, CommunityStack, PlatformConfig, Product, AdminTab, Feedback, AIResponseFeedback, Order, Coupon, UserSegment, ABTest, SocialIntegration, MailingListStats, MailingListEntry, ResearchBounty } from '../types';
import { VIEW_THEMES } from '../constants';
import ProtocolEditor from './ProtocolEditor';
import SystemHealthPanel from './SystemHealthPanel';
import ProductEditorModal from './ProductEditorModal';
import GiftProductModal from './GiftProductModal';
import GrowthEngineDashboard from './GrowthEngineDashboard';
import FeaturedContentManager from './FeaturedContentManager';
import SeoEditorModal from './SeoEditorModal';
import UserSegmentModal from './UserSegmentModal';
import DirectMessageModal from './DirectMessageModal';
import ABTestModal from './ABTestModal';
import { useUIStore } from '../stores/uiStore';
import AdminLaunchCopilot from './AdminLaunchCopilot';

const StatCard: React.FC<{ title: string, value: string | number, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-[#1C2128]/60 p-6 rounded-lg border border-gray-700/50">
        <div className="flex items-center gap-4">
            <div className="text-blue-400">{icon}</div>
            <div>
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-sm text-gray-400">{title}</p>
            </div>
        </div>
    </div>
);

const TABS: AdminTab[] = ['launch-plan', 'analytics', 'users', 'content', 'growth-engine', 'store-management', 'feedback', 'platform', 'system-health'];

// Helper Components (moved outside the main component)
const UserGrowthChart: React.FC = () => {
    const data = [
        { name: 'Jan', users: 65 }, { name: 'Feb', users: 59 }, { name: 'Mar', users: 80 },
        { name: 'Apr', users: 81 }, { name: 'May', users: 56 }, { name: 'Jun', users: 55 },
        { name: 'Jul', users: 90 }, { name: 'Aug', users: 110 }, { name: 'Sep', users: 135 },
    ];
    const maxVal = Math.max(...data.map(d => d.users), 1);
    return (
        <div className="bg-[#1C2128]/60 p-6 rounded-lg border border-gray-700/50 col-span-full">
            <h4 className="font-semibold text-white mb-4">User Growth (Simulated)</h4>
            <div className="flex justify-around items-end h-48">
                {data.map(item => (
                    <div key={item.name} className="flex flex-col items-center w-1/12 h-full justify-end" title={`${item.name}: ${item.users} users`}>
                        <div className="w-1/2 bg-blue-500 rounded-t-md hover:bg-blue-400 transition-colors" style={{ height: `${(item.users / maxVal) * 100}%` }}></div>
                        <span className="text-xs text-gray-400 mt-2">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TopCommunityStacks: React.FC<{ communityStacks: CommunityStack[] }> = ({ communityStacks }) => {
    const topStacks = [...communityStacks].sort((a,b) => b.upvotes - a.upvotes).slice(0, 3);
    return (
        <div className="bg-[#1C2128]/60 p-6 rounded-lg border border-gray-700/50 col-span-full">
            <h4 className="font-semibold text-white mb-4">Top Performing Community Stacks</h4>
            <ul className="space-y-3">
                {topStacks.map(stack => (
                    <li key={stack.id} className="text-sm flex justify-between items-center p-2 bg-gray-900/40 rounded-md">
                        <div>
                            <p className="font-semibold text-gray-200">{stack.name}</p>
                            <p className="text-xs text-gray-500">by {stack.author}</p>
                        </div>
                        <span className="font-bold text-blue-300">{stack.upvotes} upvotes</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const AnalyticsContent: React.FC = () => {
    const { allUsers, protocols, communityStacks, products } = useDataStore();
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard title="Total Users" value={allUsers.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 01-9-5.197" /></svg>} />
            <StatCard title="Official Protocols" value={protocols.filter(p => !p.isCommunity).length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} />
            <StatCard title="Community Stacks" value={communityStacks.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
            <StatCard title="Total Products" value={products.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} />
            <UserGrowthChart />
            <TopCommunityStacks communityStacks={communityStacks} />
        </div>
    );
};

const AdminPanel: React.FC = () => {
    const queryClient = useQueryClient();
    const { 
        protocols, allUsers, communityStacks, deleteCommunityStack, 
        updateProtocol, banUser, deleteProtocol, updatePlatformConfig, toggleUserAdminStatus,
        platformConfig, toggleStackVerification, products, deleteProduct, feedback,
        updateOrderStatus, createCoupon, updateContentSeo, userSegments, createUserSegment, orders, coupons, abTests,
        socialIntegrations, mailingListStats, connectSocialMedia, postToSocialMedia, sendEmailBlast, mailingList, researchBounties
    } = useDataStore();
    const { adminTab: activeTab, setAdminTab: setActiveTab, openResolveBountyModal } = useUIStore();

    const theme = VIEW_THEMES['admin'];
    const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | 'new' | null>(null);
    const [giftingUser, setGiftingUser] = useState<PublicUserProfile | null>(null);
    const [editingSeo, setEditingSeo] = useState<{ type: 'protocol' | 'stack', item: Protocol | CommunityStack } | null>(null);
    const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    
    const toggleAdminMutation = useMutation({
        mutationFn: ({ userId, currentStatus }: { userId: string, currentStatus: boolean }) => toggleUserAdminStatus(userId, currentStatus),
        onSuccess: () => {
            toast.success("User admin status updated.");
            queryClient.invalidateQueries({ queryKey: ['allUsers'] });
        },
        onError: () => toast.error("Failed to update admin status."),
    });

    const banUserMutation = useMutation({
        mutationFn: (userId: string) => banUser(userId),
        onSuccess: () => toast.success("User has been banned."),
        onError: () => toast.error("Failed to ban user."),
    });
    
    const promoteProtocolMutation = useMutation({
        mutationFn: (id: string) => updateProtocol({ id, isCommunity: false }),
        onSuccess: () => toast.success('Protocol promoted to official!'),
    });

    const deleteProtocolMutation = useMutation({
        mutationFn: (id: string) => deleteProtocol(id),
        onSuccess: () => toast.success('Community protocol deleted.'),
    });
    
    const deleteStackMutation = useMutation({
        mutationFn: (id: string) => deleteCommunityStack(id),
        onSuccess: () => toast.success('Community stack deleted.'),
    });

    const toggleVerifyMutation = useMutation({
        mutationFn: ({ stackId, currentStatus }: { stackId: string, currentStatus: boolean }) => toggleStackVerification(stackId, currentStatus),
    });

    const UserManagementContent: React.FC = () => (
        <div className="space-y-6">
            <div className="bg-[#1C2128]/60 p-4 rounded-lg border border-gray-700/50">
                <h4 className="font-semibold text-white mb-3">User Segmentation & Messaging</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setIsSegmentModalOpen(true)} className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-500">Create Segment</button>
                    <button onClick={() => setIsMessageModalOpen(true)} className="flex-1 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-500" disabled={userSegments.length === 0}>Message Segment</button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-400 uppercase bg-[#1C2128]/60">
                        <tr><th className="px-6 py-3">User</th><th className="px-6 py-3">Level/XP</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                        {allUsers.map(user => (
                            <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                                <td className="px-6 py-4 font-medium text-white">{user.displayName} <br/><span className="font-normal text-gray-500">{user.email}</span></td>
                                <td className="px-6 py-4">Lvl {user.level} ({user.totalXp} XP)</td>
                                <td className="px-6 py-4">{user.isBanned ? <span className="text-red-400">Banned</span> : user.isAdmin ? <span className="text-yellow-400">Admin</span> : 'Active'}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => setGiftingUser(user)} className="font-medium text-green-400 hover:underline">Gift</button>
                                    <button onClick={() => toggleAdminMutation.mutate({ userId: user.id, currentStatus: !!user.isAdmin })} className="font-medium text-yellow-400 hover:underline">{user.isAdmin ? 'Demote' : 'Promote'}</button>
                                    {!user.isBanned && <button onClick={() => banUserMutation.mutate(user.id)} className="font-medium text-red-400 hover:underline">Ban</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const ContentManagementContent: React.FC = () => {
         const communityProtocols = protocols.filter(p => p.isCommunity);
         return (
            <div className="space-y-8">
                <div>
                    <h4 className="font-semibold text-white mb-2">Community Submitted Protocols ({communityProtocols.length})</h4>
                    <div className="overflow-x-auto max-h-96 custom-scrollbar">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-400 uppercase bg-[#1C2128]/60 sticky top-0">
                                <tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">Submitted By</th><th className="px-6 py-3 text-right">Actions</th></tr>
                            </thead>
                            <tbody>
                                {communityProtocols.map(p => (
                                    <tr key={p.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                                        <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                                        <td className="px-6 py-4">{p.submittedBy}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => setEditingSeo({ type: 'protocol', item: p })} className="font-medium text-purple-400 hover:underline">SEO</button>
                                            <button onClick={() => setEditingProtocol(p)} className="font-medium text-blue-400 hover:underline">Review/Edit</button>
                                            <button onClick={() => promoteProtocolMutation.mutate(p.id)} className="font-medium text-green-400 hover:underline">Promote</button>
                                            <button onClick={() => deleteProtocolMutation.mutate(p.id)} className="font-medium text-red-400 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-white mb-2">Community Stacks ({communityStacks.length})</h4>
                    <div className="overflow-x-auto max-h-96 custom-scrollbar">
                         <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-400 uppercase bg-[#1C2128]/60 sticky top-0">
                                <tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">Author</th><th className="px-6 py-3">Upvotes</th><th className="px-6 py-3 text-right">Actions</th></tr>
                            </thead>
                            <tbody>
                                {communityStacks.map(s => (
                                    <tr key={s.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                                        <td className="px-6 py-4 font-medium text-white">{s.name}</td>
                                        <td className="px-6 py-4">{s.author}</td>
                                        <td className="px-6 py-4">{s.upvotes}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => setEditingSeo({ type: 'stack', item: s })} className="font-medium text-purple-400 hover:underline">SEO</button>
                                            <button onClick={() => toggleVerifyMutation.mutate({ stackId: s.id, currentStatus: !!s.isVerified })} className={`font-medium ${s.isVerified ? 'text-yellow-400' : 'text-green-400'} hover:underline`}>{s.isVerified ? 'Un-verify' : 'Verify'}</button>
                                            <button onClick={() => deleteStackMutation.mutate(s.id)} className="font-medium text-red-400 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-white mb-2">Research Bounties ({researchBounties.filter(b => b.status === 'active').length} Active)</h4>
                     <div className="overflow-x-auto max-h-96 custom-scrollbar">
                         <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-400 uppercase bg-[#1C2128]/60 sticky top-0">
                                <tr><th className="px-6 py-3">Question</th><th className="px-6 py-3">Author</th><th className="px-6 py-3">Stake</th><th className="px-6 py-3 text-right">Actions</th></tr>
                            </thead>
                            <tbody>
                                {researchBounties.filter(b => b.status === 'active').map(b => (
                                    <tr key={b.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                                        <td className="px-6 py-4 font-medium text-white w-1/2">{b.question}</td>
                                        <td className="px-6 py-4">{b.author}</td>
                                        <td className="px-6 py-4">{b.totalStake.toLocaleString()} $BIO</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openResolveBountyModal(b)} className="font-medium text-green-400 hover:underline">Resolve</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-white mb-2">Featured Content on Explore Page</h4>
                    <FeaturedContentManager />
                </div>
            </div>
         )
    };

    const StoreManagementContent: React.FC = () => {
        const [subTab, setSubTab] = useState<'products' | 'orders' | 'discounts'>('products');

        return (
            <div className="space-y-4">
                <div className="flex border-b border-gray-700/50">
                    <button onClick={() => setSubTab('products')} className={`px-3 py-1 text-sm rounded-t-md ${subTab === 'products' ? 'bg-[#1C2128]/60 border-gray-700/50 border-b-transparent border' : 'text-gray-400'}`}>Products</button>
                    <button onClick={() => setSubTab('orders')} className={`px-3 py-1 text-sm rounded-t-md ${subTab === 'orders' ? 'bg-[#1C2128]/60 border-gray-700/50 border-b-transparent border' : 'text-gray-400'}`}>Orders</button>
                    <button onClick={() => setSubTab('discounts')} className={`px-3 py-1 text-sm rounded-t-md ${subTab === 'discounts' ? 'bg-[#1C2128]/60 border-gray-700/50 border-b-transparent border' : 'text-gray-400'}`}>Discounts</button>
                </div>

                {subTab === 'products' && (
                    <>
                        <div className="text-right">
                            <button onClick={() => setEditingProduct('new')} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-500">Add New Product</button>
                        </div>
                        <div className="overflow-x-auto max-h-[60vh] custom-scrollbar">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-400 uppercase bg-[#1C2128]/60 sticky top-0">
                                    <tr><th className="px-6 py-3">Product</th><th className="px-6 py-3">Price</th><th className="px-6 py-3">Inventory</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Actions</th></tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                                            <td className="px-6 py-4 font-medium text-white flex items-center gap-4"><img src={product.imageUrl} className="w-10 h-10 rounded-md object-cover" /><span>{product.name}</span></td>
                                            <td className="px-6 py-4">${product.price.toFixed(2)} / {product.priceInBioTokens || 'N/A'} $BIO</td>
                                            <td className="px-6 py-4"><span className={`${product.inventory < 10 ? 'text-red-400' : 'text-white'}`}>{product.inventory}</span></td>
                                            <td className="px-6 py-4"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${product.isStripeSynced ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'}`}>{product.isStripeSynced ? 'Synced' : 'Not Synced'}</span></td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button onClick={() => setEditingProduct(product)} className="font-medium text-blue-400 hover:underline">Edit</button>
                                                <button onClick={() => deleteProduct(product.id)} className="font-medium text-red-400 hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                {subTab === 'orders' && (
                    <div className="overflow-x-auto max-h-[60vh] custom-scrollbar">
                         <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-400 uppercase bg-[#1C2128]/60 sticky top-0">
                                <tr><th className="px-6 py-3">Order ID</th><th className="px-6 py-3">Customer</th><th className="px-6 py-3">Product</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Actions</th></tr>
                            </thead>
                             <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                                        <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                                        <td className="px-6 py-4 font-medium text-white">{order.userName}</td>
                                        <td className="px-6 py-4">{order.productName}</td>
                                        <td className="px-6 py-4"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.status === 'Delivered' ? 'bg-green-900/50 text-green-300' : order.status === 'Shipped' ? 'bg-blue-900/50 text-blue-300' : 'bg-yellow-900/50 text-yellow-300'}`}>{order.status}</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => updateOrderStatus(order.id, 'Shipped', 'SIM123456789')} className="font-medium text-blue-400 hover:underline">Mark Shipped</button>
                                        </td>
                                    </tr>
                                ))}
                             </tbody>
                        </table>
                    </div>
                )}
                {subTab === 'discounts' && (
                    <div>
                         <div className="text-right mb-4">
                            <button onClick={() => createCoupon({ code: 'NEWYEAR25', discountType: 'percentage', discountValue: 25, expiresAt: new Date(), maxUses: 100 })} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-500">Create Coupon</button>
                        </div>
                         <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-400 uppercase bg-[#1C2128]/60 sticky top-0">
                                <tr><th className="px-6 py-3">Code</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Value</th><th className="px-6 py-3">Uses</th><th className="px-6 py-3">Status</th></tr>
                            </thead>
                             <tbody>
                                {coupons.map(coupon => (
                                    <tr key={coupon.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                                        <td className="px-6 py-4 font-mono font-semibold text-white">{coupon.code}</td>
                                        <td className="px-6 py-4">{coupon.discountType}</td>
                                        <td className="px-6 py-4">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}</td>
                                        <td className="px-6 py-4">{coupon.uses} / {coupon.maxUses || '∞'}</td>
                                        <td className="px-6 py-4"><span className={`text-xs font-bold ${coupon.isActive ? 'text-green-300' : 'text-gray-500'}`}>{coupon.isActive ? 'Active' : 'Inactive'}</span></td>
                                    </tr>
                                ))}
                             </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };
    
    const PlatformSettingsContent: React.FC = () => {
        const configMutation = useMutation({
            mutationFn: (config: Partial<PlatformConfig>) => updatePlatformConfig(config),
            onSuccess: () => toast.success("Platform settings updated."),
            onError: (error) => toast.error(`Failed to update settings: ${error.message}`),
        });

        if (!platformConfig) return <div>Loading config...</div>;

        const handleToggle = (key: keyof PlatformConfig) => {
            const currentValue = platformConfig[key];
            if (typeof currentValue === 'boolean' || currentValue === undefined) {
                configMutation.mutate({ [key]: !currentValue });
            }
        };

        return (
            <div className="space-y-4 max-w-2xl">
                 <div className="bg-[#1C2128]/60 p-4 rounded-lg border border-gray-700/50 flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold text-white">Enable AI Features</h4>
                        <p className="text-sm text-gray-400">Master switch for all Gemini-powered features.</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={platformConfig.isAiEnabled} onChange={() => handleToggle('isAiEnabled')} disabled={configMutation.isPending} />
                            <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${platformConfig.isAiEnabled ? 'translate-x-6 bg-blue-400' : ''}`}></div>
                        </div>
                    </label>
                </div>
                 <div className="bg-[#1C2128]/60 p-4 rounded-lg border border-gray-700/50 flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold text-white">Enable Store</h4>
                        <p className="text-sm text-gray-400">Toggles the visibility of the 'Store' tab for all users.</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={platformConfig.isStoreEnabled} onChange={() => handleToggle('isStoreEnabled')} disabled={configMutation.isPending} />
                            <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${platformConfig.isStoreEnabled ? 'translate-x-6 bg-blue-400' : ''}`}></div>
                        </div>
                    </label>
                </div>
                <div id="admin-walkthrough-toggle" className="bg-[#1C2128]/60 p-4 rounded-lg border border-gray-700/50 flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold text-white">Enable Guided Walkthrough</h4>
                        <p className="text-sm text-gray-400">If enabled, new users will see a guided tour on their first visit.</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={platformConfig.isGuidedWalkthroughEnabled} onChange={() => handleToggle('isGuidedWalkthroughEnabled')} disabled={configMutation.isPending} />
                            <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${platformConfig.isGuidedWalkthroughEnabled ? 'translate-x-6 bg-blue-400' : ''}`}></div>
                        </div>
                    </label>
                </div>
            </div>
        );
    };

    const FeedbackContent: React.FC = () => {
        const [filter, setFilter] = useState<'all' | 'ai' | 'general'>('all');
        const filteredFeedback = useMemo(() => {
            if (filter === 'ai') return feedback.filter(f => f.type === 'ai_response');
            if (filter === 'general') return feedback.filter(f => f.type !== 'ai_response');
            return feedback;
        }, [filter, feedback]);
        const formatTimestamp = (timestamp: any) => timestamp?.toDate ? timestamp.toDate().toLocaleString() : new Date(timestamp).toLocaleString();
        
        const renderAiResponsePreview = (response: any) => {
            const previewLength = 150;
            if (typeof response === 'string') {
                return response.substring(0, previewLength) + (response.length > previewLength ? '...' : '');
            }
            if (typeof response === 'object' && response !== null) {
                try {
                    const jsonString = JSON.stringify(response);
                    return jsonString.substring(0, previewLength) + (jsonString.length > previewLength ? '...' : '');
                } catch (e) {
                    return '[Unserializable Object]';
                }
            }
            return String(response).substring(0, previewLength);
        };
        
        return (
            <div className="space-y-4">
                <div className="flex gap-2">
                    <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm rounded-full ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700'}`}>All</button>
                    <button onClick={() => setFilter('ai')} className={`px-3 py-1 text-sm rounded-full ${filter === 'ai' ? 'bg-blue-600 text-white' : 'bg-slate-700'}`}>AI Responses</button>
                    <button onClick={() => setFilter('general')} className={`px-3 py-1 text-sm rounded-full ${filter === 'general' ? 'bg-blue-600 text-white' : 'bg-slate-700'}`}>General/Bugs</button>
                </div>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    {filteredFeedback.map(item => (
                        <div key={item.id} className="bg-[#1C2128]/60 p-4 rounded-lg border border-gray-700/50 text-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.rating === 'negative' ? 'bg-red-900/50 text-red-300' : item.rating === 'positive' ? 'bg-green-900/50 text-green-300' : 'bg-blue-900/50 text-blue-300'}`}>{item.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                    <p className="text-gray-400 mt-2">from <span className="font-semibold text-white">{item.userDisplayName}</span></p>
                                </div>
                                <span className="text-xs text-gray-500">{formatTimestamp(item.timestamp)}</span>
                            </div>
                            {item.comment && <p className="mt-2 p-2 bg-gray-900/50 rounded-md italic">"{item.comment}"</p>}
                            {item.type === 'ai_response' && (
                                <div className="mt-2 p-2 bg-black/30 rounded-md text-xs space-y-2">
                                    <p><strong className="text-gray-400">View:</strong> {(item as AIResponseFeedback).context.view}</p>
                                    <p><strong className="text-gray-400">AI Response:</strong> {renderAiResponsePreview((item as AIResponseFeedback).context.response)}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const GrowthEngineContent: React.FC = () => {
        const { growthEngineSubTab: subTab, setGrowthEngineSubTab: setSubTab } = useUIStore();
        const [isABTestModalOpen, setIsABTestModalOpen] = useState(false);
    
        const IntegrationsContent: React.FC = () => {
            const [socialPost, setSocialPost] = useState('');
            const [emailSubject, setEmailSubject] = useState('');
            const [emailBody, setEmailBody] = useState('');
            const [isShowingList, setIsShowingList] = useState(false);

            const connectSocialMutation = useMutation({ mutationFn: (platform: 'twitter' | 'discord') => connectSocialMedia(platform) });
            const postSocialMutation = useMutation({ mutationFn: (message: string) => postToSocialMedia(message), onSuccess: () => setSocialPost('') });
            const sendEmailMutation = useMutation({ mutationFn: (data: { subject: string, body: string }) => sendEmailBlast(data.subject, data.body), onSuccess: () => { setEmailSubject(''); setEmailBody(''); } });
    
            const exportMailingList = () => {
                const csvContent = "data:text/csv;charset=utf-8," + "email,subscribed_at\n" + mailingList.map(e => `${e.email},${e.subscribedAt.toISOString()}`).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `biohackstack_waitlist_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Mailing list exported!');
            };

            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Social Media */}
                    <div className="bg-[#1C2128]/60 p-4 rounded-lg border border-gray-700/50 space-y-4">
                        <h4 className="font-semibold text-white">Social Media Integrations</h4>
                        {socialIntegrations.map(si => (
                            <div key={si.platform} className="flex justify-between items-center bg-gray-900/50 p-3 rounded-md">
                                <div>
                                    <p className="font-semibold capitalize">{si.platform}</p>
                                    <p className="text-xs text-gray-400">{si.handle}</p>
                                </div>
                                <button onClick={() => connectSocialMutation.mutate(si.platform)} className={`px-3 py-1 text-xs font-bold rounded-md ${si.isConnected ? 'bg-red-800 text-red-200' : 'bg-blue-600 text-white'}`}>
                                    {si.isConnected ? 'Disconnect' : 'Connect'}
                                </button>
                            </div>
                        ))}
                        <div className="pt-4 border-t border-gray-700/50">
                            <textarea value={socialPost} onChange={e => setSocialPost(e.target.value)} rows={3} placeholder="Compose a post for all channels..." className="w-full bg-gray-800 p-2 rounded-md border border-gray-600 text-sm" />
                            <button onClick={() => postSocialMutation.mutate(socialPost)} disabled={postSocialMutation.isPending || !socialPost.trim()} className="w-full mt-2 bg-sky-500 text-white font-bold py-2 rounded-lg hover:bg-sky-400 text-sm disabled:bg-gray-600">Post to Channels</button>
                        </div>
                    </div>
                    {/* Mailing List */}
                     <div className="bg-[#1C2128]/60 p-4 rounded-lg border border-gray-700/50 space-y-4">
                         <h4 className="font-semibold text-white">Mailing List / Waitlist</h4>
                         <div className="flex justify-around text-center">
                            <div>
                                <p className="text-2xl font-bold">{mailingList.length.toLocaleString()}</p>
                                <p className="text-xs text-gray-400">Subscribers</p>
                            </div>
                         </div>
                         <div className="pt-4 border-t border-gray-700/50 space-y-2">
                             <div className="flex gap-4">
                                <button onClick={() => setIsShowingList(!isShowingList)} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-500 text-sm">
                                  {isShowingList ? 'Hide List' : 'View List'}
                                </button>
                                <button onClick={exportMailingList} className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-500 text-sm">
                                  Export CSV
                                </button>
                             </div>
                             {isShowingList && (
                                <div className="max-h-40 overflow-y-auto custom-scrollbar p-2 bg-black/30 rounded-md text-xs text-gray-400 space-y-1">
                                    {mailingList.map(entry => <div key={entry.email}><span>{entry.email}</span> - <span>{entry.subscribedAt.toLocaleDateString()}</span></div>)}
                                </div>
                             )}
                         </div>
                          <div className="pt-4 border-t border-gray-700/50">
                            <h5 className="font-semibold text-gray-300 text-sm mb-2">Email Campaign Composer</h5>
                            <input type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Email Subject" className="w-full bg-gray-800 p-2 rounded-md border border-gray-600 text-sm mb-2" />
                            <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={4} placeholder="Compose your email blast..." className="w-full bg-gray-800 p-2 rounded-md border border-gray-600 text-sm" />
                            <button onClick={() => sendEmailMutation.mutate({ subject: emailSubject, body: emailBody })} disabled={sendEmailMutation.isPending || !emailSubject.trim() || !emailBody.trim()} className="w-full mt-2 bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-500 text-sm disabled:bg-gray-600">Send Email Blast</button>
                        </div>
                    </div>
                </div>
            )
        };

        return (
            <div className="space-y-4">
                <div className="flex border-b border-gray-700/50">
                    <button onClick={() => setSubTab('dashboard')} className={`px-3 py-1 text-sm rounded-t-md ${subTab === 'dashboard' ? 'bg-[#1C2128]/60 border-gray-700/50 border-b-transparent border' : 'text-gray-400'}`}>AI Co-Pilot</button>
                    <button onClick={() => setSubTab('ab-testing')} className={`px-3 py-1 text-sm rounded-t-md ${subTab === 'ab-testing' ? 'bg-[#1C2128]/60 border-gray-700/50 border-b-transparent border' : 'text-gray-400'}`}>A/B Testing</button>
                    <button onClick={() => setSubTab('integrations')} className={`px-3 py-1 text-sm rounded-t-md ${subTab === 'integrations' ? 'bg-[#1C2128]/60 border-gray-700/50 border-b-transparent border' : 'text-gray-400'}`}>Integrations</button>
                </div>

                {isABTestModalOpen && <ABTestModal onClose={() => setIsABTestModalOpen(false)} />}

                {subTab === 'dashboard' && <GrowthEngineDashboard />}
                {subTab === 'integrations' && <IntegrationsContent />}
                {subTab === 'ab-testing' && (
                    <div>
                        <div className="text-right mb-4">
                            <button onClick={() => setIsABTestModalOpen(true)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-500">Create New Test</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {abTests.map(test => <div key={test.id}>A/B Test Card Placeholder</div>)}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'launch-plan': return <AdminLaunchCopilot />;
            case 'analytics': return <AnalyticsContent />;
            case 'users': return <UserManagementContent />;
            case 'content': return <ContentManagementContent />;
            case 'platform': return <PlatformSettingsContent />;
            case 'store-management': return <StoreManagementContent />;
            case 'system-health': return <SystemHealthPanel />;
            case 'growth-engine': return <GrowthEngineContent />;
            case 'feedback': return <FeedbackContent />;
            default: return <AnalyticsContent />;
        }
    };
    
    if (editingProtocol) return <ProtocolEditor protocol={editingProtocol} onClose={() => setEditingProtocol(null)} />;
    if (editingProduct !== null) return <ProductEditorModal product={editingProduct === 'new' ? null : editingProduct} onClose={() => setEditingProduct(null)} />;
    if (giftingUser) return <GiftProductModal user={giftingUser} onClose={() => setGiftingUser(null)} />;
    if (editingSeo) return <SeoEditorModal item={editingSeo.item} type={editingSeo.type} onClose={() => setEditingSeo(null)} />;
    if (isSegmentModalOpen) return <UserSegmentModal onClose={() => setIsSegmentModalOpen(false)} />;
    if (isMessageModalOpen) return <DirectMessageModal onClose={() => setIsMessageModalOpen(false)} />;

    return (
        <div className="mx-auto max-w-7xl">
            <div className="text-center mb-8">
                <h2 className={`font-title text-4xl font-extrabold mb-1 ${theme.textColor}`}>Command Center</h2>
                <p className="text-gray-400 text-sm">Platform Administration & Growth</p>
            </div>
             <div className="flex justify-center border-b border-gray-700/50 mb-6">
                {TABS.map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)} 
                        className={`px-4 py-2 text-sm font-semibold transition-colors capitalize ${activeTab === tab ? 'text-blue-300 border-b-2 border-blue-300' : 'text-gray-400 hover:text-white'}`}
                    >
                        {tab.replace(/-/g, ' ')}
                    </button>
                ))}
            </div>
            <main className="bg-black/20 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 min-h-[60vh]">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminPanel;