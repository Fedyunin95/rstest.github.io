import gulp from "gulp";
import path from "path";
import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import { config as webpackConfig } from "./webpack";
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
import startServer from "./server.js";
const fs = require("fs");
const glob = require("glob");
const colors = require("ansi-colors");
const w3cjs = require("w3cjs");
import imagemin from "imagemin";
import webp from "imagemin-webp";
import { pagesParameters, pagesData, data as dataAll } from "./data.js";

// Import gulp plugins
import gutil from "gulp-util";
import concat from "gulp-concat";
import concat_util from "gulp-concat-util";
import uglify from "gulp-uglify";
import rename from "gulp-rename";
import sass from "gulp-sass";
import cleanCSS from "gulp-clean-css";
import htmlhint from "gulp-htmlhint";
import htmlmin from "gulp-htmlmin";
import watch from "gulp-watch";
import ftp from "vinyl-ftp";
import spritesmith from "gulp.spritesmith";
import svgSprite from "gulp-svg-sprite";
import merge from "merge-stream";
import gulpImagemin from "gulp-imagemin";
import postcss from "gulp-postcss";
import sourcemaps from "gulp-sourcemaps";
import autoprefixer from "autoprefixer";
import pug from "gulp-pug";
import cssGlobbing from "gulp-css-globbing";

const rootPath = "./";
const buildPath = rootPath + "build/";
const sassFolderName = "src/styles";
const pugPagesSrc = [
  rootPath + "src/containers/**/*.pug",
  "!" + rootPath + "src/containers/layout.pug"
];
const stylesFolderName = buildPath + "assets/styles";
const cssFileName = "main.css";
const imageFilesSrc = [
  rootPath + "src/images/**/*.+(png|jpg|jpeg|gif|svg)",
  "!" + rootPath + "src/images/**/*_tmp*.+(png|jpg|jpeg|gif|svg)",
  "!" + rootPath + "src/images/4sprite/**/*"
];
const imagesDistFolder = buildPath + "assets/images/";
const svgInlineSpriteIconsSrc = rootPath + "src/images/svg-icons/*.svg";
const svgCssSpriteIconsSrc = rootPath + "images/svg-css-icons/*.svg";

// Compile Sass files
const sassCompile = function(src) {
  var start = Date.now();
  gutil.log("Starting \"" + gutil.colors.cyan("sassCompile") + "\"...");

  return gulp.src(src)
    .pipe(sourcemaps.init())
    .pipe(cssGlobbing({
      extensions: [".css", ".scss"]
    }))
    .pipe(sass({ indentWidth: 4 }).on("error", sass.logError))
    // .on("error", onError)
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write(rootPath + "sourcemaps"))
    .pipe(gulp.dest(rootPath + stylesFolderName))

    .on("end", function() {
      gutil.log("Finished \"" + gutil.colors.cyan("sassCompile") + "\" after " + gutil.colors.magenta(((Date.now() - start) + " ms")));
    });
};

// Minify CSS
const cssMinify = function(src) {
  const start = Date.now();
  const filename = src.replace(/^.*[\\\/]/, "");
  gutil.log("Starting \"" + gutil.colors.green("cssMinify") + "\"... " + gutil.colors.bgCyan(" " + filename + " "));

  return gulp.src(src)
    .pipe(cleanCSS({
      keepBreaks: false
    }))
    .on("error", onError)
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest(rootPath + stylesFolderName))

    .on("end", function() {
      gutil.log("Finished \"" + gutil.colors.green("cssMinify") + "\" after " + gutil.colors.magenta(((Date.now() - start) + " ms")));
    });
};

// Concatenate Css files
gulp.task("concatCSS", function() {
  return gulp.src(cssMainFilesSrc)
    .pipe(concat(cssFileName))
    .pipe(gulp.dest(stylesFolderName));
});

const convertPug2Html = function(src) {
  const pageDirName = src.replace(rootPath + "src/containers/", "").replace("/index", "").replace(".pug", "");
  const pageName = pageDirName.replace("Page", "").replace(/(?:[A-Z])/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : "-" + letter.toLowerCase();
  });
  let data = {};
  let destPath = buildPath;

  if (pageName == "index") {
    destPath = rootPath;
    data = dataAll || data;
    data.pagesList = pagesParameters;
    data.assetsDir = "build/assets/";
    data.assetsDir = "build/assets/";
  } else {
    data = pagesData[pageName];
    data = data || {};
    data.assetsDir = "assets/";
  }

  data.NODE_ENV = "production";
  data.environment = "production";
  data.lang = "ru";

  return gulp.src(src)
    .pipe(pug({
      basedir: "./src/",
      pretty: true,
      data: data
    }))
    .on("error", onError)
    .pipe(rename({
      dirname: "",
      basename: pageName
    }))
    .pipe(gulp.dest(destPath)); // указываем gulp куда положить скомпилированные HTML файлы
};

