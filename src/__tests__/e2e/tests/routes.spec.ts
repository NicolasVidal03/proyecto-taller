import { test, expect, Page, Route } from '@playwright/test';
import { adminUser, allUsers, areas, routes } from '../mocks/fixtures';
import { apiRoute } from '../mocks/handlers';

async function setupPage(page: Page) {
    await page.addInitScript((user) => {
        localStorage.setItem('auth_token', 'fake-token-123');
        localStorage.setItem('auth_user', JSON.stringify(user));
    }, adminUser);
    await apiRoute(page, '**/routes*', (route: Route) =>
        route.fulfill({ status: 200, json: routes })
    );
    await apiRoute(page, '**/users*', (route: Route) =>
        route.fulfill({ status: 200, json: allUsers })
    );
    await apiRoute(page, '**/areas*', (route: Route) =>
        route.fulfill({ status: 200, json: { data: areas, total: areas.length, page: 1, size: 100 } })
    );
}

test.describe('RoutesPage', () => {

    test('muestra las rutas existentes al cargar', async ({ page }) => {
        await setupPage(page);
        await page.goto('/routes');

        await expect(page.locator('table:has-text("Juan Pérez")')).toBeVisible();
        await expect(page.locator('table:has-text("Zona Centro")')).toBeVisible();
    });

    test('el botón Nueva ruta abre el modal', async ({ page }) => {
        await setupPage(page);
        await page.goto('/routes');

        await page.click('button:has-text("Nueva ruta")');

        await expect(page.getByText('Generar Ruta para Prevendedor')).toBeVisible();
    });

    test('generar ruta exitosa muestra toast de éxito', async ({ page }) => {
        await setupPage(page);
        await apiRoute(page, '**/routes*', (route: Route) => {
            if (route.request().method() === 'POST') {
                route.fulfill({ status: 201, json: routes[0] });
            } else {
                route.fulfill({ status: 200, json: routes });
            }
        });

        await page.goto('/routes');
        await page.click('button:has-text("Nueva ruta")');
        await expect(page.getByText('Generar Ruta para Prevendedor')).toBeVisible();

        await page.selectOption('select', { index: 1 });
        await page.locator('select').nth(1).selectOption({ index: 1 });
        await page.locator('input#routeDate').fill('2099-12-31');
        await page.locator('select#areaRoute').selectOption({ index: 1 });
        await page.click('button[type="submit"]');

        await expect(page.getByText('¡Ruta generada exitosamente!')).toBeVisible();
    });

    test('error al cargar rutas muestra toast de error', async ({ page }) => {
        await page.addInitScript((user) => {
            localStorage.setItem('auth_token', 'fake-token-123');
            localStorage.setItem('auth_user', JSON.stringify(user));
        }, adminUser);
        await apiRoute(page, '**/routes*', (route: Route) =>
            route.fulfill({ status: 500, json: { error: 'Fallo' } })
        );
        await apiRoute(page, '**/users*', (route: Route) =>
            route.fulfill({ status: 200, json: allUsers })
        );
        await apiRoute(page, '**/areas*', (route: Route) =>
            route.fulfill({ status: 200, json: { data: areas, total: 2, page: 1, size: 100 } })
        );

        await page.goto('/routes');

        await expect(page.locator('table:has-text("No hay rutas para mostrar")')).toBeVisible({ timeout: 5000 });
    });

    test('una ruta con fecha pasada no muestra botón de edición activo', async ({ page }) => {
        await setupPage(page);
        await page.goto('/routes');

        await expect(page.locator('table:has-text("Juan Pérez")')).toBeVisible();

        const row = page.locator('tr', { hasText: 'Juan Pérez' }).first();
        const editBtn = row.getByRole('button', { name: 'Editar' });
        await expect(editBtn).toHaveCount(0);

        const editSpan = row.locator('span', { hasText: 'Editar' });
        await expect(editSpan).toBeVisible();
        await expect(editSpan).toHaveAttribute('title', 'Solo se pueden editar rutas con fecha igual o posterior a hoy');
    });

    test('editar una ruta con fecha futura abre el modal con datos precargados', async ({ page }) => {
        const futureRoute = [{
            id: 1,
            assignedIdUser: 2,
            assignedIdArea: 1,
            assignedDate: '2099-12-31',
            user: allUsers[1],
            area: areas[0],
        }];

        await page.addInitScript((user) => {
            localStorage.setItem('auth_token', 'fake-token-123');
            localStorage.setItem('auth_user', JSON.stringify(user));
        }, adminUser);
        await apiRoute(page, '**/routes*', (route: Route) =>
            route.fulfill({ status: 200, json: futureRoute })
        );
        await apiRoute(page, '**/users*', (route: Route) =>
            route.fulfill({ status: 200, json: allUsers })
        );
        await apiRoute(page, '**/areas*', (route: Route) =>
            route.fulfill({ status: 200, json: { data: areas, total: areas.length, page: 1, size: 100 } })
        );

        await page.goto('/routes');
        await expect(page.locator('table:has-text("Juan Pérez")')).toBeVisible();

        const row = page.locator('tr', { hasText: 'Juan Pérez' }).first();
        await row.getByRole('button', { name: 'Editar' }).click();

        await expect(page.getByText('Editar Ruta #1')).toBeVisible();

        await apiRoute(page, '**/routes/*', (route: Route) => {
            if (route.request().method() === 'PUT') {
                route.fulfill({ status: 200, json: { updated: futureRoute[0] } });
            } else {
                route.fulfill({ status: 200, json: futureRoute });
            }
        });

        await page.locator('input#routeDate').fill('2099-10-01');
        await page.click('button[type="submit"]');

        await expect(page.getByText('¡Ruta actualizada exitosamente!')).toBeVisible();
    });
});