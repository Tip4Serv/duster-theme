import { z } from 'zod';

// Store Information
export const StoreSchema = z.object({
  id: z.number(),
  owner: z.number(),
  title: z.string(),
  description: z.string(),
  domain: z.string(),
  logo: z.string().optional(),
  currency: z.string(),
  timezone: z.string(),
  color: z.string().optional(),
  country: z.string().optional(),
  social_medias: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
    discord: z.string().optional(),
    twitch: z.string().optional(),
    steam: z.string().optional(),
  }).optional(),
  menu_links: z.array(z.object({
    title: z.string(),
    link: z.string(),
  })).optional(),
});

export type Store = z.infer<typeof StoreSchema>;

// Theme Information
export const ThemeSchema = z.object({
  id: z.number(),
  short_name: z.string(),
  name: z.string(),
  slug: z.object({
    product: z.string(),
    category: z.string(),
  }),
  images: z.object({
    light: z.object({
      logo_header: z.string().optional(),
      logo_footer: z.string().optional(),
      home_cover: z.string().optional(),
      cover: z.string().optional(),
    }),
    dark: z.object({
      logo_header: z.string().optional(),
      logo_footer: z.string().optional(),
      home_cover: z.string().optional(),
      cover: z.string().optional(),
    }),
  }),
  mode: z.enum(['light', 'dark']),
  widgets: z.object({
    top_customer: z.number(),
    featured_product: z.number(),
    top_product: z.number(),
    related_product: z.number(),
    description: z.string(),
  }),
});

export type Theme = z.infer<typeof ThemeSchema>;

// Category
export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  hide: z.boolean(),
  main_redirect: z.boolean(),
  parent_id: z.number().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export type Category = z.infer<typeof CategorySchema>;

export const CategoriesResponseSchema = z.object({
  categories: z.array(CategorySchema),
  categories_count: z.number(),
});

export type CategoriesResponse = z.infer<typeof CategoriesResponseSchema>;

// Product (General)
export const ProductGeneralSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.boolean(),
  slug: z.string(),
  price: z.number(),
  old_price: z.number().optional(),
  percent_off: z.number().optional(),
  recurring_discount: z.union([z.boolean(), z.number()]).optional(),
  small_description: z.string().optional(),
  category: z.union([z.number(), z.object({ id: z.number(), name: z.string() })]).nullable(),
  subscription: z.boolean(),
  stock: z.number().optional(),
  duration_periodicity: z.string().optional(),
  period_num: z.number().optional(),
  trial: z.number().optional(),
  featured: z.boolean(),
  image: z.string().optional(),
  created_date: z.number(),
  subscription_cycle: z.string().optional(),
});

export type ProductGeneral = z.infer<typeof ProductGeneralSchema>;

export const ProductsResponseSchema = z.object({
  products: z.array(ProductGeneralSchema),
  product_count: z.number(),
});

export type ProductsResponse = z.infer<typeof ProductsResponseSchema>;

// Custom Field
export const CustomFieldOptionSchema = z.object({
  id: z.coerce.number(),
  order: z.coerce.number(),
  name: z.string(),
  value: z.union([z.string(), z.number()]),
  price: z.coerce.number(),
});

export const CustomFieldSchema = z.object({
  id: z.number(),
  order: z.number(),
  name: z.string(),
  type: z.string(),
  marker: z.string().optional(),
  instruction: z.string().optional(),
  if_not_filled: z.string().optional(),
  default_value: z.union([z.string(), z.number()]).optional(),
  required: z.coerce.boolean(),
  minimum: z.coerce.number().optional(),
  maximum: z.coerce.number().optional(),
  step: z.coerce.number().optional(),
  number_type: z.string().optional(),
  price: z.coerce.number().optional(),
  options: z.array(CustomFieldOptionSchema).optional(),
});

export type CustomFieldOption = z.infer<typeof CustomFieldOptionSchema>;
export type CustomField = z.infer<typeof CustomFieldSchema>;

// Custom Rule
export const CustomRuleSchema = z.object({
  id: z.number(),
  order: z.number(),
  name: z.string(),
  type: z.string(),
  min: z.number().optional(),
  max: z.number().optional(),
  fields: z.array(z.number()),
});

export type CustomRule = z.infer<typeof CustomRuleSchema>;

// Product (Detailed)
export const ProductDetailedSchema = ProductGeneralSchema.extend({
  description: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  youtube: z.string().optional(),
  server_choice: z.coerce.boolean().optional(),
  server_options: z
    .array(
      z.object({
        id: z.coerce.number(),
        name: z.string(),
      })
    )
    .optional(),
  quantity: z.boolean(),
  cmd_multiplier: z.boolean().optional(),
  files: z.boolean(),
  giftcard: z.boolean(),
  enable_stock: z.boolean(),
  cumul_sub: z.boolean(),
  onetime_sub: z.boolean(),
  enable_trial: z.boolean(),
  purchase_limit: z.any().optional(),
  custom_rules: z.array(CustomRuleSchema).optional(),
  custom_fields: z.array(CustomFieldSchema).optional(),
  last_edited: z.number().optional(),
  renewal_start: z.string().optional(),
});

export type ProductDetailed = z.infer<typeof ProductDetailedSchema>;

// Checkout Request
export const CheckoutUserSchema = z.object({
  email: z.string().email(),
  username: z.string().optional(),
  minecraft_username: z.string().optional(),
  minecraft_uuid: z.string().optional(),
  steam_id: z.string().optional(),
  discord_id: z.string().optional(),
  epic_id: z.string().optional(),
  eos_id: z.string().optional(),
  fivem_citizen_id: z.string().optional(),
  ingame_username: z.string().optional(),
  rust_username: z.string().optional(),
});

export type CheckoutUser = z.infer<typeof CheckoutUserSchema>;

export const CheckoutProductSchema = z.object({
  product_id: z.number(),
  type: z.enum(['addtocart', 'subscribe']),
  quantity: z.number(),
  donation_amount: z.number().optional(),
  server_selection: z.number().optional(),
  custom_fields: z.record(z.string(), z.any()).optional(),
});

export type CheckoutProduct = z.infer<typeof CheckoutProductSchema>;

export const CheckoutRequestSchema = z.object({
  products: z.array(CheckoutProductSchema),
  user: CheckoutUserSchema,
  redirect_success_checkout: z.string().optional(),
  redirect_canceled_checkout: z.string().optional(),
  redirect_pending_checkout: z.string().optional(),
});

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

// Checkout Identifiers Response
export const CheckoutIdentifiersResponseSchema = z.object({
  identifiers: z.array(z.string()),
});

export type CheckoutIdentifiersResponse = z.infer<typeof CheckoutIdentifiersResponseSchema>;

// Checkout Response
export const CheckoutResponseSchema = z.object({
  url: z.string(),
});

export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;
