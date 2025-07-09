# 轮播图表（carousel）

| 字段名     | 类型         | 主键 | 允许为空 | 说明         |
| ---------- | ------------ | ---- | -------- | ------------ |
| id         | INT          | 是   | 否       | 轮播图ID，自增 |
| image      | VARCHAR(255) | 否   | 否       | 图片URL      |
| link       | VARCHAR(255) | 否   | 是       | 跳转链接     |
| sort_order | INT          | 否   | 否       | 排序         |
| created_at | DATETIME     | 否   | 否       | 创建时间     |

# 推荐菜品表（recommend）

| 字段名     | 类型         | 主键 | 允许为空 | 说明         |
| ---------- | ------------ | ---- | -------- | ------------ |
| id         | INT          | 是   | 否       | 推荐ID，自增 |
| dish_id    | INT          | 否   | 否       | 推荐菜品ID   |
| sort_order | INT          | 否   | 否       | 排序         |
| created_at | DATETIME     | 否   | 否       | 创建时间     | 