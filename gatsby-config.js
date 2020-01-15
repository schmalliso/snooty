const { execSync } = require('child_process');
const userInfo = require('os').userInfo;
const { generatePathPrefix } = require('./src/utils/generate-path-prefix');

const runningEnv = process.env.NODE_ENV || 'production';

require('dotenv').config({
  path: `.env.${runningEnv}`,
});

const getGitBranch = () => {
  return execSync('git rev-parse --abbrev-ref HEAD')
    .toString('utf8')
    .replace(/[\n\r\s]+$/, '');
};

const metadata = {
  parserBranch: process.env.GATSBY_PARSER_BRANCH,
  project: process.env.GATSBY_SITE,
  snootyBranch: getGitBranch(),
  user: userInfo().username,
};

module.exports = {
  pathPrefix: generatePathPrefix(metadata),
  plugins: ['gatsby-plugin-react-helmet'],
  siteMetadata: {
    ...metadata,
    title: 'MongoDB Guides',
    user: userInfo().username,
    menuLinks: [
      {
        url: 'https://docs.mongodb.com/',
        text: 'Docs Home',
      },
      {
        url: 'https://docs.mongodb.com/',
        text: 'Documentation',
        open: true,
        children: [
          {
            url: 'https://docs.mongodb.com/manual/',
            text: 'MongoDB Server',
            textShort: 'Server',
            topNav: true,
            childSlugs: ['manual'],
          },
          {
            url: 'https://docs.mongodb.com/stitch/',
            text: 'MongoDB Stitch',
            topNav: false,
          },
          {
            url: 'https://docs.mongodb.com/ecosystem/drivers/',
            text: 'Drivers',
            open: false,
            topNav: true,
            childSlugs: ['ecosystem', 'node', 'ruby-driver', 'mongoid', 'php-library'],
            children: [
              {
                url: 'http://mongoc.org/libmongoc/current/',
                text: 'C',
              },
              {
                url: 'https://mongodb.github.io/mongo-cxx-driver/',
                text: 'C++11',
              },
              {
                url: 'https://docs.mongodb.com/ecosystem/drivers/csharp/',
                text: 'C#',
              },
              {
                url: 'http://mongodb.github.io/mongo-java-driver/',
                text: 'Java',
              },
              {
                url: 'https://mongodb.github.io/node-mongodb-native/',
                text: 'Node.js',
              },
              {
                url: 'https://docs.mongodb.com/ecosystem/drivers/perl/',
                text: 'Perl',
              },
              {
                url: 'https://docs.mongodb.com/ecosystem/drivers/php/',
                text: 'PHP',
              },
              {
                url: 'https://docs.mongodb.com/ecosystem/drivers/python/',
                text: 'Python',
              },
              {
                url: 'https://docs.mongodb.com/ecosystem/drivers/ruby/',
                text: 'Ruby',
              },
              {
                url: 'https://docs.mongodb.com/ecosystem/drivers/scala/',
                text: 'Scala',
              },
            ],
          },
          {
            url: 'https://docs.mongodb.com/cloud/',
            text: 'Cloud',
            open: true,
            topNav: true,
            childSlugs: ['mms', 'cloud', 'stitch', 'realm'],
            children: [
              {
                url: 'https://docs.atlas.mongodb.com/',
                text: 'MongoDB Atlas',
              },
              {
                url: 'https://docs.cloudmanager.mongodb.com/',
                text: 'MongoDB Cloud Manager',
              },
              {
                url: 'https://docs.opsmanager.mongodb.com/current/',
                text: 'MongoDB Ops Manager',
              },
            ],
          },
          {
            url: 'https://docs.mongodb.com/tools/',
            text: 'Tools',
            open: true,
            topNav: true,
            childSlugs: ['bi-connector', 'charts', 'compass', 'kubernetes-operator', 'spark-connector'],
            children: [
              {
                url: 'https://docs.mongodb.com/atlas-open-service-broker/current/',
                text: 'MongoDB Atlas Open Service Broker',
              },
              {
                url: 'https://docs.mongodb.com/bi-connector/current/',
                text: 'MongoDB BI Connector',
              },
              {
                url: 'https://docs.mongodb.com/charts/saas/',
                text: 'MongoDB Charts',
              },
              {
                url: 'https://docs.mongodb.com/compass/current/',
                text: 'MongoDB Compass',
              },
              {
                url: 'https://docs.mongodb.com/kubernetes-operator/stable/',
                text: 'MongoDB Enterprise Kubernetes Operator',
              },
              {
                url: 'https://docs.mongodb.com/kafka-connector/current/',
                text: 'MongoDB Kafka Connector',
              },
              {
                url: 'https://docs.mongodb.com/spark-connector/current/',
                text: 'MongoDB Spark Connector',
              },
            ],
          },
          {
            url: 'https://docs.mongodb.com/guides/',
            text: 'Guides',
            topNav: true,
            childSlugs: ['guides'],
          },
        ],
      },
      {
        url: 'https://www.mongodb.com/',
        text: 'Company',
      },
      {
        url: 'https://university.mongodb.com/',
        text: 'Learn',
      },
      {
        url: 'https://www.mongodb.com/community',
        text: 'Community',
      },
      {
        url: 'https://www.mongodb.com/what-is-mongodb',
        text: 'What is MongoDB',
      },
      {
        url: 'https://www.mongodb.com/download-center?jmp=docs',
        text: 'Get MongoDB',
      },
      {
        url: 'https://www.mongodb.com/contact?jmp=docs',
        text: 'Contact Us',
      },
    ],
  },
};
