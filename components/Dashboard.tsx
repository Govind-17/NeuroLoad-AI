import React from 'react';
import { 
  TrendingUp, 
  Truck, 
  Leaf, 
  Clock, 
  ArrowRight,
  LocateFixed,
  Map
} from 'lucide-react';
import { AppView } from '../types';

interface DashboardProps {
  onChangeView: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Cards */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Shipments</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">1,248</h3>
              <p className="text-xs text-green-600 mt-1 flex items-center font-medium">
                <TrendingUp className="w-3 h-3 mr-1" /> +12% this week
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Truck className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Avg. Fuel Savings</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">18.5%</h3>
              <p className="text-xs text-slate-400 mt-1">Per optimized route</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <Leaf className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">On-Time Rate</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">98.2%</h3>
              <p className="text-xs text-green-600 mt-1 flex items-center font-medium">
                <TrendingUp className="w-3 h-3 mr-1" /> +2.1% improvement
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-xl shadow-lg text-white">
          <div className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold">New Optimization</h3>
              <p className="text-indigo-100 text-sm mt-1 opacity-90">Start a new loading & route plan.</p>
            </div>
            <button 
              onClick={() => onChangeView(AppView.PLANNER)}
              className="mt-4 w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
            >
              Start Planner <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Feature Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="p-8 md:p-12 relative z-10 max-w-2xl">
          <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mb-4">
            FLIPR HACKATHON 30
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
            NeuroLoad AI: The Future of <span className="text-indigo-600">Logistics Intelligence</span>
          </h2>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Co-optimize your supply chain with our self-learning autonomous brain. 
            Reduce CO₂ emissions, optimize fuel costs, and perfect your truck loading strategy in one go.
          </p>
          <button 
            onClick={() => onChangeView(AppView.PLANNER)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center"
          >
            Launch Optimizer
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-indigo-50 to-transparent pointer-events-none hidden md:block"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Activity Feed */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Recent Activity</h3>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-slate-700">Route #892{i} - Bangalore to Chennai</h4>
                            <p className="text-xs text-slate-500">Completed 2 hours ago • 14% Fuel Saved</p>
                        </div>
                        <div className="text-green-600 text-sm font-bold">Success</div>
                    </div>
                ))}
            </div>
        </div>

        {/* Live Tracking Mini Widget - NEW */}
        <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-800 text-white relative overflow-hidden group">
             <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                   <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <LocateFixed className="w-5 h-5 text-green-500 animate-pulse" /> Live Fleet Tracking
                      </h3>
                      <p className="text-slate-400 text-sm mt-1">Real-time telemetry and active vehicle map.</p>
                   </div>
                   <button 
                     onClick={() => onChangeView(AppView.TRACKING)}
                     className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                   >
                     View Live Map
                   </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                       <span className="text-xs text-slate-400 uppercase font-bold">Active Trucks</span>
                       <p className="text-2xl font-bold mt-1">4</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                       <span className="text-xs text-slate-400 uppercase font-bold">On Schedule</span>
                       <p className="text-2xl font-bold mt-1 text-green-400">100%</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                       <span className="text-xs text-slate-400 uppercase font-bold">Avg Speed</span>
                       <p className="text-2xl font-bold mt-1">72 <span className="text-xs font-normal text-slate-400">km/h</span></p>
                    </div>
                </div>
             </div>

             {/* Animated Background Map Effect */}
             <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                <svg className="w-full h-full text-slate-700" fill="none" stroke="currentColor">
                   <path d="M0 100 Q 150 50 300 80 T 600 20" strokeWidth="2" strokeDasharray="5,5" />
                   <circle cx="450" cy="50" r="100" fill="url(#grad1)" opacity="0.5" />
                </svg>
             </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;