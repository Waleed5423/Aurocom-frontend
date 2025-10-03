// User types
export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'customer' | 'admin' | 'super_admin';
    avatar?: {
        public_id: string;
        url: string;
    };
    phone?: string;
    addresses: Address[];
    wishlist: string[];
    isActive: boolean;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Address {
    _id: string;
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}

// Product types
export interface Product {
    _id: string;
    name: string;
    description: string;
    shortDescription?: string;
    category: string | Category;
    subcategory?: string | Category;
    price: number;
    comparePrice?: number;
    cost?: number;
    sku: string;
    trackQuantity: boolean;
    quantity: number;
    lowStockAlert: number;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    images: ProductImage[];
    variants?: ProductVariant[];
    tags: string[];
    brand?: string;
    featured: boolean;
    isActive: boolean;
    seo?: {
      title?: string;
      description?: string;
      slug?: string;
    };
    ratings: {
      average: number;
      count: number;
      distribution?: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
    };
    salesCount: number;
    inStock?: boolean;
    createdAt: string;
    updatedAt: string;
  }

export interface ProductImage {
    public_id: string;
    url: string;
    isDefault: boolean;
}

export interface Variant {
    name: string;
    values: VariantValue[];
}

export interface ProductVariant {
    name: string;
    values: VariantValue[];
  }
  
  export interface VariantValue {
    value: string;
    price: number;
    stock: number;
    sku?: string;
  }
  

// Category types
export interface Category {
    _id: string;
    name: string;
    description?: string;
    image?: {
      public_id: string;
      url: string;
    };
    parent?: string | Category;
    isActive: boolean;
    featured: boolean;
    subcategories?: Category[];
    productsCount?: number;
  }
  

// Cart types
export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
    guestId?: string;
    coupon?: Coupon;
    discount: number;
    shipping: number;
    tax: number;
    subtotal: number;
    total: number;
    createdAt: string;
    updatedAt: string;
}

export interface CartItem {
    _id: string;
    product: Product;
    quantity: number;
    variant?: {
        name: string;
        value: string;
        price: number;
    };
    price: number;
}

// Order types
export interface Order {
    _id: string;
    orderNumber: string;
    user: User;
    items: OrderItem[];
    shippingAddress: Address;
    billingAddress: Address;
    paymentMethod: 'stripe' | 'paypal' | 'jazzcash' | 'easypaisa' | 'bank_transfer';
    paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
    paymentId?: string;
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
    coupon?: Coupon;
    trackingNumber?: string;
    carrier?: string;
    notes?: string;
    cancelledAt?: string;
    deliveredAt?: string;
    refundRequest?: {
        requested: boolean;
        reason?: string;
        status: 'pending' | 'approved' | 'rejected';
        requestedAt?: string;
        processedAt?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    _id: string;
    product: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    variant?: {
        name: string;
        value: string;
    };
    total: number;
}

// Review types
export interface Review {
    _id: string;
    product: Product;
    user: User;
    order: string;
    rating: number;
    title?: string;
    comment: string;
    images: ProductImage[];
    verifiedPurchase: boolean;
    helpful: {
        count: number;
        users: string[];
    };
    reported: {
        count: number;
        users: string[];
        reasons: string[];
    };
    isApproved: boolean;
    isActive: boolean;
    adminResponse?: {
        comment: string;
        respondedBy: User;
        respondedAt: string;
    };
    createdAt: string;
    updatedAt: string;
}

// Coupon types
export interface Coupon {
    _id: string;
    code: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxDiscount?: number;
    minOrderValue?: number;
    usageLimit?: number;
    usedCount: number;
    userLimit?: number;
    validFrom: string;
    expiresAt: string;
    isActive: boolean;
    applicableCategories?: Category[];
    excludedProducts?: Product[];
    createdBy: User;
    isValid?: boolean;
    createdAt: string;
    updatedAt: string;
}

// Payment types
export interface Transaction {
    _id: string;
    order: Order;
    user: User;
    paymentMethod: 'stripe' | 'paypal' | 'jazzcash' | 'easypaisa' | 'bank_transfer';
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
    gatewayTransactionId?: string;
    gatewayResponse?: any;
    refundAmount: number;
    refundReason?: string;
    refundedAt?: string;
    isRefundable?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    supportedCurrencies: string[];
    icon: string;
}

// Notification types
export interface Notification {
    _id: string;
    user: string;
    type: 'order' | 'payment' | 'promotion' | 'system' | 'security';
    title: string;
    message: string;
    data?: any;
    read: boolean;
    readAt?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    actionUrl?: string;
    actionText?: string;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];
}

export interface PaginatedResponse<T = any> {
    data: T[];
    pagination: {
        current: number;
        pages: number;
        total: number;
    };
}

// Form types
export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface AddressFormData {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}

export interface ReviewFormData {
    productId: string;
    orderId: string;
    rating: number;
    title?: string;
    comment: string;
    images?: File[];
}

// Filter types
export interface ProductFilters {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    featured?: boolean;
    rating?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

// Admin Dashboard types
export interface DashboardStats {
    stats: {
        totalUsers: number;
        totalProducts: number;
        totalOrders: number;
        totalRevenue: number;
        lowStockCount: number;
    };
    recentOrders: Order[];
    lowStockProducts: Product[];
    salesData: any[];
}

export interface SalesReport {
    salesReport: Array<{
        _id: {
            year: number;
            month: number;
            day?: number;
        };
        totalSales: number;
        orderCount: number;
        averageOrderValue: number;
    }>;
}