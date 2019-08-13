import { Ledger, LedgerModel, getLedger, Tag, getDefaultLedger, findLedger, checkMnemonic, ledgerReady } from './ledger'
import { Model } from 'dva'
import {
  TemplateJson,
  ReducerJson,
  SchemasJson,
  ActionJson,
  hashJson,
  InputJson,
  inputFromOutput,
  ContractJson,
  OutputJson,
  GetContractFromInstancePayload,
  GetContractFromActionPayload,
  MatchSchemasPayload,
  InstanceSearchPayload,
  ContractActionPayload,
  ContractStartPayload,
  ContractSearchPayload,
  ContractResult,
  MatchSchemasResult,
  SignatureJson,
  OutputToAccountPayload,
  toTemplateJson,
  toContractJson,
} from '@incentum/praxis-interfaces'

import {
  txContractAction,
  txContractFromInstance,
  txContractFromAction,
  txContractStart,
  txMatchSchemas,
  txContractSearch,
  txInstanceSearch,
  IPraxisResult,
  IWalletTemplate,
  signInputs,
  txOutputToAccount,
  success,
  statusMessage,
  setNetwork
} from '@incentum/praxis-client'

import { createActionObject, isWebBrowser, createAction } from '../utils'
import { Alert } from 'react-native-web-extended'
import { get, uniqBy, orderBy, omit, identity, pickBy, differenceBy, sortedUniqBy } from 'lodash'
import { uniqueKey, Coin, hashContractKey } from '@incentum/praxis-contracts'

export enum TabLabels {
  TabAction = 'contractAction',
  TabLedgers = 'ledgers',
  TabContracts = 'contractStart',
  TabFavorites = 'favorites',
  TabComposite = 'composite',
  TabGovernance = 'governance',
}

export interface InstanceContractResult extends ContractResult {
  instance?: string
}

export interface ContractSection {
  title: string
  subtitle: string
  instances: (state: ContractModel) => SaveContractAction[]
  templates: (state: ContractModel) => IWalletTemplate[]
}

export interface ContractModel {
  templates: TemplateJson[]
  templateIdx: number
  reducerIdx: number
  search: string
  schemas: SchemasJson[]
  schemasIdx: number
  schemasAction: SchemasJson[]
  schemasActionIdx: number
  actionTags: Tag[]
  selectedTags: Tag[]
  actionTagsInput: string
  segment: number
  contract?: ContractJson
  action?: ActionJson
  selectedTab: TabLabels
  filterLedger: string[]
  searchResults: any[]
  createLink: boolean
  createLinkUrl: string
  formData: any
  instance: string
  favoritesSegment: number
  favorites: SaveContractAction[]
  contractHistory: SaveContractAction[]
  sections: ContractSection[]
  activeSections: any[]
  showContractStartForm: boolean
  showContractActionForm: boolean
  spinner: boolean
  startupComplete: boolean
  templateFavorites: IWalletTemplate[]
  contractName: string
}

export interface SaveContractAction {
  instance: InstanceContractResult
  title: string
  subtitle: string
  reducer: string
}

export function getReducers(contract: ContractModel): ReducerJson[] {
  if (contract.templateIdx < 0) { return [] }
  return contract.templates[contract.templateIdx].reducers
}

function saveHistory(contractHistory: SaveContractAction[]) {
  localStorage.setItem('history', JSON.stringify(contractHistory))
}

function saveFavorites(favorites: SaveContractAction[]) {
  localStorage.setItem('favorites', JSON.stringify(favorites))
}

function saveTemplateFavorites(favorites: IWalletTemplate[]) {
  localStorage.setItem('templateFavorites', JSON.stringify(favorites))
}

function loadFavorites(): [SaveContractAction[], SaveContractAction[], IWalletTemplate[]] {
  let favorites: any = localStorage.getItem('favorites')
  if (favorites === null) { favorites = '[]'}
  let history: any = localStorage.getItem('history')
  if (history === null) { history = '[]'}
  let templateFavorites: any = localStorage.getItem('templateFavorites')
  if (templateFavorites === null) { templateFavorites = '[]'}
  return [JSON.parse(favorites), JSON.parse(history), JSON.parse(templateFavorites)]
}

export function notifyError(title: string, msg: string, state: ContractModel): ContractModel {
  Alert.alert(
    title,
    msg,
    [
      {text: 'OK', onPress: () => { return }, style: 'cancel'},
    ]
  )
  return state
}

export function notifyInfo(title: string, msg: string, state: ContractModel): ContractModel {
  Alert.alert(
    title,
    msg,
    [
      {text: 'OK', onPress: () => { return }, style: 'cancel'},
    ]
  )
  return state
}

export function selectedTemplate(contract: ContractModel): TemplateJson | undefined {
  if (contract.templateIdx < 0) { return undefined }
  return contract.templates[contract.templateIdx]
}

export function selectedTemplateHash(contract: ContractModel): string {
  return hashJson(selectedTemplate(contract))
}

