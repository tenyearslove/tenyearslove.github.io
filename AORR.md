# AORR 상태 머신

## 1. Target과 완료 기준
- Target: 정적 프로페셔널 웹사이트를 GitHub Pages에서 정상 동작하게 만들고, 반응형 UI와 `Games` 메뉴, 키보드·터치 기반 지렁이 게임을 포함한다.
- 완료 기준:
  - `index.html`, `styles.css`, `script.js` 기반의 정적 사이트가 로컬과 GitHub Pages 경로에서 열린다.
  - 데스크톱·태블릿·모바일에서 레이아웃이 무너지지 않는다.
  - `Games` 메뉴가 동작하고 지렁이 게임이 키보드·터치로 플레이된다.
  - Claude Code CLI Sonnet의 전체 검증이 PASS다.
  - GitHub Pages 배포가 완료되고 최종 URL이 확인된다.

## 2. Act: Codex가 수행할 최소 수정
- 원칙:
  - 한 번의 Act는 하나의 실패 원인만 고친다.
  - 한 Retry에서는 하나의 원인과 관련 파일만 수정한다.
  - 기존 동작을 유지하는 방향으로 최소 수정한다.
- Codex 최소 수정 범위:
  - HTML: 시맨틱 구조, 내비게이션, 섹션 앵커, 게임 영역의 최소 마크업
  - CSS: 반응형 레이아웃, 타이포, 색상, 간격, 게임 캔버스/패널 배치
  - JavaScript: 메뉴 상호작용, 게임 루프, 입력 처리, 상태 전환
  - CONTENT: 확인된 프로필 문구만 반영하고, 미확인 항목은 `[사람 확인 필요]` 유지
- Claude 사용 불가 시에는 Codex가 수정과 테스트를 모두 수행하며, 이 경우 `CODEX_FALLBACK`으로 기록한다.

## 3. Observe: Claude가 실행할 테스트와 수집할 결과
- Claude Code CLI Sonnet은 수정 후 동일한 검증 절차를 반복 실행한다.
- 기본 검증:
  - 파일 존재와 경로 확인
  - 로컬 HTTP 응답 확인
  - HTML 구조 확인
  - CSS 반응형 동작 확인
  - JavaScript 콘솔 오류 확인
  - 지렁이 게임 입력과 종료/재시작 동작 확인
  - 375px, 768px, 1440px 화면 점검
  - GitHub Pages 경로 호환성 확인
- 수집 결과:
  - 실행 명령
  - exit code
  - 실패한 파일과 위치
  - 콘솔/브라우저 오류
  - fingerprint
  - 최종 상태

## 3-1. Self-Correcting TDD Loop
- 기본 모드:
  - `Codex = Worker`
  - `Claude Code CLI Sonnet = Verifier`
  - Codex는 Claude가 이미 실행한 테스트를 중복 실행하지 않는다.
- 사전 확인:
  - `claude` 명령 사용 가능 여부
  - 로그인 및 실행 가능 여부
  - 사용 가능한 Sonnet 모델
  - `Sonnet 5` 실제 사용 가능 여부
  - 사용 가능한 최신 Sonnet 모델명
  - 실제 모델명과 사용 가능 여부를 `AORR.md`와 `MEMORY.md`에 기록
  - Claude CLI 사용 불가 시 `CODEX_FALLBACK`으로 전환
- 실행 순서:
  1. Claude가 변경 전 테스트를 실행한다.
  2. Claude가 실패 항목, 핵심 오류, 관련 파일, fingerprint를 보고한다.
  3. Codex가 원인 하나에 필요한 최소 코드만 수정한다.
  4. Claude가 동일 테스트를 재실행한다.
  5. 실패 시 Claude가 새 결과와 fingerprint를 보고한다.
  6. Codex가 최소 수정 후 Claude에 재검증을 요청한다.
  7. Claude의 전체 테스트가 통과해야 `PASSED`가 된다.
- 검증 범위:
  - 파일 존재와 상대 경로
  - HTML 구조와 내부 링크
  - CSS 반응형
  - JavaScript 오류
  - 지렁이 게임 기능과 입력
  - 로컬 HTTP 응답
  - `375px`, `768px`, `1440px`
  - GitHub Pages 호환성
- 실패 기록:
  - 실행 주체와 모델
  - 명령
  - exit code
  - 핵심 오류
  - 관련 파일·라인
  - fingerprint
  - 최종 상태
- Retry 규칙:
  - 오류당 최대 3회
  - 동일 fingerprint 2회면 중지
  - 한 Retry에서는 원인 하나와 최소 파일만 수정
  - 테스트 삭제·완화 금지
- Fallback:
  - Claude CLI를 사용할 수 없을 때만 Codex가 수정과 테스트를 모두 수행한다.
  - Fallback 이유와 사용 여부를 기록한다.

