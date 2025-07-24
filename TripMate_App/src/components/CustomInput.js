import { TextInput, StyleSheet } from 'react-native';

const CustomInput = (props) => {
  return (
    <TextInput
      style={styles.input}
      placeholderTextColor="#aaa"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
});

export default CustomInput;
