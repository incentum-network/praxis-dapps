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

import * as React from 'react'
import { View, TouchableOpacity } from 'react-native'
import Icon, { Ionicons } from 'react-web-vector-icons'
import colors, { incentumYellow } from '../constants/Colors'

export const addButton = (onPress) => (
  <TouchableOpacity onPress={onPress}>
    <View>
      <Ionicons
        name="ios-add-circle-outline"
        color={incentumYellow}
        size={40}
      />
    </View>
  </TouchableOpacity>
)

export const refreshButton = (onPress) => (
  <TouchableOpacity onPress={onPress}>
    <View>
      <Ionicons
        name="ios-refresh"
        color={incentumYellow}
        size={40}
      />
    </View>
  </TouchableOpacity>
)

export const searchButton = (onPress) => (
  <TouchableOpacity onPress={onPress}>
    <View>
      <Ionicons
        name="ios-search"
        color={incentumYellow}
        size={40}
      />
    </View>
  </TouchableOpacity>
)

export const cancelButton = (onPress) => (
  <TouchableOpacity onPress={onPress}>
    <View>
      <Ionicons
        name="ios-close-circle-outline"
        color={incentumYellow}
        size={40}
      />
    </View>
  </TouchableOpacity>
)

export const infoButton = (onPress) => (
  <TouchableOpacity onPress={onPress}>
    <View>
      <Ionicons
        name="ios-information-circle-outline"
        color={incentumYellow}
        size={40}
      />
    </View>
  </TouchableOpacity>
)

export const codeButton = (onPress) => (
  <TouchableOpacity onPress={onPress}>
    <View>
      <Ionicons
        name="ios-code"
        color={incentumYellow}
        size={40}
      />
    </View>
  </TouchableOpacity>
)

export const saveButton = (onPress) => (
  <TouchableOpacity onPress={onPress}>
    <View>
      <Ionicons
        name="ios-save"
        color={incentumYellow}
        size={40}
      />
    </View>
  </TouchableOpacity>
)

export const navButton = (onPress) => (
  <TouchableOpacity onPress={onPress}>
    <View>
      <Ionicons
        name="ios-menu"
        color={incentumYellow}
        size={40}
      />
    </View>
  </TouchableOpacity>
)
