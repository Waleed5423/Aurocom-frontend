// src/app/(admin)/aproducts/add/page.tsx - FIXED VERSION
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload, ImageUploadPreview } from '@/components/ui/FileUpload';
import { useProductImageUpload } from '@/hooks/useUpload';

// Define proper types for the upload response
interface UploadResponse {
  success: boolean;
  data?: any[];
  message?: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const { uploadProductImages, isUploading, progress } = useProductImageUpload();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    cost: '',
    category: '',
    subcategory: '',
    sku: '',
    quantity: '',
    lowStockAlert: '5',
    weight: '',
    brand: '',
    tags: '',
    featured: false,
    trackQuantity: true
  });

  const handleImageUpload = (files: File[]) => {
    setUploadedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload images first
      let imageUrls: any[] = [];
      if (uploadedImages.length > 0) {
        const uploadResult = await uploadProductImages(uploadedImages);

        // Type-safe check for upload result
        if (uploadResult.success && 'data' in uploadResult && Array.isArray(uploadResult.data)) {
          imageUrls = uploadResult.data.map((img: any, index: number) => ({
            public_id: img.public_id || `img-${Date.now()}-${index}`,
            url: img.url || '',
            isDefault: index === 0
          })).filter(img => img.url); // Filter out images without URLs
        } else {
          console.warn('Image upload completed but no data returned:', uploadResult.message);
        }
      }

      // Convert form data to proper types
      const productData = {
        ...formData,
        images: imageUrls,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        quantity: parseInt(formData.quantity),
        lowStockAlert: parseInt(formData.lowStockAlert),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        featured: Boolean(formData.featured),
        trackQuantity: Boolean(formData.trackQuantity)
      };

      // API call to create product
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        alert('Product created successfully!');
        router.push('/aproducts');
      } else {
        throw new Error('Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <Button variant="outline" onClick={() => router.push('/aproducts')}>
          Back to Products
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Basic Information */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name *</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter product name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">SKU</label>
              <Input
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="Auto-generated if empty"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Short Description</label>
              <Textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="Brief description for product listings"
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Full Description *</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Detailed product description"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price *</label>
              <Input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Compare Price</label>
              <Input
                type="number"
                step="0.01"
                name="comparePrice"
                value={formData.comparePrice}
                onChange={handleChange}
                placeholder="Original price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cost</label>
              <Input
                type="number"
                step="0.01"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                placeholder="Product cost"
              />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quantity *</label>
              <Input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Low Stock Alert</label>
              <Input
                type="number"
                name="lowStockAlert"
                value={formData.lowStockAlert}
                onChange={handleChange}
                placeholder="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Weight (kg)</label>
              <Input
                type="number"
                step="0.01"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="trackQuantity"
                checked={formData.trackQuantity}
                onChange={handleChange}
              />
              <span>Track Quantity</span>
            </label>
          </div>
        </div>

        {/* Organization */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Organization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <Input
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                placeholder="Enter category ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subcategory</label>
              <Input
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                placeholder="Enter subcategory ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>
              <Input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Brand name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Tags</label>
              <Input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Separate tags with commas"
              />
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Product Images</h2>
          <FileUpload
            onUpload={handleImageUpload}
            multiple={true}
            accept="image/*"
            maxSize={5 * 1024 * 1024}
            maxFiles={10}
          />

          {uploadedImages.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Selected Images:</h3>
              <ImageUploadPreview
                files={uploadedImages}
                onRemove={removeImage}
                uploadProgress={{}}
              />
            </div>
          )}

          {isUploading && (
            <div className="mt-4">
              <p>Uploading images... {progress}%</p>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Options</h2>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />
              <span>Featured Product</span>
            </label>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button type="submit" disabled={isLoading || isUploading}>
            {isLoading ? 'Creating Product...' : 'Create Product'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/aproducts')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}