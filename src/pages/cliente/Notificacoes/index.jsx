import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../../../theme';
import { styles } from './styles';

export default function Notificacoes({ navigation }) {
  const [notificacoes, setNotificacoes] = useState([
    {
      id: '1',
      titulo: 'Bem-vindo ao Na Esquina!',
      mensagem: 'Aproveite as ofertas e promoções dos mercados próximos de si.',
      data: 'Hoje às 10:00',
      lida: false,
    },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={cores.textoTitulo || '#333'} />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Notificações</Text>
      </View>

      {notificacoes.length === 0 ? (
        <View style={styles.centroVazio}>
          <Ionicons name="notifications-off-outline" size={48} color="#A0A4A8" />
          <Text style={styles.textoVazio}>Nenhuma notificação por enquanto.</Text>
        </View>
      ) : (
        <FlatList
          data={notificacoes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={[styles.card, !item.lida && styles.cardNaoLido]}>
              <View style={styles.iconeContainer}>
                <Ionicons name="notifications-outline" size={22} color={cores.primaria || '#FF3131'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tituloCard}>{item.titulo}</Text>
                <Text style={styles.mensagemCard}>{item.mensagem}</Text>
                <Text style={styles.dataCard}>{item.data}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}