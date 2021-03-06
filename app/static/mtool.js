(function(global, undefined) {
  if (global.MTOOL) return;
  /**
   * 页面配置
   */
  var config = {
    subpages: ["home.html", "demo.html", "my.html"],
    barHeight: 44,
    top: "0px",
    bottom: "49px",
    keys: {
      token: "ml.login.token",
      guide: "ml.index.guide"
    },
    statusbar: "#eb2000",
    aniShow: "pop-in",
    titleNView: {
      titleSize: "18px",
      autoBackButton: true,
      titleColor: "#ffffff",
      backgroundColor: "#eb2000"
    }
  };
  // 已经加载的页面
  var loadedPage = { "home.html": true };

  var isPlus = false;
  // 判断runtime是否支持5+ API
  if (navigator.userAgent.indexOf("Html5Plus") < 0) {
    //不支持5+ API
    console.log("不支持5+ API");
  } else {
    //支持5+ API
    isPlus = true;
  }

  /**
   * 本地存储
   */
  var storage = (function() {
    return isPlus && typeof plus !== "undefined"
      ? plus.storage
      : global.localStorage;
  })();

  /**
   * 初始化页面
   */
  function initPage() {
    //取消浏览器的所有事件，使得active的样式在手机上正常生效
    document.addEventListener(
      "touchstart",
      function() {
        return false;
      },
      true
    );

    // 禁止选择
    document.oncontextmenu = function() {
      return false;
    };

    if (isPlus) {
      plusReady(function() {
        console.log("init page:" + plus.webview.currentWebview().id);
        // 隐藏滚动条
        plus.webview.currentWebview().setStyle({ scrollIndicator: "none" });
        // 强制竖屏
        plus.screen.lockOrientation("portrait-primary");
      });
    }
  }

  /**
   * 主页面容器
   * @param {Number} idx 页面索引
   */
  function initWebview(idx) {
    if (!isPlus) return;

    //设置默认打开首页显示的子页序号；
    var index = idx || 0;
    //把子页的路径写在数组里面
    var subpages = config.subpages;

    //所有的plus-*方法写在mui.plusReady中或者后面。
    mui.plusReady(function() {
      // 状态栏颜色
      setStatusBarBg();

      //获取当前页面所属的Webview窗口对象
      var self = plus.webview.currentWebview();

      var secondWebview = plus.webview.getSecondWebview();

      if (secondWebview) {
        self.append(secondWebview);
      }

      for (var i = 1; i < subpages.length; i++) {
        // 除secondWebview外的subpages
        // 创建webview子页
        var sub = plus.webview.create(
          subpages[i], //子页url
          subpages[i], //子页id
          {
            top: config.top, //设置距离顶部的距离
            bottom: config.bottom, //设置距离底部的距离
            // bounce: i == 1 ? "vertical" : "none",
            render: "always",
            // bounceBackground: "#FFFFFF",
            scrollIndicator: "none",
            statusbar: {}
          }
        );
        // 如不是我们设置的默认的子页则隐藏，否则添加到窗口中
        if (i != index) {
          sub.hide();
        }
        // 将webview对象填充到窗口
        self.append(sub);
      }
    });
  }

  function setStatusBarBg(color, style) {
    // 设置系统状态栏背景
    plus.navigator.setStatusBarBackground(color || config.statusbar);
    plus.navigator.setStatusBarStyle(style || "light");
  }

  function floatWebview(url, opt) {
    var floatw = plus.webview.getWebviewById(url);
    if (floatw) {
      // 避免快速多次点击创建多个窗口
      floatw.show("fade-in");
    } else {
      floatw = plus.webview.create(
        url,
        url,
        {
          background: "transparent",
          zindex: 99
        },
        (opt && opt.extras) || null
      );
      floatw.show("fade-in");
    }
  }

  /**
   * 切换tabbar
   * @param {String} path
   */
  function switchTab(path, lastpath) {
    if (typeof plus !== "undefined") {
      if (loadedPage[path]) {
        plus.webview.show(path, "none");
      } else {
        // console.log("aniShow :" + path);
        plus.webview.show(path);
      }
      // 标记为已加载
      loadedPage[path] = true;

      // 不使用hide无闪屏，但卡顿
      if (lastpath) {
        plus.webview.hide(lastpath, "none");
      } else {
        config.subpages.forEach(function(v) {
          if (v !== path) {
            plus.webview.hide(v, "none");
          }
        });
      }
    } else {
      window.location.href = path;
    }
  }

  /**
   * 返回主页
   */
  function goHome() {
    switchTab("home.html");
    invoke("Hbuilder", "index_update_tab", {
      path: "home.html"
    });

    plusReady(function() {
      invoke(plus.runtime.appid, "index_update_tab", {
        path: "home.html"
      });
    });
  }

  /**
   * 快速新开webview
   * @param {String} url
   */

  function openWindow(url, options) {
    if (!url) {
      return;
    }

    var styles = {};
    var extras = {};

    if (options && typeof options.styles === "object") {
      styles = Object.assign(styles, options.styles);
    }

    if (options && typeof options.extras === "object") {
      extras = Object.assign(extras, options.extras);
    }

    // id为url去掉hash和query
    var id = url;
    if (id.indexOf("#") !== -1) {
      id = id.substring(0, id.indexOf("#"));
    }
    if (id.indexOf("?") !== -1) {
      id = id.substring(0, id.indexOf("?"));
    }

    mui.openWindow({
      url: url,
      id: id,
      extras: extras,
      styles: styles,
      show: {
        aniShow: (options && options.aniShow) || config.aniShow
      },
      waiting: {
        autoShow: false
      }
    });
  }

  function openWindowWithTitle(url, options) {
    if (!options) options = {};

    if (!options.styles) options.styles = {};
    if (!options.styles.titleNView) options.styles.titleNView = {};

    Object.assign(options.styles.titleNView, config.titleNView);

    openWindow(url, options);
  }

  /**
   * plusready or execute
   * @param {Function} fn
   */
  function plusReady(fn) {
    if (isPlus) {
      return mui.plusReady(fn);
    } else {
      setTimeout(function() {
        fn && fn();
      }, 0);
    }
  }

  // 封装mui.fire
  var invoke = function(targetId, event, data) {
    if (!isPlus) return;
    plusReady(function() {
      var page = plus.webview.getWebviewById(targetId);
      mui.fire(page, event, data);
    });
  };

  var invokeAll = function(event, data) {
    if (!isPlus) return;
    var pages = plus.webview.all();
    if (pages.length) {
      for (var i = 0; i < pages.length; i++) {
        mui.fire(pages[i], event, data);
      }
    }
  };

  var MTOOL = {
    initPage: initPage,
    initWebview: initWebview,
    switchTab: switchTab,
    isPlus: isPlus,
    floatWebview: floatWebview,
    storage: storage,
    config: config,
    plusReady: plusReady,
    openWindow: openWindow,
    openWindowWithTitle: openWindowWithTitle,
    invoke: invoke,
    invokeAll: invokeAll,
    goHome: goHome,
    setStatusBarBg: setStatusBarBg
  };

  global.MTOOL = MTOOL;
})(window, undefined);

MTOOL.initPage();
