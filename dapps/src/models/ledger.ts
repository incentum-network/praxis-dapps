import { Model } from 'dva'
import { createAction, createActionObject } from '../utils'
import { Alert, AlertIOS } from 'react-native-web-extended'

import * as bip39 from 'bip39'
import EthereumWallet from 'ethereumjs-wallet'
import * as hdkey from 'ethereumjs-wallet/hdkey'
import * as bech32 from 'bech32'
import { User } from 'firebase'

import { OutputJson, GetUnusedOutputsPayload, AccountToOutputPayload } from '@incentum/praxis-interfaces'
import { txUnusedOutputs, ILedger, txAccountToOutput, IPraxisResult, success, statusMessage } from '@incentum/praxis-client'
import { Identities, Managers } from '@incentum/crypto'
import BigNumber from 'bignumber.js'

export interface Ledger extends ILedger {
  ledger: string
  name: string
  subtitle?: string
  account: number
  wallet?: any
  password?: string
  mnemonic: string
  outputs: OutputJson[]
  v3string?: string
  balance?: BigNumber
  username?: string
}

export function getPublicKey(ledger: Ledger): string {
  const key = ledger.wallet.getPublicKey()
  const keyStr = Buffer.from(key).toString('hex')
  return keyStr
}

export function notifyError(title: string, msg: string, state: LedgerModel): LedgerModel {
  Alert.alert(
    title,
    msg,
    [
      {text: 'OK', onPress: () => { return }, style: 'cancel'},
    ]
  )
  return state
}

export function notifyInfo(title: string, msg: string, state: LedgerModel): LedgerModel {
  Alert.alert(
    title,
    msg,
    [
      {text: 'OK', onPress: () => { return }, style: 'cancel'},
    ]
  )
  return state
}

export function getLedger(model: LedgerModel) {
  return model.selectedLedgerIndex >= 0 ? model.ledgers[model.selectedLedgerIndex] : undefined
}

async function generateMnemonic() {
  return bip39.generateMnemonic()
}

export interface UserStorageLedger {
  ledger: string
  account: number
  name: string
  description?: string
  mnemonic?: string
  encryptedJson?: string
}

export interface UserStorage {
  ledgers: UserStorageLedger[]
}

function saveLedgers(ledgers: Ledger[]) {
  const save = ledgers.map((l) => ({...l, mnemonic: ''}))
  localStorage.setItem('ledgers', JSON.stringify(save))
}

function loadLedgers(): Ledger[] {
  const json = localStorage.getItem('ledgers')
  const ledgers = json === null ? [] : JSON.parse(json)
  return ledgers.map((l) => restoreFromJson(l))
}

function getUserStorage(user: User): UserStorage {
  const userStorage = localStorage.getItem(user.uid)
  return userStorage !== null ? JSON.parse(userStorage) : { ledgers: [] }
}

function restoreFromJson(ledger: Ledger): Ledger {
  ledger.wallet = '' // new EthereumWallet(Buffer.from(ledger.wallet._privKey.data))
  ledger.outputs = []
  ledger.mnemonic = ''
  ledger.balance = ledger.balance ? new BigNumber(ledger.balance) : new BigNumber(0)
  return ledger
}

async function loadLedgerFiles(user: User): Promise<UserStorageLedger[]> {
  const userStorage: UserStorage = getUserStorage(user)
  return userStorage.ledgers
}

async function saveLedger(user: User, ledger: Ledger): Promise<UserStorage> {
  const userStorage: UserStorage = getUserStorage(user)
  const userStorageLedger: UserStorageLedger = {
    ledger: ledger.ledger,
    account: ledger.account,
    name: ledger.name,
    description: ledger.subtitle,
    mnemonic: bip39.mnemonicToSeedHex(ledger.mnemonic),
    encryptedJson: ledger.v3string,
  }
  userStorage.ledgers.push(userStorageLedger)
  localStorage.setItem(user.uid, JSON.stringify(userStorage))
  return userStorage
}

async function loadLedger(user: User, restore: RestoreLedger): Promise<Ledger> {
  const { name, password } = restore
  const userStorage: UserStorage = getUserStorage(user)
  const ledgers: UserStorageLedger[] = userStorage.ledgers
  const ledgerFile = ledgers.find(ledger => ledger.name === name)
  if (ledgerFile) {
    return {
      mnemonic: '',
      ledger: ledgerFile.ledger,
      name: ledgerFile.name,
      subtitle: ledgerFile.description,
      account: ledgerFile.account,
      wallet: EthereumWallet.fromV3(ledgerFile.encryptedJson, password),
      outputs: [],
    }
  }
  throw new Error('ledger not found')
}

