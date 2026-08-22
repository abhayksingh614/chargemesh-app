import React from 'react';
import { AppModal, ModalType, ModalPerkOrDetail } from './AppModal';

interface StatusModalProps {
  visible: boolean;
  type?: ModalType;
  title: string;
  message?: string;
  badge?: string;
  iconEmoji?: string;
  details?: ModalPerkOrDetail[];
  buttonLabel?: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  visible,
  type = 'info',
  title,
  message,
  badge,
  iconEmoji,
  details,
  buttonLabel = 'Got It',
  onClose,
  onConfirm,
}) => {
  return (
    <AppModal
      visible={visible}
      type={type}
      title={title}
      subtitle={message}
      badge={badge}
      iconEmoji={iconEmoji}
      details={details}
      onClose={onClose}
      primaryAction={{
        label: buttonLabel,
        onPress: () => {
          if (onConfirm) {
            onConfirm();
          }
          onClose();
        },
      }}
    />
  );
};
