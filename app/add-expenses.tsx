import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { Plus, X, Receipt, Check, ArrowRight } from 'lucide-react-native';
import { useSplit } from '@/contexts/SplitContext';

export default function AddExpensesScreen() {
  const { people, expenses, setExpenses } = useSplit();
  const [expenseName, setExpenseName] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [selectedPayer, setSelectedPayer] = useState<string>('');
  const [selectedSharedBy, setSelectedSharedBy] = useState<string[]>([]);
  const [showPayerModal, setShowPayerModal] = useState<boolean>(false);
  const [showSharedByModal, setShowSharedByModal] = useState<boolean>(false);

  const addExpense = () => {
    if (!expenseName.trim()) {
      Alert.alert('Missing Information', 'Please enter an expense name.');
      return;
    }
    
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (!selectedPayer) {
      Alert.alert('Missing Information', 'Please select who paid for this expense.');
      return;
    }

    if (selectedSharedBy.length === 0) {
      Alert.alert('Missing Information', 'Please select who shares this expense.');
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      name: expenseName.trim(),
      amount,
      paidBy: selectedPayer,
      sharedBy: selectedSharedBy,
    };

    setExpenses([...expenses, newExpense]);
    
    // Reset form
    setExpenseName('');
    setExpenseAmount('');
    setSelectedPayer('');
    setSelectedSharedBy([]);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const handleContinue = () => {
    if (expenses.length === 0) {
      Alert.alert('No Expenses', 'Please add at least one expense to continue.');
      return;
    }
    router.push('/results');
  };

  const toggleSharedBy = (personId: string) => {
    if (selectedSharedBy.includes(personId)) {
      setSelectedSharedBy(selectedSharedBy.filter(id => id !== personId));
    } else {
      setSelectedSharedBy([...selectedSharedBy, personId]);
    }
  };

  const selectAllForSharing = () => {
    if (selectedSharedBy.length === people.length) {
      setSelectedSharedBy([]);
    } else {
      setSelectedSharedBy(people.map(p => p.id));
    }
  };

  const getPersonName = (id: string) => {
    return people.find(p => p.id === id)?.name || '';
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Receipt size={32} color="#0f766e" />
          <Text style={styles.title}>Add Expenses</Text>
          <Text style={styles.subtitle}>Track what everyone spent</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expense Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Dinner, Gas, Hotel"
              value={expenseName}
              onChangeText={setExpenseName}
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={expenseAmount}
              onChangeText={setExpenseAmount}
              keyboardType="decimal-pad"
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Who Paid?</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowPayerModal(true)}
            >
              <Text style={[styles.selectorText, !selectedPayer && styles.placeholder]}>
                {selectedPayer ? getPersonName(selectedPayer) : 'Select who paid'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Who Shares This?</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowSharedByModal(true)}
            >
              <Text style={[styles.selectorText, selectedSharedBy.length === 0 && styles.placeholder]}>
                {selectedSharedBy.length === 0 
                  ? 'Select who shares this expense'
                  : selectedSharedBy.length === people.length
                  ? 'Everyone'
                  : `${selectedSharedBy.length} ${selectedSharedBy.length === 1 ? 'person' : 'people'}`
                }
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.addExpenseButton, (!expenseName.trim() || !expenseAmount || !selectedPayer || selectedSharedBy.length === 0) && styles.addExpenseButtonDisabled]}
            onPress={addExpense}
            disabled={!expenseName.trim() || !expenseAmount || !selectedPayer || selectedSharedBy.length === 0}
          >
            <Plus size={20} color="#ffffff" />
            <Text style={styles.addExpenseButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        {expenses.length > 0 && (
          <View style={styles.expensesList}>
            <Text style={styles.expensesTitle}>Added Expenses</Text>
            {expenses.map((expense) => (
              <View key={expense.id} style={styles.expenseItem}>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseName}>{expense.name}</Text>
                  <Text style={styles.expenseDetails}>
                    ${expense.amount.toFixed(2)} • Paid by {getPersonName(expense.paidBy)}
                  </Text>
                  <Text style={styles.expenseShared}>
                    Shared by {expense.sharedBy.length === people.length ? 'everyone' : 
                    expense.sharedBy.map(id => getPersonName(id)).join(', ')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeExpenseButton}
                  onPress={() => removeExpense(expense.id)}
                >
                  <X size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total: ${totalExpenses.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, expenses.length === 0 && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={expenses.length === 0}
        >
          <Text style={[styles.continueButtonText, expenses.length === 0 && styles.continueButtonTextDisabled]}>
            View Results
          </Text>
          <ArrowRight size={20} color={expenses.length > 0 ? '#ffffff' : '#94a3b8'} />
        </TouchableOpacity>
      </View>

      {/* Payer Selection Modal */}
      <Modal visible={showPayerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Who paid for this expense?</Text>
            {people.map((person) => (
              <TouchableOpacity
                key={person.id}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedPayer(person.id);
                  setShowPayerModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{person.name}</Text>
                {selectedPayer === person.id && <Check size={20} color="#0f766e" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPayerModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Shared By Selection Modal */}
      <Modal visible={showSharedByModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Who shares this expense?</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={selectAllForSharing}
            >
              <Text style={styles.modalOptionText}>
                {selectedSharedBy.length === people.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
            {people.map((person) => (
              <TouchableOpacity
                key={person.id}
                style={styles.modalOption}
                onPress={() => toggleSharedBy(person.id)}
              >
                <Text style={styles.modalOptionText}>{person.name}</Text>
                {selectedSharedBy.includes(person.id) && <Check size={20} color="#0f766e" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSharedByModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selector: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectorText: {
    fontSize: 16,
    color: '#1e293b',
  },
  placeholder: {
    color: '#94a3b8',
  },
  addExpenseButton: {
    backgroundColor: '#0f766e',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addExpenseButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  addExpenseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  expensesList: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  expensesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  expenseItem: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  expenseDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  expenseShared: {
    fontSize: 12,
    color: '#94a3b8',
  },
  removeExpenseButton: {
    padding: 4,
    marginLeft: 12,
  },
  totalContainer: {
    backgroundColor: '#0f766e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  continueButton: {
    backgroundColor: '#0f766e',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  continueButtonTextDisabled: {
    color: '#94a3b8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1e293b',
  },
  modalCloseButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
});