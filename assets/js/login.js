$(function () {

  // 点击“去注册账号”的连接
  $('#to_reg').on('click', function () {
    $('.login-box').hide()
    $('.reg-box').show()
  })

  // 点击“去登录”的连接
  $('#to_login').on('click', function () {
    $('.login-box').show()
    $('.reg-box').hide()
  })

  // 从layui中获取form对象。和jQuery类似。导入jQuery文件，就可以使用$对象；导入了layui的js文件，即可使用layui对象
  var form = layui.form
  // 通过form.verify()函数自定义校验规则
  form.verify({
    // 自定义一个叫做pwd的校验规则。^[\S]表示非空格的字符
    pwd: [/^[\S]{6,12}$/, '密码必须6-12位，不能出现空格'],
    // 校验两次密码规则是否一致
    repwd: function (value) {
      // 通过形参拿到确认密码框中的内容，还需要拿到密码框中的内容，然后进行一次等于的判断，如果不相等，则return一个错误的提示
      var pwd = $('.reg-box [name=password]').val()
      if (pwd !== value) {
        return '两次密码不一致'
      }
    }
  })
})