## 4. Reason: 실패 원인 분류
- `HTML`: 마크업 구조, 링크, 시맨틱 태그, 앵커 문제
- `CSS`: 반응형, 레이아웃, 오버플로우, 타이포, 간격 문제
- `JAVASCRIPT`: 문법 오류, 런타임 오류, 이벤트/상태 관리 문제
- `GAME`: 입력, 충돌, 점수, 종료, 재시작, 모바일 조작 문제
- `CONTENT`: 사실성, 문구 누락, `[사람 확인 필요]` 오기입 문제
- `TEST`: 검증 스크립트, 환경 설정, 기대값 불일치 문제
- `ENVIRONMENT`: 로컬 서버, 브라우저, 권한, 경로, 인코딩 문제
- `GITHUB`: 저장소 연결, 브랜치, 푸시, 토큰, 원격 설정 문제
- `DEPLOYMENT`: GitHub Pages 배포, 빌드 산출물, 공개 경로 문제
- `UNKNOWN`: 원인 미확정

## 5. Repeat: Codex 최소 수정 → Claude 동일 테스트 재실행
- 실패가 나오면 Reason으로 분류한다.
- Codex는 분류된 원인 하나만 고친다.
- 관련 없는 파일은 건드리지 않는다.
- Claude는 동일한 테스트 세트를 다시 실행한다.
- 같은 fingerprint가 반복되면 같은 원인으로 간주하고, 추가 수정 전에 범위를 다시 줄인다.
- 3회 Retry 후에도 해결되지 않으면 HITL 또는 BLOCKED로 전환한다.

## 6. Stop과 HITL 조건
- Stop:
  - Claude의 전체 검증이 PASS
  - 최종 상태가 `PASSED`
- HITL:
  - 프로필의 사실 확인이 필요한 경우
  - 게임 규칙, 난이도, 입력 방식처럼 선호가 갈리는 경우
  - 디자인이나 카피의 최종 톤을 사람이 정해야 하는 경우
  - GitHub Pages 배포 승인 또는 토큰 사용이 필요한 경우
  - 외부 환경 문제로 반복 검증이 불가능한 경우
- `Claude CLI` 사용 불가 시:
  - `CODEX_FALLBACK`으로 기록하고 Codex가 수정과 테스트를 모두 수행한다.

## 7. 개발 루프 표

| 루프 | 입력 | Codex Act | Claude Verify | 통과 기준 | 다음 상태 |
|---|---|---|---|---|---|
| 1 | `STEP1_ANALYSIS.md`, 저장소 구조, 프로필 요약 | 정적 사이트 뼈대 생성, 헤더/내비/섹션/푸터 배치 | 구조, 링크, 기본 반응형, 콘솔 오류 점검 | 페이지가 안정적으로 로드됨 | `ACTING` |
| 2 | 확인된 프로필 문구, 핵심 경력/학력 | Hero/About/Projects/Contact 콘텐츠 반영 | 문구 사실성, 누락, 모바일 가독성 점검 | 확인된 내용만 노출됨 | `VERIFYING` |
| 3 | `Games` 메뉴, 게임 영역, 입력 규칙 | 지렁이 게임 최소 구현, 키보드·터치 입력 연결 | 게임 실행, 충돌, 점수, 재시작, 모바일 조작 점검 | 게임이 정상 플레이됨 | `VERIFYING` |
| 4 | 실패 항목 1개와 관련 파일 1개 | 원인 1개만 최소 수정 | 동일 테스트 재실행 | fingerprint 감소 또는 PASS | `RETRYING` |
| 5 | 전체 결과 | 최종 정리, README/메타/링크 보정 | 전체 회귀 검증 | 모든 검증 PASS | `PASSED` |
| 6 | 배포 승인 필요 시점 | 배포 전 마지막 정리 | GitHub Pages 배포 검증 | 배포 성공, URL 확인 | `DEPLOY_APPROVAL_REQUIRED` |
| 7 | 배포 완료 후 | 없음 | 공개 URL 확인 | 공개 페이지 정상 응답 | `DEPLOYED` |

## 상태
- `READY`: 시작 가능
- `ACTING`: Codex가 최소 수정 중
- `VERIFYING`: Claude가 테스트 중
- `RETRYING`: 실패 원인 1개를 고쳐 재검증 중
- `PASSED`: 전체 검증 통과
- `DEPLOY_APPROVAL_REQUIRED`: 배포 승인 대기
- `DEPLOYED`: GitHub Pages 배포 완료
- `BLOCKED`: 3회 이상 동일 원인 반복 또는 외부 제약으로 진행 불가
- `HITL_REQUIRED`: 사람이 결정해야 계속 진행 가능

## 참고
- 불명확한 내용은 `[사람 확인 필요]`로 남긴다.
- 토큰은 출력, 로그, 코드, 문서, Git에 남기지 않는다.
- `claude` 명령과 Sonnet 모델명은 실제 실행 시점에 확인해 기록한다.
