import { test, expect } from '@playwright/test';
import process from 'process';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const GITHUB_API_BASE_URL = 'https://api.github.com';
const REPO_NAME_PREFIX = 'playwright-repo';

test('POST /user/repos creates a GitHub repository for the authenticated user', async ({ request }) => {
  const token = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;

  if (!token || !token.trim()) {
    const missingTokenMessage =
      'Missing GitHub PAT. Set GITHUB_PAT or GITHUB_TOKEN before running this authenticated GitHub API test.';
    console.error(missingTokenMessage);
    throw new Error(missingTokenMessage);
  }

  const repoName = `${REPO_NAME_PREFIX}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const repoPayload = {
    name: repoName,
    description: 'Repository created by Playwright API test',
    private: false,
    auto_init: true
  };

  const requestHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json'
  };

  let createdRepo: any = null;

  try {
    const response = await request.post(`${GITHUB_API_BASE_URL}/user/repos`, {
      headers: requestHeaders,
      data: repoPayload
    });

    const statusCode = response.status();
    const responseHeaders = response.headers();
    const responseBody = await response.text();

    if (statusCode !== 201) {
      console.error(
        `GitHub POST /user/repos failed while creating repository ${repoName}. Status: ${statusCode} ${response.statusText()}. Headers: ${JSON.stringify(responseHeaders, null, 2)}. Response: ${responseBody}`
      );
    }

    expect(
      statusCode,
      `Expected GitHub POST /user/repos to return 201 for repository ${repoName}, but got ${statusCode}. Response: ${responseBody}`
    ).toBe(201);

    const contentType = responseHeaders['content-type'] || '';
    expect(
      contentType,
      `Unexpected content-type received for GitHub POST /user/repos: ${contentType}. Response: ${responseBody}`
    ).toContain('application/json');

    expect(
      responseHeaders['x-github-request-id'],
      `Missing GitHub request ID header for POST /user/repos. Response headers: ${JSON.stringify(responseHeaders, null, 2)}`
    ).toBeTruthy();

    expect(
      responseHeaders.location,
      `Missing Location header for created repository ${repoName}. Response headers: ${JSON.stringify(responseHeaders, null, 2)}`
    ).toBeTruthy();

    let repo: any;
    try {
      repo = JSON.parse(responseBody);
    } catch (error) {
      throw new Error(
        `Invalid JSON response from GitHub POST /user/repos while creating repository ${repoName}. Response: ${responseBody}`
      );
    }

    createdRepo = repo;

    expect(repo, `GitHub POST /user/repos returned empty or invalid body. Response: ${responseBody}`).toBeTruthy();
    expect(repo).toHaveProperty('id');
    expect(repo).toHaveProperty('name');
    expect(repo).toHaveProperty('full_name');
    expect(repo).toHaveProperty('private');
    expect(repo).toHaveProperty('html_url');
    expect(repo).toHaveProperty('clone_url');
    expect(repo).toHaveProperty('owner');
    expect(repo.owner).toHaveProperty('login');

    expect(
      repo.name,
      `Expected created repository name to be ${repoName}, but received ${repo.name ?? 'undefined'}. Response: ${responseBody}`
    ).toBe(repoName);

    expect(
      repo.full_name,
      `Expected created repository full_name to be ${repo.owner.login}/${repoName}, but received ${repo.full_name ?? 'undefined'}. Response: ${responseBody}`
    ).toBe(`${repo.owner.login}/${repoName}`);

    expect(
      repo.private,
      `Expected created repository to be public, but received ${repo.private}. Response: ${responseBody}`
    ).toBe(false);

    expect(
      repo.html_url,
      `Expected created repository HTML URL to be https://github.com/${repo.owner.login}/${repoName}, but received ${repo.html_url ?? 'undefined'}. Response: ${responseBody}`
    ).toBe(`https://github.com/${repo.owner.login}/${repoName}`);

    expect(
      repo.clone_url,
      `Expected created repository clone URL to be https://github.com/${repo.owner.login}/${repoName}.git, but received ${repo.clone_url ?? 'undefined'}. Response: ${responseBody}`
    ).toBe(`https://github.com/${repo.owner.login}/${repoName}.git`);

    console.log(
      `GitHub POST /user/repos validated successfully. Repository ${repo.full_name} created with id=${repo.id}.`
    );
} finally {
     console.log('Post is successful');
    }
});
