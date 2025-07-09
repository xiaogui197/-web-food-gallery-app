# 用户表（user）

| 字段名     | 类型         | 主键 | 允许为空 | 说明         |
| ---------- | ------------ | ---- | -------- | ------------ |
| id         | INT          | 是   | 否       | 用户ID，自增 |
| username   | VARCHAR(50)  | 否   | 否       | 用户名       |
| password   | VARCHAR(255) | 否   | 否       | 密码（加密） |
| avatar     | VARCHAR(255) | 否   | 是       | 头像URL      |
| created_at | DATETIME     | 否   | 否       | 注册时间     |

# 图片表（image）

| 字段名     | 类型         | 主键 | 允许为空 | 说明             |
| ---------- | ------------ | ---- | -------- | ---------------- |
| id         | INT          | 是   | 否       | 图片ID，自增     |
| user_id    | INT          | 否   | 否       | 上传用户ID       |
| url        | VARCHAR(255) | 否   | 否       | 图片URL          |
| description| VARCHAR(255) | 否   | 是       | 图片描述         |
| created_at | DATETIME     | 否   | 否       | 上传时间         | 