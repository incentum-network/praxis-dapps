export interface SearchModel {
  loggedIn: boolean
}

export default {
  namespace: 'search',
  state: {
    loggedIn: false,
  },
  reducers: {},
  effects: {},
  subscriptions: {
    async setup({ history, dispatch }) {},
  },
}
