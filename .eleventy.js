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

  // required for legacy page
  eleventyConfig.addPassthroughCopy("./src/images");
  eleventyConfig.addPassthroughCopy("./src/tailwind.css");
  eleventyConfig.addPassthroughCopy("./src/site.webmanifest");
  eleventyConfig.addPassthroughCopy({
    "./src/images/favicon.ico": "./favicon.ico",
  });

  eleventyConfig.addPairedShortcode("cropResume", cropResume);
  eleventyConfig.addPairedShortcode("insertResumeImages", insertResumeImages);

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

function cropResume(content) {
  const lines = content.split("\n");
  return lines.slice(lines.indexOf("---")).join("\n");
}

async function insertResumeImages(content) {
  const icons = [
    {
      level: "###",
      header: "Altis Labs, Inc.",
      src: "./src/images/altis.webp",
      alt: "Altis Labs, Inc.",
      title: "Altis Labs, Inc.",
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
  const a = await Promise.all(
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

  // console.log("a", a);
  return a.join("\n");
}

async function writePdf(inputFilepath, outputFilepath) {
  // Create a browser instance
  const browser = await puppeteer.launch({ headless: "new" });

  // Create a new page
  const page = await browser.newPage();

  //Get HTML content from HTML file
  let html = fs.readFileSync(inputFilepath, "utf-8");
  html = html.replace('src="/img/', 'src="../img/');

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
