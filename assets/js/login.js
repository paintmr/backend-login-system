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
})