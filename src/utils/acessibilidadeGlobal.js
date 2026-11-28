import React from "react";
import { Platform, StyleSheet, Text, TextInput } from "react-native";
import { coresClaro, coresEscuro } from "../theme";

// Mapa de cores fixas usadas nos styles.js atuais -> equivalente no modo escuro
const MAPA_HEX_ESCURO = {
  "#ffffff": "#181818",
  "#fff": "#181818",
  "#fffcf7": coresEscuro.fundoCartaoLogin,
  "#f0f0f0": coresEscuro.fundoCartao,
  "#f4f4f4": coresEscuro.fundoCirculo,
  "#f5f5f5": coresEscuro.fundoBusca,
  "#f5f6f9": coresEscuro.fundoSeletor,
  "#f3f4f3": coresEscuro.bordaCampo,
  "#f3f3f3": coresEscuro.divisor,
  "#e9ecef": "#2E2E2E",
  "#ecedef": "#2E2E2E",
  "#dcdcdc": "#333333",
  "#eaeaea": "#333333",
  "#f1f3f5": "#2A2A2A",
  "#dee2e6": "#3A3A3A",
  "#fff2d0": "#3A2E14",
  "#fff4ef": coresEscuro.fundoBotaoSecundario,
  "#ffecec": coresEscuro.fundoVerMais,
  "#404040": coresEscuro.textoTitulo,
  "#5b5b5b": coresEscuro.textoSecundario,
  "#000000": coresEscuro.textoAtivo,
  "#000": coresEscuro.textoAtivo,
  "#6c7278": coresEscuro.textoRotulo,
  "#232447": coresEscuro.textoLogin,
  "#1a1c1e": coresEscuro.textoCampo,
  "#7d7d91": coresEscuro.textoSeletorInativo,
  "#5a5749": coresEscuro.textoEndereco,
  "#434242": coresEscuro.textoSaudacao,
  "#717171": coresEscuro.textoRaio,
  "#666666": "#B8BCC2",
  "#495057": "#D1D5DB",
  "#212529": "#E5E7EB",
  "#ff3131": coresEscuro.primaria,
  "#fdac27": coresEscuro.degradeTopo,
  "#fb8701": coresEscuro.degradeBase,
  "#ffef8d": coresEscuro.degradeInicioTopo,
  "#ffbd3e": coresEscuro.degradeInicioBase,
  "#d93025": coresEscuro.erro,
};

function traduzirCorParaEscuro(valor) {
  if (typeof valor !== "string") return valor;
  const chave = valor.trim().toLowerCase();
  return MAPA_HEX_ESCURO[chave] || valor;
}

function adaptarObjetoEstilo(estilo, tema, fatorFonte) {
  if (!estilo || typeof estilo !== "object") return estilo;
  if (Array.isArray(estilo)) {
    return estilo.map((item) => adaptarObjetoEstilo(item, tema, fatorFonte));
  }

  const novo = { ...estilo };

  if (tema === "escuro") {
    const propsCor = [
      "backgroundColor",
      "color",
      "borderColor",
      "borderTopColor",
      "borderBottomColor",
      "borderLeftColor",
      "borderRightColor",
    ];
    for (const prop of propsCor) {
      if (novo[prop]) {
        novo[prop] = traduzirCorParaEscuro(novo[prop]);
      }
    }
  }

  if (fatorFonte !== 1 && typeof novo.fontSize === "number") {
    novo.fontSize = Math.round(novo.fontSize * fatorFonte * 10) / 10;
    if (typeof novo.lineHeight === "number") {
      novo.lineHeight = Math.round(novo.lineHeight * fatorFonte * 10) / 10;
    }
  }

  return novo;
}

let estadoAtual = { tema: "claro", fatorFonte: 1 };
let instalado = false;

