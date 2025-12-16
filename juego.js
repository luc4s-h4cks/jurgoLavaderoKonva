let canvasMask;
let ctxMask;


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
// 1 = jabón | 2 = agua | 3 = secar
// ======================
let etapa = 1;

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
var layerZonas = new Konva.Layer();
var layerObjetos = new Konva.Layer();

stage.add(layerCoche);
stage.add(layerZonas);
stage.add(layerObjetos);

// ======================
// Imágenes
// ======================
const imgCoche = new Image();
const imgJabon = new Image();
const imgPistola = new Image();
const imgEsponja = new Image();
const imgMancha = new Image();
const imgBurbuja = new Image();
const imgAgua = new Image();

imgCoche.src = "assets/coche.png";
imgJabon.src = "assets/jabon.png";
imgPistola.src = "assets/pistolaAgua.png";
imgEsponja.src = "assets/esponja.png";
imgMancha.src = "assets/mancha.png";
imgBurbuja.src = "assets/burbuja.png";
imgAgua.src = "assets/gotasAgua.png";

// ======================
// Variables
// ======================
let coche;
let jabon;
let pistolaAgua;
let esponja;

// ======================
// Función actualizar etapa
// ======================
function actualizarEtapa() {
  if (jabon) jabon.opacity(1);
  if (pistolaAgua) pistolaAgua.opacity(1);
  if (esponja) esponja.opacity(1);

  layerObjetos.batchDraw();
}

// ======================
// Función para crear manchas
// ======================
function crearMancha(zona) {
  if (!imgMancha.complete) return;

  const size = 60;

  const mancha = new Konva.Image({
    image: imgMancha,
    x: zona.x() + (zona.width() - size) / 2,
    y: zona.y() + (zona.height() - size) / 2,
    width: size,
    height: size,
    opacity: 1,
    rotation: Math.random() * 360,
    listening: false,
  });

  zona.mancha = mancha;
  zona.estado = 1;
  zona.frotado = 0;
  zona.frotadoMax = 200;

  layerZonas.add(mancha);
  mancha.moveToTop();
  layerZonas.batchDraw();
}

function puntoSobreCoche(xStage, yStage) {
  if (!ctxMask) return false;

  // Convertir coordenadas del stage a coordenadas de imagen
  const xImg = Math.floor(
    ((xStage - coche.x()) / coche.width()) * imgCoche.width
  );
  const yImg = Math.floor(
    ((yStage - coche.y()) / coche.height()) * imgCoche.height
  );

  // Fuera de la imagen
  if (
    xImg < 0 ||
    yImg < 0 ||
    xImg >= imgCoche.width ||
    yImg >= imgCoche.height
  ) {
    return false;
  }

  const pixel = ctxMask.getImageData(xImg, yImg, 1, 1).data;

  return pixel[3] > 20; // alpha > 0
}


// ======================
// Función para crear la espuma
// ======================
function crearEspumaZona(zona) {
  if (!imgBurbuja.complete) return;

  const cantidad = 6 + Math.floor(Math.random() * 6);

  for (let i = 0; i < cantidad; i++) {
    const size = 30 + Math.random() * 35;

    const burbuja = new Konva.Image({
      image: imgBurbuja,
      x: zona.x() + Math.random() * (zona.width() - size),
      y: zona.y() + Math.random() * (zona.height() - size),
      width: size,
      height: size,
      opacity: 0.8,
      rotation: Math.random() * 360,
      listening: false,
    });

    zona.espumas.push(burbuja);
    layerZonas.add(burbuja);
  }
}

// ======================
// Función para crear las gotas de agua
// ======================
function crearGotasZona(zona) {
  if (!imgAgua.complete) return;

  const cantidad = 3 + Math.floor(Math.random() * 4); // 3–6 gotas

  for (let i = 0; i < cantidad; i++) {
    const size = 30 + Math.random() * 60;

    const gota = new Konva.Image({
      image: imgAgua,
      x: zona.x() + Math.random() * (zona.width() - size),
      y: zona.y() + Math.random() * (zona.height() - size),
      width: size,
      height: size,
      opacity: 0.8,
      listening: false,
    });

    zona.gotas.push(gota);
    layerZonas.add(gota);
  }
}

// ======================
// Función volver a su sitio
// ======================
function volverPosicionIni(objeto, pos) {
  objeto.on("dragstart", () => {
    objeto.moveToTop();
    stage.container().style.cursor = "grabbing";
  });

  objeto.on("dragmove", () => {
    procesarAccion(objeto);
  });

  objeto.on("dragend", () => {
    objeto.to({
      x: pos.x,
      y: pos.y,
      duration: 0.3,
      easing: Konva.Easings.EaseInOut,
    });
    stage.container().style.cursor = "default";
  });

  objeto.on("mouseover", () => {
    if (objeto.draggable()) {
      stage.container().style.cursor = "grab";
    }
  });

  objeto.on("mouseout", () => {
    stage.container().style.cursor = "default";
  });
}

// ======================
// Area clicable completa
// ======================
function hitRectCompleto(ctx, shape) {
  ctx.beginPath();
  ctx.rect(0, 0, shape.width(), shape.height());
  ctx.closePath();
  ctx.fillStrokeShape(shape);
}

// ======================
// Zonas del coche
// ======================
const zonas = [];

// ======================
// Crear coche
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

  canvasMask = document.createElement("canvas");
  canvasMask.width = imgCoche.width;
  canvasMask.height = imgCoche.height;

  ctxMask = canvasMask.getContext("2d");
  ctxMask.drawImage(imgCoche, 0, 0);


  layerCoche.add(coche);
  layerCoche.draw();

  crearZonasCoche();
};

