import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import ProfileDetailPage from '@/pages/ProfileDetailPage.vue';
import RandomProfilesPage from '@/pages/RandomProfilesPage.vue';
import SavedProfilesPage from '@/pages/SavedProfilesPage.vue';

/**
 * `meta.source` is what tells the shared detail page which profile it is
 * looking at. Reading it from route metadata rather than parsing the path
 * keeps the source explicit and typo-proof.
 */
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/random', name: 'random-list', component: RandomProfilesPage },
    {
      path: '/random/:externalId',
      name: 'random-detail',
      component: ProfileDetailPage,
      meta: { source: 'random' as const },
    },
    { path: '/saved', name: 'saved-list', component: SavedProfilesPage },
    {
      path: '/saved/:id',
      name: 'saved-detail',
      component: ProfileDetailPage,
      meta: { source: 'saved' as const },
    },
    { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
