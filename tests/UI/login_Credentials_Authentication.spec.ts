import { test, expect } from '@playwright/test';
import fs from 'fs';
import { AUTH_STATE_PATH } from '../../playwright.config';
import { LoginPage } from '../../pages/LoginPage';
import { RepositoryPage } from '../../pages/RepositoryPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { ProfilePage } from '../../pages/ProfilePage';

let repo: RepositoryPage;

const username = process.env.GITHUB_USERNAME;
const TOKEN = process.env.GITHUB_PAT;
const password = process.env.GITHUB_PASSWORD;
const repoName = process.env.repoName ?? 'Capstone-Project-Repo'; // Use a non-undefined fallback for repository name

test.describe('GitHub Login Tests', () => {
    test.beforeAll(async ({ playwright }) => {

        if (!fs.existsSync(AUTH_STATE_PATH)) {
            console.log('Generating UI Session Context using Personal Access Token...');
 
            // 1. Launch a headless browser and page context instance
            const browser = await playwright.chromium.launch();
            const context = await browser.newContext();
            const page = await context.newPage();
 
            // 2. Set the PAT token header into the browser context engine
            await context.setExtraHTTPHeaders({
                'Authorization': `Bearer ${TOKEN}`,
                'Accept': 'application/vnd.github+json'
            });
 
            // 3. Navigate to a GitHub endpoint that forces session cookie generation
            // This tricks the browser into mapping session cookies to github.com
            await page.goto('https://github.com/login');
                const loginPage = new LoginPage(page);
                
                //await loginPage.navigateToApplication(appUrl);
                await loginPage.login(username!, password!);
 
            // 4. Save the generated browser storage context state (Cookies + LocalStorage) to disk
            await context.storageState({ path: AUTH_STATE_PATH });
            console.log('UI Storage State saved successfully via PAT authentication handshake!');
        }
    });
  
    test.use({ storageState: AUTH_STATE_PATH });

    test('TC001 - Positive login with valid credentials', async ({ browser }) => {
        test.skip(!username || !password || username.trim().length === 0 || password.trim().length === 0,
            'GITHUB_USERNAME and GITHUB_PASSWORD must be configured for valid login testing.');

        const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
        const page = await context.newPage();
        const loginPage = new LoginPage(page);

        await loginPage.navigateToApplication('/login');
        await loginPage.login(username!, password!);

        await expect(page, 'User should be redirected away from the login page after a valid login attempt.').not.toHaveURL(/\/login/i, { timeout: 30000 });
        await expect(page.getByRole('link', { name: new RegExp(username!, 'i') }).first(), `Expected username link ${username} to be visible after successful login.`).toBeVisible({ timeout: 30000 });
        await expect(page.locator('body'), 'Authenticated page should include the user account area after a successful login.').toContainText(username!, { timeout: 30000 });
    });

    test('TC002 - Negative login with invalid credentials', async ({ browser }) => {
        test.skip(!username || username.trim().length === 0, 'GITHUB_USERNAME must be configured for invalid login testing.');

        const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
        const page = await context.newPage();
        const loginPage = new LoginPage(page);

        await loginPage.navigateToApplication('/login');
        await loginPage.login(username!, 'wrong_password_123');

        await expect(page, 'Invalid login should stop the user from being authenticated and should show a sign-in error state.').toHaveURL(/\/login|\/session/i, { timeout: 30000 });
        await expect(page.getByText(/Incorrect username or password|Please check your sign in details|Invalid login credentials/i), 'Expected GitHub to show an invalid credentials error message.').toBeVisible({ timeout: 30000 });
    });

    test('TC003 - Create Repository Flow', async ({ page }) => {
        
        const dashboard = new DashboardPage(page); 
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
