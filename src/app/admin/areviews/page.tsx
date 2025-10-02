'use client';

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { Button } from '@/components/ui/button';

export default function AdminReviewsPage() {
  const { reviews, fetchReviews, updateReviewStatus, isLoading } = useAdminStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReviews({ page, limit: 10 });
  }, [page]);

  const toggleReviewStatus = async (reviewId: string, currentStatus: boolean) => {
    await updateReviewStatus(reviewId, { isApproved: !currentStatus });
    fetchReviews({ page, limit: 10 });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reviews Management</h1>

      {isLoading ? (
        <div>Loading reviews...</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border p-4 rounded">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="font-semibold">{review.product?.name}</h3>
                    <span className="text-yellow-500">Rating: {review.rating}/5</span>
                  </div>
                  <p className="font-medium">{review.title}</p>
                  <p className="text-gray-600">{review.comment}</p>
                  <p className="text-sm text-gray-500">By: {review.user?.name}</p>
                  <p className="text-sm text-gray-500">
                    Status: {review.isApproved ? 'Approved' : 'Pending'}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button 
                    variant={review.isApproved ? "destructive" : "default"}
                    onClick={() => toggleReviewStatus(review._id, review.isApproved)}
                  >
                    {review.isApproved ? 'Reject' : 'Approve'}
                  </Button>
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