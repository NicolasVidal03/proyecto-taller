import { test, expect, Page, Route } from '@playwright/test';
import { adminUser, products, brands, categories, colors, presentations } from '../mocks/fixtures';
import { apiRoute } from '../mocks/handlers';

async function setupPage(page: Page) {
  await page.addInitScript((user) => {
    localStorage.setItem('auth_token', 'fake-token-123');
    localStorage.setItem('auth_user', JSON.stringify(user));
  }, adminUser);
  await apiRoute(page, '**/products*', (route: Route) => route.fulfill({ status: 200, json: products }));
  await apiRoute(page, '**/categories*', (route: Route) => route.fulfill({ status: 200, json: categories }));
  await apiRoute(page, '**/brands*', (route: Route) => route.fulfill({ status: 200, json: brands }));
  await apiRoute(page, '**/colors*', (route: Route) => route.fulfill({ status: 200, json: colors }));
  await apiRoute(page, '**/presentations*', (route: Route) => route.fulfill({ status: 200, json: presentations }));
}

test.describe('ProductsPage', () => {

  // ── Productos ──────────────────────────────────────────────────────────

  test('muestra la lista de productos al cargar', async ({ page }) => {
    await setupPage(page);
    await page.goto('/products');

    await expect(page.getByRole('cell', { name: 'Cable 1.5mm', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Tomacorriente', exact: true })).toBeVisible();
  });

  test('crear producto exitoso muestra toast de éxito', async ({ page }) => {
    await setupPage(page);
    await apiRoute(page, '**/products*', (route: Route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, json: products.data[0] });
      } else {
        route.fulfill({ status: 200, json: products });
      }
    });

    await page.goto('/products');
    await page.click('button:has-text("Crear producto")');
    await expect(page.locator('input#name')).toBeVisible();

    await page.fill('input#name', 'Fusible 10A');
    await page.selectOption('select#categoryId', { index: 1 });
    await page.selectOption('select#brandId', { index: 1 });
    await page.selectOption('select#priceId', { index: 1 })
    await page.fill('input#regular', '18');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Producto creado correctamente')).toBeVisible();
  });

  test('editar producto abre el modal con datos precargados', async ({ page }) => {
    await setupPage(page);
    await page.goto('/products');

    const row = page.locator('tr', { hasText: 'Cable 1.5mm' }).first();
    await row.getByRole('button', { name: 'Editar' }).click();

    await expect(page.locator('input#name')).toHaveValue('Cable 1.5mm');
  });

  test('editar producto exitoso muestra toast de éxito', async ({ page }) => {
    await setupPage(page);

    await apiRoute(page, '**/products/*', (route: Route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({ status: 200, json: products.data[0] });
      } else {
        route.continue();
      }
    });

    await page.goto('/products');
    const row = page.locator('tr', { hasText: 'Cable 1.5mm' }).first();
    await row.getByRole('button', { name: 'Editar' }).click();
    await expect(page.locator('input#name')).toBeVisible();

    await page.fill('input#name', 'Cable 2.5mm');
    await page.selectOption('select#presentationId', { index: 1 });
    await page.selectOption('select#colorId', { index: 1 });
    await page.click('button[type="submit"]');

    await expect(page.getByText('Producto actualizado correctamente')).toBeVisible();
  });

  test('eliminar producto muestra diálogo y toast de éxito', async ({ page }) => {
    await setupPage(page);
    await apiRoute(page, '**/products/**', (route: Route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({ status: 200, json: {} });
      } else {
        route.continue();
      }
    });

    await page.goto('/products');
    const row = page.locator('tr', { hasText: 'Cable 1.5mm' }).first();
    await row.getByRole('button', { name: 'Eliminar' }).click();
    await page.getByRole('button', { name: 'Eliminar' }).last().click();

    await expect(page.getByText(/eliminado correctamente/i)).toBeVisible();
  });

  test('campos obligatorios del producto muestran validación', async ({ page }) => {
    await setupPage(page);
    await page.goto('/products');

    await page.click('button:has-text("Crear producto")');
    await expect(page.locator('input#name')).toBeVisible();
    await page.click('button[type="submit"]');

    await expect(page.getByText('El nombre es requerido')).toBeVisible();
  });

  test('error al cargar productos muestra lista vacía', async ({ page }) => {
    await page.addInitScript((user) => {
      localStorage.setItem('auth_token', 'fake-token-123');
      localStorage.setItem('auth_user', JSON.stringify(user));
    }, adminUser);
    await apiRoute(page, '**/products*', (route: Route) => route.fulfill({ status: 500, json: { error: 'Fallo' } }));
    await apiRoute(page, '**/categories*', (route: Route) => route.fulfill({ status: 200, json: categories }));
    await apiRoute(page, '**/brands*', (route: Route) => route.fulfill({ status: 200, json: brands }));
    await apiRoute(page, '**/colors*', (route: Route) => route.fulfill({ status: 200, json: colors }));
    await apiRoute(page, '**/presentations*', (route: Route) => route.fulfill({ status: 200, json: presentations }));

    await page.goto('/products');

    await expect(
      page.getByRole('cell', { name: 'No hay productos para mostrar.' })
    ).toBeVisible({ timeout: 5000 });
  });

  // ── Marcas ─────────────────────────────────────────────────────────────

  test('crear marca exitosa muestra toast de éxito', async ({ page }) => {
    await setupPage(page);
    await apiRoute(page, '**/brands*', (route: Route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, json: brands[0] });
      } else {
        route.fulfill({ status: 200, json: brands });
      }
    });

    await page.goto('/products');
    await page.click('button:has-text("Marcas")');
    await page.click('button:has-text("Crear marca")');
    await expect(page.locator('input#name')).toBeVisible();

    await page.fill('input#name', 'Nueva Marca');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Marca creada correctamente')).toBeVisible();
  });

  test('editar marca abre modal con nombre precargado', async ({ page }) => {
    await setupPage(page);
    await page.goto('/products');

    await page.click('button:has-text("Marcas")');
    const row = page.locator('tr', { hasText: 'Voltex' }).first();
    await row.getByRole('button', { name: 'Editar' }).click();

    await expect(page.locator('input#name')).toHaveValue('Voltex');
  });

  test('editar marca exitosa muestra toast de éxito', async ({ page }) => {
    await setupPage(page);
    await apiRoute(page, '**/brands/*', (route: Route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({ status: 200, json: brands[0] });
      } else {
        route.continue();
      }
    });

    await page.goto('/products');
    await page.click('button:has-text("Marcas")');
    const row = page.locator('tr', { hasText: 'Voltex' }).first();
    await row.getByRole('button', { name: 'Editar' }).click();
    await expect(page.locator('input#name')).toBeVisible();

    await page.fill('input#name', 'Voltex Pro');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Marca actualizada correctamente')).toBeVisible();
  });

  test('eliminar marca muestra diálogo y toast de éxito', async ({ page }) => {
    await setupPage(page);
    await apiRoute(page, '**/brands/**', (route: Route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({ status: 200, json: {} });
      } else {
        route.continue();
      }
    });

    await page.goto('/products');
    await page.click('button:has-text("Marcas")');
    const row = page.locator('tr', { hasText: 'Voltex' }).first();
    await row.getByRole('button', { name: 'Desactivar' }).click();

    await expect(page.getByText('Eliminar marca')).toBeVisible();
    await page.getByRole('button', { name: 'Eliminar' }).last().click();

    await expect(page.getByText('Marca "Voltex" eliminada correctamente')).toBeVisible();
  });

  // ── Categorías ─────────────────────────────────────────────────────────

  test('crear categoría exitosa muestra toast de éxito', async ({ page }) => {
    await setupPage(page);
    await apiRoute(page, '**/categories*', (route: Route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, json: categories[0] });
      } else {
        route.fulfill({ status: 200, json: categories });
      }
    });

    await page.goto('/products');
    await page.click('button:has-text("Categorias")');
    await page.click('button:has-text("Crear categoría")');
    await expect(page.locator('input#name')).toBeVisible();

    await page.fill('input#name', 'Nueva Categoría');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Categoría creada correctamente')).toBeVisible();
  });

  test('editar categoría abre modal con nombre precargado', async ({ page }) => {
    await setupPage(page);
    await page.goto('/products');

    await page.click('button:has-text("Categorias")');
    const row = page.locator('tr', { hasText: 'Cables' }).first();
    await row.getByRole('button', { name: 'Editar' }).click();

    await expect(page.locator('input#name')).toHaveValue('Cables');
  });

  test('editar categoría exitosa muestra toast de éxito', async ({ page }) => {
    await setupPage(page);
    await apiRoute(page, '**/categories/*', (route: Route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({ status: 200, json: categories[0] });
      } else {
        route.continue();
      }
    });

    await page.goto('/products');
    await page.click('button:has-text("Categorias")');
    const row = page.locator('tr', { hasText: 'Cables' }).first();
    await row.getByRole('button', { name: 'Editar' }).click();
    await expect(page.locator('input#name')).toBeVisible();

    await page.fill('input#name', 'Cables Eléctricos');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Categoría actualizada correctamente')).toBeVisible();
  });

  test('eliminar categoría muestra diálogo y toast de éxito', async ({ page }) => {
    await setupPage(page);
    await apiRoute(page, '**/categories/**', (route: Route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({ status: 200, json: { success: true } });
      } else {
        route.continue();
      }
    });

    await page.goto('/products');
    await page.click('button:has-text("Categorias")');
    const row = page.locator('tr', { hasText: 'Cables' }).first();
    await row.getByRole('button', { name: 'Eliminar' }).click();

    await expect(page.getByText('Eliminar categoría')).toBeVisible();
    await page.getByRole('button', { name: 'Eliminar' }).last().click();

    await expect(page.getByText('Categoría "Cables" eliminada correctamente')).toBeVisible();
  });

  // ── Colores ────────────────────────────────────────────────────────────

  test('crear color exitoso muestra toast de éxito', async ({ page }) => {
    await setupPage(page);
    await apiRoute(page, '**/colors*', (route: Route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, json: colors[0] });
      } else {
        route.fulfill({ status: 200, json: colors });
      }
    });

    await page.goto('/products');
    await page.click('button:has-text("Colores")');
    await page.click('button:has-text("Crear color")');
    await expect(page.locator('input#name')).toBeVisible();

    await page.fill('input#name', 'Azul');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Color creado correctamente')).toBeVisible();
  });

  test('editar color abre modal con nombre precargado', async ({ page }) => {
    await setupPage(page);
    await page.goto('/products');

    await page.click('button:has-text("Colores")');
    const row = page.locator('tr', { hasText: 'Rojo' }).first();
    await row.getByRole('button', { name: 'Editar' }).click();

    await expect(page.locator('input#name')).toHaveValue('Rojo');
  });

  test('editar color exitoso muestra toast de éxito', async ({ page }) => {
    await setupPage(page);
    await apiRoute(page, '**/colors/*', (route: Route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({ status: 200, json: colors[0] });
      } else {
        route.continue();
      }
    });

    await page.goto('/products');
    await page.click('button:has-text("Colores")');
    const row = page.locator('tr', { hasText: 'Rojo' }).first();
    await row.getByRole('button', { name: 'Editar' }).click();
    await expect(page.locator('input#name')).toBeVisible();

    await page.fill('input#name', 'Rojo Oscuro');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Color actualizado correctamente')).toBeVisible();
  });

  test('eliminar color muestra diálogo y toast de éxito', async ({ page }) => {
    await setupPage(page);
    await apiRoute(page, '**/colors/**', (route: Route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({ status: 200, json: { success: true } });
      } else {
        route.continue();
      }
    });

    await page.goto('/products');
    await page.click('button:has-text("Colores")');
    const row = page.locator('tr', { hasText: 'Rojo' }).first();
    await row.getByRole('button', { name: 'Eliminar' }).click();

    await expect(page.getByText('Eliminar color')).toBeVisible();
    await page.getByRole('button', { name: 'Eliminar' }).last().click();

    await expect(page.getByText('Color "Rojo" eliminado correctamente')).toBeVisible();
  });

  // ── Presentaciones ─────────────────────────────────────────────────────

  test('crear presentación exitosa muestra toast de éxito', async ({ page }) => {
    await setupPage(page);
    await apiRoute(page, '**/presentations*', (route: Route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 201, json: presentations[0] });
      } else {
        route.fulfill({ status: 200, json: presentations });
      }
    });

    await page.goto('/products');
    await page.click('button:has-text("Presentaciones")');
    await page.click('button:has-text("Crear presentación")');
    await expect(page.locator('input#name')).toBeVisible();

    await page.fill('input#name', 'Bolsa x 50');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Presentación creada correctamente')).toBeVisible();
  });

  test('editar presentación abre modal con nombre precargado', async ({ page }) => {
    await setupPage(page);
    await page.goto('/products');

    await page.click('button:has-text("Presentaciones")');
    const row = page.locator('tr', { hasText: 'Caja x 100' }).first();
    await row.getByRole('button', { name: 'Editar' }).click();

    await expect(page.locator('input#name')).toHaveValue('Caja x 100');
  });

  test('editar presentación exitosa muestra toast de éxito', async ({ page }) => {
    await setupPage(page);
    await apiRoute(page, '**/presentations/*', (route: Route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({ status: 200, json: presentations[0] });
      } else {
        route.continue();
      }
    });

    await page.goto('/products');
    await page.click('button:has-text("Presentaciones")');
    const row = page.locator('tr', { hasText: 'Caja x 100' }).first();
    await row.getByRole('button', { name: 'Editar' }).click();
    await expect(page.locator('input#name')).toBeVisible();

    await page.fill('input#name', 'Caja x 200');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Presentación actualizada correctamente')).toBeVisible();
  });

  test('eliminar presentación muestra diálogo y toast de éxito', async ({ page }) => {
    await setupPage(page);
    await apiRoute(page, '**/presentations/**', (route: Route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({ status: 200, json: { success: true } });
      } else {
        route.continue();
      }
    });

    await page.goto('/products');
    await page.click('button:has-text("Presentaciones")');
    const row = page.locator('tr', { hasText: 'Caja x 100' }).first();
    await row.getByRole('button', { name: 'Eliminar' }).click();

    await expect(page.getByText('Eliminar presentación')).toBeVisible();
    await page.getByRole('button', { name: 'Eliminar' }).last().click();

    await expect(page.getByText('Presentación "Caja x 100" eliminada correctamente')).toBeVisible();
  });
});