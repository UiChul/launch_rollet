---
name: project-code-review
description: 메뉴 룰렛(Vite + React 19 + TypeScript) 프로젝트 전용 코드 리뷰 절차와 체크리스트. 변경된 코드나 지정된 파일을 리뷰할 때, "코드 리뷰해줘", "리뷰", "PR 검토", "커밋 전에 봐줘"처럼 요청받을 때 사용한다. lint·build·test 결과와 프로젝트 고유 위험(휠 각도 계산, 후보 필터링, localStorage, 회전 중 상태)을 함께 확인하고, 심각도별로 근거 있는 지적만 보고한다.
---

# 프로젝트 코드 리뷰

이 프로젝트의 코드를 리뷰할 때 따르는 절차다. 목표는 **실제로 사용자에게 문제를 일으킬 결함**을 찾는 것이고, 취향 문제나 근거 없는 추측은 보고하지 않는다.

## 1. 리뷰 범위 정하기

1. 요청에 파일이나 범위가 명시되어 있으면 그것만 본다.
2. 없으면 git 저장소인지 확인한다(`git rev-parse --is-inside-work-tree`).
   - 저장소이면: `git diff HEAD --stat`과 `git diff HEAD`로 변경분을 리뷰한다. 스테이징만 볼 때는 `git diff --cached`를 쓴다.
   - 저장소가 아니면: `src/` 전체를 범위로 잡는다.
3. 변경된 함수를 호출하는 쪽도 함께 읽는다. diff만 보고 판단하지 않는다.

## 2. 자동 검사 실행

다음을 순서대로 실행하고 결과를 기록한다. 실패하면 실패 출력의 핵심 줄을 보고서에 그대로 옮긴다.

```bash
npm run lint    # Biome
npm run build   # tsc 타입 체크 + vite build
npm test        # Vitest
```

자동 검사가 잡는 문제(포맷, 타입 오류, 실패한 테스트)는 요약만 하고, 리뷰의 중심은 도구가 못 잡는 논리 결함에 둔다.

## 3. 프로젝트 구조 (리뷰 시 참고)

| 경로 | 역할 |
|---|---|
| `src/lib/candidates.ts` | `getCandidates`(제외·최근 N일·거절 필터), `sampleMenus`(Fisher–Yates) — 순수 함수 |
| `src/lib/wheel.ts` | `computeTargetRotation`, `segmentAtPointer`, `randomJitter` — 휠 각도 수학 |
| `src/lib/storage.ts`, `src/hooks/usePersistentState.ts` | localStorage 저장(키 접두사 `menu-roulette:v1:`) |
| `src/App.tsx` | 상태 흐름: 돌리기 → 결과 → 결정/다시 돌리기/처음으로 |
| `src/components/*` | Wheel(SVG), ResultCard, MenuManager, SettingsPanel, HistoryList |

## 4. 체크리스트

### 정확성 (가장 중요)
- **휠 결과 일치**: 당첨 인덱스를 먼저 정하고 `computeTargetRotation`으로 각도를 역산하는 구조가 유지되는가? `Wheel.tsx`의 칸 배치(12시부터 시계 방향, 칸 폭 `360/n`)와 `wheel.ts`의 수식이 같은 규칙을 쓰는가?
- **회전 중 상태 변경**: 회전 중(`spinning`)이나 결과 표시 중에 `wheelMenus`가 바뀌면 화살표가 가리키는 칸과 결과가 어긋난다. 재샘플링 경로가 `idle` 조건을 지키는가?
- **transitionend 의존**: 회전 종료를 `onTransitionEnd`에 의존한다. 회전 중 탭 전환 등으로 Wheel이 언마운트되면 결과가 영영 안 뜰 수 있다. 그런 경로가 새로 생기지 않았는가?
- **필터 경계**: 최근 N일은 `now - recentDays*24h` 이후(초과)만 제외한다. 경계 조건을 바꿨다면 테스트도 바뀌었는가?
- **후보 0개 / 1개**: 빈 배열, 칸 1개(원 전체) 처리가 깨지지 않는가?
- **거절 목록**: "다시 돌리기"로 후보가 바닥나면 거절 목록을 초기화하는가? 결정 후 거절 목록을 비우는가?

