const dsMarkdown = (() => {
  const md = markdownit({ html: false, breaks: true });
  const math = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\((.+?)\\\)|\$(?![\s$])((?:\\.|[^$\\\n])+?)(?<!\s)\$(?![\d$])/y;
  const looseTitle = /^\*\*[ \t]+([^*\n]+?)[ \t]+\*\*[ \t]*$/gm;

  md.inline.ruler.before('escape', 'ds_math', (state, silent) => {
    math.lastIndex = state.pos;
    const match = math.exec(state.src);
    if (!match || math.lastIndex > state.posMax) return false;
    const [raw, dollars, brackets, parentheses, inline] = match;
    if (!silent) {
      const token = state.push('ds_math', 'span', 0);
      token.content = dollars ?? brackets ?? parentheses ?? inline;
      token.meta = { raw, display: dollars !== undefined || brackets !== undefined };
    }
    state.pos += raw.length;
    return true;
  });

  md.core.ruler.before('inline', 'ds_loose_title', state => {
    for (const token of state.tokens) {
      if (token.type === 'inline') {
        token.content = token.content.replace(looseTitle, (_, title) => `**${title.trim()}**`);
      }
    }
  });

  md.renderer.rules.ds_math = (tokens, i, _options, env) => {
    const { content, meta } = tokens[i];
    if (env.plain) return md.utils.escapeHtml(meta.raw);
    try {
      const output = katex.renderToString(content, {
        displayMode: meta.display, output: 'mathml', trust: false, maxExpand: 500, maxSize: 30,
      });
      return meta.display ? `<span class="math-block">${output}</span>` : output;
    } catch {
      return md.utils.escapeHtml(meta.raw);
    }
  };
  // Never load images referenced by model-generated Markdown.
  md.renderer.rules.image = (tokens, i) => md.utils.escapeHtml(tokens[i].content);
  md.renderer.rules.link_open = (tokens, i, options, _env, renderer) => {
    tokens[i].attrSet('target', '_blank');
    tokens[i].attrSet('rel', 'noopener noreferrer');
    return renderer.renderToken(tokens, i, options);
  };
  return md;
})();

function renderDsAnswer(target, text, plain = false) {
  const template = document.createElement('template');
  template.innerHTML = dsMarkdown.render(text, { plain });
  if (!plain) {
    target.replaceChildren(template.content);
    return;
  }
  const lines = [];
  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      lines.push(node.data);
      return;
    }
    if (node.nodeName === 'BR') lines.push('\n');
    else if (node.nodeName === 'HR') lines.push('\n\n');
    else {
      for (const child of node.childNodes) walk(child);
      if (/^(?:P|H[1-6]|LI|PRE|BLOCKQUOTE|TABLE|TR)$/.test(node.nodeName)) lines.push('\n');
      if (/^(?:TH|TD)$/.test(node.nodeName) && node.nextElementSibling) lines.push('\t');
    }
  }
  walk(template.content);
  target.textContent = lines.join('').replace(/\n{3,}/g, '\n\n').trim();
}
