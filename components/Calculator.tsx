// components/Calculator.tsx
import React, { useState, useEffect, JSX, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  useWindowDimensions,
  ScrollView,
  Animated, // Added for animations
  Easing,   // Added for animation easing
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Delete, ListRestart, XCircle } from 'lucide-react-native'; // Assuming you might want more icons
import AsyncStorage from '@react-native-async-storage/async-storage'; // Added for caching

// --- Responsive Sizing Setup (from previous step) ---
const REFERENCE_SCREEN_WIDTH = 375;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const scaleFactor = screenWidth / REFERENCE_SCREEN_WIDTH;
const s = (baselineSize: number): number => Math.round(baselineSize * scaleFactor);

const BASELINE_BUTTON_MARGIN = 4;
const BASELINE_DISPLAY_FONT_SIZE = 70;
const BASELINE_MIN_DISPLAY_FONT_SIZE = 28;
const BASELINE_DISPLAY_CONTAINER_MARGIN_BOTTOM = 16;
const BASELINE_BUTTONS_PADDING_BOTTOM = 16;
const BASELINE_HISTORY_SHEET_HEIGHT = screenHeight * 0.35; // Approx 35% of screen height for history

const calculatorWidth = screenWidth * 0.9;
const buttonMargin = s(BASELINE_BUTTON_MARGIN);
const buttonSize = (calculatorWidth / 4) - (buttonMargin * 2);

// Helper function to format numbers (remains unchanged)
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

// Custom hook for display font size (remains largely unchanged, uses scaled baselines)
function useDisplayFontSize(value: string) {
  const { width: currentHookScreenWidth } = useWindowDimensions();
  const initialFontSize = Math.round(BASELINE_DISPLAY_FONT_SIZE * (currentHookScreenWidth / REFERENCE_SCREEN_WIDTH));
  const [fontSize, setFontSize] = useState(Math.max(35, initialFontSize));

  useEffect(() => {
    const hookScaleFactor = currentHookScreenWidth / REFERENCE_SCREEN_WIDTH;
    const baseSize = Math.round(BASELINE_DISPLAY_FONT_SIZE * hookScaleFactor);
    const minSize = Math.round(BASELINE_MIN_DISPLAY_FONT_SIZE * hookScaleFactor);
    const finalBaseSize = Math.max(35, baseSize);
    const finalMinSize = Math.max(18, minSize);
    const maxLength = 7;
    const currentLength = value.length;
    let newFontSize = finalBaseSize;
    if (currentLength > maxLength) {
      const lengthScaleFactor = Math.max(maxLength / (currentLength * 1.15), 0.35);
      newFontSize = Math.max(finalBaseSize * lengthScaleFactor, finalMinSize);
    }
    setFontSize(Math.round(newFontSize));
  }, [value, currentHookScreenWidth]);
  return fontSize;
}

// --- History Entry Type ---
interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  firstValue: string;
  operatorUsed: string;
  secondValue: string; // The B in A op B
}

const ASYNC_STORAGE_KEY = 'calculatorState';

