
import React, { useState } from 'react';
import { Vehicle, User } from '../types';
import { Truck, ShieldCheck, CreditCard, Upload, CheckCircle, Smartphone } from 'lucide-react';

interface VehicleRegistryProps {
  currentUser: User;
  onRegistered: (vehicle: Vehicle) => void;
}

const VehicleRegistry: React.FC<VehicleRegistryProps> = ({ currentUser, onRegistered }) => {
  const [formData, setFormData] = useState({
    model: 'Tata Prima 5530.S',
    plateNumber: '',
    maxWeight: 5000,
    maxVolume: 2500,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newVehicle: Vehicle = {
      id: `VEH-${Math.floor(Math.random() * 10000)}`,
      ownerId: currentUser.id,
      model: formData.model,
      plateNumber: formData.plateNumber,
      maxWeight: formData.maxWeight,
      maxVolume: formData.maxVolume,
      isVerified: true, // Auto-verify for demo
      status: 'IDLE'
    };
    onRegistered(newVehicle);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white relative">
          <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
            <Truck className="text-indigo-500 w-8 h-8" />
            Carrier Onboarding
          </h2>
          <p className="text-slate-400 text-sm">Register your vehicle and start accepting high-value AI-optimized loads.</p>
          
          <div className="flex gap-4 mt-8">
            <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
            <div className={`flex-1 h-1 rounded-full ${step >= 3 ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Smartphone className="w-4 h-4" /> Vehicle Information</h3>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vehicle Model</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                >
                  <option>Tata Prima 5530.S</option>
                  <option>Ashok Leyland 4220</option>
                  <option>BharatBenz 2823R</option>
                  <option>Eicher Pro 6055</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">License Plate Number</label>
                <input 
                  type="text" 
                  placeholder="KA-01-AB-1234"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 uppercase font-mono"
                  required
                  value={formData.plateNumber}
                  onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
                />
              </div>
              <button 
                type="button" 
                onClick={() => setStep(2)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
              >
                Next Step
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <h3 className="font-bold text-slate-800 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Verification Docs</h3>
               <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 text-center hover:border-indigo-400 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-800">Upload RC Copy</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, JPG or PNG (Max 5MB)</p>
               </div>
               <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs text-emerald-700 font-medium">Auto-verification enabled for your region.</span>
               </div>
               <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 text-slate-500 font-bold py-3">Back</button>
                  <button type="button" onClick={() => setStep(3)} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg">Capacity Specs</button>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Load Capacity</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Max Payload (kg)</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900"
                      value={formData.maxWeight}
                      onChange={(e) => setFormData({...formData, maxWeight: parseInt(e.target.value)})}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Volume (m³)</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900"
                      value={formData.maxVolume}
                      onChange={(e) => setFormData({...formData, maxVolume: parseInt(e.target.value)})}
                    />
                 </div>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                  By registering, you agree to NeuroLoad's smart-contract terms. Loads will be automatically matched based on your axle capacity.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 text-slate-500 font-bold py-3">Back</button>
                  <button type="submit" className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg">Complete Registration</button>
               </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default VehicleRegistry;
