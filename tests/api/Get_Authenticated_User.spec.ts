import { test, expect } from '@playwright/test';
import process from 'process';

const GITHUB_USERNAME = 'ravikumarkamisetty';
const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;

test('GET /user fetches authenticated GitHub user details for ravikumarkamisetty', async ({ request }) => {
  const token = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;

  if (!token || !token.trim()) {
    const missingTokenMessage =
      'Missing GitHub PAT. Set GITHUB_PAT or GITHUB_TOKEN before running this authenticated GitHub API test.';
    console.error(missingTokenMessage);
    throw new Error(missingTokenMessage);
  }

  const response = await request.get('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    }
  });

  const statusCode = response.status();
  const responseHeaders = response.headers();
  const responseBody = await response.text();

  if (statusCode !== 200) {
    console.error(
      `GitHub /user request failed for ${GITHUB_USERNAME}. Status: ${statusCode} ${response.statusText()}. Headers: ${JSON.stringify(responseHeaders, null, 2)}. Response: ${responseBody}`
    );
  }

  expect(
    statusCode,
    `Expected GitHub /user to return 200 for ${GITHUB_USERNAME}, but got ${statusCode}. Response: ${responseBody}`
  ).toBe(200);

  const contentType = responseHeaders['content-type'] || '';
  expect(
    contentType,
    `Unexpected content-type received for GitHub /user: ${contentType}. Response: ${responseBody}`
  ).toContain('application/json');

  expect(
    responseHeaders['x-github-request-id'],
    `Missing GitHub request ID header. Response headers: ${JSON.stringify(responseHeaders, null, 2)}`
  ).toBeTruthy();

  const user = JSON.parse(responseBody);

  expect(user, `GitHub /user response is empty or invalid. Body: ${responseBody}`).toBeTruthy();
  expect(user).toHaveProperty('login');
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('node_id');
  expect(user).toHaveProperty('html_url');
  expect(user).toHaveProperty('url');
  expect(user).toHaveProperty('type');

  expect(
    user.login,
    `Expected GitHub login to be ${GITHUB_USERNAME}, but received ${user.login ?? 'undefined'}. Body: ${responseBody}`
  ).toBe(GITHUB_USERNAME);

  expect(
    user.type,
    `Expected GitHub account type to be User, but received ${user.type ?? 'undefined'}. Body: ${responseBody}`
  ).toBe('User');

  expect(
    user.url,
    `Expected GitHub user API URL to be https://api.github.com/users/${GITHUB_USERNAME}, but received ${user.url ?? 'undefined'}. Body: ${responseBody}`
  ).toBe(`https://api.github.com/users/${GITHUB_USERNAME}`);

  expect(
    user.html_url,
    `Expected GitHub profile URL to be ${GITHUB_PROFILE_URL}, but received ${user.html_url ?? 'undefined'}. Body: ${responseBody}`
  ).toBe(GITHUB_PROFILE_URL);

  console.log(
    `GitHub /user validated successfully for ${GITHUB_USERNAME}. login=${user.login}, type=${user.type}, id=${user.id}`
  );
});
