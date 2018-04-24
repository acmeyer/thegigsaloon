//@flow
'use strict';

import React, {Component} from 'React';
import {
  Image,
} from 'react-native';
import AppColors from './AppColors';

class CompanyLogo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  render() {
    const {job, size} = this.props;
    let uri = job.companyLogo;

    return (
      <Image
        source={{uri}}
        style={[{
          width: size,
          height: size,
        }, this.state.loading ? { backgroundColor: AppColors.gray } : {}]}
        onLoadStart={(e) => this.setState({loading: true})}
        onLoad={(e) => this.setState({loading: false})}
      />
    );
  }
}

module.exports = CompanyLogo;
