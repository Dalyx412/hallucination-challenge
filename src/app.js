const app = document.querySelector("#app");

const OPENING = "ナポレオン・ボナパルトは、";
const CHECK_LIMIT = 5;
const START_SECONDS = 180;
const MIN_SELECTED_WORDS = 5;

const WORD_DATABASE = [
  {
    id: "w1",
    text: "フランス革命",
    size: 5,
    snippet: "フランス革命後の混乱の中で頭角を現した軍人・政治家です。",
    fact: "事実：革命後の混乱を収拾し、軍事的成功を背景に権力を握りました。",
    isTrue: true,
  },
  {
    id: "w2",
    text: "コルシカ島",
    size: 3,
    snippet: "コルシカ島に生まれ、砲兵将校を経て将軍となり、",
    fact: "事実：1769年に地中海のコルシカ島で生まれました。",
    isTrue: true,
  },
  {
    id: "w3",
    text: "ブリュメール18日のクーデター",
    size: 4,
    snippet: "ブリュメール18日のクーデターによって第一統領に就任しました。",
    fact: "事実：1799年のクーデターで実権を握り、第一統領となりました。",
    isTrue: true,
  },
  {
    id: "w4",
    text: "皇帝",
    size: 5,
    snippet: "その後、フランス皇帝となり、",
    fact: "事実：1804年に皇帝（ナポレオン1世）として即位しました。",
    isTrue: true,
  },
  {
    id: "w5",
    text: "ナポレオン法典",
    size: 4,
    snippet: "ナポレオン法典を制定するなど、フランスの政治や社会制度に大きな影響を与えました。",
    fact: "事実：近代市民社会の法の基本となる民法典を制定しました。",
    isTrue: true,
  },
  {
    id: "w6",
    text: "大陸軍",
    size: 3,
    snippet: "軍事面では、大陸軍を率いて",
    fact: "事実：彼が率いたフランス帝国軍は「大陸軍（グランダルメ）」と呼ばれました。",
    isTrue: true,
  },
  {
    id: "w7",
    text: "アウステルリッツの戦い",
    size: 4,
    snippet: "アウステルリッツの戦いなどで勝利し、ヨーロッパの広い地域を支配しました。",
    fact: "事実：1805年、オーストリア・ロシア連合軍を破った代表的な勝利です。",
    isTrue: true,
  },
  {
    id: "w8",
    text: "ロシア遠征",
    size: 4,
    snippet: "しかし、ロシア遠征の失敗によって勢力を失い、",
    fact: "事実：1812年のロシア遠征での大敗が没落の始まりとなりました。",
    isTrue: true,
  },
  {
    id: "w9",
    text: "エルバ島",
    size: 3,
    snippet: "退位を余儀なくされ、エルバ島へ流刑となりました。",
    fact: "事実：1814年に最初の流刑地であるエルバ島へ送られました。",
    isTrue: true,
  },
  {
    id: "w10",
    text: "百日天下",
    size: 3,
    snippet: "その後、百日天下で一時的に復帰しましたが、",
    fact: "事実：エルバ島を脱出し、一時的に皇帝に復位しました。",
    isTrue: true,
  },
  {
    id: "w11",
    text: "ワーテルローの戦い",
    size: 4,
    snippet: "ワーテルローの戦いで敗北し、",
    fact: "事実：1815年、イギリス・プロイセン連合軍に敗れ、完全に失脚しました。",
    isTrue: true,
  },
  {
    id: "w12",
    text: "セントヘレナ島",
    size: 4,
    snippet: "最終的にはセントヘレナ島へ送られました。",
    fact: "事実：二度目の流刑地であり、1821年にこの孤島で死去しました。",
    isTrue: true,
  },
  {
    id: "w13",
    text: "フランス",
    size: 5,
    snippet: "フランスの歴史において極めて重要な役割を果たしました。",
    fact: "事実：フランスの指導者として活動しました。",
    isTrue: true,
  },
  {
    id: "w14",
    text: "第一帝政",
    size: 4,
    snippet: "彼によって第一帝政が樹立されました。",
    fact: "事実：彼が皇帝に即位したことで第一帝政が始まりました。",
    isTrue: true,
  },
  {
    id: "w15",
    text: "ジョゼフィーヌ",
    size: 3,
    snippet: "最初の妻である皇后ジョゼフィーヌとの関係も有名です。",
    fact: "事実：彼女はナポレオンの最初の妻です。",
    isTrue: true,
  },
  {
    id: "w16",
    text: "パリ",
    size: 4,
    snippet: "パリをヨーロッパの中心都市として整備しました。",
    fact: "事実：凱旋門の建設など、パリの整備を行いました。",
    isTrue: true,
  },
  {
    id: "w17",
    text: "凱旋門",
    size: 3,
    snippet: "アウステルリッツの戦いの勝利を記念して凱旋門の建設を命じました。",
    fact: "事実：彼の命令でエトワール凱旋門の建設が始まりました。",
    isTrue: true,
  },
  {
    id: "w18",
    text: "大陸封鎖令",
    size: 4,
    snippet: "イギリスを経済的に孤立させるため大陸封鎖令を出しました。",
    fact: "事実：1806年に発令されました。",
    isTrue: true,
  },
  {
    id: "w19",
    text: "トラファルガーの海戦",
    size: 3,
    snippet: "トラファルガーの海戦ではイギリス海軍に敗北を喫しました。",
    fact: "事実：ネルソン提督率いるイギリス艦隊に敗れました。",
    isTrue: true,
  },
  {
    id: "t1",
    text: "ベルサイユ宮殿",
    size: 2,
    snippet: "彼は権威を示すため、ベルサイユ宮殿を新たに建造しました。",
    fact: "誤り：ベルサイユ宮殿はルイ14世の時代（彼より前）に建てられたものです。",
    isTrue: false,
  },
  {
    id: "t2",
    text: "マリー・アントワネット",
    size: 3,
    snippet: "政略結婚により、マリー・アントワネットを妻に迎えました。",
    fact: "誤り：彼女はルイ16世の王妃であり、フランス革命で処刑されています。",
    isTrue: false,
  },
  {
    id: "t3",
    text: "産業革命",
    size: 2,
    snippet: "フランス国内で産業革命を主導し、蒸気機関の兵器化を進めました。",
    fact: "誤り：同時代の出来事ですが、ナポレオンが主導したわけではありません。",
    isTrue: false,
  },
  {
    id: "t4",
    text: "バスティーユ牢獄",
    size: 2,
    snippet: "若き日の彼は、バスティーユ牢獄の襲撃を直接指揮しました。",
    fact: "誤り：襲撃が起きた1789年当時、彼はまだ地方の一士官に過ぎませんでした。",
    isTrue: false,
  },
  {
    id: "t5",
    text: "啓蒙思想",
    size: 1,
    snippet: "啓蒙思想を批判し、中世の封建制度を復活させました。",
    fact: "誤り：彼はむしろ啓蒙思想の影響を受けており、封建制の復活は行っていません。",
    isTrue: false,
  },
  {
    id: "u1",
    text: "アステカ帝国",
    size: 1,
    snippet: "また、アステカ帝国の軍事制度にも関心を持ち、遠征計画の参考にしたといわれています。",
    fact: "誤り：アステカ帝国は16世紀に滅亡しており、時代も大陸も全く異なります。完全なハルシネーションです。",
    isTrue: false,
  },
  {
    id: "u2",
    text: "平安京",
    size: 1,
    snippet: "パリの都市計画を行う際、日本の平安京の都市構造をモデルにしたという研究があります。",
    fact: "誤り：平安京とは時代も場所も異なり、そのような事実はありません。AIが関連性のない語を無理やり繋げた結果です。",
    isTrue: false,
  },
  {
    id: "u3",
    text: "マチュピチュ",
    size: 1,
    snippet: "晩年にはマチュピチュへの遠征も計画していましたが、実現しませんでした。",
    fact: "誤り：インカ帝国の遺跡への遠征計画などは存在しません。地理的にも歴史的にも無関連です。",
    isTrue: false,
  },
  {
    id: "u4",
    text: "関ヶ原の戦い",
    size: 1,
    snippet: "彼の戦術は、遠く離れた日本の関ヶ原の戦いを研究した成果だという見方もあります。",
    fact: "誤り：洋の東西を不自然に結びつけた偽情報です。そのような事実はありません。",
    isTrue: false,
  },
  {
    id: "u5",
    text: "殷王朝",
    size: 1,
    snippet: "政治体制を整えるにあたり、古代中国の殷王朝の官僚制度を導入しました。",
    fact: "誤り：古代中国の王朝とナポレオンには全く関連性がありません。",
    isTrue: false,
  },
];

