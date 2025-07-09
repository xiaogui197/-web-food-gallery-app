// 内容管理功能
class ContentManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.dishes = JSON.parse(localStorage.getItem('dishes') || '[]');
        this.modalInstance = null;
        console.log('ContentManager 初始化:', {
            currentUser: this.currentUser,
            dishesCount: this.dishes.length
        });
    }

    // 检查用户是否登录
    isLoggedIn() {
        return !!this.currentUser;
    }

    // 检查是否是当前用户上传的内容
    isOwner(dish) {
        // admin 用户可以修改所有内容
        if (this.isLoggedIn() && this.currentUser.username === 'admin') {
            return true;
        }
        // 其他用户只能修改自己的内容
        return this.isLoggedIn() && dish.userId === this.currentUser.id;
    }

    // 创建编辑按钮
    createEditButton(dish) {
        if (!this.isOwner(dish)) return '';
        
        return `
            <button class="btn btn-sm btn-outline-primary edit-btn" data-dish-id="${dish.id}">
                <i class="fas fa-edit"></i> 编辑
            </button>
        `;
    }

    // 创建编辑模态框
    createEditModal() {
        // 如果模态框已存在，先移除
        const existingModal = document.getElementById('editDishModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'editDishModal';
        modal.tabIndex = '-1';
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">编辑菜品</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editDishForm">
                            <input type="hidden" id="editDishId">
                            <div class="mb-3">
                                <label for="editDishName" class="form-label">菜品名称</label>
                                <input type="text" class="form-control" id="editDishName" required>
                            </div>
                            <div class="mb-3">
                                <label for="editDishDescription" class="form-label">菜品描述</label>
                                <textarea class="form-control" id="editDishDescription" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="editDishImage" class="form-label">菜品图片</label>
                                <div class="upload-area" id="editUploadArea">
                                    <input type="file" class="form-control" id="editDishImage" accept="image/*" style="display: none;">
                                    <div class="upload-hint">
                                        <i class="fas fa-cloud-upload-alt mb-2" style="font-size: 2rem;"></i>
                                        <p>点击或拖拽图片到此处上传</p>
                                        <p class="text-muted">支持JPG、PNG格式，最大5MB</p>
                                    </div>
                                    <div class="image-preview-container" style="display: none;">
                                        <div class="image-preview-wrapper">
                                            <img id="editImagePreview" class="image-preview" src="" alt="预览图" style="max-width: 100%; max-height: 300px; object-fit: contain;">
                                        </div>
                                        <div class="image-preview-controls mt-2">
                                            <button type="button" class="btn btn-sm btn-outline-danger" id="editRemoveImage">
                                                <i class="fas fa-times"></i> 移除
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" id="saveEditBtn">保存修改</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .upload-area {
                border: 2px dashed #e0e0e0;
                border-radius: 0.5rem;
                padding: 2rem;
                text-align: center;
                transition: border-color 0.3s ease, background-color 0.3s ease;
                cursor: pointer;
            }
            
            .upload-area:hover {
                border-color: #165DFF;
                background-color: #f5f9ff;
            }
            
            .upload-hint {
                color: #888;
                margin-top: 1rem;
            }
            
            .image-preview-container {
                margin-top: 1rem;
            }
            
            .image-preview-wrapper {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 200px;
                background-color: #f8f9fa;
                border-radius: 0.5rem;
                overflow: hidden;
            }
            
            .image-preview {
                max-width: 100%;
                max-height: 300px;
                object-fit: contain;
            }
            
            .image-preview-controls {
                display: flex;
                justify-content: center;
                margin-top: 1rem;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(modal);
        console.log('编辑模态框已创建');
        return modal;
    }

    // 显示编辑模态框
    showEditModal(dishId) {
        console.log('尝试显示编辑模态框:', dishId);
        const dish = this.dishes.find(d => d.id === parseInt(dishId));
        if (!dish) {
            console.error('未找到菜品:', dishId);
            return;
        }

        let modal = document.getElementById('editDishModal');
        if (!modal) {
            modal = this.createEditModal();
        }

        try {
            // 填充表单数据
            document.getElementById('editDishId').value = dish.id;
            document.getElementById('editDishName').value = dish.name;
            document.getElementById('editDishDescription').value = dish.description;
            
            // 显示当前图片预览
            const previewContainer = document.querySelector('#editUploadArea .image-preview-container');
            const previewImg = document.getElementById('editImagePreview');
            const uploadHint = document.querySelector('#editUploadArea .upload-hint');
            
            if (dish.image) {
                previewContainer.style.display = 'block';
                uploadHint.style.display = 'none';
                previewImg.src = dish.image;
                console.log('设置预览图片:', dish.image);
            } else {
                previewContainer.style.display = 'none';
                uploadHint.style.display = 'block';
                previewImg.src = '';
            }

            // 显示模态框
            this.modalInstance = new bootstrap.Modal(modal);
            this.modalInstance.show();
            console.log('编辑模态框已显示');

            // 初始化图片上传相关事件
            this.initImageUploadEvents();
        } catch (error) {
            console.error('显示编辑模态框时出错:', error);
        }
    }

    // 初始化图片上传相关事件
    initImageUploadEvents() {
        const editUploadArea = document.getElementById('editUploadArea');
        if (!editUploadArea) return;

        const fileInput = document.getElementById('editDishImage');
        const previewContainer = editUploadArea.querySelector('.image-preview-container');
        const previewImg = document.getElementById('editImagePreview');
        const uploadHint = editUploadArea.querySelector('.upload-hint');
        const removeBtn = document.getElementById('editRemoveImage');

        // 移除旧的事件监听器
        const newEditUploadArea = editUploadArea.cloneNode(true);
        editUploadArea.parentNode.replaceChild(newEditUploadArea, editUploadArea);

        // 重新获取元素引用
        const newFileInput = newEditUploadArea.querySelector('#editDishImage');
        const newPreviewContainer = newEditUploadArea.querySelector('.image-preview-container');
        const newPreviewImg = newEditUploadArea.querySelector('#editImagePreview');
        const newUploadHint = newEditUploadArea.querySelector('.upload-hint');
        const newRemoveBtn = newEditUploadArea.querySelector('#editRemoveImage');

        // 添加新的事件监听器
        newEditUploadArea.addEventListener('click', () => newFileInput.click());
        
        newFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('图片大小不能超过5MB');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    newPreviewImg.src = e.target.result;
                    newPreviewContainer.style.display = 'block';
                    newUploadHint.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });

        newRemoveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            newFileInput.value = '';
            newPreviewContainer.style.display = 'none';
            newUploadHint.style.display = 'block';
            newPreviewImg.src = '';
        });
    }

    // 保存编辑
    saveEdit(dishId, formData) {
        console.log('尝试保存编辑:', { dishId, formData });
        const index = this.dishes.findIndex(d => d.id === parseInt(dishId));
        if (index === -1) {
            console.error('未找到要编辑的菜品:', dishId);
            return false;
        }

        try {
            // 更新菜品数据
            this.dishes[index] = {
                ...this.dishes[index],
                name: formData.name,
                description: formData.description,
                image: formData.image || this.dishes[index].image,
                lastModified: new Date().toISOString()
            };

            // 保存到localStorage
            localStorage.setItem('dishes', JSON.stringify(this.dishes));
            console.log('编辑已保存');
            return true;
        } catch (error) {
            console.error('保存编辑时出错:', error);
            return false;
        }
    }

    // 初始化事件监听
    initEventListeners() {
        console.log('初始化事件监听器');
        
        // 移除旧的事件监听器
        const oldEditBtnHandler = this.editBtnHandler;
        const oldSaveBtnHandler = this.saveBtnHandler;
        
        if (oldEditBtnHandler) {
            document.removeEventListener('click', oldEditBtnHandler);
        }
        if (oldSaveBtnHandler) {
            document.removeEventListener('click', oldSaveBtnHandler);
        }

        // 编辑按钮点击事件
        this.editBtnHandler = (e) => {
            const editBtn = e.target.closest('.edit-btn');
            if (editBtn) {
                const dishId = editBtn.dataset.dishId;
                console.log('编辑按钮被点击:', dishId);
                this.showEditModal(dishId);
            }
        };
        document.addEventListener('click', this.editBtnHandler);

        // 保存编辑按钮点击事件
        this.saveBtnHandler = (e) => {
            if (e.target.id === 'saveEditBtn') {
                console.log('保存按钮被点击');
                const form = document.getElementById('editDishForm');
                const dishId = document.getElementById('editDishId').value;
                
                const formData = {
                    name: document.getElementById('editDishName').value,
                    description: document.getElementById('editDishDescription').value,
                    image: document.getElementById('editImagePreview').src
                };

                if (this.saveEdit(dishId, formData)) {
                    // 关闭模态框
                    if (this.modalInstance) {
                        this.modalInstance.hide();
                        // 确保模态框完全关闭后再刷新列表
                        const modal = document.getElementById('editDishModal');
                        modal.addEventListener('hidden.bs.modal', () => {
                            if (typeof window.loadAllDishes === 'function') {
                                window.loadAllDishes();
                            } else {
                                console.error('loadAllDishes 函数未定义');
                            }
                        }, { once: true });
                    }
                }
            }
        };
        document.addEventListener('click', this.saveBtnHandler);
    }
}

// 创建全局实例
window.contentManager = new ContentManager();

// 确保在页面加载完成后初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成，初始化内容管理器事件监听');
    window.contentManager.initEventListeners();
}); 