export function selectedReducer(contract: ContractModel): ReducerJson | undefined {
  const reducers = getReducers(contract)
  if (contract.reducerIdx < 0 || contract.reducerIdx >= reducers.length) { return undefined }
  return reducers[contract.reducerIdx]
}

export function parseActionLocation(location): { instance?: string, reducer?: string, formData?: any} {
  const path = location.pathname.split('/')
  if (path.length <= 3) { return {} }
  const instance = path[2]
  const reducer = path[3]
  const formData = location.search.substring(1).split('&').reduce((p, c) => {
    const components = c.split('=')
    const decoded = decodeURIComponent(components[1])
    const data = Number(decoded)
    p[components[0]] = Number.isNaN(data) ? decoded : data.valueOf()
    return p
  }, new Map<string, any>())
  return { instance, reducer, formData }
}

function updateSectionInstance(state: ContractModel, result: InstanceContractResult): ContractSection[] {
  return state.sections
}

export function formContext(contract: ContractModel, ledgerModel: LedgerModel): FormContext {
  const ledger = getLedger(ledgerModel)
  if (!ledger) { return { outputs: []}}
  const outputs = ledger.outputs.map((output) => ({ title: ledger.name, output}))
  // const outputs = ledger.ledgers.reduce((accum, l) => {
  //   return accum.concat(l.outputs.map((output) => ({ title: l.name, output})))
  // }, [] as OutputContext[])
  return {
    outputs,
  }
}

const hostPrefix = () => `${location.protocol}//${location.host}` // 'https://praxis-client.web.app'

export function getFirstCoinDisplay(output: OutputJson): string {
  if (output.coins.length === 0) { return ''}
  const coin = output.coins[0]
  const amount = Coin.fromJson(coin).display()
  const symbol = output.coins[0].symbol
  return ` '${amount} ${symbol}'`
}

