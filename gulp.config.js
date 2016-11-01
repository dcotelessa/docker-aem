module.exports = function() {

  var srcBase = 'path/to/jcr_root';
  var cfg = {
    // Source directory references
    srcPaths: {
      lessAll: [
        srcBase + '/**/buy/**/*.less',
        '!' + srcBase + '/**/buy/**/_*.less'
      ],
      lessAllComplete: [
        srcBase + '/**/buy/**/*.less'
      ],
      markupCoreComplete: srcBase + '/apps/buy/**/*.html',
      jsCoreComplete: [
        srcBase + '/apps/buy/components/**/*.js',
        srcBase + '/etc/designs/buy/**/*.js',
        //ignore external libraries
        '!' + srcBase + '/etc/designs/buy/js/libs/**/*.js',
        '!' + srcBase + '/etc/designs/buy/metrics/*.js',
        //ignore any previously minified files
        '!' + srcBase + '/apps/buy/**/*.min.js',
        '!' + srcBase + '/etc/designs/buy/**/*.min.js'
      ],
      js: srcBase + '/**/*.js',
      tpl: srcBase + '/**/*.{jsp,html}',
      xmltxt: [
        srcBase + '/**/*.txt'
      ],
      html: srcBase + '/**/*.html',
      css: srcBase + '/**/*.css',
      images: srcBase + '/**/*.{gif,jpg,png,svg}'
    },
    // Destination directory references
    destPaths: {
      root: "/",
      sbase: srcBase
    }
  }
  return cfg;
};
