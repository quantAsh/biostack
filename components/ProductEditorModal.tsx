import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useDataStore } from '../stores/dataStore';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ProductEditorModalProps {
    product: Product | null;
    onClose: () => void;
}

const emptyProduct: Omit<Product, 'id'> = {
    name: '',
    description: '',
    category: 'Tech',
    price: 0,
    priceInBioTokens: 0,
    imageUrl: '',
    affiliateLink: '',
    inventory: 0,
    stripeProductId: '',
    stripePriceId: '',
    isStripeSynced: false,
    supplierName: '',
    supplierSku: '',
    shippingWeight: 0,
    shippingDimensions: { length: 0, width: 0, height: 0 },
    fulfillmentService: 'self',
};

const ProductEditorModal: React.FC<ProductEditorModalProps> = ({ product, onClose }) => {
    const { addProduct, updateProduct } = useDataStore();
    const [formData, setFormData] = useState<Omit<Product, 'id'>>(emptyProduct);

    useEffect(() => {
        if (product) {
            setFormData({ ...emptyProduct, ...product });
        } else {
            setFormData(emptyProduct);
        }
    }, [product]);

    const mutation = useMutation({
        mutationFn: (data: Product | Omit<Product, 'id'>) => {
            if ('id' in data) {
                return updateProduct(data);
            }
            return addProduct(data);
        },
        onSuccess: () => {
            toast.success(`Product ${product ? 'updated' : 'created'} successfully!`);
            onClose();
        },
        onError: (error: Error) => toast.error(`Error: ${error.message}`),
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            shippingDimensions: {
                ...(prev.shippingDimensions || { length: 0, width: 0, height: 0 }),
                [name]: parseFloat(value) || 0
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSubmit = product ? { ...formData, id: product.id } : formData;
        mutation.mutate(dataToSubmit);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-green-500/30 rounded-2xl w-full max-w-3xl text-white p-6 relative max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="font-title text-2xl font-bold text-green-300 mb-4 flex-shrink-0">{product ? 'Edit Product' : 'Add New Product'}</h2>
                <form id="product-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto custom-scrollbar pr-4 -mr-4 space-y-6">
                    {/* Basic Info */}
                    <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 space-y-4">
                         <h3 className="font-semibold text-gray-300 mb-2">Basic Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="text-sm font-medium">Name*</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700" required /></div>
                            <div><label className="text-sm font-medium">Category*</label><select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700"><option>Wearable</option><option>Diagnostic</option><option>Tech</option><option>Supplement</option></select></div>
                        </div>
                        <div><label className="text-sm font-medium">Description*</label><textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700" required /></div>
                        <div><label className="text-sm font-medium">Image URL*</label><input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700" required /></div>
                    </div>
                    
                    {/* Pricing & Inventory */}
                    <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 space-y-4">
                        <h3 className="font-semibold text-gray-300 mb-2">Pricing &amp; Inventory</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="text-sm font-medium">Price (USD)*</label><input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700" step="0.01" required /></div>
                            <div><label className="text-sm font-medium">Price ($BIO)</label><input type="number" name="priceInBioTokens" value={formData.priceInBioTokens || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700" /></div>
                            <div><label className="text-sm font-medium">Inventory*</label><input type="number" name="inventory" value={formData.inventory} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700" required /></div>
                        </div>
                    </div>
                    
                    {/* Integrations */}
                     <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 space-y-4">
                        <h3 className="font-semibold text-gray-300 mb-2">Integrations (Simulated)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="text-sm font-medium">Stripe Product ID</label><input type="text" name="stripeProductId" value={formData.stripeProductId || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700" /></div>
                            <div><label className="text-sm font-medium">Stripe Price ID</label><input type="text" name="stripePriceId" value={formData.stripePriceId || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700" /></div>
                        </div>
                        <div className="flex items-center justify-between bg-gray-900/50 p-2 rounded-md">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${formData.isStripeSynced ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                                <span className="text-xs font-semibold">{formData.isStripeSynced ? 'Synced with Stripe' : 'Not Synced'}</span>
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => { setFormData(p => ({ ...p, isStripeSynced: true })); toast.success("Synced with Stripe (Simulated)"); }} className="px-3 py-1 bg-indigo-600 rounded text-xs font-semibold hover:bg-indigo-500">Sync with Stripe</button>
                                <a href="#" onClick={(e) => {e.preventDefault(); toast.success("Redirecting to Stripe... (Simulated)");}} className="px-3 py-1 bg-gray-700 rounded text-xs font-semibold hover:bg-gray-600">Manage on Stripe</a>
                            </div>
                        </div>
                     </div>

                    {/* Fulfillment */}
                     <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 space-y-4">
                        <h3 className="font-semibold text-gray-300 mb-2">Fulfillment &amp; Shipping</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="text-sm font-medium">Supplier Name</label><input type="text" name="supplierName" value={formData.supplierName || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700" /></div>
                            <div><label className="text-sm font-medium">Supplier SKU</label><input type="text" name="supplierSku" value={formData.supplierSku || ''} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700" /></div>
                            <div><label className="text-sm font-medium">Fulfillment Method</label><select name="fulfillmentService" value={formData.fulfillmentService} onChange={handleInputChange} className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700"><option value="self">Self-fulfilled</option><option value="3pl">3rd-Party Logistics (3PL)</option></select></div>
                            <div><label className="text-sm font-medium">Shipping Weight (kg)</label><input type="number" name="shippingWeight" value={formData.shippingWeight || ''} onChange={handleInputChange} step="0.01" className="w-full bg-gray-800 p-2 rounded mt-1 text-sm border border-gray-700" /></div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium">Package Dimensions (cm)</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <input type="number" name="length" value={formData.shippingDimensions?.length || ''} onChange={handleDimensionChange} placeholder="L" className="w-full bg-gray-800 p-2 rounded text-sm border border-gray-700" />
                                    <input type="number" name="width" value={formData.shippingDimensions?.width || ''} onChange={handleDimensionChange} placeholder="W" className="w-full bg-gray-800 p-2 rounded text-sm border border-gray-700" />
                                    <input type="number" name="height" value={formData.shippingDimensions?.height || ''} onChange={handleDimensionChange} placeholder="H" className="w-full bg-gray-800 p-2 rounded text-sm border border-gray-700" />
                                </div>
                            </div>
                        </div>
                     </div>

                </form>
                <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-700 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
                    <button type="submit" form="product-form" disabled={mutation.isPending} className="px-6 py-2 text-sm font-bold text-black bg-green-500 rounded-lg hover:bg-green-400 disabled:bg-gray-600">
                        {mutation.isPending ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">&times;</button>
            </div>
        </div>
    );
};

export default ProductEditorModal;