const model: Model = {
  namespace: 'contract',
  state: {
    templates: [],
    templateIdx: -1,
    reducerIdx: -1,
    search: '',
    schemas: [],
    schemasIdx: -1,
    schemasAction: [],
    schemasActionIdx: -1,
    actionTags: [],
    actionTagsInput: '',
    segment: 0,
    selectedTags: [],
    filterLedger: [],
    searchResults: [],
    selectedTab: isWebBrowser() ? TabLabels.TabGovernance : TabLabels.TabLedgers,
    createLink: false,
    createLinkUrl: '',
    formData: {},
    instance: '',
    favoritesSegment: 0,
    favorites: [],
    contractHistory: [],
    activeSections: [0],
    showContractStartForm: false,
    spinner: false,
    sections: [
      {
        title: 'Contract Templates',
        subtitle: 'Contract Templates Section',
        instances: (state) => [],
        templates: (state) => state.templateFavorites,
      },
      {
        title: 'Recent Running Contracts',
        subtitle: 'Recent Running Contracts Section',
        instances: (state) => state.contractHistory,
        templates: (state) => [],
      },
      {
        title: 'Favorites',
        subtitle: 'Favorites Section',
        instances: (state) => state.favorites,
        templates: (state) => [],
      },
    ],
    startupComplete: false,
    templateFavorites: [],
    contractName: '',
  },
  reducers: {
    setClient(state: ContractModel): ContractModel {
      if (location.hostname === 'local.incentum.network') { setNetwork('local') }
      return {
        ...state,
      }
    },
    startSpinner(state: ContractModel): ContractModel {
      return {
        ...state,
        spinner: true,
      }
    },
    startupComplete(state: ContractModel): ContractModel {
      return {
        ...state,
        startupComplete: true,
      }
    },
    stopSpinner(state: ContractModel): ContractModel {
      return {
        ...state,
        spinner: false,
      }
    },
    activeSections(
      state: ContractModel,
      { payload: { activeSections } }
    ): ContractModel {
      return {
        ...state,
        activeSections,
      }
    },
    selectTab(state: ContractModel, { payload: { selectedTab } }): ContractModel {
      return {
        ...state,
        selectedTab,
      }
    },
    hideContractStart(state: ContractModel): ContractModel {
      return {
        ...state,
        showContractStartForm: false,
      }
    },
    hideContractAction(state: ContractModel): ContractModel {
      return {
        ...state,
        showContractActionForm: false,
      }
    },
    showContractStartForm(state: ContractModel, { payload: { template } }): ContractModel {
      return {
        ...state,
        templates: [template],
        templateIdx: 0,
        // showContractStartForm: true,
      }
    },
    showContractActionForm(state: ContractModel, { payload: { result } }): ContractModel {
      console.log('showContractActionForm', result)
      return {
        ...state,
        templates: [result.instance.template],
        templateIdx: 0,
        showContractActionForm: true,
      }
    },
    setTemplates(state: ContractModel, { payload: { templates } }): ContractModel {
      return {
        ...state,
        templates,
        templateIdx: templates.length > 0 ? 0 : -1,
        reducerIdx: templates.length > 0 ? 0 : -1,
      }
    },
    selectActionTags(state: ContractModel, { payload: { actionTags } }): ContractModel {
      const newstate = {
        ...state,
        actionTags: actionTags.map((tag) => ({ tag: tag.tag || tag })),
      }
      return newstate
    },
    addActionTags(state: ContractModel, { payload: { actionTags } }): ContractModel {
      const newstate = {
        ...state,
        actionTags: actionTags.map((t) => ({ tag: t.tag})),
      }
      return newstate
    },
    setSchemas(state: ContractModel, { payload: { schemas } }): ContractModel {
      return {
        ...state,
        schemas,
        schemasIdx: schemas.length ? 0 : -1,
        segment: 0,
      }
    },
    setSchemasAction(state: ContractModel, { payload: { schemas } }): ContractModel {
      return {
        ...state,
        schemasAction: schemas,
        schemasActionIdx: schemas.length ? 0 : -1,
        segment: 0,
      }
    },
    setInstance(state: ContractModel, { payload: instance }): ContractModel {
      const saved: SaveContractAction = {
        reducer: instance.action.type,
        title: get(instance.action, 'state.state.view.title', ''),
        subtitle: get(instance.action, 'state.state.view.subtitle', ''),
        instance,
      }
      const template: TemplateJson = instance.template
      const reducerIdx = findReducerIdx(template, saved.reducer)

      const history = state.contractHistory.filter((i) => i.instance.instance !== instance.instance)
      const contractHistory = [saved].concat(history)
      saveHistory(contractHistory)

      return {
        ...state,
        contract: instance.contract,
        action: instance.action,
        instance: instance.instance,
        segment: 3,
        schemasIdx: -1,
        schemasActionIdx: -1,
        contractHistory,
        templates: [template],
        templateIdx: 0,
        reducerIdx,
        formData: {},
      }
    },
    setSearchResults(state: ContractModel, { payload: { searchResults } }): ContractModel {
      return {
        ...state,
        searchResults,
      }
    },
    mergeTemplates(state: ContractModel, { payload: { templates } }): ContractModel {
      const sections = state.sections.slice(0)
      const diff = differenceBy(templates as IWalletTemplate[], state.templateFavorites, 'hash')
      if (!diff || diff.length === 0) { return state }
      const sorted = state.templateFavorites.concat(diff)
      sorted.sort((a, b) => {
        if (a.template.name > b.template.name) { return 1 }
        if (a.template.name < b.template.name) { return -1 }
        if (a.template.versionMajor < b.template.versionMajor) { return 1 }
        if (a.template.versionMajor > b.template.versionMajor) { return -1 }
        if (a.template.versionMinor < b.template.versionMinor) { return 1 }
        if (a.template.versionMinor > b.template.versionMinor) { return -1 }
        if (a.template.versionPatch < b.template.versionPatch) { return 1 }
        if (a.template.versionPatch > b.template.versionPatch) { return -1 }
        if (a.template.ledger > b.template.ledger) { return 1 }
        if (a.template.ledger < b.template.ledger) { return -1 }
        return 0
      })
      const templateFavorites = sortedUniqBy(sorted, (i) => `${i.template.name}/${i.template.ledger}`)
      saveTemplateFavorites(templateFavorites)
      return {
        ...state,
        sections,
        templateFavorites,
      }
    },
    selectTemplate(state: ContractModel, { payload: { templateIdx } }): ContractModel {
      const sections = state.sections.slice(0)
      const template = state.templates[templateIdx]
      const hash = hashJson(toTemplateJson(template))
      const found = state.templateFavorites.find((t) => t.hash === hash)
      if (found) {
        return state
      } else {
        const wtemplate: IWalletTemplate = { hash, template }
        const templateFavorites = [wtemplate].concat(state.templateFavorites)
        saveTemplateFavorites(templateFavorites)
        return {
          ...state,
          sections,
          templateIdx,
          templateFavorites,
        }
      }
    },
    selectReducer(state: ContractModel, { payload: { reducerIdx } }): ContractModel {
      return {
        ...state,
        reducerIdx,
      }
    },
    changeSearch(state: ContractModel, { payload: { search }}): ContractModel {
      return {
        ...state,
        search,
      }
    },
    changeContractName(state: ContractModel, { payload: { contractName }}): ContractModel {
      return {
        ...state,
        contractName,
      }
    },
    changeSegment(state: ContractModel, { payload: { segment }}): ContractModel {
      return {
        ...state,
        segment,
      }
    },
    changeFavoritesSegment(state: ContractModel, { payload: { favoritesSegment }}): ContractModel {
      return {
        ...state,
        favoritesSegment,
      }
    },
    selectTags(state: ContractModel, { payload: { selectedTags }}): ContractModel {
      return {
        ...state,
        selectedTags,
      }
    },
    createTag(state: ContractModel, { payload: { tag }}): ContractModel {
      const ntag = { tag, label: tag, value: tag }
      const tags = state.actionTags.slice(0)
      tags.push(ntag)
      const actionTags = orderBy(uniqBy(tags, 'label'), [tag => tag.label.toLowerCase()], 'asc')
      const selected = state.selectedTags.slice(0)
      selected.push(ntag)
      const selectedTags = uniqBy(selected, 'label')
      return {
        ...state,
        actionTags,
        selectedTags,
      }
    },
    showError(state: ContractModel, { payload: { title, msg }}): ContractModel {
      return notifyError(title, msg, state)
    },
    showInfo(state: ContractModel, { payload: { title, msg }}): ContractModel {
      return notifyInfo(title, msg, state)
    },
    setSectionInstance(state: ContractModel, { payload: { result }}): ContractModel {
      const sections = updateSectionInstance(state, result)
      return {
        ...state,
        sections,
      }
    },
    setContractAction(state: ContractModel, { payload: { action, contract, template, formData, reducer, save } }): ContractModel {
      if (save) {
        const history = state.contractHistory.filter((i) => i.instance.instance !== save.instance.instance)
        const contractHistory = [save].concat(history)
        saveHistory(contractHistory)
      }
      if (!formData) { formData = {} }
      reducer = reducer || formData.reducer
      const reducerIdx = findReducerIdx(template, reducer)
      return {
        ...state,
        selectedTab: TabLabels.TabAction,
        templates: [template],
        templateIdx: 0,
        reducerIdx,
        contract,
        formData,
        action,
        instance: action.contractHash,
      }
    },
    createLink(state: ContractModel, { payload: { createLink } }): ContractModel {
      return {
        ...state,
        createLink,
      }
    },
    formData(state: ContractModel, { payload: { formData } }): ContractModel {
      return {
        ...state,
        formData,
      }
    },
    createLinkAction(state: ContractModel, { payload: { form } }): ContractModel {
      const contractHash = hashJson(state.contract)
      const formData = pickBy(form.formData, identity)
      const params = Object.keys(formData).map(key => `${key}=${encodeURIComponent(formData[key])}`).join('&')
      const reducer = getReducerType(state, form)
      const createLinkUrl = `${hostPrefix()}/contractAction/${contractHash}/${encodeURIComponent(reducer)}?${params}`
      return {
        ...state,
        createLink: false,
        createLinkUrl,
      }
    },
    addToFavorites(state: ContractModel, { payload: { view } }): ContractModel {
      const favorites = state.favorites.slice(0).concat([view])
      saveFavorites(favorites)
      return {
        ...state,
        favorites,
      }
    },
    removeFromFavorites(state: ContractModel, { payload: { idx } }): ContractModel {
      const favorites = state.favorites.slice(0)
      favorites.splice(idx, 1)
      saveFavorites(favorites)
      return {
        ...state,
        favorites,
      }
    },
    removeFromHistory(state: ContractModel, { payload: { idx } }): ContractModel {
      const contractHistory = state.contractHistory.slice(0)
      contractHistory.splice(idx, 1)
      saveHistory(contractHistory)
      return {
        ...state,
        contractHistory,
      }
    },
    loadFavorites(state: ContractModel): ContractModel {
      const [favorites, contractHistory, templateFavorites] = loadFavorites()
      return {
        ...state,
        favorites,
        contractHistory,
        templateFavorites,
      }
    },
  },
  effects: {
    *locationUrl({ payload: { selectedTab, location, ledgerModel, contract } }, { call, put, select } ) {
      try {
        switch (selectedTab) {
          case TabLabels.TabAction: {
            const ledger = getDefaultLedger(ledgerModel)
            if (!ledger) {
              yield put(createActionObject('selectTab', { selectedTab: TabLabels.TabLedgers }))
            } else {
              const { instance, reducer, formData } = parseActionLocation(location)
              if (instance) {
                yield put(createActionObject('selectTab', { selectedTab: TabLabels.TabAction }))
                const payload: GetContractFromInstancePayload = {
                  hash: instance,
                }
                if ((yield call(checkMnemonic, ledger, 'lastContractFromInstance'))) {
                  yield put(createAction('startSpinner'))
                  const praxisResult: IPraxisResult = yield call(txContractFromInstance, payload, ledger)
                  yield put(createAction('stopSpinner'))
                  const result: ContractResult = praxisResult.transactionResult.result
                  if (success(praxisResult)) {
                    yield put(createActionObject('setContractAction', { ...result, formData, reducer }))
                    const ledgerModel = yield select(state => state.ledger)
                    const contractModel = yield select(state => state.contract)
                    yield put(createActionObject('matchSchemasAction', { ledger: ledgerModel, contract: contractModel  }))
                  } else {
                    yield put(createActionObject('showError', { title: 'Location Navigation', msg: `Navigation failed, ${statusMessage(praxisResult)}` }))
                  }
                }
              }
            }
            break
          }
          case TabLabels.TabLedgers: {
            yield put(createActionObject('selectTab', { selectedTab }))
            break
          }
          case TabLabels.TabContracts: {
            yield put(createActionObject('selectTab', { selectedTab }))
            break
          }
          case TabLabels.TabComposite: {
            yield put(createActionObject('selectTab', { selectedTab }))
            break
          }
        }
      } catch (e) {
        console.log('locationUrl error', e)
        yield put(createActionObject('selectTab', { selectedTab }))
        yield put(createActionObject('showError', { title: 'Location Navigation', msg: `Navigation failed, ${e.toString()}` }))
      }
    },
    *favoriteSelected({ payload: { view } }, { call, put, select } ) {
      try {
        yield put(createActionObject('setContractAction', { ...view }))
      } catch (e) {
        console.log('favoriteSelected error', e)
        yield put(createActionObject('showError', { title: 'Favorite Selected', msg: `Failed, ${e.toString()}` }))
      }
    },
    *outputSelected({ payload: { output } }, { call, put, select } ) {
      try {
        const ledgers: LedgerModel = yield select(state => state.ledger)
        const ledger = findLedger(ledgers, output.ledger)
        if (!ledger) {
          yield put(createActionObject('showError', { title: 'Output Selected', msg: `Output selected error, ledger not found` }))
        } else {
          const payload: GetContractFromActionPayload = {
            hash: output.actionHash,
          }
          if ((yield call(checkMnemonic, ledger, 'lastContractAction'))) {
            yield put(createAction('startSpinner'))
            const praxisResult: IPraxisResult = yield call(txContractFromAction, payload, ledger)
            yield put(createAction('stopSpinner'))
            const result: ContractResult = praxisResult.transactionResult.result
            if (success(praxisResult)) {
              yield put(createActionObject('setContractAction', { ...result }))
            } else {
              yield put(createActionObject('showError', { title: 'Output Selected', msg: `Output selected error, ${statusMessage(praxisResult)}` }))
            }
          }
        }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('outputSelected error', e)
        yield put(createActionObject('showError', { title: 'Output Selected', msg: `Output selected error, ${e.toString()}` }))
      }
    },
    *outputToAccount({ payload: { output } }, { call, put, select } ) {
      try {
        const ledgers: LedgerModel = yield select(state => state.ledger)
        const ledger = findLedger(ledgers, output.ledger)
        if (!ledger) {
          yield put(createActionObject('showError', { title: 'Output To Account', msg: `Output selected error, ledger not found` }))
        } else {
          const input = inputFromOutput(output)
          const payload: OutputToAccountPayload = {
            input,
            signature: signInputs([input], ledger)[0],
          }
          if ((yield call(checkMnemonic, ledger, 'outputToAccount'))) {
            yield put(createAction('startSpinner'))
            const result: IPraxisResult = yield call(txOutputToAccount, payload, ledger)
            yield put(createAction('stopSpinner'))
            if (result.transactionResult.status === 0) {
              console.log('setting outputs', result.praxis.outputs)
              yield put(createActionObject('ledger/setOutputs', { ledger, outputs: result.praxis.outputs, praxis: result.praxis }))
            } else {
              yield put(createActionObject('showError', { title: 'Output to Account', msg: result.transactionResult.messages[0] }))
            }
          }
        }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('outputSelected error', e)
        yield put(createActionObject('showError', { title: 'Output Selected', msg: `Output selected error, ${e.toString()}` }))
      }
    },
  *showContractStart({ payload: { template } }, { call, put, select}) {
    try {
      const ledgers: LedgerModel = yield select(state => state.ledger)
      template = template.template
      yield put(createActionObject('showContractStartForm', { template }))
      yield put(createActionObject('selectTab', { selectedTab: TabLabels.TabContracts }))
      const reducerIdx = template.reducers.findIndex((r) => r.type === 'start')
      if (reducerIdx >= 0) {
        yield put(createActionObject('selectReducer', { reducerIdx }))
        const reducer = template.reducers[reducerIdx]
        const selected = getLedger(ledgers)
        if (!selected) {
          yield put(createActionObject('showError', { title: 'Show Contract Start', msg: 'Please select a ledger for the request' }))
        } else {
          const payload: MatchSchemasPayload = {
            reducer: reducer.type,
            templateName: template.name,
            templateLedger: template.ledger,
            templateVersionMajor: template.versionMajor,
          }
          if ((yield call(checkMnemonic, selected, 'matchSchemas'))) {
            yield put(createAction('startSpinner'))
            const praxisResult: IPraxisResult = yield call(txMatchSchemas, payload, selected)
            yield put(createAction('stopSpinner'))
            const result: MatchSchemasResult = praxisResult.transactionResult.result
            if (result) {
              yield put(createActionObject('setSchemas', { schemas: result.schemas }))
            }
          }
        }
      } else {
        yield put(createActionObject('showError', { title: 'Show Contract Start', msg: 'There is no start request for this template' }))
      }
    } catch (e) {
      yield put(createAction('stopSpinner'))
      console.log('sendTx error', e)
      yield put(createActionObject('showError', { title: 'Show Contract Start', msg: `Send tx error, ${e.toString()}` }))
    }
  },
  *showContractAction({ payload: { result } }, { call, put, select}) {
    const saved: SaveContractAction = result
    const ledgers: LedgerModel = yield select(state => state.ledger)
    const contract: ContractModel = yield select(state => state.contract)
    yield put(createActionObject('setInstance', { ...saved.instance }))
    yield put(createActionObject('selectTab', { selectedTab: TabLabels.TabAction }))
  },
  *templateSelected({ payload: { templateIdx } }, { call, put, select } ) {
      try {
        const ledgers: LedgerModel = yield select(state => state.ledger)
        const contract: ContractModel = yield select(state => state.contract)
        yield put(createActionObject('selectTemplate', { templateIdx }))
        const template = selectedTemplate(contract)!
        const reducerIdx = template.reducers.findIndex((r) => r.type === 'start')
        if (reducerIdx >= 0) {
          yield put(createActionObject('selectReducer', { reducerIdx }))
          const reducer = template.reducers[reducerIdx]
          const selected = getLedger(ledgers)
          if (!selected) {
            yield put(createActionObject('showError', { title: 'Template Select', msg: 'Please select a ledger for the request' }))
          } else {
            const payload: MatchSchemasPayload = {
              reducer: reducer.type,
              templateName: template.name,
              templateLedger: template.ledger,
              templateVersionMajor: template.versionMajor,
            }
            if ((yield call(checkMnemonic, selected, 'matchSchemas'))) {
              yield put(createAction('startSpinner'))
              const praxisResult: IPraxisResult = yield call(txMatchSchemas, payload, selected)
              yield put(createAction('stopSpinner'))
              const result: MatchSchemasResult = praxisResult.transactionResult.result
              if (success(praxisResult)) {
                yield put(createActionObject('setSchemas', { schemas: result.schemas }))
              } else {
                yield put(createActionObject('showError', { title: 'Template Selected', msg: `Template selected error, ${statusMessage(praxisResult)}` }))
              }
            }
          }
        }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('sendTx error', e)
        yield put(createActionObject('showError', { title: 'Contract Match Schemas', msg: `Send tx error, ${e.toString()}` }))
      }
    },
    *matchSchemas({ payload: { ledger, contract } }, { call, put } ) {
      try {
        const selected = getLedger(ledger)
        const reducer = selectedReducer(contract)
        const template = selectedTemplate(contract)
        if (!selected) {
          yield put(createActionObject('showError', { title: 'Contract Match Schemas', msg: 'Please select a ledger for the request' }))
        } else if (!template || !reducer) {
          yield put(createActionObject('showError', { title: 'Contract Match Schemas', msg: 'Please select a template and reducer' }))
        } else {
          const payload: MatchSchemasPayload = {
            reducer: reducer.type,
            templateName: template.name,
            templateLedger: template.ledger,
            templateVersionMajor: template.versionMajor,
          }
          if ((yield call(checkMnemonic, selected, 'matchSchemas'))) {
            yield put(createAction('startSpinner'))
            const praxisResult: IPraxisResult = yield call(txMatchSchemas, payload, selected)
            yield put(createAction('stopSpinner'))
            const result: MatchSchemasResult = praxisResult.transactionResult.result
            if (success(praxisResult)) {
              yield put(createActionObject('setSchemas', { schemas: result.schemas }))
            } else {
              yield put(createActionObject('showError', { title: 'Contract Match Schemas', msg: `Match schemas error, ${statusMessage(praxisResult)}` }))
            }
          }
        }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('sendTx error', e)
        yield put(createActionObject('showError', { title: 'Contract Match Schemas', msg: `Send tx error, ${e.toString()}` }))
      }
    },
    *matchSchemasAction({ payload: { ledger, contract } }, { call, put } ) {
      try {
        const selected = getLedger(ledger)
        const reducer = selectedReducer(contract)
        const template = selectedTemplate(contract)
        if (!selected) {
          yield put(createActionObject('showError', { title: 'Contract Match Schemas', msg: 'Please select a ledger for the request' }))
        } else if (!template || !reducer) {
          yield put(createActionObject('showError', { title: 'Contract Match Schemas', msg: 'Please select a template and reducer' }))
        } else {
          const payload: MatchSchemasPayload = {
            reducer: reducer.type,
            templateName: template.name,
            templateLedger: template.ledger,
            templateVersionMajor: template.versionMajor,
          }
          if ((yield call(checkMnemonic, selected, 'matchSchemas'))) {
            yield put(createAction('startSpinner'))
            const praxisResult: IPraxisResult = yield call(txMatchSchemas, payload, selected)
            yield put(createAction('stopSpinner'))
            const result: MatchSchemasResult = praxisResult.transactionResult.result
            if (success(praxisResult)) {
              yield put(createActionObject('setSchemasAction', { schemas: result.schemas }))
            } else {
              yield put(createActionObject('showError', { title: 'Contract Match Schemas', msg: `Match schemas error, ${statusMessage(praxisResult)}` }))
            }
          }
        }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('sendTx error', e)
        yield put(createActionObject('showError', { title: 'Contract Match Schemas', msg: `Send tx error, ${e.toString()}` }))
      }
    },
    *search({ payload: { ledger, contract } }, { select, call, put } ) {
      try {
        const selected = getLedger(ledger)
        if (!selected) {
          yield put(createActionObject('showError', { title: 'Template Search', msg: 'Please select a ledger for the request' }))
        } else {
          const payload: ContractSearchPayload = {
            search: contract.search,
          }
          if ((yield call(checkMnemonic, selected, 'searchTemplates'))) {
            yield put(createAction('startSpinner'))
            const praxis: IPraxisResult = yield call(txContractSearch, payload, selected)
            yield put(createAction('stopSpinner'))
            if (success(praxis)) {
              const templates = get(praxis, 'praxis.templateSearch') || []
              if (templates.length > 0) {
                const filtered = templates.reduce((acc: TemplateJson[], t: IWalletTemplate) => acc.find((a) => a.ledger === t.template.ledger && a.name === t.template.name) ? acc : acc.concat([t.template]), [] as TemplateJson[])
                yield put(createActionObject('setTemplates', { templates: filtered }))
              } else {
                yield put(createActionObject('showError', { title: 'Contract Search', msg: 'No contracts found' }))
              }
            } else {
              yield put(createActionObject('showError', { title: 'Contract Search', msg: `Contract search error, ${statusMessage(praxis)}` }))
            }
          }
        }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('sendTx error', e)
      }
    },
    *searchInstance({ payload: { ledger, contract } }, { select, call, put } ) {
      try {
        const selected = ledger.ledgers[0]
        if (!selected) {
          yield put(createActionObject('showError', { title: 'Instance Search', msg: 'Please select a ledger for the request' }))
        } else {
          const payload: InstanceSearchPayload = {
            search: contract.search,
            ledger: '',
          }
          if ((yield call(checkMnemonic, selected, 'searchInstances'))) {
            yield put(createAction('startSpinner'))
            const praxis: IPraxisResult = yield call(txInstanceSearch, payload, selected)
            yield put(createAction('stopSpinner'))
            const searchResults = get(praxis, 'praxis.instanceSearch') || []
            if (success(praxis)) {
              yield put(createActionObject('setSearchResults', { searchResults: searchResults.map((r) => {r.instance = hashJson(r.contract); return r}) }))
            } else {
              yield put(createActionObject('showError', { title: 'Instance Search', msg: `Instance search error, ${statusMessage(praxis)}` }))
            }
          }
        }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('sendTx error', e)
      }
    },
    *formSubmitted({ payload: { form, formContext } }, { select, call, put } ) {
      const contract: ContractModel = yield select(state => state.contract)
      const ledgers: LedgerModel = yield select(state => state.ledger)
      try {
        const ledger = getLedger(ledgers)
        if (!ledger) {
          yield put(createActionObject('showError', { title: 'Contract Start', msg: 'Please select a ledger for the request' }))
        } else if ((yield call(checkMnemonic, ledger, 'contractStart'))) {
          yield contractStart(contract, ledger, form, formContext, call, put)
        }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('formSubmitted', e)
        yield put(createActionObject('showError', { title: 'Contract Start Failed', msg: e.toString() }))
      }
    },
    *formSubmittedAction({ payload: { form, formContext } }, { select, call, put } ) {
      const contract: ContractModel = yield select(state => state.contract)
      const ledgers: LedgerModel = yield select(state => state.ledger)
      try {
        const ledger = getLedger(ledgers)
        if (!ledger) {
          yield put(createActionObject('showError', { title: 'Contract Action', msg: 'Please select a ledger for the request' }))
        } else if (!contract.contract) {
          yield put(createActionObject('showError', { title: 'Contract Action', msg: 'Contract instance not found' }))
        } else {
          if (contract.createLink) {
            yield put(createActionObject('createLinkAction', { form }))
          } else if ((yield call(checkMnemonic, ledger, 'contractAction'))) {
            yield contractAction(contract, ledger, form, formContext, call, put)
          }
        }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('formSubmittedAction', e)
        yield put(createActionObject('showError', { title: 'Action Failed', msg: e.toString() }))
      }
    },
    *startup({ payload: { user } }, { call, put, select }) {
      try {
        const ledgerModel: LedgerModel = yield select(state => state.ledger)
        const contractModel: ContractModel = yield select(state => state.contract)
        if (contractModel.startupComplete) { return }
        yield put(createAction('setClient'))
        yield put(createAction('loadFavorites'))
        const ledger = getLedger(ledgerModel)
        if ((yield call(ledgerReady, ledger, 'getPraxisTemplates', true))) {
          yield put(createAction('startupComplete'))
          yield put(createAction('startSpinner'))
          const result: IPraxisResult = yield call(loadPraxisTemplates, ledger)
          yield put(createAction('stopSpinner'))
          if (success(result)) {
            const obj = result.praxis.templateSearch.reduce((found, template: IWalletTemplate) => {
              const name = template.template.name
              if (!found[template.template.name] && template.template.ledger === incentumLedger) {
                found[name] = template
              }
              return found
            }, {})
            const templates: IWalletTemplate[] = Object.values(obj)
            yield put(createActionObject('mergeTemplates', { templates }))
          } else {
            ledger!.mnemonic = ''
            console.log(`startup load error: ${statusMessage(result)}`)
          }
        }
      } catch (e) {
        yield put(createAction('stopSpinner'))
        console.log('startup load error', e)
      }
    },
  },
  subscriptions: {
    async setup({ history, dispatch }) {
    },
  },
}

