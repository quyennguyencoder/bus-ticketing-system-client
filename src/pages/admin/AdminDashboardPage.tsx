import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '../../components/ui/Button'
import { statisticService } from '../../services/statistic.service'
import {
  StatisticRevenueResponse,
  StatisticOrderStatusResponse,
  StatisticPaymentMethodResponse,
  StatisticTopRouteResponse,
  StatisticTripOccupancyResponse,
  StatisticUserGrowthResponse,
} from '../../types/response/statistic'

type Period = 'day' | 'week' | 'month' | 'year'

const periodOptions: Array<{ value: Period; label: string }> = [
  { value: 'day', label: 'Ngày' },
  { value: 'week', label: 'Tuần' },
  { value: 'month', label: 'Tháng' },
  { value: 'year', label: 'Năm' },
]

const formatCompact = (value: number) => new Intl.NumberFormat('vi-VN').format(value)
const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

const COLORS = ['#0f766e', '#b45309', '#64748b', '#0369a1', '#7e22ce', '#be123c', '#15803d']

export const AdminDashboardPage = () => {
  const [period, setPeriod] = useState<Period>('week')

  const [revenueData, setRevenueData] = useState<StatisticRevenueResponse[]>([])
  const [orderStatusData, setOrderStatusData] = useState<StatisticOrderStatusResponse[]>([])
  const [paymentMethodData, setPaymentMethodData] = useState<StatisticPaymentMethodResponse[]>([])
  const [topRoutesData, setTopRoutesData] = useState<StatisticTopRouteResponse[]>([])
  const [tripOccupancyData, setTripOccupancyData] = useState<StatisticTripOccupancyResponse[]>([])
  const [userGrowthData, setUserGrowthData] = useState<StatisticUserGrowthResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const endDate = new Date().toISOString()
        const startDate = new Date()
        if (period === 'day') startDate.setDate(startDate.getDate() - 1)
        else if (period === 'week') startDate.setDate(startDate.getDate() - 7)
        else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1)
        else if (period === 'year') startDate.setFullYear(startDate.getFullYear() - 1)

        const [revRes, orderRes, payRes, routesRes, occRes, userRes] = await Promise.all([
          statisticService.getRevenue(startDate.toISOString(), endDate),
          statisticService.getOrderStatusDistribution(startDate.toISOString(), endDate),
          statisticService.getRevenueByPaymentMethod(startDate.toISOString(), endDate),
          statisticService.getTopRoutes(startDate.toISOString(), endDate, 5),
          statisticService.getTripOccupancy(startDate.toISOString(), endDate),
          statisticService.getUserGrowth(startDate.toISOString(), endDate),
        ])

        setRevenueData(revRes.data || [])
        setOrderStatusData(orderRes.data || [])
        setPaymentMethodData(payRes.data || [])
        setTopRoutesData(routesRes.data || [])
        setTripOccupancyData(occRes.data || [])
        setUserGrowthData(userRes.data || [])
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu thống kê:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [period])

  const metrics = useMemo(() => {
    const totalRevenue = paymentMethodData.reduce((sum, item) => sum + item.totalAmount, 0)
    const totalOrders = orderStatusData.reduce((sum, item) => sum + item.count, 0)
    const totalNewUsers = userGrowthData.reduce((sum, item) => sum + item.newUsers, 0)

    return [
      { label: 'Tổng đơn hàng', value: formatCompact(totalOrders) },
      { label: 'Tổng doanh thu', value: formatCurrency(totalRevenue) },
      { label: 'Người dùng mới', value: formatCompact(totalNewUsers) },
    ]
  }, [paymentMethodData, orderStatusData, userGrowthData])

  if (loading) {
    return (
      <section className="page-stack admin-dashboard">
        <div className="page-heading compact admin-dashboard__heading">
          <div>
            <span className="eyebrow">Quản trị</span>
            <h1>Tổng quan vận hành</h1>
          </div>
        </div>
        <p>Đang tải dữ liệu...</p>
      </section>
    )
  }

  return (
    <section className="page-stack admin-dashboard">
      <div className="page-heading compact admin-dashboard__heading">
        <div>
          <span className="eyebrow">Quản trị</span>
          <h1>Tổng quan vận hành</h1>
          <p>Bảng điều khiển dữ liệu thống kê theo thời gian thực.</p>
        </div>

        <div className="period-switch" role="tablist" aria-label="Thống kê theo kỳ">
          {periodOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={period === option.value ? 'primary' : 'secondary'}
              className="period-switch__button"
              onClick={() => setPeriod(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="metric-grid metric-grid--wide">
        {metrics.map((metric) => (
          <article key={metric.label} className="metric-card">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Doanh Thu */}
        <article className="panel dashboard-card dashboard-card-wide">
          <div className="panel-heading">
            <h2>Doanh thu</h2>
            <span>Theo thời gian</span>
          </div>
          <div className="chart-frame chart-frame--wide">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: 24, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(15,118,110,0.42)" />
                    <stop offset="100%" stopColor="rgba(15,118,110,0.04)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => formatCompact(val)} />
                <Tooltip formatter={(value: any) => formatCurrency(value)} labelFormatter={(label) => `Ngày: ${label}`} />
                <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="var(--accent)" strokeWidth={3} fill="url(#revenueGradient)" />
                <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={0} dot={{ r: 4, fill: 'var(--surface)', stroke: 'var(--accent)', strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Trạng thái đơn hàng */}
        <article className="panel dashboard-card">
          <div className="panel-heading">
            <h2>Trạng thái đơn hàng</h2>
            <span>Phân bổ số lượng</span>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatusData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.2)" vertical={false} />
                <XAxis dataKey="status" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={36} />
                <Tooltip />
                <Bar dataKey="count" name="Số lượng" radius={[10, 10, 0, 0]} fill="var(--accent)">
                  {orderStatusData.map((entry, index) => (
                    <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Phương thức thanh toán */}
        <article className="panel dashboard-card">
          <div className="panel-heading">
            <h2>Phương thức thanh toán</h2>
            <span>Theo tổng doanh thu</span>
          </div>
          <div className="chart-frame chart-frame--donut">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  dataKey="totalAmount"
                  nameKey="paymentMethod"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={4}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={entry.paymentMethod} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Tăng trưởng người dùng */}
        <article className="panel dashboard-card">
          <div className="panel-heading">
            <h2>Người dùng mới</h2>
            <span>Theo thời gian</span>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={36} />
                <Tooltip />
                <Legend verticalAlign="top" height={24} />
                <Line type="monotone" dataKey="newUsers" name="Người dùng mới" stroke="#b45309" strokeWidth={3} dot={{ r: 4, fill: 'var(--surface)', stroke: '#b45309', strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Tuyến đường phổ biến */}
        <article className="panel dashboard-card dashboard-card-wide">
          <div className="panel-heading">
            <h2>Tuyến đường phổ biến</h2>
            <span>Top tuyến đường có lượt đặt cao nhất</span>
          </div>
          <div className="chart-frame chart-frame--wide">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRoutesData} layout="vertical" margin={{ top: 8, right: 24, left: 48, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.2)" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis dataKey="routeName" type="category" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={120} />
                <Tooltip formatter={(value: any, name: string) => [name === 'Doanh thu' ? formatCurrency(value) : value, name]} />
                <Legend />
                <Bar dataKey="bookingCount" name="Lượt đặt" fill="#0f766e" radius={[0, 4, 4, 0]} />
                <Bar dataKey="revenue" name="Doanh thu" fill="#b45309" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Tỷ lệ lấp đầy */}
        <article className="panel dashboard-card dashboard-card-wide">
          <div className="panel-heading">
            <h2>Tỷ lệ lấp đầy tuyến đường</h2>
            <span>(%) Chỗ đã đặt trên tổng chỗ</span>
          </div>
          <div className="chart-frame chart-frame--wide">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tripOccupancyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.2)" vertical={false} />
                <XAxis dataKey="routeName" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={36} />
                <Tooltip formatter={(value: any) => [`${value}%`, 'Tỷ lệ lấp đầy']} />
                <Bar dataKey="occupancyRate" name="Tỷ lệ lấp đầy (%)" radius={[10, 10, 0, 0]} fill="#0369a1">
                  {tripOccupancyData.map((entry, index) => (
                    <Cell key={entry.routeName} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  )
}