const state = {
  phase: "intro",
  selectedWords: [],
  cloudWords: makeCloudWords(),
  timeLeft: START_SECONDS,
  checkCount: CHECK_LIMIT,
  checkedIds: [],
  activeFactId: null,
  finalText: [],
  timerId: null,
};

const wordById = Object.fromEntries(WORD_DATABASE.map((word) => [word.id, word]));

function makeCloudWords() {
  return [...WORD_DATABASE]
    .map((word) => ({
      ...word,
      rotate: Math.round(Math.random() * 12 - 6),
      nudge: Math.round(Math.random() * 8),
    }))
    .sort(() => Math.random() - 0.5);
}

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function buildAnswer(words = state.selectedWords) {
  if (!words.length) return "";
  return `${OPENING}${words.map((word) => word.snippet).join("")}`
    .replace(/、。/g, "。")
    .replace(/\s+/g, " ")
    .trim();
}

function setPhase(phase) {
  state.phase = phase;
  if (phase !== "check") clearTimer();
  render();
}

function clearTimer() {
  if (!state.timerId) return;
  window.clearInterval(state.timerId);
  state.timerId = null;
}

function syncTimer() {
  if (state.phase !== "check" || state.timerId) return;
  state.timerId = window.setInterval(() => {
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      clearTimer();
      setPhase("correct");
      return;
    }
    render();
  }, 1000);
}

