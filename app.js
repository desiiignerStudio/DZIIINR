const canvas = new fabric.Canvas('design-canvas');
let designs = { front: null, back: null };
let currentSide = 'front';

// Splash Screen Logic
window.onload = () => {
  setTimeout(() => document.getElementById('splash-screen').classList.add('fade-out'), 2000);
};

// Pricing Engine
function calculateFinalPrice() {
  let total = 450;
  let desc = ['Base: R450'];

  const objCount = canvas.getObjects().length;
  if (objCount > 1) {
    total += (objCount - 1) * 50;
    desc.push(`Extra Layers: +R${(objCount - 1) * 50}`);
  }

  if (document.getElementById('ai-upscale-toggle').checked) {
    total += 75;
    desc.push('AI Upscale: +R75');
  }

  document.getElementById('display-price').innerText = `R ${total}.00`;
  document.getElementById('price-breakdown').innerText = desc.join(' | ');
}

// Layer Management
function addText() {
  canvas.add(new fabric.IText('DZIIINR', { left: 50, top: 50, fill: '#fff', fontFamily: 'Impact' }));
  updateUI();
}

function deleteObject() {
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    canvas.remove(activeObject);
  }
}

function removeBg() {
  // Placeholder utility; actual background removal requires image-processing integration.
  alert('Background removal is available for uploaded images in the production build.');
}

function switchView(side) {
  if (side === currentSide) return;

  designs[currentSide] = canvas.toJSON();
  currentSide = side;

  canvas.clear();
  if (designs[side]) {
    canvas.loadFromJSON(designs[side], () => {
      canvas.renderAll();
      updateUI();
    });
  } else {
    updateUI();
  }

  document.getElementById('front-btn').classList.toggle('active', side === 'front');
  document.getElementById('back-btn').classList.toggle('active', side === 'back');
}

function openMockup() {
  alert('3D mockup preview coming soon.');
}

function updateUI() {
  document.getElementById('edit-tools').style.visibility = canvas.getObjects().length > 0 ? 'visible' : 'hidden';
  calculateFinalPrice();
}

// WhatsApp Export
function sendWhatsAppOrder() {
  const price = document.getElementById('display-price').innerText;
  const msg = `*NEW DZIIINR ORDER*%0APrice: ${price}%0AView my design here: [Selfie/Screenshot attached]`;
  window.open(`https://wa.me/27847558786?text=${msg}`);
}

canvas.on('object:added', updateUI);
canvas.on('object:removed', updateUI);

updateUI();
