require('dotenv').config({ path: './.env.production' });

const { execSync } = require('child_process');
const userInfo = require('os').userInfo;

const getGitBranch = () => {
  return execSync('git rev-parse --abbrev-ref HEAD')
    .toString('utf8')
    .replace(/[\n\r\s]+$/, '');
};

const gatsbyPrefix = `${process.env.GATSBY_SITE}/${userInfo().username}/${getGitBranch()}`;
const baseUrl = 'https://docs.mongodb.com';
export const defaultProdUrl = `${baseUrl}/${process.env.GATSBY_SITE}/${process.env.GATSBY_PARSER_BRANCH}`;
export const localUrl = `http://127.0.0.1:9000/${gatsbyPrefix}`;

export const getProdUrl = () => {
  const site = process.env.GATSBY_SITE;
  const branch = process.env.GATSBY_PARSER_BRANCH;
  if (site === 'manual') {
    const urlBranch = branch === 'master' ? 'manual' : branch;
    return `${baseUrl}/${urlBranch}`;
  }
  return defaultProdUrl;
};

/*
 * Replace characters to standardize between the two builders.
 * - Trim whitespace from beginning and end of each line (mostly affects codeblocks)
 * - Replace curly single quotes with straight single quotes
 * - Replace curly double quotes with straight double quotes
 * - Replace en dashes with double hyphens
 * - Replace ellipses with 3 periods
 * - Remove blank lines/whitespace
 * - Normalize versions of macOS downloads to 1.0
 */
export const cleanString = str => {
  const trimmedStrs = str
    .split('\n')
    .map(line => line.trim())
    .join('\n');
  return trimmedStrs
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace('–', '--')
    .replace(/\u2026/g, '...')
    .replace(/^\s*[\r\n]/gm, '')
    .replace(/tar -zxvf mongodb-macos-x86_64-([0-9]+).([0-9]+).tgz\n+/, 'tar -zxvf mongodb-macos-x86_64-1.0.tgz');
};

export const getPageText = async (page, bodyClass = '.body') => {
  const bodyElement = await page.$(bodyClass);
  return page.evaluate(element => Promise.resolve(element.innerText), bodyElement);
};

export const getPageLinks = async (page, baseUrl) => {
  return page.$$eval(
    '.body a',
    (as, url) => {
      return as.reduce((acc, a) => {
        // Ignore copy/copied buttons as these are very flaky to test
        if (a.text.trim() === 'copycopied') {
          return acc;
        }
        if (a.className === 'headerlink' || a.offsetWidth > 0 || a.offsetHeight > 0) {
          acc[a.text.trim()] = a.href
            .replace(url.replace('https://', 'http://'), '')
            .replace(url, '')
            .replace('https://', 'http://')
            .replace('/#', '#')
            .replace(/\/$/, '');
        }
        return acc;
      }, {});
    },
    baseUrl
  );
};

/*
 * Return the text that is displayed in a table of contents.
 * The class surrounding the TOC must be passed as an argument.
 */
export const getClassText = async (page, className) => {
  const tocElement = await page.$(className);
  return page.evaluate(element => Promise.resolve(element.innerText), tocElement);
};
