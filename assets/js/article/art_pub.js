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
        // console.log(htmlStr);
        $('[name="cate_id"]').html(htmlStr)
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

  // 为选择封面的按钮绑定点击事件处理函数
  $('#btnChooseImage').on('click', function () {
    $('#coverFile').click()
  })

  // 监听coverFile的change事件，获取用户选择的文件列表
  $('#coverFile').on('change', function (e) {
    // 获取到文件的列表数组
    var files = e.target.files
    // 判断用户是否选择了文件
    if (files.length === 0) {
      return
    }
    // 根据文件，创建对应的URL地址
    var newImgURL = URL.createObjectURL(files[0])
    // 为裁剪区域重新设置图片
    $image
      .cropper('destroy') // 销毁旧的裁剪区域
      .attr('src', newImgURL) // 重新设置图片路径
      .cropper(options) // 重新初始化裁剪区域
  })

  // 定义文章的发布状态，默认为“已发布”。如果用户点击了“存为草稿”按钮，就把art_state改为“草稿”
  var art_state = '已发布'
  // 为存为草稿按钮绑定点击事件处理函数
  $('#btnSave2').on('click', function () {
    art_state = '草稿'
  })

  // 为表单绑定submit提交事件
  $('#form-pub').on('submit', function (e) {
    // 阻止表单的默认提交行为
    e.preventDefault()
    // 基于form表单，快速创建一个FormData对象。用$(this)[0]把$(this)这个jQuery对象转换为DOM原生对象，作为参数传递给FormData
    var fd = new FormData($(this)[0]);
    // 将文章的发布状态存到fd中
    fd.append('state', art_state)
    // 将封面裁剪过后的图片，输出为一个文件对象
    $image
      .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
        width: 400,
        height: 280
      })
      .toBlob(function (blob) { // 将 Canvas 画布上的内容，转化为文件对象
        // 得到文件对象后，进行后续的操作
        // 将文件对象存储到fd中
        fd.append('cover_img', blob)
        // console.log(blob);

        // 看情况是新发文章还是编辑文章提交
        if (artId) {
          // 发起编辑文章的ajax数据请求
          var url = '/my/article/edit'
          var msg = {
            success: '编辑文章成功！',
            failure: '编辑文章失败TT'
          }
        } else {
          // 发起新发文章的ajax数据请求
          var url = '/my/article/add'
          var msg = {
            success: '发布文章成功！',
            failure: '发布文章失败TT'
          }
        }
        postArticle(fd, url, msg)


        // 打印看下fd里面的内容
        // fd.forEach(function (value, key) {
        //   console.log(key, value);
        // })
      })
  })

  // 定义一个发布文章的方法，新发文章和编辑文章通用
  function postArticle(fd, url, msg) {
    $.ajax({
      method: 'POST',
      url: url,
      data: fd,
      // 注意：如果向服务器提交的是FormData格式的数据，必须添加以下两个配置项，否则请求会失败
      contentType: false,
      processData: false,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg(msg.failure)
        }
        layer.msg(msg.success)
        // 清除全局的单篇文章标记
        artId = null;
        // 发布文章成功后，跳转到文章列表页面
        location.href = '/article/art_list.html'
        //  $('#list_art', window.parent.document)  这是找出父页面中id为list_art的元素：侧边栏“文章管理”中的“文章列表”。把“文章列表”选中，“发布文章”去掉选中样式
        $('#list_art', window.parent.document).parent().addClass('layui-this').siblings().removeClass('layui-this')
      }
    })
  }

  // 如果是从art_list.js点击了编辑按钮跳转过来的
  var artId = window.parent.artId
  window.parent.artId = null
  if (artId) {
    $.ajax({
      method: 'GET',
      url: '/my/article/' + artId,
      success: function (res) {
        // console.log(res.data);

        // 根据cate_id获取文章分类名称
        var artCateId = res.data.cate_id
        $.ajax({
          method: 'GET',
          url: '/my/article/cates/' + artCateId,
          success: function (res) {
            artCateId = artCateId + '';
            for (let i = 0; i < $('#artCate')[0].length; i++) {
              // console.log(($('#artCate')[0].options[i].value));打印出来是string，所以要把上面的artCateId转换为string才好比较
              if (($('#artCate')[0].options[i].value) === artCateId) {
                $('#artCate')[0].options[i].selected = true
              }
            }
            form.render();
          }
        })

        // 设置图片
        // 为裁剪区域重新设置图片
        var artImgURL = 'http://api-breakingnews-web.itheima.net' + res.data.cover_img
        $image
          .cropper('destroy') // 销毁旧的裁剪区域
          .attr('src', artImgURL) // 重新设置图片路径
          .cropper(options) // 重新初始化裁剪区域

        // 把其它数据放入form表单中
        form.val('form-pub', res.data) //如果这种方式无法把数据放入form中，尝试下面的方法
        // form.val('form-pub', JSON.parse(JSON.stringify(res.data)))
      }
    })
  }


})