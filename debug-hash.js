// Para probar en la consola del navegador (F12)
async function testHash() {
  const encoder = new TextEncoder()
  const data = encoder.encode("running2026")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  console.log('Hash computed:', hash)
  console.log('Hash expected:', 'c6269c975d9b548d36ad19673a4cc86086a081fa8de06162e5a1a5c7bb3e2400')
  console.log('Match:', hash === 'c6269c975d9b548d36ad19673a4cc86086a081fa8de06162e5a1a5c7bb3e2400')
}

testHash()
