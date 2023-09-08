const { EleventyRenderPlugin } = require("@11ty/eleventy");
const eleventyWebcPlugin = require("@11ty/eleventy-plugin-webc");
const { eleventyImagePlugin } = require("@11ty/eleventy-img");
const fs = require("fs");
const Image = require("@11ty/eleventy-img");
const puppeteer = require("puppeteer");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(EleventyRenderPlugin);

  eleventyConfig.addPlugin(eleventyWebcPlugin, {
    components: ["npm:@11ty/eleventy-img/*.webc"],
  });

  eleventyConfig.addPlugin(eleventyImagePlugin, {
    formats: ["webp"],
    urlPath: "./img/",
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
    },
  });

  eleventyConfig.addPassthroughCopy("./src/tailwind.css");
  eleventyConfig.addPassthroughCopy("./src/site.webmanifest");
  eleventyConfig.addPassthroughCopy({
    "./src/images/favicon.ico": "./favicon.ico",
  });
  eleventyConfig.addPassthroughCopy({
    "./src/images/android-chrome-192x192.png":
      "./img/android-chrome-192x192.png",
  });
  eleventyConfig.addPassthroughCopy({
    "./src/images/android-chrome-512x512.png":
      "./img/android-chrome-512x512.png",
  });
  eleventyConfig.addPassthroughCopy({
    "./src/images/apple-touch-icon.png": "./img/apple-touch-icon.png",
  });
  eleventyConfig.addPassthroughCopy({
    "./src/images/favicon-16x16.png": "./img/favicon-16x16.png",
  });
  eleventyConfig.addPassthroughCopy({
    "./src/images/favicon-32x32.png": "./img/favicon-32x32.png",
  });

  eleventyConfig.addPairedShortcode("insertResumeImages", insertResumeImages);

  eleventyConfig.on("eleventy.after", async ({ dir }) => {
    const { output } = dir;
    await writePdf(`${output}/resume/index.html`, `${output}/resume.pdf`);
  });

  return {
    dir: {
      input: "src",
    },
  };
};

async function insertResumeImages(content) {
  const icons = [
    {
      level: "###",
      header: "Altis Labs, Inc.",
      src: "./src/images/altis.webp",
      alt: "Altis Labs, Inc.",
      title: "Altis Labs, Inc.",
    },
    {
      level: "###",
      header: "Focal Healthcare Inc.",
      src: "./src/images/focal.webp",
      alt: "Focal Healthcare Inc.",
      title: "Focal Healthcare Inc.",
    },
    {
      level: "###",
      header: "Robarts Research Institute",
      src: "./src/images/robarts.webp",
      alt: "Robarts Research Institute",
      title: "Robarts Research Institute",
    },
    {
      level: "###",
      header: "The University of Western Ontario",
      src: "./src/images/western.webp",
      alt: "The University of Western Ontario",
      title: "The University of Western Ontario",
    },
  ];

  async function getIconImgTag(src, alt, title) {
    const metadata = await Image(src, {
      widths: [16],
      formats: ["webp"],
      outputDir: "./_site/img/",
    });

    const data = metadata.webp[metadata.webp.length - 1];
    return `<img src="${data.url}" width="${data.width}" height="${data.height}" alt="${alt}"  title="${title}" style="display: inline; margin: 0 0.4rem 0 0;" loading="lazy" decoding="async">`;
  }

  const lines = content.split("\n");
  const withImages = await Promise.all(
    lines.map(async (line) => {
      const icon = icons.find(
        ({ level, header }) => line === `${level} ${header}`,
      );
      if (icon) {
        const iconImgTag = await getIconImgTag(icon.src, icon.alt, icon.title);
        return `${icon.level} ${iconImgTag} ${icon.header}`;
      }

      return line;
    }),
  );

  return withImages.join("\n");
}

async function writePdf(inputFilepath, outputFilepath) {
  // Create a browser instance
  const browser = await puppeteer.launch({ headless: "new" });

  // Create a new page
  const page = await browser.newPage();

  //Get HTML content from HTML file
  let html = fs.readFileSync(inputFilepath, "utf-8");

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
