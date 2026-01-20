// pages/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    webViewSrc: 'https://你的域名/'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('页面加载完成');
    // 可以在这里处理页面参数
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    console.log('页面渲染完成');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    console.log('页面显示');
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    console.log('页面隐藏');
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    console.log('页面卸载');
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    console.log('下拉刷新');
    // 可以在这里刷新web-view内容
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    console.log('上拉触底');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '我的纪念日',
      path: '/pages/index/index',
      imageUrl: ''
    }
  },

  /**
   * 监听web-view加载完成
   */
  onWebViewLoad: function(e) {
    console.log('web-view加载完成', e);
  },

  /**
   * 监听web-view加载错误
   */
  onWebViewError: function(e) {
    console.error('web-view加载错误', e);
    // 可以在这里显示错误提示
    wx.showToast({
      title: '页面加载失败',
      icon: 'none'
    });
  },

  /**
   * 监听web-view发送的消息
   */
  onWebViewMessage: function(e) {
    console.log('收到web-view消息', e.detail.data);
    // 可以在这里处理web页面发送的消息
  }
})