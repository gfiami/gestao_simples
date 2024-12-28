import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const saveProductsToStorage = async (products) => {
  try {
    await AsyncStorage.setItem('products', JSON.stringify(products));
  } catch (error) {
    console.error("Erro ao salvar no AsyncStorage: ", error);
  }
};

const loadProductsFromStorage = async () => {
  try {
    const products = await AsyncStorage.getItem('products');
    return products != null ? JSON.parse(products) : [];
  } catch (error) {
    console.error("Erro ao carregar do AsyncStorage: ", error);
    return [];
  }
};

export default function App() {
  const [productName, setProductName] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null); 

  useEffect(() => {
    const loadProducts = async () => {
      const storedProducts = await loadProductsFromStorage();
      storedProducts.sort((a, b) => a.name.localeCompare(b.name));  
      setProducts(storedProducts);
    };

    loadProducts();
  }, []);

  const addProduct = () => {
    if (!productName || !productQuantity) {
      Alert.alert('Erro', 'Por favor, insira o nome do produto e a quantidade.');
      return;
    }

    const newProduct = { 
      id: Date.now().toString(), 
      name: productName, 
      quantity: parseInt(productQuantity) 
    };
    
    const updatedProducts = [...products, newProduct];
    updatedProducts.sort((a, b) => a.name.localeCompare(b.name)); 
    setProducts(updatedProducts);
    setProductName('');
    setProductQuantity('');
    saveProductsToStorage(updatedProducts);
  };

  const removeProduct = (id) => {
    Alert.alert(
      'Confirmar Remoção',
      'Você tem certeza que deseja remover este produto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            const updatedProducts = products.filter(product => product.id !== id);
            updatedProducts.sort((a, b) => a.name.localeCompare(b.name)); 
            setProducts(updatedProducts);
            saveProductsToStorage(updatedProducts);
          },
        },
      ]
    );
  };

  const editProduct = (product) => {
    setProductName(product.name);
    setProductQuantity(product.quantity.toString());
    setEditingProduct(product);
  };

  const saveEditedProduct = () => {
    if (!productName || !productQuantity) {
      Alert.alert('Erro', 'Por favor, insira o nome do produto e a quantidade.');
      return;
    }

    const updatedProducts = products.map(product =>
      product.id === editingProduct.id
        ? { ...product, name: productName, quantity: parseInt(productQuantity) }
        : product
    );
    
    updatedProducts.sort((a, b) => a.name.localeCompare(b.name));  
    setProducts(updatedProducts);
    setProductName('');
    setProductQuantity('');
    setEditingProduct(null);
    saveProductsToStorage(updatedProducts);
  };

  const increaseQuantity = (id) => {
    const updatedProducts = products.map(product =>
      product.id === id
        ? { ...product, quantity: product.quantity + 1 }
        : product
    );
    updatedProducts.sort((a, b) => a.name.localeCompare(b.name)); 
    setProducts(updatedProducts);
    saveProductsToStorage(updatedProducts);
  };

  const decreaseQuantity = (id) => {
    const updatedProducts = products.map(product =>
      product.id === id && product.quantity > 0
        ? { ...product, quantity: product.quantity - 1 }
        : product
    );
    updatedProducts.sort((a, b) => a.name.localeCompare(b.name));  
    setProducts(updatedProducts);
    saveProductsToStorage(updatedProducts);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestão de Estoque</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do produto"
        value={productName}
        onChangeText={setProductName}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantidade"
        value={productQuantity}
        keyboardType="numeric"
        onChangeText={setProductQuantity}
      />

      {editingProduct ? (
        <Button title="Salvar Edição" onPress={saveEditedProduct} />
      ) : (
        <Button title="Adicionar Produto" onPress={addProduct} />
      )}

      <FlatList
        data={products}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Text style={styles.productText}>
              {item.name} - {item.quantity}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => increaseQuantity(item.id)}>
                <Text style={styles.quantityButton}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => decreaseQuantity(item.id)}>
                <Text style={styles.quantityButton}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => editProduct(item)}>
                <Text style={styles.editButton}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeProduct(item.id)}>
                <Text style={styles.removeButton}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  productText: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    fontSize: 20,
    marginHorizontal: 10,
    color: '#007bff',
  },
  editButton: {
    fontSize: 16,
    color: '#007bff',
    marginHorizontal: 10,
  },
  removeButton: {
    fontSize: 16,
    color: 'red',
  },
});
