const { EleventyRenderPlugin } = require("@11ty/eleventy");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(EleventyRenderPlugin);
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
  eleventyConfig.addPassthroughCopy("./src/images");
  eleventyConfig.addPassthroughCopy("./src/tailwind.css");
  eleventyConfig.addPassthroughCopy("./src/markdown.css");

  eleventyConfig.addPairedShortcode("resume", (content) => {
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
    ];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const icon = icons.find((icon) => line.includes(icon.key));
      if (!icon) {
        continue;
      }

      // get text before and after the key
      const [before, after] = line.split(icon.key);
      lines[
        i
      ] = `${before}<img src="${icon.imagePath}" alt="${icon.key}" />${icon.key}${after}`;
    }

    return lines;
  });
};
