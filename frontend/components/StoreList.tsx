import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store } from 'lucide-react';
import type { Store as StoreType } from '~backend/store/types';

interface StoreListProps {
  stores: StoreType[];
  selectedStoreId: number | null;
  onSelectStore: (storeId: number) => void;
}

export default function StoreList({ stores, selectedStoreId, onSelectStore }: StoreListProps) {
  if (stores.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Store className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p>No stores yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {stores.map((store) => (
        <Button
          key={store.id}
          variant={selectedStoreId === store.id ? "default" : "ghost"}
          className="w-full justify-start h-auto p-3"
          onClick={() => onSelectStore(store.id)}
        >
          <div className="flex items-center space-x-3 w-full">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="h-8 w-8 rounded" />
            ) : (
              <Store className="h-8 w-8 text-gray-400" />
            )}
            <div className="flex-1 text-left">
              <div className="font-medium">{store.name}</div>
              <div className="text-xs text-gray-500 flex items-center space-x-2">
                <span>/{store.slug}</span>
                <Badge variant={store.isActive ? "default" : "secondary"} className="text-xs">
                  {store.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
}
