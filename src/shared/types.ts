import * as z from "zod";

import { type Prisma } from "~/generated/prisma/client";

export type JsonObject = Prisma.JsonObject;

export const jsonObjectSchema = z
  .record(z.string(), z.unknown())
  .transform((val) => val as JsonObject);
