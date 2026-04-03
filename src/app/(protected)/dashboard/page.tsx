import { Link } from "@heroui/react";

export default function ProtectedHomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard Home</h1>
      <p className="text-foreground/80 text-sm">
        역할 기반 메뉴 진입점입니다. 좌측 네비게이션으로 각 섹션을 이동할 수
        있습니다.
      </p>
      <Link href="/api/protected/ping">/api/protected/ping 확인</Link>
    </div>
  );
}
