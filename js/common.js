// 公共功能模块

// 检测localStorage可用性
function isLocalStorageAvailable() {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// 安全地获取localStorage值
function getLocalStorage(key, defaultValue) {
    if (isLocalStorageAvailable()) {
        return localStorage.getItem(key) || defaultValue;
    }
    return defaultValue;
}

// 安全地设置localStorage值
function setLocalStorage(key, value) {
    if (isLocalStorageAvailable()) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            return false;
        }
    }
    return false;
}

// 平滑滚动函数（带兼容性处理）
function smoothScrollTo(top) {
    // 检查是否启用平滑滚动
    const smoothScrollEnabled = getLocalStorage('smoothScroll', 'true') !== 'false';
    
    // 获取可滚动元素（优先使用content元素，其次使用window）
    let scrollElement = document.querySelector('.content');
    if (!scrollElement) {
        // 尝试其他常见的滚动容器
        scrollElement = document.querySelector('.content-container') || document.getElementById('contentContainer') || document.documentElement || document.body || window;
    }
    const isWindow = scrollElement === window || scrollElement === document || scrollElement === document.documentElement || scrollElement === document.body;
    
    // 检查浏览器是否支持平滑滚动
    if (smoothScrollEnabled && 'scrollBehavior' in document.documentElement.style) {
        try {
            // 现代浏览器使用原生平滑滚动
            if (isWindow) {
                window.scrollTo({
                    top: top,
                    behavior: 'smooth'
                });
            } else {
                scrollElement.scrollTo({
                    top: top,
                    behavior: 'smooth'
                });
            }
        } catch (e) {
            // 如果原生平滑滚动失败，回退到手动实现
            const startY = isWindow ? window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop : scrollElement.scrollTop;
            manualSmoothScroll(scrollElement, isWindow, top, startY);
        }
    } else {
        // 旧版浏览器使用手动滚动或直接跳转
        if (smoothScrollEnabled) {
            const startY = isWindow ? window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop : scrollElement.scrollTop;
            manualSmoothScroll(scrollElement, isWindow, top, startY);
        } else {
            // 直接跳转
            if (isWindow) {
                window.scrollTo(0, top);
            } else {
                scrollElement.scrollTop = top;
            }
        }
    }
}

// 手动实现平滑滚动
function manualSmoothScroll(scrollElement, isWindow, top, startY) {
    const distance = top - startY;
    const duration = 300;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startY, distance, duration);
        if (isWindow) {
            window.scrollTo(0, run);
        } else {
            scrollElement.scrollTop = run;
        }
        if (timeElapsed < duration) {
            // 确保requestAnimationFrame可用
            if (window.requestAnimationFrame) {
                requestAnimationFrame(animation);
            } else {
                // 回退到setTimeout
                setTimeout(animation, 16);
            }
        }
    }
    
    // 缓动函数
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    // 启动动画
    if (window.requestAnimationFrame) {
        requestAnimationFrame(animation);
    } else {
        // 回退到setTimeout
        setTimeout(animation, 16);
    }
}

