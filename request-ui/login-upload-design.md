# 用户登录与图片上传模块详细设计

## 1. 功能结构
- 登录表单：输入用户名、密码，支持记住密码。
- 默认登录账号：用户名 admin，密码 admin。
- 注册入口：未注册用户可跳转注册。
- 登录后显示用户信息及上传入口。
- 图片上传表单：选择图片、填写描述、提交。

## 2. 交互流程
- 用户输入账号密码登录，验证通过后进入个人中心。
- 登录后可选择图片上传，支持本地预览。
- 支持批量上传，
- 上传成功后，图片显示在个人中心或美食展示区。
- 系统自动记录并显示图片上传日期。
- 点击图片可查看大图预览

## 3. 图片预览功能
### 3.1 预览交互
- 点击图片弹出大图预览
- 支持鼠标滚轮缩放
- 支持拖拽移动图片
- 点击遮罩层关闭预览
- 支持键盘ESC关闭预览

### 3.2 预览样式
```css
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.preview-image {
  max-width: 90%;
  max-height: 90vh;
  object-fit: contain;
  cursor: move;
  transition: transform 0.3s ease;
}

.preview-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  color: white;
  font-size: 24px;
  cursor: pointer;
}
```

### 3.3 预览功能代码
```javascript
// 图片预览功能
function initImagePreview() {
  const images = document.querySelectorAll('.previewable-image');
  
  images.forEach(img => {
    img.addEventListener('click', () => {
      const modal = document.createElement('div');
      modal.className = 'image-preview-modal';
      
      const previewImg = document.createElement('img');
      previewImg.src = img.src;
      previewImg.className = 'preview-image';
      
      const closeBtn = document.createElement('div');
      closeBtn.className = 'preview-controls';
      closeBtn.innerHTML = '×';
      
      modal.appendChild(previewImg);
      modal.appendChild(closeBtn);
      document.body.appendChild(modal);
      
      // 关闭预览
      const closePreview = () => {
        modal.remove();
      };
      
      closeBtn.addEventListener('click', closePreview);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closePreview();
      });
      
      // 键盘ESC关闭
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePreview();
      });
      
      // 图片缩放
      let scale = 1;
      previewImg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        scale = Math.min(Math.max(0.5, scale * delta), 3);
        previewImg.style.transform = `scale(${scale})`;
      });
    });
  });
}
```

## 4. 错误处理
### 4.1 登录错误提示
- 密码错误提示：
  - 显示位置：密码输入框下方
  - 提示文案："密码错误，请重新输入"
  - 提示样式：红色文字（#FF4B4B）
  - 显示时间：3秒后自动消失
  - 输入框状态：红色边框提示

### 4.2 错误提示交互
- 输入框获得焦点时清除错误提示
- 重新输入时实时验证
- 连续错误3次后显示验证码
- 错误提示动画效果：淡入淡出

### 4.3 错误提示样式
```css
.error-message {
  color: #FF4B4B;
  font-size: 14px;
  margin-top: 5px;
  animation: fadeIn 0.3s ease-in-out;
}

.input-error {
  border: 1px solid #FF4B4B !important;
  box-shadow: 0 0 5px rgba(255, 75, 75, 0.2);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## 5. 数据存储
### 5.1 图片信息
- 图片文件
- 图片描述
- 上传日期（精确到秒）
- 上传用户ID
- 图片分类标签

### 5.2 日期格式
- 显示格式：YYYY-MM-DD HH:mm:ss
- 存储格式：ISO 8601标准
- 时区处理：统一使用服务器时区

## 6. 响应式设计
- 登录与上传表单在不同设备下自适应排版。
- 图片预览区域响应式调整。
- 上传进度条适配不同屏幕。
- 错误提示在不同设备下保持清晰可见。
- 预览图片适配不同屏幕尺寸

## 7. 样式设计
- 表单简洁明了，按钮高亮，错误提示明显。
- 上传区支持拖拽上传与进度提示。
- 日期显示使用图标+文字组合。
- 配色方案：
  - 主色：#FF6B6B（温暖红色）
  - 辅助色：#4ECDC4（清新青色）
  - 背景色：#F7F7F7（浅灰）
  - 文字色：#2D3436（深灰）
  - 错误色：#FF4B4B（警示红色）

## 8. 安全与校验
- 前端校验图片格式与大小。
- 登录表单防止暴力破解。
- 仅允许默认账号（admin/admin）登录。
- 上传图片自动添加水印。
- 密码错误次数限制。

## 9. 示例代码
```html
<div class="image-gallery">
  <div class="image-item">
    <img src="food1.jpg" class="previewable-image" alt="美食图片">
    <div class="image-info">
      <span class="upload-date">2024-03-21</span>
    </div>
  </div>
  <!-- 更多图片项 -->
</div>

<style>
.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
}

.image-item {
  position: relative;
  cursor: pointer;
}

.previewable-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.previewable-image:hover {
  transform: scale(1.05);
}

.image-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
</style>
```

## 10. 注意事项
- 确保上传日期准确性。
- 图片上传大小限制。
- 定期清理临时文件。
- 备份重要数据。
- 错误提示不影响用户体验。
- 防止暴力破解攻击。
- 图片预览性能优化。
- 移动端触摸操作支持。

---

> 本文档为美食类网站用户登录与图片上传模块详细设计说明。 