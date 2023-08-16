module.exports = function (eleventyConfig) {
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
  eleventyConfig.addPassthroughCopy("./src/images");
  eleventyConfig.addPassthroughCopy("./src/tailwind.css");
  eleventyConfig.addPassthroughCopy("./src/markdown.css");
};
