module.exports = {
  title: '晓风轻技术小站',
  description: '把代码写复杂很容易，把代码写简单很难，这里讲的是如何编写简单易读的代码',
  dest: './dist',    // 设置输出目录
  base: '/', // 设置站点根路径
  
  themeConfig: {
    repo: 'https://github.com/xwjie' ,
    nav: [
      { text: '首页', link: '/' },
      { text: '编程规范', link: '/rule/' },
      { text: 'Ajax跨域详解', link: '/ajax/' },
      { text: 'WebFlux', link: '/webflux/' },
      { text: 'Vue', link: 'https://github.com/xwjie/VueStudyNote' },
      //{ text: '个人首页', link: 'http://www.xiaowenjie.cn' },
    ],
    sidebar:  {
      '/rule/': [{
	      title: '程序员你为什么这么累',
	      collapsable: false,
	      children: [
	        '',
	        'rest-defined',
	        'controller',
	        'aop',
	        'log',
	        'exception',
	        'i18n-valid',
	        'util',
	        'function',
	        'config',
	        'github'
	      ]
	    }],
		'/ajax/': [{
	      //title: 'Ajax跨越安全详解',
	      collapsable: false,
	      children: [
	        '',
	      ]
  	  	}],
    	'/webflux/': [{
	      //title: 'Ajax跨越安全详解',
	      collapsable: false,
	      children: [
	        '',
	        'webflux-study-path',
	        'imooc'
	      ]
	    }],
      '/css/': [
        'three',
        'four'
      ]
    }
	}, //themeConfig
    configureWebpack: {
    resolve: {
      alias: {
        '@img': 'images'
      }
    }
  }
}