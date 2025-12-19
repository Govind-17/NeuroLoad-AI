
import React from 'react';
import { Order, Vehicle } from '../types';
import { MapPin, ArrowRight, Package, TrendingUp, DollarSign, Calendar, Truck, Shield, Navigation, Banknote, Fuel, Construction, CheckCircle2, Circle } from 'lucide-react';

interface MarketplaceFeedProps {
  orders: Order[];
  activeVehicle: Vehicle | null;
  onAcceptOrder: (order: Order) => void;
}

const OrderStatusStepper: React.FC<{ currentStatus: Order['status'] }> = ({ currentStatus }) => {
  const steps: Order['status'][] = ['PENDING', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED'];
  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="space-y-3 py-2 border-l-2 border-slate-100 ml-2 pl-6 relative">
      {steps.map((step, idx) => {
        const isActive = idx <= currentIndex;
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;

        return (
          <div key={step} className="relative flex items-center gap-3 group">
            {/* Indicator Dot */}
            <div className={`absolute -left-[33px] w-4 h-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
              isActive ? 'bg-indigo-600 border-indigo-200' : 'bg-white border-slate-200'
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
              ) : isCurrent ? (
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              ) : null}
            </div>

            {/* Label */}
            <div className="flex flex-col">
              <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${
                isActive ? 'text-indigo-600' : 'text-slate-400'
              }`}>
                {step.replace('_', ' ')}
              </span>
              {isCurrent && (
                <span className="text-[8px] text-slate-400 font-medium animate-in fade-in slide-in-from-left-1">
                  Active Stage
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const OrderCard: React.FC<{ order: Order; onAccept: (order: Order) => void }> = ({ order, onAccept }) => {
  const totalWeight = order.packages.reduce((sum, p) => sum + p.weight, 0);
  const fuelCost = order.fuelCostEstimate || 0;
  const tolls = order.tollsEstimate || 0;
  const netProfit = order.price - fuelCost - tolls;
  
  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-lg overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
         <div>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase mb-2 inline-block tracking-wider">
              ID: {order.orderId}
            </span>
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
               ₹{(order.price / 1000).toFixed(1)}K <span className="text-sm font-medium text-slate-500">Gross</span>
            </h3>
         </div>
         <div className="text-right">
            <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
               ₹{(netProfit / 1000).toFixed(1)}K PROFIT
            </p>
         </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6 flex-1">
         {/* Profitability Breakdown */}
         <div className="grid grid-cols-3 gap-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
            <div className="text-center">
               <p className="text-[8px] font-black text-slate-400 uppercase">Gross</p>
               <p className="text-xs font-bold text-slate-700">₹{order.price}</p>
            </div>
            <div className="text-center border-x border-slate-200">
               <p className="text-[8px] font-black text-slate-400 uppercase">Fuel</p>
               <p className="text-xs font-bold text-red-500">-₹{fuelCost}</p>
            </div>
            <div className="text-center">
               <p className="text-[8px] font-black text-slate-400 uppercase">Tolls</p>
               <p className="text-xs font-bold text-amber-600">-₹{tolls}</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-6 items-start">
            {/* Route Info */}
            <div className="relative pl-6 space-y-4">
                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-200"></div>
                <div className="relative">
                   <div className="absolute -left-[24px] top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white"></div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup Hub</p>
                   <p className="text-sm font-bold text-slate-800">{order.cities[0]?.name}</p>
                </div>
                <div className="relative">
                   <div className="absolute -left-[24px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Final Drop</p>
                   <p className="text-sm font-bold text-slate-800">{order.cities[order.cities.length-1]?.name}</p>
                </div>
                
                {/* Stats Grid */}
                <div className="pt-2 space-y-2">
                   <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                      <Package className="w-3.5 h-3.5 text-slate-400" /> {totalWeight} kg
                   </div>
                   <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                      <Navigation className="w-3.5 h-3.5 text-slate-400" /> 840 km
                   </div>
                </div>
            </div>

            {/* Lifecycle Stepper */}
            <div className="border-l border-slate-100 pl-4">
               <p className="text-[9px] font-black text-slate-400 uppercase mb-3 tracking-widest">Order Life</p>
               <OrderStatusStepper currentStatus={order.status} />
            </div>
         </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 pt-0">
         <button 
          onClick={() => onAccept(order)}
          disabled={order.status !== 'PENDING'}
          className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all transform shadow-xl ${
            order.status === 'PENDING' 
              ? 'bg-slate-900 hover:bg-slate-800 text-white group-hover:scale-[1.02] group-hover:shadow-slate-200' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
         >
           {order.status === 'PENDING' ? 'Accept & Load' : 'Order Claimed'} <ArrowRight className="w-5 h-5" />
         </button>
      </div>
    </div>
  );
};

const MarketplaceFeed: React.FC<MarketplaceFeedProps> = ({ orders, activeVehicle, onAcceptOrder }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800">Available Gigs</h2>
          <p className="text-sm text-slate-500">High-profit loads matched to your vehicle capacity.</p>
        </div>
        {activeVehicle && (
          <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
            <Truck className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase leading-none">Active Vehicle</p>
              <p className="text-xs font-bold text-indigo-900">{activeVehicle.plateNumber}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order) => (
          <OrderCard key={order.orderId} order={order} onAccept={onAcceptOrder} />
        ))}
      </div>
    </div>
  );
};

export default MarketplaceFeed;
