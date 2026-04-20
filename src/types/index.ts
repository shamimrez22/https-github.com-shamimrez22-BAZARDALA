export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  description: string;
  ratings: number;
  createdAt: any;
  affiliateLink?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderId: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'delivered' | 'cancelled';
  customerInfo: {
    name: string;
    phone: string;
    address: string;
  };
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  paymentStatus: 'pending' | 'paid';
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  photoURL?: string;
  wishlist: string[];
  cart: OrderItem[];
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  expiry: any;
}

export interface Notification {
  id: string;
  message: string;
  type: 'order' | 'system';
  read: boolean;
  createdAt: any;
}

export interface SiteSettings {
  siteName: string;
  footerSupportLinks: { label: string; url: string }[];
  footerCompanyLinks: { label: string; url: string }[];
  socialLinks: { platform: string; url: string }[];
  siteDescription: string;
  ads?: {
    featuresAd: {
      active: boolean;
      link: string;
      message: string;
    };
    popupAd: {
      active: boolean;
      link: string;
      message: string;
      imageUrl: string;
    };
    socialBarAd: {
      active: boolean;
      link: string;
      message: string;
    };
    globalNotice: {
      active: boolean;
      message: string;
      type: 'info' | 'urgent' | 'promo';
    };
    adsterra?: {
      popunderCode: string;
      nativeBannerCode: string;
      socialBarCode: string;
      bannerOneCode?: string;
      bannerTwoCode?: string;
      customAdScript?: string;
    };
    adminCredentials?: {
      username: string;
      pass: string;
    };
    adminEmails?: string[];
  };
}
