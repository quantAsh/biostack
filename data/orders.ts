import { Order } from '../types';

export const mockOrders: Order[] = [
    {
        id: 'ord_1001',
        user_id: 'user-ben-g',
        userName: 'Ben G.',
        product_id: 'prod_oura',
        productName: 'Oura Ring Gen3',
        date: new Date(Date.now() - 1 * 86400000), // 1 day ago
        status: 'Shipped',
        trackingNumber: '1Z999AA10123456784',
        shippingAddress: '123 Biohacker Lane, Silicon Valley, CA 94043',
    },
    {
        id: 'ord_1002',
        user_id: 'user-sleephacker-99',
        userName: 'SleepHacker_99',
        product_id: 'prod_eight_sleep',
        productName: 'Eight Sleep Pod 3',
        date: new Date(Date.now() - 2 * 86400000), // 2 days ago
        status: 'Pending',
        shippingAddress: '456 Dream Street, Austin, TX 78701',
    },
    {
        id: 'ord_1003',
        user_id: 'user-anya-sharma',
        userName: 'Dr. Anya Sharma',
        product_id: 'prod_levels',
        productName: 'Levels CGM Kit',
        date: new Date(Date.now() - 5 * 86400000), // 5 days ago
        status: 'Delivered',
        trackingNumber: '9400111202508852123456',
        shippingAddress: '789 Wellness Way, Boston, MA 02110',
    }
];