async function restoreLedger(user: User, restore: RestoreLedger): Promise<Ledger> {
  const { name, password } = restore
  const userStorage: UserStorage = getUserStorage(user)
  const ledgers: UserStorageLedger[] = userStorage.ledgers
  const ledgerFile = ledgers.find(ledger => ledger.name === name)
  if (
    ledgerFile &&
    ledgerFile.mnemonic === bip39.mnemonicToSeedHex(restore.mnemonic)
  ) {
    return {
      mnemonic: '',
      ledger: ledgerFile.ledger,
      name: ledgerFile.name,
      subtitle: ledgerFile.description,
      account: ledgerFile.account,
      wallet: EthereumWallet.fromV3(ledgerFile.encryptedJson, password),
      outputs: [],
    }
  }
  throw new Error('ledger not found')
}

async function restoreWallet(user: User, restore: RestoreLedger): Promise<Ledger> {
  const { name, mnemonic, description } = restore
  Managers.configManager.setFromPreset('testnet')
  const ledger: string = Identities.Address.fromPassphrase(mnemonic)
  return {
    name,
    ledger,
    mnemonic,
    account: 0,
    subtitle: description,
    outputs: [],
  }
}

interface CreateLedger {
  name: string
  subtitle?: string
  mnemonic: string
  account: number
  password: string
}

async function createLedger({
  name,
  subtitle,
  mnemonic,
  account,
  password,
}: CreateLedger): Promise<Ledger> {
  const seed = bip39.mnemonicToSeed(mnemonic, password)
  const master = hdkey.fromMasterSeed(seed)
  // TODO use different coin type instead of 60? Maybe register my own
  const derived = master.derivePath(`m/44'/60'/${account}'/0/0`)
  const wallet = derived.getWallet()
  const address = wallet.getAddress()
  const words = bech32.toWords(Buffer.from(address))
  const ledger = bech32.encode('itum', words)
  const v3string = wallet.toV3(password)

  return {
    name,
    subtitle,
    ledger,
    password,
    mnemonic,
    account,
    wallet,
    outputs: [],
    v3string,
  }
}

interface RestoreLedger {
  file: string
  name: string
  description: string
  password: string
  mnemonic: string
}

export interface Tag {
  tag: string
  label: string
  value: string
}

interface OutputsResult {
  outputs?: OutputJson[]
  error?: string
}

export async function ledgerReady(ledger: Ledger | undefined, tx: string, onlyIfEmpty: boolean = false): Promise<boolean> {
  if (!ledger) { return false}
  return await checkMnemonic(ledger, tx, onlyIfEmpty)
}

export async function checkMnemonic(ledger: Ledger, tx: string, onlyIfEmpty: boolean = false): Promise<boolean> {
  if (!onlyIfEmpty || !ledger.mnemonic) {
    ledger.mnemonic = await prompt(`Verify Passphrase`, `Wallet ${ledger.name}, Tx ${tx}`, ledger.mnemonic)
  }
  return !!ledger.mnemonic
}

export function prompt(title: string, msg: string, mnemonic: string): Promise<string> {
  return new Promise((resolve) =>
    AlertIOS.prompt(title, msg, [
      {
        text: 'Ok',
        onPress: (text: string) => resolve(text),
      },
      {
        text: 'Cancel',
        onPress: (text: string) => resolve(''),
      },
    ], 'secure-text', mnemonic)
  )
}

function* getUnusedOutputs(ledger: Ledger, call) {
  try {
    const payload: GetUnusedOutputsPayload = {
      ledger: ledger.ledger,
    }
    return yield call(txUnusedOutputs, payload, ledger)
  } catch (e) {
    return { error: e.toString()}
  }
}

export interface LedgerModel {
  ledgers: Ledger[]
  ledger?: Ledger
  output?: OutputJson
  selectedTags: any[]
  account: string
  password: string
  confirmPassword: string
  description: string
  ledgerName: string
  mnemonic: string
  selectedAddLedgerIndex: number
  selectedFiles: string[]
  activeSections: any[]
  errorPassword: string
  errorMnemonic: string
  errorAccount: string
  errorName: string
  selectedLedgerIndex: number
  ledgerFiles: UserStorageLedger[]
  selectedLedgerFileIndex: number
  warningRead: boolean
  amount: string
  mnemonicHide: boolean
}

export function getDefaultLedger(ledger: LedgerModel) {
  return ledger.ledgers[0]
}

export function findLedger(ledger: LedgerModel, ledgerStr: string): Ledger | undefined {
  const found =  ledger.ledgers.filter((l) => l.ledger === ledgerStr)
  return found.length > 0 ? found[0] : undefined
}

