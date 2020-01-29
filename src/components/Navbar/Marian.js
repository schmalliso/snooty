import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Link from '../Link';

// This does NOT include guides landing: we need a new design for how that
// should look
const setupAdapters = {
  manual: {
    rootElementSelector: '.main-column',
    pageContentSelector: '.document',
  },
  guides: {
    rootElementSelector: '.main-column',
    pageContentSelector: '.body',
  },
  landing: {
    rootElementSelector: '.main__content',
    pageContentSelector: '.main__cards',
  },
};

const decodeUrlParameter = uri => decodeURIComponent(uri.replace(/\+/g, '%20'));

const getSetupAdapter = () => {
  const property = document.body.getAttribute('data-project');
  if (property === 'landing' || property === 'guides') {
    return setupAdapters[property];
  }

  return setupAdapters.manual;
};

const generateQueryParams = (property, query = null) => {
  return `?searchProperty=${encodeURIComponent(property)}&query=${encodeURIComponent(query)}`;
};

class TabStrip extends Component {
  onClick = tab => {
    const { onClick } = this.props;
    onClick(tab);
  };

  render() {
    const { activeTab, tabs } = this.props;
    return (
      <ul className="tab-strip" role="tablist">
        {tabs.map(tab => (
          <li
            aria-selected={tab.id === activeTab}
            key={tab.label}
            className="tab-strip__element"
            role="tab"
            onClick={() => this.onClick(tab)}
          >
            {tab.label}
          </li>
        ))}
      </ul>
    );
  }
}

export class Marian {
  constructor(onresults, onerror) {
    this.currentRequest = null;
    this.onresults = onresults;
    this.onerror = onerror;
  }

  search(query, properties) {
    if (!query) {
      this.onresults({ results: null, spellingCorrections: {} }, query);
      return;
    }

    // Report on this search to Segment
    try {
      window.analytics.track('Search Queried', {
        query: query,
        searchProperties: properties.length > 0 ? properties : 'all',
      });
    } catch (err) {
      console.error(err);
    }

    // Make the search request
    if (this.currentRequest !== null) {
      this.currentRequest.abort();
    }
    const request = new XMLHttpRequest();
    this.currentRequest = request;
    let requestUrl = `https://marian.mongodb.com/search?q=${encodeURIComponent(query)}`;

    if (properties) {
      requestUrl += `&searchProperty=${encodeURIComponent(properties)}`;
    }

    request.open('GET', requestUrl);
    request.onreadystatechange = () => {
      if (request.readyState !== 4) {
        return;
      }

      this.currentRequest = null;

      if (!request.responseText) {
        if (request.status === 400) {
          this.onerror('Search request too long');
        } else if (request.status === 503) {
          this.onerror('Search server is temporarily unavailable');
        } else if (request.status !== 0) {
          this.onerror('Error receiving search results');
        }

        return;
      }

      const data = JSON.parse(request.responseText);
      this.onresults(data, query);
    };

    request.onerror = () => {
      this.onerror('Network error when receiving search results');
    };

    request.send();
  }
}

export class MarianUI extends Component {
  constructor(props) {
    super(props);
    const { defaultPropertiesLabel } = this.props;

    // We have three options to search: the current site, the current MongoDB manual,
    // and all properties.
    this.tabStripElements = [];
    let searchProperty = '';
    if (defaultPropertiesLabel) {
      this.tabStripElements.push({ id: 'current', label: `${defaultPropertiesLabel}` });

      if (!searchProperty) {
        searchProperty = 'current';
      }
    }

    if (!defaultPropertiesLabel || !defaultPropertiesLabel.match(/^MongoDB Manual/)) {
      this.tabStripElements.push({ id: 'manual', label: 'MongoDB Manual' });

      if (!searchProperty) {
        searchProperty = 'manual';
      }
    }

    this.tabStripElements.push({ id: 'all', label: 'All Results' });

    this.state = {
      searchProperty,
      error: false,
      results: [],
      spellingCorrections: {},
    };

    this.marian = new Marian(this.onSuccess, this.onError);
  }

