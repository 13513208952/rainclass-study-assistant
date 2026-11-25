function appendDsMath(target, text) {
  // Match code spans first so formulas shown as examples remain literal.
  const tokens = /```[\s\S]*?(?:```|$)|`[^`\n]*`|\\\$|\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\((.+?)\\\)|(?<!\$)\$(?![\s$])((?:\\.|[^$\\\n])+?)(?<!\s)\$(?![\d$])/g;
  let end = 0;
  for (const match of text.matchAll(tokens)) {
    target.append(text.slice(end, match.index));
    const [literal, dollars, brackets, parentheses, inline] = match;
    const formula = dollars ?? brackets ?? parentheses ?? inline;
    if (formula === undefined) {
      target.append(literal);
    } else {
      const displayMode = dollars !== undefined || brackets !== undefined;
      const node = document.createElement('span');
      if (displayMode) node.className = 'math-block';
      try {
        katex.render(formula, node, { displayMode, output: 'mathml', trust: false, maxExpand: 500, maxSize: 30 });
        target.append(node);
      } catch {
        target.append(literal);
      }
    }
    end = match.index + literal.length;
  }
  target.append(text.slice(end));
}
