const express = require("express");
const compression = require("compression");
const app = express();
const https = require("https");
const fs = require("fs");
const path = require("path");
const colors = require("ansi-colors");
import { pagesNamesList, pagesParameters, pagesData, data } from "./data.js";

// Node.js body parsing middleware (does not handle multipart bodies)
// import bodyParser from "body-parser";

// app.use( bodyParser.json() ); // support json encoded bodies
// app.use( bodyParser.urlencoded({ extended: true }) ); // support encoded bodies

// Multer is a Node.js middleware for handling multipart/form-data
const multer = require("multer");
let upload = multer();

const assetsDir = "./";
const pagesFolder = "./src/containers";

export default function startServer() {
  // отключаем кеширования
  app.disable("view cache");

  // включаем ... pug/html
  // if (app.get("env") === "development") {
  //     app.locals.pretty = true;
  // }

  // указываем какой шаблонизатор использовать
  app.set("view engine", "pug");

  // расположение шаблонов ("templates")
  app.set("views", "./src/containers");

  // app.locals.basedir = "./src/components/";
  app.locals.env = process.env;
  app.locals.basedir = "./src/";
  app.locals.assetsDir = assetsDir;

  // init app compression
  app.use(compression({ filter: shouldCompress }));

  function shouldCompress(req, res) {
    if (req.headers["x-no-compression"]) {
      // don"t compress responses with this request header
      return false;
    }

    // fallback to standard filter function
    return compression.filter(req, res);
  }

  // app.use(function(request, response, next) {
  //     if (request.url.indexOf(".html") !== -1) {
  //         const redirectUrl = request.url.replace(".html", "");
  //         response.redirect(redirectUrl);
  //     } else {
  //         next();
  //     }
  // });

  // путь до наших стилей, картинок, скриптов и т.д.
  app.use(express.static("build/assets"));
  app.use(express.static("build/ajax"));
  app.use(express.static("/"));

  // prevent error if no favicon
  app.get("/favicon.ico", (request, response) => response.status(204));

  app.get("/sw.js", function(request, response) {
    response.sendFile(path.join(__dirname, "../build", "swNode.js"));
  });

  app.get("/data/category-update.json*", function(request, response) {
    const jsonData = {
      items: "",
      moreButton: ""
    };

    response.render("../components/ProductsPreviewsList/render-items", {
      environment: process.env.NODE_ENV || "development",
      productsPreviewsItems: data.productsPreviews.items
    }, function(err, html) {
      if (!err) {
        jsonData.items = html;
      }
    });

    response.render("../components/ProductsPreviewsList/render-more-button", {
      environment: process.env.NODE_ENV || "development",
      moreButtonHref: "/data/category-update.json?page=3"
    }, function(err, html) {
      if (!err) {
        jsonData.moreButton = html;
      }
    });

    response.json(jsonData);
  });

  app.post("/data*", function(request, response, next) {
    request.method = "GET";
    next();
  });

  app.use("/data", express.static("build/data"));

  app.get(["", "/", "/index"], function(request, response) {
    response.render("index", {
      environment: process.env.NODE_ENV || "development",
      lang: "ru",
      nav: data.nav,
      pagesList: pagesParameters,
      footerSocialLinks: {
        items: [{
            id: "facebook",
            title: "Facebook",
            href: "#"
          },
          {
            id: "vkontakte",
            title: "Vkontakte",
            href: "#"
          },
          {
            id: "instagram",
            title: "Instagram",
            href: "#"
          },
          {
            id: "twitter",
            title: "Twitter",
            href: "#"
          },
          {
            id: "odnoklassniki",
            title: "Odnoklassniki",
            href: "#"
          }
        ]
      },
      footerNav: {
        sections: [{
            title: "Покупателям",
            items: [{
                "href": "#",
                "text": "Доставка"
              },
              {
                "href": "#",
                "text": "Оплата"
              },
              {
                "href": "#",
                "text": "Возврат"
              },
              {
                "href": "#",
                "text": "Идеи подарков"
              },
              {
                "href": "#",
                "text": "Подарочные карты"
              },
              {
                "href": "#",
                "text": "Упаковка"
              }
            ]
          },
          {
            title: "Личный кабинет",
            items: [{
                "href": "#",
                "text": "Профиль"
              },
              {
                "href": "#",
                "text": "Избранное"
              },
              {
                "href": "#",
                "text": "Заказы"
              }
            ]
          },
          {
            title: "О компании",
            items: [{
                "href": "#",
                "text": "О нас"
              },
              {
                "href": "#",
                "text": "Контакты"
              },
              {
                "href": "#",
                "text": "Поставщикам"
              }
            ]
          }
        ]
      },
      footerPayments: {
        items: [{
            "id": "logo-visa",
            "title": "Visa"
          },
          {
            "id": "logo-mastercard",
            "title": "Mastercard"
          },
          {
            "id": "logo-maestro",
            "title": "Maestro"
          },
          {
            "id": "logo-mir",
            "title": "Mir"
          },
          {
            "id": "logo-union-pay",
            "title": "Union pay"
          }
        ]
      }
    }, function(err, html) {
      if (err) {
        // render error handler
        if (isPageExist("404", pagesNamesList)) {
          response.status(404).render("Page404/index", {
            environment: process.env.NODE_ENV || "development",
            lang: "ru",
            renderError: err
          });
        } else {
          response.send(err.message);
        }
      } else {
        response.flush();
        response.send(html);
      }
    });
  });

  app.get("/*", function(request, response) {
    // регулярка для получения пути до шаблона
    // const fileName = request.url.replace(/static\/|\..*$/g, "") || "index";

    const isJson = request.url.indexOf(".json") > 0;

    if (!isJson) {
      const templateName = request.url.replace(/\.html|\//gi, "") || "index";
      const templateDirName = "Page" + camelize(templateName);

      if (isPageExist(templateName, pagesNamesList)) {
        const templatePath = templateDirName + "/index";
        const basicRenderData = {
          environment: process.env.NODE_ENV || "development",
          lang: "ru"
        };
        const renderData = pagesData[templateName];
        renderData.environment = basicRenderData.environment;
        renderData.lang = basicRenderData.lang;

        response.render(templatePath, renderData, function(err, html) {
          if (err) {
            console.log("\n---  " + colors.bold.red("PUG ERRORS") + " in template \"" + colors.bold(templateName) + "\"" + "\n\n" + err + "\n\n---\n");

            // render error handler
            if (isPageExist("404", pagesNamesList)) {
              renderData.renderError = err;
              response.status(404).render("Page404/index", renderData);
            } else {
              response.send(err.message);
            }
          } else {
            response.flush();
            response.send(html);
          }
        });
      // } else {
      //   .send("Page not exist");
      }
    }
  });

  // redirect to main page
  app.get("/", function(request, response) {
    response.redirect("/index");
  });

  app.get("", function(request, response) {
    response.redirect("/index");
  });

  // 404 error handler
  app.use(function(request, response, next) {
    response.status(404).render("404", {
      environment: process.env.NODE_ENV || "development",
      lang: "ru"
    });
  });

  const listener = app.listen();
  // const port = 3000;
  // const port = process.env.PORT || 8080;
  const port = listener.address().port;
  const browserSync = require("browser-sync").create();

  // const httpsOptions = {
  //     key: fs.readFileSync("./key.pem"),
  //     cert: fs.readFileSync("./cert.pem")
  // };

  // const server = https.createServer(httpsOptions, app).listen(port, () => {
  //     console.log("server running at " + port);
  // });

  // proxy на локальный сервер на Express
  browserSync.init({
    proxy: "http://localhost:" + port,
    // startPath: "/static/",
    // httpModule: "http2",
    // https: httpsOptions,
    // https: true,
    notify: false,
    tunnel: false,
    host: "localhost",
    port: port,
    logPrefix: "Proxy to localhost:" + port
  });

  // обновляем страницу, если обновились assets файлы
  // browserSync.watch("./public/assets/**/*").on("change", browserSync.reload);

  // обновляем страницу, если был изменен исходник шаблона
  browserSync.watch("./src/components/**/*").on("change", browserSync.reload);
}

function isPageExist(pageName, pagesListArray) {
  for (let i = 0, len = pagesListArray.length; i < len; i++) {
    if (pagesListArray[i] == pageName) {
      return true;
    }
  }

  return false;
}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter) {
    return letter.toUpperCase();
  }).replace(/\s+/g, "").replace(/-/g, "");
}
