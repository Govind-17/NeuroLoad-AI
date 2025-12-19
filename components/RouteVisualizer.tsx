import React from 'react';
import { RouteStop } from '../types';
import { MapPin, Truck, Clock, CheckCircle2, CloudLightning } from 'lucide-react';

interface RouteVisualizerProps {
  routePlan: RouteStop[];
}

const RouteVisualizer: React.FC<RouteVisualizerProps> = ({ routePlan }) => {
  return (
    <div className="w-full bg-white rounded-xl shadow-md p-6 border border-slate-200 h-full">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-indigo-600" /> Optimized Route Sequence
      </h3>

      <div className="relative pl-4 space-y-0">
        {/* Vertical Line */}
        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-indigo-100 z-0"></div>

        {routePlan.map((stop, index) => {
          const isFirst = index === 0;
          const isLast = index === routePlan.length - 1;

          return (
            <div key={index} className="relative z-10 flex gap-4 mb-8 last:mb-0 group">
              {/* Icon Node */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-4 
                ${isFirst ? 'bg-indigo-600 border-indigo-100 text-white' : 
                  isLast ? 'bg-green-600 border-green-100 text-white' : 
                  'bg-white border-indigo-100 text-indigo-600'}
                shadow-sm transition-transform group-hover:scale-110 shrink-0
              `}>
                {isFirst ? <Truck className="w-4 h-4" /> : 
                 isLast ? <CheckCircle2 className="w-4 h-4" /> : 
                 <span className="font-bold text-sm">{index + 1}</span>}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-800 text-base">{stop.city}</h4>
                  <div className="flex items-center text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                    <Clock className="w-3 h-3 mr-1" /> {stop.eta}
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                  {stop.activity}
                </p>
                {/* Weather Alert if present */}
                {stop.weatherAlert && (
                  <div className="mt-2 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                    <CloudLightning className="w-3 h-3 mt-0.5" />
                    <span>{stop.weatherAlert}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RouteVisualizer;
