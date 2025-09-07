import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, BackHandler, Button, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import WebView from "react-native-webview";

export default function AppScreen() {
  const [ip, setIp] = useState('');
  const [porta, setPorta] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [filial, setFilial] = useState('');
  const [url, setUrl] = useState('');
  const [showWebView, setShowWebView] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const refAtualWebview = useRef<WebView>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const savedIp = await AsyncStorage.getItem('server_ip');
        const savedPorta = await AsyncStorage.getItem('server_porta');
        const savedCnpj = await AsyncStorage.getItem('server_cnpj');
        const savedfilial = await AsyncStorage.getItem('server_filial');

        if (savedIp && savedPorta && savedCnpj && savedfilial ) {
          // CORREÇÃO: URL padronizada para http://
          const finalUrl = `http://${ip}:${porta}/sis${filial}${cnpj}/painel/?ambiente=mobile`;
          setUrl(finalUrl);
          Alert.alert("URL carregada", finalUrl);
          setShowWebView(true);
        }
      } catch (error) {
        Alert.alert("Erro", "Falha ao carregar dados do cache.");
      } finally {
        setIsLoading(false); 
      }
    };
    
    initializeApp();
  }, []);

  useEffect(() => {
    const acaoVoltar = () => {
      if (showWebView && refAtualWebview.current) {
        refAtualWebview.current.injectJavaScript(`fechaJanela(); true;`);
        return true;
      }
      return false; 
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", acaoVoltar);
    return () => backHandler.remove();
  }, [showWebView]);

  const handleAcessar = async () => {
    if (!ip || !porta || !cnpj || !filial) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }
    try {
      await AsyncStorage.setItem('server_ip', ip);
      await AsyncStorage.setItem('server_porta', porta);
      await AsyncStorage.setItem('server_cnpj', cnpj);
      await AsyncStorage.setItem('server_filial', filial);
      // CORREÇÃO: URL padronizada para http://
      const finalUrl = `http://${ip}:${porta}/sis${filial}${cnpj}/painel/?ambiente=mobile`;
      setUrl(finalUrl);
      Alert.alert("URL carregada", finalUrl);
      setShowWebView(true);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar os dados.");
    }
  };

  if (isLoading) {
    return ( <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View> );
  }

  if (showWebView) {
    return (
      <SafeAreaView style={styles.containerWebView}>
        <StatusBar barStyle="light-content" />
        <WebView
          ref={refAtualWebview}
          style={{ flex: 1 }}
          source={{ uri: url }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.containerLogin}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Configurar Acesso</Text>
      <TextInput style={styles.input} placeholder="IP do Servidor" value={ip} onChangeText={setIp} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Porta" value={porta} onChangeText={setPorta}  />
      <TextInput style={styles.input} placeholder="CNPJ da Empresa" value={cnpj} onChangeText={setCnpj}  />
      <TextInput style={styles.input} placeholder="Filial" value={filial} onChangeText={setFilial}  />
      <Button title="Acessar" onPress={handleAcessar} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerWebView: {
    flex: 1,
    backgroundColor: '#000',
  },
  containerLogin: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
});
