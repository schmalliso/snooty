import { DEPLOYMENTS, stringifyTab } from '../../src/constants';
import { slugArray } from '../../src/regressionTestSetup';
import { cleanString, getClassText, getPageLinks, getPageText, localUrl } from './util';

require('dotenv').config({ path: './.env.production' });

const prodUrl = `https://docs.mongodb.com/${process.env.GATSBY_SITE}`;

const defaultStorageObj = {
  cloud: 'cloud',
  drivers: 'shell',
  platforms: 'windows',
};

const driverToLang = {
  'java-sync': 'javasync',
};

const convertToLegacy = string => {
  return driverToLang[string] || string;
};

const guidesLanguages = ['shell', 'compass', 'python', 'java-sync', 'nodejs', 'motor', 'csharp', 'motor', 'go'];
const guidesPlatforms = ['windows', 'macos', 'linux'];

/*
 * Remove discrepancies we have found with the old build system.
 * - Remove an admonition that was appearing when 'cloud' deployment was selected, even though it should only show during 'local'
 * - Prettify pill selection at the top of the page to match our implementation in Snooty
 */
const cleanOldString = str => {
  let strWithoutAdmonition = str;
  if (str.includes('Deployment Type: cloud')) {
    strWithoutAdmonition = str.replace(
      'Enable Auth on your local instance of MongoDB.\n\nWARNING\n\nIf you are running MongoDB locally and have not enabled authentication, your MongoDB instance is not secure.',
      ''
    );
  }
  return strWithoutAdmonition
    .replace(/Deployment Type: \w+/gi, word => {
      const words = word.split(':');
      const choice = stringifyTab(words[1].trim());
      return `${words[0]}: ${choice}`;
    })
    .replace(/Client: \w+/gi, word => {
      const words = word.split(':');
      const choice = stringifyTab(words[1].trim());
      return `${words[0]}: ${choice}`;
    });
};

/*
 * Remove errors in the old build system
 * - The correct command is sometimes not provided for Windows executables
 */
const cleanStringByPlatform = (str, platform) => {
  let cleanStr = str;
  if (platform === 'windows') {
    cleanStr = str.replace('mongo mongodb+srv', 'mongo.exe mongodb+srv');
  } else {
    cleanStr = str.replace('mongo.exe mongodb+srv', 'mongo mongodb+srv');
  }
  return cleanOldString(cleanStr);
};

/*
 * Remove errors in the old build system
 * - Migration Support should not have been rendered as a primary section, so we should not expect to find it in Snooty's TOC
 * - Remove resulting blank lines
 */
const cleanOldTOC = str => {
  return str.replace(/Migration Support/g, '').replace(/^\s*[\r\n]/gm, '');
};

const clickPills = async (page, slug, { cloud, drivers, platforms }) => {
  if (page.url().includes(localUrl)) platforms = convertToLegacy(platforms);
  if (slug) {
    await page.click(`li[data-tabid="${cloud}"]`).catch(() => {});
    await page.click(`li[data-tabid="${drivers}"]`).catch(() => {});
    await page.click(`li[data-tabid="${platforms}"]`).catch(() => {});
  }
};

// Don't include links in an admonition that is incorrectly shown when "Cloud" is selected on prod
const removeEnableAuthLink = (hrefObj, storageObj, slug) => {
  if (storageObj.cloud === 'cloud' && slug.includes('server')) {
    delete hrefObj['Enable Auth']; // eslint-disable-line no-param-reassign
  }
  return hrefObj;
};

const getTargetClass = slug => (slug ? '.body' : 'guide-category-list');

const runComparisons = async (slug, storageObj = defaultStorageObj) => {
  const key = Object.keys(storageObj)[0];
  const val = Object.values(storageObj)[0];
  return Promise.all([
    getPageText(
      prodUrl,
      slug,
      {
        ...defaultStorageObj,
        [key]: convertToLegacy(val),
      },
      getTargetClass,
      clickPills
    ),
    getPageText(
      localUrl,
      slug,
      {
        ...defaultStorageObj,
        ...storageObj,
      },
      getTargetClass,
      clickPills
    ),
  ]);
};

describe('landing page', () => {
  it(`file text is the same`, async () => {
    expect.assertions(1);

    const [legacyText, snootyText] = await runComparisons('');
    return expect(snootyText).toEqual(legacyText);
  });
});

