import { Page, Locator, expect } from '@playwright/test';

export class RepositoryPage {

    private page: Page;
    private repoNameInput: Locator;
    private newrepodescriptionInput: Locator;
    private createRepoSubmitBtn: Locator;

    constructor(page: Page) 
    {
        this.page = page;
        this.repoNameInput = page.locator('#repository-name-input');
        this.newrepodescriptionInput = page.getByRole('textbox', { name: 'Description'});
        this.createRepoSubmitBtn = page.getByRole('button', { name: 'Create repository'});
    }

    async navigateToNewRepoFlow() {
         await this.page.goto('/new');
         await expect(this.page).toHaveTitle(/New Repository/i);
    }

    async createNewRepositoryFromUI(name: string, desc: string) {
        //await this.step(`Fill Repository details for name: ${name}`, async () => {
        await this.repoNameInput.fill(name);
        await this.newrepodescriptionInput.fill(desc)
        //await this.initReadmeBtn.click();
        await this.createRepoSubmitBtn.click({ force: true, timeout: 5000 });
        //});
    } 
    async verifyRepositoryInitializedCleanly(repoName: string) {
        //await this.step(`Assert repo metadata and files for: ${repoName}`, async () => {
            // Fixed: Moved custom messages into expect()
            await expect(this.page, `FAILED: Browser context failed to redirect to target repository main URL landing page for: ${repoName}`).toHaveURL(new RegExp(`.*/${repoName}$`));
            //await expect(this.readmeFileLink, 'FAILED: Initialized file asset list failed to render structural README.md descriptor element file.').toBeVisible();
        //});
    }
 
}