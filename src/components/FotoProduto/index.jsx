import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Image, Platform, Text, TouchableOpacity, View } from 'react-native';

import { useToast } from '../../context/ToastContext';
import { cores } from '../../theme';
import { styles } from './styles';

const LARGURA_MAX = 640; // pixels: suficiente para o cartão do produto
const QUALIDADE = 0.6; // 0 a 1

// Redimensiona e comprime a foto; devolve "data:image/jpeg;base64,...."
async function prepararImagem(uri) {
  let resultado;
  if (typeof ImageManipulator.manipulate === 'function') {
    // API nova (SDK 52+)
    const contexto = ImageManipulator.manipulate(uri);
    contexto.resize({ width: LARGURA_MAX });
    const imagem = await contexto.renderAsync();
    resultado = await imagem.saveAsync({
      compress: QUALIDADE,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
  } else {
    // API antiga
    resultado = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: LARGURA_MAX } }],
      { compress: QUALIDADE, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
  }
  return `data:image/jpeg;base64,${resultado.base64}`;
}

// valor: foto nova (data URI) ou ''. imagemAtual: foto que o produto já tem (só na edição).
export default function FotoProduto({ valor, onChange, imagemAtual }) {
  const { exibirAlerta } = useToast();
  const [processando, setProcessando] = useState(false);

  const opcoes = {
    mediaTypes: ['images'],
    allowsEditing: true, // recorte
    aspect: [1, 1],
    quality: 0.7,
  };

  async function tratarResultado(res) {
    if (res.canceled || !res.assets || res.assets.length === 0) return;
    setProcessando(true);
    try {
      onChange(await prepararImagem(res.assets[0].uri));
    } catch (e) {
      exibirAlerta('Erro', 'Não foi possível preparar a foto. Tente outra imagem.');
    }
    setProcessando(false);
  }

  async function tirarFoto() {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          exibirAlerta('Atenção', 'Permita o uso da câmera para tirar a foto do produto.', 'aviso');
          return;
        }
      }
      await tratarResultado(await ImagePicker.launchCameraAsync(opcoes));
    } catch (e) {
      exibirAlerta('Atenção', 'Câmera indisponível neste aparelho. Use a galeria.', 'aviso');
    }
  }

  async function escolherDaGaleria() {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          exibirAlerta('Atenção', 'Permita o acesso às fotos para escolher a imagem.', 'aviso');
          return;
        }
      }
      await tratarResultado(await ImagePicker.launchImageLibraryAsync(opcoes));
    } catch (e) {
      exibirAlerta('Erro', 'Não foi possível abrir a galeria.');
    }
  }

  const mostrar = valor || imagemAtual;

  return (
    <View style={styles.container}>
      <Text style={styles.rotulo}>Foto do produto (opcional)</Text>

      <View style={styles.linha}>
        <View style={styles.previa}>
          {processando ? (
            <ActivityIndicator color={cores.primaria} />
          ) : mostrar ? (
            <Image source={{ uri: mostrar }} style={styles.imagem} resizeMode="cover" />
          ) : (
            <Ionicons name="camera-outline" size={30} color={cores.icone} />
          )}
        </View>

        <View style={styles.botoes}>
          <TouchableOpacity style={styles.botao} onPress={tirarFoto} activeOpacity={0.8}>
            <Ionicons name="camera" size={16} color={cores.primaria} />
            <Text style={styles.botaoTexto}>Tirar foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botao} onPress={escolherDaGaleria} activeOpacity={0.8}>
            <Ionicons name="images" size={16} color={cores.primaria} />
            <Text style={styles.botaoTexto}>Galeria</Text>
          </TouchableOpacity>
          {valor ? (
            <TouchableOpacity onPress={() => onChange('')} activeOpacity={0.7}>
              <Text style={styles.remover}>Remover foto</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}
