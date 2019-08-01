import { slugArray } from '../../src/regressionTestSetup';
import { cleanString, getPageText, localUrl, prodUrl } from './util';

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
    const [legacyText, snootyText] = await Promise.all([
      await getPageText(prodUrl, ''),
      await getPageText(localUrl, ''),
    ]);
    expect(cleanString(snootyText)).toEqual(cleanString(legacyText));
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
    const [legacyText, snootyText] = await Promise.all([await getPageText(prodPage), await getPageText(localPage)]);
    expect(cleanString(snootyText)).toEqual(cleanString(legacyText));
  });
});
