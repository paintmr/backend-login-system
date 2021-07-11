$(function () {
  // 定义一个查询的参数对象，将来请求数据的时候，需要将请求参数对象提交到服务器。
  var datap = {
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
  // 获取文字列表数据的方法
  function initTable() {
    $.ajax({
      method: 'GET',
      url: '/my/article/list',
      data: datap,
      success: function (res) {
        console.log(res);
        if (res.status !== 0) {
          return layer.msg('获取文章列表失败TT')
        }
        // 使用模板引擎渲染页面数据
        var htmlStr = template('tpl-table', res)
        $('tbody').html(htmlStr);
      }
    })
  }
})