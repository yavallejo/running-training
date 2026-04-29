const fs = require('fs');
const { createCanvas } = require('canvas');

// Create 192x192 icon
const canvas192 = createCanvas(192, 192);
const ctx192 = canvas192.getContext('2d');

// Gradient
const grad192 = ctx192.createLinearGradient(0, 192, 0, 0);
grad192.addColorStop(0, '#f43f5e');
grad192.addColorStop(0.5, '#fb923c');
grad192.addColorStop(1, '#fbbf24');

// Flame shape
ctx192.fillStyle = grad192;
ctx192.beginPath();
ctx192.moveTo(96, 38);
ctx192.bezierCurveTo(96, 38, 48, 96, 48, 144);
ctx192.arc(96, 144, 48, Math.PI, 0, true);
ctx192.bezierCurveTo(144, 144, 144, 96, 96, 38);
ctx192.fill();

// Inner flame
ctx192.fillStyle = 'rgba(254, 205, 211, 0.7)';
ctx192.beginPath();
ctx192.moveTo(96, 76);
ctx192.bezierCurveTo(96, 76, 72, 110, 72, 126);
ctx192.arc(96, 126, 24, Math.PI, 0, true);
ctx192.bezierCurveTo(120, 126, 120, 110, 96, 76);
ctx192.fill();

// Sparkle
ctx192.fillStyle = '#fbbf24';
ctx192.beginPath();
ctx192.arc(96, 57, 9, 0, Math.PI * 2);
ctx192.fill();

const buffer192 = canvas192.toBuffer('image/png');
fs.writeFileSync('icon-192x192.png', buffer192);

// Create 512x512 icon
const canvas512 = createCanvas(512, 512);
const ctx512 = canvas512.getContext('2d');

const grad512 = ctx512.createLinearGradient(0, 512, 0, 0);
grad512.addColorStop(0, '#f43f5e');
grad512.addColorStop(0.5, '#fb923c');
grad512.addColorStop(1, '#fbbf24');

ctx512.fillStyle = grad512;
ctx512.beginPath();
ctx512.moveTo(256, 102);
ctx512.bezierCurveTo(256, 102, 128, 256, 128, 384);
ctx512.arc(256, 384, 128, Math.PI, 0, true);
ctx512.bezierCurveTo(384, 384, 384, 256, 256, 102);
ctx512.fill();

ctx512.fillStyle = 'rgba(254, 205, 211, 0.7)';
ctx512.beginPath();
ctx512.moveTo(256, 204);
ctx512.bezierCurveTo(256, 204, 192, 294, 192, 336);
ctx512.arc(256, 336, 64, Math.PI, 0, true);
ctx512.bezierCurveTo(320, 336, 320, 294, 256, 204);
ctx512.fill();

ctx512.fillStyle = '#fbbf24';
ctx512.beginPath();
ctx512.arc(256, 153, 24, 0, Math.PI * 2);
ctx512.fill();

const buffer512 = canvas512.toBuffer('image/png');
fs.writeFileSync('icon-512x512.png', buffer512);

console.log('Icons generated successfully!');
