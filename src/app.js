const app = document.querySelector("#app");
const data = window.GAME_DATA;

const state = {
  phase: "generate",
  selectedItems: [],
  answer: "",
  checksLeft: data.maxChecks,
  checkedIds: [],
  currentFact: null,
  revisedAnswer: "",
};

const nodeById = Object.fromEntries(data.nodes.map((node) => [node.id, node]));
const linkById = Object.fromEntries(data.links.map((link) => [link.id, link]));

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

function formatAnswer(items) {
  return items
    .map((item) => item.insert)
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/、\s+/g, "、")
    .trim();
}

function setPhase(phase) {
  state.phase = phase;
  render();
}

function selectExpression(kind, id) {
  const source = kind === "node" ? nodeById[id] : linkById[id];
  if (!source) return;

  state.selectedItems.push({
    uid: `${kind}-${id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    kind,
    id,
    label: source.label,
    insert: source.insert,
    risky: source.type === "trap" || id === "l_cause" || id === "l_direct",
  });
  state.answer = formatAnswer(state.selectedItems);
  render();
}

function removeSelected(uid) {
  state.selectedItems = state.selectedItems.filter((item) => item.uid !== uid);
  state.answer = formatAnswer(state.selectedItems);
  render();
}

function moveSelected(uid, direction) {
  const index = state.selectedItems.findIndex((item) => item.uid === uid);
  if (index < 0) return;
  const target = index + direction;
  if (target < 0 || target >= state.selectedItems.length) return;
  const next = [...state.selectedItems];
  [next[index], next[target]] = [next[target], next[index]];
  state.selectedItems = next;
  state.answer = formatAnswer(state.selectedItems);
  render();
}

function clearGeneratedAnswer() {
  state.selectedItems = [];
  state.answer = "";
  render();
}

function useSuggestedChain() {
  const ids = ["n1", "l1", "n2", "l2", "n3", "l4", "n5", "n7", "n6"];
  state.selectedItems = ids.map((id, index) => {
    const isNode = Boolean(nodeById[id]);
    const source = isNode ? nodeById[id] : linkById[id];
    return {
      uid: `suggested-${id}-${index}`,
      kind: isNode ? "node" : "link",
      id,
      label: source.label,
      insert: source.insert,
      risky: source.type === "trap" || id === "l_cause" || id === "l_direct",
    };
  });
  state.answer = formatAnswer(state.selectedItems);
  render();
}

function submitGeneratedAnswer() {
  const answer = state.answer.trim();
  if (answer.length < data.minAnswerLength) {
    window.alert(`もう少し回答を組み立ててください（${data.minAnswerLength}文字以上）。`);
    return;
  }
  state.answer = answer;
  state.phase = "factcheck";
  render();
}

function checkElement(id) {
  if (state.checksLeft <= 0 || state.checkedIds.includes(id)) return;

  state.checksLeft -= 1;
  state.checkedIds.push(id);
  state.currentFact =
    data.facts[id] || {
      title: "特記事項なし",
      text: "この表現自体には大きな不審点はありません。ただし、ほかの表現とのつながり方には注意が必要です。",
      type: "info",
    };
  render();
}

function startRevision() {
  state.revisedAnswer = buildRevisionSeed();
  state.phase = "revise";
  render();
}

function buildRevisionSeed() {
  const hasCritical = state.checkedIds.some((id) => data.facts[id]?.type === "critical");
  const hasWarning = state.checkedIds.some((id) => data.facts[id]?.type === "warning");
  const suffixes = [];

  if (hasCritical) {
    suffixes.push("特に、朝食と成績の関係は相関として扱い、直接的な因果関係として断定しないことが重要です。");
  }
  if (hasWarning) {
    suffixes.push("具体的な数値や「ある研究」といった表現は、出典が確認できない限り使わないほうが安全です。");
  }
  if (!suffixes.length) {
    suffixes.push("根拠が確認できない部分は、断定ではなく可能性として慎重に述べる必要があります。");
  }

  return `${data.cautiousOpening} ${suffixes.join(" ")}`;
}

function finishRevision() {
  if (state.revisedAnswer.trim().length < 40) {
    window.alert("修正後の回答をもう少し具体的に書いてください。");
    return;
  }
  state.revisedAnswer = state.revisedAnswer.trim();
  state.phase = "result";
  render();
}

function resetGame() {
  state.phase = "generate";
  state.selectedItems = [];
  state.answer = "";
  state.checksLeft = data.maxChecks;
  state.checkedIds = [];
  state.currentFact = null;
  state.revisedAnswer = "";
  render();
}

function getScore() {
  let score = 40;
  const checkedFacts = state.checkedIds.map((id) => data.facts[id]).filter(Boolean);
  const hasCritical = checkedFacts.some((fact) => fact.type === "critical");
  const hasWarning = checkedFacts.some((fact) => fact.type === "warning");
  const checkedRelevant = state.checkedIds.length >= 4;
  const revisedCautiously = /断定|相関|因果|可能性|確認|根拠/.test(state.revisedAnswer);

  if (hasCritical) score += 25;
  if (hasWarning) score += 20;
  if (checkedRelevant) score += 10;
  if (revisedCautiously) score += 15;
  return Math.min(100, score);
}

function render() {
  app.innerHTML = `
    <div class="shell">
      ${renderHeader()}
      <main class="main">
        ${renderPhase()}
      </main>
    </div>
  `;
  bindEvents();
}

function renderHeader() {
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">AI Literacy Prototype</p>
        <h1>${escapeHtml(data.title)}</h1>
      </div>
      <div class="progress" aria-label="ゲーム進行">
        ${renderStep("generate", "1", "回答生成")}
        ${renderStep("factcheck", "2", "確認")}
        ${renderStep("revise", "3", "修正")}
        ${renderStep("result", "4", "結果")}
      </div>
    </header>
  `;
}

function renderStep(phase, number, label) {
  const order = ["generate", "factcheck", "revise", "result"];
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
  if (state.phase === "factcheck") return renderFactcheck();
  if (state.phase === "revise") return renderRevise();
  return renderResult();
}

function renderGenerate() {
  return `
    <section class="workspace two-column">
      <div class="board-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">生成AIモード</p>
            <h2>${escapeHtml(data.question)}</h2>
          </div>
          <span class="badge">クリックで回答に追加</span>
        </div>
        <p class="brief">
          関連表現マップから表現やつながりを選び、もっともらしい回答を組み立ててください。
          この段階では根拠を確認せず、自然さを優先します。
        </p>
        ${renderExpressionMap("compose")}
      </div>
      <aside class="answer-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">回答ボックス</p>
            <h2>選んだ表現</h2>
          </div>
          <span class="counter">${state.answer.length} 文字</span>
        </div>
        ${renderSelectedItems()}
        <textarea class="answer-textarea" data-field="answer" aria-label="生成した回答">${escapeHtml(state.answer)}</textarea>
        <div class="toolbar">
          <button class="secondary" data-action="suggest">例の流れを入れる</button>
          <button class="secondary" data-action="clear-answer">クリア</button>
          <button class="primary" data-action="submit-generated">回答を出力</button>
        </div>
      </aside>
    </section>
  `;
}

function renderSelectedItems() {
  if (!state.selectedItems.length) {
    return `
      <div class="empty-composer">
        上のマップから表現をクリックすると、ここに語句カードが並びます。
      </div>
    `;
  }

  return `
    <div class="selected-list" aria-label="選択した表現">
      ${state.selectedItems
        .map(
          (item, index) => `
            <div class="${cx("selected-chip", item.risky && "is-risky")}">
              <span>${escapeHtml(item.label)}</span>
              <div class="chip-actions">
                <button title="前へ" data-action="move-selected" data-uid="${item.uid}" data-direction="-1" ${
                  index === 0 ? "disabled" : ""
                }>↑</button>
                <button title="後ろへ" data-action="move-selected" data-uid="${item.uid}" data-direction="1" ${
                  index === state.selectedItems.length - 1 ? "disabled" : ""
                }>↓</button>
                <button title="削除" data-action="remove-selected" data-uid="${item.uid}">×</button>
              </div>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderFactcheck() {
  return `
    <section class="workspace factcheck-grid">
      <div class="review-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">自己確認モード</p>
            <h2>回答の根拠を調べる</h2>
          </div>
          <span class="badge strong">残り ${state.checksLeft} / ${data.maxChecks} 回</span>
        </div>
        <div class="answer-card">
          <p class="eyebrow">生成した回答</p>
          <p>${escapeHtml(state.answer)}</p>
        </div>
        ${renderExpressionMap("check")}
      </div>
      <aside class="fact-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">調査結果</p>
            <h2>クリックした情報</h2>
          </div>
        </div>
        ${renderCurrentFact()}
        ${renderCheckedTrail()}
        <div class="toolbar vertical">
          <button class="secondary" data-action="back-generate">回答生成に戻る</button>
          <button class="primary" data-action="start-revision">修正へ進む</button>
        </div>
      </aside>
    </section>
  `;
}

function renderCurrentFact() {
  if (!state.currentFact) {
    return `
      <div class="empty-result">
        マップ上の表現や関係ラベルをクリックすると、確認結果が表示されます。
      </div>
    `;
  }

  return `
    <div class="${cx("fact-card", `fact-${state.currentFact.type}`)}">
      <h3>${escapeHtml(state.currentFact.title)}</h3>
      <p>${escapeHtml(state.currentFact.text)}</p>
    </div>
  `;
}

function renderCheckedTrail() {
  if (!state.checkedIds.length) return "";
  return `
    <div class="trail">
      <p class="eyebrow">確認済み</p>
      <div>
        ${state.checkedIds
          .map((id) => {
            const item = nodeById[id] || linkById[id];
            return `<span>${escapeHtml(item?.label || id)}</span>`;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderRevise() {
  const facts = state.checkedIds.map((id) => data.facts[id]).filter(Boolean);
  return `
    <section class="workspace revise-grid">
      <div class="revision-source">
        <div class="section-head">
          <div>
            <p class="eyebrow">修正モード</p>
            <h2>根拠に合わせて言い換える</h2>
          </div>
        </div>
        <div class="compare-block">
          <p class="eyebrow">修正前</p>
          <p class="struck">${escapeHtml(state.answer)}</p>
        </div>
        <div class="fact-list">
          <p class="eyebrow">確認したポイント</p>
          ${
            facts.length
              ? facts
                  .map(
                    (fact) => `
                    <article class="${cx("mini-fact", `fact-${fact.type}`)}">
                      <b>${escapeHtml(fact.title)}</b>
                      <span>${escapeHtml(fact.text)}</span>
                    </article>
                  `
                  )
                  .join("")
              : `<div class="empty-result">確認結果が少ないため、断定を避けて慎重に修正してください。</div>`
          }
        </div>
      </div>
      <aside class="answer-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">最終回答</p>
            <h2>慎重な回答に修正</h2>
          </div>
          <span class="counter">${state.revisedAnswer.length} 文字</span>
        </div>
        <textarea class="answer-textarea tall" data-field="revisedAnswer" aria-label="修正後の回答">${escapeHtml(
          state.revisedAnswer
        )}</textarea>
        <div class="toolbar">
          <button class="secondary" data-action="back-check">確認に戻る</button>
          <button class="secondary" data-action="seed-revision">慎重表現を入れる</button>
          <button class="primary" data-action="finish-revision">提出する</button>
        </div>
      </aside>
    </section>
  `;
}

function renderResult() {
  const score = getScore();
  const hasCritical = state.checkedIds.some((id) => data.facts[id]?.type === "critical");
  const hasWarning = state.checkedIds.some((id) => data.facts[id]?.type === "warning");

  return `
    <section class="result-layout">
      <div class="score-panel">
        <p class="eyebrow">Result</p>
        <h2>${score}<span>pt</span></h2>
        <p>流暢な回答と正確な回答を区別する力をチェックしました。</p>
      </div>
      <div class="result-grid">
        ${renderOutcome("相関と因果の区別", hasCritical, "因果関係の飛躍や第三の変数に気づけました。", "言葉のつながりだけで因果関係を判断している可能性があります。")}
        ${renderOutcome("ハルシネーションの発見", hasWarning, "根拠のない数値や曖昧な研究表現を確認できました。", "具体的な数値や権威表現を優先して確認すると、さらに精度が上がります。")}
      </div>
      <div class="final-answers">
        <article>
          <p class="eyebrow">最初の回答</p>
          <p>${escapeHtml(state.answer)}</p>
        </article>
        <article>
          <p class="eyebrow">修正後の回答</p>
          <p>${escapeHtml(state.revisedAnswer)}</p>
        </article>
      </div>
      <button class="primary wide" data-action="reset">もう一度プレイ</button>
    </section>
  `;
}

function renderOutcome(title, success, successText, failText) {
  return `
    <article class="${cx("outcome", success ? "success" : "needs-work")}">
      <b>${escapeHtml(title)}</b>
      <p>${escapeHtml(success ? successText : failText)}</p>
    </article>
  `;
}

function renderExpressionMap(mode) {
  const viewBoxWidth = 1000;
  const viewBoxHeight = 560;

  return `
    <div class="map-scroll">
      <div class="map-wrap" data-mode="${mode}">
        <svg class="map-lines" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" preserveAspectRatio="none" aria-hidden="true">
          ${data.links
            .map((link) => {
              const source = nodeById[link.source];
              const target = nodeById[link.target];
              const x1 = source.x * 10;
              const y1 = source.y * 5.6;
              const x2 = target.x * 10;
              const y2 = target.y * 5.6;
              const checked = state.checkedIds.includes(link.id);
              return `<line class="${cx("map-link-line", `strength-${link.strength}`, checked && "is-checked")}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
            })
            .join("")}
        </svg>
        ${data.links
          .map((link) => {
            const source = nodeById[link.source];
            const target = nodeById[link.target];
            const left = link.labelX ?? (source.x + target.x) / 2;
            const top = link.labelY ?? (source.y + target.y) / 2;
            return `
              <button
                class="${cx("link-label", `strength-${link.strength}`, state.checkedIds.includes(link.id) && "is-checked")}"
                style="left:${left}%; top:${top}%"
                data-map-kind="link"
                data-map-id="${link.id}"
              >${escapeHtml(link.label)}</button>
            `;
          })
          .join("")}
        ${data.nodes
          .map(
            (node) => `
              <button
                class="${cx(
                  "map-node",
                  `node-${node.type}`,
                  `weight-${node.weight}`,
                  state.checkedIds.includes(node.id) && "is-checked"
                )}"
                style="left:${node.x}%; top:${node.y}%"
                data-map-kind="node"
                data-map-id="${node.id}"
              >${escapeHtml(node.label)}</button>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function bindEvents() {
  app.querySelectorAll("[data-map-kind]").forEach((button) => {
    button.addEventListener("click", () => {
      const kind = button.dataset.mapKind;
      const id = button.dataset.mapId;
      if (state.phase === "generate") selectExpression(kind, id);
      if (state.phase === "factcheck") checkElement(id);
    });
  });

  app.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "submit-generated") submitGeneratedAnswer();
      if (action === "clear-answer") clearGeneratedAnswer();
      if (action === "suggest") useSuggestedChain();
      if (action === "remove-selected") removeSelected(button.dataset.uid);
      if (action === "move-selected") moveSelected(button.dataset.uid, Number(button.dataset.direction));
      if (action === "back-generate") setPhase("generate");
      if (action === "start-revision") startRevision();
      if (action === "back-check") setPhase("factcheck");
      if (action === "seed-revision") {
        state.revisedAnswer = buildRevisionSeed();
        render();
      }
      if (action === "finish-revision") finishRevision();
      if (action === "reset") resetGame();
    });
  });

  app.querySelectorAll("[data-field]").forEach((field) => {
    field.addEventListener("input", () => {
      state[field.dataset.field] = field.value;
      const counter = field.closest(".answer-panel")?.querySelector(".counter");
      if (counter) counter.textContent = `${field.value.length} 文字`;
    });
  });
}

render();
