import { useState, useEffect } from 'react';
import { X, Printer, Receipt, Search, CheckCircle, XCircle, UserPlus } from 'lucide-react';
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
    const [discountValue, setDiscountValue] = useState<number | ''>(0);
    const [finalAmount, setFinalAmount] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);

    // Credit payment states
    const [customerPhone, setCustomerPhone] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [customerFound, setCustomerFound] = useState<boolean | null>(null);
    const [foundCustomer, setFoundCustomer] = useState<any>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');

    useEffect(() => {
        if (order) {
            const baseAmount = Number(order.totalAmount ?? order.finalAmount ?? 0);
            setFinalAmount(Number(order.finalAmountAfterDiscount ?? baseAmount));
            setPaymentMethod(order.paymentMethod ?? 'CASH');
            setDiscountType(order.discountType ?? 'PERCENT');
            setDiscountValue(Number(order.discountValue ?? 0));
            if (order.customerPhone) setCustomerPhone(order.customerPhone);
        }
    }, [order]);

    useEffect(() => {
        if (!order) return;
        const baseAmount = Number(order.totalAmount ?? order.finalAmount ?? 0);
        let calculated = baseAmount;
        const value = typeof discountValue === 'number' ? discountValue : 0;
        if (value > 0) {
            if (discountType === 'PERCENT') calculated = baseAmount - (baseAmount * value) / 100;
            else calculated = baseAmount - value;
        }
        setFinalAmount(Math.max(0, calculated));
    }, [discountValue, discountType, order]);

    const baseAmount = order ? Number(order.totalAmount ?? order.finalAmount ?? 0) : 0;
    const currentDiscountValue = typeof discountValue === 'number' ? discountValue : 0;
    const discountAmount = discountType === 'PERCENT' ? (baseAmount * currentDiscountValue) / 100 : currentDiscountValue;

    const handleSearchCustomer = async () => {
        if (!customerPhone || customerPhone.length < 10) {
            toast.error('Enter a valid phone number');
            return;
        }
        setIsSearching(true);
        setCustomerFound(null);
        try {
            const response = await searchCreditAccountByPhone(customerPhone);
            if (response.data?.length > 0) {
                setFoundCustomer(response.data[0]);
                setCustomerFound(true);
                toast.success('Customer found');
            } else {
                setCustomerFound(false);
            }
        } catch (error) {
            setCustomerFound(false);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCreateAccount = async () => {
        if (!newCustomerName || !customerPhone) return toast.error('Name/Phone required');
        try {
            const response = await createCreditAccount(newCustomerName, customerPhone);
            setFoundCustomer(response.data);
            setCustomerFound(true);
            setShowCreateForm(false);
            toast.success('Account created');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to create account');
        }
    };

    const handleSavePayment = async () => {
        if (!order || isSaving) return;
        if (paymentMethod === 'CREDIT' && !customerFound) return toast.error('Verify customer for credit');

        setIsSaving(true);
        try {
            const val = typeof discountValue === 'number' ? discountValue : 0;
            const payload = {
                orderId: order.id,
                discount: val > 0 ? { type: discountType, value: val } : undefined,
                cashAmount: paymentMethod === 'CASH' || paymentMethod === 'MIXED' ? finalAmount : undefined,
                onlineAmount: paymentMethod === 'ONLINE' || paymentMethod === 'MIXED' ? finalAmount : undefined,
                customerPhone: paymentMethod === 'CREDIT' ? customerPhone : undefined,
            };

            if (paymentMethod === 'CASH') await payCash(payload);
            else if (paymentMethod === 'ONLINE') await payOnline(payload);
            else if (paymentMethod === 'MIXED') await payMixed({ ...payload, cashAmount: finalAmount / 2, onlineAmount: finalAmount / 2 });
            else if (paymentMethod === 'CREDIT') await payCredit(payload);

            toast.success('Payment saved');
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Error saving payment');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrint = () => {
        if (!order) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const orderTitle = order.orderNumber || order.id.slice(0, 8);
        const tableLabel = order.table?.tableCode || order.tableNumber;

        printWindow.document.write(`
            <html>
            <head><title>Receipt #${orderTitle}</title><style>
                body { font-family: sans-serif; padding: 20px; font-size: 14px; }
                .text-center { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border-bottom: 1px solid #ddd; padding: 8px; text-align: left; }
                .total { text-align: right; margin-top: 10px; font-weight: bold; }
            </style></head>
            <body>
                <h2 class="text-center">Order Receipt</h2>
                <p>Order ID: #${orderTitle} | Table: ${tableLabel || 'N/A'}</p>
                <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>
                    ${order.items.map(i => `<tr><td>${i.menuItem.name}</td><td>${i.quantity}</td><td>${Number(i.menuItem.price).toFixed(2)}</td><td>${(Number(i.menuItem.price) * i.quantity).toFixed(2)}</td></tr>`).join('')}
                </tbody></table>
                <div class="total">Subtotal: Rs. ${baseAmount.toFixed(2)}<br>
                ${currentDiscountValue > 0 ? `Discount: -Rs. ${discountAmount.toFixed(2)}<br>` : ''}
                Final Total: Rs. ${finalAmount.toFixed(2)}</div>
                <p class="text-center" style="margin-top: 20px;">Thank you!</p>
                <script>window.print(); setTimeout(() => window.close(), 500);</script>
            </body></html>
        `);
        printWindow.document.close();
    };

    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Order #{order.orderNumber || order.id.slice(0, 8)}</h2>
                        <p className="text-xs text-gray-500">{order.table?.tableCode || order.tableNumber || 'N/A'}</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-4 overflow-y-auto space-y-4">
                    {/* Items Table */}
                    <div className="border rounded overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left">Item</th>
                                    <th className="px-3 py-2 text-center">Qty</th>
                                    <th className="px-3 py-2 text-right">Price</th>
                                    <th className="px-3 py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {order.items.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-2 font-medium">{item.menuItem.name}</td>
                                        <td className="px-3 py-2 text-center">{item.quantity}</td>
                                        <td className="px-3 py-2 text-right">{(Number(item.menuItem.price)).toFixed(2)}</td>
                                        <td className="px-3 py-2 text-right font-semibold">{(Number(item.menuItem.price) * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-700">Payment Option</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {(['CASH', 'ONLINE', 'MIXED', 'CREDIT'] as const).map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setPaymentMethod(m)}
                                        className={`py-2 px-3 rounded border text-xs font-bold transition-all flex items-center gap-2 justify-center
                                            ${paymentMethod === m ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white text-gray-600 border-gray-200'}`}
                                    >
                                        <Receipt className="w-3 h-3" /> {m}
                                    </button>
                                ))}
                            </div>

                            {paymentMethod === 'CREDIT' && (
                                <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
                                    <div className="flex gap-1">
                                        <input
                                            type="tel"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            placeholder="Phone No"
                                            className="flex-1 px-2 py-1.5 border rounded text-sm"
                                            maxLength={10}
                                        />
                                        <button onClick={handleSearchCustomer} disabled={isSearching} className="bg-gray-800 text-white px-2 rounded"><Search className="w-4 h-4" /></button>
                                    </div>
                                    {customerFound === true && <div className="text-xs font-bold text-green-600">✓ {foundCustomer.fullName || foundCustomer.name}</div>}
                                    {customerFound === false && !showCreateForm && <button onClick={() => setShowCreateForm(true)} className="text-[10px] text-blue-600 font-bold underline">Add New Customer</button>}
                                    {showCreateForm && (
                                        <div className="space-y-1">
                                            <input type="text" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} placeholder="Name" className="w-full px-2 py-1 border rounded text-sm" />
                                            <div className="flex gap-1"><button onClick={handleCreateAccount} className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] flex-1">Create</button><button onClick={() => setShowCreateForm(false)} className="px-2 py-1 rounded text-[10px] border border-gray-300">Cancel</button></div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {paymentMethod !== 'CREDIT' && (
                                <div className="space-y-2">
                                    <div className="flex gap-1 text-[10px] font-bold">
                                        <button onClick={() => setDiscountType('PERCENT')} className={`px-2 py-0.5 rounded ${discountType === 'PERCENT' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>%</button>
                                        <button onClick={() => setDiscountType('FIXED')} className={`px-2 py-0.5 rounded ${discountType === 'FIXED' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>Rs</button>
                                    </div>
                                    <input
                                        type="number"
                                        value={discountValue === 0 ? '' : discountValue}
                                        onChange={e => setDiscountValue(e.target.value === '' ? '' : Number(e.target.value))}
                                        placeholder="Discount"
                                        className="w-full px-2 py-1.5 border rounded text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col justify-between">
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between text-gray-500"><span>Subtotal:</span><span>Rs. {baseAmount.toFixed(2)}</span></div>
                                {currentDiscountValue > 0 && paymentMethod !== 'CREDIT' && (
                                    <div className="flex justify-between text-green-600"><span>Discount:</span><span>-Rs. {discountAmount.toFixed(2)}</span></div>
                                )}
                            </div>
                            <div className="pt-2 border-t mt-2 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-700">Total:</span>
                                <span className="text-xl font-black text-orange-600">Rs. {finalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-3 border-t bg-gray-50 flex gap-2">
                    <button
                        onClick={handleSavePayment}
                        disabled={isSaving || (paymentMethod === 'CREDIT' && !customerFound)}
                        className="flex-1 bg-green-600 text-white py-2 rounded font-bold text-xs uppercase hover:bg-green-700 disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Payment'}
                    </button>
                    <button onClick={handlePrint} className="bg-orange-600 text-white px-4 py-2 rounded font-bold text-xs uppercase hover:bg-orange-700 flex items-center gap-2">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewOrderDetailsModal;
