import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { estaAberto, formatarDistancia, obterTextoStatusHoje } from '../../utils/mercado';
import { styles } from './styles';

export default function LojaCard({ mercadinho, tipo, distanciaKm, avaliacao, onPress }) {
  const nome = mercadinho?.nomeFantasia || 'Mercadinho';
  const inicial = nome.charAt(0).toUpperCase();
  const aberto = estaAberto(mercadinho);
  const textoSelo = obterTextoStatusHoje(mercadinho);

  const dadosAvaliacao = avaliacao ?? mercadinho?.avaliacao;
  const totalAvaliacoes = Number(dadosAvaliacao?.totalAvaliacoes || 0);
  const mediaGeral = Number(dadosAvaliacao?.mediaGeral || 0);
  const temAvaliacao = totalAvaliacoes > 0;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.topo}>
        <View style={[styles.avaliacaoPill, !temAvaliacao && styles.avaliacaoPillNovo]}>
          <Ionicons
            name={temAvaliacao ? 'star' : 'star-outline'}
            size={12}
            color={temAvaliacao ? '#F59E0B' : '#94A3B8'}
          />
          <Text style={[styles.avaliacaoTexto, !temAvaliacao && styles.avaliacaoTextoNovo]}>
            {temAvaliacao ? `${mediaGeral.toFixed(1)} (${totalAvaliacoes})` : 'Novo'}
          </Text>
        </View>

        <View style={styles.verMais}>
          <Text style={styles.verMaisTexto}>Ver mais</Text>
        </View>
      </View>

      <View style={styles.linha}>
        <View style={styles.logo}>
          <Text style={styles.logoTexto}>{inicial}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.nome} numberOfLines={2}>{nome}</Text>

          {tipo === 'destaque' && (
            <View style={[styles.selo, !aberto && styles.seloFechado]}>
              <Text style={styles.seloTexto}>{textoSelo}</Text>
            </View>
          )}

          {tipo === 'perto' && formatarDistancia(distanciaKm) && (
            <Text style={styles.distancia}>{formatarDistancia(distanciaKm)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}