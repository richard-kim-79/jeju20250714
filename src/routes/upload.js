const express = require('express');
const { uploadAndOptimize, getUploadStats, cleanupOldFiles, deleteFiles } = require('../middleware/upload');
const { authenticateUser, requireAdmin } = require('../middleware/auth');
const { logger } = require('../middleware/logger');

const router = express.Router();

// 이미지 업로드 API
router.post('/images', authenticateUser, uploadAndOptimize, async (req, res) => {
  try {
    if (!req.processedFiles || req.processedFiles.length === 0) {
      return res.status(400).json({ 
        error: '업로드할 파일이 없습니다.',
        code: 'NO_FILES'
      });
    }

    logger.info('Images uploaded successfully', {
      userId: req.user.id,
      username: req.user.username,
      fileCount: req.processedFiles.length,
      files: req.processedFiles.map(f => ({
        originalName: f.originalName,
        size: f.size
      }))
    });

    res.json({
      message: '이미지 업로드가 완료되었습니다.',
      files: req.processedFiles,
      uploadedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Image upload error', {
      error: error.message,
      userId: req.user?.id
    });
    res.status(500).json({ 
      error: '이미지 업로드 중 오류가 발생했습니다.',
      code: 'UPLOAD_ERROR'
    });
  }
});

// 업로드된 파일 목록 조회 API
router.get('/files', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 20, type = 'all' } = req.query;
    
    // 실제 구현에서는 데이터베이스에서 파일 정보를 조회해야 함
    // 현재는 임시로 업로드 통계만 반환
    const stats = await getUploadStats();
    
    res.json({
      files: [], // 실제 파일 목록은 DB에서 조회
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: stats.fileCount,
        pages: Math.ceil(stats.fileCount / limit)
      }
    });
  } catch (error) {
    logger.error('File list error', {
      error: error.message,
      userId: req.user?.id
    });
    res.status(500).json({ 
      error: '파일 목록 조회 중 오류가 발생했습니다.',
      code: 'FILE_LIST_ERROR'
    });
  }
});

// 파일 삭제 API
router.delete('/files', authenticateUser, async (req, res) => {
  try {
    const { filePaths } = req.body;
    
    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      return res.status(400).json({ 
        error: '삭제할 파일 경로를 지정해주세요.',
        code: 'MISSING_FILE_PATHS'
      });
    }

    // 관리자가 아닌 경우 자신의 파일만 삭제 가능하도록 검증
    // 실제 구현에서는 데이터베이스에서 파일 소유자 확인 필요
    
    await deleteFiles(filePaths);
    
    logger.info('Files deleted successfully', {
      userId: req.user.id,
      username: req.user.username,
      deletedFiles: filePaths
    });

    res.json({
      message: '파일이 성공적으로 삭제되었습니다.',
      deletedFiles: filePaths,
      deletedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('File deletion error', {
      error: error.message,
      userId: req.user?.id
    });
    res.status(500).json({ 
      error: '파일 삭제 중 오류가 발생했습니다.',
      code: 'DELETE_ERROR'
    });
  }
});

// 업로드 통계 API (관리자 전용)
router.get('/stats', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const stats = await getUploadStats();
    
    res.json({
      stats: {
        ...stats,
        totalSizeFormatted: formatBytes(stats.totalSize),
        averageSizeFormatted: formatBytes(stats.averageSize)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Upload stats error', {
      error: error.message,
      userId: req.user?.id
    });
    res.status(500).json({ 
      error: '업로드 통계 조회 중 오류가 발생했습니다.',
      code: 'STATS_ERROR'
    });
  }
});

// 파일 정리 API (관리자 전용)
router.post('/cleanup', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;
    
    if (daysOld < 1 || daysOld > 365) {
      return res.status(400).json({ 
        error: '정리 기간은 1일에서 365일 사이여야 합니다.',
        code: 'INVALID_CLEANUP_PERIOD'
      });
    }

    const result = await cleanupOldFiles(daysOld);
    
    logger.info('File cleanup completed', {
      userId: req.user.id,
      username: req.user.username,
      daysOld,
      ...result
    });

    res.json({
      message: '파일 정리가 완료되었습니다.',
      result: {
        ...result,
        deletedSizeFormatted: formatBytes(result.deletedSize)
      },
      cleanupAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('File cleanup error', {
      error: error.message,
      userId: req.user?.id
    });
    res.status(500).json({ 
      error: '파일 정리 중 오류가 발생했습니다.',
      code: 'CLEANUP_ERROR'
    });
  }
});

// 파일 크기 포맷팅 함수
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// 이미지 프록시 API (보안을 위한 이미지 서빙)
router.get('/image/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { size = 'medium' } = req.query;
    
    // 파일명 검증
    if (!/^[a-zA-Z0-9\-_]+\.(jpg|jpeg|png|gif|webp)$/.test(filename)) {
      return res.status(400).json({ 
        error: '유효하지 않은 파일명입니다.',
        code: 'INVALID_FILENAME'
      });
    }

    const path = require('path');
    const fs = require('fs').promises;
    
    let actualFilename = filename;
    
    // 크기별 파일명 조정
    if (size === 'thumb') {
      actualFilename = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/, '-thumb.jpg');
    } else if (size === 'medium') {
      actualFilename = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/, '-medium.jpg');
    } else if (size === 'original') {
      actualFilename = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/, '-original.$1');
    }
    
    const filePath = path.join(__dirname, '../../uploads', actualFilename);
    
    try {
      await fs.access(filePath);
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      res.status(404).json({ 
        error: '파일을 찾을 수 없습니다.',
        code: 'FILE_NOT_FOUND'
      });
    }
  } catch (error) {
    logger.error('Image proxy error', {
      error: error.message,
      filename: req.params.filename
    });
    res.status(500).json({ 
      error: '이미지 로딩 중 오류가 발생했습니다.',
      code: 'IMAGE_PROXY_ERROR'
    });
  }
});

module.exports = router;