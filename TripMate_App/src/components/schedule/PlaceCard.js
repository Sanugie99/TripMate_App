
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const PlaceCard = ({ item, onPlaceClick }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPlaceClick(item)}>
      <Image
        style={styles.placeImage}
        source={{ uri: item.photoUrl || 'https://via.placeholder.com/150' }}
        onError={(e) => e.target.source = { uri: 'https://via.placeholder.com/150' }}
      />
      <View style={styles.cardContent}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.address} numberOfLines={2}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    height: 110,
  },
  placeImage: {
    width: 100,
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  cardContent: {
    padding: 10,
    flex: 1,
    justifyContent: 'center',
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: '#888',
  },
});

export default PlaceCard;
