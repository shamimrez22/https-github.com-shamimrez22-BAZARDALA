export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  discountPercentage?: number;
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
  password?: string;
  role: 'super_admin' | 'admin' | 'customer';
  status: 'active' | 'suspended';
  photoURL?: string;
  wishlist: string[];
  cart: OrderItem[];
  createdAt?: string;
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
  contactEmail?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  contactAddress?: string;
  siteDescriptionBangla?: string;
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
      link?: string;
    };
    bannerNotice?: {
      active: boolean;
      text: string;
      link?: string;
    };
    topHeaderBanner?: {
      active: boolean;
      imageUrl: string;
      link: string;
    };
    floatingNotice?: {
      active: boolean;
      text: string;
      textColor: string;
      bgColor: string;
      speed?: number;
      link?: string;
    };
    topScrollingNotice?: {
      active: boolean;
      text: string;
      textColor: string;
      bgColor: string;
      speed?: number;
      link?: string;
    };
    adsterra?: {
      enabled: boolean;
      popunderCode: string;
      nativeBannerCode: string;
      socialBarCode: string;
      bannerOneCode?: string;
      bannerTwoCode?: string;
      bannerThreeCode?: string;
      bannerFourCode?: string;
      bannerFiveCode?: string;
      bannerSixCode?: string;
      customAdScript?: string;
    };
  };
  adminCredentials?: {
    username: string;
    pass: string;
    adminGmail?: string;
    adminGmailPassword?: string;
    masterPin?: string;
  };
  adminEmails?: string[];
  theme?: {
    enabled: boolean;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    cardColor: string;
    buttonColor: string;
  };
  countdown?: {
    enabled: boolean;
    targetDate: string;
    text: string;
  };
  sidebar?: {
    showCategories: boolean;
    showOffer: boolean;
    offerImageUrl: string;
    offerVideoUrl?: string;
    offerLink: string;
    offerTitle: string;
    offerDescription?: string;
  };
}
