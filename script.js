"use strict";

// VARIÁVEIS GLOBAIS
let tela, gl, programa; 

// Buffers da GPU
let bufferVerticesCubo, bufferNormaisCubo, bufferTexCoordCubo; 
let numVerticesCubo;

// Localização dos atributos e uniformes
let aPositionLoc, aNormalLoc, aTexCoordLoc;
let uModelViewMatrixLoc, uProjectionMatrixLoc, uNormalMatrixLoc;
let uLightPositionLoc, uShininessLoc;
let uAmbientProductLoc, uDiffuseProductLoc, uSpecularProductLoc;
let uTextureMapLoc;
let uUseTextureLoc; 

// Matrizes de transformação
let matrizProjecao, matrizVisualizacaoModelo;

// DADOS DE ILUMINAÇÃO E MATERIAIS
let luz, materiais, textura;

// ESTADO DA CENA
let posicaoAbelha; 
const posicaoInicialAbelha = vec3(-4.0, 3.0, 0.0); // Posição inicial da abelha
let posicaoPousoAbelha; // Posição onde a abelha pousará

// Animação
let animandoAbelha = false, posInicialAnimacao, posFinalAnimacao, progressoAnimacao = 0.0; // Variáveis para a animação da abelha

// Câmera e Interação
let alvoCamera = vec3(0.0, 1.0, 0.0); // Ponto para onde a câmera está olhando
const vetorCima = vec3(0.0, 1.0, 0.0); // Vetor "para cima" da câmera
let posCamera, anguloCameraX = 2.8, anguloCameraY = 0.3, distanciaCamera = 15.0; // Posição da câmera, ângulos e distância
let mousePressionado = false, ultimoMouseX = 0, ultimoMouseY = 0; // Variáveis para controle do mouse
let teclasPressionadas = {}; // Objeto para rastrear teclas pressionadas

// Dados da cena
const nuvens = [];
const posicoesFlores = [];
let sliderZoom;
let deslocamentoNuvem = 0;

// Geometria do Cubo
const CUBO_VERTICES = [
    vec4(-0.5, -0.5, 0.5, 1), vec4(0.5, -0.5, 0.5, 1), vec4(0.5, 0.5, 0.5, 1), vec4(-0.5, -0.5, 0.5, 1), vec4(0.5, 0.5, 0.5, 1), vec4(-0.5, 0.5, 0.5, 1),
    vec4(-0.5, -0.5, -0.5, 1), vec4(-0.5, 0.5, -0.5, 1), vec4(0.5, 0.5, -0.5, 1), vec4(-0.5, -0.5, -0.5, 1), vec4(0.5, 0.5, -0.5, 1), vec4(0.5, -0.5, -0.5, 1),
    vec4(-0.5, 0.5, -0.5, 1), vec4(-0.5, 0.5, 0.5, 1), vec4(0.5, 0.5, 0.5, 1), vec4(-0.5, 0.5, -0.5, 1), vec4(0.5, 0.5, 0.5, 1), vec4(0.5, 0.5, -0.5, 1),
    vec4(-0.5, -0.5, -0.5, 1), vec4(0.5, -0.5, -0.5, 1), vec4(0.5, -0.5, 0.5, 1), vec4(-0.5, -0.5, -0.5, 1), vec4(0.5, -0.5, 0.5, 1), vec4(-0.5, -0.5, 0.5, 1),
    vec4(0.5, -0.5, -0.5, 1), vec4(0.5, 0.5, -0.5, 1), vec4(0.5, 0.5, 0.5, 1), vec4(0.5, -0.5, -0.5, 1), vec4(0.5, 0.5, 0.5, 1), vec4(0.5, -0.5, 0.5, 1),
    vec4(-0.5, -0.5, -0.5, 1), vec4(-0.5, -0.5, 0.5, 1), vec4(-0.5, 0.5, 0.5, 1), vec4(-0.5, -0.5, -0.5, 1), vec4(-0.5, 0.5, 0.5, 1), vec4(-0.5, 0.5, -0.5, 1),
]; // Coordenadas dos vértices do cubo

const CUBO_TEXCOORDS = [
    vec2(0, 0), vec2(1, 0), vec2(1, 1), vec2(0, 0), vec2(1, 1), vec2(0, 1),
    vec2(0, 0), vec2(1, 0), vec2(1, 1), vec2(0, 0), vec2(1, 1), vec2(0, 1),
    vec2(0, 0), vec2(1, 0), vec2(1, 1), vec2(0, 0), vec2(1, 1), vec2(0, 1),
    vec2(0, 0), vec2(1, 0), vec2(1, 1), vec2(0, 0), vec2(1, 1), vec2(0, 1),
    vec2(0, 0), vec2(1, 0), vec2(1, 1), vec2(0, 0), vec2(1, 1), vec2(0, 1),
    vec2(0, 0), vec2(1, 0), vec2(1, 1), vec2(0, 0), vec2(1, 1), vec2(0, 1)
]; // Coordenadas de textura do cubo

