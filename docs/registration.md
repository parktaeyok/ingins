# 회원가입 설정 (아이디 로그인)

`/signup/`에서 아이디·이름·이메일·비밀번호·전화번호·우편번호·기본 주소를 입력합니다. 회사명과 상세 주소는 선택입니다. 아이디는 영문 소문자로 시작하는 4~24자의 영문·숫자·밑줄이며 중복 확인과 DB의 유일성 제약으로 보호합니다. 로그인은 `/login/`에서 아이디와 비밀번호로 진행합니다. 이메일 인증 없이 가입한 뒤 `/account/`에서 본인 정보를 확인할 수 있습니다.

## 연결과 DB 적용

공개 연결용 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`를 배포 환경에 등록하고 빌드합니다. 비밀 키는 브라우저에 사용하지 않습니다. 기존 DB 구조를 유지하며 `supabase/setup-registration.sql`을 한 번 적용합니다. 등록용 두 테이블과 Auth 가입 트리거를 추가합니다. 기존 상담·회원·게시판 테이블이나 역할은 변경하지 않습니다.

현재 사용할 프로젝트는 `ejwutsrpugxuexdquchu`이며 URL은 `https://ejwutsrpugxuexdquchu.supabase.co`입니다. 연결된 Supabase 계정에는 이 프로젝트 접근 권한이 없어 원격 적용·실제 DB 검증은 완료하지 못했습니다. 이전 프로젝트의 계정·데이터·키는 자동 이전되지 않습니다. SQL Editor에서 `select to_regclass('public.registration_handles'), to_regclass('public.registration_profiles');`로 확인하고 둘 다 NULL이면 생성 SQL을 한 번 적용합니다. 두 테이블이 이미 있으면 `supabase/setup-username-login.sql`만 적용합니다. 한 테이블만 있으면 구조를 먼저 확인합니다. 기존 테이블을 삭제하거나 생성 SQL을 반복하지 않습니다.

Supabase Authentication → Sign In / Providers → Email에서 이메일 가입은 활성화하고 **Confirm email은 OFF**로 저장합니다. 코드만 배포해서는 이 설정이 바뀌지 않습니다. https://supabase.com/docs/guides/auth/passwords

`.env.local`과 배포 환경에는 같은 프로젝트의 아래 값을 설정합니다. 비밀 키는 서버 환경변수에만 입력하며 채팅·GitHub·브라우저 코드에 넣지 않습니다. 환경변수 변경 후 로컬 서버를 재시작하고 배포 사이트는 다시 빌드·배포합니다.

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://ejwutsrpugxuexdquchu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
SUPABASE_URL=https://ejwutsrpugxuexdquchu.supabase.co
SUPABASE_SECRET_KEY=sb_secret_REPLACE_ME
```

운영 Site URL은 실제 도메인으로 설정합니다. 서버 주소와 공개 주소가 다르거나 서버 비밀 키가 없으면 로그인이 차단됩니다. 비밀번호 재설정·전화번호 인증·주소 검색 API·회원 정보 수정은 이번 범위에 포함하지 않습니다. 전화번호·이메일·주소는 입력 정보이며 본인 인증 결과가 아닙니다.

## 회원가입 버튼이 비활성화될 때

버튼은 DB 조회 전 공개 연결 설정이 없거나 유효하지 않으면 비활성화됩니다. Vercel의 `ingins` 프로젝트 → Settings → Environment Variables에서 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`가 **Production**에 적용되어 있는지 확인합니다. URL은 이 문서의 프로젝트 주소, 키는 같은 프로젝트의 실제 Publishable key를 사용합니다. 따옴표나 `REPLACE_ME` 예시 문자열을 값에 포함하지 않습니다. 끝의 슬래시와 공백은 코드가 정리합니다.

저장한 다음 Deployments에서 최신 `main` 커밋을 **Redeploy**합니다. `NEXT_PUBLIC_` 값은 빌드 때 브라우저 코드에 들어가므로 저장만 하거나 예전 배포를 Promote하는 것으로는 반영되지 않습니다. 가입 버튼이 활성화된 뒤 중복 확인에서 실패한다면 그때 회원 테이블 생성·권한·실제 키 유효성을 확인합니다.

## 개인정보와 권한

전화번호·주소를 포함한 등록 정보는 `registration_profiles`에 저장하고 RLS로 본인만 조회합니다. 중복 확인용 `registration_handles`는 아이디 열만 공개하며 소유자 UUID에는 SELECT 권한을 주지 않습니다. 비밀번호는 Supabase Auth가 관리하며 자체 프로필 테이블에 저장하지 않습니다. 가입 중 이메일 인증 전 데이터를 원자적으로 저장하기 위해 Auth의 사용자 메타데이터를 거쳐 트리거로 저장합니다. 메타데이터를 관리자 권한 판단에 사용하지 않습니다.

최종 아이디 예약과 프로필 저장은 같은 Auth 가입 트랜잭션에서 실행됩니다. 로그인은 `/api/member/login/` 서버에서 아이디를 계정 이메일로 변환한 뒤 Supabase Auth로 비밀번호를 검증합니다. 이메일 조회 API는 공개하지 않으며 로그인 응답은 캐시하지 않습니다. 실패 시 계정 존재 여부를 구분하지 않습니다. 아이디별 분당 8회의 프로세스 내 제한과 Supabase Auth 제한을 사용하며, 여러 서버 인스턴스 운영 시 공유 Gateway/WAF 제한을 추가해야 합니다.

이메일 인증을 생략하므로 이메일만으로 관리자 권한을 자동 부여하면 안 됩니다. 기존 이메일 기반 관리자 부여 로직이 있는 프로젝트라면 비활성화하고 검증한 사용자 UUID를 기준으로 별도 부여합니다. 기존 미인증 계정은 Confirm email을 끈 뒤에도 개별 상태를 확인해야 합니다. 중복 확인 → 가입 → 내 정보 → 로그아웃 → 아이디 로그인 순서로 운영 검증합니다. 회원 정보 삭제·탈퇴 요청은 개인정보처리방침의 연락처로 접수합니다.
