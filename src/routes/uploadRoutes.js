import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Konfigurera sökväg för uppladdningar (från .env eller default)
const uploadDir = process.env.UPLOAD_DIR 
    ? path.resolve(process.env.UPLOAD_DIR)  // Gör relativ sökväg absolut
    : path.join(__dirname, '../../uploads/');

// Säkerställ att upload-mappen finns
try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Upload directory ensured: ${uploadDir}`);
}
catch (err) {
    console.error('Could not create upload directory:', err);
}


// Konfigurera multer för filuppladdning
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'prescription-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpg|jpeg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, JPG, and PNG files are allowed'));
        }
    }
});

// POST /api/upload/prescription
router.post('/prescription', upload.single('prescription'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        res.json({
            success: true,
            data: {
                fileId: req.file.filename,
                fileName: req.file.originalname,
                filePath: req.file.path,
                size: req.file.size
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;