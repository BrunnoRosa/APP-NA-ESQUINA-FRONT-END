import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { NIVEIS_FONTE } from "../theme";
import {
  atualizarEstadoGlobalAcessibilidade,
  obterPaletaAtual,
} from "../utils/acessibilidadeGlobal";

const STORAGE_KEY = "@na_esquina:acessibilidade";

const AcessibilidadeContext = createContext({
  tema: "claro",
  nivelFonte: "normal",
  fatorFonte: 1,
  paleta: obterPaletaAtual("claro"),
  versaoVisual: 0,
  alterarTema: () => {},
  alterarNivelFonte: () => {},
  aumentarFonte: () => {},
  diminuirFonte: () => {},
  resetarAcessibilidade: () => {},
});

export function AcessibilidadeProvider({ children }) {
  const [tema, setTema] = useState("claro");
  const [nivelFonte, setNivelFonte] = useState("normal");
  const [versaoVisual, setVersaoVisual] = useState(0);

  const fatorFonte = useMemo(() => {
    const encontrado = NIVEIS_FONTE.find((n) => n.id === nivelFonte);
    return encontrado ? encontrado.fator : 1.0;
  }, [nivelFonte]);

  // Carrega preferências salvas ao abrir o app
  useEffect(() => {
    async function carregar() {
      try {
        const salvo = await AsyncStorage.getItem(STORAGE_KEY);
        if (salvo) {
          const parsed = JSON.parse(salvo);
          const temaSalvo = parsed.tema === "escuro" ? "escuro" : "claro";
          const nivelSalvo = NIVEIS_FONTE.some((n) => n.id === parsed.nivelFonte)
            ? parsed.nivelFonte
            : "normal";
          const fator =
            NIVEIS_FONTE.find((n) => n.id === nivelSalvo)?.fator || 1.0;

          atualizarEstadoGlobalAcessibilidade(temaSalvo, fator);
          setTema(temaSalvo);
          setNivelFonte(nivelSalvo);
          setVersaoVisual((v) => v + 1);
        }
      } catch (e) {
        console.log("Erro ao carregar acessibilidade:", e);
      }
    }
    carregar();
  }, []);

  const persistir = useCallback(async (novoTema, novoNivel) => {
    const fator =
      NIVEIS_FONTE.find((n) => n.id === novoNivel)?.fator || 1.0;
    atualizarEstadoGlobalAcessibilidade(novoTema, fator);
    setTema(novoTema);
    setNivelFonte(novoNivel);
    setVersaoVisual((v) => v + 1);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tema: novoTema, nivelFonte: novoNivel })
      );
    } catch (e) {
      console.log("Erro ao salvar acessibilidade:", e);
    }
  }, []);

  const alterarTema = useCallback(
    (novoTema) => {
      persistir(novoTema, nivelFonte);
    },
    [nivelFonte, persistir]
  );

  const alterarNivelFonte = useCallback(
    (novoNivel) => {
      persistir(tema, novoNivel);
    },
    [tema, persistir]
  );

  const aumentarFonte = useCallback(() => {
    const idx = NIVEIS_FONTE.findIndex((n) => n.id === nivelFonte);
    if (idx < NIVEIS_FONTE.length - 1) {
      persistir(tema, NIVEIS_FONTE[idx + 1].id);
    }
  }, [nivelFonte, tema, persistir]);

  const diminuirFonte = useCallback(() => {
    const idx = NIVEIS_FONTE.findIndex((n) => n.id === nivelFonte);
    if (idx > 0) {
      persistir(tema, NIVEIS_FONTE[idx - 1].id);
    }
  }, [nivelFonte, tema, persistir]);

  const resetarAcessibilidade = useCallback(() => {
    persistir("claro", "normal");
  }, [persistir]);

  const paleta = useMemo(() => obterPaletaAtual(tema), [tema]);

  return (
    <AcessibilidadeContext.Provider
      value={{
        tema,
        nivelFonte,
        fatorFonte,
        paleta,
        versaoVisual,
        alterarTema,
        alterarNivelFonte,
        aumentarFonte,
        diminuirFonte,
        resetarAcessibilidade,
      }}
    >
      {children}
    </AcessibilidadeContext.Provider>
  );
}

export function useAcessibilidade() {
  return useContext(AcessibilidadeContext);
}