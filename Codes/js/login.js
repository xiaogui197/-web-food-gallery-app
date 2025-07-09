// 格式化日期
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 更新当前日期显示
function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        dateElement.textContent = now.toLocaleDateString('zh-CN', options);
    }
}

// 检查登录状态
function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        // 更新导航栏显示
        const loginLink = document.querySelector('a[href="login.html"]');
        if (loginLink) {
            loginLink.innerHTML = `<i class="fas fa-user me-1"></i>${currentUser.username}`;
        }
        
        // 显示上传区域
        const uploadSection = document.getElementById('uploadSection');
        if (uploadSection) {
            uploadSection.style.display = 'block';
        }
        
        // 隐藏登录表单
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.parentElement.parentElement.style.display = 'none';
        }
    }
}

// 登录表单处理
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // 清除之前的验证反馈
    document.querySelectorAll('.form-control').forEach(input => {
        input.classList.remove('is-invalid');
    });
    document.querySelectorAll('.invalid-feedback').forEach(feedback => {
        feedback.style.display = 'none';
    });
    
    let isValid = true;
    if (!username) {
        document.getElementById('username').classList.add('is-invalid');
        document.getElementById('username').nextElementSibling.nextElementSibling.style.display = 'block';
        isValid = false;
    }
    if (!password) {
        document.getElementById('password').classList.add('is-invalid');
        document.getElementById('password').nextElementSibling.nextElementSibling.style.display = 'block';
        isValid = false;
    }

    if (isValid) {
        // 模拟登录验证
        if (username === 'admin' && password === 'admin') {
            // 保存登录状态
            const currentUser = {
                id: 1,
                username: username
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            if (rememberMe) {
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
            } else {
                localStorage.removeItem('username');
                localStorage.removeItem('password');
            }
            
            // 登录成功后的处理
            alert('登录成功！欢迎回来，' + username);
            document.getElementById('uploadSection').style.display = 'block';
            document.getElementById('uploadSection').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('loginForm').parentElement.parentElement.style.display = 'none';

            updateCurrentDate();
            
            // 更新导航栏显示
            const loginLink = document.querySelector('a[href="login.html"]');
            if (loginLink) {
                loginLink.innerHTML = `<i class="fas fa-user me-1"></i>${username}`;
            }
        } else {
            alert('用户名或密码不正确！');
        }
    }
});

// 页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkLoginStatus();
    
    // 初始化动画元素
    initAnimation();
    
    // 上传区域点击事件
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('dishImage');
    
    if (uploadArea && fileInput) {
        // 点击上传区域触发文件选择
        uploadArea.addEventListener('click', function(e) {
            if (e.target.closest('.image-preview-container')) {
                return;
            }
            fileInput.click();
        });
        
        // 文件选择变化处理
        fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }

    // 页面加载时检查是否有保存的登录信息
    const savedUsername = localStorage.getItem('username');
    const savedPassword = localStorage.getItem('password');
    
    if (savedUsername && savedPassword) {
        document.getElementById('username').value = savedUsername;
        document.getElementById('password').value = savedPassword;
        document.getElementById('rememberMe').checked = true;
    }
    
    // 初始化上传日期显示
    updateCurrentDate();

    // 处理文件选择
    function handleFileSelect(file) {
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件！');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('图片大小不能超过5MB！');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const uploadHint = uploadArea.querySelector('.upload-hint');
            const previewContainer = uploadArea.querySelector('.image-preview-container');
            const preview = document.getElementById('imagePreview');
            
            uploadHint.style.display = 'none';
            previewContainer.style.display = 'block';
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 移除图片
    document.getElementById('removeImage').addEventListener('click', function() {
        const uploadHint = uploadArea.querySelector('.upload-hint');
        const previewContainer = uploadArea.querySelector('.image-preview-container');
        
        fileInput.value = '';
        uploadHint.style.display = 'block';
        previewContainer.style.display = 'none';
    });

    // 拖拽上传功能
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });
});

// 将图片转换为Base64格式
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 图片上传表单处理
document.getElementById('uploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const dishName = document.getElementById('dishName').value;
    const dishImage = document.getElementById('dishImage').files[0];
    const dishDescription = document.getElementById('dishDescription').value;
    
    const progressBar = this.querySelector('.progress');
    const progressBarInner = progressBar.querySelector('.progress-bar');
    const uploadArea = document.getElementById('uploadArea');
    const uploadHint = uploadArea.querySelector('.upload-hint');
    const previewContainer = uploadArea.querySelector('.image-preview-container');

    // 验证上传表单字段
    let isValidUpload = true;
    if (!dishName) {
        document.getElementById('dishName').classList.add('is-invalid');
        isValidUpload = false;
    }
    if (!dishImage) {
        alert('请选择一张图片！');
        isValidUpload = false;
    }
    if (!dishDescription) {
        document.getElementById('dishDescription').classList.add('is-invalid');
        isValidUpload = false;
    }

    if (!isValidUpload) {
        return;
    }

    // 显示进度条
    progressBar.style.display = 'block';
    progressBarInner.style.width = '0%';
    
    try {
        // 将图片转换为Base64格式
        const imageBase64 = await convertImageToBase64(dishImage);
        
        // 读取现有的菜品数据
        let dishes = JSON.parse(localStorage.getItem('dishes') || '[]');
        
        // 获取当前用户信息
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // 创建新的菜品对象
        const newDish = {
            id: Date.now(),
            name: dishName,
            image: imageBase64,
            description: dishDescription,
            uploadDate: document.getElementById('currentDate').textContent,
            userId: currentUser.id // 添加用户ID
        };
        
        // 添加到菜品列表
        dishes.push(newDish);
        
        // 保存到localStorage
        localStorage.setItem('dishes', JSON.stringify(dishes));
        
        // 模拟上传进度
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            progressBarInner.style.width = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    // 重置表单
                    this.reset();
                    progressBar.style.display = 'none';
                    uploadHint.style.display = 'block';
                    previewContainer.style.display = 'none';
                    
                    // 显示成功消息
                    alert('上传成功！');
                }, 500);
            }
        }, 200);
    } catch (error) {
        console.error('上传失败：', error);
        alert('上传失败，请重试！');
        progressBar.style.display = 'none';
    }
});

// 动画初始化 (从 login_demo.html 引入)
function initAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// 密码显示/隐藏功能
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const icon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}); 