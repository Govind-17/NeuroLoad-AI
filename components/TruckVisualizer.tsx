import React from 'react';
import { Package, LoadingItem } from '../types';
import { Package as PackageIcon, ArrowUp, ArrowRight, Box, Scale, Info } from 'lucide-react';

interface TruckVisualizerProps {
  packages: Package[];
  loadingPlan: LoadingItem[];
}

const TruckVisualizer: React.FC<TruckVisualizerProps> = ({ packages, loadingPlan }) => {
  // Helper to get package details by ID
  const getPkg = (id: string) => packages.find(p => p.id === id);

  // Group items by broad position categories for visualization
  const frontItems = loadingPlan.filter(item => item.position.toLowerCase().includes('front'));
  const midItems = loadingPlan.filter(item => item.position.toLowerCase().includes('mid') || item.position.toLowerCase().includes('axle'));
  const rearItems = loadingPlan.filter(item => item.position.toLowerCase().includes('rear') || item.position.toLowerCase().includes('back'));

  // Fallback distribution if specific keywords aren't found (for robustness)
  const unclassified = loadingPlan.filter(item => 
    !frontItems.includes(item) && !midItems.includes(item) && !rearItems.includes(item)
  );
  
  if (unclassified.length > 0) {
     const chunk = Math.ceil(unclassified.length / 3);
     frontItems.push(...unclassified.slice(0, chunk));
     midItems.push(...unclassified.slice(chunk, chunk * 2));
     rearItems.push(...unclassified.slice(chunk * 2));
  }

  const renderPackageBlock = (item: LoadingItem) => {
    const pkg = getPkg(item.packageId);
    if (!pkg) return null;
    
    let borderColor = 'border-blue-500/50';
    let bgColor = 'bg-blue-500/20';
    let textColor = 'text-blue-200';

    if (pkg.fragility === 'High') {
      borderColor = 'border-red-500/50';
      bgColor = 'bg-red-500/20';
      textColor = 'text-red-200';
    } else if (pkg.fragility === 'Medium') {
      borderColor = 'border-amber-500/50';
      bgColor = 'bg-amber-500/20';
      textColor = 'text-amber-200';
    }
    
    return (
      <div key={item.packageId} className={`relative group p-2 mb-2 rounded border-2 ${borderColor} ${bgColor} backdrop-blur-sm flex flex-col items-center justify-center h-20 w-full transition-all hover:scale-105 hover:bg-opacity-40 cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.2)]`}>
        {pkg.fragility === 'High' && (
           <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-md font-bold">!</div>
        )}
        <Box className={`w-4 h-4 ${textColor} mb-1 opacity-70`} />
        <span className={`font-mono text-xs font-bold ${textColor}`}>{item.packageId}</span>
        <span className="text-[9px] text-slate-400 mt-0.5">{pkg.weight}kg</span>
        
        {/* Hover Blueprint Details */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 bg-slate-900 border border-slate-700 text-slate-300 text-xs p-3 rounded-lg z-50 shadow-2xl">
          <div className="flex justify-between items-center border-b border-slate-700 pb-1 mb-2">
            <span className="font-bold text-white">{pkg.id}</span>
            <span className="text-[10px] bg-slate-800 px-1 rounded">{pkg.dimensions}</span>
          </div>
          <div className="space-y-1">
             <div className="flex justify-between"><span>Dest:</span> <span className="text-white">{pkg.city}</span></div>
             <div className="flex justify-between"><span>Weight:</span> <span className="text-white">{pkg.weight} kg</span></div>
             <div className="flex justify-between"><span>Priority:</span> <span className={`${pkg.priority === 'Critical' ? 'text-red-400' : 'text-slate-400'}`}>{pkg.priority}</span></div>
             <div className="mt-2 pt-1 border-t border-slate-700 text-[10px] italic text-indigo-300">"{item.reason}"</div>
          </div>
          <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-700 transform rotate-45"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-slate-900 rounded-xl shadow-lg p-1 border border-slate-800">
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
           <PackageIcon className="w-5 h-5 text-indigo-500" /> 
           <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
             3D Load Configuration
           </span>
        </h3>
        <div className="flex gap-4 text-[10px] font-mono uppercase tracking-wider text-slate-500">
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-sm"></div> Std</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded-sm"></div> Fragile</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-sm"></div> High Priority</span>
        </div>
      </div>

      <div className="p-6 bg-[#0f172a] relative overflow-hidden">
        {/* Technical Grid Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }}>
        </div>

        <div className="relative w-full h-72 flex overflow-hidden rounded-lg border-2 border-dashed border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          
          {/* Truck Cab Representation */}
          <div className="w-16 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 flex flex-col items-center justify-center z-10 shadow-xl">
             <div className="text-slate-600 text-[10px] font-bold writing-vertical-lr rotate-180 tracking-[0.2em] uppercase">
               Engine / Cab
             </div>
             <div className="mt-4 w-1 h-12 bg-indigo-500/20 rounded-full"></div>
          </div>

          <div className="flex-1 flex divide-x-2 divide-dashed divide-slate-800/50">
            {/* Front Section (Deepest) */}
            <div className="flex-1 p-3 flex flex-col gap-2 relative">
              <div className="text-[10px] font-bold text-center text-slate-500 uppercase tracking-widest mb-1 flex justify-center items-center gap-1">
                 Zone A (Deep)
              </div>
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-2 content-start">
                {frontItems.map(renderPackageBlock)}
              </div>
            </div>

            {/* Mid Section (Axle) */}
            <div className="flex-1 p-3 flex flex-col gap-2 relative bg-indigo-900/5">
              <div className="text-[10px] font-bold text-center text-indigo-400 uppercase tracking-widest mb-1 flex justify-center items-center gap-1">
                 <Scale className="w-3 h-3" /> Axle Load
              </div>
              {/* Axle Indicator */}
              <div className="absolute top-0 bottom-0 left-0 right-0 border-x-4 border-indigo-500/5 pointer-events-none"></div>
              
              <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-2 content-start relative z-10">
                {midItems.map(renderPackageBlock)}
              </div>
            </div>

            {/* Rear Section (Door) */}
            <div className="flex-1 p-3 flex flex-col gap-2 relative">
               <div className="text-[10px] font-bold text-center text-slate-500 uppercase tracking-widest mb-1 flex justify-center items-center gap-1">
                 Zone C (Access)
               </div>
               <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-2 content-start">
                {rearItems.map(renderPackageBlock)}
              </div>
            </div>
          </div>

          {/* Door Indicator */}
           <div className="w-6 bg-slate-800 border-l-4 border-slate-700 flex items-center justify-center z-10">
              <div className="h-full w-[2px] border-l border-dashed border-slate-500 opacity-30"></div>
          </div>
        </div>
        
        {/* Legend / Flow */}
        <div className="flex justify-between text-[10px] text-slate-400 mt-3 px-20 font-mono">
          <div className="flex items-center gap-1"><ArrowRight className="w-3 h-3 text-slate-600"/> Last Out</div>
          <div className="flex items-center gap-1 text-indigo-400">Center of Gravity <Info className="w-3 h-3"/></div>
          <div className="flex items-center gap-1">First Out <ArrowRight className="w-3 h-3 text-slate-600"/></div>
        </div>
      </div>
    </div>
  );
};

export default TruckVisualizer;