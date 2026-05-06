import type { Page, Route } from '@playwright/test';
import * as f from './fixtures';

type RouteOptions = {
  status?: number;
  json?: unknown;
};

async function mockGet(page: Page, pattern: string, json: unknown, status = 200) {
  await page.route(pattern, route => {
    if (route.request().method() === 'GET') {
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(json) });
    } else {
      route.continue();
    }
  });
}

async function mockPost(page: Page, pattern: string, json: unknown, status = 200) {
  await page.route(pattern, route => {
    if (route.request().method() === 'POST') {
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(json) });
    } else {
      route.continue();
    }
  });
}

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

async function mockDelete(page: Page, pattern: string, json: unknown = {}, status = 200) {
  await page.route(pattern, route => {
    if (route.request().method() === 'DELETE') {
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(json) });
    } else {
      route.continue();
    }
  });
}


export async function setupAuthMocks(page: Page, user = f.adminUser) {
  await mockGet(page, '**/auth/me', user);
  await mockPost(page, '**/auth/login', { user });
  await mockPost(page, '**/auth/logout', {});
}

export async function setupUsersMocks(page: Page) {
  await mockGet(page, '**/users', f.allUsers);
  await mockGet(page, '**/users/*', f.adminUser);
  await mockPost(page, '**/users', f.adminUser);
  await mockPut(page, '**/users/*', f.adminUser);
  await mockGet(page, '**/branches', f.branches);
  await mockPost(page, '**/branches', f.branches[0]);
  await mockPut(page, '**/branches/*', f.branches[0]);
}

export async function setupAreasMocks(page: Page) {
  await mockGet(page, '**/areas*', { data: f.areas, total: f.areas.length, page: 1, size: 10 });
  await mockPost(page, '**/areas', f.areas[0]);
  await mockPut(page, '**/areas/*', f.areas[0]);
  await mockDelete(page, '**/areas/*');
}

export async function setupRoutesMocks(page: Page) {
  await mockGet(page, '**/routes', f.routes);
  await mockPost(page, '**/routes', f.routes[0]);
  await mockPut(page, '**/routes/*', f.routes[0]);
}

export async function setupClientsMocks(page: Page) {
  await mockGet(page, '**/clients', f.clients);
  await mockGet(page, '**/clients/*', f.clients[0]);
  await mockPost(page, '**/clients', f.clients[0]);
  await mockPut(page, '**/clients/*', f.clients[0]);
  await mockDelete(page, '**/clients/*');
  await mockGet(page, '**/businesses*', f.businesses);
  await mockPost(page, '**/businesses', f.businesses.data[0]);
  await mockPut(page, '**/businesses/*', f.businesses.data[0]);
  await mockDelete(page, '**/businesses/*');
  await mockGet(page, '**/areas*', { data: f.areas, total: 2, page: 1, size: 100 });
  await mockGet(page, '**/business-types', [{ id: 1, name: 'Bodega' }]);
  await mockGet(page, '**/price-types', [{ id: 1, name: 'Regular' }]);
}

export async function setupProductsMocks(page: Page) {
  await mockGet(page, '**/products*', f.products);
  await mockGet(page, '**/products/*', f.products.data[0]);
  await mockPost(page, '**/products', f.products.data[0]);
  await mockPut(page, '**/products/*', f.products.data[0]);
  await mockDelete(page, '**/products/*');
  await mockGet(page, '**/categories*', f.categories);
  await mockPost(page, '**/categories', f.categories[0]);
  await mockPut(page, '**/categories/*', f.categories[0]);
  await mockGet(page, '**/brands*', f.brands);
  await mockPost(page, '**/brands', f.brands[0]);
  await mockGet(page, '**/colors*', f.colors);
  await mockPost(page, '**/colors', f.colors[0]);
  await mockGet(page, '**/presentations*', f.presentations);
  await mockPost(page, '**/presentations', f.presentations[0]);
}

export async function setupPresalesMocks(page: Page) {
  await mockGet(page, '**/presales*', f.presales);
  await mockGet(page, '**/presales/*', f.presales.data[0]);
  await mockPost(page, '**/presales', f.presales.data[0]);
  await mockPut(page, '**/presales/*', f.presales.data[0]);
  await mockGet(page, '**/users', f.allUsers);
  await mockGet(page, '**/branches', f.branches);
}

export async function setupStockMocks(page: Page) {
  await mockGet(page, '**/product-branches*', f.inventory);
  await mockPut(page, '**/product-branches*', { message: 'ok', hasStock: true, stockQty: 50 });
  await mockGet(page, '**/branches', f.branches);
  await mockGet(page, '**/categories*', f.categories);
  await mockGet(page, '**/brands*', f.brands);
}

export async function setupActivitiesMocks(page: Page) {
  await mockGet(page, '**/activities*', f.activities);
  await mockGet(page, '**/users', f.allUsers);
}

export async function apiRoute(
  page: Page,
  pattern: string,
  handler: (route: Route) => void
) {
  await page.route(pattern, route => {
    if (route.request().resourceType() === 'document') {
      route.continue();
    } else {
      handler(route);
    }
  });
}