import { userContext } from "../middlewares/user-context.middleware";

export function getUserContext() {
  const context = userContext.getStore();
  console.log(context, "context");
  if (!context) {
    throw new Error("User context not available");
  }
  return context;
}

export function getCurrentUserId() {
  const context = getUserContext();
  return context;
}
