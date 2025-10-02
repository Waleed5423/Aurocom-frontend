'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Button } from '@/components/ui/button';

export default function AdminTransactionsPage() {
  const { transactions, fetchTransactions, processRefund, isLoading } = useAdminStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTransactions({ page, limit: 10 });
  }, [page]);

  const handleRefund = async (transactionId: string, amount: number) => {
    if (confirm(`Process refund of $${amount}?`)) {
      await processRefund(transactionId, { refundAmount: amount });
      fetchTransactions({ page, limit: 10 });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Transactions Management</h1>

      {isLoading ? (
        <div>Loading transactions...</div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="border p-4 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">
                    Order: {transaction.order?.orderNumber}
                  </h3>
                  <p>Amount: ${transaction.amount}</p>
                  <p>Method: {transaction.paymentMethod}</p>
                  <p>Status: {transaction.status}</p>
                  <p>Date: {new Date(transaction.createdAt).toLocaleDateString()}</p>
                  {transaction.refundAmount > 0 && (
                    <p>Refunded: ${transaction.refundAmount}</p>
                  )}
                </div>
                <div className="space-x-2">
                  {transaction.status === 'completed' && transaction.refundAmount < transaction.amount && (
                    <Button 
                      variant="outline"
                      onClick={() => handleRefund(transaction._id, transaction.amount)}
                    >
                      Refund
                    </Button>
                  )}
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