// 获取所有菜品数据
function getAllDishes() {
    // 从localStorage获取上传的菜品
    const uploadedDishes = JSON.parse(localStorage.getItem('dishes') || '[]');
    
    // 获取示例菜品的ID列表
    const exampleDishIds = allDishes.map(dish => dish.id);
    
    // 过滤掉与示例菜品ID重复的上传菜品
    const uniqueUploadedDishes = uploadedDishes.filter(dish => !exampleDishIds.includes(dish.id));
    
    // 合并示例菜品和上传的菜品
    return [...allDishes, ...uniqueUploadedDishes];
}

// 示例菜品数据
const allDishes = [
    {
        id: 1,
        name: '红烧肉',
        image: 'images/dishes/hongshaorou.png',
        description: '经典家常菜，肥而不腻',
        ingredients: ['五花肉', '酱油', '糖', '葱姜蒜']
    },
    {
        id: 2,
        name: '清蒸鱼',
        image: 'images/dishes/qingzhengyu.jpg',
        description: '鲜美可口，营养丰富',
        ingredients: ['鲜鱼', '姜', '葱', '料酒']
    },
    {
        id: 3,
        name: '宫保鸡丁',
        image: 'images/dishes/gongbaojiding.jpg',
        description: '麻辣鲜香，下饭神器',
        ingredients: ['鸡胸肉', '花生', '干辣椒', '黄瓜']
    }
];

// 加载所有菜品
function loadAllDishes() {
    console.log('开始加载菜品列表');
    const dishesContainer = document.querySelector('.row');
    // 清空现有内容
    dishesContainer.innerHTML = '';
    
    // 获取所有菜品
    const dishes = getAllDishes();
    console.log('获取到的菜品数量:', dishes.length);
    
    // 显示菜品
    dishes.forEach(dish => {
        const dishCard = createDishCard(dish);
        dishesContainer.appendChild(dishCard);
    });
    console.log('菜品列表加载完成');
}

// 创建菜品卡片
function createDishCard(dish) {
    const col = document.createElement('div');
    col.className = 'col-md-4';
    
    // 检查是否是示例菜品（通过检查是否在 allDishes 数组中）
    const isExampleDish = allDishes.some(exampleDish => exampleDish.id === dish.id);
    
    col.innerHTML = `
        <div class="card dish-card">
            <img src="${dish.image}" class="card-img-top dish-image" alt="${dish.name}" data-dish-name="${dish.name}" style="cursor: pointer;">
            <div class="card-body">
                <h5 class="card-title">${dish.name}</h5>
                <p class="card-text">${dish.description}</p>
                ${dish.ingredients ? `<p class="card-text"><small class="text-muted">配料：${dish.ingredients.join(', ')}</small></p>` : ''}
                ${dish.uploadDate ? `<p class="card-text"><small class="text-muted">上传时间：${dish.uploadDate}</small></p>` : ''}
                <div class="d-flex justify-content-end align-items-center">
                    ${!isExampleDish ? window.contentManager.createEditButton(dish) : ''}
                    ${!isExampleDish ? `<button type="button" class="btn btn-danger btn-sm ms-2 delete-dish-btn" data-dish-id="${dish.id}">删除</button>` : ''}
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// 创建图片预览模态框
function createImagePreviewModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'imagePreviewModal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <img src="" class="img-fluid" alt="菜品大图">
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

// 显示图片预览
function showImagePreview(imageSrc, dishName) {
    let modal = document.getElementById('imagePreviewModal');
    if (!modal) {
        modal = createImagePreviewModal();
    }
    
    const modalTitle = modal.querySelector('.modal-title');
    const modalImage = modal.querySelector('img');
    
    modalTitle.textContent = dishName;
    modalImage.src = imageSrc;
    
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    console.log('dishes.js: 页面加载完成');
    
    // 初始化内容管理器
    if (window.contentManager) {
        console.log('内容管理器已存在，初始化事件监听');
        window.contentManager.initEventListeners();
    } else {
        console.error('内容管理器未找到');
    }
    
    // 加载菜品列表
    console.log('开始加载菜品列表...');
    loadAllDishes();
    
    // 添加图片点击事件监听
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('dish-image')) {
            const imageSrc = e.target.src;
            const dishName = e.target.dataset.dishName;
            showImagePreview(imageSrc, dishName);
        } else if (e.target.classList.contains('delete-dish-btn')) {
            const dishId = parseInt(e.target.dataset.dishId);
            deleteDish(dishId);
        }
    });
});

// 导出函数供其他模块使用
window.loadAllDishes = loadAllDishes;

// 删除菜品函数
function deleteDish(dishId) {
    if (!confirm('确定要删除这道菜品吗？')) {
        return;
    }

    let dishes = JSON.parse(localStorage.getItem('dishes') || '[]');
    const initialLength = dishes.length;
    dishes = dishes.filter(dish => dish.id !== dishId);
    localStorage.setItem('dishes', JSON.stringify(dishes));

    if (dishes.length < initialLength) {
        console.log(`菜品 ${dishId} 已从localStorage中删除`);
        // 从DOM中移除菜品卡片
        const dishCardToRemove = document.querySelector(`.delete-dish-btn[data-dish-id="${dishId}"]`).closest('.col-md-4');
        if (dishCardToRemove) {
            dishCardToRemove.remove();
            console.log(`菜品卡片 ${dishId} 已从DOM中移除`);
        }
    } else {
        console.warn(`菜品 ${dishId} 未找到或未删除`);
    }
} 