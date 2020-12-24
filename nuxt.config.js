export default {
  server: {
    host: '0.0.0.0',
  },
  components: true,
  head: {
    title: 'Classical for Everyone',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'Understand music with listening guides',
      }
    ],
    link: [
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css',
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/favicon.png'
      },
    ],
  },
  modules: [
    ['nuxt-buefy', { css: false, defaultProgrammaticPromise: true }],
    '@nuxtjs/proxy',
    '@nuxtjs/axios',
    '@nuxtjs/markdownit',
    ['nuxt-fontawesome', {
      imports: [
        {
          set: '@fortawesome/free-solid-svg-icons',
          icons: ['faSearch', 'faArrowLeft', 'faArrowRight', 'faTimesCircle', 'faUpload']
        },
        {
          set: '@fortawesome/free-brands-svg-icons',
          icons: ['faTwitterSquare', 'faFacebookSquare', 'faRedditSquare']
        },
      ]
    }],
  ],
  axios: {
    proxy: true,
  },
  proxy: {
    // Dev server proxy
    '/api': 'http://localhost:8080',
    '/static_files': {target: 'https://storage.googleapis.com/classical-for-everyone.appspot.com/static', pathRewrite: {'^/static_files/': ''}},
  },
  css: [{ src: 'assets/styles.scss', lang: 'scss' }],
  plugins: [ { src: '@/plugins/vue-shortkey.js', mode: 'client' }],
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
  },
  loading: {
    color: '#828bf9',
    height: '3px',
    throttle: 100,
  }
}