const convertPugs2Html = function() {
  return new Promise(function(resolve, reject) {
    glob(rootPath + "src/containers/**/*.pug", { "ignore": [rootPath + "src/containers/layout.pug"] }, function(er, files) {
      for (let i = 0, len = files.length; i < len; i++) {
        convertPug2Html(files[i]);
      }
    });

    resolve();
  });
};

// Optimizing Images
const imageOptimize = function(src) {
  const start = Date.now();
  gutil.log("Starting \"" + gutil.colors.green("imageOptimize") + "\"...");

  return gulp.src(src, { base: rootPath + "src/images" })
    .pipe(gulpImagemin({ progressive: true }))
    .on("error", onError)
    .pipe(gulp.dest(imagesDistFolder))

    .on("end", function() {
      gutil.log("Finished \"" + gutil.colors.green("imageOptimize") + "\" after " + gutil.colors.magenta(((Date.now() - start) + " ms")));
    });
};

gulp.task("images-optimize-all", function() {
  imageOptimize(imageFilesSrc);
});

// Generate PNG sprite
gulp.task("sprite", function() {
  // Generate our spritesheet
  const spriteData = gulp.src(rootPath + "src/images/4sprite/*.+(png|jpg|jpeg|gif|svg)").pipe(spritesmith({
    imgName: "sprite.png",
    cssName: "sprite.css",
    cssFormat: "css",
    imgPath: rootPath + "../images/sprite.png",
    padding: 3,
    cssVarMap: function(sprite) {
      //sprite.name = "sprite_" + sprite.name + "()";
      sprite.name = sprite.name.split("_").join("-");
      sprite.name = "icon-spr-" + sprite.name + "()";
    },
    cssOpts: { cssSelector: function(sprite) { return "." + sprite.name; } }
  }));

  // Pipe image stream through image optimizer and onto disk
  const imgStream = spriteData.img
    .on("error", onError)
    .pipe(gulp.dest(rootPath + "src/images/"));

  // Pipe CSS stream through CSS optimizer and onto disk
  const cssStream = spriteData.css
    .on("error", onError)
    .pipe(gulp.dest(rootPath + sassFolderName + "/"));

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);
});

// Generate SVG sprite
const svgSpriteBasicConfig = {
  dest: "",
  shape: {
    dimension: {
      maxWidth: 64,
      maxHeight: 64,
      precision: 2,
      attributes: true
    },
    spacing: {
      padding: 0
    },
    transform: [""]
  },
  svg: {
    dimensionAttributes: false,
    namespaceClassnames: false
    //xmlDeclaration: false,
  }
};

const svgCssSpriteConfig = {
  svgSpriteBasicConfig,
  mode: {
    css: {
      bust: false,
      dest: "",
      dimensions: ".",
      prefix: "",
      render: {
        scss: {
          dest: sassFolderName + "/_svg-css-sprite.scss"
        }
      },
      sprite: imagesDistFolder + "sprite.css.svg"
    }
  }
};

const svgInlineSpriteConfig = {
  svgSpriteBasicConfig,
  mode: {
    symbol: {
      dest: "",
      render: {
        scss: {
          dest: sassFolderName + "/_svg-symbol-sprite.scss"
        }
      },
      sprite: imagesDistFolder + "sprite.symbol.svg"
    },
    stack: {
      dest: "",
      /*
       */
      render: {
        scss: {
          dest: sassFolderName + "/_svg-stack-sprite.scss"
        }
      },
      sprite: imagesDistFolder + "sprite.stack.svg"
    }
  }
};

function svgInlineSprite() {
  return gulp.src(svgInlineSpriteIconsSrc, { cwd: "" })
    .pipe(svgSprite(svgInlineSpriteConfig))
    .on("error", onError)
    .pipe(gulp.dest(rootPath + ""));
}

function svgCssSprite() {
  return gulp.src(svgCssSpriteIconsSrc, { cwd: "" })
    .pipe(svgSprite(svgCssSpriteConfig))
    .on("error", onError)
    .pipe(gulp.dest(rootPath + ""));
}

// Error Reader
function onError(err) {
  gutil.log(err);
  this.emit("end");
}

function runWebpack() {
  webpack(webpackConfig, function(err, stats) {
    if (err) console.log("Webpack", err);
    console.log(stats.toString({
      colors: true,
      errorDetails: true,
      modules: true,
      reasons: true
    }));
  });

  // OR

  // what difference ?
  /*return new Promise(resolve => webpack(webpackConfig, (err, stats) => {
      if (err) console.log("Webpack", err);

      console.log(stats.toString({
          colors: true,
          errorDetails: true,
          modules: true,
          reasons: true
      }));
      resolve();
  }));*/
}

