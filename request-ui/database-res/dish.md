# 菜品表（dish）

| 字段名     | 类型         | 主键 | 允许为空 | 说明         |
| ---------- | ------------ | ---- | -------- | ------------ |
| id         | INT          | 是   | 否       | 菜品ID，自增 |
| name       | VARCHAR(100) | 否   | 否       | 菜品名称     |
| image      | VARCHAR(255) | 否   | 是       | 菜品主图URL  |
| summary    | TEXT         | 否   | 是       | 简介         |
| created_at | DATETIME     | 否   | 否       | 创建时间     |

# 菜品详情表（dish_detail）

| 字段名     | 类型         | 主键 | 允许为空 | 说明         |
| ---------- | ------------ | ---- | -------- | ------------ |
| id         | INT          | 是   | 否       | 详情ID，自增 |
| dish_id    | INT          | 否   | 否       | 菜品ID       |
| ingredients| TEXT         | 否   | 是       | 配料         |
| method     | TEXT         | 否   | 是       | 做法         |
| created_at | DATETIME     | 否   | 否       | 创建时间     | 