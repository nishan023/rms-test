import { useState, useEffect } from 'react';
import { X, Printer, Receipt, Search, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { payCash, payOnline, payMixed, payCredit } from '../../api/payment';
import { searchCreditAccountByPhone, createCreditAccount } from '../../api/credit';
import type { Order, PaymentMethod, DiscountType } from '../../types/order';
import toast from 'react-hot-toast';

interface ViewOrderDetailsModalProps {
    isOpen: boolean;
    order: Order | null;
    onClose: () => void;
}

const ViewOrderDetailsModal = ({ isOpen, order, onClose }: ViewOrderDetailsModalProps) => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
    const [discountType, setDiscountType] = useState<DiscountType>('PERCENT');
    const [discountValue, setDiscountValue] = useState<number>(0);
    const [finalAmount, setFinalAmount] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);

    // Credit payment states
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [customerFound, setCustomerFound] = useState<boolean | null>(null);
    const [foundCustomer, setFoundCustomer] = useState<any>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');

    // Normalize values when order changes
    useEffect(() => {
        if (order) {
            const baseAmount = Number(order.totalAmount ?? order.finalAmount ?? 0);
            setFinalAmount(Number(order.finalAmountAfterDiscount ?? baseAmount));
            setPaymentMethod(order.paymentMethod ?? 'CASH');
            setDiscountType(order.discountType ?? 'PERCENT');
            setDiscountValue(Number(order.discountValue ?? 0));

            // Pre-fill customer phone if available
            if (order.customerPhone) {
                setCustomerPhone(order.customerPhone);
            }
        }
    }, [order]);

    // Recalculate final amount whenever discount changes
    useEffect(() => {
        if (!order) return;

        const baseAmount = Number(order.totalAmount ?? order.finalAmount ?? 0);
        let calculated = baseAmount;

        if (discountValue > 0) {
            if (discountType === 'PERCENT') {
                calculated = baseAmount - (baseAmount * discountValue) / 100;
            } else {
                calculated = baseAmount - discountValue;
            }
        }

        setFinalAmount(Math.max(0, calculated));
    }, [discountValue, discountType, order]);

    // Reset credit states when payment method changes
    useEffect(() => {
        if (paymentMethod !== 'CREDIT') {
            setCustomerFound(null);
            setFoundCustomer(null);
            setShowCreateForm(false);
        }
    }, [paymentMethod]);

    const handleSearchCustomer = async () => {
        if (!customerPhone || customerPhone.length < 10) {
            toast.error('Please enter a valid phone number');
            return;
        }

        setIsSearching(true);
        setCustomerFound(null);
        setFoundCustomer(null);

        try {
            const response = await searchCreditAccountByPhone(customerPhone);

            if (response.data && response.data.length > 0) {
                const customer = response.data[0];
                setFoundCustomer(customer);
                setCustomerFound(true);
                setCustomerName(customer.fullName || customer.name);
                toast.success(`Customer found: ${customer.fullName || customer.name}`);
            } else {
                setCustomerFound(false);
                toast.error('Credit account not found');
            }
        } catch (error: any) {
            console.error('Search error:', error);
            setCustomerFound(false);
            toast.error('Credit account not found');
        } finally {
            setIsSearching(false);
        }
    };

    const handleCreateAccount = async () => {
        if (!newCustomerName || !customerPhone) {
            toast.error('Please enter both name and phone number');
            return;
        }

        try {
            const response = await createCreditAccount(newCustomerName, customerPhone);
            toast.success('Credit account created successfully!');
            setFoundCustomer(response.data);
            setCustomerFound(true);
            setCustomerName(newCustomerName);
            setShowCreateForm(false);
        } catch (error: any) {
            console.error('Create account error:', error);
            toast.error(error?.response?.data?.message || 'Failed to create credit account');
        }
    };

    const handleSavePayment = async () => {
        if (!order || isSaving) return;

        // Validate credit payment
        if (paymentMethod === 'CREDIT') {
            if (!customerFound || !customerPhone) {
                toast.error('Please search and verify customer before proceeding with credit payment');
                return;
            }
        }

        setIsSaving(true);
        try {
            const payload = {
                orderId: order.id,
                discount: discountValue > 0 ? {
                    type: discountType,
                    value: discountValue
                } : undefined,
                cashAmount: paymentMethod === 'CASH' || paymentMethod === 'MIXED' ? finalAmount : undefined,
                onlineAmount: paymentMethod === 'ONLINE' || paymentMethod === 'MIXED' ? finalAmount : undefined,
                customerPhone: paymentMethod === 'CREDIT' ? customerPhone : undefined,
            };

            switch (paymentMethod) {
                case 'CASH':
                    await payCash(payload);
                    break;
                case 'ONLINE':
                    await payOnline(payload);
                    break;
                case 'MIXED':
                    await payMixed({ ...payload, cashAmount: finalAmount / 2, onlineAmount: finalAmount / 2 });
                    break;
                case 'CREDIT':
                    await payCredit(payload);
                    break;
                default:
                    throw new Error('Invalid payment method');
            }

            toast.success('Payment details saved successfully!');
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || 'Failed to save payment details');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrint = () => {
        if (!order) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const baseAmount = Number(order.totalAmount ?? order.finalAmount ?? 0);
        const discountAmount = discountType === 'PERCENT'
            ? (baseAmount * discountValue) / 100
            : discountValue;

        const orderTitle = order.orderNumber || order.id.slice(0, 8);
        const tableLabel = order.table?.tableCode || order.tableNumber;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order #${orderTitle}</title>
                <style>
                    body { font-family: Arial; padding: 20px; max-width: 800px; margin: 0 auto; }
                    .header { text-align:center; border-bottom:2px solid #000; padding-bottom:10px; margin-bottom:20px; }
                    table { width:100%; border-collapse:collapse; margin:10px 0; }
                    th, td { padding:8px; text-align:left; border-bottom:1px solid #ddd; }
                    th { background-color:#f5f5f5; font-weight:bold; }
                    .totals { margin-top:20px; text-align:right; }
                    .totals div { margin:5px 0; }
                    .final-total { font-size:1.2em; font-weight:bold; border-top:2px solid #000; padding-top:10px; margin-top:10px; }
                    .payment-info { background-color:#f9f9f9; padding:15px; border-radius:5px; margin-top:20px; }
                    .footer { text-align:center; margin-top:30px; padding-top:20px; border-top:2px solid #000; }
                    @media print { body { padding:0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Restaurant Name</h1>
                    <p>Order Receipt</p>
                </div>
                <div><strong>Order Number:</strong> ${orderTitle}<br>
                ${tableLabel ? `<strong>Table:</strong> ${tableLabel}<br>` : ''}
                ${order.customerName ? `<strong>Customer Name:</strong> ${order.customerName}<br>` : ''}
                <strong>Date:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString()}<br>
                <strong>Status:</strong> ${order.status.toUpperCase()}</div>
                <h3>Items</h3>
                <table>
                    <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.menuItem.name}</td>
                                <td>${item.quantity}</td>
                                <td>Rs. ${Number(item.menuItem.price).toFixed(2)}</td>
                                <td>Rs. ${(Number(item.menuItem.price) * Number(item.quantity)).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="totals">
                    <div><strong>Subtotal:</strong> Rs. ${baseAmount.toFixed(2)}</div>
                    ${discountValue > 0 ? `<div><strong>Discount:</strong> ${discountType === 'PERCENT' ? `${discountValue}%` : `Rs. ${discountValue}`} (-Rs. ${discountAmount.toFixed(2)})</div>` : ''}
                    <div class="final-total"><strong>Final Amount:</strong> Rs. ${finalAmount.toFixed(2)}</div>
                </div>
                <div class="payment-info">
                    <h3>Payment Info</h3>
                    <strong>Method:</strong> ${paymentMethod.toUpperCase()}<br>
                    ${paymentMethod === 'CREDIT' ? '<p style="color:#d9534f;font-weight:bold;">⚠ To be added to credit ledger</p>' : ''}
                </div>
                <div class="footer">
                    <p>Thank you for your order!</p>
                    <p style="font-size:0.9em;color:#666;">Computer-generated receipt</p>
                </div>
                <script>window.onload=function(){window.print();}</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (!isOpen || !order) return null;

    const baseAmount = Number(order.totalAmount ?? order.finalAmount ?? 0);
    const discountAmount = discountType === 'PERCENT'
        ? (baseAmount * discountValue) / 100
        : discountValue;

    const modalTitle = order.orderNumber || order.id.slice(0, 8);
    const tableLabel = order.table?.tableCode || order.tableNumber;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Order #{modalTitle} {tableLabel ? `(${tableLabel})` : ''}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        {tableLabel && <div><p className="text-sm text-gray-600">Table</p><p className="font-semibold">{tableLabel}</p></div>}
                        {order.customerName && <div><p className="text-sm text-gray-600">Customer</p><p className="font-semibold">{order.customerName}</p></div>}
                        <div><p className="text-sm text-gray-600">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                                }`}>{order.status.toUpperCase()}</span>
                        </div>
                        {order.createdAt && <div><p className="text-sm text-gray-600">Time</p>
                            <p className="font-semibold">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>}
                    </div>

                    {/* Items Table */}
                    <div>
                        <h3 className="text-lg font-bold mb-3">Order Items</h3>
                        <table className="w-full border rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr><th className="px-4 py-3 text-left">Item</th><th className="px-4 py-3 text-center">Qty</th><th className="px-4 py-3 text-right">Price</th><th className="px-4 py-3 text-right">Subtotal</th></tr>
                            </thead>
                            <tbody className="divide-y">
                                {order.items.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">{item?.menuItem?.name}</td>
                                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right">Rs. {Number(item?.menuItem?.price).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            Rs. {(Number(item?.menuItem?.price) * Number(item.quantity)).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Payment & Discount */}
                    <div className="border-t pt-6 space-y-4">
                        <h3 className="text-lg font-bold">Payment Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {(['CASH', 'ONLINE', 'MIXED', 'CREDIT'] as const).map(method => (
                                <button key={method} onClick={() => setPaymentMethod(method)}
                                    className={`p-3 rounded-lg border-2 font-semibold transition-all ${paymentMethod === method ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                    <Receipt className="w-5 h-5 mx-auto mb-1" />{method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>

                        {/* Credit Payment Section */}
                        {paymentMethod === 'CREDIT' && (
                            <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-lg space-y-3">
                                <div className="flex items-center gap-2 text-orange-800 font-semibold">
                                    <Receipt className="w-5 h-5" />
                                    <span>Credit Payment - Customer Verification Required</span>
                                </div>

                                {/* Phone Search */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Customer Phone Number</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="tel"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            placeholder="Enter phone number"
                                            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                                            maxLength={10}
                                        />
                                        <button
                                            onClick={handleSearchCustomer}
                                            disabled={isSearching || customerPhone.length < 10}
                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <Search className="w-4 h-4" />
                                            {isSearching ? 'Searching...' : 'Search'}
                                        </button>
                                    </div>
                                </div>

                                {/* Search Result */}
                                {customerFound === true && foundCustomer && (
                                    <div className="bg-green-50 border-2 border-green-200 p-3 rounded-lg flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-green-800">Customer Found!</p>
                                            <p className="text-sm text-green-700">Name: {foundCustomer.fullName || foundCustomer.name}</p>
                                            <p className="text-sm text-green-700">Phone: {customerPhone}</p>
                                            {foundCustomer.totalDue && (
                                                <p className="text-sm text-green-700">Current Due: Rs. {Number(foundCustomer.totalDue).toFixed(2)}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {customerFound === false && !showCreateForm && (
                                    <div className="bg-red-50 border-2 border-red-200 p-3 rounded-lg space-y-3">
                                        <div className="flex items-start gap-3">
                                            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-red-800">Credit Account Not Found</p>
                                                <p className="text-sm text-red-700">No credit account exists for this phone number.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowCreateForm(true)}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Create New Credit Account
                                        </button>
                                    </div>
                                )}

                                {/* Create Account Form */}
                                {showCreateForm && (
                                    <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg space-y-3">
                                        <h4 className="font-semibold text-blue-800">Create New Credit Account</h4>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                                            <input
                                                type="text"
                                                value={newCustomerName}
                                                onChange={(e) => setNewCustomerName(e.target.value)}
                                                placeholder="Enter customer name"
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={customerPhone}
                                                disabled
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg bg-gray-100"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleCreateAccount}
                                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                                            >
                                                Create Account
                                            </button>
                                            <button
                                                onClick={() => setShowCreateForm(false)}
                                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <p className="text-sm text-orange-700 font-semibold">⚠ Amount will be added to customer's credit ledger</p>
                            </div>
                        )}

                        {/* Discount */}
                        {paymentMethod !== 'CREDIT' && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <label className="block text-sm font-semibold mb-2">Discount</label>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <button onClick={() => setDiscountType('PERCENT')} className={`p-2 rounded-lg border-2 font-semibold ${discountType === 'PERCENT' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-200 hover:border-gray-300'}`}>Percentage (%)</button>
                                    <button onClick={() => setDiscountType('FIXED')} className={`p-2 rounded-lg border-2 font-semibold ${discountType === 'FIXED' ? 'border-orange-600 bg-orange-50 text-orange-600' : 'border-gray-200 hover:border-gray-300'}`}>Amount (Rs.)</button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="number" min="0" max={discountType === 'PERCENT' ? 100 : baseAmount} value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600" />
                                    <span>{discountType === 'PERCENT' ? '%' : 'Rs.'}</span>
                                </div>
                                {discountValue > 0 && <p className="mt-2 text-sm text-green-600 font-semibold">Discount Applied: -Rs. {discountAmount.toFixed(2)}</p>}
                            </div>
                        )}

                        {/* Amount Summary */}
                        <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between text-gray-700"><span>Subtotal:</span><span>Rs. {baseAmount.toFixed(2)}</span></div>
                            {discountValue > 0 && paymentMethod !== 'CREDIT' && <div className="flex justify-between text-green-600"><span>Discount:</span><span>-Rs. {discountAmount.toFixed(2)}</span></div>}
                            <div className="flex justify-between text-xl font-bold border-t-2 pt-2"><span>Final Amount:</span><span className="text-orange-600">Rs. {finalAmount.toFixed(2)}</span></div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
                    <button
                        onClick={handleSavePayment}
                        disabled={isSaving || (paymentMethod === 'CREDIT' && !customerFound)}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Save Payment Details'}
                    </button>
                    <button onClick={handlePrint} className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"><Printer className="w-5 h-5" />Print Receipt</button>
                </div>
            </div>
        </div>
    );
};

export default ViewOrderDetailsModal;
