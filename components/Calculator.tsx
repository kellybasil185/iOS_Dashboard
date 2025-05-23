// components/Calculator.tsx
import React, { useState, useEffect, JSX } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Delete } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');
const calculatorWidth = screenWidth * 0.9;
const buttonMargin = 5;
const buttonSize = (calculatorWidth / 4) - (buttonMargin * 2);

// Helper function to format numbers with commas
function formatNumberWithCommas(numberString: string): string {
  if (!numberString || numberString === 'Error' || numberString.toLowerCase().includes('e')) {
    return numberString;
  }
  const parts = numberString.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';
  const sign = integerPart.startsWith('-') ? '-' : '';
  const numIntegerPart = sign ? integerPart.substring(1) : integerPart;
  const formattedIntegerPart = numIntegerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return sign + formattedIntegerPart + decimalPart;
}

// Custom hook for calculating display font size
function useDisplayFontSize(value: string) {
  const { width } = useWindowDimensions();
  const [fontSize, setFontSize] = useState(80);

  useEffect(() => {
    const baseSize = 70;
    const minSize = 30;
    const maxLength = 6; 
    const currentLength = value.length;
    
    if (currentLength > maxLength) {
      const scale = Math.max(maxLength / (currentLength * 1.2), 0.3);
      setFontSize(Math.max(baseSize * scale, minSize));
    } else {
      setFontSize(baseSize);
    }
  }, [value, width]);

  return fontSize;
}

const Calculator = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [firstValue, setFirstValue] = useState('');
  const [waitingForSecondValue, setWaitingForSecondValue] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  
  // New state for progressive equals
  const [repeatOperand, setRepeatOperand] = useState<string | null>(null);
  const [repeatOperator, setRepeatOperator] = useState<string | null>(null);

  const fontSize = useDisplayFontSize(formatNumberWithCommas(displayValue)); // Pass formatted for length check if needed

  const handleNumberInput = (num: string) => {
    const maxDigits = 12;

    if (waitingForSecondValue) {
        setDisplayValue(num);
        setWaitingForSecondValue(false);
        // When entering the second number, a progressive equals chain isn't active yet,
        // so no need to clear repeatOperand/repeatOperator here.
    } else {
        // If an operator is NOT active AND a repeat operation was possible (repeatOperator is set),
        // it means a result was on display. A new number input should overwrite it and clear repeat state.
        if (!operator && repeatOperator) {
            setDisplayValue(num);
            setFirstValue(''); // New number sequence is starting
            setRepeatOperand(null);
            setRepeatOperator(null);
        } else if (displayValue === '0' && num === '0' && !displayValue.includes('.')) {
            // Prevent "00" if not "0."
            return;
        } else if (displayValue === '0' && num !== '.') {
             // If display is "0" (and not "0."), replace with new num.
            setDisplayValue(num);
            setFirstValue(''); 
            setRepeatOperand(null); // Clear repeat state as new number is being entered
            setRepeatOperator(null);
        } else {
            // Append digit if not overwriting and within max digit limit
            if (displayValue.length < maxDigits) {
                setDisplayValue(displayValue + num);
            }
            // If appending and no operator is set, we are building the first number of a new calculation.
            // Ensure repeat state is clear if it wasn't handled by the overwrite logic.
            if (!operator) {
                setRepeatOperand(null);
                setRepeatOperator(null);
            }
        }
    }
  };

  const handleOperatorInput = (op: string) => {
    // New operator selected, clear any progressive equals state
    setRepeatOperand(null);
    setRepeatOperator(null);

    if (operator && !waitingForSecondValue && firstValue !== '' && displayValue !== 'Error') {
      // Calculate current expression first (e.g., 5 * 2 + ...)
      // handleEqual will update displayValue.
      handleEqual(); 
      setFirstValue(displayValue); // Result of previous calc is new firstValue
    } else if (displayValue !== 'Error') {
      setFirstValue(displayValue);
    }

    if (displayValue !== 'Error') {
      setOperator(op);
      setWaitingForSecondValue(true);
      setSelectedOperator(op);
    }
  };

  const handleEqual = () => {
    let num1: number, num2: number;
    let opToExecute: string | null = null;
    let isError = false;

    // Scenario 1: Standard calculation (e.g., firstValue op displayValue =)
    if (operator && firstValue && displayValue !== 'Error') {
      num1 = parseFloat(firstValue);
      num2 = parseFloat(displayValue);
      opToExecute = operator;

      // Store the second operand and operator for potential repeat
      setRepeatOperand(displayValue);
      setRepeatOperator(operator);
    }
    // Scenario 2: Progressive (repeat) calculation (currentDisplayValue repeatOp repeatOperand =)
    else if (!operator && repeatOperator && repeatOperand && displayValue !== 'Error') {
      num1 = parseFloat(displayValue); // Current displayValue (previous result) is num1
      num2 = parseFloat(repeatOperand);   // The stored second operand
      opToExecute = repeatOperator;      // The stored operator
      // repeatOperand and repeatOperator are kept for further presses of "="
    } else {
      // Nothing to calculate (e.g., pressing "=" repeatedly without a valid setup)
      return;
    }

    let result = 0;
    switch (opToExecute) {
      case '+': result = num1 + num2; break;
      case '-': result = num1 - num2; break;
      case '*': result = num1 * num2; break;
      case '/':
        if (num2 === 0) {
          setDisplayValue('Error');
          isError = true;
        } else {
          result = num1 / num2;
        }
        break;
      default:
        return; // Should not happen if opToExecute is set
    }

    if (isError) {
      setOperator(null);
      setFirstValue('');
      setSelectedOperator(null);
      setWaitingForSecondValue(false);
      setRepeatOperand(null); // Clear repeat state on error
      setRepeatOperator(null);
      return;
    }

    let finalDisplayString: string;
    if (Math.abs(result) >= 1e9 || (Math.abs(result) < 0.000001 && result !== 0)) {
      finalDisplayString = result.toExponential(2);
    } else {
      finalDisplayString = parseFloat(result.toFixed(7)).toString();
    }

    setDisplayValue(finalDisplayString);
    setFirstValue(finalDisplayString); // The result becomes the new firstValue for chaining or next repeat
    setOperator(null); // Operator is consumed by equals
    setSelectedOperator(null);
    setWaitingForSecondValue(false);
  };

  const handleClear = () => {
    setDisplayValue('0');
    setOperator(null);
    setFirstValue('');
    setWaitingForSecondValue(false);
    setSelectedOperator(null);
    // Reset repeat state
    setRepeatOperand(null);
    setRepeatOperator(null);
  };

  const handleBackspace = () => {
    if (displayValue === 'Error' || waitingForSecondValue) return;
    
    // When backspacing, if a repeat operation was pending, it should be invalidated
    // if the displayValue (which might be a result) is altered.
    if(!waitingForSecondValue && !operator){ // Potentially after an equals
        setRepeatOperand(null);
        setRepeatOperator(null);
    }

    setDisplayValue(displayValue.slice(0, -1) || '0');
  };

  const handlePercentage = () => {
    if (displayValue === 'Error') return;
    // Percentage calculation should clear repeat state as it's a distinct operation
    setRepeatOperand(null);
    setRepeatOperator(null);

    let currentValue = parseFloat(displayValue);
    if (operator && firstValue) {
      const firstNum = parseFloat(firstValue);
      if (operator === '+' || operator === '-') {
        currentValue = (firstNum * currentValue) / 100;
      } else {
        currentValue = currentValue / 100;
      }
    } else {
      currentValue = currentValue / 100;
    }
    const finalResult = parseFloat(currentValue.toFixed(7)).toString();
    setDisplayValue(finalResult);
    // setFirstValue(finalResult); // iOS calculator usually doesn't make this the new firstValue for chaining immediately
    setWaitingForSecondValue(false); // Or true if it expects an operator next? iOS seems to allow further ops.
                                     // For now, matches your existing logic.
  };

  const handleDecimal = () => {
    // If a repeat operation was pending and user starts adding a decimal to the result,
    // it implies modification and the start of a new number.
    if (!operator && repeatOperator) {
        // Display already holds the result. Adding decimal means modifying it.
        // Treat as new number input.
        setDisplayValue(displayValue + '.'); // Start with current result + decimal
        setFirstValue(displayValue); // The result was the first value
        setRepeatOperand(null);
        setRepeatOperator(null);
        // waitingForSecondValue should be false
    } else if (waitingForSecondValue) {
        setDisplayValue('0.');
        setWaitingForSecondValue(false);
    } else if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
    // No explicit clearing of repeat state here if just adding to a fresh number,
    // handleNumberInput would have cleared it if it was an overwrite.
  };

  const valueToRender = formatNumberWithCommas(displayValue);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.displayContainer}>
        <Text
          style={[styles.display, { fontSize }]}
          numberOfLines={1}
        >
          {valueToRender}
        </Text>
      </View>
      <View style={styles.buttons}>
        <View style={styles.row}>
          <Button 
            onPress={handleClear} 
            text={displayValue === '0' && !firstValue && !operator && !repeatOperator ? "AC" : "C"} 
            color="#a5a5a5" 
            textColor="#000" 
          />
          <Button 
            onPress={handleBackspace} 
            text={<Delete size={buttonSize * 0.4} color="#000" />} 
            color="#a5a5a5" 
            textColor="#000" 
          />
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

