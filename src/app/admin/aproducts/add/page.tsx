// src/app/admin/aproducts/add/page.tsx - WITH IMAGE UPLOAD WORKAROUND
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProductImageUpload } from '@/hooks/useUpload';
import { useAdminStore } from '@/store/useAdminStore';

interface UploadedImage {
  public_id: string;
  url: string;
  isDefault: boolean;
}

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<UploadedImage[]>([]);
  const { uploadProductImages, isUploading, progress } = useProductImageUpload();
  const { categories, fetchCategories } = useAdminStore();

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

  const [variants, setVariants] = useState<any[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const subs = categories.filter(cat => {
        if (cat.parent) {
          if (typeof cat.parent === 'string') {
            return cat.parent === formData.category;
          } else {
            return cat.parent._id === formData.category;
          }
        }
        return false;
      });
      setAvailableSubcategories(subs);
      if (!subs.find(sub => sub._id === formData.subcategory)) {
        setFormData(prev => ({ ...prev, subcategory: '' }));
      }
    } else {
      setAvailableSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  }, [formData.category, categories]);

  const handleImageUpload = (files: File[]) => {
    setUploadedImages(prev => [...prev, ...files]);

    // Create temporary URLs for preview
    const newImageUrls = files.map((file, index) => ({
      public_id: `temp-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      isDefault: imageUrls.length === 0 && index === 0
    }));

    setImageUrls(prev => [...prev, ...newImageUrls]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));

    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imageUrls[index].url);
  };

  // Variant Management Functions
  const addVariant = () => {
    setVariants(prev => [...prev, { name: '', values: [] }]);
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariantName = (index: number, name: string) => {
    setVariants(prev => prev.map((variant, i) =>
      i === index ? { ...variant, name } : variant
    ));
  };

  const addVariantValue = (variantIndex: number) => {
    setVariants(prev => prev.map((variant, i) =>
      i === variantIndex
        ? { ...variant, values: [...variant.values, { value: '', price: 0, stock: 0 }] }
        : variant
    ));
  };

  const removeVariantValue = (variantIndex: number, valueIndex: number) => {
    setVariants(prev => prev.map((variant, i) =>
      i === variantIndex
        ? { ...variant, values: variant.values.filter((_, j) => j !== valueIndex) }
        : variant
    ));
  };

  const updateVariantValue = (variantIndex: number, valueIndex: number, field: string, value: any) => {
    setVariants(prev => prev.map((variant, i) =>
      i === variantIndex
        ? {
          ...variant,
          values: variant.values.map((val, j) =>
            j === valueIndex ? { ...val, [field]: value } : val
          )
        }
        : variant
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalImageUrls: UploadedImage[] = [];

      // Try to upload images if any, but continue even if it fails
      if (uploadedImages.length > 0) {
        try {
          console.log('🔄 Attempting to upload images...');
          const uploadResult = await uploadProductImages(uploadedImages);
          console.log('📦 Upload result:', uploadResult);

          if (uploadResult.success && uploadResult.data) {
            finalImageUrls = uploadResult.data.map((img: any, index: number) => ({
              public_id: img.public_id || `img-${Date.now()}-${index}`,
              url: img.url || img.secure_url || '',
              isDefault: index === 0
            })).filter(img => img.url);
            console.log('✅ Final image URLs:', finalImageUrls);
          } else {
            console.warn('⚠️ Image upload failed, continuing without images:', uploadResult.message);
            // Continue without images - don't throw error
          }
        } catch (uploadError) {
          console.error('💥 Image upload error, continuing without images:', uploadError);
          // Continue without images - don't throw error
        }
      }

      // Prepare product data - images are optional
      const productData = {
        ...formData,
        // Only include images if we have them
        ...(finalImageUrls.length > 0 && { images: finalImageUrls }),
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        quantity: parseInt(formData.quantity),
        lowStockAlert: parseInt(formData.lowStockAlert),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        featured: Boolean(formData.featured),
        trackQuantity: Boolean(formData.trackQuantity),
        variants: variants.filter(variant => variant.name && variant.values.length > 0),
        ...(formData.subcategory && { subcategory: formData.subcategory })
      };

      console.log('📤 Sending product data:', productData);

      // API call to create product
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();
      console.log('📨 Create product response:', result);

      if (response.ok && result.success) {
        alert('Product created successfully!');
        router.push('/admin/aproducts');
      } else {
        throw new Error(result.message || `Failed to create product: ${response.status}`);
      }
    } catch (error) {
      console.error('💥 Error creating product:', error);
      alert('Failed to create product: ' + (error as Error).message);
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

  // Get main categories (no parent)
  const getMainCategories = () => {
    return categories.filter(cat => !cat.parent);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <Button variant="outline" onClick={() => router.push('/admin/aproducts')}>
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

        {/* Organization */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Organization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Select Category</option>
                {getMainCategories().map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subcategory</label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                disabled={!formData.category}
              >
                <option value="">No Subcategory</option>
                {availableSubcategories.map(subcategory => (
                  <option key={subcategory._id} value={subcategory._id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
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

        {/* Images Section - SIMPLIFIED */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Product Images</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Upload Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) {
                  handleImageUpload(Array.from(e.target.files));
                }
              }}
              className="w-full p-2 border rounded"
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum 10 images, 5MB each. Supported formats: JPG, PNG, WebP, GIF
            </p>
          </div>

          {imageUrls.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Selected Images ({imageUrls.length}):</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imageUrls.map((image, index) => (
                  <div key={index} className="relative border rounded p-2">
                    <img
                      src={image.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                    {image.isDefault && (
                      <span className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isUploading && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-blue-700">Uploading images... {progress}%</p>
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
          <Button type="button" variant="outline" onClick={() => router.push('/admin/aproducts')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}