import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Store, Package, ShoppingCart, BarChart3 } from 'lucide-react';
import backend from '~backend/client';
import StoreList from '../components/StoreList';
import CreateStoreDialog from '../components/CreateStoreDialog';
import ProductList from '../components/ProductList';
import OrderList from '../components/OrderList';

export default function DashboardPage() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [createStoreOpen, setCreateStoreOpen] = useState(false);

  // Mock user ID - in a real app, this would come from authentication
  const userId = 1;

  const { data: storesData } = useQuery({
    queryKey: ['stores', userId],
    queryFn: () => backend.store.listByUser({ userId }),
  });

  const stores = storesData?.stores || [];
  const selectedStore = stores.find(store => store.id === selectedStoreId);

  const { data: productsData } = useQuery({
    queryKey: ['products', selectedStoreId],
    queryFn: () => selectedStoreId ? backend.product.listByStore({ storeId: selectedStoreId }) : null,
    enabled: !!selectedStoreId,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['orders', selectedStoreId],
    queryFn: () => selectedStoreId ? backend.order.listByStore({ storeId: selectedStoreId }) : null,
    enabled: !!selectedStoreId,
  });

  const products = productsData?.products || [];
  const orders = ordersData?.orders || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Dashboard</span>
            </div>
            <Button onClick={() => setCreateStoreOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Store
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Your Stores</CardTitle>
                <CardDescription>
                  Select a store to manage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StoreList
                  stores={stores}
                  selectedStoreId={selectedStoreId}
                  onSelectStore={setSelectedStoreId}
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedStore ? (
              <div className="space-y-6">
                {/* Store Header */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Store className="h-5 w-5 mr-2" />
                      {selectedStore.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedStore.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                        <div className="text-sm text-gray-600">Products</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{orders.length}</div>
                        <div className="text-sm text-gray-600">Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          ${orders.reduce((sum, order) => sum + order.totalAmount, 0) / 100}
                        </div>
                        <div className="text-sm text-gray-600">Revenue</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="products" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="products" className="flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Products
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="flex items-center">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Orders
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="products">
                    <ProductList storeId={selectedStoreId} products={products} />
                  </TabsContent>

                  <TabsContent value="orders">
                    <OrderList orders={orders} />
                  </TabsContent>

                  <TabsContent value="analytics">
                    <Card>
                      <CardHeader>
                        <CardTitle>Analytics</CardTitle>
                        <CardDescription>
                          Store performance metrics
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          Analytics dashboard coming soon...
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No store selected
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Select a store from the sidebar or create a new one to get started.
                  </p>
                  <Button onClick={() => setCreateStoreOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Store
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <CreateStoreDialog
        open={createStoreOpen}
        onOpenChange={setCreateStoreOpen}
        userId={userId}
      />
    </div>
  );
}
