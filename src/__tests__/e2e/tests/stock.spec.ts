import { test, expect, Page, Route } from '@playwright/test';
import { adminUser, branches, categories, brands, inventory } from '../mocks/fixtures';
import { apiRoute } from '../mocks/handlers';

async function setupPage(page: Page) {
    await page.addInitScript((user) => {
        localStorage.setItem('auth_token', 'fake-token-123');
        localStorage.setItem('auth_user', JSON.stringify(user));
    }, adminUser);
    await apiRoute(page, '**/branches/1/products*', (route: Route) =>
        route.fulfill({ status: 200, json: inventory })
    );
    await apiRoute(page, '**/branches*', (route: Route) =>
        route.fulfill({ status: 200, json: branches })
    );
    await apiRoute(page, '**/categories*', (route: Route) =>
        route.fulfill({ status: 200, json: categories })
    );
    await apiRoute(page, '**/brands*', (route: Route) =>
        route.fulfill({ status: 200, json: brands })
    );
}

test.describe('StockPage', () => {

    test('muestra el inventario de la sucursal del usuario al cargar', async ({ page }) => {
        await setupPage(page);
        await page.goto('/stock');

        await expect(page.locator('td:has-text("Cable 1.5mm")')).toBeVisible();
    });

    test('el selector de sucursal permite cambiar de sucursal', async ({ page }) => {
        await setupPage(page);
        await apiRoute(page, '**/branches/2/products*', (route: Route) =>
            route.fulfill({ status: 200, json: inventory })
        );

        await page.goto('/stock');
        await page.selectOption('select', { label: 'Norte' });
        await page.waitForTimeout(600);

        await expect(page.getByText(/error/i)).not.toBeVisible();
    });

    test('abrir modal de edición de stock muestra el título "Editar Stock"', async ({ page }) => {
        await setupPage(page);
        await page.goto('/stock');

        const row = page.locator('tr', { hasText: 'Cable 1.5mm' }).first();
        await row.getByRole('button', { name: 'Editar' }).click();

        await expect(page.getByText('Editar Stock')).toBeVisible();
        await expect(page.locator('input#stockQty')).toBeVisible();
    });

    test('el modal de edición muestra la cantidad de stock actual', async ({ page }) => {
        await setupPage(page);
        await page.goto('/stock');

        const row = page.locator('tr', { hasText: 'Cable 1.5mm' }).first();
        await row.getByRole('button', { name: 'Editar' }).click();

        await expect(page.locator('input#stockQty')).toHaveValue('50');
    });

    test('guardar stock exitosamente muestra toast de éxito', async ({ page }) => {
        await setupPage(page);
        await apiRoute(page, '**/products/*/branches/*/stock', (route: Route) => {
            if (route.request().method() === 'PUT') {
                route.fulfill({ status: 200, json: { hasStock: true, stockQty: 75, deleted: false } });
            } else {
                route.continue();
            }
        });

        await page.goto('/stock');
        const row = page.locator('tr', { hasText: 'Cable 1.5mm' }).first();
        await row.getByRole('button', { name: 'Editar' }).click();
        await expect(page.locator('input#stockQty')).toBeVisible();

        await page.fill('input#stockQty', '75');
        await page.click('button[type="submit"]');

        await expect(page.getByText('Stock actualizado correctamente')).toBeVisible();
    });

    test('error al guardar stock muestra toast de error', async ({ page }) => {
        await setupPage(page);
        await apiRoute(page, '**/products/*/branches/*/stock', (route: Route) => {
            if (route.request().method() === 'PUT') {
                route.fulfill({ status: 500, json: { error: 'Error al actualizar stock' } });
            } else {
                route.continue();
            }
        });

        await page.goto('/stock');
        const row = page.locator('tr', { hasText: 'Cable 1.5mm' }).first();
        await row.getByRole('button', { name: 'Editar' }).click();
        await expect(page.locator('input#stockQty')).toBeVisible();

        await page.fill('input#stockQty', '99');
        await page.click('button[type="submit"]');

        await expect(page.getByText('Error al actualizar stock')).toBeVisible();
    });
});