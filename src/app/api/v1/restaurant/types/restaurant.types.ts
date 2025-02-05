export enum RestaurantSetupState {
    INITIALIZED = 'INITIALIZED',
    PERMISSIONS_SEEDED = 'PERMISSIONS_SEEDED',
    RESTAURANT_CREATED = 'RESTAURANT_CREATED',
    BRANCH_CREATED = 'BRANCH_CREATED',
    ROLES_CREATED = 'ROLES_CREATED',
    ADMIN_SETUP = 'ADMIN_SETUP',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

export interface RestaurantSetupContext {
    currentState: RestaurantSetupState;
    restaurant?: any;
    branch?: any;
    roles?: any;
    error?: Error;
} 