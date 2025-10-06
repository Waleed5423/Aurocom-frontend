// src/app/(shop)/product/[id]/reviews/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Review, Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProductReviewsPage() {
    const params = useParams();
    const productId = params.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        title: '',
        comment: '',
        orderId: ''
    });
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        fetchProductAndReviews();
    }, [productId]);

    const fetchProductAndReviews = async () => {
        try {
            const [productResponse, reviewsResponse] = await Promise.all([
                apiClient.getProduct(productId),
                apiClient.getProductReviews(productId, { limit: 50 })
            ]);

            if (productResponse.success) {
                setProduct(productResponse.data.product);
            }

            if (reviewsResponse.success) {
                setReviews(reviewsResponse.data.reviews);
                setStats(reviewsResponse.data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('Please login to submit a review');
            return;
        }

        setSubmitting(true);
        try {
            const response = await apiClient.createReview({
                productId,
                ...reviewForm
            });

            if (response.success) {
                setShowReviewForm(false);
                setReviewForm({ rating: 5, title: '', comment: '', orderId: '' });
                fetchProductAndReviews(); // Refresh reviews
                alert('Review submitted successfully!');
            } else {
                alert(response.message || 'Failed to submit review');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleHelpful = async (reviewId: string) => {
        if (!isAuthenticated) {
            alert('Please login to mark reviews as helpful');
            return;
        }

        try {
            await apiClient.markReviewHelpful(reviewId);
            fetchProductAndReviews(); // Refresh to update helpful count
        } catch (error) {
            console.error('Failed to mark as helpful:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Reviews for {product.name}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-gray-900 mr-2">
                                {stats?.average?.toFixed(1) || '0.0'}
                            </span>
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        className={`text-xl ${star <= Math.round(stats?.average || 0)
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                        <span className="text-gray-600">
                            {stats?.count || 0} reviews
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Review Stats */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Rating Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {[5, 4, 3, 2, 1].map((rating) => {
                                    const count = stats?.distribution?.[rating] || 0;
                                    const percentage = stats?.count ? (count / stats.count) * 100 : 0;

                                    return (
                                        <div key={rating} className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-600">{rating} star</span>
                                            </div>
                                            <div className="flex-1 mx-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-yellow-400 h-2 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-600 w-8 text-right">
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {isAuthenticated && !showReviewForm && (
                            <Button
                                onClick={() => setShowReviewForm(true)}
                                className="w-full mt-4"
                            >
                                Write a Review
                            </Button>
                        )}
                    </div>

                    {/* Reviews List */}
                    <div className="lg:col-span-2">
                        {/* Review Form */}
                        {showReviewForm && (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Write a Review</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Rating
                                            </label>
                                            <Select
                                                value={reviewForm.rating.toString()}
                                                onValueChange={(value) => setReviewForm(prev => ({
                                                    ...prev,
                                                    rating: parseInt(value)
                                                }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select rating" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[5, 4, 3, 2, 1].map((rating) => (
                                                        <SelectItem key={rating} value={rating.toString()}>
                                                            {rating} star{rating !== 1 ? 's' : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Title (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={reviewForm.title}
                                                onChange={(e) => setReviewForm(prev => ({
                                                    ...prev,
                                                    title: e.target.value
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Brief summary of your review"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Review
                                            </label>
                                            <Textarea
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm(prev => ({
                                                    ...prev,
                                                    comment: e.target.value
                                                }))}
                                                placeholder="Share your experience with this product..."
                                                rows={4}
                                                required
                                            />
                                        </div>

                                        <div className="flex space-x-4">
                                            <Button
                                                type="submit"
                                                disabled={submitting}
                                                className="flex-1"
                                            >
                                                {submitting ? 'Submitting...' : 'Submit Review'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowReviewForm(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {/* Reviews List */}
                        <div className="space-y-6">
                            {reviews.length === 0 ? (
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                reviews.map((review) => (
                                    <Card key={review._id}>
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {review.user.name}
                                                    </h3>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <span
                                                                    key={star}
                                                                    className={`text-lg ${star <= review.rating
                                                                            ? 'text-yellow-400'
                                                                            : 'text-gray-300'
                                                                        }`}
                                                                >
                                                                    ★
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                {review.verifiedPurchase && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Verified Purchase
                                                    </span>
                                                )}
                                            </div>

                                            {review.title && (
                                                <h4 className="font-medium text-gray-900 mb-2">
                                                    {review.title}
                                                </h4>
                                            )}

                                            <p className="text-gray-700 mb-4">{review.comment}</p>

                                            {/* Review Images */}
                                            {review.images && review.images.length > 0 && (
                                                <div className="flex space-x-2 mb-4">
                                                    {review.images.map((image, index) => (
                                                        <img
                                                            key={index}
                                                            src={image.url}
                                                            alt={`Review image ${index + 1}`}
                                                            className="w-20 h-20 object-cover rounded-md"
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* Admin Response */}
                                            {review.adminResponse && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-medium text-blue-900">
                                                            Response from {review.adminResponse.respondedBy.name}
                                                        </span>
                                                        <span className="text-sm text-blue-700">
                                                            {new Date(review.adminResponse.respondedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-blue-800">
                                                        {review.adminResponse.comment}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Helpful Button */}
                                            <div className="flex justify-between items-center mt-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleHelpful(review._id)}
                                                >
                                                    Helpful ({review.helpful.count})
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}