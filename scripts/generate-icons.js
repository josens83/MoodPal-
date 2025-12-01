/**
 * PWA 아이콘 생성 스크립트
 *
 * 실행 방법:
 * 1. npm install sharp (아직 설치되지 않은 경우)
 * 2. node scripts/generate-icons.js
 *
 * 참고: 실제 배포 전 디자이너가 만든 icon.svg를 public/icons/icon.svg에 교체하세요.
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ICONS_DIR = path.join(__dirname, '../public/icons');
const SVG_PATH = path.join(ICONS_DIR, 'icon.svg');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  // 디렉토리 확인
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // SVG 파일 확인
  if (!fs.existsSync(SVG_PATH)) {
    console.error('icon.svg not found at', SVG_PATH);
    process.exit(1);
  }

  console.log('Generating PWA icons...');

  for (const size of sizes) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}.png`);

    try {
      await sharp(SVG_PATH)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`  ✓ icon-${size}.png`);
    } catch (error) {
      console.error(`  ✗ icon-${size}.png:`, error.message);
    }
  }

  // Apple Touch Icon
  try {
    await sharp(SVG_PATH)
      .resize(180, 180)
      .png()
      .toFile(path.join(ICONS_DIR, 'apple-touch-icon.png'));
    console.log('  ✓ apple-touch-icon.png');
  } catch (error) {
    console.error('  ✗ apple-touch-icon.png:', error.message);
  }

  // Favicon
  try {
    await sharp(SVG_PATH)
      .resize(32, 32)
      .png()
      .toFile(path.join(ICONS_DIR, 'favicon-32x32.png'));
    console.log('  ✓ favicon-32x32.png');

    await sharp(SVG_PATH)
      .resize(16, 16)
      .png()
      .toFile(path.join(ICONS_DIR, 'favicon-16x16.png'));
    console.log('  ✓ favicon-16x16.png');
  } catch (error) {
    console.error('  ✗ favicon:', error.message);
  }

  // Shortcut icons
  const shortcuts = ['shortcut-mood', 'shortcut-chat', 'shortcut-meditation'];
  for (const shortcut of shortcuts) {
    try {
      await sharp(SVG_PATH)
        .resize(96, 96)
        .png()
        .toFile(path.join(ICONS_DIR, `${shortcut}.png`));
      console.log(`  ✓ ${shortcut}.png`);
    } catch (error) {
      console.error(`  ✗ ${shortcut}.png:`, error.message);
    }
  }

  // Badge icon (for notifications)
  try {
    await sharp(SVG_PATH)
      .resize(72, 72)
      .png()
      .toFile(path.join(ICONS_DIR, 'badge-72.png'));
    console.log('  ✓ badge-72.png');
  } catch (error) {
    console.error('  ✗ badge-72.png:', error.message);
  }

  console.log('\nDone! Icons generated in', ICONS_DIR);
}

generateIcons();
