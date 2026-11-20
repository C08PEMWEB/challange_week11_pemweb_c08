// src/config/prisma.ts
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL belum diisi di backend/.env.');
}

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!, // connection string POOLED
});

const prisma = new PrismaClient({
  adapter,
  log: [],
});

export default prisma;
