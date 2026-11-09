import { createRouter, createWebHistory } from 'vue-router'
import DesignPage from './components/DesignPage.vue'
import CatalogPage from './components/CatalogPage.vue'
const livePages = new Set(['home', 'shops', 'casts', 'plans', 'areas', 'area', 'favorites', 'rankings'])
const simple: Record<string, string> = { '/': 'home', '/shops': 'shops', '/casts': 'casts', '/plans': 'plans', '/areas': 'areas', '/favorites': 'favorites', '/events': 'events', '/offers': 'offers', '/features': 'features', '/rankings': 'rankings', '/guide': 'guide', '/help': 'help', '/contact': 'contact', '/report': 'report', '/about': 'about', '/for-business': 'business', '/legal/terms': 'terms', '/legal/privacy': 'privacy' }
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...Object.entries(simple).map(([path, page]) => ({ path, component: livePages.has(page) ? CatalogPage : DesignPage, meta: { page } })),
    { path: '/shops/:shopId/plans/:planId', component: CatalogPage, meta: { page: 'plan' } },
    { path: '/shops/:shopId', component: CatalogPage, meta: { page: 'shop' } },
    { path: '/casts/:castId', component: CatalogPage, meta: { page: 'cast' } },
    { path: '/areas/:areaSlug', component: CatalogPage, meta: { page: 'area' } },
    ...['event', 'offer', 'feature'].map(page => ({ path: `/${page}s/:slug`, component: DesignPage, meta: { page } })),
    { path: '/:pathMatch(.*)*', component: DesignPage, meta: { page: 'notFound' } },
  ],
  scrollBehavior(to, from, saved) { if (saved) return saved; if (to.hash) return { el: to.hash, top: 24, behavior: 'smooth' }; if (to.path === from.path) return false; return { top: 0 } },
})