// 初始化底边栏状态
function initFooterState() {
    const footer = document.getElementById('footer');
    const footerToggle = document.getElementById('footerToggle');
    const toggleArrow = document.getElementById('toggleArrow');
    
    if (footerToggle) {
        // 检查底部栏默认展开设置和当前状态
        const footerDefault = getLocalStorage('footerDefault', 'true') === 'true';
        const savedFooterVisible = getLocalStorage('footerVisible', footerDefault ? 'true' : 'false') === 'true';
        let footerVisible = savedFooterVisible;
        
        // 确保footer元素存在
        if (footer) {
            // 获取底部栏的实际高度
            const getFooterHeight = () => {
                return window.innerWidth > 768 ? '80px' : '60px';
            };
            
            // 初始化底部栏状态（无动画）
            if (footerVisible) {
                // 使用CSS类控制状态，不添加动画
                footer.classList.add('visible');
                if (toggleArrow) toggleArrow.classList.add('rotated');
                const footerHeight = getFooterHeight();
                document.body.style.paddingBottom = footerHeight;
                // 调整内容容器高度
                const contentContainers = document.querySelectorAll('.content-container, .content, #contentContainer');
                contentContainers.forEach(container => {
                    container.style.bottom = footerHeight;
                });
            } else {
                // 使用CSS类控制状态，不添加动画
                footer.classList.remove('visible');
                if (toggleArrow) toggleArrow.classList.remove('rotated');
                document.body.style.paddingBottom = '0px';
                // 调整内容容器高度
                const contentContainers = document.querySelectorAll('.content-container, .content, #contentContainer');
                contentContainers.forEach(container => {
                    container.style.bottom = '0px';
                });
            }
            
            // 底部栏收起/展开逻辑
            footerToggle.addEventListener('click', (e) => {
                // 检查是否按住了SHIFT键
                if (e.shiftKey) {
                    // 快速回到页首
                    smoothScrollTo(0);
                    return;
                }
                
                // 检查是否按住了ALT键
                if (e.altKey) {
                    // 快速跳到页尾
                    let scrollElement = document.querySelector('.content') || document.getElementById('contentContainer') || document.body;
                    const scrollHeight = scrollElement === document.body ? document.body.scrollHeight : scrollElement.scrollHeight;
                    smoothScrollTo(scrollHeight);
                    return;
                }
                
                // 正常的底部栏收起/展开逻辑
                footerVisible = !footerVisible;
                if (footerVisible) {
                    // 展开：添加visible类触发动画
                    footer.classList.add('visible');
                    if (toggleArrow) toggleArrow.classList.add('rotated');
                    const footerHeight = getFooterHeight();
                    document.body.style.paddingBottom = footerHeight;
                    // 调整内容容器高度
                    const contentContainers = document.querySelectorAll('.content-container, .content');
                    contentContainers.forEach(container => {
                        container.style.bottom = footerHeight;
                    });
                } else {
                    // 收起：移除visible类触发动画
                    footer.classList.remove('visible');
                    if (toggleArrow) toggleArrow.classList.remove('rotated');
                    document.body.style.paddingBottom = '0px';
                    // 调整内容容器高度
                    const contentContainers = document.querySelectorAll('.content-container, .content');
                    contentContainers.forEach(container => {
                        container.style.bottom = '0px';
                    });
                }
                // 保存底边栏状态到localStorage
                setLocalStorage('footerVisible', footerVisible);
                // 更新CSS变量，确保预加载效果正确
                document.documentElement.style.setProperty('--footer-visible', footerVisible ? 'true' : 'false');
            });
            
            // 监听窗口大小变化，实时调整内容容器高度
            window.addEventListener('resize', () => {
                if (footerVisible) {
                    const footerHeight = getFooterHeight();
                    document.body.style.paddingBottom = footerHeight;
                    const contentContainers = document.querySelectorAll('.content-container, .content, #contentContainer');
                    contentContainers.forEach(container => {
                        container.style.bottom = footerHeight;
                    });
                }
            });
        }
    }
}

// 初始化主题设置
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeMask = document.getElementById('themeMask');
    
    if (themeToggle) {
        // 加载主题设置
        const savedTheme = getLocalStorage('theme', 'light');
        if (savedTheme === 'light') {
            document.documentElement.dataset.theme = 'light';
            themeToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="theme-icon"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>';
        } else if (savedTheme === 'dark') {
            document.documentElement.dataset.theme = 'dark';
            themeToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="theme-icon"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm1-11h-2v3H8v2h3v3h2v-3h3v-2h-3V8z"/></svg>';
        } else if (savedTheme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
            if (prefersDark) {
                themeToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="theme-icon"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm1-11h-2v3H8v2h3v3h2v-3h3v-2h-3V8z"/></svg>';
            } else {
                themeToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="theme-icon"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>';
            }
        }
        
        // 主题切换逻辑
        themeToggle.onclick = (e) => {
            const r = themeToggle.getBoundingClientRect();
            const max = Math.max(innerWidth, innerHeight) * 2;
            const currentTheme = getLocalStorage('theme', 'light');
            let newTheme;

            // 开始扩散动画
            if (themeMask) {
                themeMask.style.left = r.x + r.width/2 + 'px';
                themeMask.style.top = r.y + r.height/2 + 'px';
                themeMask.style.width = max + 'px';
                themeMask.style.height = max + 'px';
                themeMask.style.transform = 'translate(-50%, -50%) scale(1)';
                // 确保遮罩可见
                themeMask.style.opacity = '0.18';
            }

            // 切换主题：light -> dark -> light
            if (currentTheme === 'light') {
                newTheme = 'dark';
            } else if (currentTheme === 'dark') {
                newTheme = 'light';
            } else if (currentTheme === 'system') {
                // 当主题为system时，根据当前实际主题切换
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                newTheme = prefersDark ? 'light' : 'dark';
            } else {
                newTheme = 'light';
            }

            // 应用新主题（立即应用，不延迟）
            if (newTheme === 'light') {
                themeToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="theme-icon"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>';
                document.documentElement.dataset.theme = 'light';
                document.body.dataset.theme = 'light';
                setLocalStorage('theme', 'light');
                // 同步更新设置页面的radio按钮
                const radio = document.querySelector('input[name="theme"][value="light"]');
                if (radio) {
                    radio.checked = true;
                }
            } else if (newTheme === 'dark') {
                themeToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="theme-icon"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm1-11h-2v3H8v2h3v3h2v-3h3v-2h-3V8z"/></svg>';
                document.documentElement.dataset.theme = 'dark';
                document.body.dataset.theme = 'dark';
                setLocalStorage('theme', 'dark');
                // 同步更新设置页面的radio按钮
                const radio = document.querySelector('input[name="theme"][value="dark"]');
                if (radio) {
                    radio.checked = true;
                }
            }

            // 动画结束后收回遮罩
            setTimeout(() => {
                if (themeMask) {
                    // 先淡出遮罩
                    themeMask.style.opacity = '0';
                    // 然后重置大小和缩放
                    setTimeout(() => {
                        themeMask.style.width = '0';
                        themeMask.style.height = '0';
                        themeMask.style.transform = 'translate(-50%, -50%) scale(0)';
                    }, 300);
                }
                themeToggle.style.animation = '';
            }, 800);
        }
    }
}

