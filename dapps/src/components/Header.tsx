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
