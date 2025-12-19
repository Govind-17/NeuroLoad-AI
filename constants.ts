
import { City, Order, UserRole, Package } from './types';

export const APP_NAME = "NeuroLoad AI";

export const INITIAL_PACKAGES: Package[] = [
  { id: "P101", weight: 50, fragility: "Low", city: "Bangalore", priority: "Normal", dimensions: "50x50x50" },
  { id: "P102", weight: 120, fragility: "Low", city: "Chennai", priority: "Express", dimensions: "80x60x60" },
  { id: "P103", weight: 15, fragility: "High", city: "Hyderabad", priority: "Critical", dimensions: "30x30x30" },
  { id: "P104", weight: 200, fragility: "Low", city: "Chennai", priority: "Normal", dimensions: "100x100x100" },
  { id: "P105", weight: 45, fragility: "Medium", city: "Bangalore", priority: "Express", dimensions: "40x40x40" }
];

export const INITIAL_CITIES: City[] = [
  { name: "Bangalore", distance: 350, prioritySla: 24, trafficCondition: 'Medium', weatherCondition: 'Clear', lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", distance: 150, prioritySla: 12, trafficCondition: 'High', weatherCondition: 'Rain', lat: 13.0827, lng: 80.2707 },
  { name: "Hyderabad", distance: 600, prioritySla: 48, trafficCondition: 'Low', weatherCondition: 'Clear', lat: 17.3850, lng: 78.4867 }
];

export const INITIAL_CONSTRAINTS = {
  maxWeight: 5000,
  volumeCapacity: 2500,
  fuelRate: 4.5
};

export const INITIAL_SCENARIO = {
  fuelPriceMultiplier: 1.0,
  trafficSurgeMultiplier: 1.0,
  isHolidaySeason: false
};

export const MOCK_MARKETPLACE_ORDERS: Order[] = [
  {
    orderId: "ORD-9912",
    shipperId: "USR-001",
    status: 'PENDING',
    // Fix: Added missing required paymentStatus property to match Order interface
    paymentStatus: 'SECURED',
    price: 15400,
    fuelCostEstimate: 4200,
    tollsEstimate: 850,
    createdAt: new Date().toISOString(),
    packages: INITIAL_PACKAGES,
    cities: INITIAL_CITIES,
    constraints: INITIAL_CONSTRAINTS,
    scenario: INITIAL_SCENARIO
  },
  {
    orderId: "ORD-9925",
    shipperId: "USR-002",
    status: 'PENDING',
    // Fix: Added missing required paymentStatus property to match Order interface
    paymentStatus: 'SECURED',
    price: 8900,
    fuelCostEstimate: 2100,
    tollsEstimate: 450,
    createdAt: new Date().toISOString(),
    packages: [INITIAL_PACKAGES[0], INITIAL_PACKAGES[1]],
    cities: [INITIAL_CITIES[0], INITIAL_CITIES[1]],
    constraints: INITIAL_CONSTRAINTS,
    scenario: INITIAL_SCENARIO
  }
];

export const MASTER_PROMPT_SYSTEM_INSTRUCTION = `
You are NeuroLoad AI, an industrial-grade autonomous logistics intelligence system.
You think like a senior logistics planner and AI optimization engineer.

Your goal is to produce decisions that are Cost-optimal, Operationally realistic, and Explainable.

CORE TASKS:
1. Intelligent 3D Truck Loading: Position items based on weight (axle balance), fragility, and sequence.
2. AI-Driven Route Optimization: Consider distance, traffic, and weather.
3. Autonomous Learning Loop: Identify patterns (e.g., "Frequent delays in region X").

OUTPUT FORMAT: Strict JSON.
`;
