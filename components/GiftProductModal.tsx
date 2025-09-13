import React, { useState } from 'react';
import { PublicUserProfile, Product } from '../types';
import { useDataStore } from '../stores/dataStore';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface GiftProductModalProps {
    user: PublicUserProfile;
    onClose: () => void;
}

const GiftProductModal: React.FC<GiftProductModalProps> = ({ user, onClose }) => {
    const { products, giftProductToUser } = useDataStore();
    
    const mutation = useMutation({
        mutationFn: (productId: string) => giftProductToUser(user.id, productId),
        onSuccess: () => {
            onClose();
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const handleGift = (product: Product) => {
        if (product.inventory > 0) {
            mutation.mutate(product.id);
        } else {
            toast.error("This product is out of stock.");
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-green-500/30 rounded-2xl w-full max-w-2xl text-white p-6 relative max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="font-title text-2xl font-bold text-green-300 mb-2 flex-shrink-0">Gift a Product</h2>
                <p className="text-gray-400 mb-4 flex-shrink-0">Select a product to send to <span className="font-bold text-white">{user.displayName}</span>.</p>

                <div className="flex-grow overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-3">
                    {products.map(product => (
                        <div key={product.id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                                <div>
                                    <p className="font-semibold text-white">{product.name}</p>
                                    <p className={`text-sm ${product.inventory > 0 ? 'text-gray-400' : 'text-red-400'}`}>
                                        {product.inventory} in stock
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleGift(product)}
                                disabled={product.inventory <= 0 || mutation.isPending}
                                className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
                            >
                                {mutation.isPending && mutation.variables === product.id ? 'Sending...' : 'Gift'}
                            </button>
                        </div>
                    ))}
                </div>

                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">&times;</button>
            </div>
        </div>
    );
};

export default GiftProductModal;