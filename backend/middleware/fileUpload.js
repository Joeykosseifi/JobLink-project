import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Setup storage for CV uploads
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/cvs';
    
    try {
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`Created upload directory: ${uploadDir}`);
      }
      
      cb(null, uploadDir);
    } catch (error) {
      console.error(`Error creating upload directory: ${error.message}`);
      cb(new Error(`Could not access upload directory: ${error.message}`));
    }
  },
  filename: (req, file, cb) => {
    try {
      // Create unique filename using timestamp and original extension
      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
      console.log(`Generated filename: ${fileName} for original: ${file.originalname}`);
      cb(null, fileName);
    } catch (error) {
      console.error(`Error generating filename: ${error.message}`);
      cb(new Error(`Failed to process file: ${error.message}`));
    }
  }
});

// File filter to only allow certain file types
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  console.log(`Processing file upload: ${file.originalname}, type: ${file.mimetype}`);
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.error(`Invalid file type: ${file.mimetype}`);
    cb(new Error(`Only PDF and Word documents are allowed. Got: ${file.mimetype}`), false);
  }
};

// Export upload middleware for CVs
export const uploadCV = multer({
  storage: cvStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Error handling middleware
export const handleFileUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer error
    console.error(`Multer error: ${err.code} - ${err.message}`);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'fail',
        message: 'File size exceeds 5MB limit'
      });
    }
    return res.status(400).json({
      status: 'fail',
      message: `File upload error: ${err.message}`
    });
  } else if (err) {
    // Other errors
    console.error(`File upload error: ${err.message}`);
    return res.status(400).json({
      status: 'fail',
      message: err.message || 'File upload error'
    });
  }
  next();
}; 