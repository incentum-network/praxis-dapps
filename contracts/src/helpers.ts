import { uniqueKey, ActionJson, TemplateJson } from '@incentum/praxis-interfaces'

export function createAction(ledger: string, contractHash: string, reducer: string, form: any): ActionJson {
  return {
    ledger,
    type: reducer,
    form,
    nonce: uniqueKey(),
    key: '',
    other: {},
    tags: [],
    transaction: uniqueKey(),
    inputs: [],
    outputs: [],
    signatures: [],
    contractHash,
    previousHash: null,
  }

}

export function createTemplate(name: string, ledger: string, reducers: any[]): TemplateJson {
  return {
    name,
    versionMajor: 0,
    versionMinor: 0,
    versionPatch: 1,
    description: 'Some description',
    ledger,
    other: {},
    tags: [],
    reducers,
  }
}
