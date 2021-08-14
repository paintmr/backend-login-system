$(function () {
  // 定义一个查询的参数对象，将来请求数据的时候，需要将请求参数对象提交到服务器。
  var dataP = {
    pagenum: 1,  //页码值，默认请求第一页的
    pagesize: 3, //每页显示几条数据, 默认每页显示3条
    cate_id: '', //文章分类的id
    state: '', //文章的状态
  }
  var totalArticleNum = 0

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

  initCate()
  // 初始化文章分类的方法
  var form = layui.form
  function initCate() {
    $.ajax({
      method: 'GET',
      url: '/my/artcate/catelist',
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('获取分类数据失败TT')
        }
        // 调用模板引擎渲染分类的可选项目
        var htmlStr = template('tpl-cate', res)
        // console.log(htmlStr);
        $('[name=catelist]').html(htmlStr)
        // 要告诉layui重新渲染一下表单区域的UI结构，否则下拉菜单是空的。
        form.render();
      }
    })
  }

  initTable()
  // 获取文章列表数据的方法（获取显示的那一部分文章数据，没显示的不获取）
  function initTable() {
    $.ajax({
      method: 'GET',
      url: '/my/article/artlistshow',
      data: dataP,
      success: function (artListShow) {
        if (artListShow.status !== 0) {
          return layer.msg('获取文章列表失败TT')
        }
        // 根据cate_id获取文章分类名称后，渲染文章列表
        // artListShow有数据，才去获取文章类别的名字，否则这个举动无意义。而且根据id获取文章类别名字也不返回任何数据，那么这个分支里的template渲染就没有任何数据可以渲染，那么文章列表就不会更新，还会显示之前那个条件下的文章列表。这是错误的。
        if (artListShow.data.length !== 0) {
          for (let i = 0; i < artListShow.data.length; i++) {
            $.ajax({
              method: 'GET',
              url: '/my/artcate/cate/' + artListShow.data[i].cate_id,
              success: function (cate) {
                artListShow.data[i].cate_name = cate.data.name

                // 下面的渲染必须放在最里面的ajax这个success函数里面，否则cate_name这个字段还没被写入artListShow中，就会执行下面的渲染了。
                if (i === artListShow.data.length - 1) {
                  // 使用模板引擎渲染页面数据
                  // 根据页码pagenum和每页显示条数pagesize确定要显示的文章
                  // 设置定时器时因为cate_name这一栏有时候渲染不上。等到 artListShow.data中所有的cate_name字段都有值了以后，再渲染，可以保证所有的cate_name字段都渲染上了。而且10毫秒的延迟，用户感觉不出来。
                  setTimeout(function () {
                    var htmlStr = template('tpl-table', artListShow)
                    $('tbody').html(htmlStr);
                  }, 10)
                }
              }
            })
          }
        } else { //如果artListShow.data没有数据，就直接渲染空的列表。
          var htmlStr = template('tpl-table', artListShow)
          $('tbody').html(htmlStr);
        }
      }
    })
  }

  // 获取所有文章的总数，以便调用渲染分页的方法
  getArtAll()
  function getArtAll() {
    $.ajax({
      method: 'GET',
      url: '/my/article/artlistAll',
      data: dataP,
      success: function (artListAll) {
        if (artListAll.status !== 0) {
          return layer.msg('获取文章列表失败TT')
        }
        // 调用渲染分页的方法
        totalArticleNum = artListAll.data
        renderPage(artListAll.data)
      }
    })
  }
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
      limits: [3, 5, 10],
      // 这些情况触发jump函数：（1）点击切换页码时，触发jump回调函数，（2）点击下拉框，选择每页显示几条，也会触发jump。
      // 只要执行laypage.render（包括第1次加载页面时），就会触发jump。
      // jump回调函数中有个参数是first，只有在第1次加载页面时first===true，其它情况下是undefined
      jump: function (obj, first) {
        // 把最新的页码值赋值到dataP这个查询参数对象中
        dataP.pagenum = obj.curr
        // 把最新的每页显示多少条的数据赋值到dataP上
        dataP.pagesize = obj.limit
        // 根据最新的dataP请求文章列表数据。如果直接在这里调用getArtAll()，会导致死循环。要先判断jump是被那种方式触发的：第1次加载页面，还是用户点击了页码？
        if (!first) {
          initTable()
          getArtAll()
        }
      }
    })
  }

  // 为筛选表单绑定submit事件
  $('#form-search').on('submit', function (e) {
    e.preventDefault();
    // 获取表单中选中项的值
    var cate_id = $('[name=catelist]').val()
    var state = $('[name=state]').val()
    // 为查询参数对象dataP中对应的属性赋值
    dataP.cate_id = cate_id
    dataP.state = state
    // 根据新的筛选条件dataP，重新渲染表格的数据
    initTable()
    getArtAll()
  })

  // 用代理的方法，为文章的编辑按钮绑定点击事件
  $('tbody').on('click', '.art-edit', function () {
    // 进入到发布文章页面，并且把该篇文章的数据显示在页面上

    // 拿到文章id，并保留到全局变量artId中（该变量写在了index.js中），以备art_pub.js请求数据时使用
    window.parent.artId = $(this).attr('data-id')
    // console.log(id);
    //  $('#pub_art', window.parent.document)  这是找出父页面中id为pub_art的元素：侧边栏“文章管理”中的“发布文章”。把“发布文章”选中，“文章列表”去掉选中样式
    $('#pub_art', window.parent.document).parent().addClass('layui-this').siblings().removeClass('layui-this')
    // 进入到发布文章页面
    location.href = '/article/art_pub.html'
  })

  // 删除文章
  // 通过代理的形式，为删除按钮绑定点击事件
  $('tbody').on('click', '.art-delete', function () {
    // 获取被点击的文章的id
    var id = $(this).attr('data-id')
    layer.confirm('确认删除？', { icon: 3, title: '提示' }, function (index) {
      $.ajax({
        method: 'GET',
        url: '/my/article/deleteart/' + id,
        success: function (res) {
          if (res.status !== 0) {
            return layer.msg('删除文章失败TT')
          }
          layer.msg('删除文章成功！')
          // 判斷一下當前頁碼是否還有數據，如果無數據，把當前頁碼值減1，再去請求文章列表數據。
          // 获取删除按钮的个数
          var delBtns = $('.art-delete').length
          // 如果len的值等于1，删除完毕后，页面上无任何数据，把当前页码值-1，再调用initTable()和getArtAll()
          // 页码值最小必须是1
          if (delBtns === 1) {
            dataP.pagenum = dataP.pagenum === 1 ? 1 : dataP.pagenum - 1
          }
          initTable()
          getArtAll()
        }
      })
      layer.close(index);
    });
  })

})