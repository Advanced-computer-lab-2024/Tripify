import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import fs from 'fs';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Extended path mapping for different document types
    switch (file.fieldname) {
      case 'identificationDocument':
        uploadPath += 'documents/id/';
        break;
      case 'certificate':
        uploadPath += 'documents/certificates/';
        break;
      case 'businessLicense':
        uploadPath += 'documents/licenses/';
        break;
      default:
        uploadPath += 'documents/others/';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Enhanced file filter to support more document types
const fileFilter = (req, file, cb) => {
  // Allow both images and PDFs for business documents
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF) and PDF documents are allowed'), false);
  }
};

// Create multer upload middleware
export const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 2 // Maximum number of files per request
  }
});

// Configure file uploads and static serving
export const configureFileUploads = (app) => {
  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Create required directories
  const dirs = [
    'uploads/documents/id',
    'uploads/documents/certificates',
    'uploads/documents/licenses',
    'uploads/documents/others'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });

  // Enhanced error handling middleware for file uploads
  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      let errorMessage = "File upload error";
      
      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          errorMessage = 'File is too large. Maximum size is 5MB';
          break;
        case 'LIMIT_FILE_COUNT':
          errorMessage = 'Too many files uploaded';
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          errorMessage = 'Unexpected field name in upload';
          break;
      }

      return res.status(400).json({
        message: errorMessage,
        error: err.message
      });
    }
    
    if (err && err.message.includes('Only image files')) {
      return res.status(400).json({
        message: 'Invalid file type',
        error: err.message
      });
    }

    next(err);
  });
};

// Helper function to clean up uploaded files
export const cleanupFiles = (files) => {
  if (files) {
    Object.values(files).forEach((fileArray) => {
      fileArray.forEach((file) => {
        try {
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error('Error deleting file:', error);
        }
      });
    });
  }
};

// Export everything needed
export default { 
  uploadMiddleware, 
  configureFileUploads,
  cleanupFiles
};