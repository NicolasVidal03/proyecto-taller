import type { Page } from '@playwright/test';
import * as f from './fixtures';

type RouteOptions = {
  status?: number;
  json?: unknown;
};

/** Registra una intercepción simple de GET */
async function mockGet(page: Page, pattern: string, json: unknown, status = 200) {
  await page.route(pattern, route => {
    if (route.request().method() === 'GET') {
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(json) });
    } else {
      route.continue();
    }
  });
}

/** Registra una intercepción simple de POST */
async function mockPost(page: Page, pattern: string, json: unknown, status = 200) {
  await page.route(pattern, route => {
    if (route.request().method() === 'POST') {
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(json) });
    } else {
      route.continue();
    }
  });
}

/** Registra una intercepción simple de PUT/PATCH */
async function mockPut(page: Page, pattern: string, json: unknown, status = 200) {
  await page.route(pattern, route => {
    const method = route.request().method();
    if (method === 'PUT' || method === 'PATCH') {
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(json) });
    } else {
      route.continue();
    }
  });
}

/** Registra una intercepción simple de DELETE */
async function mockDelete(page: Page, pattern: string, json: unknown = {}, status = 200) {
  await page.route(pattern, route => {
    if (route.request().method() === 'DELETE') {
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(json) });
    } else {
      route.continue();
    }
  });
}

/**
 * setupAuthMocks — simula un usuario autenticado.
 * Llámalo al inicio de los tests que requieren sesión activa.
 */
export async function setupAuthMocks(page: Page, user = f.adminUser) {
  await mockGet(page, '**/api/auth/me', user);
  await mockPost(page, '**/api/auth/login', { user });
  await mockPost(page, '**/api/auth/logout', {});
}

/** setupUsersMocks — endpoints de usuarios y sucursales */
export async function setupUsersMocks(page: Page) {
  await mockGet(page, '**/api/users', f.allUsers);
  await mockGet(page, '**/api/users/*', f.adminUser);
  await mockPost(page, '**/api/users', f.adminUser);
  await mockPut(page, '**/api/users/*', f.adminUser);
  await mockGet(page, '**/api/branches', f.branches);
  await mockPost(page, '**/api/branches', f.branches[0]);
  await mockPut(page, '**/api/branches/*', f.branches[0]);
}

/** setupAreasMocks — endpoints de áreas geográficas */
export async function setupAreasMocks(page: Page) {
  await mockGet(page, '**/api/areas*', { data: f.areas, total: f.areas.length, page: 1, size: 10 });
  await mockPost(page, '**/api/areas', f.areas[0]);
  await mockPut(page, '**/api/areas/*', f.areas[0]);
  await mockDelete(page, '**/api/areas/*');
}

/** setupRoutesMocks — endpoints de rutas */
export async function setupRoutesMocks(page: Page) {
  await mockGet(page, '**/api/routes', f.routes);
  await mockPost(page, '**/api/routes', f.routes[0]);
  await mockPut(page, '**/api/routes/*', f.routes[0]);
}

/** setupClientsMocks — endpoints de clientes y negocios */
export async function setupClientsMocks(page: Page) {
  await mockGet(page, '**/api/clients', f.clients);
  await mockGet(page, '**/api/clients/*', f.clients[0]);
  await mockPost(page, '**/api/clients', f.clients[0]);
  await mockPut(page, '**/api/clients/*', f.clients[0]);
  await mockDelete(page, '**/api/clients/*');
  await mockGet(page, '**/api/businesses*', f.businesses);
  await mockPost(page, '**/api/businesses', f.businesses.data[0]);
  await mockPut(page, '**/api/businesses/*', f.businesses.data[0]);
  await mockDelete(page, '**/api/businesses/*');
  await mockGet(page, '**/api/areas*', { data: f.areas, total: 2, page: 1, size: 100 });
  await mockGet(page, '**/api/business-types', [{ id: 1, name: 'Bodega' }]);
  await mockGet(page, '**/api/price-types', [{ id: 1, name: 'Regular' }]);
}

/** setupProductsMocks — endpoints del catálogo de productos */
export async function setupProductsMocks(page: Page) {
  await mockGet(page, '**/api/products*', f.products);
  await mockGet(page, '**/api/products/*', f.products.data[0]);
  await mockPost(page, '**/api/products', f.products.data[0]);
  await mockPut(page, '**/api/products/*', f.products.data[0]);
  await mockDelete(page, '**/api/products/*');
  await mockGet(page, '**/api/categories*', f.categories);
  await mockPost(page, '**/api/categories', f.categories[0]);
  await mockPut(page, '**/api/categories/*', f.categories[0]);
  await mockGet(page, '**/api/brands*', f.brands);
  await mockPost(page, '**/api/brands', f.brands[0]);
  await mockGet(page, '**/api/colors*', f.colors);
  await mockPost(page, '**/api/colors', f.colors[0]);
  await mockGet(page, '**/api/presentations*', f.presentations);
  await mockPost(page, '**/api/presentations', f.presentations[0]);
}

/** setupPresalesMocks — endpoints de preventas */
export async function setupPresalesMocks(page: Page) {
  await mockGet(page, '**/api/presales*', f.presales);
  await mockGet(page, '**/api/presales/*', f.presales.data[0]);
  await mockPost(page, '**/api/presales', f.presales.data[0]);
  await mockPut(page, '**/api/presales/*', f.presales.data[0]);
  await mockGet(page, '**/api/users', f.allUsers);
  await mockGet(page, '**/api/branches', f.branches);
}

/** setupStockMocks — endpoints de inventario */
export async function setupStockMocks(page: Page) {
  await mockGet(page, '**/api/product-branches*', f.inventory);
  await mockPut(page, '**/api/product-branches*', { message: 'ok', hasStock: true, stockQty: 50 });
  await mockGet(page, '**/api/branches', f.branches);
  await mockGet(page, '**/api/categories*', f.categories);
  await mockGet(page, '**/api/brands*', f.brands);
}

/** setupActivitiesMocks — endpoints de actividades */
export async function setupActivitiesMocks(page: Page) {
  await mockGet(page, '**/api/activities*', f.activities);
  await mockGet(page, '**/api/users', f.allUsers);
}