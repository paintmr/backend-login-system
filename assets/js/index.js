$(function () {
  // 如果用户没有登录，自行输入了index.html，则让用户跳转到login.html页面去登录或者注册
  if (!localStorage.getItem('token')) {
    location.href = '/login.html'
  }

  getUserInfo()

  // 点击安全退出
  var layer = layui.layer;
  $('#btnLogout').on('click', function () {
    // 提示用户是否确认退出
    layer.confirm('确定退出登录？', { icon: 3, title: '提示' }, function (index) {
      //清空本地存储的token
      localStorage.removeItem('token')
      // 跳转到登录页面
      location.href = '/login.html'
      layer.close(index);
    });
  })

  // 设置一个全局变量，以备在art_list.js中修改文章。点击了哪篇文章，就把文章的id值赋值给artId
  var artId

})

// 获取用户的基本信息的函数
function getUserInfo() {
  $.ajax({
    method: 'GET',
    url: '/my/userinfo',
    // headers 请求头配置对象
    // headers: {
    //   Authorization: localStorage.getItem('token') || ''
    // },
    success: function (res) {
      if (res.status !== 0) {
        return layui.layer.msg('获取用户信息失败TT')
      }
      // 调用renderAvatar函数渲染用户头像
      renderAvatar(res.data)
    },
    // 不论是否成功拿到数据，之后都会执行complete函数
    // complete: function (res) {
    //   // console.log('执行了complete回调');
    //   // console.log(res);
    //   // 在complete回调函数中，可以使用res.responseJSON拿到服务器响应回来的数据
    //   if (res.responseJSON.status === 1 && res.responseJSON.message === '身份认证失败！') {
    //     // 清空token
    //     localStorage.removeItem('token')
    //     // 跳转到登录页面
    //     location.href = '/login.html'
    //   }
    // }
  })
}

// 渲染用户头像和用户名的函数
function renderAvatar(user) {
  // 获取用户的名称
  var name = user.nickname || user.username
  $('#welcome').html('欢迎&nbsp;&nbsp;' + name)
  // 按需渲染用户的头像
  if (user.user_pic !== null) {
    // 渲染图片头像，隐藏文本头像
    $('.layui-nav-img').attr('src', user.user_pic).show()
    $('.text-avatar').hide()
  } else {
    // 渲染文本头像，隐藏图片头像
    var first = name[0].toUpperCase()
    $('.text-avatar').html(first).show()
    $('.layui-nav-img').hide()
  }
}
