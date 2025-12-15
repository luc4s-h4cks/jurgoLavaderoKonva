// ======================
// Crear stage
// ======================
var stage = new Konva.Stage({
  container: "container",
  width: 800,
  height: 800,
});

// ======================
// Etapas
// ======================
let etapa = 1;

function actualizarEtapa() {
  // Solo actualizar si los objetos existen
  if (jabon) {
    jabon.draggable(etapa === 1);
    jabon.opacity(etapa === 1 ? 1 : 0.5);
  }
  if (pistolaAgua) {
    pistolaAgua.draggable(etapa === 2);
    pistolaAgua.opacity(etapa === 2 ? 1 : 0.5);
  }
  if (esponja) {
    esponja.draggable(etapa === 3);
    esponja.opacity(etapa === 3 ? 1 : 0.5);
  }

  if (layerObjetos) {
    layerObjetos.batchDraw();
  }
  
  console.log("Etapa actual:", etapa);
}
/**

function avanzarEtapa() {
  if (etapa < 3) {
    etapa++;
    actualizarEtapa();
    console.log("¡Avanzando a etapa " + etapa + "!");
  } else {
    console.log("¡Lavado completado!");
  }
}
*/
// ======================
// Posiciones iniciales
// ======================
const posicionesIniciales = {
  esponja: { x: 100, y: 600 },
  pistola: { x: 350, y: 600 },
  jabon: { x: 600, y: 600 },
};

// ======================
// Layers
// ======================
var layerCoche = new Konva.Layer();
var layerObjetos = new Konva.Layer();

stage.add(layerCoche);
stage.add(layerObjetos);

// ======================
// Función volver a su sitio
// ======================
function volverPosicionIni(objeto, pos) {
  objeto.on("dragstart", () => {
    objeto.moveToTop();
    layerObjetos.batchDraw();
    stage.container().style.cursor = "grabbing";
  });

  objeto.on("dragend", () => {
    // Verificar si está sobre el coche
    const posCoche = {
      x: 50,
      y: 200,
      width: 700,
      height: 350
    };
    
    const posObjeto = objeto.position();
    
    // Verificar colisión con el coche
    if (
      posObjeto.x > posCoche.x &&
      posObjeto.x < posCoche.x + posCoche.width &&
      posObjeto.y > posCoche.y &&
      posObjeto.y < posCoche.y + posCoche.height
    ) {
      // ¡Está sobre el coche! Avanzar etapa
      avanzarEtapa();
    }
    
    // Volver a posición inicial
    objeto.to({
      x: pos.x,
      y: pos.y,
      duration: 0.3,
      easing: Konva.Easings.EaseInOut,
    });
    stage.container().style.cursor = "default";
  });

  objeto.on("mouseover", () => {
    // Solo cambiar cursor si el objeto es arrastrable
    if (objeto.draggable()) {
      stage.container().style.cursor = "grab";
    }
  });

  objeto.on("mouseout", () => {
    stage.container().style.cursor = "default";
  });
}

// ======================
// Función área clicable completa
// ======================
function hitRectCompleto(ctx, shape) {
  ctx.beginPath();
  ctx.rect(0, 0, shape.width(), shape.height());
  ctx.closePath();
  ctx.fillStrokeShape(shape);
}

// ======================
// Imágenes
// ======================
const imgEsponja = new Image();
const imgCoche = new Image();
const imgPistola = new Image();
const imgJabon = new Image();

imgCoche.src = "assets/coche.png";
imgEsponja.src = "assets/esponja.png";
imgPistola.src = "assets/pistolaAgua.png";
imgJabon.src = "assets/jabon.png";

// ======================
// Variables
// ======================
let coche;
let esponja;
let pistolaAgua;
let jabon;

// Contador para saber cuántas imágenes se han cargado
let imagenesListas = 0;
const totalImagenes = 4;

function verificarImagenesCargadas() {
  imagenesListas++;
  if (imagenesListas === totalImagenes) {
    // Todas las imágenes están listas, actualizar etapa inicial
    actualizarEtapa();
  }
}

// ======================
// Esponja
// ======================
imgEsponja.onload = () => {
  esponja = new Konva.Image({
    image: imgEsponja,
    x: posicionesIniciales.esponja.x,
    y: posicionesIniciales.esponja.y,
    width: 75,
    height: 75,
    draggable: false, // Se actualizará después
    hitFunc: hitRectCompleto,
  });

  volverPosicionIni(esponja, posicionesIniciales.esponja);
  layerObjetos.add(esponja);
  layerObjetos.draw();
  
  verificarImagenesCargadas();
};

// ======================
// Pistola de agua
// ======================
imgPistola.onload = () => {
  pistolaAgua = new Konva.Image({
    image: imgPistola,
    x: posicionesIniciales.pistola.x,
    y: posicionesIniciales.pistola.y,
    width: 100,
    height: 75,
    draggable: false, // Se actualizará después
    hitFunc: hitRectCompleto,
  });

  volverPosicionIni(pistolaAgua, posicionesIniciales.pistola);
  layerObjetos.add(pistolaAgua);
  layerObjetos.draw();
  
  verificarImagenesCargadas();
};

// ======================
// Jabón
// ======================
imgJabon.onload = () => {
  jabon = new Konva.Image({
    image: imgJabon,
    x: posicionesIniciales.jabon.x,
    y: posicionesIniciales.jabon.y,
    width: 70,
    height: 75,
    draggable: false, // Se actualizará después
    hitFunc: hitRectCompleto,
  });

  volverPosicionIni(jabon, posicionesIniciales.jabon);
  layerObjetos.add(jabon);
  layerObjetos.draw();
  
  verificarImagenesCargadas();
};

// ======================
// Coche
// ======================
imgCoche.onload = () => {
  coche = new Konva.Image({
    image: imgCoche,
    x: 50,
    y: 200,
    width: 700,
    height: 350,
    listening: false,
  });

  layerCoche.add(coche);
  coche.moveToBottom();
  layerCoche.draw();
  
  verificarImagenesCargadas();
};