import { test, expect, Page, Route } from '@playwright/test';
import { adminUser, areas } from '../mocks/fixtures';
import { apiRoute } from '../mocks/handlers';

async function setupPage(page: Page) {
    await page.addInitScript((user) => {
        localStorage.setItem('auth_token', 'fake-token-123');
        localStorage.setItem('auth_user', JSON.stringify(user));
    }, adminUser);
    await apiRoute(page, '**/areas*', (route: Route) =>
        route.fulfill({ status: 200, json: { data: areas, total: areas.length, page: 1, size: 10 } })
    );
}

function areaCard(page: Page, areaName: string) {
    return page.locator('div').filter({ has: page.locator('h4', { hasText: areaName }) }).first();
}


test.describe('AreasPage', () => {


    test('muestra la lista de áreas al cargar la página', async ({ page }) => {
        await setupPage(page);
        await page.goto('/areas');

        await expect(page.locator('h4').filter({ hasText: 'Zona Centro' }).first()).toBeVisible();
        await expect(page.locator('h4').filter({ hasText: 'Zona Norte' }).first()).toBeVisible();
    });

    test('el contador "Total Áreas" refleja la cantidad correcta', async ({ page }) => {
        await setupPage(page);
        await page.goto('/areas');

        await expect(page.locator('p.mt-2.text-4xl').filter({ hasText: '2' })).toBeVisible();
    });

    test('el buscador filtra áreas por nombre', async ({ page }) => {
        await setupPage(page);
        await page.goto('/areas');

        await page.fill('input[placeholder*="Buscar"]', 'Centro');
        await page.waitForTimeout(300);

        await expect(page.locator('h4').filter({ hasText: 'Zona Centro' }).first()).toBeVisible();
        await expect(page.locator('h4').filter({ hasText: 'Zona Norte' })).toHaveCount(0);
    });

    test('buscador vacío restaura la lista completa', async ({ page }) => {
        await setupPage(page);
        await page.goto('/areas');

        await page.fill('input[placeholder*="Buscar"]', 'Centro');
        await page.waitForTimeout(300);
        await page.fill('input[placeholder*="Buscar"]', '');
        await page.waitForTimeout(300);

        await expect(page.locator('h4').filter({ hasText: 'Zona Centro' }).first()).toBeVisible();
        await expect(page.locator('h4').filter({ hasText: 'Zona Norte' }).first()).toBeVisible();
    });

    test('botón "Nueva Área" abre el modal de creación', async ({ page }) => {
        await setupPage(page);
        await page.goto('/areas');

        await page.click('button:has-text("Nueva Área")');

        await expect(page.locator('input#area-name')).toBeVisible();
    });

    test('hacer click en editar área abre el modal con el nombre pre-cargado', async ({ page }) => {
        await setupPage(page);
        await page.goto('/areas');

        await areaCard(page, 'Zona Centro').locator('button[title="Editar"]').first().click();

        await expect(page.locator('input#area-name')).toHaveValue('Zona Centro');
    });

    test('clic en eliminar área muestra el diálogo de confirmación', async ({ page }) => {
        await setupPage(page);
        await page.goto('/areas');

        await areaCard(page, 'Zona Centro').locator('button[title="Eliminar"]').first().click();

        await expect(page.getByText('Eliminar Área')).toBeVisible();
        await expect(page.getByText('¿Estás seguro que deseas eliminar el área "Zona Centro"?')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sí, Eliminar' })).toBeVisible();
    });

    test('cancelar la eliminación cierra el diálogo sin llamar a la API', async ({ page }) => {
        await setupPage(page);
        let deleteCalled = false;
        await apiRoute(page, '**/areas/*', (route: Route) => {
            if (route.request().method() === 'DELETE') {
                deleteCalled = true;
                route.fulfill({ status: 200, json: {} });
            } else {
                route.continue();
            }
        });

        await page.goto('/areas');
        await areaCard(page, 'Zona Centro').locator('button[title="Eliminar"]').first().click();

        await page.click('button:has-text("Cancelar")');

        await expect(page.getByText('Eliminar Área')).not.toBeVisible();
        expect(deleteCalled).toBe(false);
    });

    test('confirmar eliminación llama a la API y muestra toast de éxito', async ({ page }) => {
        await setupPage(page);
        await apiRoute(page, '**/areas/*', (route: Route) => {
            if (route.request().method() === 'DELETE') {
                route.fulfill({ status: 200, json: {} });
            } else {
                route.continue();
            }
        });

        await page.goto('/areas');
        await areaCard(page, 'Zona Centro').locator('button[title="Eliminar"]').first().click();

        await page.click('button:has-text("Sí, Eliminar")');

        await expect(page.getByText('Área eliminada correctamente')).toBeVisible();
    });


    test('error al eliminar muestra mensaje de error', async ({ page }) => {
        await setupPage(page);
        await apiRoute(page, '**/areas/*', (route: Route) => {
            if (route.request().method() === 'DELETE') {
                route.fulfill({ status: 500, json: { error: 'No se pudo eliminar' } });
            } else {
                route.continue();
            }
        });

        await page.goto('/areas');
        await areaCard(page, 'Zona Centro').locator('button[title="Eliminar"]').first().click();
        await page.click('button:has-text("Sí, Eliminar")');

        await expect(page.getByText('No se pudo eliminar')).toBeVisible();
    });

    test('error al no dibujar un polígono para el área', async ({ page }) => {
        await setupPage(page);
        await apiRoute(page, '**/areas*', (route: Route) => {
            if (route.request().method() === 'POST') {
                route.fulfill({ status: 500, json: { error: 'Error del servidor' } });
            } else {
                route.fulfill({ status: 200, json: { data: areas, total: 2, page: 1, size: 10 } });
            }
        });

        await page.goto('/areas');
        await page.click('button:has-text("Nueva Área")');
        await expect(page.locator('input#area-name')).toBeVisible();
        await page.fill('input#area-name', 'Zona Fallida');
        await page.locator('button[type="submit"]').last().click();

        await expect(page.getByText('Debes dibujar un polígono en el mapa')).toBeVisible();
    });
});