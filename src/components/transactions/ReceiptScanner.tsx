import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Scan, Check } from 'lucide-react';

// Simulated OCR results
const MOCK_RECEIPTS = [
  { description: 'BigBasket Grocery', amount: '1247', category: 'Food', type: 'expense' as const },
  { description: 'Reliance Fresh', amount: '856', category: 'Food', type: 'expense' as const },
  { description: 'Apollo Pharmacy', amount: '432', category: 'Bills', type: 'expense' as const },
  { description: 'Croma Electronics', amount: '2999', category: 'Shopping', type: 'expense' as const },
  { description: 'Shell Petrol Pump', amount: '1500', category: 'Transport', type: 'expense' as const },
  { description: 'Decathlon Sports', amount: '1890', category: 'Shopping', type: 'expense' as const },
  { description: 'Cafe Coffee Day', amount: '340', category: 'Food', type: 'expense' as const },
  { description: 'PVR Cinemas', amount: '750', category: 'Entertainment', type: 'expense' as const },
];

interface ReceiptScannerProps {
  onScanComplete: (data: { description: string; amount: string; category: string; type: 'income' | 'expense' }) => void;
}

export default function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState<'idle' | 'uploading' | 'scanning' | 'extracting' | 'done'>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<(typeof MOCK_RECEIPTS)[0] | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      startScanAnimation();
    };
    reader.readAsDataURL(file);
  }, []);

  const startScanAnimation = () => {
    setScanning(true);
    setScanPhase('uploading');

    setTimeout(() => setScanPhase('scanning'), 800);
    setTimeout(() => setScanPhase('extracting'), 2200);
    setTimeout(() => {
      const result = MOCK_RECEIPTS[Math.floor(Math.random() * MOCK_RECEIPTS.length)];
      setScanResult(result);
      setScanPhase('done');
    }, 3200);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleApply = () => {
    if (scanResult) {
      onScanComplete(scanResult);
      resetState();
    }
  };

  const resetState = () => {
    setScanning(false);
    setScanPhase('idle');
    setPreview(null);
    setScanResult(null);
  };

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {!scanning ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group ${
                dragActive
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-violet-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  dragActive
                    ? 'bg-violet-100 dark:bg-violet-900/30'
                    : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30'
                }`}>
                  <Camera className={`w-5 h-5 transition-colors ${
                    dragActive ? 'text-violet-500' : 'text-gray-400 group-hover:text-violet-500'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {dragActive ? 'Drop receipt here' : 'Scan Receipt'}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    Drag & drop or click to upload an image
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 rounded-xl overflow-hidden relative"
          >
            {/* Receipt Image with Scan Effect */}
            <div className="relative h-48 overflow-hidden">
              {preview && (
                <img
                  src={preview}
                  alt="Receipt"
                  className="w-full h-full object-cover opacity-60"
                />
              )}

              {/* Scanning Laser Line */}
              {(scanPhase === 'scanning' || scanPhase === 'extracting') && (
                <motion.div
                  className="absolute left-0 right-0 h-0.5 z-10"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #8B5CF6, #A78BFA, #8B5CF6, transparent)',
                    boxShadow: '0 0 20px 4px rgba(139, 92, 246, 0.4)',
                  }}
                  animate={{
                    top: ['0%', '100%', '0%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              )}

              {/* Grid Overlay */}
              {scanPhase === 'scanning' && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    backgroundImage: 'linear-gradient(rgba(139,92,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
              )}

              {/* Corner Brackets */}
              <div className="absolute inset-4 pointer-events-none">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-violet-400 rounded-tl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-violet-400 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-violet-400 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-violet-400 rounded-br" />
              </div>

              {/* Close button */}
              <button
                onClick={resetState}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white z-20"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Status Bar */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                {scanPhase === 'done' ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <Scan className="w-4 h-4 text-violet-400 animate-pulse" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">
                    {scanPhase === 'uploading' && 'Processing image...'}
                    {scanPhase === 'scanning' && 'Scanning receipt...'}
                    {scanPhase === 'extracting' && 'Extracting details...'}
                    {scanPhase === 'done' && 'Receipt scanned!'}
                  </p>
                  {scanPhase !== 'done' && (
                    <div className="mt-1.5 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{
                          width: scanPhase === 'uploading' ? '30%' : scanPhase === 'scanning' ? '70%' : '95%',
                        }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Scan Result */}
              {scanPhase === 'done' && scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 space-y-2"
                >
                  <div className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-400 font-medium">Merchant</span>
                    <span className="text-sm font-bold text-white">{scanResult.description}</span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-400 font-medium">Amount</span>
                    <span className="text-sm font-bold text-emerald-400">₹{scanResult.amount}</span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-400 font-medium">Category</span>
                    <span className="text-sm font-bold text-violet-400">{scanResult.category}</span>
                  </div>
                  <button
                    onClick={handleApply}
                    className="w-full mt-2 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-violet-600 hover:to-purple-700 transition-all"
                  >
                    Apply to Form
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
