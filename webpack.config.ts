var webpack = require('webpack');
var path = require('path');
var resolveNgRoute = require('@angularclass/resolve-angular-routes');


var commonConfig = {
  resolve: {
    extensions: ['', '.ts', '.js', '.json'],
    alias: {
      "jqueryUI": "query-ui", //-1.12.0-rc.2
      "jQuery": "jquery",
      "jquery": "jquery",
      "slidesjs": path.join(__dirname, "D:/Martin/projects/angular-universal/tools/js/jquery/slideshow")
    }
  },
  module: {
    preLoaders: [
    ],
    loaders: [
      // TypeScript
      { test: /\.ts$/, loaders: ['ts-loader', 'angular2-template-loader'] },
      { test: /\.html$/, loader: 'raw-loader' },
      { test: /\.css$/, loader: 'raw-loader' },
      { test: /\.json$/, loader: 'raw-loader' },
      { test: /D:[\\\/]notia[\\\/]app[\\\/]web[\\\/]code[\\\/]angular2-test[\\\/]tools[\\\/]js[\\\/]jquery[\\\/]slideshow[\\\/]jquery.slides.js$/, loader: 'imports?jQuery=jquery,$=jquery,this=>window' },
      {
        test: /\.js$/,
        include: [
          path.join(__dirname, 'D:/Martin/projects/angular-universal/tools/js/jquery/slideshow')
        ],
        loader: 'script'
      }
    ],
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      // The (\\|\/) piece accounts for path separators in *nix and Windows
      /angular(\\|\/)core(\\|\/)src(\\|\/)linker/,
      root('./src'),
      resolveNgRoute(root('./src')),
    ),
    new webpack.ProvidePlugin({
      $: "jquery",
      jquery: "jQuery",
      jQuery: "jquery",
      "windows.jQuery": "jquery",
      'window.$': 'jquery',
      "jqueryUI": "D:/Martin/projects/angular-universal/tools/js/jquery/jquery-ui.js",
      "slick": "D:/Martin/projects/angular-universal/tools/js/jquery/carousel/slick.js",
      "slidesjs": "D:/Martin/projects/angular-universal/tools/js/jquery/slideshow/jquery.slides.js",
    })
  ]

};


var clientConfig = {
  target: 'web',
  entry: './src/client',
  output: {
    path: root('dist/client')
  },
  node: {
    global: true,
    __dirname: true,
    __filename: true,
    process: true,
    Buffer: false
  }
};


var serverConfig = {
  target: 'node',
  entry: './src/server', // use the entry file of the node server if everything is ts rather than es5
  output: {
    path: root('dist/server'),
    libraryTarget: 'commonjs2'
  },
  externals: checkNodeImport,
  node: {
    global: true,
    __dirname: true,
    __filename: true,
    process: true,
    Buffer: true
  }
};



// Default config
var defaultConfig = {
  context: __dirname,
  resolve: {
    root: root('/src')
  },
  output: {
    publicPath: path.resolve(__dirname),
    filename: 'index.js'
  }
}



var webpackMerge = require('webpack-merge');
module.exports = [
  // Client
  webpackMerge({}, defaultConfig, commonConfig, clientConfig),

  // Server
  webpackMerge({}, defaultConfig, commonConfig, serverConfig)
]

// Helpers
function checkNodeImport(context, request, cb) {
  if (!path.isAbsolute(request) && request.charAt(0) !== '.') {
    cb(null, 'commonjs ' + request); return;
  }
  cb();
}

function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [__dirname].concat(args));
}
