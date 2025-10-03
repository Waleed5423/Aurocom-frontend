// src/app/admin/acoupons/page.tsx - UPDATED
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminStore } from '@/store/useAdminStore';
import { apiClient } from '@/lib/api';


export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { categories } = useAdminStore();

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    maxDiscount: 0,
    minOrderValue: 0,
    usageLimit: 0,
    userLimit: 0,
    validFrom: new Date().toISOString().slice(0, 16),
    expiresAt: '',
    applicableCategories: [] as string[],
    excludedProducts: [] as string[],
  });

  useEffect(() => {
    // Fetch coupons would be implemented here
    fetchCoupons();
    // Fetch categories for the form
    useAdminStore.getState().fetchCategories();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await apiClient.getAdminCoupons(); 
      if (response.success) {
        setCoupons(response.data.coupons);
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const couponData = {
        ...formData,
        discountValue: Number(formData.discountValue),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        userLimit: formData.userLimit ? Number(formData.userLimit) : undefined,
        applicableCategories: formData.applicableCategories.length > 0 ? formData.applicableCategories : undefined,
        excludedProducts: formData.excludedProducts.length > 0 ? formData.excludedProducts : undefined,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(couponData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Coupon created successfully!');
          setShowForm(false);
          setFormData({
            code: '',
            description: '',
            discountType: 'percentage',
            discountValue: 0,
            maxDiscount: 0,
            minOrderValue: 0,
            usageLimit: 0,
            userLimit: 0,
            validFrom: new Date().toISOString().slice(0, 16),
            expiresAt: '',
            applicableCategories: [],
            excludedProducts: [],
          });
          fetchCoupons();
        } else {
          throw new Error(result.message);
        }
      } else {
        throw new Error('Failed to create coupon');
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Failed to create coupon: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(categoryId)
        ? prev.applicableCategories.filter(id => id !== categoryId)
        : [...prev.applicableCategories, categoryId]
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupons Management</h1>
        <Button onClick={() => setShowForm(true)}>Create Coupon</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border p-6 mb-6 rounded-lg bg-white shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Create New Coupon</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Coupon Code *</label>
                <Input
                  type="text"
                  placeholder="SUMMER2024"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  placeholder="Coupon description for internal use"
                  value={formData.description}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Discount Type *</label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Discount Value * {formData.discountType === 'percentage' ? '(%)' : '($)'}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleChange}
                  className="w-full"
                  required
                />
              </div>
            </div>

            {/* Limits & Restrictions */}
            <div className="space-y-4">
              {formData.discountType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Maximum Discount ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    name="maxDiscount"
                    value={formData.maxDiscount}
                    onChange={handleChange}
                    className="w-full"
                    placeholder="No limit if empty"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Minimum Order Value ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  name="minOrderValue"
                  value={formData.minOrderValue}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="No minimum if empty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Usage Limit</label>
                <Input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="Unlimited if empty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">User Limit (per user)</label>
                <Input
                  type="number"
                  name="userLimit"
                  value={formData.userLimit}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="Unlimited if empty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Valid From</label>
                <Input
                  type="datetime-local"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expires At *</label>
                <Input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  className="w-full"
                  required
                />
              </div>
            </div>
          </div>

          {/* Applicable Categories */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Applicable Categories (Optional)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-3 rounded">
              {categories.map(category => (
                <label key={category._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.applicableCategories.includes(category._id)}
                    onChange={() => handleCategoryToggle(category._id)}
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to apply to all categories. Select specific categories to restrict coupon usage.
            </p>
          </div>

          <div className="flex space-x-3 mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Coupon'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {coupons.length === 0 ? (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-gray-500 mb-4">No coupons found</p>
            <Button onClick={() => setShowForm(true)}>
              Create First Coupon
            </Button>
          </div>
        ) : (
          coupons.map((coupon: any) => (
            <div key={coupon._id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{coupon.code}</h3>
                  <p className="text-gray-600">{coupon.description}</p>
                  <div className="flex space-x-4 mt-2 text-sm">
                    <span>Discount: {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : '$'}</span>
                    {coupon.maxDiscount && <span>Max: ${coupon.maxDiscount}</span>}
                    <span>Used: {coupon.usedCount}/{coupon.usageLimit || '∞'}</span>
                    <span>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="destructive" size="sm">Delete</Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}