import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { AppModal } from './AppModal';
import { spacing, borderRadius } from '../theme';
import { useTheme } from '../context';

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
  const { theme, mode } = useTheme();
  const isDark = mode === 'dark';

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
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              {field.label.toUpperCase()}
              {field.required && <Text style={styles.requiredStar}> *</Text>}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : theme.surfaceSecondary,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                },
                field.multiline && styles.multilineInput,
              ]}
              placeholder={field.placeholder}
              placeholderTextColor={theme.textMuted}
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
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  requiredStar: {
    color: '#EF4444',
  },
  input: {
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  multilineInput: {
    height: 72,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
});
