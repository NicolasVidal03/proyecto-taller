import { test, expect, Page, Route } from '@playwright/test';
import { adminUser, allUsers, branches } from '../mocks/fixtures';
import { apiRoute } from '../mocks/handlers';

async function setupPage(page: Page) {
    await page.addInitScript((user) => {
        localStorage.setItem('auth_token', 'fake-token-123');
        localStorage.setItem('auth_user', JSON.stringify(user));
    }, adminUser);
    await apiRoute(page, '**/users*', (route: Route) => route.fulfill({ status: 200, json: allUsers }));
    await apiRoute(page, '**/branches*', (route: Route) => route.fulfill({ status: 200, json: branches }));
}

test.describe('UsersPage', () => {

    test('muestra la lista de usuarios al cargar', async ({ page }) => {
        await setupPage(page);
        await page.goto('/users');

        await expect(page.getByRole('cell', { name: 'admin', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'jperez', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'mflores', exact: true })).toBeVisible();
    });

    test('el buscador filtra usuarios por nombre', async ({ page }) => {
        await setupPage(page);
        await page.goto('/users');

        await page.fill('input[placeholder*="nombre"]', 'Juan');
        await page.waitForTimeout(600);

        await expect(page.getByRole('cell', { name: 'jperez', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'admin', exact: true })).not.toBeVisible();
    });

    test('el filtro de rol "Prevendedores" muestra solo prevendedores', async ({ page }) => {
        await setupPage(page);
        await page.goto('/users');

        await page.click('button:has-text("Prevendedores")');
        await page.waitForTimeout(300);

        await expect(page.getByRole('cell', { name: 'jperez', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'admin', exact: true })).not.toBeVisible();
        await expect(page.getByRole('cell', { name: 'mflores', exact: true })).not.toBeVisible();
    });

    test('el filtro "Todos" vuelve a mostrar todos los usuarios', async ({ page }) => {
        await setupPage(page);
        await page.goto('/users');

        await page.click('button:has-text("Prevendedores")');
        await page.click('button:has-text("Todos")');
        await page.waitForTimeout(300);

        await expect(page.getByRole('cell', { name: 'admin', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'jperez', exact: true })).toBeVisible();
    });

    test('cambiar a la pestaña Sucursales muestra la lista de sucursales', async ({ page }) => {
        await setupPage(page);
        await page.goto('/users');

        await page.click('button:has-text("Sucursales")');

        await expect(page.getByRole('cell', { name: 'Central', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Norte', exact: true })).toBeVisible();
    });

    test('al cambiar a Sucursales el placeholder del buscador cambia', async ({ page }) => {
        await setupPage(page);
        await page.goto('/users');

        await page.click('button:has-text("Sucursales")');

        await expect(page.locator('input[placeholder*="sucursal"]')).toBeVisible();
    });

    test('crear usuario exitoso muestra toast de éxito', async ({ page }) => {
        await setupPage(page);
        await apiRoute(page, '**/users', (route: Route) => {
            if (route.request().method() === 'POST') {
                route.fulfill({ status: 201, json: allUsers[0] });
            } else {
                route.fulfill({ status: 200, json: allUsers });
            }
        });
        await page.goto('/users');

        await page.click('button:has-text("Crear usuario")');
        await expect(page.locator('input[name="ciMain"]')).toBeVisible();

        await page.fill('input[name="ciMain"]', '9999999');
        await page.fill('input[name="names"]', 'NUEVONOMBRE');
        await page.fill('input[name="lastName"]', 'NUEVOAPELLIDO');
        await page.fill('input[name="email"]', 'usuario.prueba@gmail.com');
        await page.selectOption('select[name="branchId"]', { index: 1 });
        await page.click('button[type="submit"]');

        await expect(page.getByText(/creado|éxito/i)).toBeVisible();
    });

    test('error al cargar usuarios muestra indicador de error o lista vacía', async ({ page }) => {
        await page.addInitScript((user) => {
            localStorage.setItem('auth_token', 'fake-token-123');
            localStorage.setItem('auth_user', JSON.stringify(user));
        }, adminUser);
        await apiRoute(page, '**/users*', (route: Route) => route.fulfill({ status: 500, json: { error: 'Error interno' } }));
        await apiRoute(page, '**/branches*', (route: Route) => route.fulfill({ status: 200, json: branches }));

        await page.goto('/users');

        await expect(page.getByText('No hay usuarios para mostrar.')).toBeVisible({ timeout: 5000 });
    });

    test('campos obligatorios muestran mensajes de validación', async ({ page }) => {
        await setupPage(page);
        await page.goto('/users');

        await page.click('button:has-text("Crear usuario")');
        await expect(page.locator('input[name="ciMain"]')).toBeVisible();

        await page.click('button[type="submit"]');

        await expect(page.getByText('La cédula (CI) es obligatoria')).toBeVisible();
        await expect(page.getByText('El nombre es obligatorio')).toBeVisible();
        await expect(page.getByText('El apellido es obligatorio')).toBeVisible();
        await expect(page.getByText('El correo electrónico es obligatorio')).toBeVisible();
    });

    test('filtro de rol se oculta al cambiar a pestaña Sucursales', async ({ page }) => {
        await setupPage(page);
        await page.goto('/users');

        await page.click('button:has-text("Sucursales")');

        await expect(page.locator('button:has-text("Prevendedores")')).toHaveCSS('visibility', 'hidden');
    });
});