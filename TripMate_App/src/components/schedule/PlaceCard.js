
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const PlaceCard = ({ item, onPlaceClick, onDelete, showDeleteButton = false }) => {
  const [imageError, setImageError] = useState(false);
  
  // 이미지 URL 처리 로직 개선
  const getImageUrl = () => {
    console.log('PlaceCard - item data:', {
      name: item.name,
      photoUrl: item.photoUrl,
      imageUrl: item.imageUrl
    });
    
    if (item.photoUrl && item.photoUrl.trim() !== '' && item.photoUrl !== 'null') {
      return item.photoUrl;
    }
    if (item.imageUrl && item.imageUrl.trim() !== '' && item.imageUrl !== 'null') {
      return item.imageUrl;
    }
    // 더 안정적인 기본 이미지 사용
    return 'https://picsum.photos/150/150';
  };

  const handleImageError = () => {
    console.log('Image load error for:', item.name, 'URL:', getImageUrl());
    setImageError(true);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardTouchable} onPress={() => onPlaceClick(item)}>
        <Image
          style={styles.placeImage}
          source={{ uri: imageError ? 'https://picsum.photos/150/150' : getImageUrl() }}
          onError={handleImageError}
          defaultSource={{ uri: 'https://picsum.photos/150/150' }}
        />
        <View style={styles.cardContent}>
          <Text style={styles.placeName}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.address} numberOfLines={2}>{item.address}</Text>
        </View>
      </TouchableOpacity>
      
      {showDeleteButton && (
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => onDelete && onDelete(item)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
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
    position: 'relative',
  },
  cardTouchable: {
    flexDirection: 'row',
    flex: 1,
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
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});

export default PlaceCard;
