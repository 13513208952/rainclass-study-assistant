const dsNavigation = (() => {
  const directory = '.learning-space-student-chapter-nav .nav-list';
  const collapsed = '.nav-item-title:not(.is-expand):has(.expand-icon)';
  const answerCard = '.problems-aside .aside-body .subject-item';
  const eligible = /^(图文|讨论|作业|article|discussion|homework|assignment)$/i;

  function supports(kind, url) {
    return ['graph', 'forum', 'exercise'].includes(kind) && new URL(url).pathname.startsWith('/ai-workspace/lms-graph/');
  }

  function waitFor(read, timeout = 5000) {
    const found = read();
    if (found) return Promise.resolve(found);
    return new Promise(resolve => {
      const observer = new MutationObserver(() => {
        const value = read();
        if (value) finish(value);
      });
      const timer = setTimeout(() => finish(null), timeout);
      function finish(value) {
        observer.disconnect();
        clearTimeout(timer);
        resolve(value);
      }
      observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    });
  }

  function homeworkRows() {
    return [...document.querySelectorAll(answerCard)].filter(row => row.getClientRects().length)
      .sort((a, b) => number(a) - number(b));
  }

  function number(row) {
    return Number(row.dataset.order || row.textContent.trim().match(/^\d+/)?.[0]);
  }

  async function moveInHomework(rows, opening) {
    const remaining = rows.filter(row => !row.classList.contains('primary'));
    if (!remaining.length) return 'done';
    const active = rows.find(row => row.classList.contains('active'));
    const target = opening ? remaining[0] : remaining.find(row => !active || number(row) > number(active)) ??
      remaining.find(row => row !== active);
    if (!target) return 'current';
    if (target === active) return 'moved';
    const index = number(target);
    target.click();
    return await waitFor(() => homeworkRows().some(row => row.classList.contains('active') && number(row) === index))
      ? 'moved' : 'unknown';
  }

  async function next(kind) {
    const here = location.href;
    if (kind === 'exercise') {
      const rows = homeworkRows();
      if (rows.length) {
        const result = await moveInHomework(rows, false);
        if (result === 'moved') return '';
        if (result === 'current') return '当前题是这份作业最后一道未完成的题。';
        if (result === 'unknown') return '无法确认已切换作业题，请检查答题卡。';
      }
      if (!rows.length && !document.querySelector(`${directory} .leaf-item.is-active .icon-yuanquangou-mianzhuang`)) {
        return '未找到答题卡，请先打开作业题目，再点「下一题」。';
      }
    }

    const nav = document.querySelector(directory);
    if (!nav?.querySelector('.leaf-item.is-active')) return '未找到当前目录项。';
    const expanded = new Set();
    while (location.href === here && nav.isConnected) {
      let after = false;
      let target;
      for (const entry of nav.querySelectorAll(`.leaf-item, ${collapsed}`)) {
        if (entry.matches('.leaf-item.is-active')) {
          after = true;
        } else if (after && (entry.matches(collapsed) ||
          (eligible.test(entry.querySelector('.leaf-item-tag')?.textContent.trim()) &&
           entry.querySelector('.leaf-item-status') &&
           !entry.querySelector('.leaf-item-status :is(.icon-suoding, .icon-yuanquangou-mianzhuang)')))) {
          target = entry;
          break;
        }
      }
      if (!target) return '目录后面没有未完成的图文、讨论或作业。';
      if (target.matches(collapsed)) {
        if (expanded.has(target)) return '无法展开后续目录，请手动展开后重试。';
        expanded.add(target);
        target.click();
        if (!await waitFor(() => !target.isConnected || !target.matches(collapsed) || location.href !== here)) {
          return '无法展开后续目录，请手动展开后重试。';
        }
        continue;
      }
      target.click();
      const opened = await waitFor(() => location.href !== here && target.classList.contains('is-active'));
      if (!opened) return '无法确认已打开下一个栏目。';
      const openedUrl = location.href;
      if (ds.unit(openedUrl) === 'exercise') {
        const rows = await waitFor(() => {
          if (location.href !== openedUrl) return [];
          const visible = homeworkRows();
          return visible.length ? visible : null;
        });
        if (location.href !== openedUrl) return '';
        if (!rows) return '已打开下一份作业；答题卡未显示，请先打开作业题目。';
        if (await moveInHomework(rows, true) === 'unknown') return '已打开下一份作业，但无法确认第一道未完成题。';
      }
      return '';
    }
    return '';
  }

  return { supports, next };
})();
