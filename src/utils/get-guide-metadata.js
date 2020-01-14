const { getNestedValue } = require('./get-nested-value');
const { findKeyValuePair } = require('./find-key-value-pair');

// Get various metadata for a given page
const getGuideMetadata = pageNode => {
  const children = getNestedValue(['ast', 'children'], pageNode);
  const titleNode = getNestedValue([0, 'children', 0], children);
  return {
    title: getNestedValue(['children', 0, 'value'], titleNode),
    titleId: getNestedValue(['id'], titleNode),
    author: getNestedValue(['argument', 0, 'value'], findKeyValuePair(children, 'name', 'author')),
    category: getNestedValue(['argument', 0, 'value'], findKeyValuePair(children, 'name', 'category')),
    completionTime: getNestedValue(['argument', 0, 'value'], findKeyValuePair(children, 'name', 'time')),
    description: findKeyValuePair(children, 'name', 'result_description'),
    languages: findKeyValuePair(children, 'name', 'languages'),
  };
};

module.exports.getGuideMetadata = getGuideMetadata;
