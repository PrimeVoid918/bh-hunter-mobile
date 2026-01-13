import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Portal } from "@gorhom/portal";
import { View } from "react-native";
import EditStateContextSwitcherButtons from "./EditStateContextSwitcherButtons";

type Callbacks = {
  onEdit?: () => void;
  onSave?: () => void;
  onDiscard?: () => void;
};

type ContextType = {
  showButtons: (callbacks?: Callbacks) => void;
  hideButtons: () => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
};

const Context = createContext<ContextType | undefined>(undefined);

export const useEditStateContextSwitcherButtons = () => {
  const context = useContext(Context);
  if (!context)
    throw new Error(
      "useEditStateContextSwitcherButtons must be used within provider"
    );
  return context;
};

export const GlobalEditStateContextSwitcherButtonsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // ← Now shared
  const [callbacks, setCallbacks] = useState<Callbacks>({});

  const showButtons = useCallback((cbs?: Callbacks) => {
    if (cbs) setCallbacks(cbs);
    setIsVisible(true);
  }, []);

  const hideButtons = useCallback(() => {
    setIsVisible(false);
    // setIsEditing(false); // optional: reset when hiding
  }, []);

  const value = {
    showButtons,
    hideButtons,
    isEditing,
    setIsEditing,
  };

  return (
    <Context.Provider value={value}>
      {children}

      <Portal name="EditContextSwitchingPortal">
        {isVisible && (
          <View style={{ position: "absolute", right: 5, top: 15 }}>
            <EditStateContextSwitcherButtons
              isEditing={isEditing}
              onEdit={callbacks.onEdit}
              onSave={callbacks.onSave}
              onDiscard={callbacks.onDiscard}
            />
          </View>
        )}
      </Portal>
    </Context.Provider>
  );
};
