import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { useMenuStore } from '../../store/useMenuStore';
import { useCartStore } from '../../store/useCartStore';
import { createOrder } from '../../api/orders';
import axios from 'axios';
import type { MenuItem } from '../../types/menu';

const AdminCreateOrderView: React.FC = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { table } = state || {};

    const { fetchAll, categories, items: menuItems } = useMenuStore();
    const { items: cartItems, addItem, removeItem, updateQuantity, clearCart, getTotalAmount } = useCartStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    useEffect(() => {
        fetchAll().catch(err => console.error('Failed to fetch menu:', err));
    }, [fetchAll]);

    if (!table) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <p className="text-red-600 font-semibold">No table selected. Please go back and select a table.</p>
                <button onClick={() => navigate('/admin/orders')} className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700 transition-colors">
                    Go Back to Orders
                </button>
            </div>
        );
    }

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty.');
            return;
        }
        setIsPlacingOrder(true);
        try {
            const orderPayload = {
                items: cartItems.map(item => ({ menuItemId: item.id, quantity: item.quantity })),
                customerType: table.tableCode === 'Walk-in' ? 'WALK_IN' : 'DINE_IN' as 'WALK_IN' | 'DINE_IN',
                tableCode: table.tableCode,
            };
            await createOrder(orderPayload);
            clearCart();
            navigate('/admin/orders');
        } catch (error: unknown) {
            console.error('Error placing order:', error);
            let message = 'Failed to place order.';
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || error.message;
            } else if (error instanceof Error) {
                message = error.message;
            }
            alert(message);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const filteredItems = menuItems.filter(item => {
        const matchesCat = selectedCategory === 'All' ? true : item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                            <ArrowLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">Create Order: <span className="text-orange-600">{table.tableCode}</span></h1>
                    </div>
                </header>

                <div className="p-4">
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" placeholder="Search menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button onClick={() => setSelectedCategory('All')} className={`px-4 py-2 rounded-full font-semibold text-sm ${selectedCategory === 'All' ? 'bg-orange-600 text-white' : 'bg-white'}`}>All</button>
                        {categories.map(cat => (
                            <button key={cat.categoryId} onClick={() => setSelectedCategory(cat.categoryName)} className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap ${selectedCategory === cat.categoryName ? 'bg-orange-600 text-white' : 'bg-white'}`}>{cat.categoryName}</button>
                        ))}
                    </div>
                </div>

                <main className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredItems.map((item: MenuItem) => (
                        <div key={item.id} className="bg-white rounded-lg shadow p-3 flex flex-col">
                            <div>
                                <h3 className="font-bold text-base text-gray-800">{item.name}</h3>
                                <p className="text-sm text-gray-600 font-semibold">Rs. {item.price}</p>
                            </div>
                            <button onClick={() => addItem(item)} disabled={!item.isAvailable} className="mt-3 w-full py-1.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-300 transition-colors text-sm">
                                {item.isAvailable ? 'Add' : 'Unavailable'}
                            </button>
                        </div>
                    ))}
                </main>
            </div>

            <aside className="w-80 bg-white shadow-lg flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {cartItems.length === 0 ? (
                        <p className="text-gray-500 text-center mt-8">Cart is empty</p>
                    ) : cartItems.map(item => (
                        <div key={item.id} className="flex items-center mb-4 bg-gray-50 p-2 rounded-lg">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                <p className="text-sm text-gray-600">Rs. {item.price}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"><Minus className="w-4 h-4" /></button>
                                <span className="font-bold w-6 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"><Plus className="w-4 h-4" /></button>
                                <button onClick={() => removeItem(item.id)} className="p-1 rounded-full hover:bg-red-100"><Trash2 className="w-4 h-4 text-red-500" /></button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t bg-white">
                    <div className="flex justify-between font-bold text-xl mb-4">
                        <span>Total</span>
                        <span>Rs. {getTotalAmount()}</span>
                    </div>
                    <button onClick={handlePlaceOrder} disabled={isPlacingOrder || cartItems.length === 0} className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition-colors">
                        {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                    </button>
                </div>
            </aside>
        </div>
    );
};

export default AdminCreateOrderView;
