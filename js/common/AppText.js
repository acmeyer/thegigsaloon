//@flow
'use strict';

import React from 'React';
import {
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import AppColors from './AppColors';

export function AppText({style, ...props}: Object): ReactElement {
  return <Text style={[styles.font, style]} {...props} />;
}

export function Heading1({style, ...props}: Object): ReactElement {
  return <Text style={[styles.font, styles.h1, style]} {...props} />;
}

export function Heading2({style, ...props}: Object): ReactElement {
  return <Text style={[styles.font, styles.h2, style]} {...props} />;
}

export function Heading3({style, ...props}: Object): ReactElement {
  return <Text style={[styles.font, styles.h3, style]} {...props} />;
}

export function Paragraph({style, ...props}: Object): ReactElement {
  return <Text style={[styles.font, styles.p, style]} {...props} />;
}

export function HelpText({style, ...props}: Object): ReactElement {
  return <Text style={[styles.font, styles.help, style]} {...props} />;
}

const scale = Dimensions.get('window').width / 375;

function normalize(size: number): number {
  return Math.round(scale * size);
}

const styles = StyleSheet.create({
  font: {
    fontFamily: require('../env').fontFamily,
  },
  h1: {
    fontSize: normalize(24),
    lineHeight: normalize(27),
    color: AppColors.darkText,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  h2: {
    fontSize: normalize(20),
    lineHeight: normalize(28),
  },
  h3: {
    fontSize: normalize(17),
    lineHeight: normalize(24),
  },
  p: {
    fontSize: normalize(15),
    lineHeight: normalize(23),
    color: AppColors.lightText,
  },
  help: {
    fontSize: normalize(12),
    lineHeight: normalize(17),
    color: AppColors.inactiveText,
  }
});
