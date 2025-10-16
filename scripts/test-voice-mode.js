const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadApi(filePath, mockFetchImpl) {
  const abs = path.resolve(filePath);
  let code = fs.readFileSync(abs, 'utf8');
  // Transform ESM default export to CJS for testing
  code = code.replace(/export default async function handler\(/, 'async function handler(');
  // ensure export
  code += '\nmodule.exports = handler;\n';

  const sandbox = {
    module: { exports: {} },
    exports: {},
    require,
    process,
    console,
    fetch: mockFetchImpl,
    setTimeout,
    clearTimeout,
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: abs });
  return sandbox.module.exports || sandbox.exports;
}

function makeResCapture() {
  const capture = { statusCode: 0, jsonBody: null };
  const res = {
    status(code) {
      capture.statusCode = code; 
      return this;
    },
    json(obj) {
      capture.jsonBody = obj; 
      return this;
    }
  };
  return { res, capture };
}

async function testEndpoint({file, payload, expectBodyIncludes}) {
  let capturedBodies = [];
  const mockFetch = async (url, options={}) => {
    if (options && options.body) capturedBodies.push(options.body);
    // minimal OpenAI-like response
    return {
      ok: true,
      async json(){
        // reply for chat
        if (String(file).includes('chat.js')) {
          return { choices: [{ message: { content: JSON.stringify({explanation: '', corrections: payload.corrected || payload.original, alternative: payload.corrected || payload.original, mistakes: []}) } }] };
        }
        // corrected for correct.js
        return { choices: [{ message: { content: (payload.text || '').trim() } }] };
      }
    };
  };

  const handler = loadApi(file, mockFetch);
  const { res, capture } = makeResCapture();
  await handler({ body: payload }, res);
  const ok = expectBodyIncludes.every(s => capturedBodies.some(b => (b||'').includes(s)));
  return { ok, capturedBodies, capture };
}

(async () => {
  const results = [];

  // Test chat.js in voice mode
  results.push(await testEndpoint({
    file: 'pages/api/chat.js',
    payload: { original: 'when he is with you what he\'s doing', corrected: 'when he is with you what he\'s doing please', language: 'en', mode: 'voice' },
    expectBodyIncludes: ['Additional constraints for VOICE MODE', 'preserve punctuation exactly']
  }));

  // Test chat.js in text mode
  results.push(await testEndpoint({
    file: 'pages/api/chat.js',
    payload: { original: 'hi', corrected: 'hello', language: 'en', mode: 'text' },
    expectBodyIncludes: ['Rules for evaluation'] // generic content
  }));

  // Test correct.js in voice mode
  results.push(await testEndpoint({
    file: 'pages/api/correct.js',
    payload: { text: 'hello how are you', language: 'en', mode: 'voice' },
    expectBodyIncludes: ['VOICE MODE: Do NOT add or change punctuation']
  }));

  // Test correct.js in text mode
  results.push(await testEndpoint({
    file: 'pages/api/correct.js',
    payload: { text: 'hello how are you', language: 'en', mode: 'text' },
    expectBodyIncludes: ['Ignore punctuation when judging correctness']
  }));

  const pass = results.every(r => r.ok);
  console.log('Voice-mode tests', pass ? 'PASSED' : 'FAILED');
  results.forEach((r, idx) => {
    console.log(`Case ${idx+1}: ${r.ok ? 'OK' : 'FAIL'}`);
    if (!r.ok) {
      console.log('Captured request bodies:');
      r.capturedBodies?.forEach((b, i) => console.log(`--- body ${i+1} ---\n${b}\n`));
    }
  });
  process.exit(pass ? 0 : 1);
})();
