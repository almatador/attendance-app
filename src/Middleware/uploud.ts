import path from 'path';
import multer from 'multer';

export const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // مجلد التخزين
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // اسم الملف الفريد
    }
});

const upload = multer({ storage });
export default upload;
