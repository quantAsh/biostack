import React, { useState, useEffect, useMemo } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useUserStore } from '../stores/userStore';
import { useDataStore } from '../stores/dataStore';
import { Protocol, UserStack } from '../types';
import toast from 'react-hot-toast';

const PublishStackModal: React.FC = () => {
  const { closePublishModal, forkingStack, stackCreationContext } = useUIStore(state => ({
    closePublishModal: state.closePublishModal,
    forkingStack: state.forkingStack,
    stackCreationContext: state.stackCreationContext,
  }));
  const myStack = useUserStore(state => state.myStack);
  const { publishStack, communityStacks, products } = useDataStore(state => ({
    publishStack: state.publishStack,
    communityStacks: state.communityStacks,
    products: state.products,
  }));

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [forkedFromId, setForkedFromId] = useState<string | undefined>(undefined);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  useEffect(() => {
    if (forkingStack) {
      setName(`${forkingStack.name} (Fork)`);
      setDescription(forkingStack.description);
      setForkedFromId(forkingStack.forked_from_id);
      setSelectedItemIds([forkingStack.instanceId]);
    } else if (stackCreationContext) {
      setName(`New Stack for "${stackCreationContext.bountyQuestion.substring(0, 25)}..."`);
      setDescription(`A new community stack based on the KAIROS insight that identified a high-efficacy protocol.`);
      setForkedFromId(stackCreationContext.bountyQuestion); // Use question as a temporary link
      setSelectedItemIds([stackCreationContext.protocolId]);
    }
    else {
        setName('');
        setDescription('');
        setForkedFromId(undefined);
        setSelectedItemIds([]);
        setSelectedProductIds([]);
    }
  }, [forkingStack, stackCreationContext]);
  
  const handleCheckboxChange = (itemId: string) => {
    setSelectedItemIds(prev =>
        prev.includes(itemId)
            ? prev.filter(id => id !== itemId)
            : [...prev, itemId]
    );
  };
  
  const handleProductSelection = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && description.trim()) {
      let forkedName = undefined;
      if (forkingStack) {
          const parentStack = communityStacks.find(s => s.id === forkedFromId);
          forkedName = parentStack?.name;
      } else if (stackCreationContext) {
          forkedName = "KAIROS Insight";
      }
      
      const selectedItems = myStack.filter(item => {
          const itemId = 'id' in item ? item.id : item.instanceId;
          return selectedItemIds.includes(itemId);
      });

      const allProtocolIds = selectedItems.reduce<string[]>((acc, item) => {
          if ('categories' in item) { // It's a Protocol
              acc.push(item.id);
          } else { // It's a UserStack
              acc.push(...item.protocol_ids);
          }
          return acc;
      }, []);
      
      // If creating from insight, ensure the winning protocol is included
      if (stackCreationContext && !allProtocolIds.includes(stackCreationContext.protocolId)) {
        allProtocolIds.push(stackCreationContext.protocolId);
      }

      const protocolIdsToPublish = [...new Set(allProtocolIds)]; // Deduplicate

      if (protocolIdsToPublish.length === 0) {
          toast.error("Cannot publish an empty stack. Please select at least one item.");
          return;
      }
        
      publishStack(name, description, protocolIdsToPublish, forkedFromId, forkedName, selectedProductIds);
      closePublishModal();
    }
  };
  
  const mySelectableItems = useMemo(() => {
    let items = myStack;
    if (stackCreationContext) {
        // Find the protocol from the context in the main protocol list
        const protocol = useDataStore.getState().protocols.find(p => p.id === stackCreationContext.protocolId);
        if (protocol && !myStack.some(item => 'id' in item && item.id === protocol.id)) {
            items = [...myStack, protocol];
        }
    }
    return items;
  }, [myStack, stackCreationContext]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-green-500/30 rounded-2xl w-full max-w-lg text-white p-8 relative">
        <h2 className="font-title text-3xl font-extrabold text-green-300 mb-2">Publish Your Stack</h2>
        <p className="text-gray-400 mb-6">Share your custom protocol stack with the community. Provide a name and a short description of its purpose.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="stack-name" className="block text-sm font-medium text-gray-300 mb-1">Stack Name*</label>
            <input
              id="stack-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 'My Morning Focus Routine'"
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm text-gray-200 focus:ring-green-500 focus:border-green-500 transition"
              required
            />
          </div>
          <div>
            <label htmlFor="stack-description" className="block text-sm font-medium text-gray-300 mb-1">Description*</label>
            <textarea
              id="stack-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What is this stack for? Who would benefit from it?"
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg p-2.5 text-sm text-gray-200 focus:ring-green-500 focus:border-green-500 transition"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Select Items to Include*</label>
            <div className="max-h-32 overflow-y-auto custom-scrollbar p-3 bg-gray-800/50 border border-gray-600 rounded-lg space-y-2">
                {mySelectableItems.map(item => {
                    const isProtocol = 'categories' in item;
                    const itemId = isProtocol ? item.id : item.instanceId;
                    const itemName = item.name;
                    const isChecked = selectedItemIds.includes(itemId);

                    return (
                        <div key={itemId} className="flex items-center">
                            <input
                                id={`item-${itemId}`}
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheckboxChange(itemId)}
                                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-green-500 focus:ring-green-500"
                            />
                            <label htmlFor={`item-${itemId}`} className="ml-3 text-sm text-gray-200">
                                {itemName}
                                {!isProtocol && <span className="text-xs text-gray-500 ml-2">(Stack)</span>}
                            </label>
                        </div>
                    );
                })}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tag Relevant Products (Optional)</label>
            <div className="max-h-32 overflow-y-auto custom-scrollbar p-3 bg-gray-800/50 border border-gray-600 rounded-lg space-y-2">
              {products.map(product => (
                <div key={product.id} className="flex items-center">
                  <input
                    id={`product-${product.id}`}
                    type="checkbox"
                    checked={selectedProductIds.includes(product.id)}
                    onChange={() => handleProductSelection(product.id)}
                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-green-500 focus:ring-green-500"
                  />
                  <label htmlFor={`product-${product.id}`} className="ml-3 text-sm text-gray-200 flex items-center gap-2">
                    <img src={product.imageUrl} alt={product.name} className="w-6 h-6 rounded-sm object-cover" />
                    {product.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={closePublishModal} className="px-4 py-2 text-sm font-bold text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
            <button type="submit" className="px-6 py-2 text-sm font-bold text-black bg-green-500 rounded-lg hover:bg-green-400">Publish Stack</button>
          </div>
        </form>

        <button onClick={closePublishModal} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default PublishStackModal;
