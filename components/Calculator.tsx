// components/Calculator.tsx
import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Delete } from 'lucide-react-native';

const Calculator = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [firstValue, setFirstValue] = useState('');
  const [waitingForSecondValue, setWaitingForSecondValue] = useState(false);
  const router = useRouter();
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);

  const handleNumberInput = (num: string) => {
    if (displayValue === '0' || waitingForSecondValue) {
      setDisplayValue(num);
      setWaitingForSecondValue(false);
    } else {
      setDisplayValue(displayValue + num);
    }
  };

  const handleOperatorInput = (op: string) => {
    setOperator(op);
    setFirstValue(displayValue);
    setWaitingForSecondValue(true);
    setSelectedOperator(op);
  };

  const handleEqual = () => {
    if (operator && firstValue) {
      const num1 = parseFloat(firstValue);
      const num2 = parseFloat(displayValue);
      let result = 0;

      switch (operator) {
        case '+':
          result = num1 + num2;
          break;
        case '-':
          result = num1 - num2;
          break;
        case '*':
          result = num1 * num2;
          break;
        case '/':
          if (num2 === 0) {
            setDisplayValue('Error');
            return;
          }
          result = num1 / num2;
          break;
        default:
          return;
      }

      setDisplayValue(result.toString());
      setOperator(null);
      setFirstValue('');
      setWaitingForSecondValue(false);
      setSelectedOperator(null);
    }
  };

  const handleClear = () => {
    setDisplayValue('0');
    setOperator(null);
    setFirstValue('');
    setWaitingForSecondValue(false);
    setSelectedOperator(null);
  };

  const handleBackspace = () => {
    setDisplayValue(displayValue.slice(0, -1) || '0');
  };

  const handlePercentage = () => {
    setDisplayValue((parseFloat(displayValue) / 100).toString());
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.display}>{displayValue}</Text>
      <View style={styles.buttons}>
        <View style={styles.row}>
          <Button onPress={handleClear} text="AC" color="#a5a5a5" textColor="#000" />
          <Button onPress={handleBackspace} text={<Delete size={24} color="#000" />} color="#a5a5a5" textColor="#000" />
          <Button onPress={handlePercentage} text="%" color="#a5a5a5" textColor="#000" />
          <Button 
            onPress={() => handleOperatorInput('/')} 
            text="÷" 
            color="#ff9f0a"
            isHighlighted={selectedOperator === '/'}
          />
        </View>
        <View style={styles.row}>
          <Button onPress={() => handleNumberInput('7')} text="7" color="#333" />
          <Button onPress={() => handleNumberInput('8')} text="8" color="#333" />
          <Button onPress={() => handleNumberInput('9')} text="9" color="#333" />
          <Button 
            onPress={() => handleOperatorInput('*')} 
            text="×" 
            color="#ff9f0a"
            isHighlighted={selectedOperator === '*'}
          />
        </View>
        <View style={styles.row}>
          <Button onPress={() => handleNumberInput('4')} text="4" color="#333" />
          <Button onPress={() => handleNumberInput('5')} text="5" color="#333" />
          <Button onPress={() => handleNumberInput('6')} text="6" color="#333" />
          <Button 
            onPress={() => handleOperatorInput('-')} 
            text="-" 
            color="#ff9f0a"
            isHighlighted={selectedOperator === '-'}
          />
        </View>
        <View style={styles.row}>
          <Button onPress={() => handleNumberInput('1')} text="1" color="#333" />
          <Button onPress={() => handleNumberInput('2')} text="2" color="#333" />
          <Button onPress={() => handleNumberInput('3')} text="3" color="#333" />
          <Button 
            onPress={() => handleOperatorInput('+')} 
            text="+" 
            color="#ff9f0a"
            isHighlighted={selectedOperator === '+'}
          />
        </View>
        <View style={styles.row}>
          <Button onPress={() => handleNumberInput('0')} text="0" color="#333" wide={true} />
          <Button onPress={() => handleNumberInput('.')} text="." color="#333" />
          <Button onPress={handleEqual} text="=" color="#ff9f0a" />
        </View>
      </View>
    </SafeAreaView>
  );
};

interface ButtonProps {
  onPress: () => void;
  text: string | JSX.Element;
  color: string;
  textColor?: string;
  wide?: boolean;
  isHighlighted?: boolean;
}

const Button = ({ onPress, text, color, textColor = '#fff', wide, isHighlighted }: ButtonProps) => (
  <TouchableOpacity
    style={[
      styles.button, 
      { backgroundColor: color, flex: wide ? 2 : 1 },
      isHighlighted && styles.buttonHighlighted
    ]}
    onPress={onPress}
  >
    <Text style={[styles.buttonText, { color: textColor }]}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  display: {
    fontSize: 80,
    color: '#fff',
    textAlign: 'right',
    padding: 20,
    fontWeight: '200',
    flex: 1,
  },
  buttons: {
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 50,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 30,
  },
  buttonHighlighted: {
    backgroundColor: '#7F5923',
  },
});

export default Calculator;
