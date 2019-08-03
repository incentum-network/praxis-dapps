import { uniqueKey, ActionJson, OutputJson, TemplateJson } from '@incentum/praxis-interfaces'
import { startConnection, ConnectionOptions, extensions } from '@incentum/praxis-db';
import { InputJson, inputFromOutput } from '@incentum/praxis-contracts';

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
  } finally {
    await queryRunner.release()
    await conn.close()
  }
  await startConnection(defaultOpts)
}

export async function deleteSpace(context: any, space: string) {
  try {
    await context.functions.deleteSpace(space)
  } catch (e) {
  }
}
