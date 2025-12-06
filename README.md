## そふ花

This repository contains source code and image materials used for research and demonstration purposes, and is currently under active development.

---

## 遊び方

1. Google Chrome や Mozilla FireFox, Microsoft Edge などの最新ブラウザで [このリンク](https://packed7ice.github.io/sofuhana/) にアクセスするとタイトル画面が表示されます。
2. 「ゲームスタート」を押して希望の回戦数（3・6・12 回戦）を選ぶと、自動的に第 1 回戦が始まります。
3. 自分の手番では手札（自分の列に並ぶ札）から 1 枚をクリックし、同じ月の場札（中央に公開されている札）と組み合わせます。該当札がなければ札は場に残ります。
4. 札を出した直後に山札（引札）から 1 枚が自動で公開され、同じ月の場札と照合されます。その後は CPU が行動し、手番を交互に繰り返します。
5. 役（得点になる札の組み合わせ）が完成すると画面下部に「こいこい」（継続）と「勝負」（即時得点計算）のボタンが現れます。こいこいを選ぶと高得点を狙えますが、相手に逆転されるリスクがあります。
6. 全回戦が終わると結果画面に移り、「もう一度遊ぶ」で同じ設定でもう一度、「タイトルに戻る」でタイトル画面に戻れます。

ヒント: 各札をホバーまたはタップすると札の情報が表示され、メッセージ欄で役の成立状況が確認できます。

---
## 技術的なポイント

### 技術スタック

- フロントエンド: 素の HTML5 / CSS3 / JavaScript（ES Modules）
- モジュール構成:
  - `js/dom-elements.js` … DOM 要素の取得・画面切り替え
  - `js/ui.js` … 画面更新・ツールチップなど UI 周り
  - `js/state.js` … 山札・手札・場札・得点などのゲーム状態管理
  - `js/card-data.js` … 花札データ・役判定ロジック・得点計算
  - `js/tutorial/` … チュートリアル進行管理
  - `js/yaku-assist.js` … 役アシスト機能（ヒント表示）
- 開発用ツール:
  - `npm start` で `http-server` を使ったローカル開発サーバを起動
  - `npm test` で Node.js の組み込みテストランナー（`node --test`）を実行可能
- ホスティング: GitHub Pages（`https://packed7ice.github.io/sofuhana/`）

### アーキテクチャ

- 単一ページアプリケーション（SPA）として実装し、
  タイトル画面／回戦数選択／対局画面／結果画面を JS 側で切り替え
- DOM 操作とゲームロジックをモジュール単位で分離し、
  UI 変更とルール実装をそれぞれ独立してメンテナンスできる構造
- 非同期処理（`async` / `await`）と遅延時間定数（`DELAYS`）を用いて、
  アニメーションや CPU 思考時間などの演出を制御

### ゲームロジック・AI

- 花札「こいこい」の基本ルールと得点計算を JavaScript で実装
  - 山札からのドロー、場札との月一致判定、役成立判定などを自前で管理
- CPU の行動:
  - まず場札と一致する月を持つ手札を優先的にプレイ
  - 一致札がない場合はランダムプレイ
  - 取得札から得点を評価し、点数・山札残り枚数・こいこい状態などを加味して
    「上がり」か「こいこい」を選択する簡易 AI を実装

### UI / UX

- `fitApp()` と `requestAnimationFrame` / `resize` / `orientationchange` /
  `visualViewport` のイベントを組み合わせて、
  画面サイズや向きの変更に応じて盤面レイアウトを自動調整
- 札にホバー／タップすると情報を表示し、メッセージ欄で状況や役の状態を案内
- 役アシスト機能:
  - ON/OFF 切り替えボタン（`aria-pressed` で状態を表現）
  - プレイヤーの番開始時に、成立しそうな役をハイライトするヒント表示
- 山札から引かれた札のプレビュー表示や、こいこい／上がり選択時の
  メッセージ表示など、プレイの流れが分かりやすいように演出を追加
- カード画像は事前読み込み（`preloadCardImages()`）して、
  対局中の画像読み込み待ち時間を最小化

### アクセシビリティ

- 役アシストボタンに `aria-pressed` を付与し、
  ON/OFF 状態をスクリーンリーダーにも伝わるように設計
- 状態メッセージ区域を明示的に用意し、
  ターン・宣言・結果などの情報をテキストで常に確認できるように配慮
---

## License Overview

| Category | License | Conditions |
|-----------|----------|-------------|
| **Source code** | [MIT License](./LICENSE) | Free to use, modify, and redistribute **with attribution**. |
| **Images & Illustrations** | [All rights reserved](./LICENSE-images.txt) | **Use, redistribution, and modification are strictly prohibited.** |

---

### Image Attribution

- Illustrations © 2025 [nu_tsumi] — used under permission.  
- Logo © [cit_sofume] — used with authorization.  
- All images are included in this repository for display only.  
  Redistribution or modification is **not allowed**.

---

### Summary

- You may freely use and modify the **source code**, provided that you credit the author (“Yorikawa Aise”) and retain the MIT license text.  
- **Images and logos are not open source.** They are protected by their respective authors and organizations.  
- For any inquiries about usage permissions, please contact the original rights holders.

---

© 2025 Yorikawa Aise, nu_tsumi, cit_sofume  
All image rights remain with their respective owners.
