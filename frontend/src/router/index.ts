import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/board',
  },

  {
    path: '/board',
    name: 'board',
    component: () => import('../views/DashboardView.vue'),
  },

  {
    path: '/dashboard',
    redirect: '/board',
  },

  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      guestOnly: true,
    },
  },

  {
    path: '/register',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
    meta: {
      guestOnly: true,
    },
  },

  {
    path: '/search',
    name: 'search',
    component: () => import('../views/SearchResultsView.vue'),
  },

  {
    path: '/categories/:id',
    name: 'category-detail',
    component: () => import('../views/CategoryView.vue'),
  },

  {
    path: '/views/new',
    name: 'view-create',
    component: () => import('../views/CreateEditView.vue'),
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/views/:id/edit',
    name: 'view-edit',
    component: () => import('../views/CreateEditView.vue'),
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/views/:id',
    name: 'view-detail',
    component: () => import('../views/ViewDetailView.vue'),
  },

  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue'),
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: '/authors/:id',
    name: 'author-detail',
    component: () => import('../views/AuthorView.vue'),
  },

  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('../views/AdminUsersView.vue'),
    meta: {
      requiresAuth: true,
      requiresSuperadmin: true,
    },
  },

  {
    path: '/admin/categories',
    name: 'admin-categories',
    component: () => import('../views/AdminCategoriesView.vue'),
    meta: {
      requiresAuth: true,
      requiresSuperadmin: true,
    },
  },

  {
    path: '/admin/moderation',
    name: 'admin-moderation',
    component: () => import('../views/AdminModerationView.vue'),
    meta: {
      requiresAuth: true,
      requiresSuperadmin: true,
    },
  },

  {
    path: '/403',
    name: 'forbidden',
    component: () => import('../views/ForbiddenView.vue'),
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')

  const isAuthenticated = Boolean(token)

  const storedUser = localStorage.getItem('user')

  let role = ''

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser)

      role =
        (
          user.role ??
          user.rol ??
          ''
        ).toLowerCase()
    } catch {
      role = ''
    }
  }

  if (
    to.meta.requiresAuth &&
    !isAuthenticated
  ) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (
    to.meta.requiresSuperadmin &&
    role !== 'superadmin'
  ) {
    return {
      name: 'forbidden',
    }
  }

  if (
    to.meta.guestOnly &&
    isAuthenticated
  ) {
    return {
      name: 'board',
    }
  }
})

export default router