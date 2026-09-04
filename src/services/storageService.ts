import { 
  storage, 
  storageRef, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from './firebase';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates file size (max 5 MB) and accepted image extensions (JPG, JPEG, PNG, WEBP)
 */
export function validateProfileImage(file: File): ImageValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Check file type
  const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
  const fileName = file.name.toLowerCase();
  const hasValidExtension = /\.(jpe?g|png|webp)$/i.test(fileName);

  if (!isMimeValid && !hasValidExtension) {
    return {
      valid: false,
      error: 'Unsupported file format. Please choose a JPG, JPEG, PNG, or WEBP image.'
    };
  }

  // Check file size (5 MB limit)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size is ${sizeInMb} MB. Maximum allowed size is 5.0 MB.`
    };
  }

  return { valid: true };
}

/**
 * Compresses/resizes large images in browser using HTML5 Canvas to optimize storage and upload speed
 */
export async function compressProfileImage(
  file: File,
  maxDimension = 1000,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If not in browser environment or file is not an image
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Only resize if exceeds maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      // Smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Determine output format
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to process and compress selected image.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Uploads a profile photo to Firebase Storage under `profilePhotos/{userId}/profile_{timestamp}.{ext}`
 * Reports upload progress via callback
 * Returns download URL
 */
export async function uploadProfilePhoto(
  userId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!userId) {
    throw new Error('User ID is required to upload a profile photo.');
  }

  // Validate first
  const validation = validateProfileImage(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid profile photo.');
  }

  // Compress
  let uploadBlob: Blob;
  try {
    uploadBlob = await compressProfileImage(file, 1000, 0.85);
  } catch (err) {
    console.warn('Image compression fallback to original file:', err);
    uploadBlob = file;
  }

  // Determine file extension
  let extension = 'jpg';
  if (file.type === 'image/png') extension = 'png';
  else if (file.type === 'image/webp') extension = 'webp';
  else if (file.name.endsWith('.webp')) extension = 'webp';
  else if (file.name.endsWith('.png')) extension = 'png';

  // Storage path: profilePhotos/{userId}/profile.{extension} (with timestamp to bust cache)
  const path = `profilePhotos/${userId}/profile_${Date.now()}.${extension}`;
  const fileRef = storageRef(storage, path);

  const metadata = {
    contentType: uploadBlob.type || file.type || 'image/jpeg',
    customMetadata: {
      userId,
      uploadedAt: new Date().toISOString()
    }
  };

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(fileRef, uploadBlob, metadata);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress?.(progress);
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        let userMessage = 'Failed to upload photo. Please check your internet connection.';
        if (error.code === 'storage/unauthorized') {
          userMessage = 'Permission denied. Please ensure you are logged in to update your photo.';
        } else if (error.code === 'storage/canceled') {
          userMessage = 'Photo upload was canceled.';
        } else if (error.code === 'storage/quota-exceeded') {
          userMessage = 'Storage quota exceeded. Please contact support.';
        }
        reject(new Error(userMessage));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          onProgress?.(100);
          resolve(downloadUrl);
        } catch (err) {
          reject(new Error('Failed to retrieve uploaded photo URL.'));
        }
      }
    );
  });
}

/**
 * Safely delete photo from Firebase Storage if given a storage URL
 */
export async function deleteProfilePhotoByUrl(photoUrl: string): Promise<void> {
  if (!photoUrl || !photoUrl.includes('firebasestorage.googleapis.com')) {
    return;
  }

  try {
    const photoRef = storageRef(storage, photoUrl);
    await deleteObject(photoRef);
  } catch (err: any) {
    // Ignore if file doesn't exist or already removed
    if (err.code !== 'storage/object-not-found') {
      console.warn('Could not delete old profile photo from Storage:', err);
    }
  }
}
