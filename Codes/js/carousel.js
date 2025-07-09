document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('mainCarousel');
    let carouselInstance = new bootstrap.Carousel(carousel, {
        interval: 3000,
        wrap: true,
        keyboard: true
    });

    // 自动播放控制
    const toggleButton = document.getElementById('toggleAutoplay');
    let isPlaying = true;

    toggleButton.addEventListener('click', function() {
        if (isPlaying) {
            carouselInstance.pause();
            toggleButton.innerHTML = '<i class="fas fa-play"></i> 开始自动播放';
        } else {
            carouselInstance.cycle();
            toggleButton.innerHTML = '<i class="fas fa-pause"></i> 暂停自动播放';
        }
        isPlaying = !isPlaying;
    });

    // 鼠标悬停时暂停自动播放
    carousel.addEventListener('mouseenter', function() {
        carouselInstance.pause();
    });

    // 鼠标离开时恢复自动播放
    carousel.addEventListener('mouseleave', function() {
        if (isPlaying) {
            carouselInstance.cycle();
        }
    });

    // 键盘导航支持
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            carouselInstance.prev();
        } else if (e.key === 'ArrowRight') {
            carouselInstance.next();
        }
    });

    // 图片预加载
    const preloadImages = () => {
        const images = document.querySelectorAll('.carousel-item img');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src) {
                const preloadImg = new Image();
                preloadImg.src = src;
            }
        });
    };

    // 页面加载完成后预加载图片
    preloadImages();

    // 添加焦点管理
    const carouselItems = document.querySelectorAll('.carousel-item');
    carouselItems.forEach(item => {
        item.addEventListener('focus', function() {
            carouselInstance.pause();
        });

        item.addEventListener('blur', function() {
            if (isPlaying) {
                carouselInstance.cycle();
            }
        });
    });

    // 添加触摸滑动支持
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    carousel.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            carouselInstance.next();
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            carouselInstance.prev();
        }
    }

    // 添加图片加载状态监听
    const images = document.querySelectorAll('.carousel-item img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });
        
        img.addEventListener('error', function() {
            this.src = 'images/placeholder.jpg';
            console.error('图片加载失败:', this.src);
        });
    });
}); 