describe('with default tabs', () => {
  describe.each(slugArray)('%p', slug => {
    let prodPage;
    let localPage;

    beforeAll(async () => {
      prodPage = await browser.newPage();
      localPage = await browser.newPage();
      await prodPage.goto(`${prodUrl}/${slug}`);
      await localPage.goto(`${localUrl}/${slug}`);
      await clickPills(prodPage, slug, defaultStorageObj);
      await clickPills(localPage, slug, defaultStorageObj);
    });

    it(`file text is the same`, async () => {
      expect.assertions(1);

      const [legacyText, snootyText] = await runComparisons(slug);
      return expect(cleanString(snootyText)).toEqual(cleanString(cleanOldString(legacyText)));
    });

    it(`table of contents labels are the same`, async () => {
      const tocClass = '.left-toc';
      const [oldTOC, newTOC] = await Promise.all([
        await getClassText(prodUrl, slug, tocClass),
        await getClassText(localUrl, slug, tocClass),
      ]);
      expect(newTOC).toEqual(cleanOldTOC(oldTOC));
    });

    it(`links are the same`, async () => {
      const [oldLinks, newLinks] = await Promise.all([
        await getPageLinks(prodPage, prodUrl),
        await getPageLinks(localPage, localUrl),
      ]);
      expect(newLinks).toEqual(removeEnableAuthLink(oldLinks, defaultStorageObj, slug));
    });
  });
});

describe('with local storage', () => {
  describe.each(slugArray)('%p', slug => {
    let prodPage;
    let localPage;

    beforeAll(async () => {
      prodPage = await browser.newPage();
      localPage = await browser.newPage();
      await prodPage.goto(`${prodUrl}/${slug}`);
      await localPage.goto(`${localUrl}/${slug}`);
    });

    describe.each(DEPLOYMENTS)('deployment: %p', deployment => {
      const storageObj = { ...defaultStorageObj, cloud: deployment };

      beforeAll(async () => {
        await clickPills(prodPage, slug, storageObj);
        await clickPills(localPage, slug, storageObj);
      });

      it(`deployment file text is the same`, async () => {
        const [legacyText, snootyText] = await runComparisons(slug, {
          cloud: deployment,
        });
        return expect(cleanString(snootyText)).toEqual(cleanString(cleanOldString(legacyText)));
      }, 1500000);

      it(`deployment links are the same`, async () => {
        const [oldLinks, newLinks] = await Promise.all([
          await getPageLinks(prodPage, prodUrl),
          await getPageLinks(localPage, localUrl),
        ]);
        expect(newLinks).toEqual(removeEnableAuthLink(oldLinks, storageObj, slug));
      });
    });

    describe.each(guidesLanguages)('language: %p', language => {
      const storageObj = { ...defaultStorageObj, drivers: language };

      beforeAll(async () => {
        await clickPills(prodPage, slug, storageObj);
        await clickPills(localPage, slug, storageObj);
      });

      it(`language file text is the same`, async () => {
        const [legacyText, snootyText] = await runComparisons(slug, {
          drivers: language,
        });
        return expect(cleanString(snootyText)).toEqual(cleanString(cleanOldString(legacyText)));
      }, 1500000);

      it.only(`language links are the same`, async () => {
        const [oldLinks, newLinks] = await Promise.all([
          await getPageLinks(prodPage, prodUrl),
          await getPageLinks(localPage, localUrl),
        ]);
        expect(newLinks).toEqual(removeEnableAuthLink(oldLinks, storageObj, slug));
      });
    });

    describe.each(guidesPlatforms)('platform: %p', platform => {
      const storageObj = { ...defaultStorageObj, platforms: platform };

      beforeAll(async () => {
        await clickPills(prodPage, slug, storageObj);
        await clickPills(localPage, slug, storageObj);
      });

      it(`platform file text is the same`, async () => {
        const [legacyText, snootyText] = await runComparisons(slug, {
          platforms: platform,
        });
        return expect(cleanString(snootyText)).toEqual(cleanString(cleanStringByPlatform(legacyText, platform)));
      }, 1500000);

      it(`platform links are the same`, async () => {
        const [oldLinks, newLinks] = await Promise.all([
          await getPageLinks(prodPage, prodUrl),
          await getPageLinks(localPage, localUrl),
        ]);
        expect(newLinks).toEqual(removeEnableAuthLink(oldLinks, storageObj, slug));
      });
    });
  });
});