const incentumLedger = 'THWJcWwvAGCqGgzpqxwDH9DgaXSwrtJWBm'
async function loadPraxisTemplates(ledger: Ledger): Promise<IPraxisResult> {
  const payload: ContractSearchPayload = {
    search: 'incentum-',
  }
  return await txContractSearch(payload, ledger)
}

function* contractAction(contract: ContractModel, ledger: Ledger, form: any, formContext, call, put) {
  try {
    const type = getReducerType(contract, form)
    const [inputs, newForm] = getInputs(form, formContext)
    const signatures = signInputs(inputs, ledger)
    const contractHash = hashJson(contract.contract)
    const action: ActionJson = {
      nonce: uniqueKey(),
      tags: contract.actionTags.map(t => t.value),
      form: newForm,
      ledger: ledger.ledger,
      type,
      inputs,
      signatures,
      contractHash,

      key: '',
      other: {},
      outputs: [],
      previousHash: '',
      transaction: '',
      timestamp: Date.now(),
    }

    const payload: ContractActionPayload = {
      action,
    }
    yield put(createAction('startSpinner'))
    const praxisResult: IPraxisResult = yield call(txContractAction, payload, ledger)
    yield put(createAction('stopSpinner'))
    const result: ContractResult = praxisResult.transactionResult.result
    if (success(praxisResult)) {
      yield put(createActionObject('setInstance', { ...result, instance: hashJson(result.contract) }))
      yield put(createActionObject('showInfo', { title: 'Contract Action', msg: 'Transaction complete' }))
    } else {
      yield put(createActionObject('showError', { title: 'Contract Action Failed', msg: statusMessage(praxisResult) }))
    }
  } catch (e) {
    console.log('contractAction', e)
    yield put(createActionObject('showError', { title: 'Contract Action', msg: e.toString() }))
  }
}