function devWatch() {
  gulp.watch([
    rootPath + sassFolderName + "/**/*.scss",
    rootPath + "src/components/**/*.scss",
    rootPath + "src/containers/**/*.scss"
  ]).on("change", function(path) {
    sassCompile(rootPath + sassFolderName + "/main.scss");
  });

  // gulp.watch(rootPath + "src/components/**/*.scss").on("change", function(path) {
  //     sassCompile(rootPath + sassFolderName + "/main.scss");
  // });

  gulp.watch(rootPath + "src/images/4sprite/**/*.+(png|jpg|jpeg|gif|svg)", gulp.series("sprite"));
  // gulp.watch(svgSpriteIconsSrc, gulp.series("svgSprite"));
  gulp.watch(svgCssSpriteIconsSrc, gulp.series(svgCssSprite));
  gulp.watch(svgInlineSpriteIconsSrc, gulp.series(svgInlineSprite));

  watch(imageFilesSrc, { events: ["add", "change"] }, function(vinyl) {
    imageOptimize(vinyl.path);

    if (vinyl.extname == ".png") {
      imagemin([vinyl.path], imagesDistFolder, {
        plugins: [webp({
          lossless: true // Losslessly encode images
        })]
      });
    } else if (vinyl.extname == ".jpg" || vinyl.extname == ".jpeg") {
      imagemin([vinyl.path], imagesDistFolder, {
        plugins: [webp({
          quality: 75 // Quality setting from 0 to 100
        })]
      });
    }
  });
}

function devScripts() {
  return new Promise(function(resolve, reject) {
    webpackConfig.mode = "development";
    webpackConfig.watch = true;
    webpackConfig.devtool = "source-map"; // any "source-map"-like devtool is possible
    webpackConfig.output.filename = "main.js";
    runWebpack();

    devWatch();

    startServer();

    resolve();
  });
}

function devOptimizedScripts() {}

function buildScripts() {
  return new Promise(function(resolve, reject) {
    webpackConfig.mode = "production";
    webpackConfig.devtool = "none";
    webpackConfig.output.filename = "main.min.js";
    webpackConfig.plugins = [
      new UglifyJSPlugin({
        uglifyOptions: {
          output: {
            comments: false,
            beautify: false
          }
        }
      })
    ];
    runWebpack();

    sassCompile(rootPath + sassFolderName + "/main.scss");
    // gulp.series("sass-compile-main", "concatCSS");
    cssMinify(rootPath + stylesFolderName + "/" + cssFileName);

    resolve();
  });
}

function validateHTML() {
  return new Promise(function(resolve, reject) {
    glob(buildPath + "*.html", function(er, files) {
      const promises = [];
      const filesLength = files.length;
      const dataObj = {
        content: []
      };
      const messagesByTypeTotal = {};

      console.log("\n" + colors.bold.black("Validation statistic:") + "\n");

      files.forEach((file, index) => {
        const promise = new Promise(function(resolve, reject) {
          const results = w3cjs.validate({
            // file: "demo.html", // file can either be a local file or a remote file
            file: file, // file can either be a local file or a remote file
            //file: "http://html5boilerplate.com/",
            //input: "<html>...</html>",
            //input: myBuffer,
            output: "json", // Defaults to "json", other option includes html
            //proxy: "http://proxy:8080", // Default to null
            callback: function(err, res) {
              const fileName = file.split("/").pop();
              // const fileResults;
              const messagesByType = {};

              for (let i = 0, len = res.messages.length; i < len; i++) {
                const message = res.messages[i];
                const messageType = message.type;
                if (!messagesByType[messageType]) {
                  messagesByType[messageType] = 0;
                }
                messagesByType[messageType] += 1;

                if (!messagesByTypeTotal[messageType]) {
                  messagesByTypeTotal[messageType] = 0;
                }
                messagesByTypeTotal[messageType] += 1;
              }

              const validationResultsText = getValidationText(messagesByType);
              const consoleText = colors.bold.black(fileName + " - ") + validationResultsText;
              console.log(consoleText);

              dataObj.content.push(res);
              resolve();
            }
          });
        });

        promises.push(promise);
      });

      Promise.all(promises).then(() => {
        console.log("\n" + colors.bold("All files - " + getValidationText(messagesByTypeTotal)));

        const jsonData = JSON.stringify(dataObj, null, 2);
        fs.writeFile("html-validation-results.json", jsonData, "utf8", function(err) {
          if (err) {
            throw err;
            resolve();
          }
          console.log("Results file created" + "\n");
          resolve();
        });
      });
    });
  });
}

function getValidationText(messagesObject) {
  let text = "";

  if (Object.keys(messagesObject).length > 0) {
    for (let key in messagesObject) {
      if (text) {
        text += ", ";
      }

      if (key == "error") {
        text += colors.bold.red("errors: " + messagesObject[key]);
      } else if (key == "info") {
        text += colors.bold.yellow("warnings: " + messagesObject[key]);
      }
    }
  } else {
    text = colors.bold.green("no errors");
  }

  return text;
}

export const dev = devScripts;
export const buildHtml = convertPugs2Html;
export const build = buildScripts;
export const validate = validateHTML;
export default dev;
