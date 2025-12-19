
import React from 'react';
import { ShieldCheck, Lock, Unlock, Banknote, ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { PaymentEscrowStatus } from '../types';

interface PaymentStatusProps {
  status: PaymentEscrowStatus;
  amount: number;
  orderId: string;
  onViewOrder?: () => void;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ status, amount, orderId, onViewOrder }) => {
  const isReleased = status === 'RELEASED';
  const isSecured = status === 'SECURED';

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden max-w-md mx-auto">
      <div className={`p-8 text-white relative overflow-hidden ${isReleased ? 'bg-emerald-600' : 'bg-slate-900'}`}>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl ${isReleased ? 'bg-white/20' : 'bg-indigo-600'}`}>
              {isReleased ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
              Razorpay Route™
            </span>
          </div>
          
          <h2 className="text-2xl font-black mb-1">
            {isReleased ? 'Funds Transferred' : 'Funds Secured'}
          </h2>
          <p className="text-sm opacity-70">Order: {orderId}</p>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center pb-6 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Escrow Amount</p>
            <p className="text-3xl font-black text-slate-900">₹{amount.toLocaleString()}</p>
          </div>
          <div className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 ${
            isReleased ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
          }`}>
            {isReleased ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4 animate-pulse" />}
            {status}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSecured ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Payment Captured</p>
              <p className="text-xs text-slate-500">Shipper has deposited the full amount into the NeuroLoad smart wallet.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isReleased ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">PoD Verified Verification</p>
              <p className="text-xs text-slate-500">Release triggered automatically upon AI-validation of delivery evidence.</p>
            </div>
          </div>
        </div>

        {!isReleased && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
              Your payout is currently on <strong>Settlement Hold</strong>. It will be released to your linked bank account once the delivery is finalized.
            </p>
          </div>
        )}

        {onViewOrder && (
          <button 
            onClick={onViewOrder}
            className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            View Shipment Details <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
