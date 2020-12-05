export default {
  components: true,
  head: {
    titleTemplate: '%s',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
  },
  modules: [
    'nuxt-buefy',
    '@nuxtjs/markdownit',
    ['nuxt-fontawesome', {
      imports: [
        {
          set: '@fortawesome/free-solid-svg-icons',
          icons: ['fas']
        },
        {
          set: '@fortawesome/free-brands-svg-icons',
          icons: ['fab']
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