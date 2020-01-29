import React from 'react';
import { shallow } from 'enzyme';
import Navbar from '../../src/components/Navbar';
import { menuLinks } from '../../src/data/menuLinks';

it('renders correctly without browser', () => {
  const tree = shallow(<Navbar menuLinks={menuLinks} />);
  expect(tree).toMatchSnapshot();
});
