"use strict";
const utils = require("./utils");
const webpack = require("webpack");
const config = require("../config");
const merge = require("webpack-merge");
const path = require("path");
const baseWebpackConfig = require("./webpack.base.conf");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");
const portfinder = require("portfinder");

const HOST = process.env.HOST;
const PORT = process.env.PORT && Number(process.env.PORT);

const entrypath = entryArr => {
  let result = {};
  if (entryArr.length) {
    entryArr.forEach(name => {
      result[name] = path.resolve(__dirname, `../src/pages/${name}/${name}.js`);
    });
  }
  return result;
};

const my = [
  "my",
  "index",
  "home",
  // "course",
  // "activity",
  // "signin",
  "my_setting",
  "my_setting_head",
  "my_setting_name",
  "my_setting_phone",
  "my_setting_phone_one",
  "my_setting_phone_three",
  "my_setting_phone_two",
  // "my_auth",
  // "my_auth_name",
  // "my_auth_areacode",
  // "my_auth_number",
  // "my_auth_type",
  // "my_fund",
  // "my_about",
  // "my_help",
  // "my_contactus",
  // "my_help_question",
  // "my_activity",
  // "my_course",
  // "signup_course",
  // "signup_course_msg",
  // "signup_activity",
  // "signup_activity_msg",
  // "info_course",
  // "info_activity",
  "login_areacode",
  // "login_account",
  "login",
  // "login_register",
  // "login_invite",
  // "login_protocol",
  "login_msg"
];

const entries = entrypath(my);

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.dev.cssSourceMap,
      usePostCSS: true
    })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: "warning",
    historyApiFallback: {
      rewrites: [
        {
          from: /.*/,
          to: path.posix.join(config.dev.assetsPublicPath, "index.html")
        }
      ]
    },
    hot: true,
    // contentBase: false, // since we use CopyWebpackPlugin.
    contentBase: config.dev.contentBase,
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": require("../config/dev.env")
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, "../static"),
        to: config.dev.assetsSubDirectory,
        ignore: [".*"]
      }
    ])
  ].concat(utils.htmlPlugin())
});

devWebpackConfig.entry = entries;

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port;
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err);
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port;
      // add port to devServer config
      devWebpackConfig.devServer.port = port;

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(
        new FriendlyErrorsPlugin({
          compilationSuccessInfo: {
            messages: [
              `Your application is running here: http://${
                devWebpackConfig.devServer.host
              }:${port}`
            ]
          },
          onErrors: config.dev.notifyOnErrors
            ? utils.createNotifierCallback()
            : undefined
        })
      );

      resolve(devWebpackConfig);
    }
  });
});
