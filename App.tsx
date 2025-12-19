
import React, { useState, useEffect } from 'react';
import { Brain, LayoutDashboard, Map, Settings, Menu, X, Github, LocateFixed, ShoppingBag, UserCheck, ShieldPlus, ChevronRight, FileCheck, CheckCircle2, Wallet } from 'lucide-react';
import Snowfall from 'react-snowfall';
import Dashboard from './components/Dashboard';
import PlannerForm from './components/PlannerForm';
import OptimizationResult from './components/OptimizationResult';
import LiveMap from './components/LiveMap';
import MarketplaceFeed from './components/MarketplaceFeed';
import VehicleRegistry from './components/VehicleRegistry';
import VerificationModule from './components/VerificationModule';
import ProofOfDelivery from './components/ProofOfDelivery';
import PaymentStatus from './components/PaymentStatus';
import { AppView, OptimizationInput, AiResponse, UserRole, User, Vehicle, Order } from './types';
import { generateOptimizationPlan } from './services/geminiService';
import { paymentService } from './services/paymentService';
import { APP_NAME, INITIAL_CITIES, MOCK_MARKETPLACE_ORDERS } from './constants';

const StatusStepper: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const steps = ['PENDING', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED'];
  const currentIndex = steps.indexOf(status);
  
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-6">
       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Shipment Lifecycle</h3>
       <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}></div>
          
          {steps.map((step, idx) => (
            <div key={step} className="relative z-10 flex flex-col items-center">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                 idx <= currentIndex ? 'bg-indigo-600 border-indigo-200 text-white' : 'bg-white border-slate-200 text-slate-300'
               }`}>
                  {idx < currentIndex ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
               </div>
               <p className={`text-[8px] font-black mt-2 uppercase tracking-tighter ${idx <= currentIndex ? 'text-indigo-600' : 'text-slate-400'}`}>
                 {step.replace('_', ' ')}
               </p>
            </div>
          ))}
       </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.ONBOARDING);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [optimizationInput, setOptimizationInput] = useState<OptimizationInput | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<AiResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deploymentId, setDeploymentId] = useState<number>(0);

  const [availableOrders, setAvailableOrders] = useState<Order[]>(MOCK_MARKETPLACE_ORDERS);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const isDriverMode = new URLSearchParams(window.location.search).get('mode') === 'driver';

  useEffect(() => {
    const savedUser = localStorage.getItem('neuroload_user');
    const savedVehicle = localStorage.getItem('neuroload_vehicle');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setCurrentView(AppView.DASHBOARD);
    }
    if (savedVehicle) {
      setActiveVehicle(JSON.parse(savedVehicle));
    }
  }, []);

  const handleSetRole = (role: UserRole) => {
    const user: User = {
      id: `USR-${Math.floor(Math.random() * 1000)}`,
      name: role === UserRole.SHIPPER ? 'Strategic Shipper' : 'Pro Carrier',
      role: role
    };
    setCurrentUser(user);
    localStorage.setItem('neuroload_user', JSON.stringify(user));
    
    if (role === UserRole.CARRIER) {
      setCurrentView(AppView.REGISTRY);
    } else {
      setCurrentView(AppView.DASHBOARD);
    }
  };

  const handleVehicleRegistered = (vehicle: Vehicle) => {
    setActiveVehicle(vehicle);
    localStorage.setItem('neuroload_vehicle', JSON.stringify(vehicle));
    setCurrentView(AppView.VERIFICATION);
  };

  const handleVerificationComplete = (results: any) => {
    if (activeVehicle) {
      const updatedVehicle = { ...activeVehicle, isVerified: true, linkedAccountId: `acc_${Math.random().toString(36).substr(2, 9)}` };
      setActiveVehicle(updatedVehicle);
      localStorage.setItem('neuroload_vehicle', JSON.stringify(updatedVehicle));
    }
    setCurrentView(AppView.DASHBOARD);
  };

  const handleAcceptOrder = async (order: Order) => {
    // 1. Setup payment escrow via Razorpay Route
    const payment = await paymentService.createEscrowPayment(order.orderId, order.price, 'acc_mock_carrier');
    
    const updatedOrder: Order = { 
      ...order, 
      status: 'ACCEPTED', 
      paymentStatus: payment.status,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayTransferId: payment.razorpayTransferId
    };

    setActiveOrder(updatedOrder);
    setOptimizationInput(updatedOrder);
    setCurrentView(AppView.PLANNER);
  };

  const handleOptimize = async (input: OptimizationInput) => {
    setIsGenerating(true);
    setError(null);
    setOptimizationInput(input);
    
    try {
      const result = await generateOptimizationPlan(input);
      setOptimizationResult(result);
      setCurrentView(AppView.RESULTS);
    } catch (err) {
      setError("Failed to generate plan.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeploy = () => {
    if (activeOrder) setActiveOrder({ ...activeOrder, status: 'IN_TRANSIT' });
    setDeploymentId(Date.now()); 
    setCurrentView(AppView.TRACKING);
  };

  const handlePodComplete = async () => {
    if (activeOrder) {
      // Funds were released within the PoD component via the paymentService
      setActiveOrder({ ...activeOrder, status: 'DELIVERED', paymentStatus: 'RELEASED' });
    }
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    localStorage.removeItem('neuroload_user');
    localStorage.removeItem('neuroload_vehicle');
    setCurrentUser(null);
    setActiveVehicle(null);
    setCurrentView(AppView.ONBOARDING);
  };

  if (isDriverMode) {
    if (currentView === AppView.POD) {
       return (
        <ProofOfDelivery 
          targetCity="Chennai Hub" 
          orderId={activeOrder?.orderId}
          transferId={activeOrder?.razorpayTransferId}
          onComplete={handlePodComplete} 
        />
       );
    }
    return (
      <div className="relative h-screen">
        <LiveMap 
          key="driver-mode" 
          routePlan={optimizationResult?.routePlan || []} 
          cities={optimizationInput?.cities || INITIAL_CITIES} 
        />
        <button 
          onClick={() => setCurrentView(AppView.POD)}
          className="absolute bottom-32 right-4 z-[100] bg-emerald-600 p-4 rounded-full shadow-2xl animate-bounce"
        >
          <FileCheck className="w-8 h-8 text-white" />
        </button>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <div className="space-y-6">
            {activeOrder && <StatusStepper status={activeOrder.status} />}
            <Dashboard onChangeView={setCurrentView} />
          </div>
        );
      case AppView.PLANNER:
        return <PlannerForm onOptimize={handleOptimize} isGenerating={isGenerating} />;
      case AppView.MARKETPLACE:
        return <MarketplaceFeed orders={availableOrders} activeVehicle={activeVehicle} onAcceptOrder={handleAcceptOrder} />;
      case AppView.REGISTRY:
        return <VehicleRegistry currentUser={currentUser!} onRegistered={handleVehicleRegistered} />;
      case AppView.VERIFICATION:
        return <VerificationModule onComplete={handleVerificationComplete} />;
      case AppView.PAYMENT:
        if (!activeOrder) return <div>No active payment.</div>;
        return <PaymentStatus status={activeOrder.paymentStatus} amount={activeOrder.price} orderId={activeOrder.orderId} onViewOrder={() => setCurrentView(AppView.TRACKING)} />;
      case AppView.RESULTS:
        if (!optimizationResult || !optimizationInput) return <div>No results.</div>;
        return <OptimizationResult result={optimizationResult} packages={optimizationInput.packages} onDeploy={handleDeploy} />;
      case AppView.TRACKING:
        return (
          <div className="h-full flex flex-col">
             {activeOrder && <StatusStepper status={activeOrder.status} />}
             <LiveMap 
               key={deploymentId} 
               routePlan={optimizationResult?.routePlan || []} 
               cities={optimizationInput?.cities || INITIAL_CITIES} 
             />
          </div>
        );
      default:
        return <Dashboard onChangeView={setCurrentView} />;
    }
  };

  if (currentView === AppView.ONBOARDING && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        <Snowfall 
          color="#cbd5e1" 
          snowflakeCount={150} 
          style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 1, pointerEvents: 'none' }} 
        />
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-white">
            <div className="bg-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mb-8">
              <Brain className="w-10 h-10" />
            </div>
            <h1 className="text-6xl font-black mb-6">NeuroLoad</h1>
            <p className="text-xl text-slate-400">The first AI-native logistics marketplace.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[48px] border border-white/10 space-y-6">
             <button onClick={() => handleSetRole(UserRole.SHIPPER)} className="w-full bg-white text-slate-900 p-6 rounded-[32px] flex items-center justify-between group hover:scale-[1.02] transition-transform">
               <div className="flex items-center gap-5">
                  <div className="bg-indigo-100 p-4 rounded-2xl text-indigo-600"><ShieldPlus className="w-6 h-6" /></div>
                  <div className="text-left">
                    <p className="font-black text-lg">Shipper</p>
                    <p className="text-xs text-slate-500">Post loads</p>
                  </div>
               </div>
               <ChevronRight className="w-6 h-6" />
             </button>
             <button onClick={() => handleSetRole(UserRole.CARRIER)} className="w-full bg-indigo-600 text-white p-6 rounded-[32px] flex items-center justify-between group hover:scale-[1.02] transition-transform">
               <div className="flex items-center gap-5">
                  <div className="bg-white/10 p-4 rounded-2xl text-white"><UserCheck className="w-6 h-6" /></div>
                  <div className="text-left">
                    <p className="font-black text-lg">Carrier</p>
                    <p className="text-xs text-indigo-200">Drive gigs</p>
                  </div>
               </div>
               <ChevronRight className="w-6 h-6" />
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 relative">
      <Snowfall 
        color="#94a3b8" 
        snowflakeCount={100} 
        style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none', opacity: 0.4 }} 
      />
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-white p-8 relative z-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-xl"><Brain className="w-6 h-6" /></div>
          <span className="text-xl font-black">{APP_NAME}</span>
        </div>
        <nav className="flex-1 space-y-2">
           <button onClick={() => setCurrentView(AppView.DASHBOARD)} className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all ${currentView === AppView.DASHBOARD ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>Dashboard</button>
           {currentUser?.role === UserRole.CARRIER && <button onClick={() => setCurrentView(AppView.MARKETPLACE)} className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all ${currentView === AppView.MARKETPLACE ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>Order Board</button>}
           {currentUser?.role === UserRole.SHIPPER && <button onClick={() => setCurrentView(AppView.PLANNER)} className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all ${currentView === AppView.PLANNER ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>Ship Planner</button>}
           <button onClick={() => setCurrentView(AppView.TRACKING)} className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all ${currentView === AppView.TRACKING ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>Live Fleet</button>
           {activeOrder && (
             <button onClick={() => setCurrentView(AppView.PAYMENT)} className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all ${currentView === AppView.PAYMENT ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>
                <div className="flex items-center gap-2"><Wallet className="w-4 h-4" /> Payment</div>
             </button>
           )}
        </nav>
        <button onClick={handleLogout} className="mt-auto py-3 text-slate-500 font-bold hover:text-white transition-colors">Logout</button>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-10">
          <h1 className="text-xl font-black uppercase tracking-widest">{currentView}</h1>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-xs font-bold text-slate-400 leading-none">Status</p>
                <p className="text-xs font-black text-emerald-600 mt-1 uppercase">AI SYNCED</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">{currentUser?.name.charAt(0)}</div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-10">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
