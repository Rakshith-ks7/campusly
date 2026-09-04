import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Trash2, 
  Check, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { 
  validateProfileImage, 
  uploadProfilePhoto,
  MAX_FILE_SIZE_BYTES
} from '../services/storageService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentPhotoUrl?: string;
  onPhotoUploaded: (downloadUrl: string) => void;
  onPhotoRemoved: () => void;
}

export const ProfilePhotoUploadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userId,
  currentPhotoUrl,
  onPhotoUploaded,
  onPhotoRemoved,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMessage(null);
    setUploading(false);
    setUploadProgress(0);
  };

  const handleClose = () => {
    if (uploading) return; // Prevent closing while upload in progress
    handleReset();
    onClose();
  };

  const handleFileChange = (file: File) => {
    setErrorMessage(null);

    const validation = validateProfileImage(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file.');
      return;
    }

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId || uploading) return;

    setUploading(true);
    setErrorMessage(null);
    setUploadProgress(10);

    try {
      const downloadUrl = await uploadProfilePhoto(userId, selectedFile, (percent) => {
        setUploadProgress(percent);
      });

      onPhotoUploaded(downloadUrl);
      handleReset();
      onClose();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMessage(err.message || 'Failed to upload photo. Please try again.');
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (uploading) return;
    onPhotoRemoved();
    handleReset();
    onClose();
  };

  const isCustomPhoto = currentPhotoUrl && !currentPhotoUrl.startsWith('/avatars/');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !uploading) handleClose();
      }}
    >
      <div 
        className="bg-white border border-[#E5E5E5] rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-modal-title"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF1F2] border border-[#FFE4E6] flex items-center justify-center text-[#E63946]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 id="photo-modal-title" className="font-heading font-bold text-base text-[#262626]">
                Profile Photo
              </h3>
              <p className="text-[11px] text-[#666666]">
                JPG, PNG or WEBP (Max 5 MB)
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={uploading}
            aria-label="Close"
            className="p-2 rounded-xl text-[#999999] hover:text-[#262626] hover:bg-[#FFF8F8] disabled:opacity-40 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden Native File Input (Triggers File Explorer on Desktop, Native Gallery/Camera on Mobile) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onFileInputChange}
          disabled={uploading}
        />

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 flex-1">
          
          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Preview or Dropzone */}
          {previewUrl ? (
            /* Selected File Preview Mode */
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 bg-[#FFF8F8] border-2 border-dashed border-[#FECDD3] rounded-2xl">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Profile Preview"
                    className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-[#E63946]"
                  />
                  <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-[#E63946] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-xs font-semibold text-[#262626] truncate max-w-[240px]">
                    {selectedFile?.name}
                  </p>
                  <p className="text-[11px] text-[#666666] mt-0.5">
                    {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : ''} MB
                    <span className="text-emerald-600 font-medium ml-1.5">• Ready to upload</span>
                  </p>
                </div>
              </div>

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="space-y-1.5 p-3.5 bg-[#FFF1F2] border border-[#FFE4E6] rounded-xl">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#E63946]">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading to Firebase Storage...</span>
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[#FFE4E6] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#E63946] h-full rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons for Preview */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full py-3 px-4 bg-[#E63946] hover:bg-[#D62839] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer min-h-[44px]"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading Photo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload & Save Photo</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full sm:w-auto py-3 px-4 bg-white border border-[#E5E5E5] hover:bg-[#FFF8F8] text-[#262626] text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Choose Different</span>
                </button>
              </div>
            </div>
          ) : (
            /* Choose File Mode (Desktop dropzone & mobile tap target) */
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none ${
                  isDragOver
                    ? 'border-[#E63946] bg-[#FFF1F2]'
                    : 'border-[#E5E5E5] hover:border-[#FECDD3] bg-[#FFF8F8] hover:bg-[#FFF1F2]/50'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#FFE4E6] flex items-center justify-center text-[#E63946] shadow-xs mb-3">
                  <Upload className="w-6 h-6" />
                </div>

                <p className="font-heading font-semibold text-sm text-[#262626] text-center">
                  <span className="hidden sm:inline">Click to browse or drag & drop</span>
                  <span className="sm:hidden">Tap to choose from photos or camera</span>
                </p>

                <p className="text-xs text-[#666666] text-center mt-1">
                  Supports JPG, JPEG, PNG, or WEBP up to 5 MB
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-4 px-4 py-2 bg-white border border-[#E5E5E5] hover:border-[#FECDD3] hover:text-[#E63946] text-[#262626] text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <ImageIcon className="w-4 h-4 text-[#E63946]" />
                  <span>Select Image</span>
                </button>
              </div>

              {/* Current Photo & Remove Option */}
              {currentPhotoUrl && (
                <div className="p-3.5 bg-[#FFF8F8] border border-[#E5E5E5] rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentPhotoUrl}
                      alt="Current avatar"
                      className="w-10 h-10 rounded-full object-cover border border-[#E5E5E5] p-0.5 bg-white shrink-0"
                    />
                    <div>
                      <p className="text-xs font-semibold text-[#262626]">
                        {isCustomPhoto ? 'Custom Profile Photo' : 'Illustrated Avatar'}
                      </p>
                      <p className="text-[11px] text-[#666666]">
                        {isCustomPhoto ? 'Active photo stored in cloud' : 'Default avatar assigned'}
                      </p>
                    </div>
                  </div>

                  {isCustomPhoto && (
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer min-h-[36px]"
                      title="Remove uploaded photo and return to default avatar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-[#E5E5E5] bg-[#FFF8F8] rounded-b-3xl text-xs text-[#666666]">
          <span className="text-[11px] hidden sm:inline">
            Photos are automatically compressed to save data and load instantly.
          </span>
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-[#E5E5E5] hover:bg-[#FFF1F2] rounded-xl text-xs font-semibold text-[#262626] transition cursor-pointer min-h-[40px]"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
