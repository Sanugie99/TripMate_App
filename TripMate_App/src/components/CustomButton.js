import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ onPress, title, type = 'PRIMARY' }) => {
  return (
    <TouchableOpacity
      style={[styles.button, styles[`button_${type}`]]}
      onPress={onPress}
    >
      <Text style={[styles.text, styles[`text_${type}`]]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  button_PRIMARY: {
    backgroundColor: '#3498db',
  },
  button_SECONDARY: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  text_PRIMARY: {
    color: '#fff',
  },
  text_SECONDARY: {
    color: '#3498db',
  },
});

export default CustomButton;
