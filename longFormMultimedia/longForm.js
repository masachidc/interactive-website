/**
 * Enhanced Interactive Website Script
 * Features: Smooth carousel scrolling, lightbox gallery, lazy loading, 
 * parallax effects, smooth scrolling, and performance optimizations
 */

document.addEventListener('DOMContentLoaded', function() {
  
  // ============================================
  // PERFORMANCE OPTIMIZATION - Debounce Utility
  // ============================================
  
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // ============================================
  // ENHANCED CAROUSEL FUNCTIONALITY
  // ============================================
  
  const carousel = document.getElementById('photo-carousel');
  const leftBtn = document.querySelector('.scroll-btn.left');
  const rightBtn = document.querySelector('.scroll-btn.right');
  
  if (!carousel) {
    console.warn('Photo carousel not found on this page');
    return;
  }
  
  /**
   * Calculate optimal scroll amount based on visible area
   */
  const getScrollAmount = () => {
    const containerWidth = carousel.offsetWidth;
    const firstImg = carousel.querySelector('img');
    if (!firstImg) return containerWidth * 0.8;
    
    const imgWidth = firstImg.offsetWidth;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 24;
    
    // Scroll by image width + gap, or container width if smaller
    return Math.min(imgWidth + gap, containerWidth * 0.8);
  };
  
  /**
   * Enhanced smooth scroll with easing
   */
  function smoothScroll(direction) {
    const scrollAmount = getScrollAmount();
    const scrollValue = direction === 'left' ? -scrollAmount : scrollAmount;
    
    // Smooth scroll with instant visual feedback
    carousel.scrollBy({
      left: scrollValue,
      behavior: 'smooth'
    });
    
    // Visual button feedback
    const btn = direction === 'left' ? leftBtn : rightBtn;
    if (btn) {
      btn.style.transform = 'scale(0.9)';
      setTimeout(() => btn.style.transform = '', 150);
    }
  }
  
  /**
   * Update button states based on scroll position
   */
  function updateButtons() {
    if (!leftBtn || !rightBtn) return;
    
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    const currentScroll = Math.round(carousel.scrollLeft);
    const threshold = 10;
    
    // Left button
    const isAtStart = currentScroll <= threshold;
    leftBtn.style.opacity = isAtStart ? '0.3' : '1';
    leftBtn.disabled = isAtStart;
    leftBtn.setAttribute('aria-disabled', isAtStart);
    
    // Right button
    const isAtEnd = currentScroll >= maxScroll - threshold;
    rightBtn.style.opacity = isAtEnd ? '0.3' : '1';
    rightBtn.disabled = isAtEnd;
    rightBtn.setAttribute('aria-disabled', isAtEnd);
  }
  
  // Button click handlers
  leftBtn?.addEventListener('click', () => smoothScroll('left'));
  rightBtn?.addEventListener('click', () => smoothScroll('right'));
  
  // Optimized scroll listener
  carousel.addEventListener('scroll', debounce(updateButtons, 50));
  
  // Window resize handler
  window.addEventListener('resize', debounce(updateButtons, 200));
  
  // Initial state
  updateButtons();
  
  // Keyboard navigation
  carousel.setAttribute('tabindex', '0');
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-label', 'Image carousel');
  
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      smoothScroll('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      smoothScroll('right');
    } else if (e.key === 'Home') {
      e.preventDefault();
      carousel.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (e.key === 'End') {
      e.preventDefault();
      carousel.scrollTo({ left: carousel.scrollWidth, behavior: 'smooth' });
    }
  });
  
  // Mouse drag scrolling for carousel
  let isDown = false;
  let startX;
  let scrollLeft;
  
  carousel.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'IMG') return; // Don't interfere with image clicks
    isDown = true;
    carousel.style.cursor = 'grabbing';
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
  });
  
  carousel.addEventListener('mouseleave', () => {
    isDown = false;
    carousel.style.cursor = '';
  });
  
  carousel.addEventListener('mouseup', () => {
    isDown = false;
    carousel.style.cursor = '';
  });
  
  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    carousel.scrollLeft = scrollLeft - walk;
  });
  
  // ============================================
  // ENHANCED LIGHTBOX FUNCTIONALITY
  // ============================================
  
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Image gallery');
  lightbox.innerHTML = `
    <span class="lightbox-close" role="button" aria-label="Close lightbox" tabindex="0">&times;</span>
    <button class="lightbox-nav lightbox-prev" aria-label="Previous image">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    <img src="" alt="" loading="lazy">
    <button class="lightbox-nav lightbox-next" aria-label="Next image">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
    <div class="lightbox-counter" role="status" aria-live="polite"></div>
  `;
  document.body.appendChild(lightbox);
  
  const lightboxImg = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  const counter = lightbox.querySelector('.lightbox-counter');
  
  const carouselImages = Array.from(carousel.querySelectorAll('img'));
  let currentImageIndex = 0;
  let focusedElementBeforeLightbox;
  
  /**
   * Display image in lightbox
   */
  function showLightboxImage(index) {
    if (index < 0 || index >= carouselImages.length) return;
    
    currentImageIndex = index;
    const img = carouselImages[index];
    
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || `Image ${index + 1}`;
    counter.textContent = `${index + 1} / ${carouselImages.length}`;
    
    // Update button states
    prevBtn.disabled = index === 0;
    prevBtn.style.opacity = index === 0 ? '0.3' : '1';
    nextBtn.disabled = index === carouselImages.length - 1;
    nextBtn.style.opacity = index === carouselImages.length - 1 ? '0.3' : '1';
    
    // Preload adjacent images for smoother transitions
    preloadAdjacentImages(index);
  }
  
  /**
   * Preload adjacent images
   */
  function preloadAdjacentImages(index) {
    [index - 1, index + 1].forEach(i => {
      if (i >= 0 && i < carouselImages.length) {
        const img = new Image();
        img.src = carouselImages[i].src;
      }
    });
  }
  
  /**
   * Open lightbox
   */
  function openLightbox(index) {
    focusedElementBeforeLightbox = document.activeElement;
    showLightboxImage(index);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  
  /**
   * Close lightbox
   */
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    focusedElementBeforeLightbox?.focus();
  }
  
  // Image click handlers
  carouselImages.forEach((img, index) => {
    img.style.cursor = 'pointer';
    img.setAttribute('role', 'button');
    img.setAttribute('tabindex', '0');
    img.setAttribute('aria-label', `View image ${index + 1} in gallery`);
    
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(index);
    });
    
    // Keyboard support for images
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });
  
  // Lightbox controls
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });
  
  closeBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closeLightbox();
    }
  });
  
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentImageIndex > 0) showLightboxImage(currentImageIndex - 1);
  });
  
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentImageIndex < carouselImages.length - 1) {
      showLightboxImage(currentImageIndex + 1);
    }
  });
  
  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================
  
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    switch(e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (currentImageIndex > 0) showLightboxImage(currentImageIndex - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (currentImageIndex < carouselImages.length - 1) {
          showLightboxImage(currentImageIndex + 1);
        }
        break;
      case 'Home':
        e.preventDefault();
        showLightboxImage(0);
        break;
      case 'End':
        e.preventDefault();
        showLightboxImage(carouselImages.length - 1);
        break;
    }
  });
  
  // ============================================
  // TOUCH SWIPE SUPPORT
  // ============================================
  
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;
  
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });
  
  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diffX = touchStartX - touchEndX;
    const diffY = Math.abs(touchStartY - touchEndY);
    
    // Only process horizontal swipes
    if (Math.abs(diffX) > swipeThreshold && diffY < swipeThreshold) {
      if (diffX > 0 && currentImageIndex < carouselImages.length - 1) {
        showLightboxImage(currentImageIndex + 1);
      } else if (diffX < 0 && currentImageIndex > 0) {
        showLightboxImage(currentImageIndex - 1);
      }
    }
  }
  
  // ============================================
  // MOUSE WHEEL NAVIGATION
  // ============================================
  
  let wheelTimeout;
  lightbox.addEventListener('wheel', (e) => {
    if (!lightbox.classList.contains('active')) return;
    e.preventDefault();
    
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      if (e.deltaY > 0 && currentImageIndex < carouselImages.length - 1) {
        showLightboxImage(currentImageIndex + 1);
      } else if (e.deltaY < 0 && currentImageIndex > 0) {
        showLightboxImage(currentImageIndex - 1);
      }
    }, 50);
  }, { passive: false });
  
  // ============================================
  // SMOOTH SCROLL FOR NAVIGATION LINKS
  // ============================================
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // ============================================
  // LAZY LOADING FOR IMAGES
  // ============================================
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px'
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
  
  // ============================================
  // PARALLAX EFFECT FOR HERO IMAGE
  // ============================================
  
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const heroImg = heroSection.querySelector('img');
    
    window.addEventListener('scroll', debounce(() => {
      const scrolled = window.pageYOffset;
      const heroHeight = heroSection.offsetHeight;
      
      if (scrolled < heroHeight && heroImg) {
        const parallaxSpeed = 0.5;
        heroImg.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
      }
    }, 10));
  }
  
  // ============================================
  // NAVBAR SCROLL EFFECT
  // ============================================
  
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    let lastScroll = 0;
    
    window.addEventListener('scroll', debounce(() => {
      const currentScroll = window.pageYOffset;
      
      // Add shadow on scroll
      if (currentScroll > 10) {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      } else {
        navbar.style.boxShadow = 'none';
      }
      
      lastScroll = currentScroll;
    }, 10));
  }
  
  // ============================================
  // SCROLL ANIMATIONS FOR CONTENT
  // ============================================
  
  const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  document.querySelectorAll('.article-body h3, .article-body p').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    animateOnScroll.observe(el);
  });
  
  // ============================================
  // LISTEN BUTTON FUNCTIONALITY
  // ============================================
  
  const listenBtn = document.querySelector('.listen-btn');
  if (listenBtn) {
    listenBtn.addEventListener('click', () => {
      // Toggle button state
      listenBtn.classList.toggle('active');
      
      if (listenBtn.classList.contains('active')) {
        listenBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
        // Add your text-to-speech or audio functionality here
        console.log('Listen feature activated');
      } else {
        listenBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Listen';
        console.log('Listen feature paused');
      }
    });
  }
  
  // ============================================
  // VIDEO AUTOPLAY ON SCROLL
  // ============================================
  
  const videos = document.querySelectorAll('video[autoplay]');
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(e => console.log('Video autoplay prevented:', e));
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.5 });
  
  videos.forEach(video => videoObserver.observe(video));
  
  // ============================================
  // PERFORMANCE MONITORING
  // ============================================
  
  console.log('✅ Enhanced interactive features initialized');
  console.log(`📸 Carousel: ${carouselImages.length} images`);
  console.log('🎯 Features: Smooth scrolling, lightbox, lazy loading, parallax, animations');
  
});