
import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { PrismaClient, AdminRole } from '@prisma/client';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const passwordPrompt = require('password-prompt') as (
  message: string,
  options?: { method?: 'mask' | 'hide' },
) => Promise<string>;

const prisma = new PrismaClient();

async function main() {
  const rl = readline.createInterface({ input, output });

  let email: string;
  let name: string;

  try {
    email = (await rl.question('Super-admin email: '))
      .trim()
      .toLowerCase();
    name = (await rl.question('Super-admin name: ')).trim();
  } finally {
    rl.close();
  }

  const password = await passwordPrompt('Super-admin password: ', {
    method: 'hide',
  });

  if (!email || !name || password.length < 12 || password.length > 128) {
    throw new Error(
      'Email and name are required; password must be 12–128 characters.',
    );
  }

  try {
    const existing = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existing) {
      throw new Error('An admin account with that email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.adminUser.create({
      data: {
        email,
        name,
        passwordHash,
        role: AdminRole.SUPER_ADMIN,
        isActive: true,
      },
    });

    console.log('Super-admin account created successfully.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Failed to create super-admin.',
  );
  process.exitCode = 1;
});
