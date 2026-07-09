import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        account: resolve(__dirname, 'account.html'),
        admin: resolve(__dirname, 'admin.html'),
        blog: resolve(__dirname, 'blog.html'),
        cart: resolve(__dirname, 'cart.html'),
        contact: resolve(__dirname, 'contact.html'),
        orderSuccess: resolve(__dirname, 'order-success.html'),
        shop: resolve(__dirname, 'shop.html'),
        signin: resolve(__dirname, 'signin.html'),
        wishlist: resolve(__dirname, 'wishlist.html'),
      }
    }
  }
})