import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const Card = ({ children, title, onPress, className = '', contentClassName = '', ...props }) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      onPress={onPress}
      className={`
        overflow-hidden
        rounded-xl
        border
        border-gray-100
        bg-white
        shadow-md
        ${className}
      `}
      {...props}>
      {title && (
        <View className="border-b border-gray-100 bg-gray-50 px-4 py-3">
          <Text className="text-lg font-bold text-gray-800">{title}</Text>
        </View>
      )}
      <View className={`p-4 ${contentClassName}`}>{children}</View>
    </CardComponent>
  );
};

export default Card;
