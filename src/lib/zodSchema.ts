import z from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, { error: "Email is required" }).email({
    error: "Enter a valid email",
  }),
  password: z.string().min(8, { error: "Password must be at least 8 chars" }),
  rememberMe: z.boolean().optional(),
});

export type SignIn = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  email: z.string().min(1, { error: "Email is required" }).email({
    error: "Enter a valid email",
  }),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 chars" })
    .max(128, { error: "Password must be at most 128 chars" }),
  role: z.enum(["buyer", "seller"]),
});

export type SignUp = z.infer<typeof signUpSchema>;

export const currencySchema = z.enum(["USD", "INR", "PKR", "BDT", "USDT"]);

export const productSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  description: z.string().min(1, { error: "Description is required" }),
  category: z.string().min(1, { error: "Category is required" }),
  badge: z.string().optional(),
  imageUrl: z.string().max(500).optional(),
  listPrice: z.number({ error: "List price is required" }).positive({
    error: "List price must be positive",
  }),
  salePrice: z
    .number()
    .positive({ error: "Sale price must be positive" })
    .optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const ratingSchema = z.object({
  productId: z.string().min(1, { error: "Product is required" }),
  stars: z.number({ error: "Stars are required" }).int().min(1).max(5),
  comment: z.string().max(500, { error: "Comment is too long" }).optional(),
});

export type RatingInput = z.infer<typeof ratingSchema>;

export const cartSchema = z.object({
  productId: z.string().min(1, { error: "Product is required" }),
  qty: z.number({ error: "Quantity is required" }).int().min(1).max(99),
});

export type CartInput = z.infer<typeof cartSchema>;

export const paymentMethodSchema = z.object({
  type: z.enum(["manual", "online"]),
  channel: z.string().min(1, { error: "Channel is required" }),
  label: z.string().min(1, { error: "Label is required" }),
  details: z.string().min(1, { error: "Details are required" }),
});

export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;

export const settingsSchema = z.object({
  currency: currencySchema,
  paymentMethod: z.string().min(1, { error: "Payment method is required" }),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export const profileSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  image: z.string().max(500).optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "delivered"]),
});

export type OrderStatusInput = z.infer<typeof orderStatusSchema>;

export const checkoutSchema = z.object({
  currency: currencySchema,
  paymentMethod: z.string().min(1, { error: "Payment method is required" }),
  advanceProof: z.string().max(500).optional(),
  couponCode: z.string().max(32).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
