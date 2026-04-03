"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Circle, Group, Layer, Stage, Text } from "react-konva";

import { clampUnitPositionToArena } from "~/lib/battle-situation-builder/arena";

import type { BattleSituationCanvasProps } from "./BattleSituationCanvas.types";

const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 600;

export const BattleSituationCanvas = ({
  scene,
  width,
  height,
  draggable = true,
  selectedUnitId,
  onUnitPress,
  onEmptyPress,
  onUnitMove,
}: BattleSituationCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });

  useEffect(() => {
    if (width && height) {
      return;
    }

    const element = containerRef.current;
    if (!element) {
      return;
    }

    const update = () => {
      const nextWidth = Math.floor(element.clientWidth);
      const nextHeight = Math.floor(element.clientHeight);
      if (nextWidth > 0 && nextHeight > 0) {
        setContainerSize({
          width: nextWidth,
          height: nextHeight,
        });
      }
    };

    update();

    const observer = new ResizeObserver(() => {
      update();
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [height, width]);

  const stageWidth = width ?? Math.max(320, containerSize.width);
  const stageHeight = useMemo(() => {
    if (height) {
      return height;
    }
    return Math.max(360, containerSize.height);
  }, [containerSize.height, height]);

  const arenaPixelRadius = Math.max(
    40,
    Math.min(stageWidth, stageHeight) / 2 - 8,
  );
  const centerX = stageWidth / 2;
  const centerY = stageHeight / 2;
  const scale = arenaPixelRadius / scene.arena.radius;
  const handleBackgroundPress = () => {
    onEmptyPress?.();
  };

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden rounded-md"
    >
      <Stage
        width={stageWidth}
        height={stageHeight}
        onMouseDown={(event) => {
          const stage = event.target.getStage();
          if (stage && event.target === stage) {
            handleBackgroundPress();
          }
        }}
        onTouchStart={(event) => {
          const stage = event.target.getStage();
          if (stage && event.target === stage) {
            handleBackgroundPress();
          }
        }}
      >
        <Layer>
          <Circle
            x={centerX}
            y={centerY}
            radius={arenaPixelRadius}
            stroke="#94a3b8"
            strokeWidth={2}
            fill="#f8fafc"
            name="arena-surface"
            onMouseDown={handleBackgroundPress}
            onTouchStart={handleBackgroundPress}
          />

          {scene.units.map((unit) => {
            const pixel = worldToPixel(unit, centerX, centerY, scale);
            const team = scene.teams.find((item) => item.id === unit.teamId);
            const stroke =
              selectedUnitId === unit.unitId ? "#111827" : "#ffffff";
            const unitPixelRadius = Math.max(8, unit.unitRadius * scale);
            const rangeWorldRadius = unit.unitRadius + unit.range * 24;
            const rangePixelRadius = Math.max(
              unitPixelRadius + 2,
              rangeWorldRadius * scale,
            );
            const nameWidth = 80;

            return (
              <Group
                key={unit.unitId}
                x={pixel.x}
                y={pixel.y}
                draggable={draggable}
                dragBoundFunc={(pos) => {
                  const world = pixelToWorld(pos, centerX, centerY, scale);
                  const clamped = clampUnitPositionToArena(scene.arena, {
                    x: world.x,
                    y: world.y,
                    unitRadius: unit.unitRadius,
                  });
                  return worldToPixel(clamped, centerX, centerY, scale);
                }}
                onClick={() => onUnitPress?.(unit.unitId)}
                onTap={() => onUnitPress?.(unit.unitId)}
                onDragStart={() => onUnitPress?.(unit.unitId)}
                onDragMove={(event) => {
                  if (!draggable) {
                    return;
                  }
                  const world = pixelToWorld(
                    {
                      x: event.target.x(),
                      y: event.target.y(),
                    },
                    centerX,
                    centerY,
                    scale,
                  );
                  onUnitMove?.(unit.unitId, world);
                }}
                onDragEnd={(event) => {
                  if (!draggable) {
                    return;
                  }
                  const world = pixelToWorld(
                    {
                      x: event.target.x(),
                      y: event.target.y(),
                    },
                    centerX,
                    centerY,
                    scale,
                  );
                  onUnitMove?.(unit.unitId, world);
                }}
              >
                <Circle
                  radius={rangePixelRadius}
                  fillEnabled={false}
                  stroke={team?.color ?? "#94a3b8"}
                  strokeWidth={selectedUnitId === unit.unitId ? 2 : 1}
                  dash={[8, 6]}
                  opacity={selectedUnitId === unit.unitId ? 0.65 : 0.35}
                />
                <Circle
                  radius={unitPixelRadius}
                  fill={team?.color ?? "#94a3b8"}
                  stroke={stroke}
                  strokeWidth={2}
                />
                <Text
                  text={unit.name}
                  x={-nameWidth / 2}
                  y={unitPixelRadius + 6}
                  width={nameWidth}
                  align="center"
                  fontSize={11}
                  fill="#0f172a"
                  listening={false}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

function pixelToWorld(
  point: {
    x: number;
    y: number;
  },
  centerX: number,
  centerY: number,
  scale: number,
): { x: number; y: number } {
  return {
    x: (point.x - centerX) / scale,
    y: -(point.y - centerY) / scale,
  };
}

function worldToPixel(
  point: { x: number; y: number },
  centerX: number,
  centerY: number,
  scale: number,
): { x: number; y: number } {
  return {
    x: centerX + point.x * scale,
    y: centerY - point.y * scale,
  };
}
