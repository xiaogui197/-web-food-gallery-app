const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 创建上传目录
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR);
const userUploadDir = path.join(uploadDir, 'users');
const tempDir = path.join(uploadDir, 'temp');
const backupDir = path.join(uploadDir, 'backup');

[uploadDir, userUploadDir, tempDir, backupDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// 数据库连接配置
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 配置文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.body.userId;
        const userDir = path.join(userUploadDir, userId, 'original');
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE)
    },
    fileFilter: function (req, file, cb) {
        if (process.env.ALLOWED_FILE_TYPES.split(',').includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('不支持的文件类型'));
        }
    }
});

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 图片上传接口
app.post('/api/v1/images/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '没有上传文件' });
        }

        const { userId, description, tags } = req.body;
        const file = req.file;

        // 获取图片信息
        const imageInfo = await sharp(file.path).metadata();

        // 生成缩略图
        const thumbnailPath = path.join(userUploadDir, userId, 'thumbnail', file.filename);
        await sharp(file.path)
            .resize(400, 300, { fit: 'inside' })
            .toFile(thumbnailPath);

        // 生成预览图
        const previewPath = path.join(userUploadDir, userId, 'preview', file.filename);
        await sharp(file.path)
            .resize(800, 600, { fit: 'inside' })
            .toFile(previewPath);

        // 保存到数据库
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 插入图片信息
            const [result] = await connection.execute(
                `INSERT INTO images (id, user_id, original_name, file_name, file_path, 
                file_size, file_type, width, height, description, tags) 
                VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    file.originalname,
                    file.filename,
                    file.path,
                    file.size,
                    file.mimetype,
                    imageInfo.width,
                    imageInfo.height,
                    description,
                    JSON.stringify(tags ? tags.split(',') : [])
                ]
            );

            // 更新用户存储统计
            await connection.execute(
                `INSERT INTO image_storage_stats (id, user_id, total_images, total_size)
                VALUES (UUID(), ?, 1, ?)
                ON DUPLICATE KEY UPDATE
                total_images = total_images + 1,
                total_size = total_size + ?`,
                [userId, file.size, file.size]
            );

            await connection.commit();

            res.json({
                code: 200,
                message: '上传成功',
                data: {
                    imageId: result.insertId,
                    url: `/uploads/users/${userId}/original/${file.filename}`,
                    thumbnailUrl: `/uploads/users/${userId}/thumbnail/${file.filename}`
                }
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('上传失败:', error);
        res.status(500).json({ error: '上传失败: ' + error.message });
    }
});

// 获取图片信息接口
app.get('/api/v1/images/:imageId', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM images WHERE id = ? AND status = 1',
            [req.params.imageId]
        );
        connection.release();

        if (rows.length === 0) {
            return res.status(404).json({ error: '图片不存在' });
        }

        res.json({
            code: 200,
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: '获取图片信息失败' });
    }
});

// 删除图片接口
app.delete('/api/v1/images/:imageId', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        // 获取图片信息
        const [rows] = await connection.execute(
            'SELECT * FROM images WHERE id = ? AND status = 1',
            [req.params.imageId]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: '图片不存在' });
        }

        const image = rows[0];

        // 软删除图片
        await connection.execute(
            'UPDATE images SET status = 0, deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
            [req.params.imageId]
        );

        // 更新用户存储统计
        await connection.execute(
            `UPDATE image_storage_stats 
            SET total_images = total_images - 1,
                total_size = total_size - ?
            WHERE user_id = ?`,
            [image.file_size, image.user_id]
        );

        await connection.commit();
        connection.release();

        // 删除物理文件
        const filePaths = [
            image.file_path,
            path.join(userUploadDir, image.user_id, 'thumbnail', path.basename(image.file_path)),
            path.join(userUploadDir, image.user_id, 'preview', path.basename(image.file_path))
        ];

        filePaths.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        res.json({
            code: 200,
            message: '删除成功'
        });
    } catch (error) {
        res.status(500).json({ error: '删除失败' });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
}); 