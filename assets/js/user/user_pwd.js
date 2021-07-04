$(function () {
  // 验证密码
  var form = layui.form
  form.verify({
    pwd: [
      /^[\S]{6,12}$/, '密码必须6到12位，且不能出现空格'
    ],
    samePwd: function (value) {
      if (value === $('[name=oldPwd]').val()) {
        return '新旧密码不能相同TT'
      }
    },
    rePwd: function (value) {
      if (value !== $('[name=newPwd]').val()) {
        return '两次密码不一致TT'
      }
    }
  })

  // 点击提交后发起ajax请求重置密码
  $('.layui-form').on('submit', function (e) {
    e.preventDefault();
    $.ajax({
      method: 'POST',
      url: '/my/updatepwd',
      data: $(this).serialize(),
      success: function (res) {
        if (res.status !== 0) {
          return layui.layer.msg('更新密码失败TT')
        }
        layui.layer.msg('更新密码成功')
        // 重置整个密码表单为没有数据显示的状态。先把jQuery对象加上[0]，转换成原生DOM对象，然后利用reset()方法重置所有数据。
        $('.layui-form')[0].reset();
      }
    })
  })
})