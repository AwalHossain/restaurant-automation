import { logger } from "../../../../../shared/logger";
import { RestaurantSetupContext, RestaurantSetupState } from "../types/restaurant.types";

export class RestaurantMonitorService {
    async trackSetupProgress(context: RestaurantSetupContext) {

        const logData = {
            state: context.currentState,
            restaurantId: context.restaurant?.id,
            timestamp: new Date(),
            error: context.error ? {
                message: context.error.message,
                stack: context.error.stack,
                name: context.error.name,
            } : null,
        };

        switch (context.currentState) {
            case RestaurantSetupState.FAILED    :
                logger.error('Restaurant Setup Failed', logData);
                break;
            case RestaurantSetupState.COMPLETED:
                logger.info('Restaurant Setup Completed', logData);
                break;
            default:
                logger.info('Restaurant Setup Progress', logData);
                break;
        }



        // Log to monitoring system
        // await logger.info('Restaurant Setup Progress', {
        //     state: context.currentState,
        //     restaurantId: context.restaurant?.id,
        //     timestamp: new Date(),
        // });

        // Alert on failures
   
    }
    private async sendAlertToMonitoringSystem(context: RestaurantSetupContext) {
       try {
        // You can implement different alert mechanisms:
            // 1. Email notification
            // await this.emailService.sendErrorAlert({...})


            // 2. Slack notification
            // await this.slackService.sendAlert({...})

            // 3. Error monitoring service (e.g., Sentry)
            // Sentry.captureException(context.error)

            // 4. SMS alert for critical failures
            // await this.smsService.sendAlert({...})

            const alertData = {
                error: context.error,
                restaurant: context.restaurant,
                timestamp: new Date(),
                environment: process.env.NODE_ENV,
                lastState: context.currentState
            };

            // Example using email
            // await this.emailService.sendToDevs({
            //     subject: 'ALERT: Restaurant Creation Failed',
            //     data: alertData
            // });

        } catch (alertError) {
            // If alert sending fails, log to backup system
             logger.error('Failed to send dev alert', {
                originalError: context.error,
                alertError
            });
        }
    }
} 