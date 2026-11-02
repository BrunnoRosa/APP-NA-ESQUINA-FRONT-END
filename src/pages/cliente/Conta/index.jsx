import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { cores } from '../../../theme';
import { styles } from './styles';

export default function Conta({ navigation }) {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={44} color={cores.primaria} />
      </View>

      <Text style={styles.nome}>{user?.nome || 'Cliente'}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity
        style={styles.botaoEditar}
        onPress={() => navigation.navigate('EditarPerfil')}
        activeOpacity={0.8}
      >
        <Ionicons name="create-outline" size={20} color={cores.primaria} />
        <Text style={styles.botaoEditarTexto}>Editar perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoSair} onPress={signOut} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.botaoSairTexto}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}