(function() {
  'use strict';

  var ServiceWorkerManager = {
    register: function() {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
          navigator.serviceWorker.register('./sw.js')
            .then(function(registration) {
              console.log('SW registered:', registration.scope);
            })
            .catch(function(error) {
              console.log('SW registration failed:', error);
            });
        });
      }
    }
  };

  ServiceWorkerManager.register();

  function addTouchOptimizations() {
    var touchStartX = 0;
    var touchStartY = 0;
    var touchStartTime = 0;

    document.addEventListener('touchstart', function(e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
      var touchEndX = e.changedTouches[0].clientX;
      var touchEndY = e.changedTouches[0].clientY;
      var touchEndTime = Date.now();
      var deltaX = touchEndX - touchStartX;
      var deltaY = touchEndY - touchStartY;
      var deltaTime = touchEndTime - touchStartTime;
      if (deltaTime < 300 && Math.abs(deltaX) > 50 && Math.abs(deltaY) < 50) {
        var mtabs = document.querySelectorAll('.mtab');
        var currentIndex = -1;
        mtabs.forEach(function(tab, i) {
          if (tab.classList.contains('on')) {
            currentIndex = i;
          }
        });
        if (currentIndex !== -1) {
          var newIndex;
          if (deltaX < 0) {
            newIndex = Math.min(currentIndex + 1, mtabs.length - 1);
          } else {
            newIndex = Math.max(currentIndex - 1, 0);
          }
          if (newIndex !== currentIndex) {
            mtabs[newIndex].click();
          }
        }
      }
    }, { passive: true });
  }

  addTouchOptimizations();

})();
