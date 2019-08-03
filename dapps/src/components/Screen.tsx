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
