// components/Calculator.tsx
import React, { JSX, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions, // Added for screen width
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRouter } from 'expo-router'; // Removed as back button is removed
import { Delete } from 'lucide-react-native'; // Kept for backspace

const { width: screenWidth } = Dimensions.get('window');
const calculatorWidth = screenWidth * 0.9; // Calculator will take 90% of screen width
const buttonMargin = 5;
const buttonSize = (calculatorWidth / 4) - (buttonMargin * 2); // Calculate button size based on new width

const Calculator = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [firstValue, setFirstValue] = useState('');
  const [waitingForSecondValue, setWaitingForSecondValue] = useState(false);
  // const router = useRouter(); // Removed
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);

  const handleNumberInput = (num: string) => {
    if (displayValue.length >= 9 && !waitingForSecondValue) return; // Limit display length before new number

    if (waitingForSecondValue) {
      setDisplayValue(num);
      setWaitingForSecondValue(false);
    } else {
      setDisplayValue(displayValue === '0' ? num : displayValue + num);
    }
  };

  const handleOperatorInput = (op: string) => {
    if (operator && !waitingForSecondValue) { // If an operator is already set and we are not waiting for a second value
        handleEqual(); // Calculate the current expression first
        setFirstValue(displayValue); // Then set the new first value
    } else {
        setFirstValue(displayValue);
    }
    setOperator(op);
    setWaitingForSecondValue(true);
    setSelectedOperator(op);
  };

  const handleEqual = () => {
    if (operator && firstValue && displayValue) { // ensure displayValue is also present
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
            // Reset state after error
            setOperator(null);
            setFirstValue('');
            setWaitingForSecondValue(false);
            setSelectedOperator(null);
            return;
          }
          result = num1 / num2;
          break;
        default:
          return;
      }
      // Format result: limit decimals, handle large numbers potentially with toExponential
      let resultString = parseFloat(result.toFixed(7)).toString(); // Limit to 7 decimal places and remove trailing zeros
      if (resultString.length > 9 && Math.abs(result) > 1e-7) { // Check length again and ensure not too small
          resultString = result.toExponential(2); // Use exponential for very large/small numbers
      }

      setDisplayValue(resultString);
      setOperator(null);
      // setFirstValue(resultString); // Keep result as firstValue for chained operations
      setWaitingForSecondValue(false); // Set to false, so next number input starts a new displayValue
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
    if (displayValue === 'Error' || waitingForSecondValue) return; // Don't backspace on error or when operator is just pressed
    setDisplayValue(displayValue.slice(0, -1) || '0');
  };

  const handlePercentage = () => {
    if (displayValue === 'Error') return;
    let currentValue = parseFloat(displayValue);
    if (operator && firstValue) { // Calculate percentage based on the first value if an operation is pending
        const firstNum = parseFloat(firstValue);
        currentValue = (firstNum * currentValue) / 100;
    } else {
        currentValue = currentValue / 100;
    }
    setDisplayValue(parseFloat(currentValue.toFixed(7)).toString());
  };

  const handleDecimal = () => {
    if (waitingForSecondValue) { // If an operator was just pressed, start new number with "0."
        setDisplayValue('0.');
        setWaitingForSecondValue(false);
        return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };


  return (
    // Using edges to handle safe area, especially for the bottom
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="light" />
      {/* Header with back button removed */}
      <View style={styles.displayContainer}>
        <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit>
          {displayValue}
        </Text>
      </View>
      <View style={styles.buttons}>
        <View style={styles.row}>
          <Button onPress={handleClear} text={displayValue === '0' && !firstValue ? "AC" : "C"} color="#a5a5a5" textColor="#000" />
          <Button onPress={handleBackspace} text={<Delete size={buttonSize * 0.4} color="#000" />} color="#a5a5a5" textColor="#000" />
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
          <Button onPress={() => handleNumberInput('0')} text="0" color="#333" wide />
          <Button onPress={handleDecimal} text="." color="#333" />
          <Button onPress={handleEqual} text="=" color="#ff9f0a" />
        </View>
        {/* Empty row for spacing can be achieved by adjusting paddingBottom in styles.buttons or adding a View */}
        {/* Or directly adjusting SafeAreaView edges like `edges={['bottom']}` if that's preferred over an empty visual row */}
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
      { backgroundColor: isHighlighted ? '#D98F07' : color }, // Darker highlight for orange buttons
      wide ? styles.buttonWide : { width: buttonSize, height: buttonSize },
      (text === "÷" || text === "×" || text === "-" || text === "+" || text === "=") && isHighlighted && styles.operatorHighlighted,

    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.buttonText, { color: textColor, fontSize: buttonSize * 0.45 }]}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center', // Center the calculator content
    justifyContent: 'flex-end', // Align content (display & buttons) to the bottom
  },
  // Removed header style as back button is gone
  displayContainer: { // New container to manage display width and alignment
    width: calculatorWidth,
    marginBottom: 10, // Space between display and buttons
    paddingHorizontal: buttonMargin * 2, // Consistent padding with buttons
    flex: 1, // Allow display to take remaining space
    justifyContent: 'flex-end', // Align text to bottom of this container
  },
  display: {
    fontSize: 80, // Max font size
    color: '#fff',
    textAlign: 'right',
    fontWeight: '200', // iOS calculator uses a light font weight
    // No fixed height, adjustsFontSizeToFit will handle it
  },
  buttons: {
    width: calculatorWidth, // Set fixed width for the buttons container
    paddingBottom: Platform.OS === 'ios' ? 20 : 20, // Added padding for bottom spacing (adjust as needed)
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Use space-between for even spacing within the fixed width
    marginBottom: buttonMargin * 2, // Space between rows
  },
  button: {
    // width and height are now dynamic based on buttonSize
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: buttonSize / 2, // Make it circular
    // marginHorizontal is removed, space-between in row handles it
  },
  buttonWide: {
    width: (buttonSize * 2) + (buttonMargin * 2), // 0 button takes space of 2 buttons + one margin
    height: buttonSize,
    borderRadius: buttonSize / 2, // Keep circular ends if desired, or adjust
    alignItems: 'flex-start', // Align text to the left for wide button
    paddingLeft: buttonSize * 0.6, // Indent text for wide button
  },
  buttonText: {
    // fontSize is now dynamic
    color: '#fff', // Default color, overridden by props if needed
  },
  buttonHighlighted: { // General highlight, maybe for non-operator buttons if needed later
     opacity: 0.8,
  },
  operatorHighlighted: { // Specific style for orange operator highlight (iOS style)
    backgroundColor: '#FFC880', // Lighter orange for highlighted state
    // color: '#ff9f0a' // Text color changes to the original background (optional)
  }
});

export default Calculator;