import { test, expect } from '@playwright/test';
import process from 'process';
import { AUTH_STATE_PATH } from '../../playwright.config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'ravikumarkamisetty';
const GITHUB_API_BASE_URL = process.env.GITHUB_API_BASE_URL || 'https://api.github.com';
const REPO_NAME_PREFIX = process.env.REPO_NAME_PREFIX || 'ui-api-visibility';
const token = process.env.GH_PAT;

test.describe('Repository created via API should appear on UI', () => {
  test.use({ storageState: AUTH_STATE_PATH });

  test('Repo created through GitHub API is visible in the GitHub UI', async ({ page, request }) => {
    test.skip(
      !token || !token.trim(),
      'Missing GitHub PAT. Set GH_PAT before running this authenticated GitHub API test.'
    );

    const repoName = `${REPO_NAME_PREFIX}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const repoPayload = {
      name: repoName,
      description: 'Created via GitHub API and validated on the UI',
      private: false,
      auto_init: true
    };

    const requestHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    };

    const createResponse = await request.post(`${GITHUB_API_BASE_URL}/user/repos`, {
      headers: requestHeaders,
      data: repoPayload
    });

    const createStatus = createResponse.status();
    const createResponseBody = await createResponse.text();

    if (createStatus !== 201) {
      console.error(
        `GitHub POST /user/repos failed while creating repository ${repoName}. Status: ${createStatus} ${createResponse.statusText()}. Response: ${createResponseBody}`
      );
    }

    expect(
      createStatus,
      `Expected GitHub POST /user/repos to return 201 for repository ${repoName}, but got ${createStatus}. Response: ${createResponseBody}`
    ).toBe(201);

    let createdRepo: any;
    try {
      createdRepo = JSON.parse(createResponseBody);
    } catch (error) {
      throw new Error(
        `Invalid JSON response from GitHub POST /user/repos while creating repository ${repoName}. Response: ${createResponseBody}`
      );
    }

    const repoFullName = createdRepo.full_name;
    const repoLinkSelector = `a[href="/${repoFullName}"]`;

    await page.goto(`/${GITHUB_USERNAME}?tab=repositories`);
    await expect(page.locator(repoLinkSelector), `Repository ${repoFullName} did not appear on the GitHub repositories list UI.`).toBeVisible({ timeout: 30000 });

    await page.goto(`/${repoFullName}`);
    await expect(page, `Repository ${repoFullName} did not load successfully after creation.`).toHaveURL(new RegExp(`/${repoName}$`), { timeout: 30000 });
    await expect(page.locator('h1'), `Repository page for ${repoFullName} did not render the expected page title.`).toContainText(repoName, { timeout: 30000 });

    console.log(`GitHub UI verification passed: ${repoFullName} is visible in the repositories list and repository page.`);

    
  });
});
