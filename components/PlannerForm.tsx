
import React, { useState } from 'react';
import { Package, City, TruckConstraints, OptimizationInput, SimulationScenario } from '../types';
import { Trash2, Plus, ArrowRight, PackagePlus, Cloud, CloudRain, CloudLightning, Sun, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import { INITIAL_PACKAGES, INITIAL_CITIES, INITIAL_CONSTRAINTS, INITIAL_SCENARIO } from '../constants';

interface PlannerFormProps {
  onOptimize: (input: OptimizationInput) => void;
  isGenerating: boolean;
}

const PlannerForm: React.FC<PlannerFormProps> = ({ onOptimize, isGenerating }) => {
  // Use INITIAL_PACKAGES directly as it is now correctly typed as Package[]
  const [packages, setPackages] = useState<Package[]>(INITIAL_PACKAGES);
  const [cities, setCities] = useState<City[]>(INITIAL_CITIES);
  const [constraints, setConstraints] = useState<TruckConstraints>(INITIAL_CONSTRAINTS);
  const [scenario, setScenario] = useState<SimulationScenario>(INITIAL_SCENARIO);

  // Handlers for Packages
  const addPackage = () => {
    const newId = `P${100 + packages.length + 1}`;
    setPackages([...packages, { 
      id: newId, 
      weight: 10, 
      fragility: 'Low', 
      city: cities[0]?.name || 'Bangalore', 
      priority: 'Normal', 
      dimensions: '10x10x10' 
    }]);
  };

  const removePackage = (index: number) => {
    const newPkgs = [...packages];
    newPkgs.splice(index, 1);
    setPackages(newPkgs);
  };

  const updatePackage = (index: number, field: keyof Package, value: any) => {
    const newPkgs = [...packages];
    newPkgs[index] = { ...newPkgs[index], [field]: value };
    setPackages(newPkgs);
  };

  // Handlers for Cities
  const updateCity = (index: number, field: keyof City, value: any) => {
    const newCities = [...cities];
    newCities[index] = { ...newCities[index], [field]: value };
    setCities(newCities);
  };

  const handleSubmit = () => {
    onOptimize({ packages, cities, constraints, scenario });
  };

  const getWeatherIcon = (condition: string) => {
    switch(condition) {
      case 'Rain': return <CloudRain className="w-4 h-4 text-blue-500" />;
      case 'Storm': return <CloudLightning className="w-4 h-4 text-purple-600" />;
      case 'Snow': return <Cloud className="w-4 h-4 text-slate-400" />;
      default: return <Sun className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Packages */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <PackagePlus className="w-5 h-5 mr-2 text-indigo-600" />
              Manifest Management
            </h3>
            <button 
              onClick={addPackage}
              className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md font-medium flex items-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Package
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Weight (kg)</th>
                  <th className="px-4 py-3">Dimensions</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Fragility</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-2 font-mono font-medium text-slate-700">{pkg.id}</td>
                    <td className="px-4 py-2">
                      <input 
                        type="number" 
                        value={pkg.weight} 
                        onChange={(e) => updatePackage(idx, 'weight', parseFloat(e.target.value))}
                        className="w-16 bg-transparent border-b border-slate-300 focus:border-indigo-500 focus:outline-none text-slate-900 font-medium"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input 
                        type="text" 
                        value={pkg.dimensions} 
                        onChange={(e) => updatePackage(idx, 'dimensions', e.target.value)}
                        className="w-24 bg-transparent border-b border-slate-300 focus:border-indigo-500 focus:outline-none text-slate-900 font-medium"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select 
                        value={pkg.city}
                        onChange={(e) => updatePackage(idx, 'city', e.target.value)}
                        className="bg-transparent text-slate-700 focus:outline-none"
                      >
                        {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                       <select 
                        value={pkg.priority}
                        onChange={(e) => updatePackage(idx, 'priority', e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          pkg.priority === 'Critical' ? 'bg-red-100 text-red-700' : 
                          pkg.priority === 'Express' ? 'bg-blue-100 text-blue-700' : 
                          'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <option value="Normal">Normal</option>
                        <option value="Express">Express</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                       <select 
                        value={pkg.fragility}
                        onChange={(e) => updatePackage(idx, 'fragility', e.target.value)}
                        className="bg-transparent text-slate-700 focus:outline-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => removePackage(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Settings & Actions */}
      <div className="space-y-6">
        
        {/* Scenario "What-If" Engine */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100 p-6">
          <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" /> What-If Simulation
          </h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-500"/> Fuel Price
                </label>
                <select 
                   value={scenario.fuelPriceMultiplier}
                   onChange={(e) => setScenario({...scenario, fuelPriceMultiplier: parseFloat(e.target.value)})}
                   className="bg-white border border-indigo-200 text-xs rounded-md px-2 py-1 focus:outline-none focus:border-indigo-500 text-slate-900"
                >
                  <option value={1.0}>Normal</option>
                  <option value={1.2}>+20% Surge</option>
                  <option value={1.5}>+50% Crisis</option>
                </select>
             </div>
             <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-slate-500"/> Traffic Load
                </label>
                <select 
                   value={scenario.trafficSurgeMultiplier}
                   onChange={(e) => setScenario({...scenario, trafficSurgeMultiplier: parseFloat(e.target.value)})}
                   className="bg-white border border-indigo-200 text-xs rounded-md px-2 py-1 focus:outline-none focus:border-indigo-500 text-slate-900"
                >
                  <option value={1.0}>Standard</option>
                  <option value={1.3}>Busy Season</option>
                  <option value={1.8}>Holiday Peak</option>
                </select>
             </div>
             <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="holiday"
                  checked={scenario.isHolidaySeason}
                  onChange={(e) => setScenario({...scenario, isHolidaySeason: e.target.checked})}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="holiday" className="text-sm font-medium text-slate-700">Enable Holiday Logistics Logic</label>
             </div>
          </div>
        </div>

        {/* City Data & Conditions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Route Conditions</h3>
          <div className="space-y-3">
             {cities.map((city, idx) => (
               <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                 <div className="flex justify-between items-center font-semibold text-slate-700 mb-2">
                   {city.name}
                   <div className="flex gap-1">
                     {/* Weather Selector */}
                     <button 
                       onClick={() => updateCity(idx, 'weatherCondition', city.weatherCondition === 'Clear' ? 'Rain' : city.weatherCondition === 'Rain' ? 'Storm' : 'Clear')}
                       className="p-1 hover:bg-slate-200 rounded"
                       title={`Weather: ${city.weatherCondition}`}
                     >
                        {getWeatherIcon(city.weatherCondition)}
                     </button>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <select 
                       value={city.trafficCondition}
                       onChange={(e) => updateCity(idx, 'trafficCondition', e.target.value)}
                       className="bg-white border border-slate-200 rounded px-1 py-0.5 text-slate-900"
                    >
                      <option value="Low">Low Traffic</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Gridlock">Gridlock</option>
                    </select>
                    <span className="flex items-center justify-end text-slate-500">{city.distance} km</span>
                 </div>

                 <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-2">
                    <span>SLA: {city.prioritySla}h</span>
                 </div>
               </div>
             ))}
          </div>
        </div>
        
        {/* Truck Config */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <h3 className="text-sm font-bold text-slate-800 mb-3">Vehicle Specs</h3>
           <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-slate-400 font-bold">Max Kg</label>
                <input 
                  type="number" 
                  value={constraints.maxWeight} 
                  onChange={(e)=>setConstraints({...constraints, maxWeight: parseFloat(e.target.value)})} 
                  className="w-full text-sm bg-slate-50 border-b border-slate-200 focus:outline-none text-slate-900 font-medium p-1"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-slate-400 font-bold">Vol m³</label>
                <input 
                  type="number" 
                  value={constraints.volumeCapacity} 
                  onChange={(e)=>setConstraints({...constraints, volumeCapacity: parseFloat(e.target.value)})} 
                  className="w-full text-sm bg-slate-50 border-b border-slate-200 focus:outline-none text-slate-900 font-medium p-1"
                />
              </div>
           </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleSubmit}
          disabled={isGenerating}
          className={`
            w-full py-4 rounded-xl shadow-lg font-bold text-white text-lg flex items-center justify-center transition-all transform
            ${isGenerating ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 hover:scale-[1.02] hover:shadow-xl'}
          `}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Optimizing...
            </>
          ) : (
            <>
              Launch NeuroLoad <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>

      </div>
    </div>
  );
};

export default PlannerForm;
