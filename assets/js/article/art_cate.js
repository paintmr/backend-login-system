$(function () {

  // 【--获取文章分类列表
  initArtCateList()
  // 获取文章分类的列表的函数
  function initArtCateList() {
    $.ajax({
      method: 'GET',
      url: '/my/artcate/catelist',
      success: function (res) {
        var htmlStr = template('tpl-table', res)
        $('tbody').html(htmlStr)
      }
    })
  }

  // 【--添加文章分类
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
      url: '/my/artcate/addcate',
      data: $(this).serialize(),
      success: function (res) {
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


  //【--修改文章分类
  // 通过代理的形式，为btn-edit按钮绑定点击事件。点击编辑按钮，弹出对话框。
  var indexEdit = null;
  var form = layui.form
  $('tbody').on('click', '.btn-edit', function () {
    // 获取弹出层的索引indexAdd
    indexEdit = layer.open({
      type: 1,
      area: ['500px', '250px'],
      title: '编辑文章分类',
      content: $('#dialog-edit').html()
    });

    var id = $(this).attr('data-id')
    $.ajax({
      method: 'GET',
      url: '/my/artcate/cate/' + id,
      success: function (res) {
        form.val('form-edit', res.data)
      }
    })
  })

  // 通过代理的形式，为修改分类的表单绑定submit事件
  $('body').on('submit', '#form-edit', function (e) {
    e.preventDefault();
    $.ajax({
      method: 'POST',
      url: '/my/artcate/updatecate',
      data: $(this).serialize(),
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('更新分类数据失败TT')
        }
        layer.msg('更新分类数据成功！')
        // 根据索引关闭弹出层
        layer.close(indexEdit);
        // 更新表单数据
        initArtCateList();
      }
    })
  })


  //【--删除文章分类
  // 通过代理的形式，为删除按钮绑定点击事件
  $('tbody').on('click', '.btn-delete', function () {
    var id = $(this).attr('data-id')
    // 提示用户是否要删除
    layer.confirm('确认删除?', { icon: 3, title: '提示' }, function (index) {
      $.ajax({
        method: 'GET',
        url: '/my/artcate/deletecate/' + id,
        success: function (res) {
          if (res.status !== 0) {
            return layer.msg('删除分类失败TT');
          }
          layer.msg('删除分类成功！')
          // 根据索引关闭弹出层
          layer.close(index);
          // 更新表单数据
          initArtCateList();
        }
      })
    });
  })

})