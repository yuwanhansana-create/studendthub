import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Crop,
  Check,
  Upload,
  AlertCircle,
  Sparkles,
  Move
} from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  title?: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => Promise<void> | void;
  aspectRatio?: number; // 1 for square
  outputSize?: number; // default 512
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  title = 'Crop Profile Photo',
  onClose,
  onCropComplete,
  aspectRatio = 1,
  outputSize = 512
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset parameters when a new image is provided or modal opens
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setErrorMessage(null);
      setImageLoaded(false);
    }
  }, [isOpen, imageSrc]);

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle Touch Pan for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Execute Canvas Crop and Optimization
  const handleApplyCrop = async () => {
    if (!imageRef.current || !containerRef.current) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const img = imageRef.current;
      const cropBoxSize = Math.min(containerRef.current.clientWidth, containerRef.current.clientHeight) * 0.8;

      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context could not be created');
      }

      // Smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, outputSize, outputSize);

      // Translate to canvas center
      ctx.translate(outputSize / 2, outputSize / 2);
      ctx.rotate((rotation * Math.PI) / 180);

      // Calculate scale ratio between crop viewport and canvas output
      const scaleRatio = outputSize / cropBoxSize;
      const scaledWidth = img.naturalWidth * zoom * scaleRatio;
      const scaledHeight = img.naturalHeight * zoom * scaleRatio;

      const drawX = offset.x * scaleRatio - scaledWidth / 2;
      const drawY = offset.y * scaleRatio - scaledHeight / 2;

      ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);

      // Export as optimized WebP (fallback to JPEG if webp not supported)
      let dataUrl = canvas.toDataURL('image/webp', 0.90);
      if (!dataUrl.startsWith('data:image/webp')) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.90);
      }

      await onCropComplete(dataUrl);
      onClose();
    } catch (err: any) {
      console.error('Crop error:', err);
      setErrorMessage(err.message || 'Failed to crop and process image');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="text-[11px] text-slate-500">Drag to reposition, zoom, and crop to a square</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Crop Viewport */}
        <div className="relative p-6 flex flex-col items-center justify-center bg-slate-950/90 overflow-hidden">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed border-indigo-500/40 select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* Background image manipulated by transform */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              draggable={false}
              onLoad={() => setImageLoaded(true)}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                maxWidth: 'none',
                userSelect: 'none'
              }}
              className="absolute max-h-none pointer-events-none"
            />

            {/* Circular Crop Overlay Guide */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                {/* Center crosshair */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="w-full h-[1px] bg-white"></div>
                  <div className="h-full w-[1px] bg-white absolute"></div>
                </div>
              </div>
            </div>

            {/* Reposition hint badge */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white/90 flex items-center gap-1.5 pointer-events-none">
              <Move className="w-3 h-3" />
              <span>Drag to Pan</span>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-3 w-full max-w-sm px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-4">
            {/* Zoom Slider */}
            <div className="flex-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={e => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <button
                type="button"
                onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-medium text-slate-500 w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Rotate Button */}
            <button
              type="button"
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setRotation(0);
                setOffset({ x: 0, y: 0 });
              }}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Reset
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplyCrop}
                disabled={isProcessing || !imageLoaded}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Optimizing & Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Crop & Save Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
