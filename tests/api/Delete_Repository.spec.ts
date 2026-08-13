import { test, expect } from '@playwright/test';
import process from 'process';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_USERNAME = 'ravikumarkamisetty';
const REPO_NAME = 'test';

test('DELETE /repos/{ravikumarkamisetty}/{test} deletes the repository', async ({ request }) => {
  const token = process.env.GH_PAT;

  if (!token || !token.trim()) {
    const missingTokenMessage =
      'Missing GitHub PAT. Set GH_PAT before running this authenticated GitHub API test.';
    console.error(missingTokenMessage);
    throw new Error(missingTokenMessage);
  }

  const repoUrl = `${GITHUB_API_BASE_URL}/repos/${GITHUB_USERNAME}/${REPO_NAME}`;

  const requestHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json'
  };

  const response = await request.delete(repoUrl, {
    headers: requestHeaders
  });

  const statusCode = response.status();
  const responseHeaders = response.headers();
  const responseBody = await response.text();

  if (statusCode !== 204) {
    console.error(
      `GitHub DELETE /repos/${GITHUB_USERNAME}/${REPO_NAME} failed. Status: ${statusCode} ${response.statusText()}. Headers: ${JSON.stringify(responseHeaders, null, 2)}. Response: ${responseBody}`
    );
  }

  expect(
    statusCode,
    `Expected GitHub DELETE /repos/${GITHUB_USERNAME}/${REPO_NAME} to return 204, but got ${statusCode}. Response: ${responseBody}`
  ).toBe(204);

  const contentType = responseHeaders['content-type'] || '';
  expect(
    contentType,
    `Unexpected content-type received for GitHub DELETE /repos/${GITHUB_USERNAME}/${REPO_NAME}: ${contentType}. Response: ${responseBody}`
  ).toBe('');

  expect(
    responseHeaders['x-github-request-id'],
    `Missing GitHub request ID header for DELETE /repos/${GITHUB_USERNAME}/${REPO_NAME}. Response headers: ${JSON.stringify(responseHeaders, null, 2)}`
  ).toBeTruthy();

  expect(
    responseBody,
    `Expected empty response body for successful repository deletion, but received: ${responseBody}`
  ).toBe('');

  console.log(
    `GitHub DELETE /repos/${GITHUB_USERNAME}/${REPO_NAME} validated successfully. Status: ${statusCode} No Content.`
  );
});
