
import React, { useState } from 'react';
import { ShieldCheck, FileText, Upload, BrainCircuit, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface VerificationModuleProps {
  onComplete: (data: any) => void;
}

const VerificationModule: React.FC<VerificationModuleProps> = ({ onComplete }) => {
  const [file, setFile] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const simulateOCR = async (base64Data: string) => {
    setIsAnalyzing(true);
    // In a real app, we'd send this to Gemini 1.5/2.5 Flash for vision extraction
    // Here we simulate the AI logic
    await new Promise(r => setTimeout(r, 2000));
    
    setResults({
      licenseNumber: "KA-01-2023-998822",
      expiryDate: "2032-12-31",
      vehicleClass: "Heavy Goods Vehicle",
      confidence: "98.4%",
      status: "VERIFIED"
    });
    setIsAnalyzing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile(reader.result as string);
        simulateOCR(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-10 bg-slate-900 text-white relative">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
             </div>
             <div>
                <h2 className="text-2xl font-black">AI Document OCR</h2>
                <p className="text-slate-400 text-sm">Verification via NeuroLoad Vision™</p>
             </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full"></div>
        </div>

        <div className="p-10 space-y-8">
          {!file ? (
            <label className="border-4 border-dashed border-slate-100 rounded-[32px] p-12 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group">
              <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-10 h-10 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <p className="text-xl font-black text-slate-800">Drop License Here</p>
              <p className="text-sm text-slate-500 mt-2">Upload your DL or Permit for AI verification</p>
            </label>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
               <div className="flex gap-6 items-start">
                  <div className="w-1/2 aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-200 relative">
                     <img src={file} className="w-full h-full object-cover grayscale-[0.5]" alt="Document" />
                     {isAnalyzing && (
                       <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm flex flex-col items-center justify-center">
                          <Loader2 className="w-10 h-10 text-white animate-spin mb-2" />
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">Vision Analyzing...</p>
                       </div>
                     )}
                  </div>

                  <div className="flex-1 space-y-4">
                     <h3 className="font-bold text-slate-400 text-xs uppercase flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-indigo-500" /> Extraction Results
                     </h3>
                     {results ? (
                       <div className="space-y-3">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <p className="text-[10px] font-bold text-slate-400 uppercase">License ID</p>
                             <p className="text-sm font-black text-slate-800 font-mono">{results.licenseNumber}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <p className="text-[10px] font-bold text-slate-400 uppercase">Expiry Status</p>
                             <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <p className="text-sm font-black text-emerald-600">Valid until {results.expiryDate}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             Confidence Score: {results.confidence}
                          </div>
                       </div>
                     ) : (
                       <div className="h-32 flex flex-col items-center justify-center text-slate-300">
                          <FileText className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-xs italic">Waiting for scan...</p>
                       </div>
                     )}
                  </div>
               </div>

               {results && (
                 <button 
                   onClick={() => onComplete(results)}
                   className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl shadow-xl transition-all"
                 >
                   Confirm & Proceed
                 </button>
               )}
               <button onClick={() => setFile(null)} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                  Retake Photo
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationModule;
