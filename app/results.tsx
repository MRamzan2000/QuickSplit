import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Alert, Modal, Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Feather, Entypo } from '@expo/vector-icons';
import { useSplit } from '@/contexts/SplitContext';

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export default function ResultsScreen() {
  const { people, expenses, resetSplit } = useSplit();
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const calculateSettlements = (): Settlement[] => {
    // Calculate what each person paid and owes
    const balances: { [personId: string]: number } = {};
    
    // Initialize balances
    people.forEach(person => {
      balances[person.id] = 0;
    });

    // Calculate net balances
    expenses.forEach(expense => {
      const shareAmount = expense.amount / expense.sharedBy.length;
      
      // Add what they paid
      balances[expense.paidBy] += expense.amount;
      
      // Subtract what they owe
      expense.sharedBy.forEach(personId => {
        balances[personId] -= shareAmount;
      });
    });

    // Create settlements
    const settlements: Settlement[] = [];
    const creditors = Object.entries(balances).filter(([_, balance]) => balance > 0.01);
    const debtors = Object.entries(balances).filter(([_, balance]) => balance < -0.01);

    creditors.forEach(([creditorId, creditAmount]) => {
      debtors.forEach(([debtorId, debtAmount]) => {
        if (Math.abs(debtAmount) > 0.01 && creditAmount > 0.01) {
          const settlementAmount = Math.min(creditAmount, Math.abs(debtAmount));
          
          settlements.push({
            from: debtorId,
            to: creditorId,
            amount: settlementAmount,
          });

          balances[creditorId] -= settlementAmount;
          balances[debtorId] += settlementAmount;
        }
      });
    });

    return settlements.filter(s => s.amount > 0.01);
  };

  const getPersonName = (id: string) => {
    return people.find(p => p.id === id)?.name || '';
  };

  const settlements = calculateSettlements();
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const generateShareText = () => {
    let shareText = `💰 QuickSplit Results\n\n`;
    shareText += `Total Expenses: $${totalExpenses.toFixed(2)}\n`;
    shareText += `Split between: ${people.map(p => p.name).join(', ')}\n\n`;
    
    if (settlements.length === 0) {
      shareText += `🎉 Everyone is even! No money needs to change hands.\n`;
    } else {
      shareText += `💸 Who owes who:\n`;
      settlements.forEach(settlement => {
        shareText += `• ${getPersonName(settlement.from)} owes ${getPersonName(settlement.to)} $${settlement.amount.toFixed(2)}\n`;
      });
    }
    
    shareText += `\nCalculated with QuickSplit 📱`;
    return shareText;
  };

  const handleShareSMS = async () => {
    const message = generateShareText();
    const smsUrl = Platform.select({
      ios: `sms:&body=${encodeURIComponent(message)}`,
      android: `sms:?body=${encodeURIComponent(message)}`,
      default: `sms:?body=${encodeURIComponent(message)}`,
    });

    try {
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
        setShareModalVisible(false);
      } else {
        Alert.alert('Error', 'SMS is not available on this device.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open SMS app.');
    }
  };

  const handleShareEmail = async () => {
    const message = generateShareText();
    const subject = 'QuickSplit - Expense Split Results';
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
        setShareModalVisible(false);
      } else {
        Alert.alert('Error', 'Email is not available on this device.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open email app.');
    }
  };

  const handleNewSplit = () => {
    Alert.alert(
      'Start New Split',
      'This will clear all current data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Start New', 
          style: 'destructive',
          onPress: () => {
            resetSplit();
            router.replace('/');
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Feather name="check-circle" size={48} color="#10b981" />
          <Text style={styles.title}>Here's the Split!</Text>
          <Text style={styles.subtitle}>
            Total: ${totalExpenses.toFixed(2)} • {people.length} people
          </Text>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Expense Summary</Text>
          {expenses.map((expense) => (
            <View key={expense.id} style={styles.expenseItem}>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseName}>{expense.name}</Text>
                <Text style={styles.expenseDetails}>
                  ${expense.amount.toFixed(2)} • Paid by {getPersonName(expense.paidBy)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.settlementsContainer}>
          <Text style={styles.settlementsTitle}>Who Owes Who</Text>

          {settlements.length === 0 ? (
            <View style={styles.evenContainer}>
              <Feather name="check-circle" size={32} color="#10b981" />
              <Text style={styles.evenTitle}>Everyone is even!</Text>
              <Text style={styles.evenSubtitle}>
                No money needs to change hands. Perfect split! 🎉
              </Text>
            </View>
          ) : (
            <View style={styles.settlementsList}>
              {settlements.map((settlement, index) => (
                <View key={index} style={styles.settlementItem}>
                  <View style={styles.settlementInfo}>
                    <Text style={styles.settlementText}>
                      <Text style={styles.fromPerson}>{getPersonName(settlement.from)}</Text>
                      <Text style={styles.owesText}> owes </Text>
                      <Text style={styles.toPerson}>{getPersonName(settlement.to)}</Text>
                    </Text>
                    <Text style={styles.settlementAmount}>
                      ${settlement.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => setShareModalVisible(true)}
        >
          <Feather name="share-2" size={20} color="#ffffff" />
          <Text style={styles.shareButtonText}>Share Results</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.newSplitButton}
          onPress={handleNewSplit}
        >
          <Feather name="rotate-ccw" size={20} color="#0f766e" />
          <Text style={styles.newSplitButtonText}>New Split</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={shareModalVisible}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShareModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Results</Text>
              <TouchableOpacity
                onPress={() => setShareModalVisible(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Choose how you'd like to share the split results
            </Text>

            <View style={styles.shareOptions}>
              <TouchableOpacity
                style={styles.shareOption}
                onPress={handleShareSMS}
              >
                <View style={styles.shareIconContainer}>
                  <Feather name="message-square" size={28} color="#0f766e" />
                </View>
                <Text style={styles.shareOptionTitle}>SMS</Text>
                <Text style={styles.shareOptionDescription}>
                  Send via text message
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={handleShareEmail}
              >
                <View style={styles.shareIconContainer}>
                  <Feather name="mail" size={28} color="#0f766e" />
                </View>
                <Text style={styles.shareOptionTitle}>Email</Text>
                <Text style={styles.shareOptionDescription}>
                  Send via email
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
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
  summaryContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  expenseItem: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
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
  },
  settlementsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  settlementsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  evenContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  evenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 12,
    marginBottom: 8,
  },
  evenSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  settlementsList: {
    gap: 12,
  },
  settlementItem: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  settlementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settlementText: {
    fontSize: 16,
    flex: 1,
  },
  fromPerson: {
    fontWeight: '600',
    color: '#ef4444',
  },
  owesText: {
    color: '#64748b',
  },
  toPerson: {
    fontWeight: '600',
    color: '#10b981',
  },
  settlementAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
    marginLeft: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#0f766e',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  newSplitButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0f766e',
  },
  newSplitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f766e',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
    minHeight: 320,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  shareOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  shareOption: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  shareIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  shareOptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  shareOptionDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});