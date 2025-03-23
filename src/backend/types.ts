export interface Env {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
  STRIPE_PRICE_ID: string;
  STRIPE_WEBHOOK_SECRET: string;
  FRONTEND_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  APPLE_CLIENT_ID: string;
  APPLE_TEAM_ID: string;
  APPLE_KEY_ID: string;
  APPLE_PRIVATE_KEY: string;
  JWT_SECRET: string;
  R2_ENDPOINT: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
}

export interface Subscription {
  id: string;
  child_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due';
  current_period_end: string;
  cancel_at_period_end: number;
  created_at: string;
  updated_at: string;
}

export interface CheckoutRequest {
  child_id: string;
}

export interface PortalRequest {
  child_id: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  family_id: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  user_id: string;
  family_id: string;
  role: 'owner' | 'member';
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  members: FamilyMember[];
  children: Child[];
}

export interface AuthRequest {
  provider: 'google' | 'apple';
  token: string;
}

export interface FamilyInviteRequest {
  email: string;
  role: 'owner' | 'member';
}

export interface FamilyJoinRequest {
  invite_code: string;
}

export interface MediaRecord {
  id: string;
  child_id: string;
  key: string;
  filename: string;
  file_type: string;
  size: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUploadUrlRequest {
  fileType: string;
}

export interface RecordMediaRequest {
  child_id: string;
  key: string;
  filename: string;
  file_type: string;
  size: number;
} 