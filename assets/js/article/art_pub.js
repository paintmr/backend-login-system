$(function () {
  var layer = layui.layer
  var form = layui.form

  initCate()
  // 获取文章分类的列表的函数
  function initCate() {
    $.ajax({
      method: 'GET',
      url: '/my/article/cates',
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('初始化文章分类失败TT')
        }
        // 调用模板引擎，渲染分类的下拉菜单
        var htmlStr = template('tpl-cate', res)
        $('[name=cate_id]').html(htmlStr)
        // 要告诉layui重新渲染一下表单区域的UI结构，否则下拉菜单是空的。
        form.render();
      }
    })
  }

  // 初始化富文本编辑器
  initEditor();

  // 文章封面裁剪区域
  // 1. 初始化图片裁剪器
  var $image = $('#image')
  // 2. 裁剪选项
  var options = {
    aspectRatio: 400 / 280,
    preview: '.img-preview'
  }
  // 3. 初始化裁剪区域
  $image.cropper(options)


})