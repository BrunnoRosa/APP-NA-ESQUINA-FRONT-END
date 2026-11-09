import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { enderecoPorCoordenadas, geocodificar } from '../utils/geocodificacao';

const SALVADOR = { lat: -12.9714, lng: -38.5014 };
const CHAVE = '@naesquina:localizacaoCliente';

const LocalizacaoContext = createContext(null);

// Guarda onde o cliente está (GPS) ou o endereço que ele digitou.
// O cabeçalho e o mapa da Home usam o mesmo valor.
export function LocalizacaoProvider({ children }) {
  const [origem, setOrigem] = useState(SALVADOR);
  const [endereco, setEndereco] = useState('');
  const [manual, setManual] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [aviso, setAviso] = useState('');

  const salvar = useCallback(async (dados) => {
    try { await AsyncStorage.setItem(CHAVE, JSON.stringify(dados)); } catch (e) {}
  }, []);

  const usarMinhaLocalizacao = useCallback(async () => {
    setCarregando(true);
    setAviso('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAviso('Permissão de localização negada. Digite seu endereço.');
      } else {
        const pos = await Location.getCurrentPositionAsync({});
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const texto = await enderecoPorCoordenadas(p.lat, p.lng);
        setOrigem(p);
        setEndereco(texto);
        setManual(false);
        salvar({ ...p, endereco: texto, manual: false });
      }
    } catch (e) {
      setAviso('Não foi possível obter sua localização. Digite seu endereço.');
    }
    setCarregando(false);
  }, [salvar]);

  const definirEndereco = useCallback(async (texto) => {
    if (!texto || !texto.trim()) return;
    setCarregando(true);
    setAviso('');
    const p = await geocodificar(texto, origem);
    if (p) {
      setOrigem(p);
      setEndereco(texto.trim());
      setManual(true);
      salvar({ ...p, endereco: texto.trim(), manual: true });
    } else {
      setAviso('Não encontramos esse endereço. Tente incluir rua, bairro e cidade.');
    }
    setCarregando(false);
  }, [origem, salvar]);

  // Ao abrir o app: endereço digitado vale; senão tenta o GPS automaticamente
  useEffect(() => {
    (async () => {
      let salvo = null;
      try {
        const bruto = await AsyncStorage.getItem(CHAVE);
        if (bruto) salvo = JSON.parse(bruto);
      } catch (e) {}

      if (salvo) {
        setOrigem({ lat: salvo.lat, lng: salvo.lng });
        setEndereco(salvo.endereco || '');
        setManual(!!salvo.manual);
      }
      if (!salvo || !salvo.manual) usarMinhaLocalizacao();
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const valor = useMemo(
    () => ({ origem, endereco, manual, carregando, aviso, usarMinhaLocalizacao, definirEndereco }),
    [origem, endereco, manual, carregando, aviso, usarMinhaLocalizacao, definirEndereco]
  );

  return <LocalizacaoContext.Provider value={valor}>{children}</LocalizacaoContext.Provider>;
}

export function useLocalizacao() {
  return useContext(LocalizacaoContext);
}
