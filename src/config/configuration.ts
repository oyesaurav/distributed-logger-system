export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  clickhouse: {
    host: process.env.CLICKHOUSE_HOST,
    username: process.env.CLICKHOUSE_USERNAME,
    password: process.env.CLICKHOUSE_PASSWORD,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
});