// ======================
// Crear zonas invisibles
// ======================
function crearZonasCoche() {
  const filas = 4;
  const columnas = 6;

  const w = coche.width() / columnas;
  const h = coche.height() / filas;

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {

      const x = coche.x() + j * w;
      const y = coche.y() + i * w;

      const centroX = x + w / 2;
      const centroY = y + h / 2;

      if (!puntoSobreCoche(centroX, centroY)) continue;

      const zona = new Konva.Rect({
        x: coche.x() + j * w,
        y: coche.y() + i * h,
        width: w,
        height: h,
        opacity: 0,
      });

      zona.estado = 0;
      zona.mancha = null;
      zona.espumas = [];
      zona.gotas = [];
      zona.aguaTiempo = 0;
      zona.aguaNesesaria = 60;

      zonas.push(zona);
      layerZonas.add(zona);
    }
  }

  layerZonas.draw();
}

// ======================
// Colisión
// ======================
function colision(a, b) {
  const r1 = a.getClientRect();
  const r2 = b.getClientRect();

  return !(
    r1.x > r2.x + r2.width ||
    r1.x + r1.width < r2.x ||
    r1.y > r2.y + r2.height ||
    r1.y + r1.height < r2.y
  );
}

// ======================
// Procesar acción según etapa
// ======================
function procesarAccion(objeto) {
  // ETAPA 1 – JABÓN
  if (objeto === jabon) {
    zonas.forEach((z) => {
      if (z.estado === 1 && colision(jabon, z)) {
        z.frotado++;

        const progreso = z.frotado / z.frotadoMax;

        const nuevoSize = 60 * (1 - progreso * 0.6);
        z.mancha.width(nuevoSize);
        z.mancha.height(nuevoSize);

        z.mancha.x(z.x() + (z.width() - nuevoSize) / 2);
        z.mancha.y(z.y() + (z.height() - nuevoSize) / 2);

        z.mancha.opacity(1 - progreso);

        if (z.frotado >= z.frotadoMax) {
          z.mancha.destroy();
          z.mancha = null;
          z.estado = 2;
          crearEspumaZona(z);
        }
      }
    });

    layerZonas.batchDraw();
  }

  // ETAPA 2 – AGUA
  if (objeto === pistolaAgua) {

  }

  // ETAPA 3 – SECAR
  if (objeto === esponja) {
    zonas.forEach((z) => {
      if (z.estado === 3 && colision(esponja, z)) {

        z.secarFrotado++;

        const progreso = z.secarFrotado / z.secarFrotadoMax;

        z.gotas.forEach((g) => {
          g.opacity(0.8 * (1 - progreso));
          g.scale({
            x: 1 - progreso * 0.5,
            y: 1 - progreso * 0.5,
          })
        })

        if (z.secarFrotado >= z.secarFrotadoMax) {
          z.gotas.forEach((g) => g.destroy());
          z.gotas = [];
          z.estado = 0;
          z.secarFrotado = 0;
        }

      }
    });

    layerZonas.batchDraw();
  }
}

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
    draggable: true,
    hitFunc: hitRectCompleto,
  });

  volverPosicionIni(jabon, posicionesIniciales.jabon);
  layerObjetos.add(jabon);
  actualizarEtapa();
  layerObjetos.draw();
};

// ======================
// Pistola
// ======================
imgPistola.onload = () => {
  pistolaAgua = new Konva.Image({
    image: imgPistola,
    x: posicionesIniciales.pistola.x,
    y: posicionesIniciales.pistola.y,
    width: 100,
    height: 75,
    draggable: true,
    hitFunc: hitRectCompleto,
  });

  volverPosicionIni(pistolaAgua, posicionesIniciales.pistola);
  layerObjetos.add(pistolaAgua);
  actualizarEtapa();
  layerObjetos.draw();
};

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
    draggable: true,
    hitFunc: hitRectCompleto,
  });

  volverPosicionIni(esponja, posicionesIniciales.esponja);
  layerObjetos.add(esponja);
  actualizarEtapa();
  layerObjetos.draw();
};

// ======================
// Creacion de las manchas al pasar el tiempo
// ======================
setInterval(() => {
  const zonasLimpias = zonas.filter((z) => z.estado === 0);

  if (zonasLimpias.length === 0) return;

  const zonaRandom =
    zonasLimpias[Math.floor(Math.random() * zonasLimpias.length)];

  crearMancha(zonaRandom);
}, 3000);

setInterval(() => {
  if (!pistolaAgua) return;

  zonas.forEach((z) => {
    if (z.estado === 2) {
      if (colision(pistolaAgua, z)) {
        z.aguaTiempo++;
      } else {
        z.aguaTiempo = 0;
      }
    }

    const progreso = z.aguaTiempo / z.aguaNesesaria;
    z.espumas.forEach((b) => b.opacity(0.8 * (1 - progreso)));

    if (!z.progresoBar) {
      z.progresoBar = new Konva.Rect({
        x: z.x(),
        y: z.y() - 5,
        width: z.width() * progreso,
        height: 4,
        fill: "blue",
        listening: false,
      });
      layerZonas.add(z.progresoBar);
    } else {
      z.progresoBar.width(z.width() * progreso);
    }

    if (progreso >= 1) {
      z.espumas.forEach((b) => b.destroy());
      z.espumas = [];
      if (z.progresoBar) z.progresoBar.destroy();
      z.progresoBar = null;
      z.estado = 3;
      z.aguaTiempo = 0;

      z.secarFrotado = 0;
      z.secarFrotadoMax = 150;

      crearGotasZona(z);
    }
  });

  layerZonas.batchDraw();
}, 30);
