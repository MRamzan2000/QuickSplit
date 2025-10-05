import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Plus, X, Users, ArrowRight } from 'lucide-react-native';
import { useSplit } from '@/contexts/SplitContext';

export default function AddPeopleScreen() {
  const { people, setPeople } = useSplit();
  const [newPersonName, setNewPersonName] = useState<string>('');

  const addPerson = () => {
    if (newPersonName.trim()) {
      const newPerson = {
        id: Date.now().toString(),
        name: newPersonName.trim(),
      };
      setPeople([...people, newPerson]);
      setNewPersonName('');
    }
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(person => person.id !== id));
  };

  const handleContinue = () => {
    if (people.length < 2) {
      Alert.alert('Need More People', 'Please add at least 2 people to split expenses.');
      return;
    }
    router.push('/add-expenses');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Users size={32} color="#0f766e" />
          <Text style={styles.title}>Who's splitting?</Text>
          <Text style={styles.subtitle}>Add 2-10 people to your group</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter person's name"
            value={newPersonName}
            onChangeText={setNewPersonName}
            onSubmitEditing={addPerson}
            returnKeyType="done"
            maxLength={30}
          />
          <TouchableOpacity
            style={[styles.addButton, !newPersonName.trim() && styles.addButtonDisabled]}
            onPress={addPerson}
            disabled={!newPersonName.trim()}
          >
            <Plus size={20} color={newPersonName.trim() ? '#ffffff' : '#94a3b8'} />
          </TouchableOpacity>
        </View>

        <View style={styles.peopleList}>
          {people.map((person, index) => (
            <View key={person.id} style={styles.personItem}>
              <View style={styles.personInfo}>
                <View style={styles.personAvatar}>
                  <Text style={styles.personInitial}>
                    {person.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.personName}>{person.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePerson(person.id)}
              >
                <X size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {people.length > 0 && (
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {people.length} {people.length === 1 ? 'person' : 'people'} added
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, people.length < 2 && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={people.length < 2}
        >
          <Text style={[styles.continueButtonText, people.length < 2 && styles.continueButtonTextDisabled]}>
            Continue to Add Expenses
          </Text>
          <ArrowRight size={20} color={people.length >= 2 ? '#ffffff' : '#94a3b8'} />
        </TouchableOpacity>
      </View>
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
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  addButton: {
    backgroundColor: '#0f766e',
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  peopleList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  personItem: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f766e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  personInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  personName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  summary: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  summaryText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
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
});