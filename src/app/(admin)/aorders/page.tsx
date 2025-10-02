'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Button } from '@/components/ui/button';

export default function AdminOrdersPage() {
  const { orders, fetchOrders, updateOrderStatus, isLoading } = useAdminStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders({ page, limit: 10 });
  }, [page]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, { status: newStatus });
    fetchOrders({ page, limit: 10 });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Orders Management</h1>

      {isLoading ? (
        <div>Loading orders...</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="border p-4 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                  <p>Customer: {order.user?.name || 'N/A'}</p>
                  <p>Total: ${order.total}</p>
                  <p>Status: {order.status}</p>
                  <p>Payment: {order.paymentStatus}</p>
                </div>
                <div className="space-x-2">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    className="border p-2 rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button variant="outline">View Details</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button 
          disabled={page === 1} 
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <Button onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}