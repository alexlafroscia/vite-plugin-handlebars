import { RollupOutput, OutputAsset, OutputChunk } from 'rollup';
import { parse } from 'path';

type Output = OutputAsset | OutputChunk;

export function getHtmlSource(rollupOutput: RollupOutput | RollupOutput[]): string {
  const output: Output[] = Array.isArray(rollupOutput)
    ? rollupOutput
        .map((rollupOutput) => rollupOutput.output)
        .reduce((acc, output) => [...acc, ...output], [] as Output[])
    : rollupOutput.output;

  // @ts-expect-error
  const outputAssets: OutputAsset[] = output.filter((file) => file.type === 'asset');
  const htmlOutput = outputAssets.find((file) => parse(file.fileName).ext === '.html');

  if (!htmlOutput) {
    throw new Error('No HTML output in bundle');
  }

  return typeof htmlOutput.source === 'string' ? htmlOutput.source : htmlOutput.source.toString();
}
