import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {

    private page: Page;
    private dashboardHeading: Locator;

    constructor(page: Page) 
    {
        this.page = page;
        this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
    }

    async verifyDashboardDisplayed() 
    {
        await expect(this.page).toHaveURL(/github.com/);
        await expect(this.dashboardHeading).toBeVisible();
    }


}