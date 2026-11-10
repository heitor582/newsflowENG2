const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

async function criarRascunho(page) {
  await page.getByLabel('Título', { exact: true }).fill('Novidades da Vértice');
  await page.getByLabel('Conteúdo', { exact: true }).fill('Confira os destaques desta semana.');
  await page.getByRole('button', { name: 'Criar rascunho', exact: true }).click();
}

test('C1 - cria uma edição e recebe aprovação de outro revisor', async ({ page }) => {
  await criarRascunho(page);
  await expect(page.getByRole('status')).toHaveText('Rascunho criado');
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Novidades da Vértice' })).toBeVisible();
  await page.getByLabel('Pessoa responsável').selectOption({ label: 'Bruno — revisor' });
  await page.getByRole('button', { name: 'Aprovar', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Edição aprovada');
  await expect(page.getByText('Situação: Aprovada', { exact: true })).toBeVisible();
  await expect(page.getByText('Revisão: Bruno', { exact: true })).toBeVisible();
  await expect(page.getByText('1 edição(ões) · 1 aprovada(s)', { exact: true })).toBeVisible();
});

test('C2 - recusa autoaprovação e mantém a edição como rascunho', async ({ page }) => {
  await criarRascunho(page);
  await page.getByRole('button', { name: 'Aprovar', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Autor não pode avaliar a própria edição');
  await expect(page.getByText('Situação: Rascunho', { exact: true })).toBeVisible();
  await expect(page.getByText('1 edição(ões) · 0 aprovada(s)', { exact: true })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByText('Confira os destaques desta semana.', { exact: true })).toBeVisible();
});

test('C3 - editar invalida a aprovação e mantém conteúdo e estado após recarregar', async ({ page }) => {
  await criarRascunho(page);
  await page.getByLabel('Pessoa responsável').selectOption({ label: 'Bruno — revisor' });
  await page.getByRole('button', { name: 'Aprovar', exact: true }).click();
  await expect(page.getByText('Situação: Aprovada', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.getByLabel('Título', { exact: true }).fill('Novidades revisadas');
  await page.getByLabel('Conteúdo', { exact: true }).fill('Texto atualizado para nova revisão.');
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Alterações salvas. A edição precisa de nova aprovação.');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Novidades revisadas', exact: true })).toBeVisible();
  await expect(page.getByText('Texto atualizado para nova revisão.', { exact: true })).toBeVisible();
  await expect(page.getByText('Situação: Rascunho', { exact: true })).toBeVisible();
  await expect(page.getByText('1 edição(ões) · 0 aprovada(s)', { exact: true })).toBeVisible();
  await expect(page.getByText('Revisão: Bruno', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Novidades da Vértice', exact: true })).toHaveCount(0);
  await expect(page.getByRole('listitem')).toHaveCount(1);
});
