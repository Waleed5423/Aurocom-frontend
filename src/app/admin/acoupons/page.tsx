'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    maxDiscount: 0,
    minOrderValue: 0,
    usageLimit: 0,
    expiresAt: ''
  });

  useEffect(() => {
    // Fetch coupons would be implemented here
    // For now, using mock data
    setCoupons([]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Create coupon logic would go here
    console.log('Create coupon:', formData);
    setShowForm(false);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      maxDiscount: 0,
      minOrderValue: 0,
      usageLimit: 0,
      expiresAt: ''
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupons Management</h1>
        <Button onClick={() => setShowForm(true)}>Create Coupon</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border p-4 mb-6 rounded">
          <h3 className="font-semibold mb-4">Create New Coupon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Coupon Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="border p-2 rounded"
              required
            />
            <select
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            <input
              type="number"
              placeholder="Discount Value"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Max Discount"
              value={formData.maxDiscount}
              onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Min Order Value"
              value={formData.minOrderValue}
              onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Usage Limit"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
              className="border p-2 rounded"
            />
            <input
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="border p-2 rounded"
              required
            />
          </div>
          <div className="flex space-x-2 mt-4">
            <Button type="submit">Create Coupon</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {coupons.length === 0 ? (
          <div className="text-center py-8">
            <p>No coupons found</p>
            <Button onClick={() => setShowForm(true)} className="mt-2">
              Create First Coupon
            </Button>
          </div>
        ) : (
          coupons.map((coupon: any) => (
            <div key={coupon._id} className="border p-4 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{coupon.code}</h3>
                  <p>Discount: {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : '$'}</p>
                  <p>Used: {coupon.usedCount}/{coupon.usageLimit || '∞'}</p>
                  <p>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</p>
                </div>
                <div className="space-x-2">
                  <Button variant="outline">Edit</Button>
                  <Button variant="destructive">Delete</Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}