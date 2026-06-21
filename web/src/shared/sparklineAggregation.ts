interface SparklineBucket {
  trueCount: number;
  falseCount: number;
}

export function aggregateHourPairs(data: SparklineBucket[]): SparklineBucket[] {
  const pairs: SparklineBucket[] = [];
  for (let i = 0; i < data.length; i += 2) {
    const a = data[i];
    const b = data[i + 1];
    pairs.push(
      b
        ? { trueCount: a.trueCount + b.trueCount, falseCount: a.falseCount + b.falseCount }
        : a,
    );
  }
  return pairs;
}
