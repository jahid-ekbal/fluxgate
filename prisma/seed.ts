import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/prisma/client";
import { auth } from "../src/lib/auth";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaLibSql({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

const seedUsers = [
  {
    email: process.env.ADMIN_EMAIL ?? "admin@example.com",
    password: process.env.ADMIN_PASSWORD ?? "Admin12345",
    name: process.env.ADMIN_NAME ?? "Admin",
    role: "admin",
  },
  {
    email: process.env.BUYER_EMAIL ?? "buyer@example.com",
    password: process.env.BUYER_PASSWORD ?? "Buyer12345",
    name: process.env.BUYER_NAME ?? "Buyer",
    role: "buyer",
  },
  {
    email: process.env.SELLER_EMAIL ?? "seller@example.com",
    password: process.env.SELLER_PASSWORD ?? "Seller12345",
    name: process.env.SELLER_NAME ?? "Seller",
    role: "seller",
  },
];

type ProductInput = {
  name: string;
  description: string;
  category: string;
  badge: string;
  listPrice: number;
  salePrice: number;
};

const seedProducts: ProductInput[] = [
  {
    name: "BlueStacks 4",
    description: "The fastest and safest Android emulator for PC",
    category: "Software",
    badge: "PAID",
    listPrice: 29.99,
    salePrice: 20.99,
  },
  {
    name: "BlueStacks 5",
    description: "Latest version with enhanced performance and features",
    category: "Software",
    badge: "LATEST",
    listPrice: 39.99,
    salePrice: 27.99,
  },
  {
    name: "MSI 4",
    description: "Professional mobile streaming utility",
    category: "Software",
    badge: "PAID",
    listPrice: 24.99,
    salePrice: 17.49,
  },
  {
    name: "MSI 5",
    description: "Next-generation mobile streaming with advanced features",
    category: "Software",
    badge: "LATEST",
    listPrice: 34.99,
    salePrice: 24.49,
  },
  {
    name: "Android Emulator Pro",
    description: "Lightweight and powerful Android emulator",
    category: "Software",
    badge: "POPULAR",
    listPrice: 19.99,
    salePrice: 13.99,
  },
  {
    name: "Windows 10 Pro Lite",
    description: "Optimized Windows 10 Pro with reduced bloatware",
    category: "Operating Systems",
    badge: "LITE",
    listPrice: 49.99,
    salePrice: 34.99,
  },
  {
    name: "Windows 10 Pro (Full)",
    description: "Complete Windows 10 Pro with all features",
    category: "Operating Systems",
    badge: "FULL",
    listPrice: 59.99,
    salePrice: 41.99,
  },
  {
    name: "Windows 11 Pro Lite",
    description: "Optimized Windows 11 Pro, faster and cleaner",
    category: "Operating Systems",
    badge: "LITE",
    listPrice: 69.99,
    salePrice: 48.99,
  },
  {
    name: "Windows 11 Pro (Full)",
    description: "Complete Windows 11 Pro with all latest features",
    category: "Operating Systems",
    badge: "LATEST",
    listPrice: 79.99,
    salePrice: 55.99,
  },
  {
    name: "Ubuntu Linux Pro",
    description: "Ubuntu with all drivers pre-installed",
    category: "Operating Systems",
    badge: "FREE+",
    listPrice: 39.99,
    salePrice: 27.99,
  },
  {
    name: "Debian Linux Complete",
    description: "Debian with optimized drivers and packages",
    category: "Operating Systems",
    badge: "DISTRO",
    listPrice: 34.99,
    salePrice: 24.49,
  },
  {
    name: "Fedora Linux Advanced",
    description: "Latest Fedora with cutting-edge software",
    category: "Operating Systems",
    badge: "DISTRO",
    listPrice: 29.99,
    salePrice: 20.99,
  },
  {
    name: "Professional Logo Design",
    description: "Custom professional logo design service",
    category: "Design & Development",
    badge: "DESIGN",
    listPrice: 79.99,
    salePrice: 55.99,
  },
  {
    name: "Website Design Package",
    description: "Complete website design with modern UI/UX",
    category: "Design & Development",
    badge: "DESIGN",
    listPrice: 299.99,
    salePrice: 209.99,
  },
  {
    name: "Website Development",
    description: "Full website development with backend",
    category: "Design & Development",
    badge: "DEVELOP",
    listPrice: 499.99,
    salePrice: 349.99,
  },
  {
    name: "Video Editing Service",
    description: "Professional video editing and post-production",
    category: "Design & Development",
    badge: "MEDIA",
    listPrice: 99.99,
    salePrice: 69.99,
  },
  {
    name: "Photo Editing & Enhancement",
    description: "Professional photo editing and retouching",
    category: "Design & Development",
    badge: "MEDIA",
    listPrice: 49.99,
    salePrice: 34.99,
  },
  {
    name: "Professional Gmail Setup",
    description: "Professional Gmail configuration and optimization",
    category: "Design & Development",
    badge: "EMAIL",
    listPrice: 24.99,
    salePrice: 17.49,
  },
  {
    name: "Social Media Profile Optimization",
    description:
      "Complete social media profile optimization across all platforms",
    category: "Design & Development",
    badge: "SOCIAL",
    listPrice: 34.99,
    salePrice: 24.49,
  },
  {
    name: "Free Fire Paid Sensitivity",
    description: "Optimized sensitivity settings for Free Fire",
    category: "Gaming & Utilities",
    badge: "GAMING",
    listPrice: 9.99,
    salePrice: 6.99,
  },
  {
    name: "PC Optimization Service",
    description: "Complete PC optimization and cleanup",
    category: "Gaming & Utilities",
    badge: "UTILITY",
    listPrice: 29.99,
    salePrice: 20.99,
  },
  {
    name: "Discord Bot Development",
    description: "Custom Discord bot with advanced features",
    category: "Gaming & Utilities",
    badge: "DEVELOP",
    listPrice: 149.99,
    salePrice: 104.99,
  },
  {
    name: "TCP Bot Package",
    description: "Advanced TCP bot with multiple features",
    category: "Gaming & Utilities",
    badge: "DEVELOP",
    listPrice: 59.99,
    salePrice: 41.99,
  },
  {
    name: "Free Fire Gaming Panel",
    description: "Complete gaming panel management system",
    category: "Gaming & Utilities",
    badge: "PANEL",
    listPrice: 129.99,
    salePrice: 90.99,
  },
  {
    name: "Windows Terminal Customization",
    description: "Professional Windows Terminal themes and configurations",
    category: "Terminal & Customization",
    badge: "TERMINAL",
    listPrice: 19.99,
    salePrice: 13.99,
  },
  {
    name: "Linux Terminal Customization",
    description: "Beautiful Bash, Zsh, and Fish shell configurations",
    category: "Terminal & Customization",
    badge: "TERMINAL",
    listPrice: 14.99,
    salePrice: 10.49,
  },
  {
    name: "macOS Terminal Pro",
    description: "Premium macOS terminal themes and utilities",
    category: "Terminal & Customization",
    badge: "TERMINAL",
    listPrice: 24.99,
    salePrice: 17.49,
  },
  {
    name: "Terminal Icons & Fonts Pack",
    description: "50+ terminal fonts and icon packs",
    category: "Terminal & Customization",
    badge: "FONTS",
    listPrice: 9.99,
    salePrice: 6.99,
  },
  {
    name: "NeoVim Complete Setup",
    description: "Complete NeoVim configuration with plugins",
    category: "Terminal & Customization",
    badge: "EDITOR",
    listPrice: 29.99,
    salePrice: 20.99,
  },
  {
    name: "VS Code Terminal Pro",
    description: "Advanced VS Code integrated terminal themes",
    category: "Terminal & Customization",
    badge: "EDITOR",
    listPrice: 12.99,
    salePrice: 9.09,
  },
  {
    name: "Shell Prompt Customization",
    description: "Custom shell prompts for any OS",
    category: "Terminal & Customization",
    badge: "PROMPT",
    listPrice: 11.99,
    salePrice: 8.39,
  },
  {
    name: "Docker Terminal Setup",
    description: "Optimized terminal environment for Docker",
    category: "Terminal & Customization",
    badge: "DOCKER",
    listPrice: 17.99,
    salePrice: 12.59,
  },
];

const fallbackRates = [
  { code: "USD", perUsd: 1 },
  { code: "INR", perUsd: 83 },
  { code: "PKR", perUsd: 278 },
  { code: "BDT", perUsd: 110 },
  { code: "USDT", perUsd: 1 },
];

const sellerMethodSeeds = [
  {
    type: "manual",
    channel: "whatsapp",
    label: "WhatsApp",
    details: "Chat to order with 50% advance",
  },
  {
    type: "manual",
    channel: "discord",
    label: "Discord ticket",
    details: "Open a ticket with 50% advance proof",
  },
  {
    type: "online",
    channel: "crypto",
    label: "Crypto (USDT)",
    details: "Pay to seller wallet address on order",
  },
];

const ensureUser = async (input: {
  email: string;
  password: string;
  name: string;
  role: string;
}) => {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!existing) {
    await auth.api.signUpEmail({
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
      },
    });
  }

  const user = await prisma.user.update({
    where: { email: input.email },
    data: {
      name: input.name,
      role: input.role,
      emailVerified: true,
    },
  });

  return user;
};

