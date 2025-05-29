export async function translate(str: string, targetLang = 'ZH') {
  return await fetch('https://api.deeplx.com/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: str,
      source_lang: 'auto',
      target_lang: targetLang,
    }),
  })
}
