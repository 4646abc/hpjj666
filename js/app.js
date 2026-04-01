(function() {
  'use strict';

  const VirtualScroll = function(container, options) {
    this.container = container;
    this.options = Object.assign({
      itemHeight: 120,
      buffer: 5,
      renderItem: null
    }, options);
    this.items = [];
    this.scrollTop = 0;
    this.visibleItems = [];
    this.init();
  };

  VirtualScroll.prototype.init = function() {
    this.container.style.position = 'relative';
    this.container.style.overflowY = 'auto';
    this.content = document.createElement('div');
    this.content.style.position = 'relative';
    this.container.appendChild(this.content);
    this.container.addEventListener('scroll', this.onScroll.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));
  };

  VirtualScroll.prototype.setItems = function(items) {
    this.items = items;
    this.content.style.height = (items.length * this.options.itemHeight) + 'px';
    this.render();
  };

  VirtualScroll.prototype.onScroll = function() {
    this.scrollTop = this.container.scrollTop;
    this.render();
  };

  VirtualScroll.prototype.onResize = function() {
    this.render();
  };

  VirtualScroll.prototype.render = function() {
    const containerHeight = this.container.clientHeight;
    const startIndex = Math.max(0, Math.floor(this.scrollTop / this.options.itemHeight) - this.options.buffer);
    const endIndex = Math.min(this.items.length, Math.ceil((this.scrollTop + containerHeight) / this.options.itemHeight) + this.options.buffer);
    this.visibleItems.forEach(item => {
      if (item.index < startIndex || item.index >= endIndex) {
        item.element.remove();
      }
    });
    this.visibleItems = this.visibleItems.filter(item => item.index >= startIndex && item.index < endIndex);
    const existingIndices = new Set(this.visibleItems.map(item => item.index));
    for (let i = startIndex; i < endIndex; i++) {
      if (!existingIndices.has(i)) {
        const element = this.options.renderItem(this.items[i], i);
        element.style.position = 'absolute';
        element.style.top = (i * this.options.itemHeight) + 'px';
        element.style.left = '0';
        element.style.right = '0';
        this.content.appendChild(element);
        this.visibleItems.push({ index: i, element });
      }
    }
  };

  const LazyImage = function(img, src) {
    this.img = img;
    this.src = src;
    this.loaded = false;
    this.observer = null;
    this.init();
  };

  LazyImage.prototype.init = function() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(this.onIntersect.bind(this), {
        rootMargin: '50px 0px',
        threshold: 0.01
      });
      this.observer.observe(this.img);
    } else {
      this.load();
    }
  };

  LazyImage.prototype.onIntersect = function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.loaded) {
        this.load();
      }
    });
  };

  LazyImage.prototype.load = function() {
    this.loaded = true;
    const webpSrc = this.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const testImg = new Image();
    testImg.onload = () => {
      this.img.src = webpSrc;
    };
    testImg.onerror = () => {
      this.img.src = this.src;
    };
    testImg.src = webpSrc;
    if (this.observer) {
      this.observer.disconnect();
    }
  };

  const ServiceWorkerManager = {
    register: function() {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(registration => {
              console.log('SW registered:', registration.scope);
            })
            .catch(error => {
              console.log('SW registration failed:', error);
            });
        });
      }
    }
  };

  window.VirtualScroll = VirtualScroll;
  window.LazyImage = LazyImage;
  window.ServiceWorkerManager = ServiceWorkerManager;

})();
