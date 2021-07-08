$(function () {

  initArtCateList()
  // 获取文章分类的列表的函数
  function initArtCateList() {
    $.ajax({
      method: 'GET',
      url: '/my/article/cates',
      success: function (res) {
        var htmlStr = template('tpl-table', res)
        $('tbody').html(htmlStr)
      }
    })
  }

  // 点击按钮弹出添加类别的对话框
  var layer = layui.layer
  var indexAdd = null
  $('#btnAddCate').on('click', function () {
    // 获取弹出层的索引indexAdd
    indexAdd = layer.open({
      type: 1,
      area: ['500px', '250px'],
      title: '添加文章分类',
      content: $('#dialog-add').html()
    });
  })

  // 因为#form-add表单是点击后才产生的，所以不能用常规的绑定方式；
  // $('#form-add').on('submit',function(){}) 不能这样
  // 而应该用代理的形式，为#form - add表单绑定submit事件
  $('body').on('submit', '#form-add', function (e) {
    e.preventDefault();
    $.ajax({
      method: 'POST',
      url: '/my/article/addcates',
      data: $(this).serialize(),
      success: function (res) {
        // console.log(res);
        if (res.status !== 0) {
          return layer.msg('新增分类失败TT')
        }
        initArtCateList()
        layer.msg('新增分类成功！')
        // 根据弹出层的索引，关闭相关弹出层（有的情况下，不止1个弹出层，所以需要索引一一对应相关弹出层）
        layer.close(indexAdd);
      }
    })
  })
})