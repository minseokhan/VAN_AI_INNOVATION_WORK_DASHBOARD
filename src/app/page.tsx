import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { logout } from "./(auth)/actions";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/projects/labels";
import { Avatar } from "@/components/ui/Avatar";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

// 임시 페이지 — UI 키트 스타일 확인용. step 1(dashboard-shell)에서 (dashboard)/page.tsx로 교체
export default async function Home() {
  const user = await requireUser();
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
      <PageHeader
        title="UI 키트"
        actions={
          <Button>
            <Plus size={16} strokeWidth={1.75} /> 새 프로젝트
          </Button>
        }
      />
      <p className="text-sm text-slate-700">{user.name}님, 환영합니다.</p>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">버튼</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="text">Text</Button>
          <Button size="sm">Small</Button>
          <Button size="sm" variant="secondary">Small</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">배지</h2>
        <div className="flex flex-wrap gap-2">
          {(["UNASSIGNED", "IN_PROGRESS", "DONE"] as const).map((s) => (
            <Badge key={s} tone={STATUS_TONE[s]}>{STATUS_LABEL[s]}</Badge>
          ))}
          <Badge tone="amber">미답변</Badge>
          <Badge tone="red">삭제</Badge>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">카드</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card href="/">
            <div className="flex items-center justify-between">
              <Badge tone="navy">진행중</Badge>
              <span className="text-xs text-slate-500">3일 전</span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900">링크 카드</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">hover 시 테두리가 navy-500으로 바뀝니다.</p>
            <ProgressBar value={62} className="mt-4" />
            <div className="mt-3">
              <AvatarGroup names={["한민석", "Kim Minji", "이서연", "박지훈", "최유진"]} />
            </div>
          </Card>
          <Card>
            <h3 className="text-base font-semibold text-slate-900">일반 카드</h3>
            <ProgressBar value={0} className="mt-4" />
            <ProgressBar value={100} className="mt-2" />
          </Card>
        </div>
      </section>

      <section className="max-w-sm space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">입력</h2>
        <Field id="title" label="제목">
          <Input id="title" placeholder="프로젝트 제목" />
        </Field>
        <Field id="summary" label="요약" error="요약은 필수입니다">
          <Textarea id="summary" aria-invalid />
        </Field>
        <Field id="position" label="포지션">
          <Select id="position" defaultValue="FE">
            <option value="FE">프론트</option>
            <option value="BE">백엔드</option>
          </Select>
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">아바타</h2>
        <div className="flex items-center gap-2">
          <Avatar name="한민석" />
          <Avatar name="Kim Minji" />
          <Avatar name="" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">빈 상태</h2>
        <EmptyState message="아직 프로젝트가 없습니다" action={<Button variant="secondary" size="sm">새로 만들기</Button>} />
      </section>

      <form action={logout}>
        <Button variant="text" type="submit">로그아웃</Button>
      </form>
    </main>
  );
}
