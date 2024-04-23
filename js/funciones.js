// Calculo de tiempo
const inicioAno = new Date(2024,0,1);
const finAno = new Date(2024,11,31);
const caidaPresupuesto2023 = 0.703;
const duracionAno = finAno - inicioAno
const alcanceDelPresupuesto = duracionAno * (1-caidaPresupuesto2023)
const alcanceDelPresupuestoCon70 = alcanceDelPresupuesto * 1.7
const alcanceDelPresupuestoCon140 = alcanceDelPresupuesto * 2.4
const fechaLimite = new Date(inicioAno.getTime() + alcanceDelPresupuesto);
const fechaLimiteCon70 = new Date(inicioAno.getTime() + alcanceDelPresupuestoCon70);
const fechaLimiteCon140 = new Date(inicioAno.getTime() + alcanceDelPresupuestoCon140);

let fechaLimiteUtilizada = fechaLimite
let duracionPresupuesto = fechaLimiteUtilizada - inicioAno;
let progreso = 0;

let fechaActual;
let quedanDias;
let quedanHoras;
let quedanMinutos;
let quedanSegundos;
let quedanMilisegundos;


// Dibujo de cuadrados
const tamanoPixel = 3;
let pixelesPorAncho = 0;
let pixelesPorAlto = 0;
let totalPixeles = 0;
let pixelesMuertosCantidad = 0;
let pixelesPorDraw = 300;

let progresoPixeles = 0;
let cantidadInicial = 0;

// Elementos del DOM
const barra = document.querySelector('.progreso__barra');
const checkCon70 = document.querySelector('#con-aumento-70');
const checkCon140 = document.querySelector('#con-aumento-140');
const fotos = document.querySelectorAll('.fondos img');
let fotoActual = 0;
let segundoAnterior = -1;

checkCon70.checked = checkCon70.checked || window.location.hash === '#70'
checkCon140.checked = checkCon140.checked || window.location.hash === '#140'

// Inicialización
checkCon70.addEventListener('change', function() {
  if(!checkCon70.checked) {
    checkCon140.checked = false
  }
  actualizarUrl();
  iniciarModo();
})

checkCon140.addEventListener('change', function() {
  if(checkCon140.checked) {
    checkCon70.checked = true
  }
  actualizarUrl();
  iniciarModo();
})

function actualizarUrl() {
  if(checkCon140.checked) {
    history.replaceState(null, null, '#140');
  } else if(checkCon70.checked) {
    history.replaceState(null, null, '#70');
  } else {
    history.replaceState(null, null, ' ');
  }
}

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent("anim");
  ellipseMode(CORNER)
  iniciarModo();
}

function draw() {
  actualizarContador();
  progreso = (quedanMilisegundos / duracionPresupuesto);
  actualizarBarra();

  const pixelesSinPresupuesto = floor((totalPixeles/2) * (1-progreso));
  const diferenciaInicial = abs(cantidadInicial - pixelesSinPresupuesto);
  const diferenciaActual = abs(pixelesMuertosCantidad - pixelesSinPresupuesto);
  const velocidadPixeles = diferenciaInicial ? diferenciaActual / diferenciaInicial : 1;

  for(let i = 0; i < max(pixelesPorDraw * velocidadPixeles, 1); i++) {
    if(pixelesMuertosCantidad < pixelesSinPresupuesto) {
      dibujarPixelMuerto();
    } else if(pixelesMuertosCantidad > pixelesSinPresupuesto) {
      revertirPixelMuerto();
    }
  }

  if(segundoAnterior !== floor(quedanSegundos)) {
    fotoActual++;
    if(fotoActual >= fotos.length) {
      fotoActual = 0;
    }
    actualizarFotoDeFondo()
    segundoAnterior = floor(quedanSegundos);
  }

  progresoPixeles = pixelesMuertosCantidad / (totalPixeles/2)
}

function iniciarModo() {
  if(checkCon140.checked) {
    fechaLimiteUtilizada = fechaLimiteCon140
  } else if(checkCon70.checked) {
    fechaLimiteUtilizada = fechaLimiteCon70
  } else {
    fechaLimiteUtilizada = fechaLimite
  }

  duracionPresupuesto = fechaLimiteUtilizada - inicioAno;
  resetearPixelesMuertos();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pixelesMuertosCantidad = 0;
  resetearPixelesMuertos();
}

function resetearPixelesMuertos() {
  pixelesPorAncho = ceil(width / tamanoPixel)
  pixelesPorAlto = ceil(height / tamanoPixel)
  totalPixeles = pixelesPorAncho * pixelesPorAlto;

  cantidadInicial = pixelesMuertosCantidad

  pixelesPorDraw = pixelesPorAncho
  // pixelesMuertosCantidad = 0;
}

function actualizarFotoDeFondo() {
  document.querySelector('.actual')?.classList.remove('actual')
  fotos[fotoActual].classList.add('actual')
}

function actualizarContador() {
  fechaActual = new Date();

  quedanMilisegundos = max(0, fechaLimiteUtilizada - fechaActual);
  quedanSegundos = max(0, quedanMilisegundos / 1000);
  quedanMinutos = max(0, quedanSegundos / 60);
  quedanHoras = max(0, quedanMinutos / 60);
  quedanDias = max(0, quedanHoras / 24);

  document.querySelector('#dias').textContent = Math.floor(quedanDias);
  document.querySelector('#horas').textContent = Math.floor(quedanHoras%24);
  document.querySelector('#minutos').textContent = Math.floor(quedanMinutos%60);
  document.querySelector('#segundos').textContent = Math.floor(quedanSegundos%60);
  // document.querySelector('#milisegundos').textContent = Math.round(quedanMilisegundos%1000);
}

function actualizarBarra() {
  barra.style.width = `${(1-progresoPixeles)*100}%`
}

function dibujarPixelMuerto() {
  let y = floor(pixelesMuertosCantidad/pixelesPorAncho)
  let x = pixelesMuertosCantidad%pixelesPorAncho

  fill(0);
  noStroke();
  rect(x*tamanoPixel,y*tamanoPixel, tamanoPixel, tamanoPixel-0.25);
  rect(width-x*tamanoPixel-tamanoPixel,height-y*tamanoPixel, tamanoPixel, tamanoPixel-0.25);
  
  pixelesMuertosCantidad++;
}

function revertirPixelMuerto() {
  let y = floor(pixelesMuertosCantidad/pixelesPorAncho)
  let x = pixelesMuertosCantidad%pixelesPorAncho

  erase();
  rect(x*tamanoPixel,y*tamanoPixel, tamanoPixel, tamanoPixel);
  rect(width-x*tamanoPixel-tamanoPixel,height-y*tamanoPixel, tamanoPixel, tamanoPixel);
  noErase();

  pixelesMuertosCantidad--;
}