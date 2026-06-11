import React from 'react'
import { View, Text, TouchableOpacity, Modal as RNModal, StyleSheet } from 'react-native'
import { useTheme } from '../theme/ThemeContext'
import { spacing, fontSize, borderRadius } from '../theme/spacing'

interface ModalProps {
  visible: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  const { colors } = useTheme()

  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.close, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: fontSize.lg, fontWeight: '700' },
  close: { fontSize: fontSize.lg, padding: spacing.sm },
})
