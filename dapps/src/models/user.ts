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

import * as firebase from 'firebase'
import { createActionObject } from '../utils'
import { Model } from 'dva'

export interface UserModel {
    user: firebase.User
    loggedIn: boolean
    token: string
    unauthorize: boolean
}

interface UserAuth {
    authorize: boolean
    email: string
    unauthorize: boolean
}

const model: Model = {
    namespace: 'user',
    state: {
        user: {
            uid: 'WAKksqfN4ugh0kQPBlYZ33PiDSv2',
        },
        loggedIn: true,
        token: '',
        unauthorize: false,
    },
    reducers: {
        loggedIn(state: UserModel, { payload: { user, token }}): UserModel {
            return {
                ...state,
                loggedIn: true,
                user,
                token,
            }
        },
        unauthorize(state: UserModel, { payload: { user, token }}): UserModel {
            return {
                ...state,
                unauthorize: true,
                user,
                token,
            }
        },
    },
    effects: {
    },
    subscriptions: {
        async setup({ history, dispatch }) {
            /*
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                  const token = await user.getIdToken()
                  try {
                    const doc = await firebase.firestore().collection('users').doc(user.uid).get()
                    if (doc.exists) {
                        const auth: UserAuth | undefined = doc.data() as UserAuth
                        if (auth!.unauthorize) {
                            dispatch(createActionObject('unauthorize', { token, user }))
                            return
                        }
                    } else {
                        await firebase.firestore().collection('users').doc(user.uid).set({
                            email: user.email,
                        })
                    }
                    dispatch(createActionObject('loggedIn', { token, user }))
                } catch (e) {
                    console.log('firebase error: ', e)
                  }
                } else {
                  const provider = new firebase.auth.GoogleAuthProvider()
                  provider.addScope('profile')
                  provider.addScope('email')
                  firebase.auth().signInWithRedirect(provider)
                }
            })
            */
        },
    },
}

export default model
