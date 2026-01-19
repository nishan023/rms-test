import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, DollarSign, FileText } from 'lucide-react';
import { useCreditStore } from '../../store/useCreditStore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { AddDebtModal } from '../../components/admin/payment/AddDebtModal';

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomerById, getCreditHistory, fetchCustomerDetails } = useCreditStore();
  
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);

  const customer = id ? getCustomerById(id) : null;
  const creditHistory = id ? getCreditHistory(id) : [];

  // Fetch detailed history on mount
  React.useEffect(() => {
    if (id) {
      fetchCustomerDetails(id);
    }
  }, [id, fetchCustomerDetails]);

  if (!customer) {
    return (
      <div className="p-8">
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Customer not found</p>
            <Button onClick={() => navigate('/admin/credit')}>
              Back to Credit Ledger
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/credit')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Credit Ledger
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600 mt-1">{customer.phone}</p>
          </div>
          <Button
            onClick={() => setShowAddDebtModal(true)}
            icon={<Plus className="w-5 h-5" />}
          >
            Add Debt
          </Button>
        </div>
      </div>

      {/* Credit Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-red-500">
          <p className="text-sm text-gray-600 mb-1">Total Outstanding</p>
          <p className="text-3xl font-bold text-red-600">
            Rs. {(customer.totalCredit || 0).toLocaleString()}
          </p>
        </Card>
{/* Credit Limit and Available Credit cards removed */}
      </div>

      {/* Transaction History */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h2>
        
        {creditHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {creditHistory.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'debt' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {transaction.type === 'debt' ? 'Debt Added' : 'Payment Received'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </p>
                      {transaction.notes && (
                        <p className="text-sm text-gray-500 mt-1">{transaction.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      transaction.type === 'debt' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.type === 'debt' ? '+' : '-'} Rs. {transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Balance: Rs. {transaction.balance.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Order Details */}
                {transaction.order && transaction.order.items.length > 0 && (
                  <div className="mt-4 pl-16 border-t pt-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Details</p>
                    <div className="bg-white rounded border border-gray-200 p-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500 border-b">
                            <th className="pb-2 font-medium">Item</th>
                            <th className="pb-2 font-medium text-right">Qty</th>
                            <th className="pb-2 font-medium text-right">Price</th>
                            <th className="pb-2 font-medium text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transaction.order.items.map((item) => (
                            <tr key={item.id} className="border-b last:border-0 border-gray-100">
                              <td className="py-2 text-gray-800">{item.menuItem.name}</td>
                              <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                              <td className="py-2 text-right text-gray-600">Rs. {item.menuItem.price}</td>
                              <td className="py-2 text-right font-medium text-gray-800">
                                Rs. {item.quantity * item.menuItem.price}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
      
      {/* Add Debt Modal */}
      <AddDebtModal
        customer={customer}
        isOpen={showAddDebtModal}
        onClose={() => setShowAddDebtModal(false)}
      />
    </div>
  );
};

export default CustomerDetails