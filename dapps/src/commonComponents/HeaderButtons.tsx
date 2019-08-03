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