const main = async () => {
  const users: Record<string, string> = {};
  for (const input of seedUsers) {
    const user = await ensureUser(input);
    users[input.role] = user.id;
  }

  const legacy = await prisma.user.findUnique({
    where: { email: "user@example.com" },
  });
  if (legacy) {
    await prisma.session.deleteMany({ where: { userId: legacy.id } });
    await prisma.account.deleteMany({ where: { userId: legacy.id } });
    await prisma.cartItem.deleteMany({ where: { buyerId: legacy.id } });
    await prisma.rating.deleteMany({ where: { buyerId: legacy.id } });
    await prisma.user.delete({ where: { id: legacy.id } });
  }

  const sellerId = users["seller"];

  const categoryIds: Record<string, string> = {};
  for (const product of seedProducts) {
    if (!categoryIds[product.category]) {
      const slug = product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const category = await prisma.category.upsert({
        where: { name: product.category },
        update: {},
        create: { name: product.category, slug },
      });
      categoryIds[product.category] = category.id;
    }
  }

  const tagIds: Record<string, string> = {};
  for (const product of seedProducts) {
    if (!tagIds[product.badge]) {
      const tag = await prisma.tag.upsert({
        where: { name: product.badge },
        update: {},
        create: { name: product.badge },
      });
      tagIds[product.badge] = tag.id;
    }
  }

  for (const product of seedProducts) {
    await prisma.product.upsert({
      where: { id: product.name },
      update: {
        ...product,
        sellerId,
        status: "approved",
        categoryId: categoryIds[product.category],
      },
      create: {
        id: product.name,
        ...product,
        sellerId,
        status: "approved",
        categoryId: categoryIds[product.category],
      },
    });
    await prisma.productTag.upsert({
      where: {
        productId_tagId: {
          productId: product.name,
          tagId: tagIds[product.badge],
        },
      },
      update: {},
      create: { productId: product.name, tagId: tagIds[product.badge] },
    });
  }

  await prisma.coupon.upsert({
    where: { code: "EKBAL30" },
    update: { percent: 30, active: true },
    create: { code: "EKBAL30", percent: 30, active: true },
  });

  for (const rate of fallbackRates) {
    await prisma.currencyRate.upsert({
      where: { code: rate.code },
      update: { perUsd: rate.perUsd },
      create: rate,
    });
  }

  const methodCount = await prisma.sellerPaymentMethod.count({
    where: { sellerId },
  });
  if (methodCount === 0) {
    for (const method of sellerMethodSeeds) {
      await prisma.sellerPaymentMethod.create({
        data: { ...method, sellerId },
      });
    }
  }

  const productCount = await prisma.product.count();
  console.log({
    seededUsers: seedUsers.map((u) => ({ email: u.email, role: u.role })),
    productCount,
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
