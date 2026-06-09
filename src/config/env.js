import "dotenv/config";

const required = [
  "MONGO_URI",
  "REDIS_URL",
];

for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongoUri: process.env.MONGO_URI,
  redisUrl: process.env.REDIS_URL,
  ffmpegPath: process.env.FFMPEG_PATH,
};
