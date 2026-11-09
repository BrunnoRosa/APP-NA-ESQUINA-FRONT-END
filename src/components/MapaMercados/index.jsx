import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useLocalizacao } from '../../context/LocalizacaoContext';
import { cores } from '../../theme';
import { geocodificar } from '../../utils/geocodificacao';
import { calcularDistanciaKm } from '../../utils/mercado';
import { styles } from './styles';

const RAIO_KM = 2;

function montarHtml(origem, lojas) {
  const dados = JSON.stringify({ origem, lojas, raio: RAIO_KM * 1000, cor: cores.primaria || '#FF3131' })
    .replace(/</g, '\\u003c');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#mapa{height:100%;margin:0}.btn{margin-top:6px;padding:6px 10px;border:0;border-radius:14px;background:#FF3131;color:#fff;font-weight:bold}</style>
</head><body><div id="mapa"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var D=${dados};
function enviar(m){var s=JSON.stringify(m);if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(s);}else{parent.postMessage(s,'*');}}
var mapa=L.map('mapa').setView([D.origem.lat,D.origem.lng],14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(mapa);
var circulo=L.circle([D.origem.lat,D.origem.lng],{radius:D.raio,color:D.cor,fillColor:D.cor,fillOpacity:0.08,weight:2}).addTo(mapa);
L.circleMarker([D.origem.lat,D.origem.lng],{radius:8,color:'#fff',weight:3,fillColor:'#1A73E8',fillOpacity:1}).addTo(mapa).bindPopup('Você está aqui');
function esc(t){var e=document.createElement('div');e.textContent=t||'';return e.innerHTML;}
D.lojas.forEach(function(l){
  var m=L.circleMarker([l.lat,l.lng],{radius:10,color:'#fff',weight:2,fillColor:D.cor,fillOpacity:1}).addTo(mapa);
  m.bindPopup('<b>'+esc(l.nome)+'</b><br>'+esc(l.endereco)+'<br>'+l.km.toFixed(1).replace('.',',')+' km<br><button class="btn" onclick="enviar({idMercadinho:'+l.id+'})">Ver loja</button>');
});
mapa.fitBounds(circulo.getBounds(),{padding:[10,10]});
</script></body></html>`;
}

export default function MapaMercados({ mercadinhos = [], navigation }) {
  const {
    origem, endereco, carregando, aviso,
    usarMinhaLocalizacao, definirEndereco,
  } = useLocalizacao();
  const [texto, setTexto] = useState('');
  const [pontos, setPontos] = useState({}); // id -> {lat,lng}
  const versao = useRef(0);

  // Mantém o campo igual ao endereço atual (GPS ou digitado)
  useEffect(() => { setTexto(endereco || ''); }, [endereco]);

  // Geocodifica o endereço de cada mercado (um por vez, respeitando limites de taxa)
  useEffect(() => {
    const minha = ++versao.current;
    (async () => {
      for (const m of mercadinhos) {
        if (versao.current !== minha) return;
        const idM = m.idMercadinho || m.id;

        // 1. Se a loja já veio com latitude e longitude da API, usa diretamente
        if ((m.latitude || m.lat) && (m.longitude || m.lng)) {
          const lat = Number(m.latitude || m.lat);
          const lng = Number(m.longitude || m.lng);
          if (!isNaN(lat) && !isNaN(lng)) {
            setPontos((atual) => (atual[idM] ? atual : { ...atual, [idM]: { lat, lng } }));
            continue;
          }
        }

        // 2. Se já foi geocodificado anteriormente, pula para não repetir requisição
        if (pontos[idM]) continue;

        if (!m.endereco) continue;

        // 3. Aguarda 1 segundo entre chamadas para evitar Erro 429 (Too Many Requests)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (versao.current !== minha) return;

        const p = await geocodificar(m.endereco, origem);
        if (p) {
          setPontos((atual) => ({ ...atual, [idM]: p }));
        }
      }
    })();
  }, [mercadinhos]); // eslint-disable-line react-hooks/exhaustive-deps

  const lojas = useMemo(() => {
    return mercadinhos
      .map((m) => {
        const idM = m.idMercadinho || m.id;
        const p =
          pontos[idM] ||
          ((m.latitude || m.lat) && (m.longitude || m.lng)
            ? { lat: Number(m.latitude || m.lat), lng: Number(m.longitude || m.lng) }
            : null);
        if (!p) return null;
        const km = calcularDistanciaKm(origem.lat, origem.lng, p.lat, p.lng);
        if (km === null) return null;
        return {
          id: idM,
          nome: m.nomeFantasia || m.nome,
          endereco: m.endereco,
          lat: p.lat,
          lng: p.lng,
          km,
        };
      })
      .filter(Boolean);
  }, [mercadinhos, pontos, origem]);

  const dentro = lojas.filter((l) => l.km <= RAIO_KM);
  const html = useMemo(() => montarHtml(origem, dentro), [origem, pontos, mercadinhos]); // eslint-disable-line react-hooks/exhaustive-deps

  function abrirLoja(id) {
    const m = mercadinhos.find((x) => (x.idMercadinho || x.id) === id);
    if (m) navigation.navigate('DetalhesMercadinho', { idMercadinho: id, mercadinho: m });
  }

  // Web: o iframe avisa a página; Nativo: o WebView avisa via onMessage
  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;
    const ouvir = (ev) => {
      try {
        const dados = JSON.parse(ev.data);
        if (dados && dados.idMercadinho) abrirLoja(dados.idMercadinho);
      } catch (e) {}
    };
    window.addEventListener('message', ouvir);
    return () => window.removeEventListener('message', ouvir);
  }); // sem dependências: sempre usa a lista mais recente

  let mapa;
  if (Platform.OS === 'web') {
    mapa = React.createElement('iframe', {
      srcDoc: html,
      title: 'Mapa de mercados',
      style: { border: 0, width: '100%', height: '100%' },
    });
  } else {
    const { WebView } = require('react-native-webview');
    mapa = (
      <WebView
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://localhost' }}
        onMessage={(e) => {
          try {
            const dados = JSON.parse(e.nativeEvent.data);
            if (dados.idMercadinho) abrirLoja(dados.idMercadinho);
          } catch (err) {}
        }}
        javaScriptEnabled
        nestedScrollEnabled
      />
    );
  }

  const faltando = mercadinhos.filter((m) => {
    const idM = m.idMercadinho || m.id;
    const temCoords = (m.latitude || m.lat) && (m.longitude || m.lng);
    return m.endereco && !pontos[idM] && !temCoords;
  }).length;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Mercados perto de você</Text>
      <Text style={styles.subtitulo}>Raio de {RAIO_KM} km a partir do seu endereço</Text>

      <View style={styles.linhaCampo}>
        <TextInput
          style={styles.campo}
          placeholder="Seu endereço (rua, bairro, cidade)"
          placeholderTextColor="#999999"
          value={texto}
          onChangeText={setTexto}
          onSubmitEditing={() => definirEndereco(texto)}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.botaoBuscar} onPress={() => definirEndereco(texto)} activeOpacity={0.8}>
          {carregando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.botaoBuscarTexto}>Buscar</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.botaoLocal} onPress={usarMinhaLocalizacao} activeOpacity={0.7}>
        <Ionicons name="locate" size={16} color={cores.primaria || '#FF3131'} />
        <Text style={styles.botaoLocalTexto}>Usar minha localização</Text>
      </TouchableOpacity>

      <View style={styles.mapaCaixa}>{mapa}</View>

      <Text style={styles.resumo}>
        {dentro.length === 0
          ? 'Nenhum mercado encontrado em até 2 km.'
          : `${dentro.length} ${dentro.length === 1 ? 'mercado' : 'mercados'} em até ${RAIO_KM} km.`}
        {faltando > 0 ? ` Localizando mais ${faltando}...` : ''}
      </Text>
      {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}
    </View>
  );
}