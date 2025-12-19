import React from 'react';
import { AiResponse, Package } from '../types';
import TruckVisualizer from './TruckVisualizer';
import RouteVisualizer from './RouteVisualizer';
import { Leaf, Clock, TrendingDown, Info, AlertTriangle, CheckCircle, BrainCircuit, Rocket, ArrowRight } from 'lucide-react';

interface OptimizationResultProps {
  result: AiResponse;
  packages: Package[];
  onDeploy: () => void;
}

const OptimizationResult: React.FC<OptimizationResultProps> = ({ result, packages, onDeploy }) => {
  return (
    <div className="space-y-6 pb-12">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Optimization Complete</h2>
          <p className="text-sm text-slate-500">Plan ID: #OPT-{Math.floor(Math.random() * 10000)} • Ready for deployment</p>
        </div>
        <button 
          onClick={onDeploy}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 transform hover:scale-105"
        >
          <Rocket className="w-4 h-4" />
          Dispatch to Fleet
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-emerald-600 font-bold uppercase">CO₂ Reduction</p>
            <p className="text-xl font-bold text-slate-800">{result.metrics.co2Reduction}</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
             <p className="text-xs text-blue-600 font-bold uppercase">Fuel Saved</p>
             <p className="text-xl font-bold text-slate-800">{result.metrics.fuelSaved}</p>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
             <p className="text-xs text-purple-600 font-bold uppercase">Time Saved</p>
             <p className="text-xl font-bold text-slate-800">{result.metrics.timeSaved}</p>
          </div>
        </div>
         <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
             <p className="text-xs text-slate-500 font-bold uppercase">On-Time Rate</p>
             <p className="text-xl font-bold text-slate-800">{result.metrics.onTimeDeliveryRate}</p>
          </div>
        </div>
      </div>

      {/* Learning Insight Banner */}
      {result.learningInsights && (
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden border border-indigo-800">
           <div className="relative z-10">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-indigo-200">
                 <BrainCircuit className="w-6 h-6 text-purple-400" />
                 NeuroLoad Self-Learning Core
              </h3>
              <p className="text-white text-base leading-relaxed pl-8 border-l-4 border-purple-500 italic">
                "{result.learningInsights}"
              </p>
           </div>
           {/* Abstract Neural Nodes Background */}
           <div className="absolute right-0 bottom-0 w-64 h-64 bg-purple-600 rounded-full blur-[80px] opacity-30 -mr-10 -mb-10"></div>
           <div className="absolute left-10 top-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20"></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Visualizations */}
        <div className="space-y-6">
           {/* 3D Blueprint Visualizer */}
           <TruckVisualizer packages={packages} loadingPlan={result.loadingPlan} />
           
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> AI Risk Assessment
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed bg-amber-50 p-4 rounded-lg border border-amber-100">
                {result.riskAssessment}
              </p>
           </div>
        </div>

        {/* Right Col: Route & Logic */}
        <div className="space-y-6">
           <RouteVisualizer routePlan={result.routePlan} />
           
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-600" /> Strategic Logic
              </h3>
              <div className="prose prose-sm max-w-none text-slate-600">
                <p className="leading-relaxed whitespace-pre-line">
                  {result.explanation}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Model: Gemini 3 Pro</span>
                <span>Latency: ~1.8s</span>
                <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Validated</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationResult;