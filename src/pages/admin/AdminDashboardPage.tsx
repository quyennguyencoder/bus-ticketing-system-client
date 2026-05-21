import { useMemo, useState } from 'react'
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

type Period = 'day' | 'week' | 'month' | 'year'

type PeriodData = {
  label: string
  revenue: number
  orders: number
  users: number
  newUsers: number
}

const periodOptions: Array<{ value: Period; label: string }> = [
  { value: 'day', label: 'Ngày' },
  { value: 'week', label: 'Tuần' },
  { value: 'month', label: 'Tháng' },
  { value: 'year', label: 'Năm' },
]

const dashboardData: Record<Period, { points: PeriodData[]; paymentBreakdown: Array<{ label: string; value: number; color: string }> }> = {
  day: {
    points: [
      { label: '06h', revenue: 18, orders: 22, users: 146, newUsers: 8 },
      { label: '09h', revenue: 28, orders: 34, users: 168, newUsers: 12 },
      { label: '12h', revenue: 33, orders: 41, users: 174, newUsers: 10 },
      { label: '15h', revenue: 29, orders: 38, users: 181, newUsers: 7 },
      { label: '18h', revenue: 42, orders: 53, users: 196, newUsers: 15 },
      { label: '21h', revenue: 37, orders: 46, users: 204, newUsers: 9 },
    ],
    paymentBreakdown: [
      { label: 'VNPAY', value: 64, color: '#0f766e' },
      { label: 'Tiền mặt', value: 26, color: '#b45309' },
      { label: 'Khác', value: 10, color: '#64748b' },
    ],
  },
  week: {
    points: [
      { label: 'T2', revenue: 24, orders: 120, users: 520, newUsers: 38 },
      { label: 'T3', revenue: 31, orders: 136, users: 548, newUsers: 44 },
      { label: 'T4', revenue: 28, orders: 129, users: 561, newUsers: 40 },
      { label: 'T5', revenue: 40, orders: 158, users: 583, newUsers: 52 },
      { label: 'T6', revenue: 46, orders: 174, users: 606, newUsers: 57 },
      { label: 'T7', revenue: 52, orders: 186, users: 628, newUsers: 61 },
      { label: 'CN', revenue: 44, orders: 170, users: 641, newUsers: 49 },
    ],
    paymentBreakdown: [
      { label: 'VNPAY', value: 67, color: '#0f766e' },
      { label: 'Tiền mặt', value: 23, color: '#b45309' },
      { label: 'Khác', value: 10, color: '#64748b' },
    ],
  },
  month: {
    points: [
      { label: 'T1', revenue: 88, orders: 480, users: 1820, newUsers: 210 },
      { label: 'T2', revenue: 94, orders: 512, users: 1904, newUsers: 198 },
      { label: 'T3', revenue: 106, orders: 568, users: 2018, newUsers: 244 },
      { label: 'T4', revenue: 112, orders: 598, users: 2136, newUsers: 260 },
      { label: 'T5', revenue: 125, orders: 642, users: 2234, newUsers: 286 },
      { label: 'T6', revenue: 133, orders: 688, users: 2348, newUsers: 301 },
    ],
    paymentBreakdown: [
      { label: 'VNPAY', value: 71, color: '#0f766e' },
      { label: 'Tiền mặt', value: 19, color: '#b45309' },
      { label: 'Khác', value: 10, color: '#64748b' },
    ],
  },
  year: {
    points: [
      { label: 'Q1', revenue: 290, orders: 1560, users: 6400, newUsers: 780 },
      { label: 'Q2', revenue: 330, orders: 1710, users: 6920, newUsers: 860 },
      { label: 'Q3', revenue: 360, orders: 1830, users: 7440, newUsers: 940 },
      { label: 'Q4', revenue: 412, orders: 1984, users: 8120, newUsers: 1020 },
    ],
    paymentBreakdown: [
      { label: 'VNPAY', value: 74, color: '#0f766e' },
      { label: 'Tiền mặt', value: 18, color: '#b45309' },
      { label: 'Khác', value: 8, color: '#64748b' },
    ],
  },
}

const formatCompact = (value: number) => new Intl.NumberFormat('vi-VN').format(value)

export const AdminDashboardPage = () => {
  const [period, setPeriod] = useState<Period>('week')
  const currentData = dashboardData[period]
  const points = currentData.points
  const paymentBreakdown = currentData.paymentBreakdown

  const metrics = useMemo(() => {
    const totalRevenue = points.reduce((sum, item) => sum + item.revenue, 0)
    const totalOrders = points.reduce((sum, item) => sum + item.orders, 0)
    const totalUsers = points[points.length - 1]?.users ?? 0
    const totalNewUsers = points.reduce((sum, item) => sum + item.newUsers, 0)
    const paymentTotal = paymentBreakdown.reduce((sum, item) => sum + item.value, 0)
    const vnpayRate = paymentBreakdown.find((item) => item.label === 'VNPAY')?.value ?? 0

    return [
      { label: 'Tổng đơn', value: formatCompact(totalOrders), delta: '+12.4%' },
      { label: 'Doanh thu', value: formatCompact(totalRevenue), delta: '+8.9%' },
      { label: 'Người dùng', value: formatCompact(totalUsers), delta: '+7.2%' },
      { label: 'Người dùng mới', value: formatCompact(totalNewUsers), delta: '+18.1%' },
      { label: 'Tỉ lệ thanh toán', value: `${Math.round((vnpayRate / paymentTotal) * 100)}%`, delta: '+1.8%' },
      { label: 'Chuyến hoạt động', value: '186', delta: '+6' },
    ]
  }, [paymentBreakdown, points])

  const usersChartData = points.map((item) => ({ label: item.label, users: item.users, newUsers: item.newUsers }))

  return (
    <section className="page-stack admin-dashboard">
      <div className="page-heading compact admin-dashboard__heading">
        <div>
          <span className="eyebrow">Quan tri</span>
          <h1>Tổng quan vận hành</h1>
          <p>Bảng điều khiển mô phỏng dữ liệu thống kê theo ngày, tuần, tháng và năm bằng Recharts.</p>
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
            <em>{metric.delta}</em>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="panel dashboard-card dashboard-card-wide">
          <div className="panel-heading">
            <h2>Doanh thu theo {period === 'day' ? 'ngày' : period === 'week' ? 'tuần' : period === 'month' ? 'tháng' : 'năm'}</h2>
            <span>Recharts mock</span>
          </div>
          <div className="chart-frame chart-frame--wide">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(15,118,110,0.42)" />
                    <stop offset="100%" stopColor="rgba(15,118,110,0.04)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={36} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={3} fill="url(#revenueGradient)" />
                <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={0} dot={{ r: 4, fill: 'var(--surface)', stroke: 'var(--accent)', strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel dashboard-card">
          <div className="panel-heading">
            <h2>Đơn hàng theo {period === 'day' ? 'khung giờ' : period === 'week' ? 'ngày' : period === 'month' ? 'tháng' : 'quý'}</h2>
            <span>Recharts mock</span>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.2)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={36} />
                <Tooltip />
                <Bar dataKey="orders" radius={[10, 10, 0, 0]} fill="var(--accent)">
                  {points.map((entry, index) => (
                    <Cell key={entry.label} fill={index % 2 === 0 ? 'var(--accent)' : '#0f9488'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel dashboard-card">
          <div className="panel-heading">
            <h2>Người dùng</h2>
            <span>Thống kê người dùng</span>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usersChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={36} />
                <Tooltip />
                <Legend verticalAlign="top" height={24} />
                <Line type="monotone" dataKey="users" name="Người dùng" stroke="#0f766e" strokeWidth={3} dot={{ r: 4, fill: 'var(--surface)', stroke: '#0f766e', strokeWidth: 3 }} />
                <Line type="monotone" dataKey="newUsers" name="Người dùng mới" stroke="#b45309" strokeWidth={3} dot={{ r: 4, fill: 'var(--surface)', stroke: '#b45309', strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel dashboard-card">
          <div className="panel-heading">
            <h2>Phương thức thanh toán</h2>
            <span>Recharts mock</span>
          </div>
          <div className="chart-frame chart-frame--donut">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentBreakdown}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={4}
                >
                  {paymentBreakdown.map((entry) => (
                    <Cell key={entry.label} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel dashboard-card dashboard-card-wide">
          <div className="panel-heading">
            <h2>Xu hướng vận hành</h2>
            <span>Dữ liệu mẫu theo {periodOptions.find((option) => option.value === period)?.label.toLowerCase()}</span>
          </div>
          <div className="dashboard-summary dashboard-summary--users">
            <div>
              <strong>Người dùng hoạt động</strong>
              <p>{formatCompact(points[points.length - 1]?.users ?? 0)} tài khoản đang tương tác.</p>
            </div>
            <div>
              <strong>Người dùng mới</strong>
              <p>{formatCompact(points.reduce((sum, item) => sum + item.newUsers, 0))} lượt đăng ký hoặc quay lại trong kỳ.</p>
            </div>
            <div>
              <strong>Tỉ lệ giữ chân</strong>
              <p>Đang duy trì ổn định ở mức cao theo dữ liệu mô phỏng.</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
