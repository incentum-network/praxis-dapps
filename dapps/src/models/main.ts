export interface MainModel {
  loaded: boolean
}

export default {
  namespace: 'main',
  state: {
    loaded: false,
  },
  reducers: {
    loaded({state}: { state: MainModel}): MainModel {
      return {
        loaded: true,
      }
    },
  },
}
