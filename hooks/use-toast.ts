"use client";

import React, { useCallback, useState } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}

interface ToastState {
  toasts: Toast[];
}

const toastTimeouts = new Map<string, NodeJS.Timeout>();

let toastCount = 0;
const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(action: {
  type: "ADD_TOAST" | "UPDATE_TOAST" | "DISMISS_TOAST" | "REMOVE_TOAST";
  toast?: Partial<Toast>;
  toastId?: string;
}) {
  switch (action.type) {
    case "ADD_TOAST": {
      if (!action.toast) break;

      const id = action.toast.id || `toast-${++toastCount}`;
      const toast: Toast = {
        ...action.toast,
        id,
      };

      memoryState = {
        ...memoryState,
        toasts: [...memoryState.toasts, toast],
      };

      // Auto dismiss after 5 seconds
      const timeout = setTimeout(() => {
        dispatch({
          type: "DISMISS_TOAST",
          toastId: id,
        });
      }, 5000);

      toastTimeouts.set(id, timeout);
      break;
    }

    case "UPDATE_TOAST": {
      if (!action.toast?.id) break;

      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.map((t) =>
          t.id === action.toast!.id ? { ...t, ...action.toast } : t
        ),
      };
      break;
    }

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        const timeout = toastTimeouts.get(toastId);
        if (timeout) {
          clearTimeout(timeout);
          toastTimeouts.delete(toastId);
        }

        // Add a small delay before removing to allow for exit animations
        setTimeout(() => {
          dispatch({
            type: "REMOVE_TOAST",
            toastId,
          });
        }, 100);
      } else {
        memoryState = {
          ...memoryState,
          toasts: memoryState.toasts.map((t) => ({
            ...t,
            open: false,
          })),
        };
      }
      break;
    }

    case "REMOVE_TOAST": {
      if (!action.toastId) break;

      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
      };
      break;
    }
  }

  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function toast({
  title,
  description,
  action,
  variant = "default",
  ...props
}: Omit<Toast, "id"> & {
  id?: string;
}) {
  const id = props.id || `toast-${++toastCount}`;

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      title,
      description,
      action,
      variant,
    },
  });

  return {
    id,
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
    update: (props: Partial<Toast>) =>
      dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } }),
  };
}

export function useToast() {
  const [state, setState] = useState<ToastState>(memoryState);

  const addListener = useCallback((listener: (state: ToastState) => void) => {
    listeners.push(listener);

    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  // Subscribe to state changes
  React.useEffect(() => {
    const unsubscribe = addListener(setState);
    return unsubscribe;
  }, [addListener]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}
