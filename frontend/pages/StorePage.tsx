import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Store, Package, Star, Heart } from 'lucide-react';
import backend from '~backend/client';
import type { Product } from '~backend/product/types';
import CartDialog from '../components/CartDialog';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function StorePage() {
  const { slug } = useParams<{ slug: string }>();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const { data: storeData, isLoading: storeLoading } = useQuery({
    queryKey: ['store', slug],
    queryFn: () => slug ? backend.store.getBySlug({ slug }) : null,
    enabled: !!slug,
  });

  const store = storeData?.store;

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', store?.id],
    queryFn: () => store ? backend.product.listActiveByStore({ storeId: store.id }) : null,
    enabled: !!store,
  });

  const products = productsData?.products || [];

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getDiscountedPrice = (product: Product) => {
    if (product.discountType === 'none' || !product.discountValue) {
      return product.price;
    }

    const now = new Date();
    const startDate = product.discountStartDate ? new Date(product.discountStartDate) : null;
    const endDate = product.discountEndDate ? new Date(product.discountEndDate) : null;

    if (startDate && now < startDate) return product.price;
    if (endDate && now > endDate) return product.price;

    if (product.discountType === 'percentage') {
      return product.price * (1 - product.discountValue / 100);
    } else if (product.discountType === 'fixed') {
      return Math.max(0, product.price - (product.discountValue * 100));
    }

    return product.price;
  };

  const hasDiscount = (product: Product) => {
    if (product.discountType === 'none' || !product.discountValue) return false;
    
    const now = new Date();
    const startDate = product.discountStartDate ? new Date(product.discountStartDate) : null;
    const endDate = product.discountEndDate ? new Date(product.discountEndDate) : null;

    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;

    return true;
  };

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store not found</h1>
          <p className="text-gray-600">The store you're looking for doesn't exist or is not active.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-8 w-8 rounded" />
              ) : (
                <Store className="h-8 w-8 text-blue-600" />
              )}
              <span className="ml-2 text-xl font-bold text-gray-900">{store.name}</span>
              {store.rating && store.rating > 0 && (
                <div className="ml-4 flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">
                    {store.rating.toFixed(1)} ({store.totalReviews || 0} reviews)
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setCartOpen(true)}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Store Banner */}
      {store.bannerUrl && (
        <section className="relative h-48 bg-gray-200 overflow-hidden">
          <img
            src={store.bannerUrl}
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">{store.name}</h1>
              {store.description && (
                <p className="text-xl">{store.description}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Store Info */}
      {!store.bannerUrl && (
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>
              {store.description && (
                <p className="text-lg text-gray-600">{store.description}</p>
              )}
              <div className="flex items-center justify-center mt-4 space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{store.totalSales || 0}</div>
                  <div className="text-sm text-gray-600">Sales</div>
                </div>
                {store.rating && store.rating > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center">
                      <Star className="h-6 w-6 mr-1 fill-current" />
                      {store.rating.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">{store.totalReviews || 0} reviews</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {productsLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Package className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
              <p className="text-gray-600">This store doesn't have any products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const discountedPrice = getDiscountedPrice(product);
                const isDiscounted = hasDiscount(product);
                
                return (
                  <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="relative">
                      {product.images && product.images.length > 0 ? (
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square bg-gray-200 flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col space-y-1">
                        {product.featured && (
                          <Badge className="bg-yellow-500 text-white">Featured</Badge>
                        )}
                        {isDiscounted && (
                          <Badge className="bg-red-500 text-white">
                            {product.discountType === 'percentage' 
                              ? `-${product.discountValue}%`
                              : `-$${(product.discountValue).toFixed(2)}`
                            }
                          </Badge>
                        )}
                      </div>

                      {/* Wishlist button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                      {product.brand && (
                        <p className="text-sm text-gray-500">{product.brand}</p>
                      )}
                      {product.description && (
                        <CardDescription className="line-clamp-2">
                          {product.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        {/* Rating */}
                        {product.rating > 0 && (
                          <div className="flex items-center space-x-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= product.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">
                              ({product.totalReviews})
                            </span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold text-gray-900">
                                ${(discountedPrice / 100).toFixed(2)}
                              </span>
                              {isDiscounted && (
                                <span className="text-sm text-gray-500 line-through">
                                  ${(product.price / 100).toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {product.inventory} in stock
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Button
                          onClick={() => addToCart(product)}
                          disabled={product.inventory === 0}
                          className="w-full"
                        >
                          {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CartDialog
        open={cartOpen}
        onOpenChange={setCartOpen}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        totalPrice={getTotalPrice()}
        store={store}
      />
    </div>
  );
}
