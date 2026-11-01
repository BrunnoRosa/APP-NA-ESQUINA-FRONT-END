import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../../components/Layout/Header';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { styles } from './styles';

export default function DashboardComerciante({ navigation }) {
  const { user } = useAuth();
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalDestaques, setTotalDestaques] = useState(0);
  const [nomeMercado, setNomeMercado] = useState('');
  const [loading, setLoading] = useState(true);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Identifica os IDs vindos da sessão do utilizador
      let idDoMercado = user?.idMercadinho || user?.id_mercadinho || user?.mercadinhoId;
      const idComerciante = user?.id || user?.id_usuario || user?.idUsuario;

      // 2. Busca a lista completa de mercadinhos
      const res = await api.get('/api/mercadinhos');
      
      // Extração robusta: previne falhas se a API usar paginação (content) ou encapsulamento (data)
      const listaMercados = Array.isArray(res.data) 
        ? res.data 
        : (res.data?.content || res.data?.data || []);

      let mercadoEncontrado = null;

      // 3. Pesquisa abrangente com verificação de camelCase e snake_case
      if (listaMercados.length > 0) {
        mercadoEncontrado = listaMercados.find(m => 
          (idDoMercado && (m.id == idDoMercado || m.id_mercadinho == idDoMercado || m.idMercadinho == idDoMercado)) ||
          (idComerciante && (m.comerciante_id == idComerciante || m.comercianteId == idComerciante || m.usuario_id == idComerciante || m.usuarioId == idComerciante))
        );
      }

      // 4. Define o nome exato extraído da lista
      if (mercadoEncontrado) {
        const nomeCorreto = mercadoEncontrado.nome_fantasia || mercadoEncontrado.nomeFantasia || mercadoEncontrado.nome || 'Mercado Sem Nome';
        setNomeMercado(nomeCorreto);
        // Atualiza o ID do mercado caso a busca tenha sido feita apenas pelo idComerciante
        idDoMercado = mercadoEncontrado.id || mercadoEncontrado.id_mercadinho || mercadoEncontrado.idMercadinho;
      } else {
        setNomeMercado('Mercado não encontrado');
        console.warn('Depuração - Lista Recebida:', listaMercados, 'ID Mercado procurado:', idDoMercado, 'ID Comerciante procurado:', idComerciante);
      }

      // 5. Busca os produtos usando o ID validado
      if (idDoMercado) {
        const resProds = await api.get(`/api/produtos/mercadinho/${idDoMercado}`);
        const prods = Array.isArray(resProds.data) 
          ? resProds.data 
          : (resProds.data?.content || resProds.data?.data || []);
          
        setTotalProdutos(prods.length);
        setTotalDestaques(prods.filter((p) => p.emDestaque).length);
      }

    } catch (error) {
      console.error('Erro ao carregar dados no Dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  // Define o título garantindo que exibe mensagem de carregamento antes da API responder
  const tituloDashboard = nomeMercado || 'Carregando Mercado...';

  return (
    <View style={styles.container}>
      {/* Passa o tituloDashboard corrigido para o Header */}
      <Header navigation={navigation} title={tituloDashboard} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Visão Geral 📊</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, styles.metricCardBlue]}>
              <Text style={styles.metricValue}>{totalProdutos}</Text>
              <Text style={styles.metricLabel}>Produtos no Catálogo</Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardYellow]}>
              <Text style={[styles.metricValue, styles.metricValueYellow]}>{totalDestaques}</Text>
              <Text style={styles.metricLabel}>Em Destaque ⭐</Text>
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Ações Rápidas</Text>

        <TouchableOpacity
          style={[styles.actionCard, { borderLeftColor: '#007BFF' }]}
          onPress={() => navigation.navigate('GerenciarProdutos')}
          activeOpacity={0.7}
        >
          <View style={styles.actionHeader}>
            <Text style={styles.actionIcon}>📦</Text>
            <Text style={styles.actionTitle}>Gerir Catálogo de Produtos</Text>
          </View>
          <Text style={styles.actionSubtitle}>
            Cadastre novos itens, altere preços e ajuste o inventário.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderLeftColor: '#FFC107' }]}
          onPress={() => navigation.navigate('GerenciarVitrine')}
          activeOpacity={0.7}
        >
          <View style={styles.actionHeader}>
            <Text style={styles.actionIcon}>⭐</Text>
            <Text style={styles.actionTitle}>Gerir Ofertas e Destaques</Text>
          </View>
          <Text style={styles.actionSubtitle}>
            Selecione os produtos que aparecem com destaque no topo das buscas dos clientes.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderLeftColor: '#28A745' }]}
          onPress={() => navigation.navigate('GerenciarPedidos')}
          activeOpacity={0.7}
        >
          <View style={styles.actionHeader}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionTitle}>Gerenciar Pedidos Recebidos</Text>
          </View>
          <Text style={styles.actionSubtitle}>
            Visualize pedidos dos clientes, aceite compras e altere os status de entrega.
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}