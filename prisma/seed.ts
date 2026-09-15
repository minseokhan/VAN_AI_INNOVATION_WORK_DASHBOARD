import { hash } from "bcryptjs";
import { readFileSync } from "node:fs";
import path from "node:path";
import { db } from "../src/lib/db";

type SeedProject = {
  code: string;
  category: string;
  priority: string;
  title: string;
  summary: string;
  description: string;
  features: string[];
  dueDate?: string;
};

async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error("ADMIN_USERNAME / ADMIN_PASSWORD 환경변수가 필요합니다.");
  }
  const passwordHash = await hash(password, 10);
  await db.user.upsert({
    where: { username },
    update: { passwordHash, role: "ADMIN", adminType: "DEV", approved: true },
    create: { username, passwordHash, name: "운영진", role: "ADMIN", adminType: "DEV", approved: true },
  });
  console.log(`admin upserted: ${username}`);
}

async function seedProjects() {
  const file = path.join(__dirname, "seed-projects.json");
  const projects = JSON.parse(readFileSync(file, "utf8")) as SeedProject[];
  let featuresCreated = 0;

  for (const p of projects) {
    const data = {
      category: p.category,
      priority: p.priority,
      title: p.title,
      summary: p.summary,
      description: p.description,
      dueDate: p.dueDate ? new Date(p.dueDate) : null,
    };
    const project = await db.project.upsert({
      where: { code: p.code },
      update: data,
      create: { code: p.code, ...data },
    });

    // 재실행 시 팀이 편집한 체크리스트를 덮어쓰지 않는다: Feature가 0개일 때만 생성
    const count = await db.feature.count({ where: { projectId: project.id } });
    if (count === 0 && p.features.length > 0) {
      await db.feature.createMany({
        data: p.features.map((title, order) => ({ projectId: project.id, title, order })),
      });
      featuresCreated += p.features.length;
    }
  }
  console.log(`projects upserted: ${projects.length}, features created: ${featuresCreated}`);
}

async function main() {
  await seedAdmin();
  await seedProjects();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
