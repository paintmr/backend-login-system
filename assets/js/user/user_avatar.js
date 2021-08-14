$(function () {
  // 设置裁剪区域
  // 1.1 獲取裁剪區域的 DOM 元素
  var $image = $('#image')
  // 1.2 配置選項
  const options = {
    // 縱橫比
    // 正方形，下面的1相当于1/1
    aspectRatio: 1,
    // 宽高比16:9的长方形
    // aspectRatio: 16 / 9,
    // 指定預覽區域
    preview: '.img-preview'
  }
  // 1.3 創建裁剪區域
  $image.cropper(options)

  // 看服务器端数据库里是否存了头像（index.js中请求用户资料时，返回的数据包含头像地址字段），有则用数据库的，没有则用本地样图。
  var currentSrc = $("#forChgAvt", parent.document)[0].style.display === 'none' ? '/assets/images/sample.jpg' : $("#forChgAvt", parent.document)[0].currentSrc

  $image
    .cropper('destroy') // 销毁旧的裁剪区域
    .attr('src', currentSrc) // 重新设置图片路径
    .cropper(options) // 重新初始化裁剪区域

  // 点击上传图片：点击“上传”按钮，模拟点击file选择框
  $('#btnChooseImage').on('click', function () {
    $('#file').click();
  })

  // 为上传文件的input绑定change事件。
  var layer = layui.layer
  $('#file').on('change', function (e) {
    // console.log(e);
    var filelist = e.target.files
    // console.log(filelist)
    if (filelist.length === 0) {
      return layer.msg('请选择图片')
    }
    // 拿到用户选择的文件
    var file = filelist[0]
    // 将文件转化为路径
    var imgURL = URL.createObjectURL(file)
    // 重新初始化裁剪区域
    $image
      .cropper('destroy') // 销毁旧的裁剪区域
      .attr('src', imgURL) // 重新设置图片路径
      .cropper(options) // 重新初始化裁剪区域

    // 为确定按钮绑定点击事件
    $('#btnUpload').on('click', function () {
      // 要拿到用户裁剪之后的头像
      var dataURL = $image
        .cropper('getCroppedCanvas', { // 創建一個 Canvas 畫布
          width: 100,
          height: 100
        })
        .toDataURL('image/png') // 將 Canvas 畫布上的內容，轉化為 base64 格式的字符串
      // 调用接口，把头像上传到服务器
      $.ajax({
        method: 'POST',
        url: '/my/update/avatar',
        data: {
          avatar: dataURL
        },
        success: function (res) {
          if (res.status !== 0) {
            return layer.msg('更换头像失败TT')
          }
          layer.msg('更换头像成功！')
          // 调用父页面的函数重新渲染头像
          window.parent.getUserInfo();
        }
      })
    })
  })
})