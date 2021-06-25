import React, { version } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Option, Select, Size } from '@leafygreen-ui/select';
import { navigate as reachNavigate } from '@reach/router';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import { generatePathPrefix } from '../utils/generate-path-prefix';
import { normalizePath } from '../utils/normalize-path';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';


const zip = (a, b) => {
  // Zip arrays a and b into an object where a is used for keys and b for values
  const shorter = a.length > b.length ? b : a;
  const dict = {};
  shorter.forEach((key, i) => (dict[a[i]] = b[i]));
  return dict;
};

const StyledSelect = styled(Select)`
  margin: 8px 12px 12px 22px;

  span {
    font-size: 16px;
  }

  button {
    z-index: 2;
  }
`;

const OptionLink = styled('a')`
  color: unset;

  :hover {
    color: unset;
    text-decoration: none;
  }
`;

const VersionDropdown = ({
  publishedBranches: {
    version: { published, active },
    git: {
      branches: { published: gitBranches },
    },
  },
  repo_branches,
  slug,
}) => {
  const siteMetadata = useSiteMetadata();
  const { parserBranch, pathPrefix, project, snootyEnv } = siteMetadata;

  // YOU HAVE THE DATA, NOW YOU MUST USE THE DATA

  const versionLabel = (versionSelectorLabel, urlSlug, gitBranchName) => {
    // Display value of versionSelectorLabel if it's set
    if (versionSelectorLabel !== undefined) {
      return `${versionSelectorLabel}`;
    }

    const isNumeric = (version = '') => {
      const [firstWord] = version.split();
      return !isNaN(firstWord);
    };

    // Display as Version X on menu if numeric version (based on the urlSlug field).
    if (urlSlug !== undefined) {
      return `${isNumeric(urlSlug) ? 'Version ' : ''}${urlSlug}`;
    }
    // Display as Version X on menu if numeric version (based on the gitBranchName field).
    else {
      return `${isNumeric(gitBranchName) ? 'Version ' : ''}${gitBranchName}`;
    }
  }

  // Zip two sections of data to map git branches to their "pretty" names
  // const gitNamedMapping = zip(gitBranches, active);

  // Zip two sections of data to map git branches to their "pretty" names
  const gitNamedMappingOLD = zip(gitBranches, active);
  console.log(gitNamedMappingOLD);

  const gitNamedMapping = (branches = []) => {
    const branchNameToLabel = []
    branches.forEach(branch => {
      const branchName = branch['gitBranchName'];
      const UIlabel=versionLabel(branch['versionSelectorLabel'], branch['urlSlug'], branch['gitBranchName']);
      branchNameToLabel.push({branchName: UIlabel})
    });
    console.log(branchNameToLabel);
    return branchNameToLabel
  };

  // Don't render dropdown if there is only 1 version of the repo
  if (branchList.length <= 1) {
    return null;
  }

  const generatePrefix = (version) => {
    // Manual is a special case because it does not use a path prefix (found at root of docs.mongodb.com)
    const isManualProduction = project === 'docs' && snootyEnv === 'production';
    if (isManualProduction) {
      return `/${version}`;
    }

    // For production builds, append version after project name
    if (pathPrefix) {
      const noVersion = pathPrefix.substr(0, pathPrefix.lastIndexOf('/'));
      return `${noVersion}/${version}`;
    }

    // For staging, replace current version in dynamically generated path prefix
    return generatePathPrefix({ ...siteMetadata, parserBranch: version });
  };

  const getUrl = (value) => {
    const legacyDocsURL = `https://docs.mongodb.com/legacy/?site=${project}`;
    return value === 'legacy' ? legacyDocsURL : normalizePath(`${generatePrefix(value)}/${slug}`);
  };

  const navigate = (value) => {
    const destination = getUrl(value);
    reachNavigate(destination);
  };

  return (
    <StyledSelect
      allowDeselect={false}
      aria-labelledby="View a different version of documentation."
      onChange={navigate}
      placeholder={null}
      size={Size.Large}
      usePortal={false}
      popoverZIndex={3}
      value={parserBranch}
    >
      {Object.entries(gitNamedMappingOLD).map(([branch, name]) => {
        const url = getUrl(branch);
        return (
          <Option key={branch} value={branch}>
            <OptionLink href={url}>{name}</OptionLink>
          </Option>
        );
      })}
      {published.length > active.length && (
        <Option value="legacy">
          <OptionLink href={getUrl('legacy')}>Legacy Docs</OptionLink>
        </Option>
      )}
    </StyledSelect>
  );
};

VersionDropdown.propTypes = {
  publishedBranches: PropTypes.shape({
    version: PropTypes.shape({
      published: PropTypes.arrayOf(PropTypes.string).isRequired,
      active: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    git: PropTypes.shape({
      branches: PropTypes.shape({
        published: PropTypes.arrayOf(PropTypes.string).isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  slug: PropTypes.string.isRequired,
};

export default VersionDropdown;
