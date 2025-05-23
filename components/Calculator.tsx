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
  Animated,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Delete, ListRestart, CircleX } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REFERENCE_SCREEN_WIDTH = 375;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const scaleFactor = screenWidth / REFERENCE_SCREEN_WIDTH;
const s = (baselineSize: number): number => Math.round(baselineSize * scaleFactor);

const BASELINE_BUTTON_MARGIN = 4;
const BASELINE_DISPLAY_FONT_SIZE = 70;
const BASELINE_MIN_DISPLAY_FONT_SIZE = 28;
const BASELINE_DISPLAY_CONTAINER_MARGIN_BOTTOM = 16;
const BASELINE_BUTTONS_PADDING_BOTTOM = 16;
const BASELINE_HISTORY_SHEET_HEIGHT = screenHeight * 0.35;

const calculatorWidth = screenWidth * 0.9;
const buttonMargin = s(BASELINE_BUTTON_MARGIN);
const buttonSize = (calculatorWidth / 4) - (buttonMargin * 2);

// Helper function to format numbers
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

// Custom hook for display font size
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

interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  firstValue: string;
  operatorUsed: string;
  secondValue: string;
  timestamp: number;
}

const ASYNC_STORAGE_KEY = 'calculatorState';
const MAX_HISTORY_ENTRIES = 10;

