import { test, expect, Page, Route } from '@playwright/test';
import { adminUser, clients, areas, businesses } from '../mocks/fixtures';
import { apiRoute } from '../mocks/handlers';

const businessTypes = [{ id: 1, name: 'Bodega' }];
const priceTypes = [{ id: 1, name: 'Regular' }];

async function setupPage(page: Page) {
    await page.addInitScript((user) => {
        localStorage.setItem('auth_token', 'fake-token-123');
        localStorage.setItem('auth_user', JSON.stringify(user));
    }, adminUser);
    await apiRoute(page, '**/business*', (route: Route) =>
        route.fulfill({ status: 200, json: businesses })
    );
    await apiRoute(page, '**/clients*', (route: Route) =>
        route.fulfill({ status: 200, json: clients })
    );
    await apiRoute(page, '**/clients/search*', (route: Route) =>
        route.fulfill({ status: 200, json: clients })
    );
    await apiRoute(page, '**/areas*', (route: Route) =>
        route.fulfill({ status: 200, json: { data: areas, total: areas.length, page: 1, size: 100 } })
    );
    await apiRoute(page, '**/business-types*', (route: Route) =>
        route.fulfill({ status: 200, json: businessTypes })
    );
    await apiRoute(page, '**/price-types*', (route: Route) =>
        route.fulfill({ status: 200, json: priceTypes })
    );
}

async function goToBusinesses(page: Page) {
    await page.goto('/clients');
    await page.click('button:has-text("Negocios")');
    await expect(page.getByRole('heading', { name: 'Listado de Negocios' })).toBeVisible();
}

function businessTableRow(page: Page) {
    return page.locator('table tr', { hasText: 'Bodega Central' }).first();
}

