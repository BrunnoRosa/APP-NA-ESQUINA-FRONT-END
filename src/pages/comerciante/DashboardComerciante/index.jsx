import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../../../components/Layout/Header';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { styles } from './styles';

export default function DashboardComerciante({ navigation }) {
  const { user, signOut } = useAuth();
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalDestaques, setTotalDestaques] = useState(0);
  const [loading, setLoading] = useState(true);

  const idMercadinho = user?.idMercadinho || user?.id || 1;

  const carregarMetricas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/produtos/mercadinho/${idMercadinho}`);
      const prods = response.data || [];
      setTotalProdutos(prods.length);
      setTotalDestaques(prods.filter((p) => p.emDestaque).length);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  }, [idMercadinho]);

  useFocusEffect(
    useCallback(() => {
      carregarMetricas();
    }, [carregarMetricas])
  );

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title={user?.nome || user?.email || 'Painel do Comerciante'} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Visão Geral 📊</Text>
          <TouchableOpacity onPress={signOut} style={styles.btnLogout}>
            <Text style={styles.btnLogoutText}>Sair 👋</Text>
          </TouchableOpacity>
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