import { test, expect, Page, Route } from '@playwright/test';
import { adminUser, clients, areas, businesses } from '../mocks/fixtures';
import { apiRoute } from '../mocks/handlers';

async function setupPage(page: Page) {
    await page.addInitScript((user) => {
        localStorage.setItem('auth_token', 'fake-token-123');
        localStorage.setItem('auth_user', JSON.stringify(user));
    }, adminUser);
    await apiRoute(page, '**/clients*', (route: Route) =>
        route.fulfill({ status: 200, json: clients })
    );
    await apiRoute(page, '**/business*', (route: Route) =>
        route.fulfill({ status: 200, json: { data: [], total: 0, page: 1, limit: 10, totalPages: 1 } })
    );
    await apiRoute(page, '**/areas*', (route: Route) =>
        route.fulfill({ status: 200, json: { data: areas, total: areas.length, page: 1, size: 100 } })
    );
    await apiRoute(page, '**/business-types*', (route: Route) =>
        route.fulfill({ status: 200, json: [{ id: 1, name: 'Bodega' }] })
    );
    await apiRoute(page, '**/price-types*', (route: Route) =>
        route.fulfill({ status: 200, json: [{ id: 1, name: 'Regular' }] })
    );
}

test.describe('Clients en ClientsBusinessesPage', () => {

    test('muestra la lista de clientes al cargar', async ({ page }) => {
        await setupPage(page);
        await page.goto('/clients');

        await expect(page.locator('table:has-text("García")')).toBeVisible();
        await expect(page.locator('table:has-text("Rojas")')).toBeVisible();
    });

    test('cambiar a pestaña Negocios muestra el listado de negocios', async ({ page }) => {
        await setupPage(page);
        await page.goto('/clients');

        await page.click('button:has-text("Negocios")');

        await expect(page.getByText('Listado de Negocios')).toBeVisible();
    });

    test('botón "Nuevo cliente" abre el modal de creación', async ({ page }) => {
        await setupPage(page);
        await page.goto('/clients');

        await page.click('button:has-text("Nuevo cliente")');

        await expect(page.getByRole('heading', { name: 'Nuevo Cliente' })).toBeVisible();
    });

    test('crear cliente exitoso muestra toast de éxito', async ({ page }) => {
        await setupPage(page);
        await apiRoute(page, '**/clients*', (route: Route) => {
            if (route.request().method() === 'POST') {
                route.fulfill({ status: 201, json: clients[0] });
            } else {
                route.fulfill({ status: 200, json: clients });
            }
        });

        await page.goto('/clients');
        await page.click('button:has-text("Nuevo cliente")');
        await expect(page.getByRole('heading', { name: 'Nuevo Cliente' })).toBeVisible();

        await page.fill('input[name="name"]', 'Nuevo');
        await page.fill('input[name="lastName"]', 'Cliente');
        await page.fill('input[name="phone"]', '70000001');
        await page.click('button[type="submit"]');

        await expect(page.getByText('Cliente creado')).toBeVisible();
    });

    test('botón "Editar" en la fila abre el modal con datos precargados', async ({ page }) => {
        await setupPage(page);
        await page.goto('/clients');

        const row = page.locator('tr', { hasText: 'García' }).first();
        await row.locator('button:has-text("Editar")').click();

        await expect(page.getByRole('heading', { name: 'Editar Cliente' })).toBeVisible();
        await expect(page.locator('input[name="name"]')).toHaveValue('Ana');
    });

    test('editar cliente exitoso muestra toast de éxito', async ({ page }) => {
        await setupPage(page);
        await apiRoute(page, '**/clients/*', (route: Route) => {
            if (route.request().method() === 'PATCH') {
                route.fulfill({ status: 200, json: clients[0] });
            } else {
                route.continue();
            }
        });

        await page.goto('/clients');
        const row = page.locator('tr', { hasText: 'García' }).first();
        await row.locator('button:has-text("Editar")').click();
        await expect(page.getByRole('heading', { name: 'Editar Cliente' })).toBeVisible();

        await page.fill('input[name="name"]', 'Ana Editada');
        await page.click('button[type="submit"]');

        await expect(page.getByText('Cliente actualizado')).toBeVisible();
    });

    test('botón "Eliminar" en la fila abre el diálogo de confirmación', async ({ page }) => {
        await setupPage(page);
        await page.goto('/clients');

        const row = page.locator('tr', { hasText: 'García' }).first();
        await row.locator('button:has-text("Eliminar")').click();

        await expect(page.getByText('Eliminar cliente')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Eliminar' }).last()).toBeVisible();
    });

    test('error al cargar clientes muestra lista vacía', async ({ page }) => {
        await page.addInitScript((user) => {
            localStorage.setItem('auth_token', 'fake-token-123');
            localStorage.setItem('auth_user', JSON.stringify(user));
        }, adminUser);
        await apiRoute(page, '**/clients*', (route: Route) =>
            route.fulfill({ status: 500, json: { error: 'Fallo' } })
        );
        await apiRoute(page, '**/business*', (route: Route) =>
            route.fulfill({ status: 200, json: { data: [], total: 0, page: 1, limit: 10, totalPages: 1 } })
        );
        await apiRoute(page, '**/areas*', (route: Route) =>
            route.fulfill({ status: 200, json: { data: areas, total: 2, page: 1, size: 100 } })
        );
        await apiRoute(page, '**/business-types*', (route: Route) =>
            route.fulfill({ status: 200, json: [] })
        );
        await apiRoute(page, '**/price-types*', (route: Route) =>
            route.fulfill({ status: 200, json: [] })
        );

        await page.goto('/clients');

        await expect(page.locator('table:has-text("No hay clientes registrados")')).toBeVisible({ timeout: 5000 });
    });
});