test.describe('Negocios en ClientsBusinessesPage', () => {

    test('muestra la lista de negocios al cambiar a la pestaña Negocios', async ({ page }) => {
        await setupPage(page);
        await goToBusinesses(page);

        await expect(page.locator('table tr', { hasText: 'Bodega Central' }).first()).toBeVisible();
    });

    test('botón "Nuevo negocio" abre el modal de creación', async ({ page }) => {
        await setupPage(page);
        await goToBusinesses(page);

        await page.click('button:has-text("Nuevo negocio")');

        await expect(page.getByRole('heading', { name: 'Nuevo Negocio' })).toBeVisible();
    });

    test('crear negocio exitoso muestra toast de éxito', async ({ page }) => {
        await setupPage(page);
        await apiRoute(page, '**/business*', (route: Route) => {
            if (route.request().method() === 'POST') {
                route.fulfill({ status: 201, json: businesses.data[0] });
            } else {
                route.fulfill({ status: 200, json: businesses });
            }
        });
        await apiRoute(page, '**/business-types*', (route: Route) =>
            route.fulfill({ status: 200, json: businessTypes })
        );
        await apiRoute(page, '**/price-types*', (route: Route) =>
            route.fulfill({ status: 200, json: priceTypes })
        );

        await goToBusinesses(page);
        await page.click('button:has-text("Nuevo negocio")');
        await expect(page.getByRole('heading', { name: 'Nuevo Negocio' })).toBeVisible();

        await page.fill('input[placeholder="Ferretería San José"]', 'Tienda Nueva');
        await page.fill('input[placeholder="Buscar cliente..."]', 'García');
        await page.waitForSelector('button span.font-medium:has-text("García Vela Ana")', { timeout: 3000 });
        await page.locator('button', { has: page.locator('span.font-medium', { hasText: 'García Vela Ana' }) }).first().click();
        await page.selectOption('select#businessPrice', { index: 1 });
        await page.selectOption('select#businessType', { index: 1 });
        await page.fill('input#businessLat', '17');
        await page.fill('input#businessLon', '17');
        await page.click('button:has-text("Crear negocio")');

        await expect(page.getByText('Negocio creado')).toBeVisible();
    });

    test('botón "Editar" abre el modal con datos precargados', async ({ page }) => {
        await setupPage(page);
        await goToBusinesses(page);

        await businessTableRow(page).getByRole('button', { name: 'Editar' }).click();

        await expect(page.getByRole('heading', { name: 'Editar Negocio' })).toBeVisible();
        await expect(page.locator('input[placeholder="Ferretería San José"]')).toHaveValue('Bodega Central');
    });

    test('editar negocio exitoso muestra toast de éxito', async ({ page }) => {
        await setupPage(page);
        await apiRoute(page, '**/business/*', (route: Route) => {
            if (route.request().method() === 'PATCH') {
                route.fulfill({ status: 200, json: businesses.data[0] });
            } else {
                route.continue();
            }
        });
        await apiRoute(page, '**/business-types*', (route: Route) =>
            route.fulfill({ status: 200, json: businessTypes })
        );
        await apiRoute(page, '**/price-types*', (route: Route) =>
            route.fulfill({ status: 200, json: priceTypes })
        );

        await goToBusinesses(page);
        await businessTableRow(page).getByRole('button', { name: 'Editar' }).click();
        await expect(page.getByRole('heading', { name: 'Editar Negocio' })).toBeVisible();

        await page.fill('input[placeholder="Ferretería San José"]', 'Bodega Central Editada');
        await page.selectOption('select#businessPrice', { index: 1 });
        await page.selectOption('select#businessType', { index: 1 });
        await page.fill('input#businessLat', '17');
        await page.fill('input#businessLon', '18');
        await page.click('button:has-text("Guardar cambios")');

        await expect(page.getByText('Negocio actualizado')).toBeVisible();
    });

    test('botón "Desactivar" abre el diálogo de confirmación', async ({ page }) => {
        await setupPage(page);
        await goToBusinesses(page);

        await businessTableRow(page).getByRole('button', { name: 'Desactivar' }).click();

        await expect(page.getByText('Desactivar negocio')).toBeVisible();
    });

    test('confirmar desactivar negocio muestra toast de éxito', async ({ page }) => {
        await setupPage(page);
        await apiRoute(page, '**/business/*', (route: Route) => {
            if (route.request().method() === 'PATCH') {
                route.fulfill({ status: 200, json: { ...businesses.data[0], isActive: false } });
            } else {
                route.continue();
            }
        });

        await goToBusinesses(page);
        await businessTableRow(page).getByRole('button', { name: 'Desactivar' }).click();
        await page.getByRole('button', { name: 'Desactivar' }).last().click();

        await expect(page.getByText('Negocio desactivado')).toBeVisible();
    });

    test('botón "Eliminar" abre el diálogo de confirmación', async ({ page }) => {
        await setupPage(page);
        await goToBusinesses(page);

        await businessTableRow(page).getByRole('button', { name: 'Eliminar' }).click();

        await expect(page.getByText('Eliminar negocio')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Eliminar' }).last()).toBeVisible();
    });

    test('confirmar eliminación muestra toast de éxito', async ({ page }) => {
        await setupPage(page);
        await apiRoute(page, '**/business/*', (route: Route) => {
            if (route.request().method() === 'DELETE') {
                route.fulfill({ status: 200, json: {} });
            } else {
                route.continue();
            }
        });

        await goToBusinesses(page);
        await businessTableRow(page).getByRole('button', { name: 'Eliminar' }).click();
        await page.getByRole('button', { name: 'Eliminar' }).last().click();

        await expect(page.getByText('Negocio eliminado')).toBeVisible();
    });

    test('error al cargar negocios muestra lista vacía', async ({ page }) => {
        await page.addInitScript((user) => {
            localStorage.setItem('auth_token', 'fake-token-123');
            localStorage.setItem('auth_user', JSON.stringify(user));
        }, adminUser);
        await apiRoute(page, '**/business*', (route: Route) =>
            route.fulfill({ status: 500, json: { error: 'Fallo' } })
        );
        await apiRoute(page, '**/clients*', (route: Route) =>
            route.fulfill({ status: 200, json: clients })
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
        await page.click('button:has-text("Negocios")');

        await expect(
            page.getByRole('cell', { name: 'No hay negocios registrados' })
        ).toBeVisible({ timeout: 5000 });
    });
});