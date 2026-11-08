import { StyleSheet } from 'react-native';
import { cores } from '../../../theme';

export const styles = StyleSheet.create({
  // Barra inferior usada em celulares.
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingVertical: 8,
    paddingBottom: 12,
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  itemsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },

  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 2,
  },

  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: cores.textoInativo,
  },

  tabLabelActive: {
    color: cores.textoAtivo,
    fontWeight: 'bold',
  },

  // Sidebar para telas grandes.
  containerDesktop: {
  width: 252,
  minWidth: 252,
  maxWidth: 252,

  // Impede a barra de desaparecer ou ocupar a tela toda
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: 252,

  height: '100%',
  alignSelf: 'stretch',

  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',

  backgroundColor: '#FFFFFF',

  paddingHorizontal: 16,
  paddingTop: 28,
  paddingBottom: 22,

  borderTopWidth: 0,
  borderRightWidth: 1,
  borderRightColor: '#ECEDEF',

  elevation: 0,
  shadowOpacity: 0,
  shadowRadius: 0,
},

  brandArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    paddingBottom: 30,
  },

  brandIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandTextArea: {
    flex: 1,
    gap: 2,
  },

  brandName: {
    color: cores.textoTitulo,
    fontSize: 18,
    fontWeight: '800',
  },

  brandSubtitle: {
    color: cores.textoSecundario,
    fontSize: 11,
  },

  itemsContainerDesktop: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: 7,
  },

  tabItemDesktop: {
    flex: 0,
    width: '100%',
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },

  tabItemDesktopActive: {
    backgroundColor: '#FFF2D0',
  },

  tabLabelDesktop: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },

  tabLabelDesktopActive: {
    color: cores.primaria,
    fontWeight: '800',
  },

  // Selo de pedidos pendentes (menu do comerciante)
  iconeArea: {
    position: 'relative',
  },

  selo: {
    position: 'absolute',
    top: -6,
    right: -12,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: cores.primaria,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  seloDesktop: {
    marginLeft: 'auto',
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 7,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },

  seloTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  sidebarFooter: {
    marginTop: 'auto',
    paddingTop: 18,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 4,
  },

  sidebarFooterTitle: {
    color: cores.textoTitulo,
    fontSize: 12,
    fontWeight: '700',
  },

  sidebarFooterText: {
    color: cores.textoSecundario,
    fontSize: 11,
    lineHeight: 16,
  },
});