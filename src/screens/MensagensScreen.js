import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Alert, Linking, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { useTheme } from '../theme/ThemeContext';
import {
  lerConfig, salvarConfig, listarModelos, salvarModelo, excluirModelo,
  listarContatosMsg, adicionarContatosMsg, normalizarTelefone, marcarEnviado,
  alternarSelecionado, definirSelecionados, limparEnvios, removerContatoMsg, apagarListaMsg,
} from '../db/mensagens';

function semAcento(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// "IMPB - maria SILVA" -> "Maria Silva" (tira a sigla e pontuação, capitaliza)
function limparNome(nome, sigla) {
  const re = new RegExp(escapeRegex(sigla), 'gi');
  const n = nome.replace(re, ' ').replace(/[-–_.,()[\]|/]/g, ' ').replace(/\s+/g, ' ').trim() || nome;
  return n.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

export default function MensagensScreen() {
  const { colors, fonts, radius } = useTheme();
  const insets = useSafeAreaInsets();

  const [texto, setTexto] = useState('');
  const [nomeModelo, setNomeModelo] = useState('');
  const [modeloId, setModeloId] = useState(null);
  const [modelos, setModelos] = useState([]);
  const [sigla, setSigla] = useState('');
  const [colar, setColar] = useState('');
  const [contatos, setContatos] = useState([]);
  const [busca, setBusca] = useState('');
  const carregouRef = useRef(false);

  const recarregarContatos = useCallback(() => listarContatosMsg().then(setContatos), []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setModelos(await listarModelos());
        await recarregarContatos();
        if (!carregouRef.current) {
          carregouRef.current = true;
          setTexto(await lerConfig('msg_rascunho'));
          setSigla(await lerConfig('msg_sigla'));
        }
      })();
    }, [recarregarContatos])
  );

  const mudarTexto = (t) => { setTexto(t); salvarConfig('msg_rascunho', t); };

  const escolherModelo = (m) => {
    setModeloId(m.id); setNomeModelo(m.nome); mudarTexto(m.texto);
  };
  const guardarModelo = async () => {
    if (!nomeModelo.trim()) { Alert.alert('Dê um nome ao modelo.'); return; }
    if (!texto.trim()) { Alert.alert('Escreva a mensagem primeiro.'); return; }
    const id = await salvarModelo(nomeModelo, texto);
    setModeloId(id);
    setModelos(await listarModelos());
  };
  const apagarModelo = () => {
    if (modeloId == null) { Alert.alert('Escolha um modelo para excluir.'); return; }
    Alert.alert('Excluir modelo', 'Excluir este modelo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        await excluirModelo(modeloId); setModeloId(null); setNomeModelo('');
        setModelos(await listarModelos());
      } },
    ]);
  };

  const buscarNaAgenda = async () => {
    const s = sigla.trim();
    if (!s) { Alert.alert('Digite a sigla da igreja.'); return; }
    await salvarConfig('msg_sigla', s);
    const perm = await Contacts.requestPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Sem permissão', 'Autorize o acesso aos contatos e toque em Buscar de novo.');
      return;
    }
    try {
      const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers], name: s });
      const achados = [];
      for (const c of data) {
        // O filtro do sistema pode ser mais frouxo; confere a sigla no nome.
        if (!semAcento(c.name || '').includes(semAcento(s))) continue;
        for (const ph of c.phoneNumbers || []) {
          const tel = normalizarTelefone(ph.number);
          if (tel) achados.push({ nome: limparNome(c.name || '', s), telefone: tel });
        }
      }
      const novos = await adicionarContatosMsg(achados);
      await recarregarContatos();
      Alert.alert('Busca concluída', `${achados.length} contatos com "${s}" encontrados; ${novos} adicionados à lista.`);
    } catch (e) {
      Alert.alert('Não foi possível ler os contatos', String(e?.message || e));
    }
  };

  const adicionarColados = async () => {
    const lista = [];
    colar.split('\n').forEach((linha) => {
      const p = linha.split(/[;,\t]/);
      if (p.length < 2) return;
      const nome = p[0].trim();
      const tel = normalizarTelefone(p[1]);
      if (nome && tel) lista.push({ nome, telefone: tel });
    });
    await adicionarContatosMsg(lista);
    setColar('');
    recarregarContatos();
  };

  const pendentes = contatos.filter((c) => c.selecionado && !c.enviado);
  const selecionados = contatos.filter((c) => c.selecionado).length;

  const visiveis = useMemo(() => {
    const q = semAcento(busca.trim());
    if (!q) return contatos;
    const qNum = q.replace(/\D/g, '');
    return contatos.filter((c) => semAcento(c.nome).includes(q) || (qNum && c.telefone.includes(qNum)));
  }, [contatos, busca]);

  const enviar = async (c) => {
    if (!texto.trim()) { Alert.alert('Escreva a mensagem primeiro.'); return; }
    const msg = texto.replace(/\{nome\}/gi, c.nome.split(' ')[0]);
    await marcarEnviado(c.id);
    recarregarContatos();
    try {
      await Linking.openURL(`https://wa.me/${c.telefone}?text=${encodeURIComponent(msg)}`);
    } catch (e) {
      Alert.alert('Não foi possível abrir o WhatsApp', String(e?.message || e));
    }
  };
  const proximo = () => {
    if (pendentes.length === 0) { Alert.alert('Não há contatos pendentes.'); return; }
    enviar(pendentes[0]);
  };
  const marcarVisiveis = async (valor) => {
    await definirSelecionados(visiveis.map((c) => c.id), valor);
    recarregarContatos();
  };
  const confirmar = (titulo, msg, acao) =>
    Alert.alert(titulo, msg, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Confirmar', style: 'destructive', onPress: acao }]);

  const status = contatos.length
    ? `Pendentes: ${pendentes.length} · selecionados: ${selecionados} de ${contatos.length}` +
      (pendentes.length ? ` · próximo: ${pendentes[0].nome}` : '')
    : '';

  const cabecalho = (
    <View>
      <Text style={[styles.titulo, { color: colors.textPrimary, fontFamily: fonts.titleBold }]}>Mensagens</Text>

      <Secao n="1" texto="Mensagem" colors={colors} fonts={fonts} />
      {modelos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {modelos.map((m) => (
            <Chip key={m.id} texto={m.nome} ativo={m.id === modeloId} onPress={() => escolherModelo(m)} colors={colors} fonts={fonts} />
          ))}
        </ScrollView>
      ) : null}
      <Input value={texto} onChangeText={mudarTexto} multiline placeholder="Olá, {nome}! Que Deus te abençoe..." colors={colors} fonts={fonts} style={{ minHeight: 100, textAlignVertical: 'top' }} />
      <Nota colors={colors} fonts={fonts}>Use {'{nome}'} onde quiser o primeiro nome da pessoa.</Nota>
      <Input value={nomeModelo} onChangeText={setNomeModelo} placeholder="Nome do modelo (ex.: Aviso de culto)" colors={colors} fonts={fonts} />
      <View style={styles.linha}>
        <Botao texto="Salvar modelo" onPress={guardarModelo} colors={colors} fonts={fonts} radius={radius} />
        <Botao texto="Excluir modelo" onPress={apagarModelo} secundario colors={colors} fonts={fonts} radius={radius} />
      </View>

      <Secao n="2" texto="Contatos" colors={colors} fonts={fonts} />
      <Nota colors={colors} fonts={fonts}>Buscar na agenda do celular os contatos que têm esta sigla no nome:</Nota>
      <Input value={sigla} onChangeText={setSigla} placeholder="Ex.: IMPB" autoCapitalize="characters" colors={colors} fonts={fonts} />
      <Botao texto="Buscar contatos da agenda" onPress={buscarNaAgenda} grande colors={colors} fonts={fonts} radius={radius} />
      <Nota colors={colors} fonts={fonts}>Ou cole manualmente:</Nota>
      <Input value={colar} onChangeText={setColar} multiline placeholder={'Um por linha. Ex.: Maria Silva;42999998888'} colors={colors} fonts={fonts} style={{ minHeight: 70, textAlignVertical: 'top' }} />
      <View style={styles.linha}>
        <Botao texto="Adicionar à lista" onPress={adicionarColados} colors={colors} fonts={fonts} radius={radius} />
        <Botao texto="Limpar envios" onPress={() => limparEnvios().then(recarregarContatos)} secundario colors={colors} fonts={fonts} radius={radius} />
        <Botao texto="Apagar lista" onPress={() => confirmar('Apagar lista', 'Apagar toda a lista?', () => apagarListaMsg().then(recarregarContatos))} secundario colors={colors} fonts={fonts} radius={radius} />
      </View>

      <Secao n="3" texto="Enviar pelo WhatsApp" colors={colors} fonts={fonts} />
      <Botao
        texto={pendentes.length ? `Próximo: ${pendentes[0].nome.split(' ')[0]}` : 'Nenhum pendente'}
        onPress={proximo} grande colors={colors} fonts={fonts} radius={radius}
      />
      {status ? <Nota colors={colors} fonts={fonts}>{status}</Nota> : null}
      <Input value={busca} onChangeText={setBusca} placeholder="Buscar na lista (nome ou número)" colors={colors} fonts={fonts} />
      <View style={styles.linha}>
        <Botao texto="Marcar todos" onPress={() => marcarVisiveis(true)} secundario colors={colors} fonts={fonts} radius={radius} />
        <Botao texto="Desmarcar todos" onPress={() => marcarVisiveis(false)} secundario colors={colors} fonts={fonts} radius={radius} />
      </View>
      <Nota colors={colors} fonts={fonts}>Com a busca ativa, marcar/desmarcar vale só para os contatos exibidos.</Nota>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={visiveis}
        keyExtractor={(c) => String(c.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 12, paddingBottom: 30 }}
        ListHeaderComponent={cabecalho}
        ListEmptyComponent={<Nota colors={colors} fonts={fonts}>Nenhum contato para mostrar.</Nota>}
        renderItem={({ item: c }) => (
          <View style={[styles.cartao, { backgroundColor: colors.card, borderRadius: radius.md, opacity: c.enviado ? 0.5 : 1 }]}>
            <Pressable onPress={() => alternarSelecionado(c.id).then(recarregarContatos)} hitSlop={8}>
              <Ionicons name={c.selecionado ? 'checkbox' : 'square-outline'} size={24} color={colors.primary} />
            </Pressable>
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={{ color: colors.textPrimary, fontFamily: fonts.bodyMedium, fontSize: 15 }}>{c.nome}</Text>
              <Text style={{ color: colors.textSecondary, fontFamily: fonts.body, fontSize: 12 }}>
                +{c.telefone}{c.enviado ? ' · enviado' : ''}
              </Text>
            </View>
            <Pressable onPress={() => enviar(c)} style={[styles.btnEnviar, { backgroundColor: colors.primary }]}>
              <Text style={{ color: colors.onPrimary, fontFamily: fonts.bodyMedium, fontSize: 13 }}>Enviar</Text>
            </Pressable>
            <Pressable onPress={() => removerContatoMsg(c.id).then(recarregarContatos)} hitSlop={8} style={{ marginLeft: 10 }}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

function Secao({ n, texto, colors, fonts }) {
  return <Text style={[styles.secao, { color: colors.textPrimary, fontFamily: fonts.title }]}>{n}. {texto}</Text>;
}
function Nota({ children, colors, fonts }) {
  return <Text style={{ color: colors.textSecondary, fontFamily: fonts.body, fontSize: 12.5, marginVertical: 4 }}>{children}</Text>;
}
function Input({ colors, fonts, style, ...props }) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.textMuted}
      style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, fontFamily: fonts.body, backgroundColor: colors.inputBackground }, style]}
    />
  );
}
function Botao({ texto, onPress, secundario, grande, colors, fonts, radius }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.botao, grande && styles.botaoGrande,
        { borderRadius: radius.md },
        secundario
          ? { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }
          : { backgroundColor: colors.primary },
      ]}
    >
      <Text style={{ color: secundario ? colors.textPrimary : colors.onPrimary, fontFamily: fonts.bodyMedium, fontSize: grande ? 16 : 14 }}>{texto}</Text>
    </Pressable>
  );
}
function Chip({ texto, ativo, onPress, colors, fonts }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, { borderColor: colors.border, backgroundColor: ativo ? colors.primary : colors.card }]}>
      <Text style={{ color: ativo ? colors.onPrimary : colors.textPrimary, fontFamily: fonts.body, fontSize: 13 }}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 28, marginBottom: 4 },
  secao: { fontSize: 19, marginTop: 20, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, marginVertical: 4 },
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 6 },
  botao: { paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  botaoGrande: { alignSelf: 'stretch', paddingVertical: 14, marginVertical: 6 },
  chip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  cartao: { flexDirection: 'row', alignItems: 'center', padding: 12, marginTop: 8 },
  btnEnviar: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
});
