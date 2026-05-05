import { test, expect, Page } from '@playwright/test';
import { adminUser } from '../mocks/fixtures';

async function fillAndSubmit(page: Page, user = 'admin', pass = 'secreto') {
  await page.fill('#username', user);
  await page.fill('#password', pass);
  await page.click('button[type="submit"]');
}

test.describe('LoginPage', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/me', route =>
      route.fulfill({ status: 401, json: { error: 'No autorizado' } })
    );
  });

  test('muestra el formulario de login con los campos y el botón', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /ingresar/i })).toBeVisible();
  });

  test('login exitoso con rol administrador redirige a /users', async ({ page }) => {
    await page.route('**/api/auth/login', route =>
      route.fulfill({ status: 200, json: { user: adminUser } })
    );
    await page.route('**/api/auth/me', route =>
      route.fulfill({ status: 200, json: adminUser })
    );

    await page.goto('/login');
    await fillAndSubmit(page);

    await expect(page).toHaveURL(/\/users/);
  });


  test('usuario ya autenticado al cargar la página redirige automáticamente', async ({ page }) => {
    await page.route('**/api/auth/me', route =>
      route.fulfill({ status: 200, json: adminUser })
    );

    await page.goto('/login');

    await expect(page).toHaveURL(/\/users/);
  });


  test('credenciales inválidas muestra mensaje de error en pantalla', async ({ page }) => {
    await page.route('**/api/auth/login', route =>
      route.fulfill({ status: 401, json: { error: 'Credenciales inválidas' } })
    );

    await page.goto('/login');
    await fillAndSubmit(page, 'admin', 'mal_password');

    await expect(page.getByText(/credenciales inválidas/i)).toBeVisible();
  });

  test('error de red muestra mensaje de error genérico', async ({ page }) => {
    await page.route('**/api/auth/login', route =>
      route.abort('failed')
    );

    await page.goto('/login');
    await fillAndSubmit(page);

    await expect(page.locator('[class*="red"]')).toBeVisible();
  });

  test('el formulario requiere usuario: no envía si el campo está vacío', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#password', 'secreto');
    await page.click('button[type="submit"]');

    const validationMessage = await page.locator('#username').evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validationMessage).not.toBe('');
  });

  test('el formulario requiere contraseña: no envía si el campo está vacío', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#username', 'admin');
    await page.click('button[type="submit"]');

    const validationMessage = await page.locator('#password').evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validationMessage).not.toBe('');
  });

  test('después de un error el botón vuelve a habilitarse', async ({ page }) => {
    await page.route('**/api/auth/login', route =>
      route.fulfill({ status: 401, json: { error: 'Fallo' } })
    );

    await page.goto('/login');
    await fillAndSubmit(page);

    await expect(page.getByRole('button', { name: /ingresar/i })).toBeEnabled();
  });
});