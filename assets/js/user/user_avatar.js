$(function () {
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
})