import { RollupOutput, OutputAsset, OutputChunk } from 'rollup';
import { parse } from 'path';

type Output = OutputAsset | OutputChunk;

export function getHtmlSource(rollupOutput: RollupOutput | RollupOutput[]): string {
  const output: Output[] = Array.isArray(rollupOutput)
    ? rollupOutput.reduce((acc, output) => {
        return [...acc, ...output.output];
      }, [])
    : rollupOutput.output;

  // @ts-expect-error
  const outputAssets: OutputAsset[] = output.filter((file) => file.type === 'asset');
  const htmlOutput = outputAssets.find((file) => parse(file.fileName).ext === '.html');

  return typeof htmlOutput.source === 'string' ? htmlOutput.source : htmlOutput.source.toString();
}
