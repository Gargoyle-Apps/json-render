declare module "node:fs" {
  function mkdirSync(path: string, options?: { recursive?: boolean }): void;
  function writeFileSync(path: string, data: string, encoding?: string): void;
}
declare module "node:path" {
  function join(...paths: string[]): string;
  function resolve(...paths: string[]): string;
}
declare var process: {
  argv: string[];
  exit(code?: number): never;
};
