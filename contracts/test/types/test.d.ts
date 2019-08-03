declare var expect: any

declare var describe: any
declare var beforeAll: any
declare var afterAll: any
declare var it: any

declare module '*.jsonata!text' {
  const content: string;
  export default content;
}
