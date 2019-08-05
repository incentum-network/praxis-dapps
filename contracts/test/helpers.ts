import { uniqueKey, ActionJson, OutputJson, TemplateJson } from '@incentum/praxis-interfaces'
import { startConnection, ConnectionOptions, extensions } from '@incentum/praxis-db';
import { InputJson, inputFromOutput } from '@incentum/praxis-contracts';
import { Hits } from '@incentum/praxis-spaces';

let x: any
export const setExtensions = (contractHash, contractKey, contexts, timestamp: number): any => {
  x = extensions(contractHash, contractKey, {} as any, contexts, timestamp).jsonata
  return x
}

export function createPraxInput(ledger: string, amount: number): InputJson {
  const total = x.toCoinUnit(amount, x.coin.praxDecimals)
  const prax = x.coin.prax(total)
  const output: OutputJson = x.output(ledger, [prax])
  return inputFromOutput(output)
}

const testDatabase = 'incentum_test'
const defaultOpts: ConnectionOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '1nc3nt5m',
  database: testDatabase,
  entities: [],
}

export async function dropAndCreate() {
  try {
    const conn = await startConnection(defaultOpts)
    const queryRunner = conn.createQueryRunner()
    try {
      if (await queryRunner.hasDatabase(testDatabase)) {
        await queryRunner.dropDatabase(testDatabase)
        await queryRunner.createDatabase(testDatabase)
      } else {
        await queryRunner.createDatabase(testDatabase)
      }
    } catch (e) {
      console.log('dropAndCreate error', e)
    } finally {
      await queryRunner.release()
      await conn.close()
    }
    await startConnection(defaultOpts)
  } catch (e) {
    console.log('dropAndCreate error', e)
    throw e
  }
}

export async function deleteSpace(context: any, space: string) {
  try {
    await context.functions.deleteSpace(space)
  } catch (e) {
  }
}

export async function findDocumentById(context: any, space: string, id: string, docType: string, retrieveFields: string[], log: boolean = false) {
  try {
    const queryText = `id:"${id}" docType:"${docType}"`
    const query = {
      queryParser: {
        class: 'classic',
        defaultOperator: 'and',
        defaultField: 'id',
      },
      retrieveFields,
      queryText,
    }
    const { error, hits, e}: { error: boolean, hits: Hits, e?: any} = await context.functions.searchSpace(space, query)
    if (error) {console.log('findDocumentById error', e)}
    const doc = hits.totalHits > 0 ? hits.hits[0].fields : undefined
    if (log) {
      console.log('findDocumentById hits', hits)
      console.log('findDocumentById doc', doc)
    }
    return doc
  } catch (e) {
  }
}

export async function findDocumentByQueryText(context: any, space: string, queryText: string, retrieveFields: string[], log: boolean = false) {
  try {
    const query = {
      queryParser: {
        class: 'classic',
        defaultOperator: 'and',
        defaultField: 'id',
      },
      retrieveFields,
      queryText,
    }
    const { error, hits, e}: { error: boolean, hits: Hits, e?: any} = await context.functions.searchSpace(space, query)
    if (error) {console.log('findDocumentByQueryText error', e)}
    const doc = hits.totalHits > 0 ? hits.hits[0].fields : undefined
    if (log) {
      console.log('findDocumentById hits', hits)
      console.log('findDocumentById doc', doc)
    }
    return doc
  } catch (e) {
  }
}

export async function findByQuery(context: any, space: string, query: any, log: boolean = false): Promise<Hits | undefined> {
  try {
    const { error, hits, e}: { error: boolean, hits: Hits, e?: any} = await context.functions.searchSpace(space, query)
    if (error) {
      console.log('findDocumentByQuery error', e)
      return undefined
    }
    if (log) {
      console.log('findByQuery hits', hits)
    }
    return hits
  } catch (e) {
  }
}
