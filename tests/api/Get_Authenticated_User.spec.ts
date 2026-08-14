import { test, expect } from '@playwright/test';
import process from 'process';

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'ravikumarkamisetty';
const GITHUB_PROFILE_URL=process.env.GITHUB_PROFILE_URL;
const user_url = process.env.GITHUB_API_USER_URL ? process.env.GITHUB_API_USER_URL : 'https://api.github.com/user';
const GIT_HUB_API_USER_PROFILE_URL = process.env.GITHUB_API_USER_PROFILE_URL ? process.env.GITHUB_API_USER_PROFILE_URL : 'https://api.github.com/users/ravikumarkamisetty';
//token
const token = process.env.GH_PAT;
test.skip('GET /user fetches authenticated GitHub user details for ravikumarkamisetty', async ({ request }) => {

  if (!token || !token.trim()) {
    const missingTokenMessage =
      'Missing GitHub PAT. Set GH_PAT before running this authenticated GitHub API test.';
    console.error(missingTokenMessage);
    throw new Error(missingTokenMessage);
  }

  const response = await request.get(user_url, {
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
    `Expected GitHub user API URL to be ${GIT_HUB_API_USER_PROFILE_URL}, but received ${user.url ?? 'undefined'}. Body: ${responseBody}`
  ).toBe(GIT_HUB_API_USER_PROFILE_URL);

  expect(
    user.html_url,
    `Expected GitHub profile URL to be ${GITHUB_PROFILE_URL}, but received ${user.html_url ?? 'undefined'}. Body: ${responseBody}`
  ).toBe(GITHUB_PROFILE_URL);

  console.log(
    `GitHub /user validated successfully for ${GITHUB_USERNAME}. login=${user.login}, type=${user.type}, id=${user.id}`
  );
});
