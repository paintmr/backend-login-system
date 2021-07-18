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

})