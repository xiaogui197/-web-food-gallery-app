# 图片存储数据库设计

## 1. 图片信息表 (images)
```sql
CREATE TABLE images (
    id VARCHAR(36) PRIMARY KEY,           -- 图片唯一标识符（UUID）
    user_id VARCHAR(36) NOT NULL,         -- 上传用户ID
    original_name VARCHAR(255) NOT NULL,  -- 原始文件名
    file_name VARCHAR(255) NOT NULL,      -- 存储文件名
    file_path VARCHAR(500) NOT NULL,      -- 文件存储路径
    file_size INT NOT NULL,               -- 文件大小（字节）
    file_type VARCHAR(50) NOT NULL,       -- 文件类型（MIME类型）
    width INT,                            -- 图片宽度
    height INT,                           -- 图片高度
    description TEXT,                     -- 图片描述
    tags JSON,                            -- 图片标签（JSON数组）
    status TINYINT DEFAULT 1,             -- 状态（1:正常 0:删除）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- 更新时间
    deleted_at TIMESTAMP NULL,            -- 删除时间
    INDEX idx_user_id (user_id),          -- 用户ID索引
    INDEX idx_status (status),            -- 状态索引
    INDEX idx_created_at (created_at)     -- 创建时间索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 2. 图片缩略图表 (image_thumbnails)
```sql
CREATE TABLE image_thumbnails (
    id VARCHAR(36) PRIMARY KEY,           -- 缩略图ID
    image_id VARCHAR(36) NOT NULL,        -- 原图ID
    type VARCHAR(20) NOT NULL,            -- 缩略图类型（thumbnail/preview）
    file_name VARCHAR(255) NOT NULL,      -- 缩略图文件名
    file_path VARCHAR(500) NOT NULL,      -- 缩略图存储路径
    width INT NOT NULL,                   -- 缩略图宽度
    height INT NOT NULL,                  -- 缩略图高度
    file_size INT NOT NULL,               -- 缩略图大小
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
    INDEX idx_image_id (image_id),        -- 原图ID索引
    INDEX idx_type (type)                 -- 类型索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 3. 图片访问记录表 (image_access_logs)
```sql
CREATE TABLE image_access_logs (
    id VARCHAR(36) PRIMARY KEY,           -- 日志ID
    image_id VARCHAR(36) NOT NULL,        -- 图片ID
    user_id VARCHAR(36) NOT NULL,         -- 访问用户ID
    access_type VARCHAR(20) NOT NULL,     -- 访问类型（view/download/share）
    ip_address VARCHAR(45),               -- 访问IP
    user_agent TEXT,                      -- 用户代理
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 访问时间
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
    INDEX idx_image_id (image_id),        -- 图片ID索引
    INDEX idx_user_id (user_id),          -- 用户ID索引
    INDEX idx_created_at (created_at)     -- 访问时间索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 4. 图片存储统计表 (image_storage_stats)
```sql
CREATE TABLE image_storage_stats (
    id VARCHAR(36) PRIMARY KEY,           -- 统计ID
    user_id VARCHAR(36) NOT NULL,         -- 用户ID
    total_images INT DEFAULT 0,           -- 总图片数
    total_size BIGINT DEFAULT 0,          -- 总存储大小（字节）
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- 最后更新时间
    INDEX idx_user_id (user_id)           -- 用户ID索引
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 5. 字段说明

### 5.1 图片信息表 (images)
- `id`: 使用UUID作为主键，确保唯一性
- `user_id`: 关联用户表的ID
- `original_name`: 用户上传时的原始文件名
- `file_name`: 系统生成的文件名（避免文件名冲突）
- `file_path`: 文件在服务器上的存储路径
- `file_size`: 文件大小，用于存储限制
- `file_type`: 文件MIME类型，用于类型验证
- `width/height`: 图片尺寸，用于显示适配
- `description`: 图片描述信息
- `tags`: 图片标签，使用JSON格式存储
- `status`: 图片状态，支持软删除
- `created_at/updated_at/deleted_at`: 时间戳字段

### 5.2 图片缩略图表 (image_thumbnails)
- `id`: 缩略图唯一标识
- `image_id`: 关联原图ID
- `type`: 缩略图类型（缩略图/预览图）
- `file_name`: 缩略图文件名
- `file_path`: 缩略图存储路径
- `width/height`: 缩略图尺寸
- `file_size`: 缩略图大小

### 5.3 图片访问记录表 (image_access_logs)
- `id`: 日志记录ID
- `image_id`: 访问的图片ID
- `user_id`: 访问用户ID
- `access_type`: 访问类型
- `ip_address`: 访问IP地址
- `user_agent`: 用户浏览器信息

### 5.4 图片存储统计表 (image_storage_stats)
- `id`: 统计记录ID
- `user_id`: 用户ID
- `total_images`: 用户上传的图片总数
- `total_size`: 用户使用的存储空间总量

## 6. 索引设计
- 所有表都建立了必要的索引以提高查询性能
- 使用外键约束确保数据完整性
- 时间字段建立索引以支持时间范围查询

## 7. 注意事项
- 使用InnoDB引擎支持事务和外键
- 使用utf8mb4字符集支持完整的Unicode字符
- 所有表都包含创建时间字段
- 图片表支持软删除
- 使用JSON类型存储标签数据
- 建立适当的索引优化查询性能

---

> 本文档为图片存储数据库的详细设计说明，可根据实际需求进行调整。 