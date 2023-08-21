const { EleventyRenderPlugin } = require("@11ty/eleventy");
const Image = require("@11ty/eleventy-img");
const eleventyWebcPlugin = require("@11ty/eleventy-plugin-webc");
const { eleventyImagePlugin } = require("@11ty/eleventy-img");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(EleventyRenderPlugin);

  // WebC
  eleventyConfig.addPlugin(eleventyWebcPlugin, {
    components: [
      // …
      // Add as a global WebC component
      "npm:@11ty/eleventy-img/*.webc",
    ],
  });

  // Image plugin
  eleventyConfig.addPlugin(eleventyImagePlugin, {
    // Set global default options
    formats: ["webp", "jpeg"],
    urlPath: "/img/",
    sizes: [16],

    // Notably `outputDir` is resolved automatically
    // to the project output directory

    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
    },
  });

  // eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
  // eleventyConfig.addPassthroughCopy("./src/images");
  eleventyConfig.addPassthroughCopy("./src/tailwind.css");
  eleventyConfig.addPassthroughCopy("./src/markdown.css");

  eleventyConfig.addPairedShortcode("resume", formatResume);

  // eleventyConfig.addShortcode("image", async function (src, alt, sizes) {
  //   let metadata = await Image(src, {
  //     widths: ["auto"],
  //     formats: ["webp"],
  //     outputDir: "./_site/img/",
  //   });
  //
  //   let imageAttributes = {
  //     alt,
  //     sizes,
  //     loading: "lazy",
  //     decoding: "async",
  //   };
  //
  //   // You bet we throw an error on a missing alt (alt="" works okay)
  //   return Image.generateHTML(metadata, imageAttributes);
  // });
  return {
    dir: {
      input: "src",
    },
    // htmlTemplateEngine: "webc",
  };
};

function formatResume(originalContent) {
  const icons = [
    {
      key: "Altis Labs, Inc.",
      imagePath: "../../images/altis.webp",
    },
    {
      key: "Focal Healthcare Inc.",
      imagePath: "../../images/focal.webp",
    },
    {
      key: "Robarts Research Institute",
      imagePath: "../../images/robarts.webp",
    },
    {
      key: "The University of Western Ontario",
      imagePath: "../../images/western.webp",
    },
    {
      key: "Stack",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
  <path d="M8.235 1.559a.5.5 0 0 0-.47 0l-7.5 4a.5.5 0 0 0 0 .882L3.188 8 .264 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l2.922-1.559a.5.5 0 0 0 0-.882l-7.5-4zM8 9.433 1.562 6 8 2.567 14.438 6 8 9.433z"/>
</svg>`,
    },
  ];
  const lines = originalContent.split("\n");

  let foundDividor = false;

  const content = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!foundDividor) {
      if (line === "<hr>") {
        foundDividor = true;
      }
      continue;
    }

    const icon = icons.find((icon) => line.includes(icon.key));
    if (!icon) {
      content.push(line);
      continue;
    }

    // get text before and after the key
    const [before, after] = line.split(icon.key).map((s) => s.trim());
    if (!before.startsWith("<h")) {
      continue;
    }

    const { imagePath, svg } = icon;
    if (!imagePath && !svg) {
      content.push(line);
      continue;
    }

    const image = imagePath
      ? `<img src="${icon.imagePath}" alt="${icon.key}" />`
      : svg;

    content.push(`${before}${image}${icon.key}${after}`);
  }

  return content;
}
