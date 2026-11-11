POCKY DAY 11.11 - HTML/CSS/JavaScript web game

1. Open index.html in Chrome or another modern browser.
2. FREE MODE: tap either character side to eat a shared stick with no time limit.
3. CHALLENGE MODE: 3-second countdown followed by a 15-second challenge. More bites wins.
4. Each click moves the character toward the center and shortens the shared stick.
5. When the stick reaches 0 cm, the screen turns black and displays:
   둘의 입술이 맞닿았다.
   .
   .
   .
6. When time runs out, the remaining stick length, bite counts, winner, and description are shown without split result cards.

Replaceable image assets (transparent PNGs):
assets/left_idle.png  - left-facing character positioned on left, looking RIGHT
assets/left_eat.png   - left character eating expression (optional)
assets/right_idle.png - right character positioned on right, looking LEFT
assets/right_eat.png  - right character eating expression (optional)
assets/kiss.mp3       - optional custom kiss sound effect

Missing PNG files show simple placeholder silhouettes. Missing eat images fall back to idle images. Missing kiss.mp3 uses a short synthesized sound.

For accurate mouth alignment, use equally sized transparent canvases for idle/eat variants and adjust CSS .character, .stick and CONFIG.movePxPerBite to match the artwork. The current stick is drawn in CSS; no asset is required.

Settings in game.js: initialCm=15, biteCm=0.5, challengeSeconds=15, movePxPerBite=8.
Note: A single shared stick is consumed from both ends. If the total eaten reaches 15 cm before time expires, the kiss ending takes priority.

Mobile: touch the left or right half independently. Desktop: mouse or keyboard focus + Enter/Space.


추가: 모드 선택 후 좋아하는 상대/싫어하는 상대를 선택합니다. 선택에 따라 결과 설명 및 반응 이미지가 바뀝니다. 제공된 PNG 7장을 assets에 포함했습니다. 좌측 캐릭터는 CSS로 좌우 반전됩니다.

[v3] 싫어하는 상대 선택 시 키스 암전과 서술 및 점 세 개 출력 후 남자(shock_left.png), 여자(shock_right.png) 구역질 반응을 동시에 표시합니다. 좋아하는 상대는 기존 happy.png 반응을 유지합니다.

[v4] 좋아하는 상대 선택 후 남자/여자 중 먼저 빼빼로 게임을 청한 사람 선택. 싫어하는 상대는 바로 게임 시작. 제안 이미지: assets/propose_male.png, assets/propose_female.png

V5: 플레이 중 포기하고 결과 보기 버튼으로 즉시 종료 후 별도 결과 화면에서 남은 길이(cm) 확인. 챌린지는 15초 종료 시에도 결과 화면 표시. 빼빼로 위치를 입술 높이로 조정하고 캐릭터 이동에 맞춰 끝점 추적.

[v6] 싫어하는 상대 키스 엔딩: 암전 및 점 3개 연출 뒤 assets/Ikkyu_san.mp3를 재생하고, 재생 종료 후 남녀 구역질 이미지를 표시합니다. 좋아하는 상대 엔딩은 변경하지 않았습니다.

[v7] 좋아하는 상대 키스 엔딩: 암전 및 점 3개 출력 후 assets/blackout_piano1.mp3 재생, 종료 후 행복 반응 이미지 표시. 싫어하는 상대는 기존 Ikkyu_san.mp3 유지. 메뉴 이동/재시작 시 음악 중단.

[v8] 키스 순간 공통 효과음 assets/kiss2.mp3 적용. 좋아하는 상대/싫어하는 상대의 기존 엔딩 음악 및 반응은 유지. 메뉴 이동 시 키스 효과음 중지.

V9: 키스 암전 서술과 관계별 효과음이 끝나면 자동으로 별도 파스텔 결과 화면으로 이동합니다. 키스 엔딩도 남은 길이, 결과 설명, 관계별 이미지 및 재시작 버튼을 표시합니다.

V10: Kiss ending result screens play looping relation-specific BGM (ending_dislike.mp3 / ending_love.mp3); music stops on replay or menu. Previous kiss and transition SFX retained.

V11: main_theme.mp3 (Osampo_Biyori-1 Slow) loops on title, relationship, and proposer screens after first user gesture; stops during gameplay and result.
