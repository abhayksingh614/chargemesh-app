import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { AppModal } from './AppModal';
import { colors, spacing, borderRadius } from '../theme';

export interface FormInputField {
  key: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  required?: boolean;
}

interface FormInputModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  badge?: string;
  iconEmoji?: string;
  fields: FormInputField[];
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void | Promise<void>;
}

export const FormInputModal: React.FC<FormInputModalProps> = ({
  visible,
  title,
  subtitle,
  badge = 'Form Input',
  iconEmoji = '✏️',
  fields,
  submitLabel = 'Submit',
  onClose,
  onSubmit,
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fields.forEach((f) => {
      initial[f.key] = f.defaultValue || '';
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(formValues);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AppModal
      visible={visible}
      type="input"
      badge={badge}
      iconEmoji={iconEmoji}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      primaryAction={{
        label: submitLabel,
        onPress: handleSubmit,
        loading: isSubmitting,
      }}
      dismissLabel="Cancel"
    >
      <View style={styles.formContainer}>
        {fields.map((field) => (
          <View key={field.key} style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {field.label.toUpperCase()}
              {field.required && <Text style={styles.requiredStar}> *</Text>}
            </Text>
            <TextInput
              style={[styles.input, field.multiline && styles.multilineInput]}
              placeholder={field.placeholder}
              placeholderTextColor={colors.textMuted}
              value={formValues[field.key] || ''}
              onChangeText={(val) => handleChange(field.key, val)}
              secureTextEntry={field.secureTextEntry}
              keyboardType={field.keyboardType || 'default'}
              multiline={field.multiline}
              numberOfLines={field.multiline ? 3 : 1}
            />
          </View>
        ))}
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    marginVertical: spacing.xs,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  requiredStar: {
    color: colors.danger,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  multilineInput: {
    height: 72,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
});
