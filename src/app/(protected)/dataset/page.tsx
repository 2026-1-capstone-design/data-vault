"use client";

import { InputSection } from "./_components/input-section";
import { DatasetProvider } from "./_lib/context";

export default function DatasetPage() {
  return (
    <DatasetProvider>
      <div className="flex h-full gap-2 overflow-hidden">
        <section className="flex-2">
          <InputSection />
        </section>
        <section className="flex-5">{/* TODO: 출력 섹션 */}</section>
      </div>
    </DatasetProvider>
  );
}
