"use client";

import { InputSection } from "./_components/input-section";
import { OutputSection } from "./_components/output-section";
import { DatasetProvider } from "./_lib/context";

export default function DatasetPage() {
  return (
    <DatasetProvider>
      <div className="flex h-full gap-2 overflow-hidden">
        <section className="w-0 flex-2">
          <InputSection />
        </section>
        <section className="w-0 flex-5">
          <OutputSection />
        </section>
      </div>
    </DatasetProvider>
  );
}
