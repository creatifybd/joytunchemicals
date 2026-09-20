import { Trash2, ShoppingCart, Clock } from 'lucide-react'
import { useData } from '../../hooks/useData'
import { deleteOrder } from '../../lib/firestore'
import { useToast } from '../../components/shared/Toast'

export default function AdminOrders() {
  const { orders } = useData()
  const notify = useToast()

  const handleDelete = async (id) => {
    if (!confirm('Delete this order?')) return
    try { await deleteOrder(id); notify('Order deleted!') }
    catch { notify('Failed.', 'error') }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-outfit text-3xl font-black text-dark">Orders</h1>
        <p className="text-gray-400 text-sm mt-1">{orders.length} total orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center text-gray-400 shadow-sm">
          <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No orders yet</p>
          <p className="text-sm mt-1">Orders placed from the website will appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Product', 'Customer', 'Details', 'Date', ''].map(h => (
                    <th key={h} className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-[2px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{o.product}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-dark">{o.name}</p>
                      <p className="text-xs text-gray-400">{o.phone}</p>
                      {o.email && <p className="text-xs text-gray-400">{o.email}</p>}
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs text-gray-600">Qty: <span className="font-bold">{o.qty}</span></p>
                      {o.variant && <p className="text-xs text-gray-400">Size: {o.variant}</p>}
                      {o.address && <p className="text-xs text-gray-400 max-w-[160px] truncate">{o.address}</p>}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock size={11} />
                        {o.createdAt?.toDate?.()?.toLocaleDateString?.() || 'Now'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <button onClick={() => handleDelete(o.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
