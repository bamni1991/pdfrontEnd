import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

/**
 * Navigates to a specific screen.
 * @param {string} name - The name of the route to navigate to.
 * @param {object} params - The parameters to pass to the route.
 */
export function navigate(name, params) {
  // Ensure the navigation container is ready before attempting to navigate
  if (navigationRef.isReady()) {
    // The type assertion is needed because the navigator's state is not known at this level
    // but we are confident in the structure we are calling.
    navigationRef.navigate(name, params);
  } else {
    // You can decide what to do if the navigator is not ready.
    // You can queue this action and retry, or log an error.
    console.warn("Navigation attempted before the container was ready.");
  }
}