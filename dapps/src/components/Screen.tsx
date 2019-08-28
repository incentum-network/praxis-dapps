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
import { View } from 'react-native'
import { Header } from './Header'
import { ScreenWidth } from '../utils'
import { baseColor } from '../constants/Colors'

const Screen = ({ title, left, right, styles = { backgroundColor: baseColor}, titleComponent, children, spinner }: {title: any, left?: any, right?: any, styles?: any, titleComponent?: any, children: any, spinner?: boolean}) => (
  <React.Fragment>
    <Header title={title} left={left} right={right} titleComponent={titleComponent} spinner={spinner}/>
    <View
      style={[styles, {maxWidth: ScreenWidth, overflow: 'hidden'}]}
    >
      {children}
    </View>
  </React.Fragment>
)

export default Screen
