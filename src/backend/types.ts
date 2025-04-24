import { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
  STRIPE_PRICE_ID: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_MONTHLY_PRICE_ID: string;
  STRIPE_YEARLY_PRICE_ID: string;
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
  R2_BUCKET: R2Bucket;
  OPENAI_API_KEY: string;
  EMAIL_SERVICE: string;
  SENDGRID_API_KEY: string;
  FROM_EMAIL: string;
  user?: {
    id: string;
    selected_child_id?: string;
  };
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
  family_id: string;
  name: string;
  birthdate: string;
  gender: string;
  age_range: string;
  avatar_url: string | null;
  created_at: string;
}

export interface FamilyMember {
  family_id: string;
  user_id: string;
  role: string;
  created_at: string;
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
  purpose: 'avatar' | 'journal';
}

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  createdAt: string;
  childId: string;
}

export interface RecordMediaRequest {
  child_id: string;
  key: string;
  filename: string;
  file_type: string;
  size: number;
}

export interface FeatureFlags {
  'premium.family_sharing': boolean;
  'premium.dashboard_insights': boolean;
  'premium.practice_modules': boolean;
  'premium.calendar_scheduling': boolean;
  [key: string]: boolean;
}

export interface Reward {
  id: string;
  child_id: string;
  name: string;
  description: string;
  points: number;
  created_at: string;
}

export interface Challenge {
  id: string;
  pillar_id: string;
  title: string;
  description: string;
  points: number;
  age_range: string;
  created_at: string;
}

export interface Pillar {
  id: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
}

export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: {
    changes: number;
    duration: number;
    last_row_id: number;
    served_by: string;
  };
}

// Cloudflare Workers types
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec<T = unknown>(query: string): Promise<D1Result<T>>;
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface R2Bucket {
  put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob, options?: R2PutOptions): Promise<R2Object>;
  get(key: string, options?: R2GetOptions): Promise<R2Object | null>;
  delete(key: string): Promise<void>;
}

export interface R2Object {
  key: string;
  size: number;
  etag: string;
  uploaded: Date;
  httpMetadata?: R2HTTPMetadata;
}

export interface R2PutOptions {
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
}

export interface R2GetOptions {
  onlyIf?: R2Conditional;
  range?: R2Range;
}

export interface R2HTTPMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

export interface R2Conditional {
  etagMatches?: string;
  etagDoesNotMatch?: string;
  uploadedBefore?: Date;
  uploadedAfter?: Date;
}

export interface R2Range {
  offset?: number;
  length?: number;
  suffix?: number;
}

export interface GoogleAuthRequest {
  credential: string;
}

export interface AuthResponse {
  success: boolean;
  jwt?: string;
  error?: string;
} 