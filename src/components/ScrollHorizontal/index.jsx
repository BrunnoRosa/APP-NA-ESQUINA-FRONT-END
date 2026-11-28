import { forwardRef, useCallback, useEffect, useRef } from "react";
import { Platform, ScrollView } from "react-native";

// ScrollView horizontal que, no navegador do computador, também rola ao
// SEGURAR O BOTÃO DO MOUSE e arrastar para os lados (no celular o toque já faz isso).
// Uso: troque <ScrollView horizontal> por <ScrollHorizontal horizontal> (mesmas propriedades).
const LIMITE_ARRASTE_PX = 5; // abaixo disso é um clique normal, não um arraste

const ScrollHorizontal = forwardRef(function ScrollHorizontal(props, refExterno) {
  const interno = useRef(null);

  // Entrega a ref tanto ao componente que usou quanto a este arquivo
  const definirRef = useCallback(
    (no) => {
      interno.current = no;
      if (typeof refExterno === "function") refExterno(no);
      else if (refExterno) refExterno.current = no;
    },
    [refExterno],
  );

  useEffect(() => {
    if (Platform.OS !== "web") return undefined;
    const elemento = interno.current?.getScrollableNode?.();
    if (!elemento || typeof window === "undefined") return undefined;

    let apertado = false;
    let arrastou = false;
    let inicioX = 0;
    let inicioScroll = 0;

    elemento.style.cursor = "grab";

    const aoApertar = (e) => {
      if (e.button !== 0) return; // só o botão esquerdo
      apertado = true;
      arrastou = false;
      inicioX = e.pageX;
      inicioScroll = elemento.scrollLeft;
    };

    const aoMover = (e) => {
      if (!apertado) return;
      const deslocamento = e.pageX - inicioX;
      if (!arrastou && Math.abs(deslocamento) > LIMITE_ARRASTE_PX) {
        arrastou = true;
        elemento.style.cursor = "grabbing";
        elemento.style.userSelect = "none";
      }
      if (arrastou) {
        elemento.scrollLeft = inicioScroll - deslocamento;
        e.preventDefault();
      }
    };

    const aoSoltar = () => {
      if (!apertado) return;
      apertado = false;
      elemento.style.cursor = "grab";
      elemento.style.userSelect = "";
    };

    // Se arrastou, o "soltar" não pode virar um clique no cartão que estava embaixo do mouse
    const aoClicar = (e) => {
      if (arrastou) {
        e.stopPropagation();
        e.preventDefault();
        arrastou = false;
      }
    };

    // Evita o "fantasma" de imagem/link sendo arrastado pelo navegador
    const aoIniciarArrasteNativo = (e) => e.preventDefault();

    elemento.addEventListener("mousedown", aoApertar);
    elemento.addEventListener("click", aoClicar, true);
    elemento.addEventListener("dragstart", aoIniciarArrasteNativo);
    window.addEventListener("mousemove", aoMover);
    window.addEventListener("mouseup", aoSoltar);

    return () => {
      elemento.removeEventListener("mousedown", aoApertar);
      elemento.removeEventListener("click", aoClicar, true);
      elemento.removeEventListener("dragstart", aoIniciarArrasteNativo);
      window.removeEventListener("mousemove", aoMover);
      window.removeEventListener("mouseup", aoSoltar);
    };
  }, []);

  return <ScrollView ref={definirRef} {...props} />;
});

export default ScrollHorizontal;
