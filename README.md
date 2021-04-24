# gulp4安装配置

#### 介绍
Gulp4配置，支持ES6语法，使用ES6语法编写Gulpfile.js文件，nodejs 8.11.1

#### 配置nvm国内镜像(nvm的settings.txt结尾添加)
    node_mirror: npm.taobao.org/mirrors/node/
    npm_mirror: npm.taobao.org/mirrors/npm/

#### 全局安装cnpm
    npm install -g cnpm --registry=https://registry.npm.taobao.org
	
#### 全局安装
    cnpm install -g gulp-cli babel babel-cli
	
#### ES6支持(在项目根目录创建 .babelrc 文件)文件内容
	{
      "presets": [
        "es2015"
      ],
      "plugins": []
    }
	
#### 安装package.json
    cnpm install
	
#### 安装指定包
    cnpm install --save-dev 包[@version
