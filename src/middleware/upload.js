const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { logger } = require('./logger');

// 업로드 디렉토리 생성
const ensureUploadDir = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

// 파일 필터링 (이미지만 허용)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.'), false);
  }
};

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    await ensureUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// 메모리 저장 (이미지 처리용)
const memoryStorage = multer.memoryStorage();

// 기본 업로드 설정
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
    files: 5 // 최대 5개 파일
  }
});

// 메모리 업로드 설정 (이미지 처리용)
const memoryUpload = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
    files: 5 // 최대 5개 파일
  }
});

// 이미지 최적화 함수
const optimizeImage = async (buffer, options = {}) => {
  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'jpeg'
  } = options;

  try {
    let sharpInstance = sharp(buffer);

    // 이미지 크기 조정
    sharpInstance = sharpInstance.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    });

    // 포맷별 최적화
    switch (format) {
      case 'jpeg':
      case 'jpg':
        sharpInstance = sharpInstance.jpeg({ quality });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ quality });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality });
        break;
      default:
        sharpInstance = sharpInstance.jpeg({ quality });
    }

    return await sharpInstance.toBuffer();
  } catch (error) {
    logger.error('Image optimization error', { error: error.message });
    throw new Error('이미지 최적화에 실패했습니다.');
  }
};

// 이미지 업로드 및 최적화 미들웨어
const uploadAndOptimize = async (req, res, next) => {
  try {
    // 메모리로 파일 업로드
    memoryUpload.array('images', 5)(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: '파일 크기가 너무 큽니다. (최대 5MB)' });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: '파일 개수가 너무 많습니다. (최대 5개)' });
          }
        }
        return res.status(400).json({ error: err.message });
      }

      if (!req.files || req.files.length === 0) {
        return next();
      }

      const uploadDir = path.join(__dirname, '../../uploads');
      await ensureUploadDir(uploadDir);

      const processedFiles = [];

      for (const file of req.files) {
        try {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const originalName = path.parse(file.originalname).name;
          
          // 원본 파일 저장
          const originalFilename = `${originalName}-${uniqueSuffix}-original.${path.extname(file.originalname).slice(1)}`;
          const originalPath = path.join(uploadDir, originalFilename);
          await fs.writeFile(originalPath, file.buffer);

          // 썸네일 생성 (300x300)
          const thumbnailBuffer = await optimizeImage(file.buffer, {
            width: 300,
            height: 300,
            quality: 70,
            format: 'jpeg'
          });
          const thumbnailFilename = `${originalName}-${uniqueSuffix}-thumb.jpg`;
          const thumbnailPath = path.join(uploadDir, thumbnailFilename);
          await fs.writeFile(thumbnailPath, thumbnailBuffer);

          // 중간 크기 이미지 생성 (800x600)
          const mediumBuffer = await optimizeImage(file.buffer, {
            width: 800,
            height: 600,
            quality: 80,
            format: 'jpeg'
          });
          const mediumFilename = `${originalName}-${uniqueSuffix}-medium.jpg`;
          const mediumPath = path.join(uploadDir, mediumFilename);
          await fs.writeFile(mediumPath, mediumBuffer);

          processedFiles.push({
            originalName: file.originalname,
            originalPath: `/uploads/${originalFilename}`,
            thumbnailPath: `/uploads/${thumbnailFilename}`,
            mediumPath: `/uploads/${mediumFilename}`,
            size: file.size,
            mimetype: file.mimetype
          });

          logger.info('Image processed successfully', {
            originalName: file.originalname,
            size: file.size,
            thumbnailSize: thumbnailBuffer.length,
            mediumSize: mediumBuffer.length
          });
        } catch (error) {
          logger.error('File processing error', {
            filename: file.originalname,
            error: error.message
          });
          throw new Error(`파일 처리 중 오류가 발생했습니다: ${file.originalname}`);
        }
      }

      req.processedFiles = processedFiles;
      next();
    });
  } catch (error) {
    logger.error('Upload middleware error', { error: error.message });
    res.status(500).json({ error: '파일 업로드 중 오류가 발생했습니다.' });
  }
};

// 파일 삭제 함수
const deleteFile = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, '../../', filePath);
    await fs.unlink(fullPath);
    logger.info('File deleted successfully', { filePath });
  } catch (error) {
    logger.warn('File deletion failed', { filePath, error: error.message });
  }
};

// 다중 파일 삭제 함수
const deleteFiles = async (filePaths) => {
  const promises = filePaths.map(filePath => deleteFile(filePath));
  await Promise.allSettled(promises);
};

// 업로드 통계 함수
const getUploadStats = async () => {
  try {
    const uploadDir = path.join(__dirname, '../../uploads');
    const files = await fs.readdir(uploadDir);
    
    let totalSize = 0;
    let fileCount = 0;
    const fileTypes = {};

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        totalSize += stats.size;
        fileCount++;
        
        const ext = path.extname(file).toLowerCase();
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      }
    }

    return {
      totalSize,
      fileCount,
      fileTypes,
      averageSize: fileCount > 0 ? totalSize / fileCount : 0
    };
  } catch (error) {
    logger.error('Upload stats error', { error: error.message });
    return {
      totalSize: 0,
      fileCount: 0,
      fileTypes: {},
      averageSize: 0
    };
  }
};

// 파일 정리 함수 (오래된 파일 삭제)
const cleanupOldFiles = async (daysOld = 30) => {
  try {
    const uploadDir = path.join(__dirname, '../../uploads');
    const files = await fs.readdir(uploadDir);
    const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000));
    
    let deletedCount = 0;
    let deletedSize = 0;

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile() && stats.mtime < cutoffDate) {
        deletedSize += stats.size;
        await fs.unlink(filePath);
        deletedCount++;
      }
    }

    logger.info('Old files cleaned up', {
      deletedCount,
      deletedSize,
      daysOld
    });

    return { deletedCount, deletedSize };
  } catch (error) {
    logger.error('File cleanup error', { error: error.message });
    return { deletedCount: 0, deletedSize: 0 };
  }
};

module.exports = {
  upload,
  memoryUpload,
  uploadAndOptimize,
  optimizeImage,
  deleteFile,
  deleteFiles,
  getUploadStats,
  cleanupOldFiles
};