import { test, expect, Page, Route } from '@playwright/test';
import { adminUser, allUsers, activities } from '../mocks/fixtures';
import { apiRoute } from '../mocks/handlers';

async function setupPage(page: Page) {
    await page.addInitScript((user) => {
        localStorage.setItem('auth_token', 'fake-token-123');
        localStorage.setItem('auth_user', JSON.stringify(user));
    }, adminUser);
    await apiRoute(page, '**/users*', (route: Route) =>
        route.fulfill({ status: 200, json: allUsers })
    );
    await apiRoute(page, '**activity**', (route: Route) =>
        route.fulfill({ status: 200, json: activities })
    );
}

test.describe('ActivitiesPage', () => {

    test('muestra la fecha de hoy seleccionada por defecto', async ({ page }) => {
        await setupPage(page);
        await page.goto('/activities');

        const today = new Date().toISOString().split('T')[0];
        await expect(page.locator('input[type="date"]')).toHaveValue(today);
    });

    test('el campo de búsqueda de usuario está visible al cargar', async ({ page }) => {
        await setupPage(page);
        await page.goto('/activities');

        await expect(page.locator('input[placeholder*="Buscar por nombre"]')).toBeVisible();
    });

    test('escribir en el buscador muestra el dropdown con usuarios filtrados', async ({ page }) => {
        await setupPage(page);
        await page.goto('/activities');

        const searchInput = page.locator('input[placeholder*="Buscar por nombre"]');
        await searchInput.fill('Juan');
        await page.waitForTimeout(300);
        await expect(page.getByText('Juan Pérez López')).toBeVisible();
    });

    test('seleccionar un usuario y consultar carga su actividad en el mapa', async ({ page }) => {
        await setupPage(page);
        await page.goto('/activities');
        const searchInput = page.locator('input[placeholder*="Buscar por nombre"]');
        await searchInput.fill('Juan');
        await page.waitForTimeout(300);
        await page.getByText('Juan Pérez López').click();
        await page.getByRole('button', { name: 'Buscar' }).click();
        await expect(page.getByText('Leyenda')).toBeVisible({ timeout: 8000 });
    });

    test('cambiar la fecha después de seleccionar usuario dispara nueva consulta', async ({ page }) => {
        const requests: string[] = [];

        await page.addInitScript((user) => {
            localStorage.setItem('auth_token', 'fake-token-123');
            localStorage.setItem('auth_user', JSON.stringify(user));
        }, adminUser);
        await apiRoute(page, '**/users*', (route: Route) =>
            route.fulfill({ status: 200, json: allUsers })
        );
        await apiRoute(page, '**activity**', (route: Route) => {
            requests.push(route.request().url());
            route.fulfill({ status: 200, json: activities });
        });

        await page.goto('/activities');
        const searchInput = page.locator('input[placeholder*="Buscar por nombre"]');
        await searchInput.fill('Juan');
        await page.waitForTimeout(300);
        await page.getByText('Juan Pérez López').click();
        await page.getByRole('button', { name: 'Buscar' }).click();
        await expect(page.getByText('Leyenda')).toBeVisible({ timeout: 8000 });

        const before = requests.length;
        await page.locator('input[type="date"]').fill('2024-06-02');
        await page.getByRole('button', { name: 'Buscar' }).click();
        await page.waitForTimeout(500);

        expect(requests.length).toBeGreaterThan(before);
    });

    test('error al cargar actividad muestra toast de error', async ({ page }) => {
        await page.addInitScript((user) => {
            localStorage.setItem('auth_token', 'fake-token-123');
            localStorage.setItem('auth_user', JSON.stringify(user));
        }, adminUser);
        await apiRoute(page, '**/users*', (route: Route) =>
            route.fulfill({ status: 200, json: allUsers })
        );
        await apiRoute(page, '**activity**', (route: Route) =>
            route.fulfill({ status: 500, json: { message: 'Error al cargar actividad' } })
        );

        await page.goto('/activities');

        const searchInput = page.locator('input[placeholder*="Buscar por nombre"]');
        await searchInput.fill('Juan');
        await page.waitForTimeout(300);
        await page.getByText('Juan Pérez López').click();
        await page.getByRole('button', { name: 'Buscar' }).click();

        await expect(page.getByText(/error/i)).toBeVisible({ timeout: 5000 });
    });

    test('sin usuario seleccionado el botón Buscar está deshabilitado', async ({ page }) => {
        await setupPage(page);
        await page.goto('/activities');

        await expect(page.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    });

    test('el botón Limpiar restablece el buscador y oculta resultados', async ({ page }) => {
        await setupPage(page);
        await page.goto('/activities');

        const searchInput = page.locator('input[placeholder*="Buscar por nombre"]');
        await searchInput.fill('Juan');
        await page.waitForTimeout(300);
        await page.getByText('Juan Pérez López').click();

        await page.getByRole('button', { name: 'Limpiar' }).click();

        await expect(searchInput).toHaveValue('');
        await expect(page.getByText('No hay actividades para mostrar')).toBeVisible();
    });
});