import { expect, Locator, Page } from '@playwright/test';

export class ProfilePage {
    private page: Page;

    private overviewTab: Locator;
    private repositoriesTab: Locator;
    private projectsTab: Locator;
    private packagesTab: Locator;
    private starsTab: Locator;
    private avatar: Locator;
    private profileHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        this.overviewTab = page.locator('a[data-tab-item="overview"]');
        this.repositoriesTab = page.locator('a[data-tab-item="repositories"]');
        this.projectsTab = page.locator('a[data-tab-item="projects"]');
        this.packagesTab = page.locator('a[data-tab-item="packages"]');
        this.starsTab = page.locator('a[data-tab-item="stars"]');

        this.avatar = page.locator('img.avatar-user');
        this.profileHeading = page.getByRole('heading', { name: /Popular repositories/i });
    }

    async visitProfile(username: string) {
        await this.page.goto(`/${username}`);
        await expect(this.page).toHaveURL(new RegExp(`https://github.com/${username}$`));
    }

    async validateDisplayedUserInfo(username: string) {
        await expect(this.overviewTab).toBeVisible();
        await expect(this.repositoriesTab).toBeVisible();
        await expect(this.projectsTab).toBeVisible();
        await expect(this.packagesTab).toBeVisible();
        await expect(this.starsTab).toBeVisible();

        await expect(this.avatar).toBeVisible();
        await expect(this.page.getByText(username, { exact: true }).first()).toBeVisible();
        await expect(this.profileHeading).toBeVisible();
    }
}
