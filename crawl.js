import { JSDOM } from "jsdom";

const crawler = async (baseUrl, currentUrl, pages) => {
  try {
    const baseUrlObj = new URL(baseUrl);
    const currentUrlObj = new URL(currentUrl);

    if (baseUrlObj.hostname !== currentUrlObj.hostname) {
      return pages;
    }
    const resp = await fetch(currentUrl);
    if (resp.status > 399) {
      console.log(`status code ${resp.status} for this page ${currentUrl}`);
      return pages;
    }
    const contentType = resp.headers.get("content-type");
    if (!contentType.includes("text/html")) {
      console.log(`content type ${contentType} for this page ${currentUrl}`);
      return pages;
    }
    console.log(`Now Crawling : ${currentUrl}`);
    const normalizedUrl = normalize(currentUrl);
    if (normalizedUrl in pages) {
      pages[normalizedUrl]++;
      return pages;
    }
    pages[normalizedUrl] = 1;

    const htmlBody = await resp.text();

    const urls = getURLsFromHTMLstring(htmlBody, baseUrl);

    for (let url of urls) {
      const newPages = await crawler(baseUrl, url, pages);
      pages = { ...pages, ...newPages };
    }
  } catch (error) {
    console.log(`Error: ${error.message} while crawling page ${currentUrl}`);
  }
  return pages;
};

const getURLsFromHTMLstring = (htmlBody, baseURl) => {
  let urls = [];
  const htmlDom = new JSDOM(htmlBody);
  const linkElements = htmlDom.window.document.querySelectorAll("a");
  for (let link of linkElements) {
    if (link.href.slice(0, 1) === "/") {
      // relative url
      try {
        urls.push(new URL(link.href, baseURl).href);
      } catch (error) {
        console.log(`${link.href} : ${error.message}`);
      }
    } else {
      // absolute url
      try {
        urls.push(new URL(link.href).href);
      } catch (error) {
        console.log(`${link.href} : ${error.message}`);
      }
    }
  }
  return urls;
};

const normalize = (urlString) => {
  const url = new URL(urlString);
  const { hostname, pathname } = url;
  let path = `${hostname}${pathname}`;
  if (path.length > 1 && path.slice(-1) === "/") {
    return path.slice(0, -1);
  }
  return path;
};

export { normalize, getURLsFromHTMLstring, crawler };
