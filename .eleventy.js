const { EleventyRenderPlugin } = require("@11ty/eleventy");
const eleventyWebcPlugin = require("@11ty/eleventy-plugin-webc");
const { eleventyImagePlugin } = require("@11ty/eleventy-img");
const fs = require("fs");
const puppeteer = require("puppeteer");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(EleventyRenderPlugin);

  eleventyConfig.addPlugin(eleventyWebcPlugin, {
    components: ["npm:@11ty/eleventy-img/*.webc"],
  });

  eleventyConfig.addPlugin(eleventyImagePlugin, {
    formats: ["webp"],
    urlPath: "/img/",
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
    },
  });

  // required for legacy page
  eleventyConfig.addPassthroughCopy("./src/images");
  eleventyConfig.addPassthroughCopy("./src/tailwind.css");
  eleventyConfig.addPassthroughCopy("./src/site.webmanifest");
  eleventyConfig.addPassthroughCopy({ "./src/images/favicon.ico": "/" });

  eleventyConfig.addPairedShortcode("resume", formatResume);

  eleventyConfig.on(
    "eleventy.after",
    async ({ dir, results, runMode, outputMode }) => {
      const { input, includes, output } = dir;
      await writePdf(`${output}/resume/index.html`, `${output}/resume.pdf`);
    },
  );

  return {
    dir: {
      input: "src",
    },
  };
};

function formatResume(content) {
  const lines = content.split("\n");
  return lines.slice(lines.indexOf("---")).join("\n");
}

async function writePdf(inputFilepath, outputFilepath) {
  // Create a browser instance
  const browser = await puppeteer.launch();

  // Create a new page
  const page = await browser.newPage();

  //Get HTML content from HTML file
  const html = fs.readFileSync(inputFilepath, "utf-8");
  await page.setContent(html, { waitUntil: "domcontentloaded" });

  // To reflect CSS used for screens instead of print
  await page.emulateMediaType("screen");

  // Downlaod the PDF
  const pdf = await page.pdf({
    path: outputFilepath,
    margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
    printBackground: true,
    format: "A4",
  });

  // Close the browser instance
  await browser.close();
}
