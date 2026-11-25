(() => {
  const host = document.createElement('rainclass-ds-panel');
  const shadow = host.attachShadow({ mode: 'closed' });
  shadow.innerHTML = `<style>
    :host { all: initial; position: fixed; z-index: 2147483647; right: 16px; bottom: 18px; color-scheme: light dark;
      --bg: light-dark(#fff,#20232a); --ink: light-dark(#182135,#edf1f8); --muted: light-dark(#586578,#b2bdce);
      --line: light-dark(#d9e1ee,#495364); --surface: light-dark(#f3f6fc,#2d3544); --accent: light-dark(#364ec3,#9dacf8);
      color: var(--ink); font: 14px/1.5 system-ui,sans-serif; }
    :host([hidden]), :host([data-capturing]), [hidden] { display: none !important; }
    * { box-sizing: border-box; }
    button, textarea, select { font: inherit; color: inherit; }
    button { cursor: pointer; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; }
    button:disabled { opacity: .55; cursor: wait; }
    button:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    #launch { color: var(--accent); background: var(--bg); font-weight: 650; box-shadow: 0 4px 14px #0002; }
    aside { display: flex; flex-direction: column; width: min(365px,calc(100vw - 32px)); max-height: min(620px,calc(100vh - 36px));
      background: var(--bg); border: 1px solid var(--line); border-radius: 13px; box-shadow: 0 10px 32px #0003; overflow: hidden; }
    header, .tools, form { display: flex; gap: 8px; align-items: center; padding: 10px 12px; }
    header { border-bottom: 1px solid var(--line); } header strong { margin-right: auto; }
    .tools { flex-wrap: wrap; } #quick { background: var(--accent); color: var(--bg); font-weight: 650; }
    select { min-width: 0; flex: 1; border: 1px solid var(--line); border-radius: 7px; background: var(--bg); padding: 5px; }
    #notice { margin: 0 12px 8px; color: var(--muted); font-size: 12px; }
    #status:not(:empty) { padding: 5px 12px; color: var(--accent); }
    #log { overflow: auto; min-height: 56px; padding: 0 12px 8px; }
    #log p { white-space: pre-wrap; overflow-wrap: anywhere; margin: 8px 0; padding: 8px 10px;
      border: 1px solid var(--line); border-radius: 9px; }
    .math-block { display: block; overflow-x: auto; padding: 4px 0; white-space: normal; }
    #log .user { background: var(--surface); } #log strong { display: block; margin-bottom: 3px; }
    form { align-items: flex-end; border-top: 1px solid var(--line); }
    textarea { min-width: 0; flex: 1; resize: vertical; min-height: 40px; max-height: 130px;
      border: 1px solid var(--line); border-radius: 8px; background: var(--bg); padding: 6px 8px; }
  </style>
  <button id="launch" type="button" title="截图后发送给 DeepSeek">问问DS</button>
  <aside hidden aria-label="DeepSeek 学习助手">
    <header><strong>DeepSeek 学习助手</strong><button id="settings" type="button">设置</button>
      <button id="close" type="button" aria-label="收起问答">收起</button></header>
    <div class="tools"><button id="quick" type="button">问问DS</button>
      <select id="questions" hidden aria-label="选择要询问的题目"></select></div>
    <p id="notice">发送时仅截取所选题目，截图和文字会发给 DeepSeek。</p>
    <div id="status" role="status"></div>
    <div id="log" role="log" aria-label="问答记录"></div>
    <form><textarea aria-label="提问" placeholder="输入问题或继续追问" rows="2" maxlength="4000"></textarea>
      <button type="submit">发送</button></form>
  </aside>`;
  const get = selector => shadow.querySelector(selector);
  const pane = get('aside');
  const launcher = get('#launch');
  const quick = get('#quick');
  const list = get('#questions');
  const status = get('#status');
  const log = get('#log');
  const input = get('textarea');
  const send = get('button[type=submit]');

  let url;
  let kind;
  let selected;
  let nodes = [];
  let conversation;
  let busy = false;

  function refreshRoute() {
    if (location.href === url) return;
    url = location.href;
    kind = ds.unit(url);
    host.hidden = !kind;
    selected = null;
    nodes = [];
    list.replaceChildren();
    list.hidden = true;
    conversation = null;
    log.replaceChildren();
    status.textContent = '';
    input.value = '';
    if (kind && !pane.hidden && !busy) refreshQuestions();
  }

  function refreshQuestions() {
    nodes = questionCapture.candidates(kind);
    if (!nodes.includes(selected)) selected = questionCapture.preferred(nodes);
    const options = nodes.map((node, i) => {
      const text = questionCapture.textOf(node).replace(/\s+/g, ' ').slice(0, 42);
      return new Option(`${i + 1}. ${text || '图片题目'}`, String(i));
    });
    list.replaceChildren(...options);
    list.hidden = options.length < 2;
    if (selected) list.value = String(nodes.indexOf(selected));
    return selected;
  }

  function open() {
    pane.hidden = false;
    launcher.hidden = true;
    refreshQuestions();
  }

  function append(role, text) {
    const item = document.createElement('p');
    item.className = role;
    const title = document.createElement('strong');
    title.textContent = role === 'user' ? '你' : 'DeepSeek';
    item.append(title);
    if (role === 'assistant') appendDsMath(item, text);
    else item.append(text);
    log.append(item);
    log.scrollTop = log.scrollHeight;
  }

  function lock(locked) {
    busy = locked;
    for (const control of [launcher, quick, list, send]) control.disabled = locked;
  }

  async function ask(prompt, newQuestion) {
    refreshRoute();
    if (!kind || busy || !prompt) return;
    const here = url;
    const node = refreshQuestions();
    if (!node) {
      status.textContent = '未找到已显示的题目。请先打开图文正文或一道测试题。';
      return;
    }
    lock(true);
    try {
      const available = await browser.runtime.sendMessage({ type: 'ds:ready', url: here });
      if (here !== location.href) return;
      if (!available?.ready) throw new Error('请先打开右上角「设置」，保存 API 密钥并启用截图问答。');
      if (newQuestion || conversation?.node !== node) {
        status.textContent = '正在截取题目…';
        const images = await questionCapture.capture(node, here, host);
        if (here !== location.href) return;
        conversation = { node, text: questionCapture.textOf(node).slice(0, ds.maxText), images, turns: [] };
        log.replaceChildren();
      }
      const { text, images, turns } = conversation;
      status.textContent = '正在等待 DeepSeek 回复…';
      append('user', prompt);
      const response = await browser.runtime.sendMessage({ type: 'ds:ask', url: here, text, images, turns, prompt });
      if (here !== location.href) return;
      if (!response?.answer) throw new Error(response?.error || 'DeepSeek 未返回回复。');
      turns.push({ prompt, answer: response.answer });
      if (turns.length > 12) turns.shift();
      append('assistant', response.answer);
      status.textContent = '';
    } catch (error) {
      if (here === location.href) status.textContent = error.message;
    } finally {
      lock(false);
      refreshRoute();
    }
  }

  launcher.addEventListener('click', event => {
    if (!event.isTrusted || busy) return;
    open();
    ask(ds.quickPrompt, true);
  });
  quick.addEventListener('click', event => {
    if (event.isTrusted) ask(ds.quickPrompt, true);
  });
  get('form').addEventListener('submit', event => {
    event.preventDefault();
    if (!event.isTrusted || busy || !input.value.trim()) return;
    const prompt = input.value.trim();
    input.value = '';
    ask(prompt, false);
  });
  get('#close').addEventListener('click', () => {
    pane.hidden = true;
    launcher.hidden = false;
  });
  get('#settings').addEventListener('click', async event => {
    if (!event.isTrusted) return;
    try {
      await browser.runtime.sendMessage({ type: 'ds:settings', url });
    } catch {
      status.textContent = '未能打开设置，请在 Firefox 附加组件管理器中打开扩展设置。';
    }
  });
  list.addEventListener('change', () => {
    selected = nodes[Number(list.value)];
    conversation = null;
    log.replaceChildren();
    status.textContent = '';
  });

  document.body.append(host);
  refreshRoute();
  navigation.addEventListener('currententrychange', refreshRoute);
})();
