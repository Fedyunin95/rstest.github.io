import svg4everybody from "svg4everybody";
import Header from "../components/Header/main";

document.addEventListener("DOMContentLoaded", () => {
  svg4everybody();

  const headerBlock = document.querySelector(".js-header");

  new Header(headerBlock);
});
