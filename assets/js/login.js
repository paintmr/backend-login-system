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
  // 通过form.verify()函数自定义校验规则，比如下面的pwd和repwd，然后把这些规则放到login.html页面中去
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

  // 从layui中获取layer（提示）对象
  var layer = layui.layer
  // 监听注册表单的提交事件
  $('#form_reg').on('submit', function (e) {
    // 阻止默认的提交行为
    e.preventDefault();
    // 发起Ajax的post请求
    $.post(
      '/api/reguser',
      {
        username: $('#form_reg [name=username]').val(),
        password: $('#form_reg [name=password]').val()
      },
      function (res) {
        if (res.status !== 0) {
          // return console.log(res.message)
          return layer.msg(res.message)
        }
        // console.log(res.message)
        layer.msg('注册成功，请登录。')
        // 模拟点击了“去登录”按钮
        $('#to_login').click();
      })
  })

  // 监听登录表单的提交事件
  $('#form_login').submit(function (e) {
    // 阻止默认的提交行为
    e.preventDefault();
    // 发起Ajax请求
    $.ajax({
      url: '/api/login',
      method: 'POST',
      // 快速获取表单中的数据
      data: $(this).serialize(),
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg('登录失败TT')
        }
        layer.msg('登录成功！')

        // console.log(res.token);
        // 用户名qaz11 密码111111

        // 把登录成功后得到的token字符串保存到localStorage中
        localStorage.setItem('token', res.token);
        // 跳转到后台主页
        location.href = '/index.html'
      }
    })
  })

})