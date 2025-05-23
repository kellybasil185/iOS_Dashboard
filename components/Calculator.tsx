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

// --- Responsive Sizing Setup ---
// Define baseline values for a reference screen width (e.g., iPhone 11 Pro width)
const REFERENCE_SCREEN_WIDTH = 375; // Target width for baseline design

// Baseline design values for REFERENCE_SCREEN_WIDTH
const BASELINE_BUTTON_MARGIN = 4; // Adjusted for smaller screens
const BASELINE_DISPLAY_FONT_SIZE = 70; // Adjusted base display font size
const BASELINE_MIN_DISPLAY_FONT_SIZE = 28; // Adjusted min display font size
const BASELINE_DISPLAY_CONTAINER_MARGIN_BOTTOM = 16; // Adjusted
const BASELINE_BUTTONS_PADDING_BOTTOM = 16; // Adjusted

// Get current screen width for initial calculations
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Calculate scale factor based on current screen width
const scaleFactor = screenWidth / REFERENCE_SCREEN_WIDTH;

// Helper function to apply scaling to pixel/point sizes
const s = (baselineSize: number): number => Math.round(baselineSize * scaleFactor);

// --- Scaled constants for layout ---
const calculatorWidth = screenWidth * 0.9; // Calculator takes 90% of screen width
const buttonMargin = s(BASELINE_BUTTON_MARGIN);
const buttonSize = (calculatorWidth / 4) - (buttonMargin * 2); // Adapts with scaled margin

// Helper function to format numbers with commas (remains unchanged)
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

// Custom hook for calculating display font size, now with responsive base sizes
function useDisplayFontSize(value: string) {
  const { width: currentHookScreenWidth } = useWindowDimensions(); // Dynamic width from hook
  
  // Calculate initial font size based on the hook's current width context
  const initialFontSize = Math.round(BASELINE_DISPLAY_FONT_SIZE * (currentHookScreenWidth / REFERENCE_SCREEN_WIDTH));
  const [fontSize, setFontSize] = useState(Math.max(35, initialFontSize)); // Ensure a minimum base

  useEffect(() => {
    const hookScaleFactor = currentHookScreenWidth / REFERENCE_SCREEN_WIDTH;
    const baseSize = Math.round(BASELINE_DISPLAY_FONT_SIZE * hookScaleFactor);
    const minSize = Math.round(BASELINE_MIN_DISPLAY_FONT_SIZE * hookScaleFactor);

    // Ensure sensible minimums after scaling
    const finalBaseSize = Math.max(35, baseSize); // e.g., don't let base font go below 35
    const finalMinSize = Math.max(18, minSize);   // e.g., don't let min font go below 18
    
    const maxLength = 7; // Number of characters before font starts to shrink
    const currentLength = value.length; // Based on raw displayValue length
    
    let newFontSize = finalBaseSize;
    if (currentLength > maxLength) {
      const lengthScaleFactor = Math.max(maxLength / (currentLength * 1.15), 0.35); // Adjust divisor or min scale as needed
      newFontSize = Math.max(finalBaseSize * lengthScaleFactor, finalMinSize);
    }
    setFontSize(Math.round(newFontSize)); // Round final font size

  }, [value, currentHookScreenWidth]);

  return fontSize;
}

