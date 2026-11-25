const form = document.querySelector('form');
const keyInput = document.querySelector('#api-key');
const save = document.querySelector('#save');
const clear = document.querySelector('#clear');
const status = document.querySelector('#status');

function lock(busy) {
  save.disabled = busy;
  clear.disabled = busy;
}

async function restore() {
  const stored = (await browser.storage.local.get(ds.keyName))[ds.keyName];
  keyInput.value = stored ?? '';
  if (stored) status.textContent = await browser.permissions.contains(ds.access)
    ? '问答已启用。' : '密钥已保存，但截图权限未启用。';
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const key = keyInput.value.trim();
  if (!key) {
    status.textContent = '请输入 DeepSeek API 密钥。';
    return;
  }
  lock(true);
  try {
    const permitted = await browser.permissions.request(ds.access);
    if (!permitted) {
      status.textContent = '未授权截图与数据传输，问答未启用。';
      return;
    }
    await browser.storage.local.set({ [ds.keyName]: key });
    keyInput.value = key;
    status.textContent = '已保存并启用问答。';
  } catch (error) {
    status.textContent = `保存失败：${error.message}`;
  } finally {
    lock(false);
  }
});

clear.addEventListener('click', async () => {
  lock(true);
  try {
    await browser.storage.local.remove(ds.keyName);
    keyInput.value = '';
    await browser.permissions.remove(ds.access);
    status.textContent = '已删除密钥并停用问答。';
  } catch (error) {
    status.textContent = `停用失败：${error.message}`;
  } finally {
    lock(false);
  }
});

restore().catch(error => { status.textContent = `读取设置失败：${error.message}`; });
