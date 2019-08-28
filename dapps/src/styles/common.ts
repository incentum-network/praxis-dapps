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
import { StyleSheet } from 'react-native'
import { secondBaseColor, incentumYellow, markdownBackground, tabColor, rowSeparator, rowBackground, thirdBaseColor, OffWhite } from '../constants/Colors';
import { isMobileDevice, ScreenWidth } from '../utils';

export const styles = StyleSheet.create({
  row: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: secondBaseColor,
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: secondBaseColor,
  },
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: secondBaseColor,
  },
  content: {
    padding: 10,
    width: '100%',
    display: 'flex',
    alignSelf: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: secondBaseColor,
    minWidth: isMobileDevice ? ScreenWidth : 600,
    maxWidth: 700,
  },
  left: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '50%',
  },
  right: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '50%',
  },
  centered: {
    padding: 10,
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
  },
  activeTabs: {
    backgroundColor: incentumYellow,
  },
  markdown: {
    borderRadius: 10,
    backgroundColor: markdownBackground,
    paddingLeft: 20,
    paddingRight: 20,
    width: '100%',
  },
  tabs: {
    padding: 5,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: tabColor,
    color: incentumYellow,
    borderColor: incentumYellow,
  },
  tabText: {
    color: incentumYellow,
  },
  activeTabText: {
    color: 'black',
  },
  gridRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  accordRow: {
    borderBottomWidth: 1,
    borderBottomStyle: `solid`,
    borderBottomColor: `${rowSeparator}`,
  },
  headerText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  text: {
    // textAlign: 'center',
    fontSize: 16,
    color: 'white',
  },
  textLeft: {
    fontSize: 16,
    color: 'white',
    minWidth: 150,
  },
  textRight: {
    fontSize: 16,
    color: 'white',
    width: '100%',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  header: {
    backgroundColor: rowBackground,
    padding: 10,
  },
  active: {
    backgroundColor: thirdBaseColor,
  },
  inactive: {
    backgroundColor: thirdBaseColor,
  },
  address: {
    fontSize: 14,
    color: OffWhite,
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  subtitle: {
    fontSize: 14,
    color: OffWhite,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
})
