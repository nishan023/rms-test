import { create } from 'zustand';
import { createOrder, getOrders, preparingOrder, serveOrder, getOrderHistory } from '../api/orders';
import api from '../api/axios';
import { socket } from '../api/socket';
import toast from 'react-hot-toast';
import type { Order, OrderStatus } from '../types/order';

interface OrderStore {
    orders: Order[];
    historyOrders: Order[]; // Added historyOrders to keep them separate
    currentOrder: Order | null;
    selectedStatus: string;
    searchQuery: string;
    isLoading: boolean;
    error: string | null;
    isHistoryMode: boolean;

    fetchOrders: () => Promise<void>;
    fetchHistory: () => Promise<void>; // New action
    updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
    setCurrentOrder: (order: Order | null) => void;
    setSelectedStatus: (status: string) => void;
    setSearchQuery: (query: string) => void;
    getFilteredOrders: () => Order[];
    getOrderById: (id: string) => Order | null;
    addOrder: (order: any) => Promise<void>;
    updateOrder: (orderId: string, updates: Partial<Order>) => void;
    initializeSocket: () => () => void;
    setIsHistoryMode: (isHistory: boolean) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
    orders: [],
    historyOrders: [],
    currentOrder: null,
    selectedStatus: 'all',
    searchQuery: '',
    isLoading: false,
    error: null,
    isHistoryMode: false,

    fetchOrders: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await getOrders();

            const ordersWithDefaults = (data.orders || data || []).map((order: any) => ({
                ...order,
                id: order.id || order._id || `order-${Date.now()}-${Math.random()}`,
                status: order.status || 'pending',
                items: order.items || [],
                totalAmount: Number(order.totalAmount || order.finalAmount || 0),
                tableNumber: order.table?.tableCode || order.tableNumber || (order.tableCode ? order.tableCode : undefined)
            }));

            set({ orders: ordersWithDefaults, isLoading: false });
        } catch (error) {
            console.error('Error fetching orders:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch orders',
                isLoading: false,
                orders: []
            });
        }
    },

    fetchHistory: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await getOrderHistory();
            const historyWithDefaults = (data.orders || data || []).map((order: any) => ({
                ...order,
                id: order.id || order._id || `order-history-${Date.now()}`,
                status: 'paid',
                items: order.items || [],
                totalAmount: Number(order.totalAmount || order.finalAmount || 0),
                tableNumber: order.table?.tableCode || order.tableNumber || (order.tableCode ? order.tableCode : undefined)
            }));
            set({ historyOrders: historyWithDefaults, isLoading: false });
        } catch (error) {
            console.error('Error fetching history:', error);
            set({ error: 'Failed to fetch order history', isLoading: false, historyOrders: [] });
        }
    },

    setIsHistoryMode: (isHistory: boolean) => {
        set({ isHistoryMode: isHistory, selectedStatus: 'all' });
        if (isHistory) {
            get().fetchHistory();
        } else {
            get().fetchOrders();
        }
    },

    addOrder: async (order: any) => {
        const payload = {
            customerType: "WALK_IN" as const,
            customerName: order.customerName,
            items: order.items.map((item: any) => ({
                menuItemId: item?.id,
                quantity: item.quantity ?? 1,
            })),
        };

        try {
            const response = await createOrder(payload);
            const newOrder = response.order || response;

            // Map the new order to match the store's expected format
            const mappedOrder = {
                ...newOrder,
                tableNumber: newOrder.table?.tableCode || newOrder.tableNumber || "WALK_IN"
            };

            set((state) => ({
                orders: [mappedOrder, ...state.orders]
            }));
            toast.success("Order placed successfully!");
        } catch (error: any) {
            toast.error(error?.message || "Failed to place order.");
            throw error;
        }
    },

    initializeSocket: () => {
        const { fetchOrders, fetchHistory } = get();

        // Listen for new orders
        socket.on('order:new', (data) => {
            console.log('New order received via socket:', data);
            if (!get().isHistoryMode) fetchOrders();
            toast('New Order Received!', { icon: '🔔' });
        });

        // Listen for order updates
        socket.on('order:updated', (data) => {
            console.log('Order update received via socket:', data);
            if (get().isHistoryMode) fetchHistory();
            else fetchOrders();
            toast('Order Updated', { icon: '📝' });
        });

        return () => {
            socket.off('order:new');
            socket.off('order:updated');
        };
    },

    updateOrderStatus: async (orderId: string, newStatus: OrderStatus) => {
        try {
            if (newStatus === 'preparing') {
                await preparingOrder(orderId);
            } else if (newStatus === 'served') {
                await serveOrder(orderId);
            } else {
                const response = await api.patch(`/admin/orders/${orderId}`, { status: newStatus });
                if (response.status !== 200) throw new Error('Failed to update order status');
            }

            set((state) => ({
                orders: state.orders.map((order) =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ),
            }));

            toast.success(`Order marked as ${newStatus}`);
        } catch (error) {
            console.error('Error updating order status:', error);
            const msg = error instanceof Error ? error.message : 'Failed to update order';
            set({ error: msg });
            toast.error(msg);
        }
    },

    setCurrentOrder: (order: Order | null) => {
        set({ currentOrder: order });
    },

    setSelectedStatus: (status: string) => {
        set({ selectedStatus: status });
    },

    setSearchQuery: (query: string) => {
        set({ searchQuery: query });
    },

    getFilteredOrders: () => {
        const { orders, historyOrders, selectedStatus, searchQuery, isHistoryMode } = get();

        // Separate History (Paid) from Active Management
        let baseOrders = isHistoryMode ? historyOrders : orders;

        let filtered = baseOrders;

        // Filter by status tabs
        if (selectedStatus !== 'all' && !isHistoryMode) {
            filtered = filtered.filter((order) => order.status === selectedStatus);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((order) => {
                const tableCode = (order.table?.tableCode || order.tableNumber || "").toLowerCase();
                const customerName = (order.customerName || "").toLowerCase();
                const customerPhone = (order.customerPhone || "").toLowerCase();
                const orderNumber = (order.orderNumber || "").toLowerCase();

                return (
                    tableCode.includes(query) ||
                    customerName.includes(query) ||
                    customerPhone.includes(query) ||
                    orderNumber.includes(query)
                );
            });
        }

        return filtered;
    },

    getOrderById: (id: string) => {
        const { orders } = get();
        return orders.find((o) => o.id === id || o.orderNumber === id) || null;
    },

    updateOrder: (orderId: string, updates: Partial<Order>) => {
        set((state) => ({
            orders: state.orders.map((order) =>
                order.id === orderId ? { ...order, ...updates } : order
            ),
        }));
    }
}));