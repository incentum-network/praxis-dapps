import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import Markdown from 'react-markdown'

const notLoggedIn = `
## Not authorized

It appears that you have been banned. Please contact Incentum for for more information.

Cheers, and thanks for the interest in Praxis.
`

export function NotLoggedIn(props) {
  return (
    <View style={{ marginLeft: 5, marginRight: 5, padding: 20, borderRadius: 5, backgroundColor: 'white' }}>
      <Markdown source={notLoggedIn} />
    </View>
  )
}
