import React from 'react';
import { View, Text, TextInput } from 'react-native';

const Input = ({ label, error, className = '', inputClassName = '', ...props }) => {
  return (
    <View className={`mb-4 ${className}`}>
      {label && <Text className="mb-1 font-medium text-gray-700">{label}</Text>}
      <TextInput
        className={`
          rounded-lg
          border
          border-gray-300
          bg-white
          px-4
          py-3
          text-gray-900
          ${error ? 'border-red-500' : 'focus:border-purple-500'}
          ${inputClassName}
        `}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
    </View>
  );
};

export default Input;
