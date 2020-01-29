import React, { Component } from 'react';
import { StaticQuery, graphql } from 'gatsby';
import PropTypes from 'prop-types';
import { MarianUI } from './Marian';

class SearchBar extends Component {
  constructor(props) {
    super(props);

    const {
      data: {
        site: {
          siteMetadata: { parserBranch, project, title },
        },
      },
    } = this.props;

    // There are four supported configurations:
    // 1) No Marian
    // 2) data-project-title & data-search-properties are set
    // 3) data-project-title & data-search-properties are empty
    // 4) data-search-properties is not set, but data-project and data-branch are
    //
    // TODO: update to search multiple properties when landing pages are implemented
    let searchProperties = document.body.getAttribute('data-search-properties');
    let label = title;
    if (searchProperties === null) {
      const projectName = project;
      const projectBranch = parserBranch;
      searchProperties = `${projectName}-${projectBranch}`;

      if (label) {
        if (projectBranch && projectBranch !== 'master') {
          label += ` ${projectBranch}`;
        }
      }
    }

    this.state = { label, searchProperties, inputText: '', searchText: '', timeout: -1 };
  }

  onInput = event => {
    const { timeout } = this.state;
    const text = event.target.value;

    window.clearTimeout(timeout);

    // Submit search query after timeout once the user has stopped typing
    this.setState({
      inputText: text,
      timeout: window.setTimeout(() => {
        this.setState({ searchText: text });
      }, 250),
    });
  };

  render() {
    const { innerRef } = this.props;
    return (
      <React.Fragment>
        <input
          type="search"
          className="navbar-search"
          onChange={this.onInput}
          value={this.state.inputText}
          placeholder="Search Documentation"
          aria-label="Search Documentation"
          ref={innerRef}
        ></input>
        <MarianUI
          defaultProperties={this.state.searchProperties}
          defaultPropertiesLabel={this.state.label}
          onChangeQuery={newQuery => {
            window.clearTimeout(this.state.timeout);
            this.setState({
              inputText: newQuery,
              searchText: newQuery,
            });
          }}
          query={this.state.searchText}
        />
      </React.Fragment>
    );
  }
}

export default props => (
  <StaticQuery
    query={graphql`
      query {
        site {
          siteMetadata {
            parserBranch
            project
            title
          }
        }
      }
    `}
    render={data => <SearchBar data={data} {...props} />}
  />
);

SearchBar.propTypes = {
  innerRef: PropTypes.shape({
    // for server-side rendering, replace Element with an empty function
    current: PropTypes.instanceOf(typeof Element === 'undefined' ? () => {} : Element),
  }),
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        parserBranch: PropTypes.string.isRequired,
        project: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};
