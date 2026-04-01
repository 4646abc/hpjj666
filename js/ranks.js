// 段位数据处理模块
(function() {
  'use strict';

  // 段位数据
  var rankData = [];
  var rankCategories = [];
  var currentRankCategory = null;
  var selectedRankItem = null;

  // 解析原始段位数据
  function parseRankData(rawData) {
    var lines = rawData.split('\n');
    var data = [];
    var categories = [];
    var currentCategory = null;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;

      // 跳过最后一行（推广信息）
      if (line.includes('本频道为水原千鹤美化唯一官方频道')) {
        continue;
      }

      // 检查是否是段位名称行（不包含数字和//）
      if (!/\d/.test(line) && !line.includes('//')) {
        // 这是新的段位分类
        currentCategory = {
          name: line,
          id: categories.length + 1,
          items: []
        };
        categories.push(currentCategory);
      } else if (currentCategory && line.includes('//')) {
        // 这是段位条目：ID // 名称
        var parts = line.split('//');
        if (parts.length >= 2) {
          var id = parts[0].trim();
          var name = parts[1].trim();

          var item = {
            id: id,
            name: name,
            category: currentCategory.name,
            fullName: currentCategory.name + ' ' + name,
            code: '代码待生成' // 这里可以根据需要生成实际代码
          };

          data.push(item);
          currentCategory.items.push(item);
        }
      }
    }

    return {
      data: data,
      categories: categories
    };
  }

  // 加载段位数据
  function loadRankData() {
    // 这里应该从服务器加载数据，暂时使用硬编码数据
    var rawData = `青铜段位
101 //青铜Ⅴ
102 //青铜Ⅳ
103 //青铜Ⅲ
104 //青铜Ⅱ
105 //青铜Ⅰ

白银段位
201 //白银Ⅴ
202 //白银Ⅳ
203 //白银Ⅲ
204 //白银Ⅱ
205 //白银Ⅰ

黄金段位
301 //黄金Ⅴ
302 //黄金Ⅳ
303 //黄金Ⅲ
304 //黄金Ⅱ
305 //黄金Ⅰ

铂金段位
401 //铂金Ⅴ
402 //铂金Ⅳ
403 //铂金Ⅲ
404 //铂金Ⅱ
405 //铂金Ⅰ

新钻段位
501 //新钻Ⅴ
502 //新钻Ⅳ
503 //新钻Ⅲ
504 //新钻Ⅱ
505 //新钻Ⅰ

皇冠段位
601 //皇冠Ⅴ
602 //皇冠Ⅳ
603 //皇冠Ⅲ
604 //皇冠Ⅱ
605 //皇冠Ⅰ

王牌段位（1-9星）
701 //王牌1星
702 //王牌2星
703 //王牌3星
704 //王牌4星
705 //王牌5星
706 //王牌6星
707 //王牌7星
708 //王牌8星
709 //王牌9星

王牌段位（10-20星）
720 //王牌10星
721 //王牌11星
722 //王牌12星
723 //王牌13星
724 //王牌14星
725 //王牌15星
726 //王牌16星
727 //王牌17星
728 //王牌18星
729 //王牌19星
730 //王牌20星

战神段位
801 //战神`;

    var parsed = parseRankData(rawData);
    rankData = parsed.data;
    rankCategories = parsed.categories;

    // 渲染分类栏
    renderRankCategories();

    // 显示加载完成
    el('rMain').innerHTML = '<div class="empty"><i>🏆</i>选择段位分类或搜索段位</div>';
  }

  // 渲染段位分类栏
  function renderRankCategories() {
    var container = el('rCatBar');
    if (!container) return;

    container.innerHTML = '';

    // 添加"全部"分类
    var allBtn = document.createElement('div');
    allBtn.className = 'cb on';
    allBtn.textContent = '全部';
    allBtn.onclick = function() {
      setRankCategory(null);
    };
    container.appendChild(allBtn);

    // 添加各段位分类
    for (var i = 0; i < rankCategories.length; i++) {
      var category = rankCategories[i];
      var btn = document.createElement('div');
      btn.className = 'cb';
      btn.textContent = category.name;
      btn.onclick = (function(cat) {
        return function() {
          setRankCategory(cat.name);
        };
      })(category);
      container.appendChild(btn);
    }
  }

  // 设置当前段位分类
  function setRankCategory(categoryName) {
    currentRankCategory = categoryName;

    // 更新分类按钮状态
    var buttons = el('rCatBar').querySelectorAll('.cb');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var isActive = (i === 0 && categoryName === null) ||
                     (i > 0 && rankCategories[i-1].name === categoryName);
      btn.className = 'cb' + (isActive ? ' on' : '');
    }

    // 渲染段位列表
    renderRankList();
  }

  // 渲染段位列表
  function renderRankList() {
    var container = el('rMain');
    if (!container) return;

    // 过滤数据
    var items = rankData;
    if (currentRankCategory) {
      items = items.filter(function(item) {
        return item.category === currentRankCategory;
      });
    }

    if (items.length === 0) {
      container.innerHTML = '<div class="empty"><i>🔍</i>未找到匹配的段位</div>';
      return;
    }

    // 创建列表
    var html = '';

    // 按分类分组显示
    var grouped = {};
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    }

    for (var categoryName in grouped) {
      var categoryItems = grouped[categoryName];

      html += '<div class="cat-wrap" style="margin-top:15px">';
      html += '<div class="cat-slbl">' + categoryName + '</div>';
      html += '<div class="rlist">';

      for (var j = 0; j < categoryItems.length; j++) {
        var item = categoryItems[j];
        html += '<div class="card rc" data-id="' + item.id + '" data-name="' + item.name + '" data-category="' + item.category + '">';
        html += '<div class="card-body">';
        html += '<div class="thumb" style="background:linear-gradient(135deg,#1a2b3c,#0f1c2a)">';
        html += '<div style="font-size:24px;color:var(--acc)">🏆</div>';
        html += '</div>';
        html += '<div style="flex:1">';
        html += '<div class="ctop">';
        html += '<div class="cname">' + item.name + '</div>';
        html += '<div class="cid">' + item.id + '</div>';
        html += '</div>';
        html += '<div class="cfields">';
        html += '<div class="fld"><div class="flbl">分类</div><div class="fval">' + item.category + '</div></div>';
        html += '<div class="fld"><div class="flbl">ID</div><div class="fval">' + item.id + '</div></div>';
        html += '<div class="fld"><div class="flbl">代码</div><div class="fval">点击查看</div></div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
      }

      html += '</div></div>';
    }

    container.innerHTML = html;

    // 添加点击事件
    var cards = container.querySelectorAll('.card.rc');
    for (var i = 0; i < cards.length; i++) {
      cards[i].onclick = function() {
        var id = this.getAttribute('data-id');
        var name = this.getAttribute('data-name');
        var category = this.getAttribute('data-category');
        selectRankItem(id, name, category);
      };
    }
  }

  // 选择段位项
  function selectRankItem(id, name, category) {
    selectedRankItem = {
      id: id,
      name: name,
      category: category,
      fullName: category + ' ' + name
    };

    // 显示选择框
    el('rSelName').textContent = selectedRankItem.fullName;
    el('rSelId').textContent = selectedRankItem.id;
    el('rSelSub').textContent = '段位代码';
    el('rSelBox').style.display = 'flex';

    // 生成代码
    generateRankCodes();

    // 滚动到选择框
    el('rSelBox').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // 生成段位代码
  function generateRankCodes() {
    if (!selectedRankItem) return;

    var codesArea = el('rCodesArea');
    codesArea.innerHTML = '';

    // 这里生成实际的段位代码
    // 根据ID生成不同的代码格式
    var codes = [
      {
        label: '基础代码',
        value: 'rank_set ' + selectedRankItem.id + ' // ' + selectedRankItem.fullName
      },
      {
        label: '完整代码',
        value: '// 段位设置代码\n// ' + selectedRankItem.fullName + '\nset_rank(' + selectedRankItem.id + ', "' + selectedRankItem.name + '")'
      },
      {
        label: '偏移地址',
        value: '0x' + (parseInt(selectedRankItem.id) + 0x1000).toString(16).toUpperCase() + ' // ' + selectedRankItem.name
      }
    ];

    var html = '';
    for (var i = 0; i < codes.length; i++) {
      var code = codes[i];
      html += '<div class="cr ms">';
      html += '<div class="clbl">' + code.label + '</div>';
      html += '<div class="cv">' + code.value + '</div>';
      html += '<button class="ccpy" data-code="' + encodeURIComponent(code.value) + '">复制</button>';
      html += '</div>';
    }

    // 添加一键复制所有按钮
    html += '<button class="cpyall" id="rCopyAll">一键复制全部代码</button>';

    codesArea.innerHTML = html;

    // 添加复制事件
    var copyBtns = codesArea.querySelectorAll('.ccpy');
    for (var i = 0; i < copyBtns.length; i++) {
      copyBtns[i].onclick = function() {
        var code = decodeURIComponent(this.getAttribute('data-code'));
        copyToClipboard(code);
        showToast('已复制到剪贴板');
      };
    }

    // 一键复制所有
    el('rCopyAll').onclick = function() {
      var allCode = '';
      for (var i = 0; i < codes.length; i++) {
        allCode += codes[i].value + '\n';
      }
      copyToClipboard(allCode.trim());
      showToast('已复制全部代码');
    };
  }

  // 搜索段位
  function searchRanks() {
    var query = el('rq').value.trim().toLowerCase();
    if (!query) {
      setRankCategory(currentRankCategory);
      return;
    }

    var container = el('rMain');
    if (!container) return;

    // 过滤数据
    var results = rankData.filter(function(item) {
      return item.id.toLowerCase().includes(query) ||
             item.name.toLowerCase().includes(query) ||
             item.category.toLowerCase().includes(query) ||
             item.fullName.toLowerCase().includes(query);
    });

    if (results.length === 0) {
      container.innerHTML = '<div class="empty"><i>🔍</i>未找到匹配的段位</div>';
      return;
    }

    // 显示结果
    var html = '<div class="rhdr"><div class="rtitle">搜索结果</div><div class="rcnt">' + results.length + ' 项</div></div>';
    html += '<div class="rlist">';

    for (var i = 0; i < results.length; i++) {
      var item = results[i];
      html += '<div class="card rc" data-id="' + item.id + '" data-name="' + item.name + '" data-category="' + item.category + '">';
      html += '<div class="card-body">';
      html += '<div class="thumb" style="background:linear-gradient(135deg,#1a2b3c,#0f1c2a)">';
      html += '<div style="font-size:24px;color:var(--acc)">🏆</div>';
      html += '</div>';
      html += '<div style="flex:1">';
      html += '<div class="ctop">';
      html += '<div class="cname">' + item.name + '</div>';
      html += '<div class="cid">' + item.id + '</div>';
      html += '</div>';
      html += '<div class="cfields">';
      html += '<div class="fld"><div class="flbl">分类</div><div class="fval">' + item.category + '</div></div>';
      html += '<div class="fld"><div class="flbl">ID</div><div class="fval">' + item.id + '</div></div>';
      html += '<div class="fld"><div class="flbl">代码</div><div class="fval">点击查看</div></div>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;

    // 添加点击事件
    var cards = container.querySelectorAll('.card.rc');
    for (var i = 0; i < cards.length; i++) {
      cards[i].onclick = function() {
        var id = this.getAttribute('data-id');
        var name = this.getAttribute('data-name');
        var category = this.getAttribute('data-category');
        selectRankItem(id, name, category);
      };
    }
  }

  // 工具函数 - 使用全局函数（如果存在）
  var el = window.el || function(id) { return document.getElementById(id); };
  var copyToClipboard = window.cpy || function(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      var textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };
  var showToast = window.showToast || function(msg) {
    var toast = el('toast');
    toast.textContent = msg;
    toast.className = 'toast show';
    setTimeout(function() {
      toast.className = 'toast';
    }, 2000);
  };

  // 初始化
  function initRankModule() {
    try {
      console.log('段位模块初始化开始...');

      // 检查必要元素是否存在
      var requiredElements = ['rsb', 'rq', 'rClrBtn', 'rCatBar', 'rMain'];
      for (var i = 0; i < requiredElements.length; i++) {
        if (!el(requiredElements[i])) {
          console.error('元素不存在:', requiredElements[i]);
        }
      }

      // 加载数据
      loadRankData();

      // 绑定搜索按钮事件
      if (el('rsb')) {
        el('rsb').onclick = searchRanks;
      }

      // 绑定搜索框回车事件
      if (el('rq')) {
        el('rq').addEventListener('keyup', function(e) {
          if (e.key === 'Enter') {
            searchRanks();
          }
        });
      }

      // 绑定清除按钮事件
      if (el('rClrBtn')) {
        el('rClrBtn').onclick = function() {
          selectedRankItem = null;
          el('rSelBox').style.display = 'none';
          el('rCodesArea').innerHTML = '';
          setRankCategory(currentRankCategory);
        };
      }

      console.log('段位模块初始化完成');
    } catch (error) {
      console.error('段位模块初始化错误:', error);
    }
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRankModule);
  } else {
    setTimeout(initRankModule, 100);
  }

})();