import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Trash2,
  Crop,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Shield,
  Eye
} from 'lucide-react';
import { Avatar } from './Avatar.js';
import { ImageCropModal } from './ImageCropModal.js';
import { useToast } from './Toast.js';

interface ProfilePhotoUploaderProps {
  currentPhotoUrl?: string | null;
  name: string;
  onPhotoUploaded: (photoUrl: string) => Promise<void> | void;
  onPhotoRemoved?: () => Promise<void> | void;
  isFounder?: boolean;
  size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showPrivacySelector?: boolean;
  avatarVisibility?: 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';
  onVisibilityChange?: (visibility: 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE') => void;
  className?: string;
}

export const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({
  currentPhotoUrl,
  name,
  onPhotoUploaded,
  onPhotoRemoved,
  isFounder = false,
  size = '2xl',
  showPrivacySelector = false,
  avatarVisibility = 'PUBLIC',
  onVisibilityChange,
  className = ''
}) => {
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedRawImage, setSelectedRawImage] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);

  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  // Handle file selection
  const processFile = (file: File) => {
    // 1. Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toastError('Unsupported format. Please select a JPEG, PNG, or WebP image.');
      return;
    }

    // 2. Validate Size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toastError(`File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Max limit is 5 MB.`);
      return;
    }

    // 3. Read image as Data URL for cropping
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setSelectedRawImage(e.target.result);
        setShowCropModal(true);
      }
    };
    reader.onerror = () => {
      toastError('Failed to read selected image');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Handle crop completion & upload
  const handleCropComplete = async (croppedDataUrl: string) => {
    setIsUploading(true);
    try {
      await onPhotoUploaded(croppedDataUrl);
      success(isFounder ? 'Founder profile photo updated!' : 'Profile photo updated successfully!');
    } catch (err: any) {
      console.error('Photo upload error:', err);
      toastError(err.message || 'Failed to upload photo. Please try again.');
      throw err;
    } finally {
      setIsUploading(false);
      setSelectedRawImage(null);
    }
  };

  // Handle photo removal
  const handleRemovePhoto = async () => {
    if (!onPhotoRemoved) return;
    setIsUploading(true);
    try {
      await onPhotoRemoved();
      success('Profile photo removed.');
      setShowConfirmRemove(false);
    } catch (err: any) {
      console.error('Photo remove error:', err);
      toastError(err.message || 'Failed to remove photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const hasCustomPhoto = Boolean(currentPhotoUrl && currentPhotoUrl.trim().length > 0);

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-6 ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Avatar Container with Dropzone & Overlay */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative rounded-full cursor-pointer transition-all duration-200 ${
          isDragging ? 'ring-4 ring-indigo-500 scale-105' : 'hover:opacity-95'
        }`}
      >
        <Avatar
          src={currentPhotoUrl}
          alt={name}
          size={size}
          className="shadow-md"
        />

        {/* Hover Camera Icon Overlay */}
        <div className="absolute inset-0 bg-slate-950/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
          <Camera className="w-6 h-6 mb-1 drop-shadow-sm" />
          <span className="text-[10px] font-bold tracking-wide uppercase">
            {hasCustomPhoto ? 'Change' : 'Upload'}
          </span>
        </div>

        {/* Loading Spinner */}
        {isUploading && (
          <div className="absolute inset-0 bg-slate-950/70 rounded-full flex items-center justify-center backdrop-blur-xs z-10">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Control Buttons & Details */}
      <div className="flex-1 text-center sm:text-left space-y-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
            <span>{isFounder ? 'Founder Profile Photo' : 'Profile Photo'}</span>
            {isFounder && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">
                Official
              </span>
            )}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Supported formats: JPEG, PNG, or WebP. Max file size: 5 MB.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          {/* Change / Upload Button */}
          <button
            id={isFounder ? 'founder-upload-photo-btn' : 'user-upload-photo-btn'}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{hasCustomPhoto ? 'Change Photo' : 'Upload Photo'}</span>
          </button>

          {/* Remove Button (Only visible if photo exists) */}
          {hasCustomPhoto && onPhotoRemoved && (
            <button
              id={isFounder ? 'founder-remove-photo-btn' : 'user-remove-photo-btn'}
              type="button"
              onClick={() => setShowConfirmRemove(true)}
              disabled={isUploading}
              className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>

        {/* Privacy Selector for Student Profile */}
        {showPrivacySelector && onVisibilityChange && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>Photo Visibility:</span>
            </div>
            <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800">
              {(['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'] as const).map(vis => (
                <button
                  key={vis}
                  type="button"
                  onClick={() => onVisibilityChange(vis)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    avatarVisibility === vis
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {vis === 'PUBLIC' && 'Public'}
                  {vis === 'FRIENDS_ONLY' && 'Friends Only'}
                  {vis === 'PRIVATE' && 'Restricted'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Crop Modal */}
      {selectedRawImage && (
        <ImageCropModal
          isOpen={showCropModal}
          imageSrc={selectedRawImage}
          title={isFounder ? 'Crop Founder Photo' : 'Crop Profile Photo'}
          onClose={() => {
            setShowCropModal(false);
            setSelectedRawImage(null);
          }}
          onCropComplete={handleCropComplete}
          outputSize={512}
        />
      )}

      {/* Confirm Remove Dialog */}
      {showConfirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Remove Profile Photo?
              </h3>
              <p className="text-xs text-slate-500">
                Your profile will default to your initials avatar. You can upload a new photo at any time.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmRemove(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
