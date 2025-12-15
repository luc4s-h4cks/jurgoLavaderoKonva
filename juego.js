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
// Función actualizar etapa
// ======================
function actualizarEtapa() {
  if (jabon) {
    jabon.draggable(etapa === 1);
    jabon.opacity(etapa === 1 ? 1 : 0.4);
  }
  if (pistolaAgua) {
    pistolaAgua.draggable(etapa === 2);
    pistolaAgua.opacity(etapa === 2 ? 1 : 0.4);
  }
  if (esponja) {
    esponja.draggable(etapa === 3);
    esponja.opacity(etapa === 3 ? 1 : 0.4);
  }

  layerObjetos.batchDraw();
  console.log("Etapa:", etapa);
}

// ======================
// Función para crear la espuma
// ======================
function crearEspumaZona(zona) {
  const cantidad = 4 + Math.floor(Math.random() * 5); // 4–8 burbujas

  for (let i = 0; i < cantidad; i++) {
    const burbuja = new Konva.Circle({
      x: zona.x() + Math.random() * zona.width(),
      y: zona.y() + Math.random() * zona.height(),
      radius: 6 + Math.random() * 10,
      fill: "white",
      opacity: 0.6 + Math.random() * 0.3,
    });

    zona.espumas.push(burbuja);
    layerZonas.add(burbuja);
  }
}

// ======================
// Función para crear las gotas de agua
// ======================
function crearGotasZona(zona) {
  const cantidad = 3 + Math.floor(Math.random() * 4); // 3–6 gotas

  for (let i = 0; i < cantidad; i++) {
    const gota = new Konva.Circle({
      x: zona.x() + Math.random() * zona.width(),
      y: zona.y() + Math.random() * zona.height(),
      radius: 4 + Math.random() * 6,
      fill: "#9dd9ff",
      opacity: 0.5,
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
// Área clicable completa
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
const imgCoche = new Image();
const imgJabon = new Image();
const imgPistola = new Image();
const imgEsponja = new Image();

imgCoche.src = "assets/coche.png";
imgJabon.src = "assets/jabon.png";
imgPistola.src = "assets/pistolaAgua.png";
imgEsponja.src = "assets/esponja.png";

// ======================
// Variables
// ======================
let coche;
let jabon;
let pistolaAgua;
let esponja;

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

  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      const zona = new Konva.Rect({
        x: coche.x() + c * w,
        y: coche.y() + f * h,
        width: w,
        height: h,
        opacity: 0,
      });

      zona.estado = 0; // 0 sucio | 1 enjabonado | 2 aclarado | 3 seco
      zona.espumas = [];
      zona.gotas = [];

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
  if (etapa === 1 && objeto === jabon) {
    zonas.forEach(z => {

      if (z.estado === 0 && colision(jabon, z)) {
        z.estado = 1;
        crearEspumaZona(z);
      }

    });

    layerZonas.batchDraw();

    if (zonas.every(z => z.estado === 1)) {
      etapa = 2;
      actualizarEtapa();
      console.log("🧼 Todo enjabonado");
    }
  }




  // ETAPA 2 – AGUA
  if (etapa === 2 && objeto === pistolaAgua) {
    zonas.forEach(z => {
      if (z.estado === 1 && colision(pistolaAgua, z)) {
        z.estado = 2;

        // Eliminar TODAS las burbujas de la zona
        z.espumas.forEach(burbuja => burbuja.destroy());
        z.espumas = [];

        crearGotasZona(z);
      }
    });

    layerZonas.batchDraw();

    // ¿Todo aclarado?
    if (zonas.every(z => z.estado === 2)) {
      etapa = 3;
      actualizarEtapa();
      console.log("🚿 Todo aclarado");
    }
  }

  // ETAPA 3 – SECAR
  if (etapa === 3 && objeto === esponja) {
    zonas.forEach(z => {
      if (z.estado === 2 && colision(esponja, z)) {
        z.estado = 3;

        z.gotas.forEach(g => g.destroy());
        z.gotas = [];
      }
    });

    layerZonas.batchDraw();

    if (zonas.every(z => z.estado === 3)) {
      console.log("✨ COCHE LIMPIO ✨");
    }
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
