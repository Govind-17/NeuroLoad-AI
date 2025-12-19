
export interface Package {
  id: string;
  weight: number; // kg
  fragility: 'Low' | 'Medium' | 'High';
  city: string;
  priority: 'Normal' | 'Express' | 'Critical';
  dimensions: string; // LxWxH
}

export interface City {
  name: string;
  distance: number; // km from hub
  prioritySla: number; // hours
  trafficCondition: 'Low' | 'Medium' | 'High' | 'Gridlock';
  weatherCondition: 'Clear' | 'Rain' | 'Storm' | 'Snow';
  lat: number;
  lng: number;
}

export interface TruckConstraints {
  maxWeight: number; // kg
  volumeCapacity: number; // cubic meters
  fuelRate: number; // km/l
}

export interface SimulationScenario {
  fuelPriceMultiplier: number; // e.g. 1.0 is normal, 1.2 is 20% hike
  trafficSurgeMultiplier: number; // e.g. 1.5 for holiday season
  isHolidaySeason: boolean;
}

export interface OptimizationInput {
  packages: Package[];
  cities: City[];
  constraints: TruckConstraints;
  scenario: SimulationScenario;
}

export interface LoadingItem {
  packageId: string;
  position: string;
  reason: string;
}

export interface RouteStop {
  city: string;
  eta: string;
  activity: string;
  weatherAlert?: string;
}

export interface OptimizationMetrics {
  fuelSaved: string;
  co2Reduction: string;
  timeSaved: string;
  onTimeDeliveryRate: string;
}

export interface AiResponse {
  loadingPlan: LoadingItem[];
  routePlan: RouteStop[];
  metrics: OptimizationMetrics;
  explanation: string;
  riskAssessment: string;
  learningInsights: string; 
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PLANNER = 'PLANNER',
  RESULTS = 'RESULTS',
  TRACKING = 'TRACKING',
  MARKETPLACE = 'MARKETPLACE',
  REGISTRY = 'REGISTRY',
  ONBOARDING = 'ONBOARDING',
  VERIFICATION = 'VERIFICATION',
  POD = 'POD',
  PAYMENT = 'PAYMENT'
}

export enum UserRole {
  SHIPPER = 'SHIPPER',
  CARRIER = 'CARRIER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  model: string;
  plateNumber: string;
  maxWeight: number;
  maxVolume: number;
  isVerified: boolean;
  linkedAccountId?: string; // Razorpay Linked Account ID
  documents?: {
    license?: string;
    permit?: string;
  };
  status: 'IDLE' | 'BUSY' | 'MAINTENANCE';
}

export type PaymentEscrowStatus = 'SECURED' | 'RELEASED' | 'FAILED';

export interface Order extends OptimizationInput {
  orderId: string;
  shipperId: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED';
  paymentStatus: PaymentEscrowStatus;
  razorpayOrderId?: string;
  razorpayTransferId?: string;
  price: number;
  fuelCostEstimate?: number;
  tollsEstimate?: number;
  assignedCarrierId?: string;
  assignedVehicleId?: string;
  createdAt: string;
}
