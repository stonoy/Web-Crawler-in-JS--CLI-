import { normalize, getURLsFromHTMLstring, crawler } from "./crawl.js";

const main = async () => {
  if (process.argv.length !== 3) {
    console.log(`Number of arguments error: ${process.argv.length}`);
    process.exit(1);
  }

  console.log("starting crawling...");

  const baseUrl = process.argv[2];

  const pageLinksObj = await crawler(baseUrl, baseUrl, {});

  console.log(pageLinksObj);
};

main();
