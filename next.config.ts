import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stop 훅 검증 빌드는 NEXT_DIST_DIR=.next-check 로 실행해 dev 서버의 .next 를 덮어쓰지 않는다
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