function findReducerIdx(template: TemplateJson, reducer: string | undefined): number {
  let i = 0
  for (const r of template.reducers) {
    if (r.type === reducer) { return i }
    i++
  }
  return 0
}

function getReducerType(contract, form): string {
  if (form.formData.reducer) { return form.formData.reducer }
  const reducer = selectedReducer(contract)
  if (reducer) { return reducer.type }
  throw new Error('Reducer not found')
}

export interface OutputContext {
  title: string
  output: OutputJson
}

export interface FormContext {
  outputs: OutputContext[]
}

function getInputs(form: any, formContext: FormContext): [InputJson[], any] {
  const formData = form.formData
  const outputKeys = Object.keys(formData).filter((key) => key.startsWith('output:'))
  const outputNonces = outputKeys.map((key) => formData[key]).filter((nonce) => !!nonce)
  const newForm = omit(formData, outputKeys)
  const outputs = outputNonces.map((key) => formContext.outputs.find((o) => o.output.key === key)).filter((o) => !!o).map((o) => o!.output)
  const inputs = outputs.map((o) => inputFromOutput(o))
  return [inputs, newForm]
}

function* contractStart(contract: ContractModel, ledger: Ledger, form: any, formContext: any, call, put) {
  try {
    const initialState = {}
    const type = getReducerType(contract, form)
    const [inputs, newForm] = getInputs(form, formContext)
    const signatures = signInputs(inputs, ledger)
    const action: ActionJson = {
      nonce: uniqueKey(),
      tags: contract.actionTags.map(t => t.value),
      form: newForm,
      ledger: ledger.ledger,
      type,
      inputs,
      signatures,
      contractHash: selectedTemplateHash(contract),

      key: '',
      other: {},
      outputs: [],
      transaction: '',
      previousHash: '',
      timestamp: Date.now(),
    }

    let key = uniqueKey()
    if (contract.contractName) {
      key = hashContractKey(ledger.ledger, contract.contractName)
    }
    const payload: ContractStartPayload = {
      key,
      action,
      initialState,
    }

    yield put(createAction('startSpinner'))
    const praxisResult: IPraxisResult = yield call(txContractStart, payload, ledger)
    yield put(createAction('stopSpinner'))
    const result: ContractResult = praxisResult.transactionResult.result
    if (success(praxisResult)) {
      yield put(createActionObject('setInstance', { ...result, instance: hashJson(result.contract) }))
      yield put(createActionObject('selectTab', { selectedTab: TabLabels.TabAction }))
      yield put(createActionObject('showInfo', { title: 'Contract Start', msg: 'Transaction complete' }))
    } else {
      yield put(createActionObject('showError', { title: 'Contract Start Failed', msg: statusMessage(praxisResult) }))
    }
  } catch (e) {
    console.log('contractStart failed', e)
    yield put(createActionObject('showError', { title: 'Contract Start Failed', msg: e.toString() }))
    return { error: e.toString()}
  }
}

export default model
