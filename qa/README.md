# qa — agent-tests-the-guide 하네스

덱 작성 가이드(`.claude/skills/lds-deck/` + `catalogue.json`)는 **지시받지 않은
에이전트가 브리프만 읽고 규율 있는 덱을 내놓게 하는 것**이 존재 이유다. 그러니
가장 지렛대가 큰 질문은 "가이드가 잘 쓰였는가"가 아니라 **"가이드만 읽은 에이전트가
실제로 뭘 하는가"**다. 이 하네스가 그 질문에 답한다.

(구조는 tahta의 qa 하네스에서 가져와 이 저장소의 스토리 기반 덱과 게이트 체인에
맞게 번안했다. MIT.)

## 동작

1. `qa/briefs/<id>.md` — 청중·시간·목적·자료만 있는 브리프. **시각·구조 지시 없음.**
   하네스가 덧붙이는 것은 로지스틱스(출력 파일명, 가이드 위치)뿐이다.
2. headless `claude -p`가 브리프를 받아 `stories/decks/qa-<id>.stories.jsx`를 저작한다.
3. 결과를 사람 덱과 같은 게이트로 채점한다: play 렌더 · 캔버스 초과(전 장 순회) ·
   내용 규율(`check:deck-content`).
4. 콘택트 시트: 슬라이드마다 PNG 한 장, **전부 공개 상태로** 캡처 — 뒤로 걸으면
   각 슬라이드에 끝 상태로 진입하는 덱 계약을 그대로 이용한다.
5. `--critique`: 두 번째 headless 에이전트가 `qa/rubric.md`로 심사해 `critique.md`를
   쓴다 — 차원별 1–5점, 슬라이드 번호 붙은 약점.

산출물은 전부 `qa/out/<id>/` (gitignore): 덱 소스 사본, 저작 로그, 게이트 로그,
`slides/*.png`, `report.md`, `critique.md`. 생성된 덱 파일 자체는 기본적으로 정리된다
(`--keep`으로 유지).

## 게이트는 바닥이지 검증이 아니다

초록 실행은 "명백히 깨지진 않았다"는 뜻이다. `report.md`의 ▶ REVIEW 경로를 따라
콘택트 시트를 `qa/rubric.md`에 대고 걸어본 뒤에야 그 덱은 검토된 것이다 — 그리고
가이드를 고칠 단서는 대부분 게이트가 아니라 그 심사에서 나온다: 에이전트가 어떤
레이아웃에 손을 안 댔는가, 어떤 규칙을 산문으로 이해 못 했는가.

## 실행

```bash
npm run qa -- --list                        # 브리프 목록
npm run qa -- --brief pipeline-briefing     # 저작 + 채점 + 콘택트 시트
npm run qa -- --brief pipeline-briefing --critique
npm run qa -- --skip-author --brief <id>    # 기존 qa- 덱 재채점
npm run qa -- --keep                        # 생성 덱을 stories/decks에 유지
npm run qa -- --model <model>               # 저작 에이전트 모델 지정
```

## 브리프 추가

`qa/briefs/<id>.md` 하나가 브리프 하나다. 규칙: 청중·시간·목적·자료(수치와 출처)만.
"StatSlide를 써라"류의 지시가 들어가는 순간 그 브리프는 가이드를 테스트하지 못한다.