let ledgersGlobal = loadLedgers()

const ledger: Model = {
  namespace: 'ledger',
  state: {
    ledgers: ledgersGlobal,
    selectedTags: [],
    account: '',
    password: '',
    mnemonic: '',
    confirmPassword: '',
    ledgerName: '',
    description: '',
    selectedAddLedgerIndex: 0,
    selectedFiles: [],
    activeSections: [],

    errorName: '',
    errorPassword: '',
    errorMnemonic: '',
    errorAccount: '',

    selectedLedgerIndex: ledgersGlobal.length > 0 ? 0 : -1,
    ledgerFiles: [],
    selectedLedgerFileIndex: 0,
    warningRead: false,
    amount: '',
    mnemonicHide: true,
  },
  reducers: {
    toggleMnemonic(state: LedgerModel): LedgerModel {
      const mnemonicHide = !state.mnemonicHide
      return {
        ...state,
        mnemonicHide,
      }
    },
    showError(state: LedgerModel, { payload: { title, msg }}): LedgerModel {
      return notifyError(title, msg, state)
    },
    showInfo(state: LedgerModel, { payload: { title, msg }}): LedgerModel {
      return notifyInfo(title, msg, state)
    },
    output(state: LedgerModel, { payload: { output } }): LedgerModel {
      return {
        ...state,
        output,
      }
    },
    activeSections(
      state: LedgerModel,
      { payload: { activeSections } }
    ): LedgerModel {
      return {
        ...state,
        activeSections,
      }
    },
    selectTags(state: LedgerModel, { payload: { selectedTags } }): LedgerModel {
      return {
        ...state,
        selectedTags,
      }
    },
    addLedger(state: LedgerModel, { payload: { ledger } }): LedgerModel {
      const dup = state.ledgers.find(l => l.name === ledger.name)
      if (dup) {
        return notifyError('Add Ledger', `Duplicate ledger name: ${ledger.name}`, state)
      }
      const ledgers = state.ledgers.slice(0)
      ledgers.push(ledger)
      saveLedgers(ledgers)
      ledgersGlobal = ledgers
      const selectedLedgerIndex = ledgers.length - 1
      return {
        ...state,
        ledgers,
        mnemonic: '',
        selectedLedgerIndex,
      }
    },
    loadLedgers(state: LedgerModel, { payload: { history } }): LedgerModel {
      if (state.ledgers && state.ledgers.length > 0) { return state }
      const ledgers = loadLedgers()
      if (ledgers.length <= 0) {
        setTimeout(() => history.push('/addLedger'), 1000)
      }
      return {
        ...state,
        ledgers,
        selectedLedgerIndex: ledgers.length > 0 ? 0 : -1,
      }
    },
    warningRead(state: LedgerModel, { payload: { history } }): LedgerModel {
      setTimeout(() => {
        history.goBack()
      }, 1000)
      return {
        ...state,
        warningRead: true,
      }
    },
    setMnemonic(state: LedgerModel, { payload: { mnemonic } }): LedgerModel {
      return {
        ...state,
        mnemonic,
      }
    },
    changeAccount(state: LedgerModel, { payload: { account } }): LedgerModel {
      try {
        Number(account)
        return {
          ...state,
          account: `${account}`,
        }
      } catch (e) {
        Alert.alert(`Account is not a number, ${account}`)
        return state
      }
    },
    changeAmount(state: LedgerModel, { payload: { amount } }): LedgerModel {
      try {
        const check = Number(amount)
        if (isNaN(check)) {
          Alert.alert(`Amount is not a number, ${amount}`)
          return state
        }
        return {
          ...state,
          amount,
        }
      } catch (e) {
        Alert.alert(`Amount is not a number, ${amount}`)
        return state
      }
    },
    changePassword(state: LedgerModel, { payload: { password } }): LedgerModel {
      return {
        ...state,
        password,
      }
    },
    changeConfirmPassword(
      state: LedgerModel,
      { payload: { confirmPassword } }
    ): LedgerModel {
      return {
        ...state,
        confirmPassword,
      }
    },
    changeMnemonic(state: LedgerModel, { payload: { mnemonic } }): LedgerModel {
      return {
        ...state,
        mnemonic,
      }
    },
    changeLedgerName(
      state: LedgerModel,
      { payload: { ledgerName } }
    ): LedgerModel {
      return {
        ...state,
        ledgerName,
      }
    },
    changeDescription(
      state: LedgerModel,
      { payload: { description } }
    ): LedgerModel {
      return {
        ...state,
        description,
      }
    },
    changeSelectedAddLedgerIndex(
      state: LedgerModel,
      { payload: { selectedAddLedgerIndex } }
    ): LedgerModel {
      return {
        ...state,
        selectedAddLedgerIndex,
      }
    },
    clearAddLedger(state: LedgerModel): LedgerModel {
      return {
        ...state,
        errorAccount: '',
        errorMnemonic: '',
        errorPassword: '',
        errorName: '',
      }
    },
    addLedgerError(state: LedgerModel, { payload }): LedgerModel {
      return {
        ...state,
        ...payload,
      }
    },
    showAlert(state: LedgerModel, { payload: { title, alert } }): LedgerModel {
      Alert.alert(
        title,
        alert,
        [{ text: 'OK', onPress: () => {return} }],
        { cancelable: true }
      )
      return state
    },
    changeSelectedLedgerIndex(
      state: LedgerModel,
      { payload: { selectedLedgerIndex } }
    ): LedgerModel {
      return {
        ...state,
        selectedLedgerIndex,
      }
    },
    addLedgerFile(
      state: LedgerModel,
      { payload: { ledgerFile } }
    ): LedgerModel {
      const ledgerFiles = state.ledgerFiles.slice(0)
      ledgerFiles.push(ledgerFile)
      return {
        ...state,
        ledgerFiles,
      }
    },
    changeSelectedLedgerFileIndex(
      state: LedgerModel,
      { payload: { selectedLedgerFileIndex } }
    ): LedgerModel {
      return {
        ...state,
        selectedLedgerFileIndex,
      }
    },
    setLedgerFiles(state: LedgerModel, { payload: { ledgerFiles } }): LedgerModel {
      return {
        ...state,
        ledgerFiles,
      }
    },
    setOutputs(state: LedgerModel, { payload: { ledger, outputs, praxis: { balance, username} } }): LedgerModel {
      balance = new BigNumber(balance).shiftedBy(-8)
      const old = state.ledgers.slice(0)
      const ledgers = old.map((l) => {
        if (l.ledger === ledger.ledger) {
          return {
            ...l,
            balance,
            username,
            outputs,
          }
        } else {
          return l
        }
      })
      return {
        ...state,
        ledgers,
      }
    },
  },
  effects: {
    *accountToOutput({ payload: { ledger } }, { select, call, put } ) {
      try {
        if (!(yield call(checkMnemonic, ledger, 'accountToOutput'))) { return }
        const model = yield select(state => state.ledger)
        const amount = `${Number(model.amount) * 1e8}`
        const payload: AccountToOutputPayload = { amount }
        const a2o: IPraxisResult = yield call(txAccountToOutput, payload, ledger)
        if (a2o.transactionResult.status !== 0) {
          yield put(createActionObject('showError', { title: 'Account to Output', msg: `${a2o.transactionResult.messages[0]}` }))
        } else {
          yield put(createAction('contract/startSpinner'))
          const result: IPraxisResult = yield getUnusedOutputs(ledger, call)
          yield put(createAction('contract/stopSpinner'))
          if (success(result)) {
            yield put(createActionObject('setOutputs', { ledger, outputs: result.praxis.outputs, praxis: result.praxis }))
            if (result.praxis.outputs.length === 0) {
              yield put(createActionObject('showError', { title: 'Account to Output', msg: 'Request successful, but no outputs found' }))
            }
          } else {
            yield put(createActionObject('showError', { title: 'Account to Output', msg: statusMessage(result) }))
          }
        }
      } catch (e) {
        yield put(createAction('contract/stopSpinner'))
        console.log('sendTx error', e)
        yield put(createActionObject('showError', { title: 'Account to Output', msg: e.toString() }))
      }
    },
    *refreshOutputs({ payload: { ledger } }, { select, call, put } ) {
      try {
        if (!(yield call(checkMnemonic, ledger, 'getOutputs'))) { return }
        yield put(createAction('contract/startSpinner'))
        const result: IPraxisResult = yield getUnusedOutputs(ledger, call)
        yield put(createAction('contract/stopSpinner'))
        if (success(result)) {
          yield put(createActionObject('setOutputs', { ledger, outputs: result.praxis.outputs, praxis: result.praxis }))
          if (result.praxis.outputs.length === 0) {
            yield put(createActionObject('showError', { title: 'Refresh Outputs', msg: 'Request successful, but no outputs found' }))
          }
        } else {
          yield put(createActionObject('showError', { title: 'Refresh Outputs', msg: statusMessage(result) }))
        }
      } catch (e) {
        yield put(createAction('contract/stopSpinner'))
        console.log('sendTx error', e)
        yield put(createActionObject('showError', { title: 'Refresh Outputs', msg: e.toString() }))
      }
    },
    *generateMnemonic({}, { call, put }) {
      const mnemonic = yield call(generateMnemonic)
      yield put(createActionObject('changeMnemonic', { mnemonic }))
    },
    *loadLedgerFiles({ payload: { user } }, { call, put }) {
      const ledgerFiles: UserStorageLedger[] = yield call(
        loadLedgerFiles,
        user
      )
      yield put(createActionObject('setLedgerFiles', { ledgerFiles }))
    },
    *createLedger({ payload: { user, done } }, { select, call, put }) {
      try {
        yield put(createAction('clearAddLedger'))
        const model = yield select(state => state.ledger)
        const name = model.ledgerName
        const account = model.account ? Number(model.account) : NaN
        const password = model.password
        const confirmPassword = model.confirmPassword
        const mnemonics = model.mnemonic.split(/\s+/)
        const found = model.ledgers.find(ledger => ledger.name === name)
        if (!password || password !== confirmPassword) {
          yield put(
            createActionObject('addLedgerError', {
              errorPassword: 'password must equal confirm password',
            })
          )
        } else if (isNaN(account)) {
          yield put(
            createActionObject('addLedgerError', {
              errorAccount: `account must be an integer: ${account}`,
            })
          )
        } else if (!name) {
          yield put(
            createActionObject('addLedgerError', {
              errorName: `you must enter a ledger name: ${name}`,
            })
          )
        } else if (mnemonics.length !== 12) {
          yield put(
            createActionObject('addLedgerError', {
              errorMnemonic: `your mnemonic must be 12 words`,
            })
          )
        } else if (found) {
          yield put(
            createActionObject('addLedgerError', {
              errorName: `you already have a ledger with that name: ${name}`,
            })
          )
        } else {
          const create: CreateLedger = {
            name,
            subtitle: model.description,
            mnemonic: model.mnemonic,
            account,
            password,
          }
          const ledger = yield call(createLedger, create)
          yield put(createActionObject('addLedger', { user, ledger }))
          yield call(saveLedger, user, ledger)
          done()
        }
      } catch (e) {
        console.log('createLedger', e)
        Alert.alert('Create Ledger Failed', e.toString())
      }
    },
    *restoreLedger(
      { payload: { user, done, restore } },
      { select, call, put }
    ) {
      try {
        const model = yield select(state => state.ledger)
        const ledgers = model.ledgers
        const password = model.password
        if (!password) {
          return notifyError('Restore Ledger', 'Please enter password', model)
        }
        const name = model.ledgerName
        const mnemonic = model.mnemonic
        const found = ledgers.find(l => l.name === name)
        if (!found) {
          const ledger = yield call(restoreLedger, user, {
            name,
            password,
            mnemonic,
          })
          yield put(createActionObject('addLedger', { ledger }))
        }
        done()
      } catch (e) {
        console.log('restoreLedger', e)
        Alert.alert('Restore Ledger Failed', e.toString())
      }
    },
    *restoreWallet(
      { payload: { user, done, restore } },
      { select, call, put }
    ) {
      try {
        const model = yield select(state => state.ledger)
        const ledgers = model.ledgers
        const mnemonic = model.mnemonic
        if (!mnemonic) {
          return notifyError('Restore Wallet', 'Please enter mnemonic', model)
        }
        const name = model.ledgerName
        const description = model.description
        const found = ledgers.find(l => l.name === name)
        if (found) {
          return notifyError('Restore Wallet', 'Wallet name exists', model)
        }
        const ledger = yield call(restoreWallet, user, {
          name,
          mnemonic,
          description,
        })
        yield put(createActionObject('addLedger', { ledger }))
        yield put(createActionObject('contract/startup', {}))
        done()
      } catch (e) {
        console.log('restoreWallet', e)
        Alert.alert('Restore Wallet Failed', e.toString())
      }
    },
    *importSelectedFile({ payload: { user, done } }, { select, call, put }) {
      try {
        const model = yield select(state => state.ledger)
        const selectedLedgerFile =
          model.ledgerFiles[model.selectedLedgerFileIndex]
        const ledgers = model.ledgers
        const password = model.password
        const name = selectedLedgerFile.name
        const found = ledgers.find(l => l.name === name)
        if (!found) {
          const ledger = yield call(loadLedger, user, { name, password })
          yield put(createActionObject('addLedger', { ledger }))
        }
        done()
      } catch (e) {
        console.log('importSelectedFile', e)
        Alert.alert('Import Selected File Failed', e.toString())
      }
    },
  },
  subscriptions: {
    async setup({ history, dispatch }) {},
  },
}

export default ledger