function startGenerate() {
  setPhase("generate");
}

function selectWord(id) {
  const word = wordById[id];
  if (!word || state.selectedWords.some((item) => item.id === id)) return;
  state.selectedWords = [...state.selectedWords, word];
  render();
}

function removeWord(id) {
  state.selectedWords = state.selectedWords.filter((word) => word.id !== id);
  render();
}

function finishGenerate() {
  if (state.selectedWords.length < MIN_SELECTED_WORDS) {
    window.alert(`回答を完成させるには、あと ${MIN_SELECTED_WORDS - state.selectedWords.length} 語選んでください。`);
    return;
  }
  state.timeLeft = START_SECONDS;
  state.checkCount = CHECK_LIMIT;
  state.checkedIds = [];
  state.activeFactId = null;
  state.finalText = state.selectedWords.map((word) => ({ wordId: word.id, status: "keep" }));
  setPhase("check");
}

function handleFactCheck(id) {
  const word = wordById[id];
  if (!word) return;

  if (!state.checkedIds.includes(id)) {
    if (state.checkCount <= 0) {
      window.alert("確認できる回数を使い切りました。修正画面へ進んでください。");
      return;
    }
    state.checkCount -= 1;
    state.checkedIds = [...state.checkedIds, id];
  }

  state.activeFactId = id;
  render();
}

function setCorrectionStatus(id, status) {
  state.finalText = state.finalText.map((item) => (item.wordId === id ? { ...item, status } : item));
  render();
}

function finishCorrection() {
  setPhase("result");
}

function restartGame() {
  clearTimer();
  state.phase = "intro";
  state.selectedWords = [];
  state.cloudWords = makeCloudWords();
  state.timeLeft = START_SECONDS;
  state.checkCount = CHECK_LIMIT;
  state.checkedIds = [];
  state.activeFactId = null;
  state.finalText = [];
  render();
}

function render() {
  app.innerHTML = `
    <div class="shell">
      ${state.phase === "intro" ? renderIntro() : `${renderHeader()}<main class="main">${renderPhase()}</main>`}
    </div>
  `;
  syncTimer();
}