// --- SOLUÇÃO WEB (react-native-web) ---
// Aplica zoom tipográfico real e filtro inteligente de modo escuro preservando imagens, mapas e fotos
function aplicarEstilosWeb(tema, fatorFonte) {
  if (Platform.OS !== "web" || typeof document === "undefined") return;

  const STYLE_ID = "na-esquina-acessibilidade-css";
  let styleEl = document.getElementById(STYLE_ID);
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }

  // No react-native-web, os elementos de texto usam a classe .css-text-146c3p1 (ou data-testid / dir)
  // zoom no texto e inputs escala todas as fontes proporcionalmente sem quebrar o layout flex
  const cssFonte =
    fatorFonte !== 1
      ? `
      [dir="auto"], input, textarea, select, button span {
        zoom: ${fatorFonte} !important;
      }
    `
      : "";

  // Modo escuro no Web: inverte luminância mantendo matiz (hue-rotate) e desinverte imagens/mapas/vídeos/modal de acessibilidade
  const cssTema =
    tema === "escuro"
      ? `
      html, body, #root {
        background-color: #121212 !important;
      }
      #root {
        filter: invert(0.91) hue-rotate(180deg) !important;
      }
      #root img,
      #root video,
      #root canvas,
      #root iframe,
      #root .leaflet-container,
      [data-acessibilidade-ignorar="true"] {
        filter: invert(1) hue-rotate(180deg) !important;
      }
    `
      : `
      html, body, #root {
        background-color: #FFFFFF !important;
      }
      #root {
        filter: none !important;
      }
    `;

  styleEl.textContent = `${cssFonte}\n${cssTema}`;
}

export function instalarInterceptadorAcessibilidade() {
  if (instalado) return;
  instalado = true;

  if (Platform.OS === "web") return;

  // --- SOLUÇÃO NATIVA (Android / iOS) ---
  const originalCreate = StyleSheet.create.bind(StyleSheet);
  StyleSheet.create = (stylesObj) => {
    const base = originalCreate(stylesObj);
    const proxy = {};

    Object.keys(base).forEach((key) => {
      Object.defineProperty(proxy, key, {
        enumerable: true,
        get() {
          const original = StyleSheet.flatten(base[key]);
          if (estadoAtual.tema === "claro" && estadoAtual.fatorFonte === 1) {
            return base[key];
          }
          return adaptarObjetoEstilo(
            original,
            estadoAtual.tema,
            estadoAtual.fatorFonte
          );
        },
      });
    });

    return proxy;
  };

  const originalTextRender = Text.render;
  if (originalTextRender) {
    Text.render = function (...args) {
      const origin = originalTextRender.apply(this, args);
      if (estadoAtual.tema === "claro" && estadoAtual.fatorFonte === 1) {
        return origin;
      }
      const flat = StyleSheet.flatten(origin.props.style) || {};
      const extra = {};

      if (estadoAtual.fatorFonte !== 1 && !flat.fontSize) {
        extra.fontSize = Math.round(14 * estadoAtual.fatorFonte * 10) / 10;
      }
      if (estadoAtual.tema === "escuro") {
        extra.color = flat.color
          ? traduzirCorParaEscuro(flat.color)
          : coresEscuro.textoTitulo;
      }

      if (Object.keys(extra).length === 0) return origin;
      return React.cloneElement(origin, {
        style: [origin.props.style, extra],
      });
    };
  }

  const originalInputRender = TextInput.render;
  if (originalInputRender) {
    TextInput.render = function (...args) {
      const origin = originalInputRender.apply(this, args);
      if (estadoAtual.tema === "claro" && estadoAtual.fatorFonte === 1) {
        return origin;
      }
      const flat = StyleSheet.flatten(origin.props.style) || {};
      const extra = {};

      if (estadoAtual.fatorFonte !== 1 && !flat.fontSize) {
        extra.fontSize = Math.round(14 * estadoAtual.fatorFonte * 10) / 10;
      }
      if (estadoAtual.tema === "escuro") {
        extra.color = flat.color
          ? traduzirCorParaEscuro(flat.color)
          : coresEscuro.textoCampo;
      }

      return React.cloneElement(origin, {
        placeholderTextColor:
          estadoAtual.tema === "escuro"
            ? coresEscuro.icone
            : origin.props.placeholderTextColor,
        style: [origin.props.style, extra],
      });
    };
  }
}

export function atualizarEstadoGlobalAcessibilidade(tema, fatorFonte) {
  estadoAtual = { tema, fatorFonte };
  aplicarEstilosWeb(tema, fatorFonte);
}

export function obterPaletaAtual(tema) {
  return tema === "escuro" ? coresEscuro : coresClaro;
}