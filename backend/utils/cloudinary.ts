import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

const hasCloudinaryConfig = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const isCloudinaryConfigured = () => hasCloudinaryConfig;

export const isCloudinaryUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  return /cloudinary\.com|res\.cloudinary\.com/i.test(url);
};

export const extractCloudinaryPublicId = (url?: string): string | null => {
  if (!isCloudinaryUrl(url)) return null;

  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split('/').filter(Boolean);
    const uploadIndex = segments.indexOf('upload');
    if (uploadIndex === -1) return null;

    const resourceSegments = [...segments.slice(uploadIndex + 1)];
    if (resourceSegments[0]?.startsWith('v') && /^v\d+$/.test(resourceSegments[0])) {
      resourceSegments.shift();
    }

    if (resourceSegments.length === 0) return null;

    const lastSegment = resourceSegments[resourceSegments.length - 1];
    const cleanedLast = lastSegment.includes('.') ? lastSegment.slice(0, lastSegment.lastIndexOf('.')) : lastSegment;

    const publicId = [...resourceSegments.slice(0, -1), cleanedLast].join('/');
    return publicId || null;
  } catch {
    return null;
  }
};

export const deleteCloudinaryResource = async (publicId: string): Promise<boolean> => {
  if (!publicId || !isCloudinaryConfigured()) return false;

  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return result?.result === 'ok' || result?.result === 'not found';
  } catch (error) {
    console.error('Cloudinary delete failed:', error);
    return false;
  }
};

export const deleteCloudinaryResourceByUrl = async (url?: string): Promise<boolean> => {
  if (!isCloudinaryUrl(url)) return false;

  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return false;

  return deleteCloudinaryResource(publicId);
};

export const cloudinaryService = cloudinary;
