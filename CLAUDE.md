# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트

"오늘 뭐 먹지?" 메뉴 룰렛 — 외식·배달 메뉴 하나를 원형 룰렛으로 뽑는 모바일 우선 웹앱. 서버·로그인 없이 브라우저(localStorage)에서만 동작한다.
스택: Vite 8 + React 19 + TypeScript 7, 테스트 Vitest 5, 린트 Biome 2.

## 명령어

```bash
npm run dev                                   # 개발 서버 (http://localhost:5173)
npm run lint                                  # Biome 린트 (포매터는 꺼져 있음)
npm run build                                 # tsc 타입 체크 + vite build
npm test                                      # Vitest 전체 실행
npx vitest run src/lib/wheel.test.ts          # 파일 하나만
npx vitest run -t "drops excluded menus"      # 테스트 이름으로 하나만
```

- TypeScript 7을 쓰므로 typescript-eslint는 호환되지 않는다(peer dep `<6.1`). 린트는 Biome으로 한다.
- `tsconfig.json`은 단일 파일(`noEmit`)이며 `build`에서 `tsc`(프로젝트 참조 없음)로 타입 체크만 한다.

## 아키텍처

**순수 로직은 `src/lib/`에, 상태 흐름은 `src/App.tsx` 한 곳에** 모여 있다. 컴포넌트는 props만 받는 표시용이다.

- 후보 계산: 전체 메뉴(`DEFAULT_MENUS` + 사용자 추가) → `getCandidates`(제외 메뉴 → 최근 `recentDays`일 안에 "결정"한 메뉴 → 이번 세션에서 거절한 메뉴 순으로 제거) → `sampleMenus`로 최대 10개만 휠에 올린다(`WHEEL_SIZE`). `now`와 `rng`는 인자로 주입해서 테스트한다.
- **휠 결과 일치가 핵심 불변식**: 당첨 인덱스를 먼저 무작위로 정하고, `computeTargetRotation`으로 그 칸이 상단 포인터에 오도록 각도를 역산한다. `Wheel.tsx`의 칸 배치(12시부터 시계 방향, 폭 `360/n`)와 `wheel.ts`의 수식, `segmentAtPointer`가 같은 규칙을 공유하므로 하나를 바꾸면 셋을 함께 바꾸고 `wheel.test.ts`로 확인한다.
- 회전 종료는 SVG의 CSS transition `onTransitionEnd`로 감지한다. 그래서 회전 중에는 탭 전환을 막고(Wheel 언마운트 방지), `wheelMenus` 재샘플링 effect는 `idle`(회전 중도 결과 표시 중도 아님)일 때만 돈다. 회전 중이나 결과 표시 중에 휠 후보를 바꾸면 화살표와 결과가 어긋난다.
- "다시 돌리기"는 effect를 거치지 않고 핸들러 안에서 거절 목록 갱신 → 새 샘플 → 회전을 한 번에 처리한다(후보가 바닥나면 거절 목록 초기화). "이걸로 결정"만 history에 기록한다.
- 저장: `usePersistentState` → `lib/storage.ts`(키 접두사 `menu-roulette:v1:`, try/catch로 실패 시 메모리만 사용). 저장 키는 `customMenus`, `settings`, `history`. 저장 형식을 호환되지 않게 바꾸면 `v1`을 올린다. 기본 메뉴 id(`d-...`)는 기존 사용자의 제외 설정·기록과 연결되어 있으므로 바꾸지 않는다. history는 로드 시 30일 지난 항목을 정리한다.
- 기본 메뉴는 제외 토글만 가능하고, 삭제는 사용자 추가 메뉴(`isCustom`)만 가능하다.

## Claude Code 설정 (`.claude/`)

- `hooks/pre-commit-check.mjs` + `settings.json`: Claude가 Bash/PowerShell로 `git commit`을 실행하기 전에 lint → build → test를 돌리고, 실패하면 커밋을 막는다(exit 2). 커밋이 막히면 출력된 실패 원인을 고친 뒤 다시 커밋한다. 검사를 우회하지 않는다.
- `skills/project-code-review/`: 이 프로젝트 전용 리뷰 절차와 체크리스트.
- `agents/code-reviewer.md`: 위 스킬을 불러와 리뷰만 하는 읽기 전용 서브에이전트. 코드를 바꾼 뒤 리뷰가 필요하면 이 에이전트를 쓴다.
