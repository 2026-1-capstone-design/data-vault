import * as z from "zod";

export const arenaSchema = z.object({
  shape: z.literal("circle"),
  center: z.object({
    x: z.number(),
    y: z.number(),
  }),
  radius: z.number(),
});

export type Arena = z.infer<typeof arenaSchema>;

export const teamSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string(),
  namePrefix: z.string(),
});

export type Team = z.infer<typeof teamSchema>;

export const unitSchema = z.object({
  unitId: z.string(),
  name: z.string(),
  teamId: z.string(),
  x: z.number(),
  y: z.number(),
  unitRadius: z.number(),
  hp: z.number(),
  maxHp: z.number(),
  atk: z.number(),
  range: z.number(),
  moveSpeed: z.number(),
  attackSpeed: z.number(),
  skillDescription: z.string().optional(),
});

export type Unit = z.infer<typeof unitSchema>;

export const sceneSchema = z.object({
  arena: arenaSchema,
  teams: z.array(teamSchema),
  units: z.array(unitSchema),
});

export type Scene = z.infer<typeof sceneSchema>;

export const semanticUnitSchema = z.object({
  unitId: z.string(),
  name: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  stats: z.object({
    hp: z.number(),
    atk: z.number(),
    range: z.number(),
  }),
  skillDescription: z.string().optional(),
});
export type SemanticUnit = z.infer<typeof semanticUnitSchema>;

export const semanticSchema = z.object({
  arena: arenaSchema,
  allies: z.array(semanticUnitSchema),
  enemies: z.array(semanticUnitSchema),
});

export type Semantic = z.infer<typeof semanticSchema>;
