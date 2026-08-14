import { test, expect } from '@playwright/test';
import fs from 'fs';
import { AUTH_STATE_PATH } from '../../playwright.config';
import { DashboardPage } from '../../pages/DashboardPage';
import { RepositoryPage } from '../../pages/RepositoryPage';
import { ProfilePage } from '../../pages/ProfilePage';

const username = process.env.GITHUB_USERNAME;
const token = process.env.GH_PAT;
const repoName = process.env.repoName ? process.env.repoName : 'Capstone-Project-Repo';
//const repoName = process.env.repoName ?? 'Capstone-Project-Repo'; // Use a non-undefined fallback for repository name


test.describe('GitHub PAT Authentication Tests', () => {
    test.beforeAll(async ({ playwright }) => {
        test.skip(!token || !token.trim(), 'GH_PAT is not configured for PAT-based UI authentication.');

        if (!fs.existsSync(AUTH_STATE_PATH)) {
        console.log('Generating UI Session Context using Personal Access Token...');

        const browser = await playwright.chromium.launch();
        const context = await browser.newContext();
        const page = await context.newPage();

        await context.setExtraHTTPHeaders({
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json'
        });

        // await page.goto('https://github.com/login', { waitUntil: 'domcontentloaded' });
        // await page.goto('https://github.com/', { waitUntil: 'domcontentloaded' });

        await context.storageState({ path: AUTH_STATE_PATH });
        console.log('UI Storage State saved successfully via PAT authentication handshake!');
        }
    });

    test.use({ storageState: AUTH_STATE_PATH });

    test('TC001 - PAT authenticates the GitHub UI session', async ({ page }) => {
        test.skip(!username || username.trim().length === 0, 'GITHUB_USERNAME must be configured for UI validation.');

        await page.goto('https://github.com/', { waitUntil: 'domcontentloaded' });

        await expect(page, 'GitHub home page should load with a valid authenticated session.').toHaveURL(/github.com\//i, { timeout: 30000 });
        await expect(
        page.getByRole('link', { name: new RegExp(username!, 'i') }).first(),
        `Expected the authenticated GitHub username ${username} to be visible after PAT-based login.`
        ).toBeVisible({ timeout: 30000 });
        await expect(page.locator('body'), 'Authenticated page should include the signed-in account context.').toContainText(username!, { timeout: 30000 });
    });
   
    test('TC002 - Invalid PAT does not authenticate the GitHub UI', async ({ browser }) => {
        test.skip(!username || username.trim().length === 0, 'GITHUB_USERNAME must be configured for PAT invalid-auth validation.');

        const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
        const page = await context.newPage();

        await context.setExtraHTTPHeaders({
        Authorization: 'Bearer invalid_pat_value',
        Accept: 'application/vnd.github+json'
        });

        await page.goto('https://github.com/', { waitUntil: 'domcontentloaded' });

        await expect(page, 'GitHub homepage should load even with an invalid PAT, but it should not show the authenticated account.').toHaveURL(/github.com\//i, { timeout: 30000 });
        await expect(page.locator('body'), 'The invalid PAT should not render the signed-in GitHub username on the page.').not.toContainText(username!, { timeout: 30000 });
    });

    test('TC003 - Create Repository Flow', async ({ page }) => {
            
            //const dashboard = new DashboardPage(page); 
            await page.goto('/');
            await expect(page).toHaveTitle(/GitHub/i);

            const repository = new RepositoryPage(page);
            await repository.navigateToNewRepoFlow();        
            await repository.createNewRepositoryFromUI(repoName, 'Automation System create New repository Description');
    
        });

    test('TC004 - Profile: Visit profile; validate displayed user info', async ({ page }) => {
            test.skip(!username || username.trim().length === 0, 'GITHUB_USERNAME is not configured for this environment.');
    
            const profilePage = new ProfilePage(page);
            await profilePage.visitProfile(username!);
            await profilePage.validateDisplayedUserInfo(username!);
        });
    
        test('TC005 - Search for a public repository and verify results', async ({ page }) => {
            await page.goto('/search?q=playwright&type=repositories');
            await expect(page).toHaveURL(/\/search\?q=playwright&type=repositories/i);
    
            await expect(page.getByRole('heading', { name: /Search results/i })).toBeVisible();
            await expect(page.getByRole('link', { name: /microsoft\/playwright/i }).first()).toBeVisible();
            await expect(page.getByText('microsoft/playwright', { exact: true }).first()).toBeVisible();
        });

});