const CUBO_NORMAIS_POR_FACE = [vec3(0, 0, 1), vec3(0, 0, -1), vec3(0, 1, 0), vec3(0, -1, 0), vec3(1, 0, 0), vec3(-1, 0, 0)];
 // Normais para cada face do cubo


// TEXTURA
var texture1;
var texSize = 256;
var numChecks = 25;
var c;

var image1 = new Uint8Array(4 * texSize * texSize); 

for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        var patchx = Math.floor(i / (texSize / numChecks));
        var patchy = Math.floor(j / (texSize / numChecks));
        var pixelPos = 4 * i * texSize + 4 * j; 

        if (patchx % 2 ^ patchy % 2) {
            image1[pixelPos] = 255;
            image1[pixelPos + 1] = 255;
            image1[pixelPos + 2] = 255;
        } else {
            image1[pixelPos] = 0;
            image1[pixelPos + 1] = 100;
            image1[pixelPos + 2] = 0;
        }
        image1[pixelPos + 3] = 255;
    }
} 
// FIM DA TEXTURA

// Função principal de inicialização
window.onload = function setup() {
    tela = document.getElementById("gl-canvas");
    gl = tela.getContext("webgl2");
    if (!gl) { alert("WebGL 2.0 não está disponível."); return; }

    sliderZoom = document.getElementById("zoomSlider");
    posicaoAbelha = vec3(posicaoInicialAbelha);

    gl.clearColor(0.53, 0.81, 0.92, 1.0); // Cor de fundo
    gl.enable(gl.DEPTH_TEST); // Habilita o teste de profundidade
    gl.enable(gl.BLEND); // Habilita o blending
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Define a função de blending

    programa = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(programa); 

    obterLocalizacoes();
    configurarBuffersDoCubo();
    configurarIluminacaoMateriais();
    configurarTextura();
    gerarCenaInicial();

    if (sliderZoom) sliderZoom.value = distanciaCamera;
    configurarEventListeners();
    tratarRedimensionamento();

    renderizar();
}; 

 // Funções auxiliares
function configurarBuffersDoCubo() {
    let pontos = [];
    let normais = [];
    let texCoordsArray = [];

    for (let i = 0; i < CUBO_VERTICES.length; i++) {
        pontos.push(CUBO_VERTICES[i]);
        texCoordsArray.push(CUBO_TEXCOORDS[i]);
        normais.push(CUBO_NORMAIS_POR_FACE[Math.floor(i / 6)]);
    }

    numVerticesCubo = pontos.length;

    bufferVerticesCubo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferVerticesCubo);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pontos), gl.STATIC_DRAW);

    bufferNormaisCubo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferNormaisCubo);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normais), gl.STATIC_DRAW);

    bufferTexCoordCubo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferTexCoordCubo);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
}

 // Função para obter as localizações dos atributos e uniformes
function obterLocalizacoes() {
    // Atributos
    aPositionLoc = gl.getAttribLocation(programa, "aPosition");
    aNormalLoc = gl.getAttribLocation(programa, "aNormal");
    aTexCoordLoc = gl.getAttribLocation(programa, "aTexCoord");

    // Uniforms de Matrizes
    uModelViewMatrixLoc = gl.getUniformLocation(programa, "uModelViewMatrix");
    uProjectionMatrixLoc = gl.getUniformLocation(programa, "uProjectionMatrix");
    uNormalMatrixLoc = gl.getUniformLocation(programa, "uNormalMatrix");
    uTextureMapLoc = gl.getUniformLocation(programa, "uTextureMap");
    uUseTextureLoc = gl.getUniformLocation(programa, "useTexture"); // <-- Obter a localização do novo uniforme

    // Uniforms de Iluminação
    uLightPositionLoc = gl.getUniformLocation(programa, "uLightPosition");
    uShininessLoc = gl.getUniformLocation(programa, "uShininess");
    uAmbientProductLoc = gl.getUniformLocation(programa, "uAmbientProduct");
    uDiffuseProductLoc = gl.getUniformLocation(programa, "uDiffuseProduct");
    uSpecularProductLoc = gl.getUniformLocation(programa, "uSpecularProduct");
}

 // Função para configurar a iluminação e os materiais
