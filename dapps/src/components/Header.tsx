/*
 * Licensed to Incentum Ltd. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Incentum Ltd. licenses this file to you under
 * the Token Use License Version 1.0 and the Token Use
 * Clause (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of
 * the License at
 *
 *  https://github.com/incentum-network/tul/blob/master/LICENSE.md
 *  https://github.com/incentum-network/tul/blob/master/TUC.md
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react'
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native'
import { isAppLike } from '../utils'
import { incentumYellow, headerBackground } from '../constants/Colors'

export const Header = ({title, left, right, titleComponent, spinner}: {title: any, left?: any, right?: any, titleComponent?: any, spinner?: boolean}) => {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {left || <View />}
      </View>
      { titleComponent ? titleComponent : <Text style={styles.title}>{title}</Text>}
      <ActivityIndicator style={{marginLeft: 10}} size={40} animating={!!spinner} />
      <View style={styles.right}>
        {right || <View />}
      </View>
    </View>
  )
}

const statusMargin = isAppLike() ? 36 : 0

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    marginTop: statusMargin,
    paddingBottom: 10,
    paddingTop: 10, // statusMargin,
    backgroundColor: headerBackground,
    alignItems: 'center',
  },
  title: {
    color: incentumYellow,
    fontSize: 24,
    flexGrow: 2,
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    maxWidth: 400,
    justifyContent: 'center',
  },
  left: {
    marginLeft: 10,
    flexGrow: 1,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  right: {
    marginRight: 10,
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
})
