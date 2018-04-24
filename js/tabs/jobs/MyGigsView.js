// @flow
'use strict';

import React, {Component} from 'React';
import {
  View,
} from 'react-native';
import AppButton from '../../common/AppButton';
import PureListView from '../../common/PureListView';
import EmptyList from '../../common/EmptyList';
import EmailLoginModal from '../../login/EmailLoginModal';
import LoginButton from '../../common/LoginButton';
import AppColors from '../../common/AppColors';
import {createStylesheet} from '../../common/AppStyleSheet';
import JobCell from '../jobs/JobCell';
import {connect} from 'react-redux';
import { showJob } from '../../actions';

class MyGigsView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      emailModalVisible: false,
    };

    this.showEmailLogin = this.showEmailLogin.bind(this);
    this.hideEmailLogin = this.hideEmailLogin.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.showJobPage = this.showJobPage.bind(this);
    this.renderEmptyList = this.renderEmptyList.bind(this);
  }

  render() {
    return (
      <View style={styles.container}>
        <PureListView
          data={this.props.myGigs}
          renderEmptyList={this.renderEmptyList}
          renderRow={this.renderRow}
          renderSeparator={() => null}
          style={styles.listView}
          tabBarSpace={true}
        />
      </View>
    );
  }

  renderRow(job) {
    return (
      <JobCell
        key={job.id}
        job={job}
        navigator={this.props.navigator}
        showJobPage={this.showJobPage}
        markHaveGig={this.markHaveGig}
      />
    );
  }

  renderEmptyList() {
    let title, text, extras;
    if (!this.props.isLoggedIn) {
      extras = (
        <View>
          <LoginButton source="Info screen" />
          <EmailLoginModal modalVisible={this.state.emailModalVisible} hideEmailLoginModal={this.hideEmailLogin} />
          <AppButton
            style={styles.loginLinks}
            captionStyle={styles.loginLinkText}
            type="secondary"
            caption="Login with Email"
            source="Modal"
            onPress={() => this.showEmailLogin()}
          />
        </View>
      );
      title = 'No gigs found';
      text = 'Login to keep track of your gigs and write reviews for them.';
    } else {
      title = 'No gigs found';
      text = 'Looks like you don\'t have any gigs yet. When you get a new gig, indicate you have it in the gig list and it will show up here.';
    }
    return (
      <View style={{flex: 1}}>
        <EmptyList
          title={title}
          text={text}
        >
          {extras}
        </EmptyList>
      </View>
    );
  }

  showEmailLogin() {
    this.setState({emailModalVisible: true});
  }

  hideEmailLogin() {
    this.setState({emailModalVisible: false});
  }

  showJobPage(jobId) {
    if (jobId) {
      this.props.dispatch(showJob(jobId));
      this.props.navigator.push({ jobPage: true, jobId: jobId });
    }
  }
}

const styles = createStylesheet({
  container: {
    flex: 1,
  },
  listView: {
    padding: 10,
    backgroundColor: AppColors.tableViewBackground,
  },
  loginLinks: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  loginLinkText: {
    color: AppColors.inactiveText,
  },
  loginLink: {
    paddingHorizontal: 5,
  }
});

function select(store) {
  return {
    isLoggedIn: store.user.isLoggedIn,
    myGigs: store.user.gigs,
  };
}

module.exports = connect(select)(MyGigsView);