function configurarIluminacaoMateriais() {
    luz = {
        posicao: vec4(2.0, 5.0, 5.0, 0.0), // Posição da luz
        ambiente: vec4(0.2, 0.2, 0.2, 1.0), //  ambiente 
        difusa: vec4(1.0, 1.0, 1.0, 1.0), // difusa
        especular: vec4(1.0, 1.0, 1.0, 1.0) // especular
    };
    // Materiais
    materiais = {
        abelhaAmarelo: { ambiente: vec4(0.98, 0.8, 0.16, 1.0), difusa: vec4(0.98, 0.8, 0.16, 1.0), especular: vec4(0.8, 0.8, 0.8, 1.0), brilho: 50.0 },
        abelhaPreto: { ambiente: vec4(0.1, 0.1, 0.1, 1.0), difusa: vec4(0.2, 0.2, 0.2, 1.0), especular: vec4(0.9, 0.9, 0.9, 1.0), brilho: 100.0 },
        asaAbelha: { ambiente: vec4(0.9, 0.9, 0.9, 0.7), difusa: vec4(0.9, 0.9, 0.9, 0.7), especular: vec4(1.0, 1.0, 1.0, 0.7), brilho: 150.0 },
        florVermelho: { ambiente: vec4(0.8, 0.1, 0.1, 1.0), difusa: vec4(0.8, 0.1, 0.1, 1.0), especular: vec4(0.5, 0.5, 0.5, 1.0), brilho: 30.0 },
        florVerde: { ambiente: vec4(0.2, 0.6, 0.2, 1.0), difusa: vec4(0.2, 0.6, 0.2, 1.0), especular: vec4(0.3, 0.3, 0.3, 1.0), brilho: 10.0 },
        florAmarelo: { ambiente: vec4(0.98, 0.8, 0.16, 1.0), difusa: vec4(0.98, 0.8, 0.16, 1.0), especular: vec4(0.6, 0.6, 0.6, 1.0), brilho: 40.0 },
        nuvem: { ambiente: vec4(3.5, 3.5, 3.5, 0.7), difusa: vec4(0.0, 0.0, 0.0, 0.7), especular: vec4(0.0, 0.0, 0.0, 1.0), brilho: 0.0 },
        grama: { ambiente: vec4(0.4, 0.7, 0.3, 1.0), difusa: vec4(0.4, 0.7, 0.3, 1.0), especular: vec4(0.1, 0.1, 0.1, 1.0), brilho: 5.0 },
        terra: { ambiente: vec4(0.5, 0.35, 0.25, 1.0), difusa: vec4(0.5, 0.35, 0.25, 1.0), especular: vec4(0.2, 0.2, 0.2, 1.0), brilho: 8.0 },
        sombra: { ambiente: vec4(0.0, 0.0, 0.0, 0.4), difusa: vec4(0.0, 0.0, 0.0, 0.4), especular: vec4(0.0, 0.0, 0.0, 0.4), brilho: 0.0 }
    };
}

 // Função para definir o material atual
