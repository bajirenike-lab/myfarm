// ==============================================================================
// MYFARM - CORE TYPESCRIPT INTERFACES
// ==============================================================================

export type UserRole = 'consumer' | 'farmer' | 'admin' | 'buyer';

export type CycleStatus =
  | 'awaiting_payment'
  | 'awaiting_allocation'
  | 'allocated'
  | 'land_preparation'
  | 'planting'
  | 'growing'
  | 'maintenance'
  | 'harvest_ready'
  | 'harvested'
  | 'completed'
  | 'disrupted'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'refunded';

export type ActivityStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';

export type PostHarvestOption = 'delivery' | 'marketplace' | 'split';

export type DeliveryStatus =
  | 'awaiting_confirmation'
  | 'ready_for_dispatch'
  | 'dispatched'
  | 'in_transit'
  | 'delivered'
  | 'failed'
  | 'returned';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  preferred_location?: string;
  referral_code?: string;
  created_at: string;
}

export interface Farm {
  id: string;
  name: string;
  slug: string;
  description: string;
  state: string;
  lga: string;
  address_description: string;
  latitude: number;
  longitude: number;
  total_area_sqm: number;
  available_area_sqm: number;
  soil_type: string;
  water_source: string;
  is_verified: boolean;
  verified_at?: string;
  cover_image_url: string;
  gallery_urls: string[];
}

export interface Crop {
  id: string;
  name: string;
  botanical_name?: string;
  category: string;
  description: string;
  growth_duration_days: number;
  planting_season: string;
  water_requirement: string;
  soil_requirement: string;
  pest_and_disease_notes: string;
  image_url: string;
  is_active: boolean;
}

export interface CropPackage {
  id: string;
  crop_id: string;
  name: string;
  plot_size_sqm: number;
  target_yield_min_kg: number;
  target_yield_max_kg: number;
  base_production_cost: number;
  platform_fee: number;
  total_price: number;
  is_active: boolean;
}

export interface PackageCostItem {
  id: string;
  package_id: string;
  category: string;
  item_name: string;
  estimated_cost: number;
  is_mandatory: boolean;
  sort_order: number;
}

export interface ProductionOrder {
  id: string;
  cycle_code: string;
  user_id: string;
  farm_id: string;
  crop_id: string;
  package_id: string;
  plot_id?: string;
  farmer_id?: string;
  status: CycleStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  target_start_date?: string;
  actual_start_date?: string;
  estimated_harvest_start?: string;
  estimated_harvest_end?: string;
  actual_harvest_date?: string;
  cancellation_reason?: string;
  created_at: string;
  farm?: Farm;
  crop?: Crop;
  package?: CropPackage;
}

export interface FarmingActivity {
  id: string;
  production_order_id: string;
  farmer_id: string;
  stage_name: string;
  title: string;
  description: string;
  activity_date: string;
  inputs_applied?: Record<string, any>;
  weather_condition?: string;
  status: ActivityStatus;
  reviewed_at?: string;
  created_at: string;
  media?: ActivityMedia[];
}

export interface ActivityMedia {
  id: string;
  activity_id: string;
  media_type: 'image' | 'video';
  media_url: string;
  caption?: string;
}

export interface HarvestRecord {
  id: string;
  production_order_id: string;
  harvest_date: string;
  gross_quantity_kg: number;
  grade_a_quantity_kg: number;
  grade_b_quantity_kg: number;
  rejected_quantity_kg: number;
  proof_image_urls: string[];
  notes?: string;
  recorded_by: string;
  verified_by?: string;
  created_at: string;
}

export interface PostHarvestAllocation {
  id: string;
  harvest_record_id: string;
  user_id: string;
  decision: PostHarvestOption;
  delivery_quantity_kg: number;
  marketplace_quantity_kg: number;
  status: 'processing' | 'fulfilled' | 'cancelled';
  created_at: string;
}

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  harvest_record_id?: string;
  crop_id: string;
  title: string;
  description: string;
  price_per_kg: number;
  total_quantity_kg: number;
  available_quantity_kg: number;
  unit: string;
  image_urls: string[];
  is_approved: boolean;
  status: 'active' | 'sold_out' | 'delisted';
  created_at: string;
  crop?: Crop;
}

export interface WeatherData {
  temperature: number;
  precipitation: number;
  weather_code: number;
  wind_speed: number;
  humidity?: number;
  forecast_daily?: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    precipitation_sum: number;
  }>;
}

export type NotificationType =
  | 'ORDER_CONFIRMED'
  | 'RIDER_DISPATCHED'
  | 'ACTIVITY_VERIFIED'
  | 'HARVEST_READY'
  | 'DELIVERY_COMPLETED'
  | 'GENERAL_ALERT';

export type NotificationChannel = 'sms' | 'whatsapp' | 'in_app' | 'all';

export interface AppNotification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  channel?: NotificationChannel;
  recipient_phone?: string;
  recipient_name?: string;
  sms_message?: string;
  whatsapp_message?: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export type SettlementStatus = 'pending' | 'processing' | 'completed' | 'disputed';

export interface SellerSettlement {
  id: string;
  seller_id: string;
  listing_id?: string;
  crop_title?: string;
  gross_sales: number;
  platform_commission: number;
  net_payable: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: SettlementStatus;
  payout_reference?: string;
  settled_at?: string;
  created_at: string;
}

export interface BankAccount {
  id: string;
  user_id?: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  is_verified: boolean;
  is_default: boolean;
  created_at: string;
}

export interface SellerWalletSummary {
  available_balance: number;
  pending_settlement: number;
  total_lifetime_earnings: number;
  total_withdrawn: number;
  roi_percentage: number;
  active_settlements_count: number;
}


