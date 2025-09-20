import React from 'react';
import { useDataStore } from '../stores/dataStore';
import { Product } from '../types';
import { VIEW_THEMES } from '../constants';
import useIsMobile from '../hooks/useIsMobile';
import MobileHeader from './MobileHeader';
import { useUserStore } from '../stores/userStore';
import toast from 'react-hot-toast';
import { useUIStore } from '../stores/uiStore';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const { user, bioTokens, purchaseProductWithBio } = useUserStore();
    const { openProductModal } = useUIStore();

    const handleBuyWithBio = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user || user.isAnonymous) {
            toast.error("Please sign in to make a purchase.");
            return;
        }
        purchaseProductWithBio(product);
    };
    
    const handleAffiliateClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const canBuyWithBio = user && !user.isAnonymous && product.priceInBioTokens && product.inventory > 0;
    const hasEnoughTokens = user && product.priceInBioTokens && bioTokens >= product.priceInBioTokens;

    return (
        <div 
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden flex flex-col group cursor-pointer"
            onClick={() => openProductModal(product)}
        >
            <div className="relative aspect-square w-full overflow-hidden">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <span className="absolute top-3 right-3 text-xs font-bold bg-gray-900/80 text-yellow-300 px-2 py-1 rounded-full border border-yellow-500/30">
                    {product.category}
                </span>
                {product.inventory <= 0 && (
                    <span className="absolute top-3 left-3 text-xs font-bold bg-red-900/80 text-red-300 px-2 py-1 rounded-full border border-red-500/30">
                        OUT OF STOCK
                    </span>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-title text-xl font-bold text-white">{product.name}</h3>
                <p className="text-sm text-gray-400 mt-1 mb-4 flex-grow">{product.description}</p>
                
                <div className="mt-auto pt-4 border-t border-gray-700/50">
                    <div className="space-y-2">
                         {canBuyWithBio && (
                            <button 
                                onClick={handleBuyWithBio}
                                disabled={!hasEnoughTokens}
                                className="w-full bg-purple-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-purple-500 transition-colors text-sm disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                                title={!hasEnoughTokens ? "Insufficient $BIO balance" : product.inventory <= 0 ? "Out of stock" : ""}
                            >
                                Buy with {product.priceInBioTokens!.toLocaleString()} $BIO
                            </button>
                        )}
                        <a 
                            href={product.affiliateLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={handleAffiliateClick}
                            className="block w-full text-center bg-transparent border border-yellow-500/50 text-yellow-300 font-bold py-2 px-4 rounded-lg hover:bg-yellow-500/10 transition-colors text-sm"
                        >
                            Buy for ${product.price} at {product.supplierName}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StorePanel: React.FC = () => {
    const { products } = useDataStore();
    const theme = VIEW_THEMES['store'];
    const isMobile = useIsMobile();

    const mainContent = (
        <>
            <div className="text-center mb-12">
                <h2 className={`font-title text-3xl md:text-4xl font-extrabold mb-2 ${theme.textColor}`}>Curated Store</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">A selection of the best biohacking equipment, diagnostics, and technology, vetted by the biostack team.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </>
    );

    if (isMobile) {
        return (
             <div className="h-full">
                <MobileHeader title="Store" />
                <div className="mobile-page-content custom-scrollbar p-4">
                    {mainContent}
                </div>
            </div>
        );
    }
    
    return (
        <div className="mx-auto max-w-7xl">
            {mainContent}
        </div>
    );
};

export default StorePanel;