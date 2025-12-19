export default {
  plugins: {
    // Vant默认的postcss-pxtorem配置
    'postcss-pxtorem': {
      rootValue: 37.5, // 设计稿宽度的1/10
      propList: ['*'], // 需要转换的属性，*表示所有属性
      selectorBlackList: ['.van-hairline'], // 不进行px转换的选择器
      exclude: /node_modules/i, // 排除node_modules目录
      minPixelValue: 1 // 小于1px的不转换
    }
  }
};