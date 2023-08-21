const { EleventyRenderPlugin } = require("@11ty/eleventy");
const Image = require("@11ty/eleventy-img");
const eleventyWebcPlugin = require("@11ty/eleventy-plugin-webc");
const { eleventyImagePlugin } = require("@11ty/eleventy-img");

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

  return {
    dir: {
      input: "src",
    },
  };
};
