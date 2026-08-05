import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './modules/auth/auth.routes';
import categoriesRoutes from './modules/categories/categories.routes';
import hashtagsRoutes from './modules/hashtags/hashtags.routes';
import viewsRoutes from './modules/views/views.routes';
//import uploadsRoutes from './modules/uploads/uploads.routes';
import usersRoutes from './modules/users/users.routes';
import searchRoutes from './modules/search/search.routes';
import authorsRoutes from './modules/authors/authors.routes';
import adminUsersRoutes from './modules/adminUsers/adminUsers.routes';
import adminCategoriesRoutes from './modules/adminCategories/adminCategories.routes';
import adminViewsRoutes from './modules/adminViews/adminViews.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/hashtags', hashtagsRoutes);
  app.use('/api/views', viewsRoutes);
  //app.use('/api/uploads', uploadsRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/authors', authorsRoutes);
  app.use('/api/admin/users', adminUsersRoutes);
  app.use('/api/admin/categories', adminCategoriesRoutes);
  app.use('/api/admin/views', adminViewsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