function renderHeader() {
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">AI Literacy Prototype</p>
        <h1>ハルシネーション・チャレンジ</h1>
      </div>
      <div class="progress" aria-label="ゲーム進行">
        ${renderStep("generate", "1", "回答生成")}
        ${renderStep("check", "2", "確認")}
        ${renderStep("correct", "3", "修正")}
        ${renderStep("result", "4", "結果")}
      </div>
    </header>
  `;
}

function renderStep(phase, number, label) {
  const order = ["generate", "check", "correct", "result"];
  const activeIndex = order.indexOf(state.phase);
  const stepIndex = order.indexOf(phase);
  return `
    <div class="${cx("step", stepIndex === activeIndex && "is-active", stepIndex < activeIndex && "is-done")}">
      <span>${number}</span>
      <b>${escapeHtml(label)}</b>
    </div>
  `;
}

function renderPhase() {
  if (state.phase === "generate") return renderGenerate();
  if (state.phase === "check") return renderCheck();
  if (state.phase === "correct") return renderCorrect();
  return renderResult();
}

function renderIntro() {
  return `
    <main class="intro-screen">
      <section class="intro-panel">
        <p class="eyebrow">初年次教育 / 情報リテラシー教育</p>
        <h1>ハルシネーション・チャレンジ</h1>
        <p class="subtitle">ことばのつながりからAIの回答を作り、自分で確かめるゲーム</p>
        <div class="intro-grid">
          <article class="intro-note">
            <h2>ゲームの概要</h2>
            <p>
              あなたは生成AI役です。画面に表示されるWordCloudsを手掛かりに、質問に対するもっともらしい回答を作ります。
              単語をクリックすると、システムがそれらしい文章としてつなげます。
            </p>
          </article>
          <article class="intro-note is-amber">
            <h2>この体験の目的</h2>
            <p>
              AIは正しい答えを知らなくても、ことばの関連性から自然な回答を作れてしまいます。
              後から根拠を確認し、「自然な回答」と「正しい回答」は違うことを体験します。
            </p>
          </article>
        </div>
        <button class="primary large" data-action="start">AIとして回答を作成する</button>
      </section>
    </main>
  `;
}

function renderGenerate() {
  return `
    <section class="workspace generate-grid">
      <div class="compose-stack">
        <section class="panel">
          <div class="section-head">
            <div>
              <p class="eyebrow">WordClouds</p>
              <h2>概念ネットワークから語を選ぶ</h2>
            </div>
            <span class="badge">選択 ${state.selectedWords.length}</span>
          </div>
          <div class="question-box">質問：「ナポレオン・ボナパルトについて教えてください。どんな人物でしたか？」</div>
          <p class="brief">
            単語をクリックして回答に追加してください。文字の大きさは出現頻度の高さを表し、近い位置にある語は関連性が比較的強いことを示します。
          </p>
          ${renderWordCloud()}
        </section>
        <section class="panel">
          <div class="section-head">
            <div>
              <p class="eyebrow">生成中の回答</p>
              <h2>選んだ単語が文章になります</h2>
            </div>
            <span class="counter">${Math.max(0, MIN_SELECTED_WORDS - state.selectedWords.length)} 語で完成可能</span>
          </div>
          ${renderGeneratedAnswer()}
          <div class="toolbar align-end">
            <button class="primary" data-action="finish-generate" ${state.selectedWords.length < MIN_SELECTED_WORDS ? "disabled" : ""}>
              回答を完成させる
            </button>
          </div>
        </section>
      </div>
      <aside class="panel instruction-panel">
        <div class="section-head compact">
          <div>
            <p class="eyebrow">System Prompt</p>
            <h2>AIへの指示</h2>
          </div>
        </div>
        <p class="system-note">あなたはAIです。AIが誤った回答を作りやすい状況を疑似体験してください。</p>
        <ul class="instruction-list">
          <li>表示された表現を使って回答してください</li>
          <li>関連度の高い大きな表現を優先してください</li>
          <li>与えられた表現を複数使用してください</li>
          <li class="danger">分からない部分があっても、必ず回答を完成させてください</li>
          <li class="danger">「分かりません」と言ってはいけません</li>
          <li>読み手が納得するような文章にしてください</li>
          <li>自信があるように説明してください</li>
          <li>この段階では情報源を確認しなくても構いません</li>
        </ul>
      </aside>
    </section>
  `;
}

function renderWordCloud() {
  const selectedIds = new Set(state.selectedWords.map((word) => word.id));
  return `
    <div class="word-cloud" aria-label="単語クラウド">
      <svg class="network-lines" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="10" y1="22" x2="42" y2="50"></line>
        <line x1="42" y1="50" x2="80" y2="30"></line>
        <line x1="20" y1="80" x2="42" y2="50"></line>
        <line x1="80" y1="70" x2="42" y2="50"></line>
        <line x1="60" y1="90" x2="80" y2="70"></line>
      </svg>
      ${state.cloudWords
        .map((word) => {
          const isSelected = selectedIds.has(word.id);
          return `
            <button
              class="${cx("word-button", `size-${word.size}`, isSelected && "is-selected")}"
              style="--rotate: ${word.rotate}deg; --nudge: ${word.nudge}px"
              data-action="select-word"
              data-id="${escapeHtml(word.id)}"
              ${isSelected ? "disabled" : ""}
            >
              ${escapeHtml(word.text)}
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderGeneratedAnswer() {
  if (!state.selectedWords.length) {
    return `
      <div class="answer-preview empty-answer">
        <span>${OPENING}</span><em>WordCloudから言葉を選んでください</em>
      </div>
    `;
  }

  return `
    <div class="answer-preview">
      <span>${OPENING}</span>
      ${state.selectedWords
        .map(
          (word) => `
            <button class="snippet-token" data-action="remove-word" data-id="${escapeHtml(word.id)}" title="クリックで削除">
              ${escapeHtml(word.snippet)}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderCheck() {
  return `
    <section class="workspace factcheck-grid">
      <div class="panel">
        <div class="factcheck-head">
          <div>
            <p class="eyebrow">Fact Check</p>
            <h2>情報源の確認</h2>
            <p class="brief">あなたが作成した回答です。重要または怪しいと思う表現を選んで確認してください。</p>
          </div>
          <div class="meter-row">
            <span class="${cx("meter", state.timeLeft < 60 && "is-urgent")}">${formatTime(state.timeLeft)}</span>
            <span class="meter is-blue">残り ${state.checkCount}</span>
          </div>
        </div>
        <div class="answer-check">
          <span>${OPENING}</span>
          ${state.selectedWords
            .map((word) => {
              const checked = state.checkedIds.includes(word.id);
              const disabled = !checked && state.checkCount <= 0;
              return `
                <button
                  class="${cx("check-token", checked && (word.isTrue ? "is-true" : "is-false"), !checked && "is-unchecked")}"
                  data-action="fact-check"
                  data-id="${escapeHtml(word.id)}"
                  ${disabled ? "disabled" : ""}
                >
                  ${escapeHtml(word.snippet)}
                </button>
              `;
            })
            .join("")}
        </div>
        <div class="toolbar align-end">
          <button class="primary dark" data-action="go-correct">確認を終了して回答の修正へ進む</button>
        </div>
      </div>
      <aside class="panel fact-panel">
        ${renderFactPanel()}
      </aside>
    </section>
  `;
}

function renderFactPanel() {
  const word = state.activeFactId ? wordById[state.activeFactId] : null;
  if (!word) {
    return `
      <div class="section-head compact">
        <div>
          <p class="eyebrow">Evidence</p>
          <h2>確認結果</h2>
        </div>
      </div>
      <div class="empty-fact">
        <strong>まだ確認していません</strong>
        <p>左側の文章中のマーカーをクリックすると、根拠や誤りの説明が表示されます。</p>
      </div>
    `;
  }

  return `
    <div class="section-head compact">
      <div>
        <p class="eyebrow">Evidence</p>
        <h2>確認結果</h2>
      </div>
    </div>
    <p class="selected-label">選択した言葉：${escapeHtml(word.text)}</p>
    <article class="${cx("fact-result", word.isTrue ? "is-true" : "is-false")}">
      <h3>${word.isTrue ? "事実確認 済" : "誤情報（ハルシネーション）"}</h3>
      <p>${escapeHtml(word.fact)}</p>
    </article>
  `;
}

function renderCorrect() {
  return `
    <section class="narrow-workspace">
      <div class="section-title">
        <p class="eyebrow">Revision</p>
        <h2>回答の修正と確定</h2>
        <p>確認結果をもとに、誤りや論理的な飛躍を削除して回答を整えてください。</p>
      </div>
      <div class="panel">
        <div class="correction-list">
          ${state.finalText.map(renderCorrectionRow).join("")}
        </div>
      </div>
      <div class="toolbar center">
        <button class="primary success large" data-action="finish-correct">修正を完了する</button>
      </div>
    </section>
  `;
}

function renderCorrectionRow(item) {
  const word = wordById[item.wordId];
  const checked = state.checkedIds.includes(item.wordId);
  return `
    <article class="${cx("correction-row", item.status === "remove" && "is-removed")}">
      <div>
        <p>${escapeHtml(word.snippet)}</p>
        <div class="status-row">
          ${
            checked
              ? `<span class="${cx("status", word.isTrue ? "is-true" : "is-false")}">${word.isTrue ? "確認結果：事実" : "確認結果：誤り"}</span>`
              : `<span class="status">未確認</span>`
          }
        </div>
      </div>
      <div class="segmented">
        <button class="${cx(item.status !== "remove" && "is-active")}" data-action="set-status" data-id="${escapeHtml(item.wordId)}" data-status="keep">残す</button>
        <button class="${cx(item.status === "remove" && "is-active danger")}" data-action="set-status" data-id="${escapeHtml(item.wordId)}" data-status="remove">削除</button>
      </div>
    </article>
  `;
}

function renderResult() {
  const keptItems = state.finalText.filter((item) => item.status !== "remove").map((item) => wordById[item.wordId]);
  const removedItems = state.finalText.filter((item) => item.status === "remove").map((item) => wordById[item.wordId]);
  const hasFalseInfo = keptItems.some((word) => !word.isTrue);
  return `
    <section class="narrow-workspace result-workspace">
      <div class="section-title">
        <p class="eyebrow">Result</p>
        <h2>ゲーム終了</h2>
        <p>お疲れ様でした。最終的な回答と、この体験のまとめです。</p>
      </div>
      <section class="panel">
        <p class="eyebrow">修正後の回答</p>
        <div class="final-answer">
          ${keptItems.length ? escapeHtml(buildAnswer(keptItems)) : "（すべて削除されました）"}
        </div>
        <div class="${cx("result-callout", hasFalseInfo ? "is-false" : "is-true")}">
          <h3>${hasFalseInfo ? "誤情報がまだ残っています" : "素晴らしいファクトチェックです"}</h3>
          <p>
            ${
              hasFalseInfo
                ? "流暢な文章であっても、根拠を確認せずに残すと誤情報を広めることになります。"
                : "文章の流暢さに頼り切らず、自分で根拠を確認して正確性を区別できました。"
            }
          </p>
        </div>
        <div class="result-stats">
          <span>残した語：${keptItems.length}</span>
          <span>削除した語：${removedItems.length}</span>
          <span>確認した語：${state.checkedIds.length}</span>
        </div>
      </section>
      <section class="panel summary-panel">
        <h3>まとめ：生成AIとの付き合い方</h3>
        <ol>
          <li><strong>AIは「意味」ではなく「関連性」で答える</strong><span>ことば同士の関係から、もっともらしい表現をつなぎます。</span></li>
          <li><strong>「流暢な文章＝正しい」ではない</strong><span>文章の綺麗さと情報の正確性は分けて考える必要があります。</span></li>
          <li><strong>必ず自分で情報を確認する</strong><span>根拠や情報源を確かめる習慣が、AIリテラシーの中心です。</span></li>
        </ol>
      </section>
      <div class="toolbar center">
        <button class="primary dark large" data-action="restart">もう一度プレイする</button>
      </div>
    </section>
  `;
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target || target.disabled) return;

  const { action, id, status } = target.dataset;
  if (action === "start") startGenerate();
  if (action === "select-word") selectWord(id);
  if (action === "remove-word") removeWord(id);
  if (action === "finish-generate") finishGenerate();
  if (action === "fact-check") handleFactCheck(id);
  if (action === "go-correct") setPhase("correct");
  if (action === "set-status") setCorrectionStatus(id, status);
  if (action === "finish-correct") finishCorrection();
  if (action === "restart") restartGame();
});

render();
