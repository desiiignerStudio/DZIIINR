const PRICES = {
  BASE: 450,
  EXTRA_LAYER: 40,
  DOUBLE_SIDED: 80,
  AI_UPSCALE: 75,
};

const WHATSAPP_NUMBER = '27847558786';
const designs = { front: null, back: null };
let currentSide = 'front';
let cart = [];

const canvas = new fabric.Canvas('design-canvas', {
  preserveObjectStacking: true,
  selection: true,
});

const ui = {
  splash: document.getElementById('splash-screen'),
  price: document.getElementById('display-price'),
  breakdown: document.getElementById('price-breakdown'),
  colorPicker: document.getElementById('hoodie-color'),
  uploadInput: document.getElementById('upload-design'),
  aiToggle: document.getElementById('ai-upscale-toggle'),
  cartItems: document.getElementById('cart-items'),
  modal: document.getElementById('mockup-modal'),
  frontOverlay: document.getElementById('front-overlay'),
  backOverlay: document.getElementById('back-overlay'),
};

window.addEventListener('load', () => setTimeout(() => ui.splash.classList.add('fade-out'), 1700));

function saveCurrentSide() {
  designs[currentSide] = canvas.toJSON(['id']);
}

function loadSide(side) {
  canvas.clear();
  if (designs[side]) {
    canvas.loadFromJSON(designs[side], () => canvas.renderAll());
  }
}

function getSideLayerCount(side) {
  if (side === currentSide) return canvas.getObjects().length;
  const data = designs[side];
  return data?.objects?.length || 0;
}

function calculateFinalPrice() {
  const frontCount = getSideLayerCount('front');
  const backCount = getSideLayerCount('back');
  const totalLayers = frontCount + backCount;
  let total = PRICES.BASE;
  const lines = ['Base hoodie: R450'];

  if (totalLayers > 1) {
    const layerCost = (totalLayers - 1) * PRICES.EXTRA_LAYER;
    total += layerCost;
    lines.push(`Extra layers (${totalLayers - 1}): +R${layerCost}`);
  }

  if (frontCount > 0 && backCount > 0) {
    total += PRICES.DOUBLE_SIDED;
    lines.push(`Front + back print: +R${PRICES.DOUBLE_SIDED}`);
  }

  if (ui.aiToggle.checked) {
    total += PRICES.AI_UPSCALE;
    lines.push(`AI clarity boost: +R${PRICES.AI_UPSCALE}`);
  }

  ui.price.textContent = `R ${total}.00`;
  ui.breakdown.textContent = lines.join(' | ');
  return total;
}

function updateHoodieColor() {
  document.documentElement.style.setProperty('--hoodie-color', ui.colorPicker.value);
}

function switchSide(side) {
  if (side === currentSide) return;
  saveCurrentSide();
  currentSide = side;
  loadSide(side);
  document.querySelectorAll('.toggle-btn').forEach((b) => b.classList.toggle('active', b.dataset.side === side));
  calculateFinalPrice();
}

function addTextLayer() {
  const text = new fabric.IText('Your Text', {
    left: 90,
    top: 140,
    fill: '#ffffff',
    fontFamily: 'Arial Black',
    fontSize: 30,
  });
  canvas.add(text);
  canvas.setActiveObject(text);
}

function removeWhiteBg() {
  const activeObj = canvas.getActiveObject();
  if (!activeObj || activeObj.type !== 'image') return;
  activeObj.filters ||= [];
  activeObj.filters.push(new fabric.Image.filters.RemoveColor({ color: '#FFFFFF', distance: 0.15 }));
  activeObj.applyFilters();
  canvas.renderAll();
}

function deleteSelectedLayer() {
  const activeObj = canvas.getActiveObject();
  if (activeObj) canvas.remove(activeObj);
}

function addToCart() {
  saveCurrentSide();
  const total = calculateFinalPrice();
  const item = `Hoodie (${currentSide} edited) - R ${total}.00`;
  cart.push(item);
  ui.cartItems.innerHTML = cart.map((v) => `<li>${v}</li>`).join('');
}

function buildWhatsAppMessage() {
  saveCurrentSide();
  const total = calculateFinalPrice();
  const frontCount = getSideLayerCount('front');
  const backCount = getSideLayerCount('back');
  const ai = ui.aiToggle.checked ? 'Yes' : 'No';
  const color = ui.colorPicker.options[ui.colorPicker.selectedIndex].text;

  return encodeURIComponent(
    `*DZIIINR CLOTHING ORDER*\n` +
    `Product: Custom Hoodie\n` +
    `Color: ${color}\n` +
    `Front layers: ${frontCount}\n` +
    `Back layers: ${backCount}\n` +
    `AI clarity: ${ai}\n` +
    `Total quote: R ${total}.00\n\n` +
    `Hi, I'd like to place this order and discuss delivery/payment in South Africa.`
  );
}

function buyNow() {
  const msg = buildWhatsAppMessage();
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
}

function openMockup() {
  saveCurrentSide();
  const currentSnapshot = JSON.parse(JSON.stringify(designs[currentSide] || { objects: [] }));

  const renderSide = (side, targetImg, done) => {
    canvas.clear();
    if (!designs[side]) {
      targetImg.src = '';
      done();
      return;
    }
    canvas.loadFromJSON(designs[side], () => {
      canvas.renderAll();
      targetImg.src = canvas.toDataURL({ format: 'png', quality: 1 });
      done();
    });
  };

  renderSide('front', ui.frontOverlay, () => {
    renderSide('back', ui.backOverlay, () => {
      canvas.clear();
      if (currentSnapshot.objects?.length) {
        canvas.loadFromJSON(currentSnapshot, () => canvas.renderAll());
      }
      ui.modal.showModal();
    });
  });
}

ui.uploadInput.addEventListener('change', (e) => {
  const [file] = e.target.files;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ({ target }) => {
    fabric.Image.fromURL(target.result, (img) => {
      img.set({ left: 90, top: 80, cornerColor: '#88ff00' });
      img.scaleToWidth(140);
      canvas.add(img);
      canvas.setActiveObject(img);
    });
  };
  reader.readAsDataURL(file);
  e.target.value = '';
});

canvas.on('object:added', calculateFinalPrice);
canvas.on('object:removed', calculateFinalPrice);
canvas.on('object:modified', calculateFinalPrice);

document.getElementById('front-btn').addEventListener('click', () => switchSide('front'));
document.getElementById('back-btn').addEventListener('click', () => switchSide('back'));
document.getElementById('add-text-btn').addEventListener('click', addTextLayer);
document.getElementById('remove-bg-btn').addEventListener('click', removeWhiteBg);
document.getElementById('delete-layer-btn').addEventListener('click', deleteSelectedLayer);
document.getElementById('add-to-cart-btn').addEventListener('click', addToCart);
document.getElementById('buy-now-btn').addEventListener('click', buyNow);
document.getElementById('view-mockup-btn').addEventListener('click', openMockup);
document.getElementById('close-mockup-btn').addEventListener('click', () => ui.modal.close());
ui.aiToggle.addEventListener('change', calculateFinalPrice);
ui.colorPicker.addEventListener('change', updateHoodieColor);

updateHoodieColor();
calculateFinalPrice();
