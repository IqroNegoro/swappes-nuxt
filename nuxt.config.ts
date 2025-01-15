import { resolve } from 'path'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@vee-validate/nuxt",
    "@pinia/nuxt",
    "shadcn-nuxt",
    "nuxt-vue3-google-signin"
  ],
  runtimeConfig: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DEV: process.env.MONGODB_DEV,
    JWT_SECRET: process.env.JWT_SECRET,
    REFRESH_SECRET: process.env.REFRESH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },
  imports: {
    dirs: ["types"]
  },
  nitro: {
    imports: {
      dirs: ["types"]
    }
  },
  app: {
    head: {
      link: [
        {
          href: "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css",
          rel: "stylesheet"
        }
      ],
      script: [
        {
          src: "https://apis.google.com/js/platform.js",
          async: true,
          defer: true
        }
      ]
    }
  },
  googleSignIn: {
    clientId: process.env.GOOGLE_CLIENT_ID
  },
  alias: {
    models: resolve(__dirname, "./server/models")
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },
  pinia: {
    storesDirs: [
      "./stores/**"
    ]
  },
})