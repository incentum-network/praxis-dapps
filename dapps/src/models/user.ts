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
