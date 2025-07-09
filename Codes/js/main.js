// 获取菜品数据
function getDishes() {
    // 从localStorage获取上传的菜品
    const uploadedDishes = JSON.parse(localStorage.getItem('dishes') || '[]');
    
    // 合并示例菜品和上传的菜品
    return [...featuredDishes, ...uploadedDishes];
}

// 示例菜品数据
const featuredDishes = [
    {
        id: 1,
        name: '红烧肉',
        image: 'images/dishes/hongshaorou.png',
        description: '经典家常菜，肥而不腻'
    },
    {
        id: 2,
        name: '清蒸鱼',
        image: 'images/dishes/qingzhengyu.jpg',
        description: '鲜美可口，营养丰富'
    },
    {
        id: 3,
        name: '宫保鸡丁',
        image: 'images/dishes/gongbaojiding.jpg',
        description: '麻辣鲜香，下饭神器'
    }
];

// 加载精选菜品
function loadFeaturedDishes() {
    const dishesContainer = document.querySelector('.row');
    // 清空现有内容
    dishesContainer.innerHTML = '';
    
    // 获取所有菜品
    const allDishes = getDishes();
    
    // 显示菜品
    allDishes.forEach(dish => {
        const dishCard = createDishCard(dish);
        dishesContainer.appendChild(dishCard);
    });
}

// 创建菜品卡片
function createDishCard(dish) {
    const col = document.createElement('div');
    col.className = 'col-md-4';
    
    col.innerHTML = `
        <div class="card dish-card">
            <img src="${dish.image}" class="card-img-top dish-image" alt="${dish.name}" data-dish-name="${dish.name}" style="cursor: pointer;">
            <div class="card-body">
                <h5 class="card-title">${dish.name}</h5>
                <p class="card-text">${dish.description}</p>
                ${dish.uploadDate ? `<p class="card-text"><small class="text-muted">上传时间：${dish.uploadDate}</small></p>` : ''}
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
    loadFeaturedDishes();
    
    // 添加图片点击事件监听
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('dish-image')) {
            const imageSrc = e.target.src;
            const dishName = e.target.dataset.dishName;
            showImagePreview(imageSrc, dishName);
        }
    });
}); 