const Button = ({ onPress, text, color, textColor = '#fff', wide, isHighlighted }: ButtonProps) => {
  let buttonBackgroundColor = color;
  if (isHighlighted) {
    if (color === '#ff9f0a') {
      buttonBackgroundColor = '#FFC880';
    } else if (color === '#a5a5a5') {
      buttonBackgroundColor = '#d9d9d9';
    } else if (color === '#333') {
      buttonBackgroundColor = '#737373';
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: buttonBackgroundColor },
        wide ? styles.buttonWide : { width: buttonSize, height: buttonSize },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text 
        style={[
          styles.buttonText, 
          { 
            color: textColor, 
            fontSize: text === "AC" || text === "C" ? buttonSize * 0.35 : buttonSize * 0.45 
          }
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  displayContainer: {
    width: calculatorWidth,
    marginBottom: 20,
    paddingHorizontal: buttonMargin,
    flex: 1,
    justifyContent: 'flex-end',
  },
  display: {
    color: '#fff',
    textAlign: 'right',
    fontWeight: '200', // Or your preferred font weight
  },
  buttons: {
    width: calculatorWidth,
    paddingBottom: Platform.OS === 'ios' ? 20 : 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: buttonMargin * 2.5,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: buttonSize / 2,
  },
  buttonWide: {
    width: (buttonSize * 2) + (buttonMargin * 2.5),
    height: buttonSize,
    borderRadius: buttonSize / 2,
    alignItems: 'flex-start',
    paddingLeft: buttonSize * 0.55,
  },
  buttonText: {
    color: '#fff',
  },
});

export default Calculator;