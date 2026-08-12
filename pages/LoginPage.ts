import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {

    private page: Page;

    // Locators
    private loginHeading: Locator;
    private txtUsername: Locator;
    private txtPassword: Locator;
    private btnLogin: Locator;
    private dashboardHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        this.loginHeading = page.getByText('Sign in to GitHub');
        this.txtUsername = page.getByLabel('Username or email address', { exact: true });
        this.txtPassword = page.getByLabel('Password', { exact: true });
        this.btnLogin = page.getByRole('button', { name: 'Sign in', exact: true });
        this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
    }

    async navigateToApplication(appUrl: string) {
        await this.page.goto(appUrl);
        await expect(this.loginHeading).toBeVisible();
    }

    async login(username: string, password: string) {
        await this.txtUsername.fill(username);
        await expect(this.txtPassword, 'Password field should become editable after entering a username.').toBeEnabled({ timeout: 15000 });
        await this.txtPassword.fill(password);
        await this.btnLogin.click();
    }

    async verifySuccessfulLogin() {
        await expect(this.page).toHaveURL(/dashboard/);
        await expect(this.dashboardHeading).toBeVisible();
    }

}