const Calculator = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [firstValue, setFirstValue] = useState('');
  const [waitingForSecondValue, setWaitingForSecondValue] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  
  const [repeatOperand, setRepeatOperand] = useState<string | null>(null);
  const [repeatOperator, setRepeatOperator] = useState<string | null>(null);

  // Pass displayValue (raw number string) to useDisplayFontSize
  const currentDisplayFontSize = useDisplayFontSize(displayValue);

  // --- Event Handlers (with logic from previous step for progressive equals) ---
  const handleNumberInput = (num: string) => {
    const maxDigits = 12;
    if (waitingForSecondValue) {
        setDisplayValue(num);
        setWaitingForSecondValue(false);
    } else {
        if (!operator && repeatOperator) {
            setDisplayValue(num);
            setFirstValue(''); 
            setRepeatOperand(null);
            setRepeatOperator(null);
        } else if (displayValue === '0' && num === '0' && !displayValue.includes('.')) {
            return;
        } else if ((displayValue === '0' && num !== '.')) {
            setDisplayValue(num);
            setFirstValue(''); 
            setRepeatOperand(null); 
            setRepeatOperator(null);
        } else {
            if (displayValue.length < maxDigits) {
                setDisplayValue(displayValue + num);
            }
            if (!operator) {
                setRepeatOperand(null);
                setRepeatOperator(null);
            }
        }
    }
  };

  const handleOperatorInput = (op: string) => {
    setRepeatOperand(null);
    setRepeatOperator(null);
    if (operator && !waitingForSecondValue && firstValue !== '' && displayValue !== 'Error') {
      handleEqual(); 
      setFirstValue(displayValue); 
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

    if (operator && firstValue && displayValue !== 'Error') {
      num1 = parseFloat(firstValue);
      num2 = parseFloat(displayValue);
      opToExecute = operator;
      setRepeatOperand(displayValue);
      setRepeatOperator(operator);
    } else if (!operator && repeatOperator && repeatOperand && displayValue !== 'Error') {
      num1 = parseFloat(displayValue); 
      num2 = parseFloat(repeatOperand);   
      opToExecute = repeatOperator;      
    } else {
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
      default: return;
    }

    if (isError) {
      setOperator(null); setFirstValue(''); setSelectedOperator(null);
      setWaitingForSecondValue(false); setRepeatOperand(null); setRepeatOperator(null);
      return;
    }

    let finalDisplayString: string;
    if (Math.abs(result) >= 1e9 || (Math.abs(result) < 0.000001 && result !== 0)) {
      finalDisplayString = result.toExponential(2);
    } else {
      finalDisplayString = parseFloat(result.toFixed(7)).toString();
    }

    setDisplayValue(finalDisplayString);
    setFirstValue(finalDisplayString); 
    setOperator(null); 
    setSelectedOperator(null);
    setWaitingForSecondValue(false);
  };

  const handleClear = () => {
    setDisplayValue('0'); setOperator(null); setFirstValue('');
    setWaitingForSecondValue(false); setSelectedOperator(null);
    setRepeatOperand(null); setRepeatOperator(null);
  };

  const handleBackspace = () => {
    if (displayValue === 'Error' || waitingForSecondValue) return;
    if(!waitingForSecondValue && !operator){
        setRepeatOperand(null); setRepeatOperator(null);
    }
    setDisplayValue(displayValue.slice(0, -1) || '0');
  };

  const handlePercentage = () => {
    if (displayValue === 'Error') return;
    setRepeatOperand(null); setRepeatOperator(null);
    let currentValue = parseFloat(displayValue);
    if (operator && firstValue) {
      const firstNum = parseFloat(firstValue);
      currentValue = (operator === '+' || operator === '-') ? (firstNum * currentValue) / 100 : currentValue / 100;
    } else {
      currentValue = currentValue / 100;
    }
    setDisplayValue(parseFloat(currentValue.toFixed(7)).toString());
    setWaitingForSecondValue(false); 
  };

  const handleDecimal = () => {
    if (!operator && repeatOperator) {
        setDisplayValue(displayValue + '.'); 
        setFirstValue(displayValue); 
        setRepeatOperand(null); setRepeatOperator(null);
    } else if (waitingForSecondValue) {
        setDisplayValue('0.');
        setWaitingForSecondValue(false);
    } else if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const valueToRender = formatNumberWithCommas(displayValue);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.displayContainer}>
        <Text
          style={[styles.display, { fontSize: currentDisplayFontSize }]} // Apply scaled font size
          numberOfLines={1}
        >
          {valueToRender}
        </Text>
      </View>
      <View style={styles.buttons}>
        {/* Rows of Buttons (structure remains the same) */}
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
        {/* Row 2 */}
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
        {/* Row 3 */}
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
        {/* Row 4 */}
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
        {/* Row 5 */}
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
    if (color === '#ff9f0a') buttonBackgroundColor = '#FFC880';
    else if (color === '#a5a5a5') buttonBackgroundColor = '#d9d9d9';
    else if (color === '#333') buttonBackgroundColor = '#737373';
  }

  const currentButtonSize = wide ? {} : { width: buttonSize, height: buttonSize };
  const wideButtonStyle = wide ? styles.buttonWide : {};

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: buttonBackgroundColor }, currentButtonSize, wideButtonStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text 
        style={[
          styles.buttonText, 
          { 
            color: textColor, 
            // Scale button text font size based on the calculated buttonSize
            fontSize: (typeof text === 'string' && (text === "AC" || text === "C")) ? buttonSize * 0.35 : buttonSize * 0.45 
          }
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

// Styles using scaled constants
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  displayContainer: {
    width: calculatorWidth, // Already responsive (90% of screenWidth)
    marginBottom: s(BASELINE_DISPLAY_CONTAINER_MARGIN_BOTTOM), // Scaled
    paddingHorizontal: buttonMargin, // Scaled via global buttonMargin
    flex: 1,
    justifyContent: 'flex-end',
  },
  display: {
    // fontSize is now applied inline from useDisplayFontSize hook
    color: '#fff',
    textAlign: 'right',
    fontWeight: '200', // Adjust as preferred
  },
  buttons: {
    width: calculatorWidth, // Already responsive
    paddingBottom: s(BASELINE_BUTTONS_PADDING_BOTTOM), // Scaled
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: buttonMargin * 2.2, // Scaled via global buttonMargin, adjusted multiplier slightly
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: buttonSize / 1.8, // Make slightly less circular for more space if needed, or keep buttonSize / 2
                                  // Or ensure buttonSize itself is large enough after scaling.
                                  // Using buttonSize directly for width/height, so borderRadius: buttonSize / 2 is fine for perfect circle.
  },
  buttonWide: { // width and height for wide button now use scaled buttonSize
    width: (buttonSize * 2) + buttonMargin, // Adjusted for one margin between two buttons
    height: buttonSize,
    // borderRadius: buttonSize / 2, // Keep consistent rounding
    alignItems: 'flex-start',
    paddingLeft: buttonSize * 0.5, // Adjusted padding slightly for '0'
  },
  buttonText: {
    color: '#fff',
    // fontSize is now scaled within the Button component itself based on buttonSize
  },
});

export default Calculator;