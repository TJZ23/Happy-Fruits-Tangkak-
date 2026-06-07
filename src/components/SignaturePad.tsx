/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Invoice } from '../types';
import { Pen, Upload, Type, RotateCcw, Check, Sparkles } from 'lucide-react';

interface SignaturePadProps {
  invoice: Invoice;
  onChange: (updated: Invoice) => void;
  t: any;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ invoice, onChange, t }) => {
  const activeTab = invoice.signatureType || 'none';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#1e3a8a'); // default navy ink blue

  // Sync canvas brush color when pen changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [penColor, activeTab]);

  const handleTabChange = (type: 'draw' | 'upload' | 'text' | 'none') => {
    if (type === 'none') {
      onChange({
        ...invoice,
        signatureType: 'none',
        signatureImage: ''
      });
    } else if (type === 'text') {
      // Default printed stamp to company name or custom text
      onChange({
        ...invoice,
        signatureType: 'text',
        signatureImage: invoice.issuer.name || 'HAPPY FRUITS TANGKAK',
        signatureColor: invoice.signatureColor || 'red'
      });
    } else if (type === 'draw') {
      onChange({
        ...invoice,
        signatureType: 'draw',
        signatureImage: invoice.signatureImage && invoice.signatureType === 'draw' ? invoice.signatureImage : '',
        signatureColor: 'blue'
      });
    } else {
      onChange({
        ...invoice,
        signatureType: 'upload',
        signatureImage: invoice.signatureImage && invoice.signatureType === 'upload' ? invoice.signatureImage : ''
      });
    }
  };

  // Drawing pad handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      // Prevent screen drag-to-scroll on touch
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveDrawing();
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onChange({
      ...invoice,
      signatureType: 'draw',
      signatureImage: dataUrl,
      signatureColor: penColor === '#1e3a8a' ? 'blue' : penColor === '#ef4444' ? 'red' : 'black'
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange({
      ...invoice,
      signatureImage: '',
      signatureType: 'draw'
    });
  };

  // Image Upload handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        onChange({
          ...invoice,
          signatureType: 'upload',
          signatureImage: event.target.result as string
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Preset Typed stamp customizers
  const changeTypedStampWord = (text: string) => {
    onChange({
      ...invoice,
      signatureType: 'text',
      signatureImage: text
    });
  };

  const changeStampColor = (color: string) => {
    onChange({
      ...invoice,
      signatureColor: color
    });
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* 4 Tabs to toggle mode */}
      <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
        <button
          type="button"
          onClick={() => handleTabChange('none')}
          className={`py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition ${activeTab === 'none' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          No Stamp
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('draw')}
          className={`py-1.5 rounded flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider transition ${activeTab === 'draw' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Pen size={11} />
          Draw Ink
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('upload')}
          className={`py-1.5 rounded flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider transition ${activeTab === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Upload size={11} />
          Upload
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('text')}
          className={`py-1.5 rounded flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider transition ${activeTab === 'text' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Type size={11} />
          Stamp V2
        </button>
      </div>

      {/* Tab Area Content */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-inner">
        {activeTab === 'none' && (
          <div className="text-center py-5 text-slate-400 font-medium">
            No digital seal or signature selected. The signature field is printed blank for manual signing/stamping.
          </div>
        )}

        {activeTab === 'draw' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-600 block">Draw signature directly on pad:</span>
              <div className="flex items-center gap-1">
                {/* Ink Colors */}
                <button
                  type="button"
                  onClick={() => setPenColor('#1e3a8a')}
                  className={`w-4 h-4 rounded-full border ${penColor === '#1e3a8a' ? 'ring-2 ring-emerald-500 border-whiteScale' : 'border-slate-350'}`}
                  style={{ backgroundColor: '#1e3a8a' }}
                  title="Blue Blue ink Pen"
                ></button>
                <button
                  type="button"
                  onClick={() => setPenColor('#000000')}
                  className={`w-4 h-4 rounded-full border ${penColor === '#000000' ? 'ring-2 ring-emerald-500 border-whiteScale' : 'border-slate-350'}`}
                  style={{ backgroundColor: '#000000' }}
                  title="Black ink Pen"
                ></button>
                <button
                  type="button"
                  onClick={() => setPenColor('#ef4444')}
                  className={`w-4 h-4 rounded-full border ${penColor === '#ef4444' ? 'ring-2 ring-emerald-500 border-whiteScale' : 'border-slate-350'}`}
                  style={{ backgroundColor: '#ef4444' }}
                  title="Red ink Pen"
                ></button>
              </div>
            </div>

            <div className="relative border border-slate-300 rounded bg-slate-50 overflow-hidden select-none">
              <canvas
                ref={canvasRef}
                width={360}
                height={120}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[120px] bg-slate-50 cursor-crosshair block touch-none"
              />
              <button
                type="button"
                onClick={clearCanvas}
                className="absolute bottom-2 right-2 p-1.5 bg-white text-slate-500 hover:text-red-650 hover:bg-red-50 border border-slate-200 rounded transition shadow-sm font-semibold flex items-center gap-1 text-[10px]"
                title="Clear Signature Panel"
              >
                <RotateCcw size={10} /> Clear Pad
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              💡 Use your mouse pointer or touch screen/stylus to sign. Once done, the signature saves and updates our PDF preview real-time.
            </p>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-3">
            <span className="font-semibold text-slate-600 block">Import custom stamp or signature PNG:</span>
            
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50/50 p-4 rounded-lg text-center cursor-pointer relative transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="mx-auto text-slate-400 mb-2" size={20} />
              <p className="text-[11px] font-bold text-slate-700">Drag & drop or Click to choose image</p>
              <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JG, GIF. Transparent PNG works best!</p>
            </div>

            {invoice.signatureImage && invoice.signatureType === 'upload' && (
              <div className="mt-2 text-center p-2 border border-slate-200 rounded bg-slate-50 relative group">
                <p className="text-[9px] text-slate-400 font-mono mb-1 truncate">Loaded Seal Active:</p>
                <img 
                  src={invoice.signatureImage} 
                  alt="Saved Upload" 
                  className="max-h-16 mx-auto object-contain bg-white border border-slate-100 p-0.5 rounded shadow-sm"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'text' && (
          <div className="space-y-3 font-sans">
            <span className="font-bold text-slate-600 block uppercase tracking-wider text-[10px]">Customize Rubber Seal:</span>
            
            <div className="space-y-2">
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Company Seal Stamp Title</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded p-1.5 text-xs font-bold font-sans uppercase"
                  placeholder="e.g. HAPPY FRUITS TANGKAK"
                  value={invoice.signatureImage && invoice.signatureType === 'text' ? invoice.signatureImage : ''}
                  onChange={(e) => changeTypedStampWord(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Select Ink Color</label>
                <div className="flex gap-2">
                  {[
                    { key: 'red', name: 'Rubber Red', colorCode: '#dc2626' },
                    { key: 'blue', name: 'Ink Blue', colorCode: '#1e40af' },
                    { key: 'purple', name: 'Violet', colorCode: '#6d28d9' },
                    { key: 'black', name: 'Carbon Black', colorCode: '#111827' }
                  ].map((color) => (
                    <button
                      key={color.key}
                      type="button"
                      onClick={() => changeStampColor(color.key)}
                      className={`flex-1 py-1 rounded border text-[10px] font-bold transition flex items-center justify-center gap-1 border-slate-200 capitalize`}
                      style={{ 
                        color: invoice.signatureColor === color.key ? '#fff' : color.colorCode,
                        backgroundColor: invoice.signatureColor === color.key ? color.colorCode : '#fff',
                        borderColor: invoice.signatureColor === color.key ? color.colorCode : '#e2e8f0'
                      }}
                    >
                      <span className="w-2 h-2 rounded-full border border-white" style={{ backgroundColor: color.colorCode }}></span>
                      {color.key}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Micro Live Sandbox preview of stamp */}
            <div className="p-4 border border-slate-200 bg-slate-50 rounded flex justify-center items-center h-24 overflow-hidden">
              <div 
                className="rotate-[-2deg] select-none scale-90"
                style={{ color: invoice.signatureColor === 'blue' ? '#1e40af' : invoice.signatureColor === 'purple' ? '#6d28d9' : invoice.signatureColor === 'black' ? '#111827' : '#dc2626' }}
              >
                <div 
                  className="border-4 rounded-sm border-double px-3 py-1.5 text-center uppercase tracking-wider font-bold leading-tight"
                  style={{ 
                    borderColor: 'currentColor',
                    borderStyle: 'double',
                    borderWidth: '4px'
                  }}
                >
                  <div className="text-[6.5px] tracking-widest border-b pb-0.5 mb-1" style={{ borderColor: 'currentColor' }}>
                    ★ RECEIVED & APPROVED ★
                  </div>
                  <div className="text-[10px] font-sans font-black whitespace-nowrap px-1">
                    {invoice.signatureImage || 'HAPPY FRUITS TANGKAK'}
                  </div>
                  <div className="text-[6.5px] tracking-widest border-t pt-0.5 mt-1 font-mono" style={{ borderColor: 'currentColor' }}>
                    DATE: {invoice.date || '01/06/2026'}
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-[9.5px] text-slate-400 leading-normal">
              🎖️ Vintage Rubber Stamp style is embedded in vector format directly inside the document. It remains perfectly crisp at any print resolution/scale.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
