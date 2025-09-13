import React from 'react';
import { useUIStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import toast from 'react-hot-toast';

const ProductDetailsModal: React.FC = () => {
  const { isProductModalOpen, viewingProduct, closeProductModal } = useUIStore();
  const { user, bioTokens, purchaseProductWithBio } = useUserStore();
  
  if (!isProductModalOpen || !viewingProduct) {
    return null;
  }

  const product = viewingProduct;

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[60] flex items-center justify-center p-4" onClick={closeProductModal}>
      <div 
        className="bg-gray-900 border border-gray-700/50 rounded-2xl w-full max-w-4xl text-white p-6 sm:p-8 relative max-h-[90vh] flex flex-col md:flex-row gap-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Column: Image */}
        <div className="md:w-1/2 flex-shrink-0">
          <div className="aspect-square w-full bg-gray-800 rounded-lg overflow-hidden">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:w-1/2 flex flex-col min-h-0">
          <div className="flex-grow overflow-y-auto custom-scrollbar -mr-4 pr-4">
            <span className="text-sm font-bold bg-gray-800 text-yellow-300 px-2 py-1 rounded-full border border-yellow-500/30">
              {product.category}
            </span>
            <h2 className="font-title text-3xl md:text-4xl font-extrabold text-white mt-3">{product.name}</h2>
            
            <div className="flex items-baseline gap-4 mt-3">
                <p className="text-3xl font-bold text-white">${product.price}</p>
                {product.priceInBioTokens && (
                    <p className="text-xl font-semibold text-purple-300">{product.priceInBioTokens.toLocaleString()} $BIO</p>
                )}
            </div>

            <p className="text-gray-400 mt-4 text-sm">{product.description}</p>
            
            {product.specs && product.specs.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold text-gray-200 mb-2">Key Features</h3>
                    <ul className="space-y-2">
                        {product.specs.map((spec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0 text-cyan-400 mt-px"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                <span>{spec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700/50 flex-shrink-0 space-y-3">
             {product.inventory > 0 ? (
                <p className="text-sm text-green-400">{product.inventory} in stock</p>
             ) : (
                <p className="text-sm text-red-400">Out of stock</p>
             )}
            <div className="space-y-2">
                {canBuyWithBio && (
                    <button 
                        onClick={handleBuyWithBio}
                        disabled={!hasEnoughTokens}
                        className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-500 transition-colors text-sm disabled:bg-gray-700 disabled:cursor-not-allowed"
                        title={!hasEnoughTokens ? "Insufficient $BIO balance" : ""}
                    >
                        Buy with {product.priceInBioTokens!.toLocaleString()} $BIO
                    </button>
                )}
                <a 
                    href={product.affiliateLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={handleAffiliateClick}
                    className="block w-full text-center bg-transparent border border-yellow-500/50 text-yellow-300 font-bold py-2.5 px-4 rounded-lg hover:bg-yellow-500/10 transition-colors text-sm"
                >
                    Buy for ${product.price} at {product.supplierName}
                </a>
            </div>
          </div>
        </div>

        <button onClick={closeProductModal} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">&times;</button>
      </div>
    </div>
  );
};

export default ProductDetailsModal;