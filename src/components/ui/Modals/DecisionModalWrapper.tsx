import React, { createContext, useContext, useState, useCallback } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Portal, Dialog, useTheme } from "react-native-paper";

// --- TYPES ---

interface DecisionConfig {
  /** Custom React nodes for the header section (e.g., Icons + Title) */
  title?: React.ReactNode;
  /** Custom React nodes for the scrollable middle section */
  body?: React.ReactNode;
  /** Custom React nodes for the action section (usually Buttons) */
  footer?: React.ReactNode;
}

interface DecisionContextType {
  /** Opens the generic modal with a custom configuration */
  showDecision: (config: DecisionConfig) => void;
  /** Programmatically closes the modal */
  hideDecision: () => void;
  /** State utility if your buttons need to show loading spinners */
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
}

// --- CONTEXT ---

const DecisionContext = createContext<DecisionContextType | undefined>(
  undefined,
);

// --- PROVIDER COMPONENT ---

/**
 * DecisionProvider - Wrap your root layout with this to enable global modals.
 */
export const DecisionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [config, setConfig] = useState<DecisionConfig | null>(null);

  const showDecision = useCallback((newConfig: DecisionConfig) => {
    setConfig(newConfig);
    setVisible(true);
  }, []);

  const hideDecision = useCallback(() => {
    setVisible(false);
    // Cleanup config after the animation finishes
    setTimeout(() => {
      setConfig(null);
      setProcessing(false);
    }, 200);
  }, []);

  return (
    <DecisionContext.Provider
      value={{
        showDecision,
        hideDecision,
        isProcessing: processing,
        setIsProcessing: setProcessing,
      }}
    >
      {children}
      <DecisionModalWrapper
        visible={visible}
        onDismiss={hideDecision}
        title={config?.title}
        body={config?.body}
        footer={config?.footer}
      />
    </DecisionContext.Provider>
  );
};

// --- HOOK ---

/**
 * useDecisionModal - The primary hook to trigger modals from any screen.
 */
export const useDecisionModal = () => {
  const context = useContext(DecisionContext);
  if (!context)
    throw new Error("useDecisionModal must be used within a DecisionProvider");
  return context;
};

// --- PRIVATE UI WRAPPER ---

/**
 * DecisionModalWrapper - The MD3 styled shell.
 * Private component used only by the Provider.
 */
const DecisionModalWrapper = ({
  visible,
  onDismiss,
  title,
  body,
  footer,
}: { visible: boolean; onDismiss: () => void } & DecisionConfig) => {
  const theme = useTheme();

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={[
          s.dialog,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant,
            borderWidth: 1,
          },
        ]}
      >
        {title && <View style={s.header}>{title}</View>}

        <Dialog.ScrollArea style={s.scrollArea}>
          <ScrollView
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {body}
          </ScrollView>
        </Dialog.ScrollArea>

        {footer && <View style={s.footer}>{footer}</View>}
      </Dialog>
    </Portal>
  );
};

// --- STYLES ---

const s = StyleSheet.create({
  dialog: {
    borderRadius: 24, // xl radius
    elevation: 0,
    overflow: "hidden",
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  scrollArea: {
    paddingHorizontal: 0,
    maxHeight: 450,
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  footer: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
});
