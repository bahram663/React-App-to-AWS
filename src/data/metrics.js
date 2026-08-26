// Static sample data. The app is intentionally backend-free so the whole thing
// ships as static assets to S3 and is served from CloudFront.

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export const kpis = [
  {
    id: 'requests',
    label: 'Requests served',
    value: 4_182_400,
    format: 'compact',
    delta: 12.4,
    upIsGood: true,
    period: 'vs. last month',
    spark: [38, 41, 39, 45, 44, 51, 49, 56, 58, 61, 60, 68],
  },
  {
    id: 'users',
    label: 'Active users',
    value: 12_940,
    format: 'compact',
    delta: 6.1,
    upIsGood: true,
    period: 'vs. last month',
    spark: [22, 24, 25, 24, 27, 29, 28, 31, 33, 34, 36, 38],
  },
  {
    id: 'latency',
    label: 'Edge latency (p95)',
    value: 84,
    format: 'ms',
    delta: -9.8,
    upIsGood: false,
    period: 'vs. last month',
    spark: [118, 114, 110, 112, 105, 101, 99, 96, 93, 90, 87, 84],
  },
  {
    id: 'errors',
    label: 'Error rate',
    value: 0.42,
    format: 'percent',
    delta: 0.7,
    upIsGood: false,
    period: 'vs. last month',
    spark: [0.9, 0.8, 0.7, 0.6, 0.6, 0.5, 0.5, 0.45, 0.4, 0.38, 0.4, 0.42],
  },
]

// Two series, one chart, one shared y-axis (both are "thousands of requests").
export const trafficTrend = {
  categories: MONTHS,
  series: [
    {
      id: 'cdn',
      name: 'CloudFront edge',
      values: [214, 232, 248, 261, 279, 301, 318, 344, 366, 389, 402, 431],
    },
    {
      id: 'origin',
      name: 'S3 origin',
      values: [58, 55, 51, 48, 44, 41, 37, 33, 30, 27, 24, 22],
    },
  ],
}

export const cacheHitByRegion = [
  { region: 'us-east-1', value: 97.2 },
  { region: 'eu-west-1', value: 95.8 },
  { region: 'ap-south-1', value: 94.1 },
  { region: 'sa-east-1', value: 91.6 },
  { region: 'ap-northeast-1', value: 89.4 },
  { region: 'af-south-1', value: 84.9 },
]

export const deployments = [
  { sha: 'a91c4f2', branch: 'main', status: 'good', duration: '1m 52s', when: '2 hours ago', by: 'ci-bot' },
  { sha: '7d30ba8', branch: 'main', status: 'good', duration: '2m 04s', when: 'yesterday', by: 'ci-bot' },
  { sha: '15ee9c1', branch: 'main', status: 'warning', duration: '4m 31s', when: '3 days ago', by: 'ci-bot' },
  { sha: 'c0442de', branch: 'main', status: 'good', duration: '1m 47s', when: '5 days ago', by: 'ci-bot' },
  { sha: 'bb7f019', branch: 'main', status: 'critical', duration: '0m 39s', when: '6 days ago', by: 'ci-bot' },
]

export function formatValue(value, format) {
  switch (format) {
    case 'compact':
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value)
    case 'percent':
      return `${value.toFixed(2)}%`
    case 'ms':
      return `${value} ms`
    default:
      return new Intl.NumberFormat('en-US').format(value)
  }
}
