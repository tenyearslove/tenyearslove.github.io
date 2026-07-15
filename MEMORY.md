# MEMORY.md

## Goal
- 정적 반응형 프로페셔널 웹사이트와 Games 지렁이 게임을 안전하게 복구·완성한다.

## Scope / Out of Scope
- In: 정적 HTML/CSS/JS, 반응형 UI, Games 메뉴, 키보드·터치 게임, GitHub Pages
- Out: 백엔드, DB, 로그인, 결제, 외부 서비스/프레임워크 임의 추가

## Execution
- Mode: CODEX_WORKER + CLAUDE_VERIFIER
- Claude model: claude-sonnet-5
- Last test: PASS

## Current State
- 상태: DEPLOYED
- 완료 루프: 2
- 다음 루프: 배포 회귀 또는 기능 후속 루프
- Retry: 0
- fingerprint: 없음
- blocker: Shell-based HTTP check is sandbox-limited; browser runtime checks passed
- 마지막 정상 commit·URL: 2dfda77 / https://tenyearslove.github.io/

## Acceptance
- 정적 파일 정상 로드, 콘솔 오류 없음, 375px / 768px / 1440px 정상
- Games 메뉴 동작, 지렁이 게임 키보드·터치 입력 정상
- GitHub Pages HTTP 200 및 배포본 회귀 테스트 통과

## Guardrails
- 확인되지 않은 개인 정보 생성 금지
- 기존 콘텐츠 임의 삭제 금지
- 테스트 삭제·완화 금지
- 대규모 재작성 금지
- 백엔드·외부 서비스·프레임워크 임의 추가 금지
- 토큰 출력·로그·코드·문서·Git 저장 금지

## Retry / HITL
- 오류당 최대 3회
- 동일 fingerprint 2회면 중지
- 한 Retry는 원인 1개와 최소 파일만 수정
- 콘텐츠 불명확, 요구 충돌, 권한·배포 설정 문제는 HITL_REQUIRED

## Recent Loops
| Loop | 상태 | 실행 모드·모델 | 변경 파일 | 테스트 결과 | Retry | 다음 작업 |
|---|---|---|---|---|---:|---|
| 1 | PASSED | CODEX_WORKER + CLAUDE_VERIFIER / claude-sonnet-5 | index.html, styles.css, script.js, AORR_LOG.md, MEMORY.md | 정적 verifier PASS | 0 | 다음 루프에서 게임 구현 |
| 2 | DEPLOYED | CODEX_WORKER + CLAUDE_VERIFIER / claude-sonnet-5 | script.js, AORR_LOG.md, MEMORY.md | static verifier PASS, push success, Pages built | 0 | 배포 회귀 또는 후속 루프 |
