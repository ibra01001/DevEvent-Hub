import { Router } from 'express';
import multer from 'multer';
import {
  cloudinaryService,
  deleteCloudinaryResource,
  deleteCloudinaryResourceByUrl,
  extractCloudinaryPublicId,
  isCloudinaryConfigured
} from '../utils/cloudinary.ts';

const router = Router();
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return callback(new Error('Only JPG, PNG, WEBP, GIF, and AVIF images are allowed.'));
    }

    callback(null, true);
  }
});

router.post('/upload', (req, res) => {
  upload.single('image')(req, res, async (error: any) => {
    try {
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message || 'The uploaded file is invalid.'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file was provided.'
        });
      }

      if (!isCloudinaryConfigured()) {
        return res.status(500).json({
          success: false,
          message: 'Cloudinary is not configured. Add the Cloudinary environment variables.'
        });
      }

      const rawFolderName = typeof req.body.folder === 'string' ? req.body.folder : 'untitled-event';
      const safeFolderName = rawFolderName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'untitled-event';

      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const result = await cloudinaryService.uploader.upload(base64, {
        folder: `devevent/events/${safeFolderName}`,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      });

      return res.status(200).json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id
        },
        message: 'Image uploaded successfully.'
      });
    } catch (uploadError: any) {
      return res.status(500).json({
        success: false,
        message: 'Image upload failed.',
        error: uploadError?.message || 'Unknown upload error'
      });
    }
  });
});

router.delete('/upload', async (req, res) => {
  try {
    const publicId = typeof req.query.publicId === 'string' ? req.query.publicId : '';
    const imageUrl = typeof req.query.imageUrl === 'string' ? req.query.imageUrl : '';
    const resolvedPublicId = publicId || extractCloudinaryPublicId(imageUrl);

    if (!resolvedPublicId) {
      return res.status(400).json({
        success: false,
        message: 'A Cloudinary publicId or image URL is required.'
      });
    }

    const deleted = await deleteCloudinaryResource(resolvedPublicId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'The image could not be removed from Cloudinary.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Image removed from Cloudinary successfully.'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to remove the image from Cloudinary.',
      error: error?.message || 'Unknown deletion error'
    });
  }
});

router.delete('/upload/by-url', async (req, res) => {
  try {
    const imageUrl = typeof req.query.imageUrl === 'string' ? req.query.imageUrl : '';

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'An image URL is required.'
      });
    }

    const deleted = await deleteCloudinaryResourceByUrl(imageUrl);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'The image could not be removed from Cloudinary.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Image removed from Cloudinary successfully.'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to remove the image from Cloudinary.',
      error: error?.message || 'Unknown deletion error'
    });
  }
});

export default router;
