import { slugArray } from '../regressionTestSetup';
import { cleanString, getPageText, localUrl, getProdUrl } from './util';

const prodUrl = getProdUrl();

describe('landing page', () => {
  let prodPage;
  let localPage;

  beforeAll(async () => {
    prodPage = await browser.newPage();
    localPage = await browser.newPage();
    await prodPage.goto(prodUrl);
    await localPage.goto(localUrl);
  });

  afterAll(async () => {
    await prodPage.close();
    await localPage.close();
  });

  it(`page text is the same`, async () => {
    const pageContents = await Promise.all([await getPageText(prodPage), await getPageText(localPage)]);
    const [legacyText, snootyText] = pageContents.map(content => cleanString(content));
    expect(snootyText).toEqual(legacyText);
  });
});

describe.each(slugArray)('%p', slug => {
  let prodPage;
  let localPage;

  beforeAll(async () => {
    prodPage = await browser.newPage();
    localPage = await browser.newPage();
    await prodPage.goto(`${prodUrl}/${slug}`);
    await localPage.goto(`${localUrl}/${slug}`);
  });

  afterAll(async () => {
    await prodPage.close();
    await localPage.close();
  });

  it(`page text is the same`, async () => {
    const pageContents = await Promise.all([await getPageText(prodPage), await getPageText(localPage)]);
    const [legacyText, snootyText] = pageContents.map(content => cleanString(content));
    expect(snootyText).toEqual(legacyText);
  });
});
