// Unit test for RestaurantService
import { PointsExpiryType, restaurantType } from '@prisma/client';
import { Request } from 'express';
import { RestaurantService } from '../../services/restaurant.service';

jest.mock('../../../../../../shared/prisma');
jest.mock('../../services/restaurant-monitor.service');

describe('RestaurantService', () => {
    let restaurantService: RestaurantService;
    
    const mockInput = {
        name: 'Test Restaurant',
        domain: 'test-restaurant',
        userId: 'test-user-id',
        adminId: 'test-admin-id',
        address: 'Test Address',
        email: 'test@example.com',
        phoneNumber: '+1234567890'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        restaurantService = new RestaurantService();
    });

    describe('createRestaurant', () => {
        it('should validate input data correctly', async () => {
            // Test input validation
            // {
            //     "name": "Aurora Restaurant",
            //     "domain": "aurora",
            //     "address": "123 Lake View Road, Gulshan-2, Dhaka",
            //     "latitude": "23.7945",
            //     "longitude": "90.4125",
            //     "phoneNumber": "+8801712345678",
            //     "email": "info@aurorarestaurant.com",
            //     "isSingleBranch":false,
            //     "logo": "https://example.com/aurora-logo.png",
            //     "description": "Experience fine dining with a modern twist at Aurora. Featuring panoramic lake views and innovative cuisine.",
            //     "socialMediaLinks": [
            //       "https://facebook.com/aurorarestaurant",
            //       "https://instagram.com/aurora.dining"
            //     ],
            //     "isActive": true,
            //     "ratings": 4.8,
            //     "featured": true,
            //     "settings": {
            //       "currency": "BDT",
            //       "currencySymbol": "৳",
            //       "timezone": "Asia/Dhaka",
            //       "timezoneOffset": 6,
            //       "baseDeliveryFee": 80,
            //       "deliveryFeeCalculationType": "FIXED",
            //       "minOrderAmount": 100,
            //       "maxOrderAmount": 50000,
            //       "taxPercentage": 5,
            //       "serviceChargePercentage": 10,
            //       "allowGuestCheckout": false,
            //       "requirePhoneNumber": true,
            //       "requireEmail": true,
              
            //       "takeoutEnabled": true,
            //       "takeoutServiceCharge": 0,
            //       "dineInEnabled": true,
            //       "dineInServiceCharge": 10,
            //       "globalMessage": "🌟 Welcome to Aurora - Where Every Meal Tells a Story",
            //       "globalMessageEnabled": true,
            //       "customerSupportEmail": "support@aurorarestaurant.com",
            //       "restaurantType": "FINE_DINING",
            //       "acceptsPreorders": true,
            //       "autoAssignRiders": true,
            //       "smsNotifications": true,
            //       "emailNotifications": true,
            //       "errorNotificationEmail": "tech@aurorarestaurant.com",
            //       "notifyOnCriticalErrors": true,
                  
            //       "autoResponseEnabled": true,
            //       "feedbackResponseDelay": 12
            //     },
            //     "pointSystem": {
            //       "isEnabled": true,
            //       "pointsRate": 1,
            //       "redemptionRate": 0.5,
            //       "minPointsRedeem": 100,
            //       "maxPointsRedeem": 1000,
            //       "minSpendForPoints": 500,
            //       "pointsExpiryDays": 365,
            //       "pointsExpiryType": "DAYS"
            //     }
            //   }
            const invalidInput = {
                name: '',
                domain: '',
                userId: '',
                adminId: '',
                address: '',
                email: '',
                phoneNumber: '',
                tenantId: '',
                restaurantType: 'FAST_FOOD' as restaurantType,
                latitude: '0',
                longitude: '0',
                settings: {
                    currency: 'BDT',
                    currencySymbol: '৳',
                    timezone: 'Asia/Dhaka',
                    baseDeliveryFee: 0,
                },
                pointsSystem: {
                  "isEnabled": true,
                  "pointsRate": 1,
                  "redemptionRate": 0.5,
                  "minPointsRedeem": 100,
                  "maxPointsRedeem": 1000,
                  "minSpendForPoints": 500,
                  "pointsExpiryDays": 365,
                  "pointsExpiryType": "DAYS" as PointsExpiryType
                }
              

            };
            await expect(restaurantService.createRestaurant(invalidInput, {} as Request)).rejects.toThrow('Invalid input data');
        });

        it('should check for existing restaurant', async () => {
            // Test duplicate check
        });

        it('should create restaurant with all required entities', async () => {
            // Test complete creation flow
        });
    });
});