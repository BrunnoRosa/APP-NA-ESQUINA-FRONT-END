// components/SeletorRota/index.jsx
// Folha inferior para escolher em qual aplicativo abrir a rota até o mercadinho.
// É controlada de fora (visivel / onFechar), então serve para o botão e para o balão do mapa.
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useToast } from '../../context/ToastContext';
import { cores } from '../../theme';
import { abrirRota, appsDisponiveis } from '../../utils/rotas';
import { styles } from './styles';

/**
 * Props:
 *  - visivel: boolean
 *  - mercado: { nomeFantasia, endereco, latitude, longitude }
 *  - onFechar: () => void
 */
export default function SeletorRota({ visivel, mercado, onFechar }) {
  const { exibirAlerta } = useToast();

  async function escolher(idApp) {
    onFechar();
    try {
      await abrirRota(idApp, mercado);
    } catch (e) {
      exibirAlerta('Erro', 'Não foi possível abrir o aplicativo de mapas neste aparelho.');
    }
  }

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={styles.fundo} onPress={onFechar}>
        <Pressable style={styles.folha} onPress={() => {}}>
          <Text style={styles.titulo}>Ir até {mercado?.nomeFantasia || 'o mercadinho'}</Text>
          {mercado?.endereco ? (
            <Text style={styles.endereco} numberOfLines={2}>
              {mercado.endereco}
            </Text>
          ) : null}

          {appsDisponiveis().map((app) => (
            <TouchableOpacity
              key={app.id}
              style={styles.opcao}
              onPress={() => escolher(app.id)}
              activeOpacity={0.8}
            >
              <View style={styles.opcaoIcone}>
                <Ionicons name={app.icone} size={20} color={cores.primaria} />
              </View>
              <View style={styles.opcaoInfo}>
                <Text style={styles.opcaoNome}>{app.nome}</Text>
                <Text style={styles.opcaoDescricao}>{app.descricao}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={cores.icone} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.cancelar} onPress={onFechar} activeOpacity={0.8}>
            <Text style={styles.cancelarTexto}>Cancelar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