// 初始化语言设置
function initLanguage() {
    const languageToggle = document.getElementById('languageToggle');
    
    if (languageToggle) {
        // 语言切换功能
        languageToggle.addEventListener('click', () => {
            // 直接从localStorage获取当前语言
            let currentLanguage = getLocalStorage('language', 'zh-CN');
            // 切换语言
            currentLanguage = currentLanguage === 'zh-CN' ? 'en-US' : 'zh-CN';
            // 保存到localStorage
            setLocalStorage('language', currentLanguage);
            // 同步更新设置页面的radio按钮
            const radio = document.querySelector('input[name="language"][value="' + currentLanguage + '"]');
            if (radio) {
                radio.checked = true;
            }
            // 调用页面自己的updateLanguage函数
            if (typeof updateLanguage === 'function') {
                // 传递新的语言值给updateLanguage函数
                updateLanguage(currentLanguage);
            }
        });
    }
    
    // 返回当前语言
    return getLocalStorage('language', 'zh-CN');
}

// 更新语言
function updateLanguage() {
    // 语言更新逻辑由各个页面实现
}

// 通用的导航按钮更新函数
function updateNavButtons(lang, elements) {
    // 尝试通过data-index属性更新导航按钮
    for (let i = 0; i < 4; i++) {
        const btn = document.querySelector(`.nav-btn[data-index="${i}"]`);
        if (btn) {
            switch(i) {
                case 0:
                    btn.textContent = elements[lang]['about'];
                    btn.title = elements[lang]['about'];
                    break;
                case 1:
                    btn.textContent = elements[lang]['works'];
                    btn.title = elements[lang]['works'];
                    break;
                case 2:
                    btn.textContent = elements[lang]['notes'];
                    btn.title = elements[lang]['notes'];
                    break;
                case 3:
                    btn.textContent = elements[lang]['settings'];
                    btn.title = elements[lang]['settings'];
                    break;
            }
        }
    }
    
    // 如果没有data-index属性，尝试通过其他方式更新
    if (document.querySelectorAll('.nav-btn').length === 4) {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns[0].textContent = elements[lang]['about'];
        navBtns[0].title = elements[lang]['about'];
        navBtns[1].textContent = elements[lang]['works'];
        navBtns[1].title = elements[lang]['works'];
        navBtns[2].textContent = elements[lang]['notes'];
        navBtns[2].title = elements[lang]['notes'];
        navBtns[3].textContent = elements[lang]['settings'];
        navBtns[3].title = elements[lang]['settings'];
    }
}

// 更新按钮效果
function updateButtonEffects() {
    const effectsEnabled = getLocalStorage('buttonEffects', 'true') !== 'false';
    const buttons = document.querySelectorAll('.nav-btn, .social-btn, .theme-toggle, .language-toggle, .footer-toggle');
    buttons.forEach(button => {
        if (effectsEnabled) {
            button.style.transition = 'all 0.3s ease';
        } else {
            button.style.transition = 'none';
        }
    });
}

