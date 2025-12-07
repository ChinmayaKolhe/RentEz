import { X, Download, CheckCircle, Calendar, CreditCard, FileText, Building2, User } from 'lucide-react';
import { format } from 'date-fns';

const PaymentReceiptModal = ({ payment, onClose }) => {
  const handleDownload = () => {
    // Create a simple text receipt
    const receiptText = `
RENT PAYMENT RECEIPT
=====================================================

Receipt ID: ${payment._id}
Payment Date: ${format(new Date(payment.paymentDate), 'MMMM dd, yyyy')}

PROPERTY DETAILS
-----------------------------------------------------
Property: ${payment.property?.title}
Address: ${payment.property?.address?.street}, ${payment.property?.address?.city}

TENANT DETAILS
-----------------------------------------------------
Name: ${payment.tenant?.name}
Email: ${payment.tenant?.email}

PAYMENT DETAILS
-----------------------------------------------------
Amount Paid: ₹${payment.amount?.toLocaleString()}
Due Date: ${format(new Date(payment.dueDate), 'MMMM dd, yyyy')}
Payment Method: ${payment.paymentMethod?.replace('_', ' ').toUpperCase()}
Transaction ID: ${payment.transactionId || 'N/A'}
Status: ${payment.status?.toUpperCase()}

${payment.notes ? `Notes: ${payment.notes}` : ''}

=====================================================
This is a computer-generated receipt.
Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${payment._id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col relative animate-slide-up shadow-2xl">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 print:hidden">
          <h2 className="text-lg font-bold text-gray-900">Payment Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">

        {/* Receipt Header */}
        <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RentEz</h1>
          <h2 className="text-xl font-semibold text-gray-700">Payment Receipt</h2>
          <div className="mt-4 flex items-center justify-center text-green-600">
            <CheckCircle className="h-6 w-6 mr-2" />
            <span className="font-semibold">Payment Successful</span>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="space-y-6">
          {/* Receipt Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Receipt ID:</span>
                <p className="font-mono font-semibold">{payment._id}</p>
              </div>
              <div>
                <span className="text-gray-600">Payment Date:</span>
                <p className="font-semibold">{format(new Date(payment.paymentDate), 'MMMM dd, yyyy')}</p>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Property Details
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div>
                <span className="text-gray-600 text-sm">Property Name:</span>
                <p className="font-semibold">{payment.property?.title}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Address:</span>
                <p className="text-gray-700">
                  {payment.property?.address?.street}, {payment.property?.address?.city}, {payment.property?.address?.state} - {payment.property?.address?.zipCode}
                </p>
              </div>
            </div>
          </div>

          {/* Tenant Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Tenant Details
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div>
                <span className="text-gray-600 text-sm">Name:</span>
                <p className="font-semibold">{payment.tenant?.name}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Email:</span>
                <p className="text-gray-700">{payment.tenant?.email}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Details
            </h3>
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-600 text-sm">Amount Paid:</span>
                  <p className="text-3xl font-bold text-primary-600">₹{payment.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Due Date:</span>
                  <p className="font-semibold flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(payment.dueDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-200">
                <div>
                  <span className="text-gray-600 text-sm">Payment Method:</span>
                  <p className="font-semibold capitalize">{payment.paymentMethod?.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Transaction ID:</span>
                  <p className="font-mono font-semibold">{payment.transactionId || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {payment.notes && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Notes
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{payment.notes}</p>
              </div>
            </div>
          )}
        </div>

        </div>

        {/* Fixed Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 print:hidden">
          <p className="text-center text-xs text-gray-500 mb-3">
            Generated on {format(new Date(), 'MMM dd, yyyy HH:mm')}
          </p>
          <div className="flex gap-3">
            <button onClick={handleDownload} className="flex-1 btn-outline flex items-center justify-center text-sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            <button onClick={handlePrint} className="flex-1 btn-primary flex items-center justify-center text-sm">
              <FileText className="h-4 w-4 mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceiptModal;
