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
import { connect } from 'dva'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'

import { incentumYellow, baseColor } from '../constants/Colors'
import Screen from './Screen'
import { ContractModel, SaveContractAction } from '../models/contract'
import { createActionObject, createAction } from '../utils'
import { Ionicons } from 'react-web-vector-icons'
import { LedgerModel } from '../models/ledger'
import SegmentedControlTab from 'react-native-segmented-control-tab'
import { UserModel } from '../models/user'
import { NotLoggedIn } from './NotLoggedIn'
import { refreshButton } from '../commonComponents/HeaderButtons'

const styles = StyleSheet.create({
  activeTabs: {
    backgroundColor: incentumYellow,
  },
  tabs: {
    height: 40,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: baseColor,
    color: incentumYellow,
    borderColor: incentumYellow,
  },
  tabText: {
    paddingLeft: 10,
    paddingRight: 10,
    color: incentumYellow,
  },
  activeTabText: {
    color: 'black',
  },
  label: {
    color: '#222',
    fontSize: 16,
    paddingBottom: 5,
    paddingLeft: 1,
    alignItems: 'flex-start',
  },
  title: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: '#222',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '400',
  },
  add: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: '#222',
    fontSize: 16,
    fontWeight: '400',
  },
  subtitle: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: '#222',
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
  },
  small: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: '#222',
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 5,
    paddingRight: 5,
  },
})

interface FavoritesProps {
  contract: ContractModel
  ledger: LedgerModel
  user: UserModel
  dispatch: any
  history: any
}

export function FieldLabel(props) {
  return (
    <Text style={styles.label}>
      {props.label}
    </Text>
  )
}

class _Favorites extends React.Component<FavoritesProps> {

  public componentDidMount() {
    const { contract, dispatch } = this.props
    dispatch(createActionObject('contract/loadFavorites', { contract }))
  }

  public render() {
    const { contract, user, dispatch } = this.props
    const title = 'Favorites'

    return (
      <Screen
        title={title}
        left={ refreshButton(() => location.reload(true))}
        >
        {!user.unauthorize &&
        <View
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 10,
              paddingTop: 10,
            }}
          >
            <SegmentedControlTab
              values={['Favorites', 'History']}
              tabTextStyle={styles.tabText}
              tabStyle={styles.tabs}
              activeTabTextStyle={styles.activeTabText}
              activeTabStyle={styles.activeTabs}
              selectedIndex={contract.favoritesSegment}
              onTabPress={(favoritesSegment) => { dispatch(createActionObject('contract/changeFavoritesSegment', { favoritesSegment })) }}
            />
          </View>
          {contract.favoritesSegment === 0 &&
            contract.favorites.map((f, idx) => <SavedContractView view={f} dispatch={dispatch} isHistory={false} idx={idx}/>)
          }
          {contract.favoritesSegment === 1 &&
            contract.contractHistory.map((f, idx) => <SavedContractView view={f} dispatch={dispatch} isHistory={true} idx={idx}/>)
          }
        </View>
        }
        {user.unauthorize && <NotLoggedIn />}

      </Screen>
    )

  }
}

const SavedContractView = ({view, idx, dispatch, isHistory}: { view: SaveContractAction, idx: number, dispatch: any, isHistory: boolean}) => {
  return (
    <View style={{ paddingTop: 10, borderRadius: 5, backgroundColor: 'white', marginBottom: 10 }}>
    <TouchableOpacity
    onLongPress={() =>
        dispatch(createAction('contract/showContractAction', { result: view }))
    }
  >
      <Text style={styles.title}>{view.title}</Text>
      <Text style={styles.subtitle}>{view.subtitle}</Text>
      <Text style={styles.small}>{view.instance.instance}</Text>
      </TouchableOpacity>
      { isHistory ?
          <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 10,
            paddingTop: 10,
          }}
        >
      <TouchableOpacity
          onLongPress={() =>
            dispatch(
              createActionObject('contract/addToFavorites', { view })
            )
          }
        >
      <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 10,
            paddingRight: 10,
          }}
        >
          <View style={{ height: 30, justifyContent: 'center', marginLeft: 5, marginRight: 5 }}>
            <Ionicons
              name="ios-star"
              color={'#222'}
              size={30}
            />
          </View>
        <Text style={styles.add}>Add To Favorites</Text>
      </View>
      </TouchableOpacity>
      <TouchableOpacity
            onLongPress={() =>
              dispatch(
                createActionObject('contract/removeFromHistory', { idx })
              )
            }
          >
        <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 10,
            }}
          >
            <View style={{ height: 30, justifyContent: 'center', marginLeft: 5, marginRight: 5 }}>
              <Ionicons
                name="ios-trash"
                color={'#222'}
                size={30}
              />
            </View>
          <Text style={styles.add}>Remove</Text>
        </View>
        </TouchableOpacity>
      </View> :
      <TouchableOpacity
            onLongPress={() =>
              dispatch(
                createActionObject('contract/removeFromFavorites', { idx })
              )
            }
          >
        <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 10,
            }}
          >
            <View style={{ height: 30, justifyContent: 'center', marginLeft: 5, marginRight: 5 }}>
              <Ionicons
                name="ios-trash"
                color={'#222'}
                size={30}
              />
            </View>
          <Text style={styles.add}>Remove</Text>
        </View>
        </TouchableOpacity>
      }
    </View>
  )
}

const Favorites = connect((state) => ({ contract: state.contract, ledger: state.ledger, user: state.user }))(_Favorites)
export default Favorites