function definirMaterial(material) {
    const ambientProduct = mult(luz.ambiente, material.ambiente);
    const diffuseProduct = mult(luz.difusa, material.difusa);
    const specularProduct = mult(luz.especular, material.especular);

    gl.uniform4fv(uAmbientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(uDiffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(uSpecularProductLoc, flatten(specularProduct));
    gl.uniform1f(uShininessLoc, material.brilho);
}

 // Função para gerar a cena inicial
function gerarCenaInicial() {
    const tamanhoChao = 20.0;
    for (let i = 0; i < 13; i++) {
        posicoesFlores.push(
            vec3((Math.random() - 0.5) * (tamanhoChao - 1), -0.5, (Math.random() - 0.5) * (tamanhoChao - 1))
        );
    }

    if (posicoesFlores.length > 0) {
        posicaoPousoAbelha = add(posicoesFlores[0], vec3(0.0, 1.4, 0.0));
    } else {
        posicaoPousoAbelha = vec3(0.0, 1.0, 0.0);
    }

    for (let i = 0; i < 12; i++) {
        nuvens.push({
            pos: vec3((Math.random() - 0.5) * 80, 4 + Math.random() * 2, -40 + Math.random() * 60),
            escala: 0.6 + Math.random() * 0.8
        });
    }
}

 // Função para configurar os event listeners
function configurarEventListeners() {
    window.addEventListener('resize', tratarRedimensionamento);
    window.addEventListener('keydown', e => { teclasPressionadas[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', e => { teclasPressionadas[e.key.toLowerCase()] = false; });
    tela.addEventListener('mousedown', e => { mousePressionado = true; ultimoMouseX = e.clientX; ultimoMouseY = e.clientY; });
    document.addEventListener('mouseup', () => { mousePressionado = false; });
    tela.addEventListener('mousemove', e => {
        if (!mousePressionado) return;
        anguloCameraX -= (e.clientX - ultimoMouseX) * 0.01;
        anguloCameraY += (e.clientY - ultimoMouseY) * 0.01;
        anguloCameraY = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, anguloCameraY));
        ultimoMouseX = e.clientX; ultimoMouseY = e.clientY;
    });
    tela.addEventListener('wheel', e => {
        e.preventDefault();
        distanciaCamera += e.deltaY * 0.05;
        distanciaCamera = Math.max(parseFloat(sliderZoom.min), Math.min(parseFloat(sliderZoom.max), distanciaCamera));
        sliderZoom.value = distanciaCamera;
    });
    document.getElementById("botaoPousar").onclick = () => iniciarAnimacaoAbelha(posicaoPousoAbelha);
    document.getElementById("botaoVoltar").onclick = () => iniciarAnimacaoAbelha(posicaoInicialAbelha);
    sliderZoom.addEventListener('input', e => { distanciaCamera = parseFloat(e.target.value); });
}

// Função para tratar o redimensionamento da tela
function tratarRedimensionamento() {
    tela.width = window.innerWidth;
    tela.height = window.innerHeight;
    gl.viewport(0, 0, tela.width, tela.height);
    matrizProjecao = perspective(45.0, tela.width / tela.height, 0.1, 100.0);
    gl.uniformMatrix4fv(uProjectionMatrixLoc, false, flatten(matrizProjecao));
}

 // Função para atualizar o estado da cena
function atualizarEstado() {
    const velocidadePanoramica = 0.1;
// Atualiza a posição da abelha durante a animação
    if (animandoAbelha) {
        progressoAnimacao = Math.min(1.0, progressoAnimacao + 0.01);
        posicaoAbelha = mix(posInicialAnimacao, posFinalAnimacao, progressoAnimacao);
        if (progressoAnimacao === 1.0) animandoAbelha = false;
    }
// Atualiza o deslocamento das nuvens
    deslocamentoNuvem = (deslocamentoNuvem + 0.01) % 100;
// Atualiza a posição da câmera
    const raio = distanciaCamera * Math.cos(anguloCameraY);
    posCamera = vec3(
        alvoCamera[0] + raio * Math.sin(anguloCameraX),
        alvoCamera[1] + distanciaCamera * Math.sin(anguloCameraY),
        alvoCamera[2] + raio * Math.cos(anguloCameraX)
    );

    let frente = subtract(alvoCamera, posCamera);
    frente[1] = 0;
    frente = normalize(frente);
    const direita = normalize(cross(frente, vetorCima));
 // Atualiza a posição da câmera com base nas teclas pressionadas
    if (teclasPressionadas['w'] || teclasPressionadas['arrowup']) {
        alvoCamera = add(alvoCamera, mult(velocidadePanoramica, frente));
    }
    if (teclasPressionadas['s'] || teclasPressionadas['arrowdown']) {
        alvoCamera = subtract(alvoCamera, mult(velocidadePanoramica, frente));
    }
    if (teclasPressionadas['a'] || teclasPressionadas['arrowleft']) {
        alvoCamera = subtract(alvoCamera, mult(velocidadePanoramica, direita));
    }
    if (teclasPressionadas['d'] || teclasPressionadas['arrowright']) {
        alvoCamera = add(alvoCamera, mult(velocidadePanoramica, direita));
    }
}

// Função para iniciar a animação da abelha
function iniciarAnimacaoAbelha(alvo) {
    animandoAbelha = true; // Inicia a animação
    progressoAnimacao = 0.0; // Reinicia o progresso da animação
    posInicialAnimacao = vec3(posicaoAbelha); // Define a posição inicial da animação como a posição atual da abelha
    posFinalAnimacao = vec3(alvo); // Define a posição final da animação como o alvo fornecido
}

// Função para desenhar o cubo
function desenharCubo() {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferVerticesCubo);
    gl.vertexAttribPointer(aPositionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPositionLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferNormaisCubo);
    gl.vertexAttribPointer(aNormalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormalLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferTexCoordCubo);
    gl.vertexAttribPointer(aTexCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTexCoordLoc);

    gl.drawArrays(gl.TRIANGLES, 0, numVerticesCubo);
}

// Função para desenhar um objeto
function desenharObjeto(transformacao, material, useTextureFlag = false) {
    definirMaterial(material);

    matrizVisualizacaoModelo = mult(lookAt(posCamera, alvoCamera, vetorCima), transformacao);
    const matrizNormal = normalMatrix(matrizVisualizacaoModelo, true);

    gl.uniformMatrix4fv(uModelViewMatrixLoc, false, flatten(matrizVisualizacaoModelo));
    gl.uniformMatrix3fv(uNormalMatrixLoc, false, flatten(matrizNormal));

    gl.uniform1i(uUseTextureLoc, useTextureFlag ? 1 : 0); // 1 para true, 0 para false

    desenharCubo();
}

// Função para configurar a textura
function configurarTextura() {
    texture1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.uniform1i(gl.getUniformLocation(programa, "uTextureMap"), 0);
}

// Função para renderizar a cena
function renderizar() {
    requestAnimationFrame(renderizar);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    atualizarEstado();

    gl.uniform4fv(uLightPositionLoc, flatten(luz.posicao));

    gl.depthMask(true);

    // Chão COM TEXTURA
    desenharObjeto(mult(translate(0, -1, 0), scale(20, 1, 20)), materiais.grama, true); //true para usar textura

    // Flores SEM TEXTURA
    posicoesFlores.forEach(pos => {
        const transFlor = mult(translate(pos[0], pos[1], pos[2]), scale(0.3, 0.3, 0.3));
        desenharObjeto(mult(transFlor, translate(0, 0, 0)), materiais.terra, false); // false para não usar textura
        desenharObjeto(mult(transFlor, mult(translate(0, 2, 0), scale(0.5, 3, 0.5))), materiais.florVerde, false); // false
        const cabecaFlor = mult(transFlor, translate(0, 4, 0));
        desenharObjeto(mult(cabecaFlor, scale(2.5, 1, 2.5)), materiais.florVermelho, false); // false
        desenharObjeto(mult(cabecaFlor, translate(0, 0.1, 0)), materiais.florAmarelo, false); // false
    });

    // Abelha SEM TEXTURA
    const transAbelha = mult(translate(posicaoAbelha[0], posicaoAbelha[1], posicaoAbelha[2]), scale(0.2, 0.2, 0.2));
    desenharObjeto(mult(transAbelha, mult(translate(0, 0, 0), scale(1.2, 1.2, 3))), materiais.abelhaAmarelo, false); // false
    desenharObjeto(mult(transAbelha, mult(translate(0, 0, 0.5), scale(1.3, 1.3, 0.5))), materiais.abelhaPreto, false); //false
    desenharObjeto(mult(transAbelha, mult(translate(0, 0, -0.5), scale(1.3, 1.3, 0.5))), materiais.abelhaPreto, false); // false
    desenharObjeto(mult(transAbelha, mult(translate(0, 0, -1.75), scale(1.2, 0.9, 0.7))), materiais.abelhaPreto, false); // false

    gl.depthMask(false);

    // Asas da Abelha SEM TEXTURA
    const anguloAsa = 20.0 * Math.sin(Date.now() * 0.02); // Animação das asas
    const asa1 = mult(transAbelha, mult(translate(-1.5, 0.5, 0.5), mult(rotateZ(10 + anguloAsa), scale(3, 0.2, 2))));
    const asa2 = mult(transAbelha, mult(translate(1.5, 0.5, 0.5), mult(rotateZ(-10 - anguloAsa), scale(3, 0.2, 2))));
    desenharObjeto(asa1, materiais.asaAbelha, false); // false
    desenharObjeto(asa2, materiais.asaAbelha, false); // false

    // Nuvens SEM TEXTURA
    nuvens.forEach(nuvem => {
        let transNuvem = mult(translate(nuvem.pos[0] - deslocamentoNuvem, nuvem.pos[1], nuvem.pos[2]), scale(nuvem.escala, nuvem.escala, nuvem.escala)); // Mover a nuvem no eixo X
        desenharObjeto(mult(transNuvem, mult(translate(0, 0, 0), scale(4, 2, 2))), materiais.nuvem, false); // false
        desenharObjeto(mult(transNuvem, mult(translate(2, 1, 0), scale(2, 1, 2))), materiais.nuvem, false); // false
    });

    // Sombra SEM TEXTURA
    desenharObjeto(mult(translate(posicaoAbelha[0], -0.5, posicaoAbelha[2]), scale(0.8, 0.01, 0.8)), materiais.sombra, false); // false

    gl.depthMask(true); 
}