  componentDidMount() {
    // Identify where the search results will be rendered on the page
    this.pageContentElement = null;
    const adapter = getSetupAdapter();
    this.rootElement = document.querySelector(adapter.rootElementSelector);
    const pageContentCandidate = document.querySelector(adapter.pageContentSelector);
    if (this.rootElement !== null && pageContentCandidate !== null) {
      this.pageContentElement = pageContentCandidate;
    } else if (!this.pageContentElement) {
      // If we can't find a page body, just use a dummy element
      this.pageContentElement = document.createElement('div');
    }

    this.props.onChangeQuery(this.parseUrl());
  }

  componentDidUpdate(prevProps) {
    if (this.props.query !== prevProps.query) {
      if (this.props.query !== '') {
        this.search();
        this.toggleContentVisibility(false);
      } else {
        this.toggleContentVisibility(true);
      }
    }
  }

  componentWillUnmount() {
    this.toggleContentVisibility(true);
  }

  toggleContentVisibility = showContent => {
    // Show/hide page content
    if (showContent) {
      this.pageContentElement.style.removeProperty('display');
    } else {
      this.pageContentElement.style.display = 'none';
    }
  };

  pushHistory = () => {
    const { query } = this.props;
    const locationSansQuery = window.location.href.replace(/\?[^#]*/, '');

    let newUrl = '';
    if (query) {
      newUrl = `${locationSansQuery}${generateQueryParams(this.state.searchProperty, query)}`;
    } else {
      newUrl = window.location.href;
    }

    // Only replaceState when changing query in URL, otherwise pushState
    if (newUrl.indexOf('&query=') >= 0 && window.location.href.indexOf('&query=') >= 0) {
      window.history.replaceState({ href: newUrl }, null, newUrl);
    } else if (newUrl !== window.location.href) {
      window.history.pushState({ href: newUrl }, null, newUrl);
    }
  };

  search() {
    const { defaultProperties, query } = this.props;
    this.pushHistory();

    let search = '';
    if (defaultProperties.length && this.state.searchProperty === 'current') {
      search = defaultProperties;
    } else if (this.state.searchProperty === 'manual') {
      search = 'manual-current';
    }

    this.marian.search(query, search);
  }

  parseUrl = () => {
    let locationSearchProperty = window.location.search.match(/searchProperty=([^&#]*)/);
    locationSearchProperty = locationSearchProperty !== null ? decodeUrlParameter(locationSearchProperty[1]) : '';
    if (locationSearchProperty) {
      this.setState({ searchProperty: locationSearchProperty });
    }

    const locationQuery = window.location.search.match(/query=([^&#]*)/);
    return locationQuery !== null ? decodeUrlParameter(locationQuery[1]) : '';
  };

  updateSearchProperty = tab => {
    // When user clicks on tab, update the property being searched
    this.setState(
      {
        searchProperty: tab.id,
      },
      () => {
        this.search();
      }
    );
  };

  onSuccess = data => {
    this.setState({ error: false, ...data });
  };

  onError = message => {
    this.setState({ error: message });
  };

  render() {
    const { query } = this.props;
    const { error, results, searchProperty, spellingCorrections } = this.state;

    const loading = Object.keys(spellingCorrections).length === 0 && results.length === 0 && !error;
    const pathSansQuery = window.location.pathname.replace(/\?[^#]*/, '');
    const spellingSuggestion = () =>
      Object.entries(spellingCorrections).map(([err, correction]) => (
        <li className="marian-result" key={err}>
          <Link
            to={`${pathSansQuery}${generateQueryParams(searchProperty, correction)}`}
            className="marian-spelling-correction"
          >
            Did you mean: {correction}
          </Link>
        </li>
      ));

    if (!query) {
      return null;
    }

    let resultList;
    if (error) {
      resultList = <li className="marian-result">{error}</li>;
    } else if (Object.keys(spellingCorrections).length > 0) {
      resultList = spellingSuggestion();
    } else {
      resultList = (
        <React.Fragment>
          {results.map(result => (
            <li className="marian-result" key={result.title}>
              <Link to={result.url} className="marian-title">
                {result.title}
              </Link>
              <div className="marian-preview">{result.preview}</div>
            </li>
          ))}
        </React.Fragment>
      );
    }

    return ReactDOM.createPortal(
      <div className="marian marian--shown">
        <div className="marian__heading">Search Results</div>
        <TabStrip activeTab={searchProperty} tabs={this.tabStripElements} onClick={this.updateSearchProperty} />
        {loading && <div className="spinner"></div>}
        <ul className="marian-results">{resultList}</ul>
      </div>,
      this.rootElement
    );
  }
}
