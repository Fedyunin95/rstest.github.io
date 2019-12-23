import fs from "fs";
import path from "path";

const data = {};
// data.nav = JSON.parse(fs.readFileSync("./build/data/nav.json", "utf8"));
// data.productsPreviews = JSON.parse(fs.readFileSync("./build/data/productsPreviews.json", "utf8"));
// data.footerSocialLinks = JSON.parse(fs.readFileSync("./build/data/footerSocialLinks.json", "utf8"));
// data.footerNav = JSON.parse(fs.readFileSync("./build/data/footerNav.json", "utf8"));
// data.footerPayments = JSON.parse(fs.readFileSync("./build/data/footerPayments.json", "utf8"));
// const projectData = JSON.parse(fs.readFileSync("./build/data/projectData.json", "utf8"));
const pagesData = {};

const assetsDir = "./";
const pagesFolder = "./src/containers";
const pagesNamesList = [];
const pagesParametersUnfiltered = [];
const pagesNoParameters = [];
const pagesDirectories = getDirectories(pagesFolder);

// get pages names list and data
for (let i = 0, len = pagesDirectories.length; i < len; i++) {
  const pageDirectoryName = pagesDirectories[i];
  const pageName = pageDirectoryName.replace("Page", "").replace(/(?:[A-Z])/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : "-" + letter.toLowerCase();
  });
  pagesNamesList.push(pageName);
  const pageData = JSON.parse(fs.readFileSync(pagesFolder + "/" + pageDirectoryName + "/data.json", "utf8"));
  pagesData[pageName] = pageData;
  const pageParameters = pageData.pageParameters;

  if (pageParameters) {
    const pageNumber = pageParameters.listNumber;

    if (pageNumber) {
      const pageIndex = pageNumber - 1;
      pagesParametersUnfiltered[pageNumber] = pageParameters;
      pagesParametersUnfiltered[pageNumber].name = pageName;

      if (!pagesParametersUnfiltered[pageNumber].link) {
        pagesParametersUnfiltered[pageNumber].link = pageName + ".html";
      }
    } else {
      pagesNoParameters.push(pageName);
    }
  } else {
    pagesNoParameters.push(pageName);
  }

  // if (pageData.pageStates) {
  //     for (let i = 0, len = pageData.pageStates.length; i < len; i++) {
  //         const pageStateData = pageData.pageStates[i];
  //     }
  // }
}

// for (let i = 0, len = pagesNamesList.length; i < len; i++) {
//     const pageName = pagesNamesList[i];
//     const pageParameters = projectData.pages[pageName];

//     if (pageParameters) {
//         const pageNumber = projectData.pages[pageName].listNumber;

//         if (pageNumber) {
//             const pageIndex = pageNumber - 1;
//             pagesParametersUnfiltered[pageNumber] = projectData.pages[pageName];
//             pagesParametersUnfiltered[pageNumber].name = pageName;

//             if (!pagesParametersUnfiltered[pageNumber].link) {
//                 pagesParametersUnfiltered[pageNumber].link = pageName + ".html";
//             }
//         } else {
//             pagesNoParameters.push(pageName);
//         }
//     } else {
//         pagesNoParameters.push(pageName);
//     }
// }

for (let i = 0, len = pagesNoParameters.length; i < len; i++) {
  pagesParametersUnfiltered.push({
    "name": pagesNoParameters[i],
    "link": pagesNoParameters[i] + ".html"
  });
}

const pagesParameters = pagesParametersUnfiltered.filter(function(el) {
  return el != null;
});

// get pages list
// fs.readdir(pagesFolder, (err, files) => {
//   files.forEach(pageDirName => {
//     if (pageDirName.indexOf(".pug") > 0) {
//       const pageName = pageDirName.replace("page-", "");
//       pagesNamesList.push(pageName);
//     }
//   });
// });

// const isDirectory = source => fs.lstatSync(source).isDirectory();
// const getDirectories = source => {
//   return fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);
// };
// const getDirectories = source => fs.readdirSync(source).filter(name => {
//   return fs.lstatSync(path.join(source, name)).isDirectory();
// });

function getDirectories(path) {
  return fs.readdirSync(path).filter(function(file) {
    return fs.lstatSync(path + "/" + file).isDirectory();
  });
}

function lowerCaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

module.exports = { pagesNamesList, pagesParameters, pagesData, data };