// 触摸反馈事件处理函数
function touchStartHandler() {
    this.style.transform = 'scale(0.95)';
}

function touchEndHandler() {
    this.style.transform = 'scale(1)';
}

function touchCancelHandler() {
    this.style.transform = 'scale(1)';
}

// 更新触摸反馈
function updateTouchFeedback() {
    const feedbackEnabled = getLocalStorage('touchFeedback', 'true') !== 'false';
    const buttons = document.querySelectorAll('.nav-btn, .social-btn, .theme-toggle, .language-toggle, .footer-toggle');
    buttons.forEach(button => {
        if (feedbackEnabled) {
            // 为不同浏览器设置触摸反馈
            button.style.webkitTapHighlightColor = 'transparent';
            button.style.MozTapHighlightColor = 'transparent';
            button.style.tapHighlightColor = 'transparent';
            button.style.cursor = 'pointer';
            // 添加触摸反馈效果
            button.addEventListener('touchstart', touchStartHandler);
            button.addEventListener('touchend', touchEndHandler);
            button.addEventListener('touchcancel', touchCancelHandler);
        } else {
            // 禁用触摸反馈
            button.style.webkitTapHighlightColor = '';
            button.style.MozTapHighlightColor = '';
            button.style.tapHighlightColor = '';
            button.style.cursor = 'default';
            // 移除触摸事件监听器
            button.removeEventListener('touchstart', touchStartHandler);
            button.removeEventListener('touchend', touchEndHandler);
            button.removeEventListener('touchcancel', touchCancelHandler);
        }
    });
}

// 更新导航指示器位置和宽度
function updateNavIndicator() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const indicator = document.getElementById('navIndicator');
    
    if (navBtns.length > 0 && indicator) {
        // 找到当前页面对应的导航按钮
        const currentPath = window.location.pathname;
        let activeIndex = 0;
        
        if (currentPath.includes('/about/')) {
            activeIndex = 0;
        } else if (currentPath.includes('/works/')) {
            activeIndex = 1;
        } else if (currentPath.includes('/notes/')) {
            activeIndex = 2;
        } else if (currentPath.includes('/setting/')) {
            activeIndex = 3;
        }
        
        // 设置导航指示器位置
        const activeBtn = navBtns[activeIndex];
        if (activeBtn) {
            // 确保没有过渡效果，直接更新
            indicator.style.transition = 'none';
            // 设置位置和宽度
            indicator.style.left = activeBtn.offsetLeft + "px";
            indicator.style.width = activeBtn.offsetWidth + "px";
            
            // 强制重排
            indicator.offsetHeight;
            
            // 恢复过渡效果
            setTimeout(() => {
                indicator.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
            }, 100);
        }
    }
}

// 初始化导航指示器
function initNavIndicator() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const indicator = document.getElementById('navIndicator');
    
    if (navBtns.length > 0 && indicator) {
        // 初始更新导航指示器
        updateNavIndicator();
        
        // 记录当前激活的索引
        let currentActiveIndex = 0;
        const currentPath = window.location.pathname;
        if (currentPath.includes('/about/')) {
            currentActiveIndex = 0;
        } else if (currentPath.includes('/works/')) {
            currentActiveIndex = 1;
        } else if (currentPath.includes('/notes/')) {
            currentActiveIndex = 2;
        } else if (currentPath.includes('/setting/')) {
            currentActiveIndex = 3;
        }
        
        // 添加点击事件监听器
        navBtns.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                // 阻止默认的页面跳转
                e.preventDefault();
                
                // 计算切换方向
                const isRightToLeft = index < currentActiveIndex;
                
                // 保存当前位置和宽度
                const currentLeft = indicator.offsetLeft;
                const currentWidth = indicator.offsetWidth;
                
                // 获取目标按钮的位置和宽度
                const targetLeft = btn.offsetLeft;
                const targetWidth = btn.offsetWidth;
                
                // 根据方向设置不同的动画效果
                if (isRightToLeft) {
                    // 从右向左切换：先移动到目标位置，再调整宽度
                    indicator.style.transition = 'left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
                    indicator.style.left = targetLeft + "px";
                    
                    setTimeout(() => {
                        indicator.style.transition = 'width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
                        indicator.style.width = targetWidth + "px";
                    }, 200);
                } else {
                    // 从左向右切换：先调整宽度，再移动到目标位置
                    indicator.style.transition = 'width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
                    indicator.style.width = (targetLeft + targetWidth - currentLeft) + "px";
                    
                    setTimeout(() => {
                        indicator.style.transition = 'left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
                        indicator.style.left = targetLeft + "px";
                    }, 200);
                }
                
                // 重置过渡效果
                setTimeout(() => {
                    indicator.style.transition = 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
                }, 400);
                
                // 更新当前激活的索引
                currentActiveIndex = index;
                
                // 延迟执行页面跳转，让动画先完成
                setTimeout(() => {
                    // 直接获取按钮的 onclick 属性并执行
                    const onclick = btn.getAttribute('onclick');
                    if (onclick) {
                        // 提取 location.href 部分并执行
                        const urlMatch = onclick.match(/location\.href=['"]([^'"]+)['"]/);
                        if (urlMatch && urlMatch[1]) {
                            window.location.href = urlMatch[1];
                        }
                    }
                }, 200);
            });
        });
    }
}

