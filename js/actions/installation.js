// @flow
'use strict';

import DeviceInfo from 'react-native-device-info';

const Platform = require('Platform');
const Parse = require('parse/react-native');

async function currentInstallation(): Promise<Parse.Installation> {
  const installationId = await Parse._getInstallationId();
  return new Parse.Installation({
    installationId,
    appName: 'The Gig Saloon',
    deviceType: Platform.OS,
    appIdentifier: DeviceInfo.getBundleId(),
  });
}

async function updateInstallation(updates: Object = {}): Promise<void> {
  const installation = await currentInstallation();
  await installation.save(updates);
}

module.exports = { currentInstallation, updateInstallation };
