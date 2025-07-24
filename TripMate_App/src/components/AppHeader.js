
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const AppHeader = ({ title }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginTop:20,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
});

export default AppHeader;
