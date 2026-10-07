(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var header = document.querySelector('[data-header]');
  var progress = document.querySelector('.scroll-progress span');
  var menuButton = document.querySelector('.menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setMenu(open) {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuButton.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    mobileMenu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMenu(false);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuButton.focus();
      }
    });

    window.matchMedia('(min-width: 981px)').addEventListener('change', function (event) {
      if (event.matches) setMenu(false);
    });
  }

  var ticking = false;
  function updateScrollUI() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('is-scrolled', scrollTop > 18);
    if (progress) progress.style.width = (scrollable > 0 ? Math.min(100, scrollTop / scrollable * 100) : 0) + '%';
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollUI);
      ticking = true;
    }
  }, { passive: true });
  updateScrollUI();

  var revealItems = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealItems.forEach(function (item, index) {
      item.style.transitionDelay = Math.min(index % 3 * 70, 140) + 'ms';
      revealObserver.observe(item);
    });
  }

  var desktopNavLinks = Array.prototype.slice.call(document.querySelectorAll('.desktop-nav a'));
  var observedSections = desktopNavLinks.map(function (link) {
    var hash = link.hash;
    return hash ? document.querySelector(hash) : null;
  }).filter(Boolean);

  if ('IntersectionObserver' in window && observedSections.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
      if (!visible.length) return;
      var activeId = '#' + visible[0].target.id;
      desktopNavLinks.forEach(function (link) {
        link.classList.toggle('is-active', link.hash === activeId);
      });
    }, { rootMargin: '-18% 0px -62% 0px', threshold: [0.01, 0.25, 0.5] });
    observedSections.forEach(function (section) { navObserver.observe(section); });
  }

  var hotspotCopy = {
    translation: {
      index: '01 / 实时翻译',
      title: '在会话里理解与回应',
      text: '减少复制粘贴，让翻译成为沟通过程的一部分。'
    },
    accounts: {
      index: '02 / 多账号工作区',
      title: '让不同账号保留清晰边界',
      text: '按账号与业务用途区分环境，减少窗口与设备切换。'
    },
    context: {
      index: '03 / 客户上下文',
      title: '让下一次跟进接得上',
      text: '通过标签、备注和状态保存业务所需的沟通背景。'
    }
  };
  var hotspots = Array.prototype.slice.call(document.querySelectorAll('[data-hotspot]'));
  var hotspotCard = document.querySelector('.hotspot-card');

  hotspots.forEach(function (button) {
    button.addEventListener('click', function () {
      var copy = hotspotCopy[button.getAttribute('data-hotspot')];
      if (!copy || !hotspotCard) return;
      hotspots.forEach(function (item) {
        var current = item === button;
        item.classList.toggle('is-active', current);
        item.setAttribute('aria-pressed', current ? 'true' : 'false');
      });
      hotspotCard.querySelector('small').textContent = copy.index;
      hotspotCard.querySelector('strong').textContent = copy.title;
      hotspotCard.querySelector('p').textContent = copy.text;
    });
  });

  var journeyData = {
    receive: {
      title: '接收消息',
      text: '先保留原文与渠道信息，为后续理解和回复提供完整上下文。',
      count: '1 / 4',
      progress: '25%'
    },
    understand: {
      title: '理解内容',
      text: '结合原文查看翻译结果，确认客户问题、语气和关键业务信息。',
      count: '2 / 4',
      progress: '50%'
    },
    reply: {
      title: '确认回复',
      text: '根据订单或业务状态组织答复，转换目标语言后在发送前再次检查。',
      count: '3 / 4',
      progress: '75%'
    },
    record: {
      title: '更新记录',
      text: '补充必要的标签、跟进状态和备注，让下一次沟通延续当前上下文。',
      count: '4 / 4',
      progress: '100%'
    }
  };
  var journeyTabs = Array.prototype.slice.call(document.querySelectorAll('[data-journey]'));
  var journeyPanel = document.getElementById('journey-panel');

  function selectJourney(tab, focus) {
    if (!journeyPanel) return;
    var state = tab.getAttribute('data-journey');
    var data = journeyData[state];
    if (!data) return;

    journeyTabs.forEach(function (item) {
      var selected = item === tab;
      item.setAttribute('aria-selected', selected ? 'true' : 'false');
      item.setAttribute('tabindex', selected ? '0' : '-1');
    });

    journeyPanel.setAttribute('data-demo-state', state);
    journeyPanel.setAttribute('aria-labelledby', tab.id);
    journeyPanel.querySelector('.demo-inspector strong').textContent = data.title;
    journeyPanel.querySelector('.demo-inspector p').textContent = data.text;
    journeyPanel.querySelector('.demo-inspector em').textContent = data.count;
    journeyPanel.querySelector('.demo-progress span').style.width = data.progress;
    if (focus) tab.focus();
  }

  journeyTabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { selectJourney(tab, false); });
    tab.addEventListener('keydown', function (event) {
      var nextIndex = null;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % journeyTabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + journeyTabs.length) % journeyTabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = journeyTabs.length - 1;
      if (nextIndex !== null) {
        event.preventDefault();
        selectJourney(journeyTabs[nextIndex], true);
      }
    });
  });

  var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  faqItems.forEach(function (item) {
    var button = item.querySelector('button[aria-controls]');
    var answer = button ? document.getElementById(button.getAttribute('aria-controls')) : null;
    if (!button || !answer) return;
    button.addEventListener('click', function () {
      if (button.getAttribute('aria-expanded') === 'true') return;
      faqItems.forEach(function (other) {
        var otherButton = other.querySelector('button[aria-controls]');
        var otherAnswer = otherButton ? document.getElementById(otherButton.getAttribute('aria-controls')) : null;
        if (!otherButton || !otherAnswer) return;
        var open = other === item;
        other.classList.toggle('is-open', open);
        otherButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        otherAnswer.hidden = !open;
      });
    });
  });

  var parallaxStage = document.querySelector('[data-parallax-stage]');
  if (parallaxStage && !reduceMotion && window.matchMedia('(min-width: 981px)').matches) {
    parallaxStage.addEventListener('pointermove', function (event) {
      var rect = parallaxStage.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      parallaxStage.style.transform = 'perspective(1500px) rotateX(' + (-y * 1.5).toFixed(2) + 'deg) rotateY(' + (x * 2).toFixed(2) + 'deg)';
    });
    parallaxStage.addEventListener('pointerleave', function () {
      parallaxStage.style.transform = 'perspective(1500px) rotateX(0deg) rotateY(0deg)';
    });
  }
})();
