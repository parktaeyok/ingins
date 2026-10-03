# (주)인지아이앤에스 Next.js 1차 전환

기존 PHP 홈페이지의 공개 영역을 Next.js App Router와 Supabase로 옮기고, (주)인지아이앤에스의 제조 디지털 혁신 사업 내용을 반영한 1차 프로젝트입니다. 기존 `C:\Project\cursamanworks`는 수정하지 않습니다.

## 1차 범위

- 공개 홈페이지, 서비스, DX 진단, 교육·컨설팅, 사업분야, 기술정보, 회사소개
- 사업 문의·제조 DX 진단·교육 및 컨설팅 상담 신청
- Supabase PostgreSQL 저장
- 서버 입력 검증, 허니팟, DB 기반 30초 요청 제한
- 반응형 내비게이션, SEO metadata, sitemap, robots, 보안 헤더

관리자 로그인, 접수 목록, 콘텐츠 편집, 미디어, 영업·업무 기능은 후속 단계에서 구현합니다.

## 로컬 실행

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

`http://localhost:3000`에서 확인합니다. Supabase 환경 변수를 입력하기 전에도 공개 페이지는 볼 수 있지만 신청 저장은 503으로 응답합니다.

## Supabase 준비

1. Supabase 프로젝트를 생성합니다.
2. SQL Editor에서 `supabase/migrations/001_public_submissions.sql`을 실행합니다.
3. `.env.local`에 다음 값을 입력합니다.

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SECRET_KEY=sb_secret_REPLACE_ME
SUBMISSION_FINGERPRINT_SECRET=32자-이상의-무작위-비밀값
```

`SUPABASE_SECRET_KEY`와 fingerprint 비밀값은 브라우저에 공개하거나 Git에 커밋하지 않습니다. 배포 서비스의 서버 환경 변수로만 설정합니다.

## 데이터 보안

- 신청 테이블은 RLS가 활성화되어 있고 공개 정책이 없습니다.
- 브라우저는 Supabase에 직접 접근하지 않습니다.
- Next.js Route Handler가 입력을 검증한 뒤 server-only secret key로 RPC를 호출합니다.
- RPC 실행 권한은 `service_role`에만 있습니다.
- IP 원문은 저장하지 않고 서버 비밀값으로 만든 HMAC fingerprint만 30초 요청 제한에 사용합니다.

## 검증

```powershell
npm run lint
npm run build
```

배포 전에 Supabase 리전, 개인정보 보유기간, 처리위탁 문구와 개인정보 보호책임자를 확정해야 합니다.

## 주요 경로

- `src/app`: 공개 페이지와 Route Handler
- `src/components`: 공통 UI와 신청 폼
- `src/lib/site-data.ts`: 1차 정적 콘텐츠
- `src/lib/submissions.ts`: 서버 입력 스키마
- `src/lib/supabase/server.ts`: 서버 전용 Supabase 클라이언트
- `supabase/migrations`: 공개 신청용 DB 스키마와 RPC

# ingins
