import { test, expect } from '@playwright/test';
import process from 'process';
import { AUTH_STATE_PATH } from '../../playwright.config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'ravikumarkamisetty';
const GITHUB_API_BASE_URL = process.env.GITHUB_API_BASE_URL || 'https://api.github.com';
const REPO_NAME_PREFIX = process.env.REPO_NAME_PREFIX || 'ui-api-delete-visibility';
const token = process.env.GH_PAT;

test.describe('Repository deleted via API should not be visible on UI', () => {
  test.use({ storageState: AUTH_STATE_PATH });

  test('Repo deleted through GitHub API is not visible in the GitHub UI', async ({ page, request }) => {
    test.skip(
      !token || !token.trim(),
      'Missing GitHub PAT. Set GH_PAT before running this authenticated GitHub API test.'
    );

    const repoName = `${REPO_NAME_PREFIX}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const repoFullName = `${GITHUB_USERNAME}/${repoName}`;

    const requestHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    };

    const createResponse = await request.post(`${GITHUB_API_BASE_URL}/user/repos`, {
      headers: requestHeaders,
      data: {
        name: repoName,
        description: 'Created via API and deleted to validate UI absence',
        private: false,
        auto_init: true
      }
    });

    const createStatus = createResponse.status();
    const createBody = await createResponse.text();

    if (createStatus !== 201) {
      console.error(
        `GitHub POST /user/repos failed while creating repository ${repoName}. Status: ${createStatus} ${createResponse.statusText()}. Response: ${createBody}`
      );
    }

    expect(
      createStatus,
      `Expected GitHub POST /user/repos to return 201 for repository ${repoName}, but got ${createStatus}. Response: ${createBody}`
    ).toBe(201);

    let createdRepo: any;
    try {
      createdRepo = JSON.parse(createBody);
    } catch (error) {
      throw new Error(
        `Invalid JSON response from GitHub POST /user/repos while creating repository ${repoName}. Response: ${createBody}`
      );
    }
    console.log(`Repository = ${createdRepo.full_name} created successfully via API.`);
    
    const repoLinkSelector = `a[href="/${createdRepo.full_name}"]`;

    await page.goto(`/${GITHUB_USERNAME}?tab=repositories`);
    await expect(page.locator(repoLinkSelector), `Repository ${createdRepo.full_name} was not visible in the user repositories list after creation.`).toBeVisible({ timeout: 30000 });

    const deleteResponse = await request.delete(`${GITHUB_API_BASE_URL}/repos/${repoFullName}`, {
      headers: requestHeaders
    });
    console.log('Request URL: ', deleteResponse.url());
    console.log('Delete URL', `${GITHUB_API_BASE_URL}/repos/${repoFullName}`);
   

    const deleteStatus = deleteResponse.status();
    const deleteBody = await deleteResponse.text();

  
    if (deleteStatus !== 204) {
      console.error(
        `GitHub DELETE /repos/${repoFullName} failed. Status: ${deleteStatus} ${deleteResponse.statusText()}. Response: ${deleteBody}`
      );
    }

    expect(
      deleteStatus,
      `Expected GitHub DELETE /repos/${repoFullName} to return 204, but got ${deleteStatus}. Response: ${deleteBody}`
    ).toBe(204);

    await page.goto(`/${GITHUB_USERNAME}?tab=repositories`);
    await expect(
      page.locator(repoLinkSelector),
      `Repository ${repoFullName} is still visible in the UI after API deletion.`
    ).toHaveCount(0, { timeout: 30000 });

    console.log(`GitHub UI verification passed: ${repoFullName} is no longer visible after deletion.`);
  });
 



});
