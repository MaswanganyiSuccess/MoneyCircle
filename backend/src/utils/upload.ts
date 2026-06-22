import path from 'path';
import fs from 'fs';

export const uploadToCloud = async (file: Express.Multer.File): Promise<string> => {
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const fileName = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, file.buffer);
  // For production, replace with S3 or cloud storage URL
  return `/uploads/${fileName}`;
};