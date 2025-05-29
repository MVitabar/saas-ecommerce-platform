import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import backend from '~backend/client';

interface CreateStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
}

export default function CreateStoreDialog({ open, onOpenChange, userId }: CreateStoreDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    logoUrl: '',
    domain: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createStoreMutation = useMutation({
    mutationFn: (data: typeof formData) => backend.store.create({
      userId,
      name: data.name,
      description: data.description || undefined,
      slug: data.slug,
      logoUrl: data.logoUrl || undefined,
      domain: data.domain || undefined,
    }),
    onSuccess: () => {
      toast({
        title: "Store created successfully!",
        description: "Your new store is ready to use.",
      });
      queryClient.invalidateQueries({ queryKey: ['stores', userId] });
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        slug: '',
        logoUrl: '',
        domain: '',
      });
    },
    onError: (error: any) => {
      console.error('Create store error:', error);
      toast({
        title: "Failed to create store",
        description: error.message || "There was an error creating your store.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the store name and slug.",
        variant: "destructive",
      });
      return;
    }

    createStoreMutation.mutate(formData);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const handleSlugChange = (slug: string) => {
    // Clean the slug to ensure it's URL-friendly
    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    setFormData(prev => ({
      ...prev,
      slug: cleanSlug,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Store</DialogTitle>
          <DialogDescription>
            Set up your online store with a unique name and URL.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Store Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My Awesome Store"
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Store URL *</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">yoursite.com/store/</span>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="my-store"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Only lowercase letters, numbers, and hyphens are allowed
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Tell customers about your store..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <Label htmlFor="domain">Custom Domain</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
              placeholder="mystore.com"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createStoreMutation.isPending}>
              {createStoreMutation.isPending ? 'Creating...' : 'Create Store'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
