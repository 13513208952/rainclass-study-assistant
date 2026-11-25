(() => {
  const host = document.createElement('rainclass-ds-panel');
  const shadow = host.attachShadow({ mode: 'closed' });
  const icon = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const chat = icon('<path d="M20.5 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-3.6-.8l-4.9 1.3 1.4-4.6a8.5 8.5 0 1 1 15.6-4.4Z"/><path d="M8.5 11.6h.01m3.49 0h.01m3.49 0h.01" stroke-width="2.4"/>');
  const settingsIcon = icon('<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="var(--paper)"/><circle cx="15" cy="17" r="2" fill="var(--paper)"/>');
  const closeIcon = icon('<path d="m6 6 12 12M18 6 6 18"/>');
  const quickIcon = icon('<path d="M12 2.5 14 9l6.5 2-6.5 2-2 6.5L10 13l-6.5-2L10 9l2-6.5Zm6 15v4m-2-2h4"/>');
  const sendIcon = icon('<path d="M12 19V5m-6 6 6-6 6 6"/>');

  shadow.innerHTML = `<style>
    :host { all: initial; position: fixed; inset: auto 20px 20px auto; z-index: 2147483647; color-scheme: light dark;
      --paper: light-dark(#fff,#202124); --ink: light-dark(#202124,#f3f4f6);
      --muted: light-dark(#666b74,#b2b6bf); --line: light-dark(#e5e6e9,#41434a);
      --surface: light-dark(#f2f3f5,#2e3036); --accent: light-dark(#314bb9,#a9baff);
      --action: light-dark(#18191b,#edf0f7); --action-ink: light-dark(#fff,#1d2027);
      --shadow: 0 14px 44px #0002, 0 2px 8px #0001;
      color: var(--ink); font: 14px/1.55 system-ui,sans-serif; }
    :host([hidden]), :host([data-capturing]), [hidden] { display: none !important; }
    * { box-sizing: border-box; }
    button, textarea, select { font: inherit; color: inherit; }
    button { cursor: pointer; }
    button:disabled { opacity: .48; cursor: wait; }
    button:focus-visible, select:focus-visible, textarea:focus-visible {
      outline: 2px solid var(--accent); outline-offset: 2px;
    }
    svg { display: block; width: 20px; height: 20px; flex: none; }
    #launch, .icon-button, .send { display: grid; place-items: center; padding: 0; border: 0; }
    #launch { width: 58px; height: 58px; border-radius: 50%; background: var(--action); color: var(--action-ink);
      box-shadow: var(--shadow); }
    #launch svg { width: 28px; height: 28px; }
    #launch:hover, .send:hover:not(:disabled) { opacity: .88; }
    aside { display: flex; flex-direction: column; width: min(418px,calc(100vw - 40px));
      height: min(640px,calc(100dvh - 40px)); background: var(--paper); border: 1px solid var(--line);
      border-radius: 22px; box-shadow: var(--shadow); overflow: hidden; }
    header { flex: none; display: flex; align-items: center; gap: 6px; padding: 12px 12px 12px 18px;
      border-bottom: 1px solid var(--line); }
    .identity { flex: 1; min-width: 0; display: flex; align-items: center; gap: 10px; }
    .avatar { display: grid; place-items: center; flex: none; width: 34px; height: 34px; border-radius: 50%;
      color: var(--accent); background: var(--surface); }
    .identity strong, .identity small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .identity strong { font-size: 15px; line-height: 1.3; }
    .identity small { color: var(--muted); font-size: 11px; }
    .icon-button { width: 35px; height: 35px; border-radius: 10px; background: transparent; color: var(--muted); }
    .icon-button:hover { background: var(--surface); color: var(--ink); }
    #log { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; padding: 17px 17px 8px; }
    #log:empty, #log:not(:empty) + .welcome { display: none; }
    .welcome { flex: 1; min-height: 0; overflow: auto; display: grid; place-items: center; text-align: center; padding: 16px 26px; }
    .welcome svg { margin: 0 auto 12px; width: 29px; height: 29px; color: var(--accent); }
    .welcome h2 { margin: 0 0 8px; font-size: 21px; line-height: 1.25; letter-spacing: -.02em; }
    .welcome p { margin: 0; color: var(--muted); }
    .message { white-space: pre-wrap; overflow-wrap: anywhere; margin: 0 0 16px; }
    .message.user { width: fit-content; max-width: 85%; margin-inline-start: auto; padding: 9px 13px;
      border-radius: 17px 17px 5px 17px; background: var(--surface); }
    .message.assistant strong { display: block; font-size: 12px; margin-bottom: 5px; }
    .math-block { display: block; overflow-x: auto; padding: 4px 0; white-space: normal; }
    footer { flex: none; background: var(--paper); padding: 8px 12px 10px; }
    .tools { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
    #quick { display: flex; align-items: center; gap: 5px; flex: none; border-radius: 99px;
      border: 1px solid var(--line); background: var(--paper); padding: 5px 9px; color: var(--accent); font-weight: 650; }
    #quick svg { width: 16px; height: 16px; }
    #quick:hover:not(:disabled) { background: var(--surface); }
    select { width: 0; min-width: 0; flex: 1; text-overflow: ellipsis; border: 1px solid var(--line);
      border-radius: 9px; background: var(--paper); padding: 5px; font-size: 12px; }
    form { display: flex; align-items: flex-end; gap: 8px; border: 1px solid var(--line);
      background: var(--paper); border-radius: 20px; padding: 5px; box-shadow: 0 2px 4px #0001; }
    form:focus-within { border-color: var(--muted); }
    textarea { min-width: 0; flex: 1; resize: none; max-height: 92px; overflow: auto; field-sizing: content;
      background: transparent; border: 0; border-radius: 15px; padding: 7px 7px 7px 10px; }
    textarea::placeholder { color: var(--muted); opacity: 1; }
    .send { width: 34px; height: 34px; flex: none; border-radius: 50%;
      background: var(--action); color: var(--action-ink); }
    .send svg { width: 17px; height: 17px; }
    #notice { margin: 7px 0 0; text-align: center; color: var(--muted); font-size: 11px; }
    #status:not(:empty) { max-height: 6em; overflow: auto; margin-bottom: 6px; padding: 5px 8px;
      border-radius: 7px; background: var(--surface); color: var(--ink); font-size: 12px; }
    @media (max-width: 480px) {
      :host { inset: auto 10px 10px auto; }
      aside { width: calc(100vw - 20px); height: min(640px,calc(100dvh - 20px)); border-radius: 17px; }
    }
  </style>
  <button id="launch" type="button" title="打开 DeepSeek 学习助手" aria-label="打开 DeepSeek 学习助手"
    aria-controls="ds-chat" aria-expanded="false">${chat}</button>
  <aside id="ds-chat" hidden aria-label="DeepSeek 学习助手">
    <header>
      <div class="identity"><span class="avatar">${quickIcon}</span><div><strong>学习助手</strong><small>DeepSeek Flash</small></div></div>
      <button id="settings" class="icon-button" type="button" title="设置" aria-label="设置">${settingsIcon}</button>
      <button id="close" class="icon-button" type="button" title="收起问答" aria-label="收起问答">${closeIcon}</button>
    </header>
    <div id="log" role="log" aria-label="问答记录"></div>
    <div class="welcome"><div>${chat}<h2>这道题，怎么想？</h2>
      <p>从一个提示开始，或输入你卡住的地方。</p></div></div>
    <footer>
      <div id="status" role="status"></div>
      <div class="tools"><button id="quick" type="button">${quickIcon}问问DS</button>
        <select id="questions" hidden aria-label="选择要询问的题目"></select></div>
      <form><textarea aria-label="提问" placeholder="输入你的问题…" rows="1" maxlength="4000"></textarea>
        <button class="send" type="submit" title="发送" aria-label="发送">${sendIcon}</button></form>
      <p id="notice">发送时会将本题截图和文字发给 DeepSeek。</p>
    </footer>
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

  function setOpen(open) {
    pane.hidden = !open;
    launcher.hidden = open;
    launcher.setAttribute('aria-expanded', String(open));
    if (open && !busy) refreshQuestions();
    (open ? get('#close') : launcher).focus();
  }

  function append(role, text) {
    const item = document.createElement('p');
    item.className = `message ${role}`;
    if (role === 'assistant') {
      const title = document.createElement('strong');
      title.textContent = 'DeepSeek';
      item.append(title);
    }
    if (role === 'assistant') appendDsMath(item, text);
    else item.append(text);
    log.append(item);
    log.scrollTop = log.scrollHeight;
  }

  function lock(locked) {
    busy = locked;
    for (const control of [quick, list, send]) control.disabled = locked;
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

  launcher.addEventListener('click', () => setOpen(true));
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
  get('#close').addEventListener('click', () => setOpen(false));
  shadow.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !pane.hidden) {
      event.stopPropagation();
      setOpen(false);
    }
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
