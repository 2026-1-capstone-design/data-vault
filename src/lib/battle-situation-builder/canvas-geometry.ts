type Point = { x: number; y: number };

type CanvasSpace = {
  width: number;
  height: number;
  arenaRadius: number;
};

export function toCanvasPoint(point: Point, space: CanvasSpace): Point {
  const scale = Math.min(space.width, space.height) / (2 * space.arenaRadius);

  return {
    x: space.width / 2 + point.x * scale,
    y: space.height / 2 - point.y * scale,
  };
}