const Calculator = () => {
  const [displayValue, setDisplayValue] = useState('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [firstValue, setFirstValue] = useState('');
  const [waitingForSecondValue, setWaitingForSecondValue] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [repeatOperand, setRepeatOperand] = useState<string | null>(null);
  const [repeatOperator, setRepeatOperator] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const currentDisplayFontSize = useDisplayFontSize(displayValue);
  const historySheetAnim = useRef(new Animated.Value(BASELINE_HISTORY_SHEET_HEIGHT)).current;
  const historySheetOpacity = useRef(new Animated.Value(1)).current;

  // Load state from AsyncStorage
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedStateString = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
        console.log('Loaded state string:', savedStateString);
        if (savedStateString) {
          const savedState = JSON.parse(savedStateString);
          console.log('Parsed saved state:', savedState);
          setDisplayValue(savedState.displayValue || '0');
          setOperator(savedState.operator || null);
          setFirstValue(savedState.firstValue || '');
          setWaitingForSecondValue(savedState.waitingForSecondValue || false);
          setSelectedOperator(savedState.selectedOperator || null);
          setRepeatOperand(savedState.repeatOperand || null);
          setRepeatOperator(savedState.repeatOperator || null);
          setHistory(savedState.history || []);
          console.log('Loaded history:', savedState.history || []);
        }
      } catch (error) {
        console.error("Failed to load calculator state:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadState();
  }, []);

  // Save state to AsyncStorage
  useEffect(() => {
    if (!isLoaded) return;

    const saveState = async () => {
      try {
        const stateToSave = {
          displayValue,
          operator,
          firstValue,
          waitingForSecondValue,
          selectedOperator,
          repeatOperand,
          repeatOperator,
          history,
        };
        console.log('Saving state:', stateToSave);
        await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(stateToSave));
        console.log('State saved successfully!');
      } catch (error) {
        console.error("Failed to save calculator state:", error);
      }
    };
    saveState();
  }, [displayValue, operator, firstValue, waitingForSecondValue, selectedOperator, repeatOperand, repeatOperator, history, isLoaded]);

  const addCalculationToHistory = (
    fv: string,
    op: string,
    sv: string,
    res: string
  ) => {
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      expression: `${formatNumberWithCommas(fv)} ${op} ${formatNumberWithCommas(sv)}`,
      result: res,
      firstValue: fv,
      operatorUsed: op,
      secondValue: sv,
      timestamp: Date.now(),
    };

    console.log('New history entry:', newEntry);

    setHistory(prevHistory => {
      const newHistory = [newEntry, ...prevHistory].slice(0, MAX_HISTORY_ENTRIES);
      console.log('Updated history:', newHistory);
      return newHistory;
    });
  };

  const toggleHistorySheet = () => {
    if (isHistoryVisible) {
      Animated.timing(historySheetAnim, {
        toValue: BASELINE_HISTORY_SHEET_HEIGHT,
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }).start(() => setIsHistoryVisible(false));
      Animated.timing(historySheetOpacity, {
        toValue: 1,
        duration: 0,
        useNativeDriver: true,
      }).start();
    } else {
      setIsHistoryVisible(true);
      Animated.timing(historySheetAnim, {
        toValue: 0,
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
      historySheetAnim.setValue(BASELINE_HISTORY_SHEET_HEIGHT);
      setIsHistoryVisible(false);
      historySheetOpacity.setValue(1);
      if (callback) callback();
    });
  };

  const handleHistoryItemPress = (item: HistoryEntry) => {
    closeHistoryWithFadeOut(() => {
      setDisplayValue(item.result);
      setFirstValue(item.result);
      setOperator(null);
      setWaitingForSecondValue(false);
      setSelectedOperator(null);
      setRepeatOperand(item.secondValue);
      setRepeatOperator(item.operatorUsed);
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

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
      handleEqual(true);
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

  const handleEqual = (isIntermediateCalc = false) => {
    let num1: number, num2: number;
    let opToExecute: string | null = null;
    let fvForHistory: string = firstValue;
    let svForHistory: string = displayValue;
    let opForHistory: string | null = operator;
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
      fvForHistory = displayValue;
      svForHistory = repeatOperand;
      opForHistory = repeatOperator;
    } else {
      return;
    }

    let result = 0;
    switch (opToExecute) {
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
          isError = true;
        } else {
          result = num1 / num2;
        }
        break;
      default:
        return;
    }

    if (isError) {
      setOperator(null);
      setFirstValue('');
      setSelectedOperator(null);
      setWaitingForSecondValue(false);
      setRepeatOperand(null);
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
    setFirstValue(finalDisplayString);
    setOperator(null);
    setSelectedOperator(null);
    setWaitingForSecondValue(false);

    if (!isIntermediateCalc && opToExecute && fvForHistory && svForHistory) {
      addCalculationToHistory(fvForHistory, opToExecute, svForHistory, finalDisplayString);
    }
  };

  const handleClear = () => {
    setDisplayValue('0');
    setOperator(null);
    setFirstValue('');
    setWaitingForSecondValue(false);
    setSelectedOperator(null);
    setRepeatOperand(null);
    setRepeatOperator(null);
  };

  const handleBackspace = () => {
    if (displayValue === 'Error' || waitingForSecondValue) return;
    if (!waitingForSecondValue && !operator) {
      setRepeatOperand(null);
      setRepeatOperator(null);
    }
    setDisplayValue(displayValue.slice(0, -1) || '0');
  };

  const handlePercentage = () => {
    if (displayValue === 'Error') return;
    const currentValue = parseFloat(displayValue);
    let resultValue: number;
    if (operator && firstValue) {
      const firstNum = parseFloat(firstValue);
      resultValue = (operator === '+' || operator === '-')
        ? (firstNum * currentValue) / 100
        : currentValue / 100;
    } else {
      resultValue = currentValue / 100;
    }
    const finalResultStr = parseFloat(resultValue.toFixed(7)).toString();
    setDisplayValue(finalResultStr);
    setWaitingForSecondValue(false);
    setRepeatOperand(null);
    setRepeatOperator(null);
  };

  const handleDecimal = () => {
    if (!operator && repeatOperator) {
      setDisplayValue(displayValue + '.');
      setFirstValue(displayValue);
      setRepeatOperand(null);
      setRepeatOperator(null);
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
        <TouchableOpacity onPress={toggleHistorySheet} style={styles.historyToggleButton}>
          <ListRestart size={s(24)} color="#FFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.displayContainer}>
        <Text style={[styles.display, { fontSize: currentDisplayFontSize }]} numberOfLines={1}>
          {valueToRender}
        </Text>
      </View>

      {isHistoryVisible && (
        <Animated.View
          style={[
            styles.historySheet,
            {
              transform: [{ translateY: historySheetAnim }],
              opacity: historySheetOpacity,
            },
          ]}
        >
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>History</Text>
            <TouchableOpacity onPress={toggleHistorySheet}>
              <CircleX size={s(24)} color="#FFF" />
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
          <Button onPress={() => handleEqual()} text="=" color="#ff9f0a"/>
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

  const currentButtonSizeStyle = wide ? {} : { width: buttonSize, height: buttonSize };
  const wideButtonStyle = wide ? styles.buttonWide : {};

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: buttonBackgroundColor },
        currentButtonSizeStyle,
        wideButtonStyle,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: textColor,
            fontSize:
              typeof text === 'string' && (text === 'AC' || text === 'C')
                ? buttonSize * 0.35
                : buttonSize * 0.45,
          },
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
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: s(15),
    paddingTop: Platform.OS === 'ios' ? s(10) : s(15),
    width: '100%',
  },
  historyToggleButton: {
    padding: s(5),
  },
  displayContainer: {
    width: calculatorWidth,
    alignSelf: 'center',
    marginBottom: s(BASELINE_DISPLAY_CONTAINER_MARGIN_BOTTOM),
    paddingHorizontal: buttonMargin,
    flex: 1,
    justifyContent: 'flex-end',
  },
  display: {
    color: '#fff',
    textAlign: 'right',
    fontWeight: '200',
  },
  buttons: {
    width: calculatorWidth,
    alignSelf: 'center',
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
    borderRadius: buttonSize / 1.8,
  },
  buttonWide: {
    width: buttonSize * 2 + buttonMargin,
    height: buttonSize,
    alignItems: 'flex-start',
    paddingLeft: buttonSize * 0.5,
    borderRadius: buttonSize / 1.8,
  },
  buttonText: {
    color: '#fff',
  },
  historySheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BASELINE_HISTORY_SHEET_HEIGHT,
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: s(20),
    borderTopRightRadius: s(20),
    paddingVertical: s(10),
    paddingHorizontal: s(15),
    zIndex: 10,
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
    paddingBottom: s(50),
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
    position: 'absolute',
    bottom: s(15),
    right: s(15),
    paddingVertical: s(8),
    paddingHorizontal: s(12),
    backgroundColor: '#c0392b',
    borderRadius: s(5),
  },
  clearHistoryButtonText: {
    color: '#fff',
    fontSize: s(14),
    fontWeight: 'bold',
  },
});

export default Calculator;
