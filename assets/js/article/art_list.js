$(function () {
  // 定义一个查询的参数对象，将来请求数据的时候，需要将请求参数对象提交到服务器。
  var dataP = {
    pagenum: 1,  //页码值，默认请求第一页的
    pagesize: 2, //每页显示几条数据, 默认每页显示2条
    cate_id: '', //文章分类的id
    state: '', //文章的状态
  }

  var layer = layui.layer;

  // 定义美化时间的过滤器
  template.defaults.imports.dataFormat = function (date) {
    const dt = new Date(date)
    var y = padZero(dt.getFullYear())
    var m = padZero(dt.getMonth() + 1)
    var d = padZero(dt.getDate())

    var hh = padZero(dt.getHours())
    var mm = padZero(dt.getMinutes())
    var ss = padZero(dt.getSeconds())

    return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
  }

  // 定义美化时间的过滤器的补零函数
  function padZero(n) {
    return n > 9 ? n : '0' + n
  }

  initTable()
  // 获取文章列表数据的方法
  function initTable() {
    $.ajax({
      method: 'GET',
      url: '/my/article/list',
      data: dataP,
      success: function (res) {
        // console.log(res);
        if (res.status !== 0) {
          return layer.msg('获取文章列表失败TT')
        }
        // 使用模板引擎渲染页面数据
        var htmlStr = template('tpl-table', res)
        $('tbody').html(htmlStr);
        // 调用渲染分页的方法
        renderPage(res.total)
      }
    })
  }

  initCate()
  // 初始化文章分类的方法
  var form = layui.form
  function initCate() {
    $.ajax({
      method: 'GET',
      url: '/my/article/cates',
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('获取分类数据失败TT')
        }
        // 调用模板引擎渲染分类的可选项目
        var htmlStr = template('tpl-cate', res)
        // console.log(htmlStr);
        $('[name=cate_id]').html(htmlStr)
        // 要告诉layui重新渲染一下表单区域的UI结构，否则下拉菜单是空的。
        form.render();
      }
    })
  }

  // 为筛选表单绑定submit事件
  $('#form-search').on('submit', function (e) {
    e.preventDefault();
    // 获取表单中选中项的值
    var cate_id = $('[name=cate_id]').val()
    var state = $('[name=state]').val()
    // 为查询参数对象dataP中对应的属性赋值
    dataP.cate_id = cate_id
    dataP.state = state
    // 根据新的筛选条件dataP，重新渲染表格的数据
    initTable()
  })


  // 用代理的方法，为文章的编辑按钮绑定点击事件
  $('tbody').on('click', '.art-edit', function () {
    // 进入到发布文章页面，并且把该篇文章的数据显示在页面上

    // 拿到文章id，并保留到全局变量artId中，以备art_pub.js请求数据时使用
    window.parent.artId = $(this).attr('data-id')
    // console.log(id);
    //  $('#pub_art', window.parent.document)  这是找出父页面中id为pub_art的元素：侧边栏“文章管理”中的“发布文章”。把“发布文章”选中，“文章列表”去掉选中样式
    $('#pub_art', window.parent.document).parent().addClass('layui-this').siblings().removeClass('layui-this')
    // 进入到发布文章页面
    location.href = '/article/art_pub.html'
  })

  // 定义渲染分页的方法
  var laypage = layui.laypage
  function renderPage(total) {
    // 调用laypage.render()方法来渲染分页的结构
    laypage.render({
      elem: 'pageBox', //注意，这里的 pageBox 是 ID，不用加 # 号
      count: total, //数据总数，从服务端得到
      limit: dataP.pagesize, //每页显示几条数据
      curr: dataP.pagenum, //默认选中哪一页，一般默认选中第1页
      layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
      limits: [2, 3, 5, 10],
      // 两种情况触发jump函数：（1）只要执行laypage.render（包括第1次加载页面时），就会触发jump.（2）点击切换页码时，触发jump回调函数，（3）点击下拉框，选择每页显示几条，也会触发jump。
      // jump回调函数中有个参数是first，只有在包括第1次加载页面时first===true，其它情况下是undefined
      jump: function (obj, first) {
        // 把最新的页码值赋值到dataP这个查询参数对象中
        dataP.pagenum = obj.curr
        // 把最新的每页显示多少条的数据赋值到dataP上
        dataP.pagesize = obj.limit
        // 根据最新的dataP请求文章列表数据。如果直接在这里调用initTable()，会导致死循环。要先判断jump是被那种方式触发的：第1次加载页面，还是用户点击了页码？
        if (!first) {
          initTable()
        }
      }
    })
  }

  // 删除文章
  // 通过代理的形式，为删除按钮绑定点击事件
  $('tbody').on('click', '.art-delete', function () {
    // 获取被点击的文章的id
    var id = $(this).attr('data-id')
    layer.confirm('确认删除？', { icon: 3, title: '提示' }, function (index) {
      $.ajax({
        method: 'GET',
        url: '/my/article/delete/' + id,
        success: function (res) {
          if (res.status !== 0) {
            return layer.msg('删除文章失败TT')
          }
          layer.msg('删除文章成功！')
          // 判斷一下當前頁碼是否還有數據，如果無數據，把當前頁碼值減1，再去請求文章列表數據。
          // 获取删除按钮的个数
          var delBtns = $('.art-delete').length
          // 如果len的值等于1，删除完毕后，页面上无任何数据，把当前页码值-1，再调用initTable()
          // 页码值最小必须是1
          if (delBtns === 1) {
            dataP.pagenum = dataP.pagenum === 1 ? 1 : dataP.pagenum - 1
          }
          initTable()
        }
      })
      layer.close(index);
    });
  })

})