export default {
  components: true,
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
  },
  proxy: {
    // Dev server proxy
    '/api': 'http://localhost:8080',
  },
  css: [{ src: 'assets/styles.scss', lang: 'scss' }],
  modules: [
    'nuxt-buefy',
    '@nuxtjs/proxy',
    '@nuxtjs/axios',
    '@nuxtjs/markdownit',
    ['nuxt-fontawesome', {
      imports: [
        {
          set: '@fortawesome/free-brands-svg-icons',
          icons: ['faTwitterSquare', 'faFacebookSquare', 'faRedditSquare']
        },
      ]
    }],
  ],
  markdownit: {
    injected: true,
    html: true,
    use: [
      ['markdown-it-table-of-contents',
        {
          containerClass: "box markdown-toc",
          containerHeaderHtml: "<strong>Contents</strong>",
          listType: "ol",
          slugify: (s) =>
            encodeURIComponent(
              String(s)
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[./]+/g, "")
            ),
        }],
      ['markdown-it-anchor',
        {
          slugify: (s) =>
            encodeURIComponent(
              String(s)
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[./]+/g, "")
            ),
        }
      ]
    ]
  }
}