/* eslint-disable @typescript-eslint/no-require-imports */
#!/usr/bin/env node
// Test the NEW merge logic with real images
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function testNew() {
  const zai = await ZAI.create();
  
  const img1B64 = fs.readFileSync('/tmp/test_face1.jpg').toString('base64');
  const img1Url = `data:image/jpeg;base64,${img1B64}`;
  const img2B64 = fs.readFileSync('/tmp/test_scene2.jpg').toString('base64');
  const img2Url = `data:image/jpeg;base64,${img2B64}`;
  
  // NEW prompt strategy (from new buildPrompt function)
  const userPrompt = "Place la personne de l'image 1 dans le décor forestier de l'image 2 au coucher du soleil";
  const qualityDirective = "Photorealistic result, single coherent photograph, natural lighting, realistic shadows, depth of field, no visible seams or artifacts, high detail, 4k quality.";
  const newPrompt = `${userPrompt}. Preserve the identity of faces, the exact text of any labels or logos, and the proportions of the subjects. ${qualityDirective}`;
  
  console.log('=== Test NEW logic: multi-image, focused prompt ===');
  console.log('Prompt length:', newPrompt.length, 'chars');
  console.log('Images: 2');
  
  const start = Date.now();
  const r = await zai.images.generations.edit({
    prompt: newPrompt,
    images: [{ url: img1Url }, { url: img2Url }],
    size: '1024x1024',
  });
  console.log('Duration:', Date.now() - start, 'ms');
  
  if (r?.data?.[0]?.base64) {
    fs.writeFileSync('/tmp/test_new_2img.png', Buffer.from(r.data[0].base64, 'base64'));
    console.log('✓ Saved to /tmp/test_new_2img.png');
  } else {
    console.log('✗ No image returned');
  }
  
  // Test with PNG input (better preservation)
  console.log('\n=== Test NEW logic: PNG input ===');
  const { execSync } = require('child_process');
  execSync('python3 -c "from PIL import Image; Image.open(\'/tmp/test_face1.jpg\').save(\'/tmp/test_face1.png\'); Image.open(\'/tmp/test_scene2.jpg\').save(\'/tmp/test_scene2.png\')"');
  const img1Png = `data:image/png;base64,${fs.readFileSync('/tmp/test_face1.png').toString('base64')}`;
  const img2Png = `data:image/png;base64,${fs.readFileSync('/tmp/test_scene2.png').toString('base64')}`;
  
  const start2 = Date.now();
  const r2 = await zai.images.generations.edit({
    prompt: newPrompt,
    images: [{ url: img1Png }, { url: img2Png }],
    size: '1024x1024',
  });
  console.log('Duration:', Date.now() - start2, 'ms');
  
  if (r2?.data?.[0]?.base64) {
    fs.writeFileSync('/tmp/test_new_png.png', Buffer.from(r2.data[0].base64, 'base64'));
    console.log('✓ Saved to /tmp/test_new_png.png');
  }
}

testNew().catch(e => { console.error('Fatal:', e); process.exit(1); });