// 复制邮箱功能
function copyEmail() {
    const email = "AmikKellan@gmail.com";
    
    // 现代浏览器使用 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email)
            .then(() => {
                showCopySuccess();
            })
            .catch((err) => {
                console.error('Clipboard API 失败:', err);
                fallbackCopy(email);
            });
    } 
    // 旧版浏览器使用 execCommand
    else if (document.execCommand) {
        fallbackCopy(email);
    } 
    // 完全不支持复制功能的浏览器
    else {
        alert("您的浏览器不支持复制功能，请手动复制：AmikKellan@gmail.com");
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // 确保文本区域不可见但可选择
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    
    document.body.appendChild(textArea);
    
    try {
        // 选择文本
        textArea.focus();
        textArea.select();
        
        // 执行复制命令
        const successful = document.execCommand('copy');
        
        if (successful) {
            showCopySuccess();
        } else {
            throw new Error('execCommand 失败');
        }
    } catch (err) {
        console.error(' fallback 复制失败:', err);
        alert("复制失败，请手动复制：AmikKellan@gmail.com");
    } finally {
        // 无论成功失败都移除文本区域
        textArea.remove();
    }
}

// 显示复制成功的反馈
function showCopySuccess() {
    const currentLanguage = getLocalStorage('language', 'zh-CN');
    // 创建一个临时的成功提示元素
    const successElement = document.createElement('div');
    successElement.style.position = 'fixed';
    successElement.style.top = '50%';
    successElement.style.left = '50%';
    successElement.style.transform = 'translate(-50%, -50%)';
    successElement.style.background = 'rgba(0, 0, 0, 0.8)';
    successElement.style.color = 'white';
    successElement.style.padding = '10px 20px';
    successElement.style.borderRadius = '4px';
    successElement.style.fontSize = '14px';
    successElement.style.zIndex = '9999';
    successElement.style.transition = 'all 0.3s ease';
    successElement.style.opacity = '0';
    successElement.textContent = currentLanguage === 'zh-CN' ? '复制成功！' : 'Copied successfully!';
    
    document.body.appendChild(successElement);
    
    // 渐入显示
    setTimeout(() => {
        successElement.style.opacity = '1';
    }, 10);
    
    // 2秒后上移动+淡化退场
    setTimeout(() => {
        successElement.style.opacity = '0';
        successElement.style.transform = 'translate(-50%, -60%)';
        setTimeout(() => {
            successElement.remove();
        }, 300);
    }, 2000);
}

// 初始化页面
function initPage() {
    // 初始化底边栏状态
    initFooterState();
    
    // 初始化主题设置
    initTheme();
    
    // 初始化语言设置
    const currentLanguage = initLanguage();
    
    // 加载字体大小设置
    const savedFontSize = getLocalStorage('fontSize', '16');
    document.documentElement.style.fontSize = savedFontSize + 'px';
    
    // 加载按钮效果设置
    updateButtonEffects();
    
    // 加载触摸反馈设置
    updateTouchFeedback();
    
    // 初始化导航指示线
    initNavIndicator();
    
    return currentLanguage;
}

// 导出公共函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isLocalStorageAvailable,
        getLocalStorage,
        setLocalStorage,
        smoothScrollTo,
        manualSmoothScroll,
        initFooterState,
        initTheme,
        initLanguage,
        updateLanguage,
        updateNavButtons,
        updateButtonEffects,
        updateTouchFeedback,
        touchStartHandler,
        touchEndHandler,
        touchCancelHandler,
        initNavIndicator,
        updateNavIndicator,
        copyEmail,
        fallbackCopy,
        showCopySuccess,
        initPage
    };
}
