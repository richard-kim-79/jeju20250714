// Core utilities and cache management
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100;
    }
    
    get(key) {
        if (this.cache.has(key)) {
            // Move to end (LRU)
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
        }
        return null;
    }
    
    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            // Remove oldest entry
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
    
    clear() {
        this.cache.clear();
    }
}

// Debounce utility
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

// Batch operation manager
class BatchManager {
    constructor() {
        this.queue = [];
        this.timer = null;
    }
    
    add(operation) {
        this.queue.push(operation);
        if (!this.timer) {
            this.timer = setTimeout(() => this.flush(), 100);
        }
    }
    
    flush() {
        if (this.queue.length > 0) {
            this.processBatch(this.queue);
            this.queue = [];
        }
        this.timer = null;
    }
    
    processBatch(operations) {
        // Process operations in batch
        console.log('Processing batch of', operations.length, 'operations');
        operations.forEach(op => {
            try {
                op();
            } catch (error) {
                console.error('Batch operation failed:', error);
            }
        });
    }
}

// Lazy loading utility
class LazyLoader {
    constructor() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadElement(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        });
    }
    
    observe(element) {
        this.observer.observe(element);
    }
    
    loadElement(element) {
        if (element.dataset.src) {
            element.src = element.dataset.src;
        }
        if (element.dataset.content) {
            element.innerHTML = element.dataset.content;
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CacheManager, debounce, BatchManager, LazyLoader };
} else {
    window.JejuCore = { CacheManager, debounce, BatchManager, LazyLoader };
}