### 데이터·저장
- localStorage 접근은 `storage.ts`의 `load/save`(try/catch)를 거치는가? 컴포넌트에서 직접 `localStorage`를 부르지 않는가?
- 저장 형식(`Menu`, `Settings`, `HistoryEntry`)을 바꿨다면 기존 사용자 데이터가 깨지지 않는가? 깨진다면 키 버전(`v1`)을 올렸는가?
- 기본 메뉴 id(`d-...`)를 바꾸면 기존 제외 설정·기록이 끊긴다. 바꿨는가?
- 메뉴 삭제 시 `excludedIds`에서도 지우는가? 기록에 남은 삭제된 메뉴를 안전하게 표시하는가?

### React
- 훅 의존성 배열이 실제 사용 값과 일치하는가? (Biome `useExhaustiveDependencies`가 잡지만, 억제 주석을 달았다면 이유가 타당한가?)
- 이벤트 핸들러에서 최신 상태가 필요한 곳에 함수형 업데이트(`setX(prev => ...)`)를 쓰는가?
- 렌더 중 부수효과(localStorage 쓰기, `Math.random`으로 상태 결정)가 없는가? `useState` 초기화 함수 안의 무작위는 허용된다.
- 리스트 `key`가 안정적인 id인가?

### 접근성·모바일
- 모든 `<button>`에 `type`이 있는가? 아이콘 버튼에 `aria-label`이 있는가?
- 결과 영역은 `aria-live`로 읽히는가?
- 360px 폭에서 레이아웃이 넘치지 않는가? 휠 라벨은 `MAX_LABEL`(6자)로 잘리는가?
- `prefers-reduced-motion`, 다크 모드 변수(`--bg`, `--text` 등)를 우회하는 하드코딩 색이 새로 생기지 않았는가?

### 테스트
- `src/lib`의 순수 함수를 바꿨다면 대응 테스트(`*.test.ts`)도 바뀌었는가?
- 새 분기(경계, 빈 입력)에 테스트가 있는가? 무작위가 개입하면 `rng`를 주입해 고정했는가?

### 보안·외부 링크
- 외부 URL에 메뉴 이름을 넣을 때 `encodeURIComponent`를 쓰는가?
- `target="_blank"` 링크에 `rel="noreferrer"`(또는 `noopener`)가 있는가?
- `dangerouslySetInnerHTML`이나 사용자 입력을 HTML로 해석하는 코드가 없는가?

## 5. 보고 형식

한국어로, 아래 형식을 따른다. 지적이 없으면 "발견된 문제 없음"이라고 쓰고 무엇을 확인했는지만 적는다.

```
## 자동 검사
- lint: 통과 / 실패 (요약)
- build: 통과 / 실패 (요약)
- test: N개 통과 / M개 실패 (요약)

## 발견 사항
### [심각도] 한 줄 요약 — `파일경로:줄번호`
- 문제: 무엇이 잘못되었는지
- 재현: 어떤 입력·조작에서 어떤 잘못된 결과가 나오는지
- 제안: 고치는 방법 (짧은 코드 예시 가능)

## 확인했지만 문제없던 항목
- (짧게 나열)
```

심각도 기준:
- **치명**: 데이터 손실, 앱이 멈춤, 결과가 휠과 다름
- **높음**: 특정 조작에서 잘못된 동작, 저장 데이터 호환성 깨짐
- **보통**: 경계 조건 누락, 테스트 누락, 접근성 문제
- **낮음**: 가독성·단순화 제안 (최대 3개까지만)

## 원칙
- 각 지적에는 **파일:줄**과 **구체적인 재현 시나리오**가 있어야 한다. 시나리오를 못 쓰면 보고하지 않는다.
- 확신이 없으면 "추정"이라고 표시하고, 확인하는 방법을 함께 적는다.
- 리뷰만 한다. 사용자가 요청하지 않으면 코드를 직접 고치지 않는다.
