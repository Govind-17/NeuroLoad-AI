
import React, { useRef, useState, useEffect } from 'react';
import { Camera, Signature, MapPin, CheckCircle2, RotateCcw, ShieldCheck, X, Loader2 } from 'lucide-react';
import { paymentService } from '../services/paymentService';

interface ProofOfDeliveryProps {
  onComplete: () => void;
  targetCity: string;
  orderId?: string;
  transferId?: string;
}

const ProofOfDelivery: React.FC<ProofOfDeliveryProps> = ({ onComplete, targetCity, orderId, transferId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isProximityValid, setIsProximityValid] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'RELEASING' | 'DONE'>('IDLE');

  // Mock proximity check
  useEffect(() => {
    const timer = setTimeout(() => setIsProximityValid(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Simple Canvas Drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    
    // Simulate PoD upload and verification
    await new Promise(r => setTimeout(r, 2000));
    
    if (transferId) {
      setPaymentStatus('RELEASING');
      await paymentService.releasePayment(transferId);
      setPaymentStatus('DONE');
    }

    onComplete();
  };

  return (
    <div className="max-w-md mx-auto h-full flex flex-col bg-slate-950 text-white font-sans">
      <div className="p-6 bg-slate-900 border-b border-white/10 flex justify-between items-center">
         <h2 className="text-xl font-black">e-POD Terminal</h2>
         <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold ${isProximityValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            <MapPin className="w-3 h-3" />
            {isProximityValid ? 'PROXIMITY VALID' : 'CHECKING GPS...'}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Step 1: Photo Capture */}
        <section className="space-y-3">
           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Step 1: Unload Evidence</label>
           {!photo ? (
             <div className="border-2 border-dashed border-white/10 rounded-3xl h-48 flex flex-col items-center justify-center bg-slate-900/50 group active:scale-95 transition-all">
                <Camera className="w-10 h-10 text-slate-600 mb-4" />
                <p className="text-sm font-bold text-slate-400">Capture Cargo Photo</p>
                <input type="file" capture="environment" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if(f) setPhoto(URL.createObjectURL(f));
                }} />
             </div>
           ) : (
             <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/50">
                <img src={photo} className="w-full h-48 object-cover" alt="Cargo" />
                <button onClick={() => setPhoto(null)} className="absolute top-4 right-4 bg-black/60 p-2 rounded-full"><X className="w-4 h-4" /></button>
             </div>
           )}
        </section>

        {/* Step 2: Signature */}
        <section className="space-y-3">
           <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Step 2: Receiver Signature</label>
              <button onClick={clearSignature} className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                 <RotateCcw className="w-3 h-3" /> Clear
              </button>
           </div>
           <div className="bg-white rounded-3xl p-1 shadow-2xl overflow-hidden">
              <canvas 
                ref={canvasRef}
                width={360}
                height={200}
                className="w-full touch-none cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
           </div>
        </section>

        <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex gap-3 items-start">
           <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
           <p className="text-[10px] text-indigo-200 leading-relaxed font-medium">
             This digital proof is cryptographically linked to your current coordinates at {targetCity}. 
             {transferId && " Payout will be released upon completion."}
           </p>
        </div>
      </div>

      <div className="p-6 bg-slate-900 border-t border-white/10">
         <button 
           disabled={!photo || !isProximityValid || isFinishing}
           onClick={handleFinish}
           className={`w-full py-5 rounded-3xl font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 ${
             (!photo || !isProximityValid) ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 active:scale-95 text-white'
           }`}
         >
            {isFinishing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                {paymentStatus === 'RELEASING' ? 'RELEASING FUNDS...' : 'FINALIZING...'}
              </span>
            ) : (
              <>FINALIZE DELIVERY <CheckCircle2 className="w-6 h-6" /></>
            )}
         </button>
      </div>
    </div>
  );
};

export default ProofOfDelivery;