const Calculator = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [firstValue, setFirstValue] = useState('');
  const [waitingForSecondValue, setWaitingForSecondValue] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [repeatOperand, setRepeatOperand] = useState<string | null>(null);
  const [repeatOperator, setRepeatOperator] = useState<string | null>(null);

  // --- History State ---
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const currentDisplayFontSize = useDisplayFontSize(displayValue);

  // --- Animation Values ---
  const historySheetAnim = useRef(new Animated.Value(BASELINE_HISTORY_SHEET_HEIGHT)).current; // Start off-screen (bottom)
  const historySheetOpacity = useRef(new Animated.Value(1)).current;


  // --- Caching Logic ---
  const [isLoaded, setIsLoaded] = useState(false); // To prevent saving initial default state before loading

  // Load state from AsyncStorage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedStateString = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
        if (savedStateString) {
          const savedState = JSON.parse(savedStateString);
          setDisplayValue(savedState.displayValue || '0');
          setOperator(savedState.operator || null);
          setFirstValue(savedState.firstValue || '');
          setWaitingForSecondValue(savedState.waitingForSecondValue || false);
          setSelectedOperator(savedState.selectedOperator || null);
          setRepeatOperand(savedState.repeatOperand || null);
          setRepeatOperator(savedState.repeatOperator || null);
          setHistory(savedState.history || []);
        }
      } catch (e) {
        console.error("Failed to load calculator state:", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadState();
  }, []);

  // Save state to AsyncStorage on change
  useEffect(() => {
    if (!isLoaded) return; // Don't save until state is loaded

    const saveState = async () => {
      try {
        const stateToSave = {
          displayValue, operator, firstValue, waitingForSecondValue,
          selectedOperator, repeatOperand, repeatOperator, history,
        };
        await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (e) {
        console.error("Failed to save calculator state:", e);
      }
    };
    saveState();
  }, [displayValue, operator, firstValue, waitingForSecondValue, selectedOperator, repeatOperand, repeatOperator, history, isLoaded]);


  // --- Animation Handlers ---
  const toggleHistorySheet = () => {
    if (isHistoryVisible) { // Closing
      Animated.timing(historySheetAnim, {
        toValue: BASELINE_HISTORY_SHEET_HEIGHT, // Slide down
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true, // Use true if only transform/opacity
      }).start(() => setIsHistoryVisible(false));
      Animated.timing(historySheetOpacity, { // Ensure opacity is back for next open
        toValue: 1,
        duration: 0, // Instant
        useNativeDriver: true,
      }).start();
    } else { // Opening
      setIsHistoryVisible(true);
      Animated.timing(historySheetAnim, {
        toValue: 0, // Slide up
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }).start();
    }
  };
  
  const closeHistoryWithFadeOut = (callback?: () => void) => {
    Animated.timing(historySheetOpacity, {
      toValue: 0,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      historySheetAnim.setValue(BASELINE_HISTORY_SHEET_HEIGHT); // Reset position off-screen
      setIsHistoryVisible(false);
      historySheetOpacity.setValue(1); // Reset opacity for next open
      if (callback) callback();
    });
  };


  // --- Event Handlers (incorporating history and repeat logic) ---
  const addCalculationToHistory = (
    fv: string, op: string, sv: string, res: string
  ) => {
    const expressionString = `${formatNumberWithCommas(fv)} ${op} ${formatNumberWithCommas(sv)}`;
    const newEntry: HistoryEntry = {
      id: Date.now().toString(), // Simple unique ID
      expression: expressionString,
      result: res,
      firstValue: fv,
      operatorUsed: op,
      secondValue: sv,
    };
    setHistory(prevHistory => [newEntry, ...prevHistory].slice(0, 10));
  };

  const handleHistoryItemPress = (item: HistoryEntry) => {
    closeHistoryWithFadeOut(() => {
      setDisplayValue(item.result);
      setFirstValue(item.firstValue); // Or set to item.result if preferred for immediate next op
      setOperator(item.operatorUsed); // Or null to allow new op on the result
      setWaitingForSecondValue(false); // Assuming loading a completed calculation
      setSelectedOperator(null); // Or item.operatorUsed
      setRepeatOperand(item.secondValue);
      setRepeatOperator(item.operatorUsed);
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    // Optionally close the sheet after clearing
    // toggleHistorySheet(); 
  };


  const handleNumberInput = (num: string) => {
    const maxDigits = 12;
    if (waitingForSecondValue) {
        setDisplayValue(num);
        setWaitingForSecondValue(false);
    } else {
        if (!operator && repeatOperator) {
            setDisplayValue(num); setFirstValue(''); 
            setRepeatOperand(null); setRepeatOperator(null);
        } else if (displayValue === '0' && num === '0' && !displayValue.includes('.')) {
            return;
        } else if ((displayValue === '0' && num !== '.')) {
            setDisplayValue(num); setFirstValue(''); 
            setRepeatOperand(null); setRepeatOperator(null);
        } else {
            if (displayValue.length < maxDigits) {
                setDisplayValue(displayValue + num);
            }
            if (!operator) {
                setRepeatOperand(null); setRepeatOperator(null);
            }
        }
    }
  };

  const handleOperatorInput = (op: string) => {
    setRepeatOperand(null); 
    setRepeatOperator(null);
    if (operator && !waitingForSecondValue && firstValue !== '' && displayValue !== 'Error') {
      // Previously, this might have been handleEqual() or handleEqual(false)
      handleEqual(true); // CORRECT: Mark this as an intermediate calculation
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

  const handleEqual = (isIntermediateCalc = false) => { // Added optional param
    let num1: number, num2: number;
    let opToExecute: string | null = null;
    let fvForHistory: string = firstValue, svForHistory: string = displayValue, opForHistory: string | null = operator;
    let isError = false;

    if (operator && firstValue && displayValue !== 'Error') {
      num1 = parseFloat(firstValue);
      num2 = parseFloat(displayValue);
      opToExecute = operator;
      setRepeatOperand(displayValue);
      setRepeatOperator(operator);
      // History values already assigned
    } else if (!operator && repeatOperator && repeatOperand && displayValue !== 'Error') {
      num1 = parseFloat(displayValue); 
      num2 = parseFloat(repeatOperand);   
      opToExecute = repeatOperator;
      fvForHistory = displayValue; // Current result is the first value for history expression
      svForHistory = repeatOperand;
      opForHistory = repeatOperator;
    } else {
      return;
    }

    let result = 0;
    switch (opToExecute) {
      case '+': result = num1 + num2; break;
      case '-': result = num1 - num2; break;
      case '*': result = num1 * num2; break;
      case '/':
        if (num2 === 0) { setDisplayValue('Error'); isError = true; } 
        else { result = num1 / num2; }
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

    if (!isIntermediateCalc && opToExecute && fvForHistory && svForHistory) { // Only add to history if it's a user '=' or repeat '='
        addCalculationToHistory(fvForHistory, opToExecute, svForHistory, finalDisplayString);
    }
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
    const originalDisplay = displayValue; // For history
    const originalFirst = firstValue;
    const originalOp = operator;

    setRepeatOperand(null); setRepeatOperator(null);
    let currentValue = parseFloat(displayValue);
    let resultValue: number;
    if (operator && firstValue) {
      const firstNum = parseFloat(firstValue);
      resultValue = (operator === '+' || operator === '-') ? (firstNum * currentValue) / 100 : currentValue / 100;
    } else {
      resultValue = currentValue / 100;
    }
    const finalResultStr = parseFloat(resultValue.toFixed(7)).toString();
    setDisplayValue(finalResultStr);
    // setFirstValue(finalResultStr); // Or not, depending on desired chain after %
    setWaitingForSecondValue(false); 
    
    // Optionally add percentage operation to history
    // addCalculationToHistory(
    //   operator ? originalFirst : originalDisplay, 
    //   operator ? originalOp + " then %" : "% of", 
    //   operator ? originalDisplay : "100", 
    //   finalResultStr
    // );
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
      <View style={styles.headerControls}>
        {/* Placeholder for potential title or back button if needed */}
        <TouchableOpacity onPress={toggleHistorySheet} style={styles.historyToggleButton}>
            {/* Replace with a proper icon */}
            <ListRestart size={s(24)} color="#FFF" /> 
        </TouchableOpacity>
      </View>
      <View style={styles.displayContainer}>
        <Text
          style={[styles.display, { fontSize: currentDisplayFontSize }]}
          numberOfLines={1}
        >
          {valueToRender}
        </Text>
      </View>

      {/* --- History Sheet --- */}
      {isHistoryVisible && (
        <Animated.View 
            style={[
                styles.historySheet, 
                { 
                    transform: [{ translateY: historySheetAnim }],
                    opacity: historySheetOpacity,
                }
            ]}
        >
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>History</Text>
            <TouchableOpacity onPress={toggleHistorySheet}>
                <XCircle size={s(24)} color="#FFF"/>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.historyScrollContent}>
            {history.length === 0 ? (
              <Text style={styles.noHistoryText}>No history yet.</Text>
            ) : (
              history.map((item) => (
                <TouchableOpacity 
                    key={item.id} 
                    style={styles.historyItem}
                    onPress={() => handleHistoryItemPress(item)}
                >
                  <Text style={styles.historyExpression}>{item.expression}</Text>
                  <Text style={styles.historyResult}>= {formatNumberWithCommas(item.result)}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          {history.length > 0 && (
            <TouchableOpacity style={styles.clearHistoryButton} onPress={handleClearHistory}>
              <Text style={styles.clearHistoryButtonText}>Clear History</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      <View style={styles.buttons}>
        {/* Button Rows (structure remains the same) */}
        <View style={styles.row}>
          <Button onPress={handleClear} text={displayValue==='0'&&!firstValue&&!operator&&!repeatOperator?"AC":"C"} color="#a5a5a5" textColor="#000" />
          <Button onPress={handleBackspace} text={<Delete size={buttonSize*0.4} color="#000"/>} color="#a5a5a5" textColor="#000" />
          <Button onPress={handlePercentage} text="%" color="#a5a5a5" textColor="#000" />
          <Button onPress={()=>handleOperatorInput('/')} text="÷" color="#ff9f0a" isHighlighted={selectedOperator==='/'}/>
        </View>
        <View style={styles.row}><Button onPress={()=>handleNumberInput('7')} text="7" color="#333"/><Button onPress={()=>handleNumberInput('8')} text="8" color="#333"/><Button onPress={()=>handleNumberInput('9')} text="9" color="#333"/><Button onPress={()=>handleOperatorInput('*')} text="×" color="#ff9f0a" isHighlighted={selectedOperator==='*'}/></View>
        <View style={styles.row}><Button onPress={()=>handleNumberInput('4')} text="4" color="#333"/><Button onPress={()=>handleNumberInput('5')} text="5" color="#333"/><Button onPress={()=>handleNumberInput('6')} text="6" color="#333"/><Button onPress={()=>handleOperatorInput('-')} text="-" color="#ff9f0a" isHighlighted={selectedOperator==='-'}/></View>
        <View style={styles.row}><Button onPress={()=>handleNumberInput('1')} text="1" color="#333"/><Button onPress={()=>handleNumberInput('2')} text="2" color="#333"/><Button onPress={()=>handleNumberInput('3')} text="3" color="#333"/><Button onPress={()=>handleOperatorInput('+')} text="+" color="#ff9f0a" isHighlighted={selectedOperator==='+'}/></View>
        <View style={styles.row}><Button onPress={()=>handleNumberInput('0')} text="0" color="#333" wide/><Button onPress={handleDecimal} text="." color="#333"/><Button onPress={handleEqual} text="=" color="#ff9f0a"/></View>
      </View>
    </SafeAreaView>
  );
};


// --- Button Component ---
interface ButtonProps {
  onPress: () => void;
  text: string | JSX.Element; // Can be a string or a JSX element (like an icon)
  color: string;
  textColor?: string; // Optional, defaults to '#fff'
  wide?: boolean;     // Optional, for wider buttons like '0'
  isHighlighted?: boolean; // Optional, for operator highlighting
}

const Button = ({ onPress, text, color, textColor = '#fff', wide, isHighlighted }: ButtonProps) => {
  let buttonBackgroundColor = color;
  if (isHighlighted) {
    if (color === '#ff9f0a') buttonBackgroundColor = '#FFC880'; // Lighter orange
    else if (color === '#a5a5a5') buttonBackgroundColor = '#d9d9d9'; // Lighter gray
    else if (color === '#333') buttonBackgroundColor = '#737373'; // Lighter dark gray
  }

  // Styles for button size, specific to this component's logic
  // buttonSize is a global constant defined earlier in your file
  const currentButtonSizeStyle = wide ? {} : { width: buttonSize, height: buttonSize };
  // styles.buttonWide and styles.button are from your StyleSheet
  const wideButtonStyle = wide ? styles.buttonWide : {};


  return (
    <TouchableOpacity
      style={[
        styles.button, // General button styles (like borderRadius, alignItems, justifyContent)
        { backgroundColor: buttonBackgroundColor }, // Dynamic background color
        currentButtonSizeStyle, // Applies width/height for non-wide buttons
        wideButtonStyle         // Applies specific styles for wide buttons (like width, padding)
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text 
        style={[
          styles.buttonText, // General button text styles (like default color)
          { 
            color: textColor, 
            // Font size scaled based on buttonSize (a global constant)
            fontSize: (typeof text === 'string' && (text === "AC" || text === "C")) ? buttonSize * 0.35 : buttonSize * 0.45 
          }
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};


// --- Styles (with additions for History and scaled values) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    // alignItems: 'center', // alignItems might conflict with history sheet positioning if absolute
    // justifyContent: 'flex-end', // justifyContent might also conflict
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Position history icon to the right
    paddingHorizontal: s(15),
    paddingTop: Platform.OS === 'ios' ? s(10) : s(15), // Space for status bar
    // backgroundColor: '#1c1c1c', // Optional header bg
    width: '100%',
  },
  historyToggleButton: {
    padding: s(5),
  },
  displayContainer: {
    width: calculatorWidth,
    alignSelf: 'center', // Center it if container alignItems is removed
    marginBottom: s(BASELINE_DISPLAY_CONTAINER_MARGIN_BOTTOM),
    paddingHorizontal: buttonMargin,
    flex: 1, // Takes available space for display
    justifyContent: 'flex-end',
  },
  display: {
    color: '#fff',
    textAlign: 'right',
    fontWeight: '200',
  },
  buttons: {
    width: calculatorWidth,
    alignSelf: 'center', // Center buttons
    paddingBottom: s(BASELINE_BUTTONS_PADDING_BOTTOM),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: buttonMargin * 2.2,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: buttonSize / 1.8, // Slightly less round to maximize touch area with scaled margins
  },
  buttonWide: {
    width: (buttonSize * 2) + buttonMargin,
    height: buttonSize,
    alignItems: 'flex-start',
    paddingLeft: buttonSize * 0.5,
    borderRadius: buttonSize / 1.8, // Consistent rounding
  },
  buttonText: {
    color: '#fff',
  },
  // History Sheet Styles
  historySheet: {
    position: 'absolute',
    bottom: 0, // Starts at the bottom
    left: 0,
    right: 0,
    height: BASELINE_HISTORY_SHEET_HEIGHT, // Use scaled or fixed height
    backgroundColor: '#1e1e1e', // Darker shade for history
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    paddingVertical: s(10),
    paddingHorizontal: s(15),
    zIndex: 10, // Ensure it's above buttons
    // elevation: 5, // For Android shadow
    // shadowColor: '#000', // For iOS shadow
    // shadowOffset: { width: 0, height: -3 },
    // shadowOpacity: 0.3,
    // shadowRadius: 5,
  },
   historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: s(10),
    paddingHorizontal: s(5),
  },
  historyTitle: {
    fontSize: s(18),
    color: '#fff',
    fontWeight: 'bold',
  },
  historyScrollContent: {
    paddingBottom: s(50), // Space for clear button if it's absolutely positioned or at end of scroll
  },
  historyItem: {
    paddingVertical: s(10),
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  historyExpression: {
    fontSize: s(14),
    color: '#aaa',
  },
  historyResult: {
    fontSize: s(16),
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  noHistoryText: {
    fontSize: s(16),
    color: '#777',
    textAlign: 'center',
    marginTop: s(30),
  },
  clearHistoryButton: {
    position: 'absolute', // Position at bottom right of the sheet
    bottom: s(15),
    right: s(15),
    paddingVertical: s(8),
    paddingHorizontal: s(12),
    backgroundColor: '#c0392b', // Reddish color
    borderRadius: s(5),
  },
  clearHistoryButtonText: {
    color: '#fff',
    fontSize: s(14),
    fontWeight: 'bold',
  },
});

export default Calculator;