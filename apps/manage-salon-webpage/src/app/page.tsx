import { BarChart3, Calendar, Users, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-[var(--spacing-xl)]">
      {/* Page Header */}
      <div>
        <h1 className="text-[length:var(--font-size-3xl)] font-[number:var(--font-weight-bold)] text-[var(--color-text-primary)]">
          Dashboard
        </h1>
        <p className="mt-[var(--spacing-xs)] text-[length:var(--font-size-base)] text-[var(--color-text-secondary)]">
          Welcome back! Here's what's happening with your salon today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-[var(--spacing-lg)] sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Calendar}
          title="Today's Appointments"
          value="12"
          change="+3 from yesterday"
          trend="up"
        />
        <StatCard
          icon={Users}
          title="Total Clients"
          value="247"
          change="+18 this month"
          trend="up"
        />
        <StatCard
          icon={TrendingUp}
          title="Revenue (Today)"
          value="$1,240"
          change="+12% vs avg"
          trend="up"
        />
        <StatCard
          icon={BarChart3}
          title="Utilization"
          value="78%"
          change="-5% from last week"
          trend="down"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 gap-[var(--spacing-lg)] lg:grid-cols-2">
        <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-border)] bg-white dark:bg-[var(--color-sidebar-bg)] p-[var(--spacing-lg)]">
          <h2 className="text-[length:var(--font-size-xl)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-primary)] mb-[var(--spacing-lg)]">
            Upcoming Appointments
          </h2>
          <div className="space-y-[var(--spacing-md)]">
            <AppointmentItem
              time="09:00 AM"
              client="Sarah Johnson"
              service="Haircut & Style"
            />
            <AppointmentItem
              time="10:30 AM"
              client="Mike Chen"
              service="Color Treatment"
            />
            <AppointmentItem
              time="02:00 PM"
              client="Emma Wilson"
              service="Manicure"
            />
          </div>
        </div>

        <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-border)] bg-white dark:bg-[var(--color-sidebar-bg)] p-[var(--spacing-lg)]">
          <h2 className="text-[length:var(--font-size-xl)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-primary)] mb-[var(--spacing-lg)]">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-[var(--spacing-md)]">
            <QuickActionButton title="New Appointment" />
            <QuickActionButton title="Add Client" />
            <QuickActionButton title="View Schedule" />
            <QuickActionButton title="Reports" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

function StatCard({ icon: Icon, title, value, change, trend }: StatCardProps) {
  return (
    <div className="rounded-[var(--border-radius-lg)] border border-[var(--color-border)] bg-white dark:bg-[var(--color-sidebar-bg)] p-[var(--spacing-lg)]">
      <div className="flex items-center justify-between mb-[var(--spacing-md)]">
        <span className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-medium)] text-[var(--color-text-secondary)]">
          {title}
        </span>
        <Icon
          style={{
            width: "var(--icon-size-md)",
            height: "var(--icon-size-md)",
            color: "var(--color-text-muted)",
          }}
        />
      </div>
      <div className="text-[length:var(--font-size-2xl)] font-[number:var(--font-weight-bold)] text-[var(--color-text-primary)]">
        {value}
      </div>
      <div
        className={`mt-[var(--spacing-xs)] text-[length:var(--font-size-xs)] ${trend === "up" ? "text-green-600" : "text-orange-600"}`}
      >
        {change}
      </div>
    </div>
  );
}

interface AppointmentItemProps {
  time: string;
  client: string;
  service: string;
}

function AppointmentItem({ time, client, service }: AppointmentItemProps) {
  return (
    <div className="flex items-start gap-[var(--spacing-md)] p-[var(--spacing-sm)] rounded-[var(--border-radius-md)] hover:bg-[var(--color-sidebar-hover)] transition-colors duration-[var(--transition-fast)]">
      <div className="flex-shrink-0 w-16 text-[length:var(--font-size-sm)] font-[number:var(--font-weight-medium)] text-[var(--color-text-secondary)]">
        {time}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-medium)] text-[var(--color-text-primary)]">
          {client}
        </p>
        <p className="text-[length:var(--font-size-xs)] text-[var(--color-text-muted)]">
          {service}
        </p>
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  title: string;
}

function QuickActionButton({ title }: QuickActionButtonProps) {
  return (
    <button className="p-[var(--spacing-md)] rounded-[var(--border-radius-md)] border border-[var(--color-border)] hover:bg-[var(--color-sidebar-hover)] transition-colors duration-[var(--transition-fast)] text-[length:var(--font-size-sm)] font-[number:var(--font-weight-medium)] text-[var(--color-text-primary)]">
      {title}
    </button>
  );
}
