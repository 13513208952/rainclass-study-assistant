globalThis.ds = Object.freeze({
  model: 'deepseek-flash',
  endpoint: 'https://api.deepseek.com/chat/completions',
  keyName: 'deepseekApiKey',
  access: {
    origins: ['<all_urls>'],
    data_collection: ['websiteContent', 'authenticationInfo'],
  },
  maxImages: 24,
  maxText: 30000,
  quickPrompt: '我该怎么写',
  unit(url) {
    const { origin, pathname } = new URL(url);
    if (origin === 'https://examination.xuetangx.com' && /^\/(?:exam|result)\/\d+\/?$/.test(pathname)) return 'exam';
    if (origin !== 'https://www.yuketang.cn') return null;
    const graph = pathname.match(/^\/ai-workspace\/lms-graph\/\d+\/(graph|forum|exercise|quiz|self-test)\/\d+\/?$/);
    if (graph) return graph[1];
    return /^\/v2\/web\/(?:exam|iframe-quiz|studentQuiz_web|quizResult)\/\d+\/\d+\/?$/.test(pathname)
      ? 'exam' : null;
  },
});
