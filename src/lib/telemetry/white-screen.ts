export type WhiteScreenSample = {
  selector: string;
  isBlank: boolean;
};

export type WhiteScreenOptions = {
  threshold?: number;
};

export type WhiteScreenEvaluation = {
  isWhiteScreen: boolean;
  blankRatio: number;
  blankCount: number;
  sampleSize: number;
  threshold: number;
};

const defaultThreshold = 0.8;

export function evaluateWhiteScreen(
  samples: WhiteScreenSample[],
  options: WhiteScreenOptions = {}
): WhiteScreenEvaluation {
  const threshold = options.threshold ?? defaultThreshold;
  const sampleSize = samples.length;

  if (sampleSize === 0) {
    return {
      isWhiteScreen: false,
      blankRatio: 0,
      blankCount: 0,
      sampleSize,
      threshold
    };
  }

  const blankCount = samples.filter((sample) => sample.isBlank).length;
  const blankRatio = blankCount / sampleSize;

  return {
    isWhiteScreen: blankRatio >= threshold,
    blankRatio,
    blankCount,
    sampleSize,
    threshold
  };
}
