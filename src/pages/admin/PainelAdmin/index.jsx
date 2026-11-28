import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import api from '../../../services/api';
import { cores } from '../../../theme';
import { mascaraCnpj, mascaraTelefone, traduzirErro } from '../../../utils/validacoes';
import { styles } from './styles';
import ScrollHorizontal from '../../../components/ScrollHorizontal';

const FILTROS = [
  { chave: 'TODOS', rotulo: 'Todos' },
  { chave: 'COMERCIANTE', rotulo: 'Comerciantes' },
  { chave: 'CLIENTE', rotulo: 'Clientes' },
  { chave: 'ADMIN', rotulo: 'Admins' },
];

export default function PainelAdmin({ navigation }) {
  const { user, logout } = useAuth();
  const { exibirAlerta } = useToast();

  const [resumo, setResumo] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  const [busca, setBusca] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('TODOS');

  // Modal de redefinir senha
  const [usuarioSenha, setUsuarioSenha] = useState(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [erroSenha, setErroSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  // Modal de excluir cadastro
  const [usuarioExcluir, setUsuarioExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregarDados = useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true);
    try {
      const [resResumo, resUsuarios] = await Promise.all([
        api.get('/api/admin/resumo'),
        api.get('/api/admin/usuarios'),
      ]);
      setResumo(resResumo.data || null);
      setUsuarios(Array.isArray(resUsuarios.data) ? resUsuarios.data : []);
    } catch (error) {
      const t = traduzirErro(error);
      exibirAlerta(t.titulo, t.mensagem, 'erro');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [exibirAlerta]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const onRefresh = () => {
    setAtualizando(true);
    carregarDados(true);
  };

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return usuarios.filter((u) => {
      if (filtroPerfil !== 'TODOS' && u.perfil !== filtroPerfil) {
        return false;
      }
      if (!termo) return true;
      return (
        String(u.nome || '').toLowerCase().includes(termo) ||
        String(u.email || '').toLowerCase().includes(termo) ||
        String(u.nomeFantasia || '').toLowerCase().includes(termo) ||
        String(u.cnpj || '').includes(termo) ||
        String(u.telefone || '').includes(termo) ||
        String(u.idUsuario || '') === termo
      );
    });
  }, [usuarios, busca, filtroPerfil]);

  function abrirModalSenha(usuario) {
    setUsuarioSenha(usuario);
    setNovaSenha('');
    setMostrarNovaSenha(false);
    setErroSenha('');
  }

  async function confirmarResetSenha() {
    if (!usuarioSenha) return;
    if (novaSenha.length < 8 || novaSenha.length > 72) {
      setErroSenha('A senha deve ter entre 8 e 72 caracteres.');
      return;
    }
    if (!/[A-Za-z]/.test(novaSenha) || !/\d/.test(novaSenha)) {
      setErroSenha('A senha deve conter letras e números.');
      return;
    }

    setSalvandoSenha(true);
    try {
      await api.put(`/api/admin/usuarios/${usuarioSenha.idUsuario}/senha`, {
        novaSenha,
      });
      exibirAlerta(
        'Senha atualizada',
        `A senha de ${usuarioSenha.nome} foi redefinida com sucesso.`,
        'sucesso',
      );
      setUsuarioSenha(null);
      setNovaSenha('');
    } catch (error) {
      const t = traduzirErro(error);
      setErroSenha(t.mensagem);
    } finally {
      setSalvandoSenha(false);
    }
  }

  async function confirmarExclusao() {
    if (!usuarioExcluir) return;
    setExcluindo(true);
    try {
      await api.delete(`/api/admin/usuarios/${usuarioExcluir.idUsuario}`);
      exibirAlerta(
        'Cadastro excluído',
        `O registro de ${usuarioExcluir.nome} foi removido.`,
        'sucesso',
      );
      setUsuarioExcluir(null);
      carregarDados(true);
    } catch (error) {
      const t = traduzirErro(error);
      exibirAlerta(t.titulo, t.mensagem, 'erro');
    } finally {
      setExcluindo(false);
    }
  }

  function corBadgePerfil(perfil) {
    if (perfil === 'COMERCIANTE') return '#D97706';
    if (perfil === 'ADMIN') return cores.primaria;
    return '#2563EB';
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[cores.degradeInicioTopo, cores.degradeInicioBase]}
        style={styles.topo}
      >
        <View style={styles.topoLinha}>
          <View style={{ flex: 1 }}>
            <Text style={styles.saudacao}>Gerenciador local</Text>
            <Text style={styles.titulo}>Painel Administrador</Text>
          </View>

          <TouchableOpacity
            style={styles.botaoTopo}
            onPress={() => navigation.navigate('EditarPerfil')}
            accessibilityLabel="Editar meus dados"
          >
            <Ionicons name="person-outline" size={20} color={cores.textoTitulo} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botaoTopo, styles.botaoSairTopo]}
            onPress={logout}
            accessibilityLabel="Sair"
          >
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.folha}>
        {carregando ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color={cores.primaria} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.conteudo}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={atualizando} onRefresh={onRefresh} />
            }
          >
            {/* Métricas gerais */}
            {resumo && (
              <View style={styles.metricasGrid}>
                <View style={styles.metricaCard}>
                  <Text style={styles.metricaValor}>{resumo.totalUsuarios ?? 0}</Text>
                  <Text style={styles.metricaRotulo}>Usuários</Text>
                </View>
                <View style={styles.metricaCard}>
                  <Text style={styles.metricaValor}>{resumo.totalMercadinhos ?? 0}</Text>
                  <Text style={styles.metricaRotulo}>Mercadinhos</Text>
                </View>
                <View style={styles.metricaCard}>
                  <Text style={styles.metricaValor}>{resumo.totalProdutos ?? 0}</Text>
                  <Text style={styles.metricaRotulo}>Produtos</Text>
                </View>
                <View style={styles.metricaCard}>
                  <Text style={styles.metricaValor}>{resumo.totalPedidos ?? 0}</Text>
                  <Text style={styles.metricaRotulo}>Pedidos</Text>
                </View>
              </View>
            )}

            {/* Barra de busca */}
            <View style={styles.caixaBusca}>
              <Ionicons name="search-outline" size={18} color={cores.icone} />
              <TextInput
                style={styles.inputBusca}
                placeholder="Buscar por nome, e-mail, loja, CNPJ ou ID..."
                placeholderTextColor={cores.textoSecundario}
                value={busca}
                onChangeText={setBusca}
                autoCapitalize="none"
              />
              {busca.length > 0 && (
                <TouchableOpacity onPress={() => setBusca('')}>
                  <Ionicons name="close-circle" size={18} color={cores.icone} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filtros por perfil */}
            <ScrollHorizontal
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtrosLinha}
            >
              {FILTROS.map((f) => {
                const ativo = filtroPerfil === f.chave;
                return (
                  <TouchableOpacity
                    key={f.chave}
                    style={[styles.chipFiltro, ativo && styles.chipFiltroAtivo]}
                    onPress={() => setFiltroPerfil(f.chave)}
                  >
                    <Text
                      style={[
                        styles.chipFiltroTexto,
                        ativo && styles.chipFiltroTextoAtivo,
                      ]}
                    >
                      {f.rotulo}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollHorizontal>

            <Text style={styles.contagemTexto}>
              {usuariosFiltrados.length}{' '}
              {usuariosFiltrados.length === 1 ? 'cadastro encontrado' : 'cadastros encontrados'}
            </Text>

            {usuariosFiltrados.length === 0 ? (
              <Text style={styles.vazioTexto}>
                Nenhum cadastro corresponde ao filtro atual.
              </Text>
            ) : (
              usuariosFiltrados.map((item) => {
                const ehProprioAdmin =
                  user?.email && item.email?.toLowerCase() === user.email.toLowerCase();

                return (
                  <View key={String(item.idUsuario)} style={styles.cardUsuario}>
                    <View style={styles.cardTopo}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.usuarioNome}>
                          #{item.idUsuario} • {item.nome}
                        </Text>
                        <Text style={styles.usuarioEmail}>{item.email}</Text>
                      </View>

                      <View
                        style={[
                          styles.badgePerfil,
                          { backgroundColor: corBadgePerfil(item.perfil) },
                        ]}
                      >
                        <Text style={styles.badgePerfilTexto}>{item.perfil}</Text>
                      </View>
                    </View>

                    <View style={styles.detalhesLista}>
                      {!!item.telefone && (
                        <Text style={styles.detalheTexto}>
                          Telefone: {mascaraTelefone(item.telefone)}
                        </Text>
                      )}
                      {!!item.cidade && (
                        <Text style={styles.detalheTexto}>
                          Local: {item.cidade}
                          {item.uf ? ` - ${item.uf}` : ''}
                        </Text>
                      )}
                      {item.perfil === 'CLIENTE' && (
                        <Text style={styles.detalheTexto}>
                          Pedidos realizados: {item.totalPedidos ?? 0}
                        </Text>
                      )}
                    </View>

                    {/* Bloco da loja quando for comerciante */}
                    {item.perfil === 'COMERCIANTE' && (
                      <View style={styles.caixaLoja}>
                        {item.idMercadinho ? (
                          <>
                            <Text style={styles.lojaTitulo}>
                              Loja #{item.idMercadinho}: {item.nomeFantasia}
                            </Text>
                            {!!item.cnpj && (
                              <Text style={styles.lojaSubtexto}>
                                CNPJ: {mascaraCnpj(item.cnpj)}
                              </Text>
                            )}
                            {!!item.enderecoMercadinho && (
                              <Text style={styles.lojaSubtexto}>
                                {item.enderecoMercadinho}
                              </Text>
                            )}
                            <Text style={styles.lojaMetricas}>
                              {item.totalProdutos ?? 0} produto(s) • {item.totalPedidos ?? 0} pedido(s)
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.lojaAviso}>
                            Comerciante sem mercadinho vinculado.
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Botões de ação */}
                    <View style={styles.acoesLinha}>
                      <TouchableOpacity
                        style={styles.botaoResetar}
                        onPress={() => abrirModalSenha(item)}
                      >
                        <Ionicons name="key-outline" size={16} color={cores.primaria} />
                        <Text style={styles.botaoResetarTexto}>Resetar senha</Text>
                      </TouchableOpacity>

                      {!ehProprioAdmin && (
                        <TouchableOpacity
                          style={styles.botaoExcluir}
                          onPress={() => setUsuarioExcluir(item)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                          <Text style={styles.botaoExcluirTexto}>Excluir</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>

      {/* Modal: Resetar Senha */}
      <Modal
        visible={usuarioSenha !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setUsuarioSenha(null)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCartao}>
            <Text style={styles.modalTitulo}>Redefinir senha</Text>
            <Text style={styles.modalSubtitulo}>
              Usuário: {usuarioSenha?.nome} ({usuarioSenha?.email})
            </Text>

            <View style={styles.campoSenhaBox}>
              <TextInput
                style={styles.campoSenhaInput}
                placeholder="Digite a nova senha (mín. 8 caracteres)"
                placeholderTextColor={cores.icone}
                secureTextEntry={!mostrarNovaSenha}
                autoCapitalize="none"
                value={novaSenha}
                onChangeText={(t) => {
                  setNovaSenha(t);
                  if (erroSenha) setErroSenha('');
                }}
              />
              <TouchableOpacity onPress={() => setMostrarNovaSenha(!mostrarNovaSenha)}>
                <Ionicons
                  name={mostrarNovaSenha ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={cores.icone}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.atalhoSenhaPadrao}
              onPress={() => {
                setNovaSenha('Mudar@123');
                setMostrarNovaSenha(true);
                setErroSenha('');
              }}
            >
              <Ionicons name="flash-outline" size={14} color={cores.primaria} />
              <Text style={styles.atalhoSenhaPadraoTexto}>
                Preencher senha padrão (Mudar@123)
              </Text>
            </TouchableOpacity>

            {!!erroSenha && <Text style={styles.textoErro}>{erroSenha}</Text>}

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={styles.modalBtnCancelar}
                onPress={() => setUsuarioSenha(null)}
                disabled={salvandoSenha}
              >
                <Text style={styles.modalBtnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBtnConfirmar}
                onPress={confirmarResetSenha}
                disabled={salvandoSenha}
              >
                {salvandoSenha ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalBtnConfirmarTexto}>Salvar senha</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Confirmar Exclusão */}
      <Modal
        visible={usuarioExcluir !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setUsuarioExcluir(null)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCartao}>
            <Text style={styles.modalTitulo}>Excluir cadastro?</Text>
            <Text style={styles.modalSubtitulo}>
              Tem certeza que deseja excluir{' '}
              <Text style={{ fontWeight: 'bold' }}>{usuarioExcluir?.nome}</Text> (
              {usuarioExcluir?.email})?
              {usuarioExcluir?.perfil === 'COMERCIANTE'
                ? '\n\nIsso também removerá o mercadinho, produtos e pedidos vinculados a esta conta.'
                : '\n\nEsta ação não pode ser desfeita.'}
            </Text>

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={styles.modalBtnCancelar}
                onPress={() => setUsuarioExcluir(null)}
                disabled={excluindo}
              >
                <Text style={styles.modalBtnCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtnConfirmar, { backgroundColor: cores.erro }]}
                onPress={confirmarExclusao}
                disabled={excluindo}
              >
                {excluindo ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalBtnConfirmarTexto}>Excluir agora</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}